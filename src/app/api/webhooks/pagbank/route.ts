import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  mapPagbankStatus,
  parseReferenceId,
  verifyBasicAuth,
  verifyHmacSignature,
  verifyPagbankAuthenticity,
} from "@/lib/pagbank";
import { sendEmail } from "@/lib/email";
import { notifyAdmin } from "@/lib/email/admin-alert";
import type { PaymentFailedReason } from "@/types/email";

// Formato esperado do payload do PagBank.
// Link de pagamento avulso (pag.ae) envia um payload com charges[] e customer.email.
// TODO(homologacao): capturar o payload real na primeira cobranca e confirmar campos.
type PagbankWebhookPayload = {
  id?: string;
  reference_id?: string;
  status?: string;
  charges?: Array<{
    id?: string;
    status?: string;
    paid_at?: string;
    amount?: { value?: number; currency?: string };
  }>;
  customer?: { id?: string; email?: string; name?: string; tax_id?: string };
};

type AdminClient = ReturnType<typeof createAdminClient>;

const ACTIVE_STATUSES = new Set(["paid", "active", "trial"]);
const REVOKE_STATUSES = new Set([
  "canceled",
  "expired",
  "suspended",
  "overdue",
  "refunded",
  "declined",
]);
const PENDING_STATUSES = new Set(["pending", "pending_action", "in_analysis"]);

