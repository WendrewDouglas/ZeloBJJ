import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  mapPagbankStatus,
  parseReferenceId,
  verifyBasicAuth,
  verifyHmacSignature,
} from "@/lib/pagbank";

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

export async function POST(request: Request) {
  const rawBody = await request.text();
  const headersList = await headers();

  // 1) Validacao primaria: Basic Auth (URL do webhook cadastrada como https://user:pass@host/path).
  const auth = headersList.get("authorization");
  const basicOk = verifyBasicAuth(auth);

  // 2) Fallback opcional: HMAC signature (caso futuramente configurado).
  const signature =
    headersList.get("x-payload-signature") ??
    headersList.get("x-pagbank-signature") ??
    headersList.get("x-hub-signature-256");
  const hmacOk = signature ? verifyHmacSignature(rawBody, signature) : false;

  if (!basicOk && !hmacOk) {
    console.warn("PagBank webhook: autenticacao invalida");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: PagbankWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createAdminClient();
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
      // Retornamos 200 para o PagBank nao reenviar indefinidamente; ficara no audit_logs para reprocessar manualmente.
      return NextResponse.json({ received: true, unattributed: true });
    }

    // 2) Plano unico ativo (no MVP atual ha apenas 1).
    const { data: plan } = await supabase
      .from("plans")
      .select("id, is_lifetime")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(1)
      .single();

    if (!plan) {
      console.warn("PagBank webhook: nenhum plano ativo no Supabase");
      return NextResponse.json({ received: true, ignored: true });
    }

    // 3) Upsert subscription (uma por user+plan). No modelo vitalicio nao expira.
    const paidAt = charge?.paid_at ?? (status === "paid" ? new Date().toISOString() : null);

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

    // 4) Liberar/revogar acesso
    if (ACTIVE_STATUSES.has(status)) {
      const { data: courses } = await supabase
        .from("courses")
        .select("id")
        .eq("is_published", true);

      if (courses?.length) {
        await supabase.from("enrollments").upsert(
          courses.map((c) => ({
            user_id: userId,
            course_id: c.id,
            plan_id: plan.id,
            is_active: true,
            expires_at: null,
          })),
          { onConflict: "user_id,course_id" }
        );
      }
    } else if (REVOKE_STATUSES.has(status)) {
      await supabase
        .from("enrollments")
        .update({ is_active: false })
        .eq("user_id", userId);
    }

    await supabase.from("audit_logs").insert({
      user_id: userId,
      action: `pagbank.${status}`,
      entity_type: "pagbank_event",
      entity_id: pagbankId,
      metadata: { status, reference, charge_id: charge?.id, email },
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
