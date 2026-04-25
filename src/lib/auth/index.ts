import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import type { Profile } from "@/types";

async function currentLocale(): Promise<Locale> {
  try {
    const l = await getLocale();
    return (routing.locales as readonly string[]).includes(l)
      ? (l as Locale)
      : routing.defaultLocale;
  } catch {
    return routing.defaultLocale;
  }
}

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

export async function requireAuth() {
  const user = await getSession();
  if (!user) {
    const locale = await currentLocale();
    redirect({ href: "/login", locale });
    throw new Error("unreachable"); // satisfies TS since redirect is not typed as never
  }
  return user;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await getProfile();
  const locale = await currentLocale();
  if (!profile) {
    redirect({ href: "/login", locale });
    throw new Error("unreachable");
  }
  if (profile.role !== "admin") {
    redirect({ href: "/dashboard", locale });
    throw new Error("unreachable");
  }
  return profile;
}