export async function POST(request: Request) {
  const rawBody = await request.text();
  const headersList = await headers();

  // 1) Validacao primaria do PagBank V4: SHA256(token + "-" + body) no header x-authenticity-token.
  // Doc: https://developer.pagbank.com.br/reference/confirmar-autenticidade-da-notificacao
  const authenticityToken = headersList.get("x-authenticity-token");
  const authenticityOk = authenticityToken
    ? verifyPagbankAuthenticity(rawBody, authenticityToken)
    : false;

  // 2) Fallback: Basic Auth (legado, caso webhook venha de cadastro antigo via aplicacao com user:pass).
  const auth = headersList.get("authorization");
  const basicOk = !authenticityOk ? verifyBasicAuth(auth) : false;

  // 3) Fallback adicional: HMAC com secret compartilhado (caso futuramente configurado).
  const signature =
    headersList.get("x-payload-signature") ??
    headersList.get("x-pagbank-signature") ??
    headersList.get("x-hub-signature-256");
  const hmacOk = !authenticityOk && !basicOk && signature
    ? verifyHmacSignature(rawBody, signature)
    : false;

  if (!authenticityOk && !basicOk && !hmacOk) {
    console.warn("PagBank webhook: autenticacao invalida");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const contentType = headersList.get("content-type") ?? null;

  let payload: PagbankWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch (parseErr) {
    // Body inesperado mas auth OK — algum formato que ainda nao mapeamos.
    // Logamos, alertamos e devolvemos 500 pra forcar o PagBank a re-tentar,
    // dando janela para deploy de fix antes da fila de retry expirar.
    const bodyPreview = rawBody.length > 1000 ? rawBody.slice(0, 1000) + "...(truncado)" : rawBody;
    const errMsg = parseErr instanceof Error ? parseErr.message : String(parseErr);
    console.error("[webhook] body invalido (auth OK)", {
      content_type: contentType,
      content_length: rawBody.length,
      parse_error: errMsg,
      body_preview: bodyPreview,
    });
    try {
      await supabase.from("audit_logs").insert({
        action: "pagbank.webhook.unparseable",
        entity_type: "pagbank_event",
        entity_id: null,
        metadata: {
          content_type: contentType,
          content_length: rawBody.length,
          parse_error: errMsg,
          body_preview: bodyPreview,
          auth_method: authenticityOk ? "x-authenticity-token" : basicOk ? "basic" : "hmac",
        },
      });
    } catch (logErr) {
      console.error("[webhook] falha ao gravar audit_log unparseable:", logErr);
    }
    await notifyAdmin(
      supabase,
      "Webhook PagBank com body invalido (auth OK)",
      [
        `O PagBank entregou uma notificacao com auth valida, mas o body nao parseou como JSON.`,
        ``,
        `content-type: ${contentType ?? "(none)"}`,
        `content-length: ${rawBody.length}`,
        `auth_method: ${authenticityOk ? "x-authenticity-token" : basicOk ? "basic" : "hmac"}`,
        `parse_error: ${errMsg}`,
        ``,
        `body_preview (primeiros 1000 chars):`,
        bodyPreview,
        ``,
        `Acoes:`,
        `1) Conferir audit_logs (action=pagbank.webhook.unparseable) para histórico completo.`,
        `2) Se for application/x-www-form-urlencoded, ajustar route.ts para suportar o formato.`,
        `3) Webhook respondeu 500 — PagBank vai re-tentar; se subir fix em breve, evento se recupera.`,
      ].join("\n")
    );
    return NextResponse.json({ error: "Unparseable body" }, { status: 500 });
  }

  const pagbankId = payload.id ?? null;
  const reference = payload.reference_id ?? "";
  const email = payload.customer?.email?.toLowerCase() ?? null;
  const charge = payload.charges?.[0];
  const chargeStatus = charge?.status ?? payload.status ?? "";
  const status = mapPagbankStatus(chargeStatus);

  try {
    // 1) Identificar usuario: por reference_id se o PagBank propagou; senao pelo email do comprador.
    const userId = await resolveUserId(supabase, reference, email);

    if (!userId) {
      await supabase.from("audit_logs").insert({
        action: "pagbank.webhook.unattributed",
        entity_type: "pagbank_event",
        entity_id: pagbankId,
        metadata: { reason: "no_user_match", reference, email, status },
      });
      return NextResponse.json({ received: true, unattributed: true });
    }

    // 2) Plano unico ativo (no MVP atual ha apenas 1).
    const { data: plan } = await supabase
      .from("plans")
      .select("id, name, payment_link, is_lifetime")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(1)
      .single();

    if (!plan) {
      console.warn("PagBank webhook: nenhum plano ativo no Supabase");
      return NextResponse.json({ received: true, ignored: true });
    }

    // 3) Carrega subscription anterior + perfil para detectar transicao e localizar e-mail.
    const [{ data: previousSubscription }, { data: profile }] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", userId)
        .eq("plan_id", plan.id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("email, full_name, locale")
        .eq("id", userId)
        .single(),
    ]);

    const previousStatus = previousSubscription?.status ?? null;

    // 4) Sincroniza subscription + enrollments numa transacao via RPC.
    // Garante atomicidade: se enrollments falhar, subscription tambem nao commit.
    const paidAt = charge?.paid_at ?? (status === "paid" ? new Date().toISOString() : null);
    const grantAccess = ACTIVE_STATUSES.has(status);
    const revokeAccess = REVOKE_STATUSES.has(status);

    if (grantAccess || revokeAccess) {
      const { error: rpcError } = await supabase.rpc("sync_subscription_enrollments", {
        p_user_id: userId,
        p_plan_id: plan.id,
        p_pagbank_subscription_id: pagbankId,
        p_pagbank_reference_id: reference || null,
        p_pagbank_last_charge_id: charge?.id ?? null,
        p_status: status,
        p_paid_at: paidAt,
        p_grant_access: grantAccess,
      });
      if (rpcError) {
        console.error("[webhook] sync_subscription_enrollments falhou:", rpcError);
        await notifyAdmin(
          supabase,
          "Webhook PagBank falhou no sync_subscription_enrollments",
          [
            `user_id: ${userId}`,
            `plan_id: ${plan.id}`,
            `pagbank_id: ${pagbankId ?? "(null)"}`,
            `reference: ${reference || "(none)"}`,
            `status: ${status}`,
            `previous_status: ${previousStatus ?? "(none)"}`,
            `email: ${email ?? "(none)"}`,
            ``,
            `Erro: ${rpcError.message ?? JSON.stringify(rpcError)}`,
            ``,
            `PagBank vai re-tentar automaticamente. Se persistir, verificar:`,
            `1) RLS/permissoes da RPC sync_subscription_enrollments`,
            `2) Constraints de subscriptions/enrollments`,
            `3) Logs em https://vercel.com/wendrews-projects-06ff1b06/zelobjj`,
          ].join("\n")
        );
        // 500 forca PagBank a reenviar o webhook ate dar sucesso.
        return NextResponse.json({ error: "sync_failed" }, { status: 500 });
      }
    } else {
      // Status pending/intermediario: so atualiza subscription, sem mexer enrollment.
      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          plan_id: plan.id,
          pagbank_subscription_id: pagbankId,
          pagbank_reference_id: reference || null,
          pagbank_last_charge_id: charge?.id ?? null,
          status,
          paid_at: paidAt,
        },
        { onConflict: "user_id,plan_id" as never }
      );
    }

    // Audit log: skip retransmissoes do mesmo status (PagBank reenvia em retry,
    // gerando lixo no log). Loga so transicoes reais.
    if (previousStatus !== status) {
      await supabase.from("audit_logs").insert({
        user_id: userId,
        action: `pagbank.${status}`,
        entity_type: "pagbank_event",
        entity_id: pagbankId,
        metadata: { status, reference, charge_id: charge?.id, email, previous_status: previousStatus },
      });
    }

    // 6) E-mails — fire and forget; nunca quebra o webhook.
    await dispatchTransactionalEmail({
      supabase,
      userId,
      profile,
      plan,
      previousStatus,
      currentStatus: status,
      amountCents: charge?.amount?.value ?? null,
      paidAt,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PagBank webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }
}

