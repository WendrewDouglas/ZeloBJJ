"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Menu, X, LogIn, LayoutDashboard } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useUser } from "@/hooks/use-user";
import { LanguageSwitcher } from "./language-switcher";

const navItems = [
  { href: "#sobre", key: "about" as const },
  { href: "#modulos", key: "modules" as const },
  { href: "#oferta", key: "offer" as const },
  { href: "#faq", key: "faq" as const },
];

export function SiteHeader() {
  const t = useTranslations("header");
  const { user, loading } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-dark/80 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Zelo BJJ"
            width={40}
            height={40}
            className="transition-transform group-hover:scale-105"
          />
          <span className="text-lg font-bold tracking-wide text-white">
            ZELO <span className="text-gold">BJJ</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-gray-text transition-colors hover:text-white"
            >
              {t(`nav.${item.key}`)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-full bg-white/5" />
          ) : user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-dark transition-colors hover:bg-gold-light"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">{t("studentArea")}</span>
              <span className="sm:hidden">{t("dashboard")}</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-gold hover:text-gold"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">{t("login")}</span>
              </Link>
              <a
                href="#oferta"
                className="hidden items-center rounded-full bg-gold px-4 py-2 text-sm font-semibold text-dark transition-colors hover:bg-gold-light md:inline-flex"
              >
                {t("cta")}
              </a>
            </>
          )}

          <button
            type="button"
            aria-label={t("openMenu")}
            onClick={() => setOpen((v) => !v)}
            className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white transition-colors hover:border-gold hover:text-gold lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/5 bg-dark/95 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-gray-text transition-colors hover:bg-white/5 hover:text-white"
              >
                {t(`nav.${item.key}`)}
              </a>
            ))}
            {!user && (
              <a
                href="#oferta"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-gold px-4 py-2 text-center text-sm font-semibold text-dark"
              >
                {t("cta")}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
