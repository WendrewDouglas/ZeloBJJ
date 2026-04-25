"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  User,
  LogOut,
  Shield,
} from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

interface SidebarProps {
  profile: Profile;
}

export function Sidebar({ profile }: SidebarProps) {
  const t = useTranslations("member.sidebar");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();

  const memberLinks = [
    { href: "/dashboard" as const, label: t("dashboard"), icon: LayoutDashboard },
    { href: "/cursos" as const, label: t("courses"), icon: BookOpen },
    { href: "/comunidade" as const, label: t("community"), icon: MessageSquare },
    { href: "/perfil" as const, label: t("profile"), icon: User },
  ];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-white/5 bg-dark-light">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/5 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Zelo BJJ" width={36} height={36} />
          <span className="font-bold text-white">
            ZELO <span className="text-gold">BJJ</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {memberLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-gold/10 text-gold"
                  : "text-gray-text hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}

        {profile.role === "admin" && (
          <>
            <div className="my-4 border-t border-white/5" />
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-gold/10 text-gold"
                  : "text-gray-text hover:bg-white/5 hover:text-white"
              )}
            >
              <Shield className="h-4 w-4" />
              {t("adminPanel")}
            </Link>
          </>
        )}
      </nav>

      {/* User info + Logout */}
      <div className="border-t border-white/5 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/20 text-sm font-bold text-gold">
            {profile.full_name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {profile.full_name || t("user")}
            </p>
            <p className="truncate text-xs text-gray-text">{profile.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-text transition-colors hover:bg-white/5 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          {tCommon("logout")}
        </button>
      </div>
    </aside>
  );
}
