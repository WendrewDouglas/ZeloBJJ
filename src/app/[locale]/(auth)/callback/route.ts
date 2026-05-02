import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");

  if (code) {
    const supabase = await createClient();
    const { data: exchange } = await supabase.auth.exchangeCodeForSession(code);

    // Welcome email idempotente — apenas no primeiro callback do usuario.
    // Ignora erros para nao bloquear a chegada do aluno no dashboard.
    if (exchange?.user && type !== "recovery") {
      void fireWelcomeEmail(exchange.user.id);
    }
  }

  const localePrefix =
    locale === routing.defaultLocale ? "" : `/${locale}`;
  const target = type === "recovery" ? "/redefinir-senha" : "/dashboard";

  return NextResponse.redirect(`${origin}${localePrefix}${target}`);
}

async function fireWelcomeEmail(userId: string): Promise<void> {
  try {
    const admin = createAdminClient();

    const { data: profile } = await admin
      .from("profiles")
      .select("email, full_name, locale, welcome_email_sent_at")
      .eq("id", userId)
      .single();

    if (!profile || profile.welcome_email_sent_at || !profile.email) return;

    // Verifica se ja tem subscription ativa (caso o usuario tenha vindo do fluxo "comprar antes de cadastrar").
    const { data: activeSub } = await admin
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .in("status", ["active", "paid", "trial"])
      .limit(1)
      .maybeSingle();

    const result = await sendEmail({
      supabase: admin,
      userId,
      toEmail: profile.email,
      locale: profile.locale,
      template: "welcome",
      params: {
        locale: "pt",
        fullName: profile.full_name,
        hasActiveSubscription: Boolean(activeSub),
      },
    });

    if (result.sent) {
      await admin
        .from("profiles")
        .update({ welcome_email_sent_at: new Date().toISOString() })
        .eq("id", userId);
    }
  } catch (err) {
    console.error("[callback] erro ao enviar welcome email:", err);
  }
}
