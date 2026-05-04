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

  const localePrefix = locale === routing.defaultLocale ? "" : `/${locale}`;

  if (!code) {
    // Acesso direto ao /callback sem code: manda pra login com erro.
    return NextResponse.redirect(`${origin}${localePrefix}/login?error=invalid_link`);
  }

  const supabase = await createClient();
  const { data: exchange, error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !exchange?.user) {
    // Code expirado/invalido: redireciona pra login com mensagem clara.
    console.warn("[callback] exchangeCodeForSession falhou:", exchangeError?.message);
    return NextResponse.redirect(`${origin}${localePrefix}/login?error=invalid_link`);
  }

  // Welcome email idempotente — apenas no primeiro callback do usuario.
  // Aguarda para garantir entrega (Fluid Compute reusa instances, mas await elimina ambiguidade).
  if (type !== "recovery") {
    await fireWelcomeEmail(exchange.user.id);
  }

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

    const hasActiveSubscription = Boolean(activeSub);

    const result = await sendEmail({
      supabase: admin,
      userId,
      toEmail: profile.email,
      locale: profile.locale,
      template: "welcome",
      // Gate de re-envio aqui é o profile.welcome_email_sent_at (acima).
      // Bypass do dedup interno por email_logs garante que callbacks subsequentes
      // após pagamento (transição offer→active) consigam re-disparar com a copy correta.
      dedupWindowSeconds: 0,
      params: {
        locale: "pt",
        fullName: profile.full_name,
        hasActiveSubscription,
      },
    });

    // So consolida o flag de "welcome enviado" se foi com a copy de aluno ativo.
    // Se o user ainda nao pagou (recebeu copy de oferta), deixa o flag null para que
    // /admin/regularize ou um futuro pagamento possa re-disparar o email com a copy ativa.
    if (result.sent && hasActiveSubscription) {
      await admin
        .from("profiles")
        .update({ welcome_email_sent_at: new Date().toISOString() })
        .eq("id", userId);
    }
  } catch (err) {
    console.error("[callback] erro ao enviar welcome email:", err);
  }
}
