import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

interface RegularizeRequest {
  emails: string[];
  /** Valor em centavos a mostrar no recibo do email payment_approved. Default 2990 (R$ 29,90 valor antigo). */
  amountCents?: number;
  /** Se true, usa profile.created_at como paid_at; senao, agora. Default true. */
  useCreatedAt?: boolean;
}

interface RegularizeResult {
  email: string;
  status: "success" | "not_found" | "error";
  details: Record<string, unknown>;
}

/**
 * Regulariza compras feitas antes do webhook PagBank estar configurado:
 * - cria/atualiza subscription como 'paid'
 * - cria enrollments para todos os cursos publicados
 * - dispara welcome + payment_approved emails (idempotente via email_logs)
 *
 * Auth: header X-Admin-Token deve bater com env ADMIN_REGULARIZE_TOKEN.
 *
 * Esta rota nao depende de session de usuario (eh chamada via curl/script
 * em batch). Por isso, auth eh por token compartilhado.
 */
export async function POST(request: Request) {
  const headersList = await headers();
  const token = headersList.get("x-admin-token");
  const expected = process.env.ADMIN_REGULARIZE_TOKEN;

  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_REGULARIZE_TOKEN nao configurado no servidor" },
      { status: 503 }
    );
  }

  if (!token || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: RegularizeRequest;
  try {
    body = (await request.json()) as RegularizeRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { emails, amountCents = 2990, useCreatedAt = true } = body;

  if (!Array.isArray(emails) || emails.length === 0) {
    return NextResponse.json({ error: "emails array required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: plan } = await supabase
    .from("plans")
    .select("id, name, payment_link")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!plan) {
    return NextResponse.json({ error: "Nenhum plano ativo configurado" }, { status: 500 });
  }

  const { data: courses } = await supabase
    .from("courses")
    .select("id")
    .eq("is_published", true);

  const results: RegularizeResult[] = [];

  for (const rawEmail of emails) {
    const email = rawEmail.trim().toLowerCase();
    const details: Record<string, unknown> = {};

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, email, full_name, locale, created_at, welcome_email_sent_at")
        .eq("email", email)
        .maybeSingle();

      if (!profile) {
        results.push({ email, status: "not_found", details: {} });
        continue;
      }

      const userId = profile.id;
      const paidAt = useCreatedAt ? profile.created_at : new Date().toISOString();
      details.userId = userId;
      details.locale = profile.locale;
      details.paidAt = paidAt;

      const referenceId = `MANUAL_REGULARIZE_${Date.now()}_${userId.slice(0, 8)}`;

      const { error: subError } = await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          plan_id: plan.id,
          status: "paid",
          paid_at: paidAt,
          pagbank_reference_id: referenceId,
        },
        { onConflict: "user_id,plan_id" }
      );

      if (subError) throw new Error(`subscription upsert failed: ${subError.message}`);
      details.subscription = "upserted";

      if (courses && courses.length > 0) {
        const { error: enrError } = await supabase.from("enrollments").upsert(
          courses.map((c) => ({
            user_id: userId,
            course_id: c.id,
            plan_id: plan.id,
            is_active: true,
            expires_at: null,
          })),
          { onConflict: "user_id,course_id" }
        );
        if (enrError) throw new Error(`enrollments upsert failed: ${enrError.message}`);
        details.enrollments = courses.length;
      }

      await supabase.from("audit_logs").insert({
        user_id: userId,
        action: "manual.regularize",
        entity_type: "subscription",
        entity_id: userId,
        metadata: {
          email,
          amountCents,
          paidAt,
          plan_id: plan.id,
          reference_id: referenceId,
        },
      });

      if (profile.email && !profile.welcome_email_sent_at) {
        const welcomeResult = await sendEmail({
          supabase,
          userId,
          toEmail: profile.email,
          locale: profile.locale,
          template: "welcome",
          params: {
            locale: "pt",
            fullName: profile.full_name,
            hasActiveSubscription: true,
          },
        });

        if (welcomeResult.sent) {
          await supabase
            .from("profiles")
            .update({ welcome_email_sent_at: new Date().toISOString() })
            .eq("id", userId);
        }
        details.welcomeEmail = welcomeResult.sent
          ? "sent"
          : welcomeResult.reason ?? "skipped";
      } else {
        details.welcomeEmail = profile.welcome_email_sent_at
          ? "already_sent"
          : "no_email";
      }

      if (profile.email) {
        const paidEmailResult = await sendEmail({
          supabase,
          userId,
          toEmail: profile.email,
          locale: profile.locale,
          template: "payment_approved",
          params: {
            locale: "pt",
            fullName: profile.full_name,
            planName: plan.name,
            amountCents,
            paidAt,
          },
        });
        details.paymentApprovedEmail = paidEmailResult.sent
          ? "sent"
          : paidEmailResult.reason ?? "skipped";
      } else {
        details.paymentApprovedEmail = "no_email";
      }

      results.push({ email, status: "success", details });
    } catch (err) {
      results.push({
        email,
        status: "error",
        details: { error: err instanceof Error ? err.message : String(err) },
      });
    }
  }

  return NextResponse.json({ results });
}
