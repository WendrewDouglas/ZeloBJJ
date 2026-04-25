import { createClient } from "@/lib/supabase/server";
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
    await supabase.auth.exchangeCodeForSession(code);
  }

  const localePrefix =
    locale === routing.defaultLocale ? "" : `/${locale}`;
  const target = type === "recovery" ? "/redefinir-senha" : "/dashboard";

  return NextResponse.redirect(`${origin}${localePrefix}${target}`);
}
