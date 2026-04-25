import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const LOCALE_PATTERN = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);

function stripLocale(pathname: string) {
  return pathname.replace(LOCALE_PATTERN, "") || "/";
}

function getLocalePrefix(pathname: string) {
  const match = pathname.match(LOCALE_PATTERN);
  return match ? match[0] : "";
}

export async function updateSession(
  request: NextRequest,
  baseResponse?: NextResponse
) {
  let supabaseResponse = baseResponse ?? NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          const next = NextResponse.next({ request });
          // Preserve any headers/cookies set by upstream middleware (e.g. next-intl)
          supabaseResponse.headers.forEach((value, key) => {
            if (!next.headers.has(key)) next.headers.set(key, value);
          });
          supabaseResponse.cookies.getAll().forEach((cookie) => {
            next.cookies.set(cookie);
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            next.cookies.set(name, value, options)
          );
          supabaseResponse = next;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const localePrefix = getLocalePrefix(pathname);
  const pathNoLocale = stripLocale(pathname);

  // Public routes (locale-agnostic) — auth/logout stays unprefixed in app/auth
  const publicPaths = [
    "/",
    "/login",
    "/cadastro",
    "/recuperar-senha",
    "/redefinir-senha",
    "/callback",
  ];
  const isPublicPath =
    publicPaths.includes(pathNoLocale) ||
    pathname === "/auth/logout" ||
    pathname.startsWith("/api/webhooks");

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = `${localePrefix}/login`;
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  if (user && (pathNoLocale === "/login" || pathNoLocale === "/cadastro")) {
    const url = request.nextUrl.clone();
    url.pathname = `${localePrefix}/dashboard`;
    return NextResponse.redirect(url);
  }

  // Admin route protection
  if (pathNoLocale.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = `${localePrefix}/login`;
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = `${localePrefix}/dashboard`;
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