async function resolveUserId(
  supabase: AdminClient,
  reference: string,
  email: string | null
): Promise<string | null> {
  const parsed = parseReferenceId(reference);
  if (parsed) return parsed.userId;

  if (email) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (data?.id) return data.id;
  }

  return null;
}

interface DispatchEmailArgs {
  supabase: AdminClient;
  userId: string;
  profile: { email: string | null; full_name: string | null; locale: string | null } | null;
  plan: { id: string; name: string; payment_link: string | null };
  previousStatus: string | null;
  currentStatus: string;
  amountCents: number | null;
  paidAt: string | null;
}

/**
 * Decide qual e-mail transacional disparar para o aluno com base na transicao
 * de status da subscription. Idempotencia/dedup eh feita pelo dispatcher
 * (sendEmail) consultando email_logs antes de enviar.
 */
async function dispatchTransactionalEmail(args: DispatchEmailArgs): Promise<void> {
  const { supabase, userId, profile, plan, previousStatus, currentStatus, amountCents, paidAt } = args;

  if (!profile?.email) {
    console.warn(`[webhook] sem e-mail para user ${userId}, pulando envio`);
    return;
  }

  // Pagamento aprovado — so envia se eh transicao para active/paid (nao reenvia em retransmissoes do mesmo evento).
  if (ACTIVE_STATUSES.has(currentStatus) && previousStatus !== currentStatus) {
    await sendEmail({
      supabase,
      userId,
      toEmail: profile.email,
      locale: profile.locale,
      template: "payment_approved",
      params: {
        locale: "pt", // sera sobrescrito pelo dispatcher com profile.locale
        fullName: profile.full_name,
        planName: plan.name,
        amountCents,
        paidAt,
      },
    });

    // Notifica operadores (icone verde) — uma venda confirmada chegou.
    const valor =
      amountCents != null
        ? `R$ ${(amountCents / 100).toFixed(2).replace(".", ",")}`
        : "(nao informado)";
    await notifyAdmin(
      supabase,
      `Nova venda confirmada — ${profile.full_name ?? profile.email}`,
      [
        `Aluno: ${profile.full_name ?? "(sem nome)"}`,
        `E-mail: ${profile.email}`,
        `Plano: ${plan.name}`,
        `Valor: ${valor}`,
        `Pago em: ${paidAt ?? "(nao informado)"}`,
        `Status: ${currentStatus}`,
        ``,
        `user_id: ${userId}`,
      ].join("\n"),
      { kind: "sale" }
    );
    return;
  }

  // Pendente — manda lembrete; dispatcher ja deduplica em 24h.
  if (PENDING_STATUSES.has(currentStatus) && !ACTIVE_STATUSES.has(previousStatus ?? "")) {
    await sendEmail({
      supabase,
      userId,
      toEmail: profile.email,
      locale: profile.locale,
      template: "payment_pending",
      params: {
        locale: "pt",
        fullName: profile.full_name,
        planName: plan.name,
        paymentLinkUrl: plan.payment_link,
      },
    });
    return;
  }

  // Falha/cancelamento/estorno — uma variante por motivo, reenvio bloqueado por 1h por motivo.
  if (REVOKE_STATUSES.has(currentStatus)) {
    const variant = mapStatusToFailedReason(currentStatus);
    if (!variant) return;
    await sendEmail({
      supabase,
      userId,
      toEmail: profile.email,
      locale: profile.locale,
      template: "payment_failed",
      variant,
      params: {
        locale: "pt",
        fullName: profile.full_name,
        reason: variant,
        retryUrl: plan.payment_link,
      },
    });
    return;
  }
}

function mapStatusToFailedReason(status: string): PaymentFailedReason | null {
  if (status === "declined") return "declined";
  if (status === "refunded") return "refunded";
  if (status === "canceled" || status === "expired" || status === "suspended" || status === "overdue") {
    return "canceled";
  }
  return null;
}
