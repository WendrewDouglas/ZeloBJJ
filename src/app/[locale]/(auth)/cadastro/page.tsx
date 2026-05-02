"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function CadastroPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>}>
      <CadastroForm />
    </Suspense>
  );
}

function CadastroForm() {
  const t = useTranslations("auth.signup");
  const tLogin = useTranslations("auth.login");
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("errorMismatch"));
      return;
    }

    if (password.length < 6) {
      setError(t("errorTooShort"));
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const localePrefix = locale === "pt" ? "" : `/${locale}`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          locale,
        },
        emailRedirectTo: `${window.location.origin}${localePrefix}/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    void router;
  }

  const loginHref = next === "checkout" ? "/login?next=checkout" : "/login";

  if (success) {
    return (
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold text-white">{t("successTitle")}</h2>
        <p className="mb-6 text-gray-text">
          {t.rich("successMessage", {
            email,
            strong: (chunks) => <strong className="text-white">{chunks}</strong>,
          })}
        </p>
        {next === "checkout" && (
          <p className="mb-6 rounded-2xl border border-gold/20 bg-gold/5 p-4 text-sm text-gray-text">
            {t("checkoutNote")}
          </p>
        )}
        <Link href={loginHref}>
          <Button variant="outline">{t("backToLogin")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-white">{t("title")}</h2>
      <p className="mb-8 text-sm text-gray-text">{t("subtitle")}</p>

      {next === "checkout" && (
        <p className="mb-6 rounded-2xl border border-gold/20 bg-gold/5 p-4 text-sm text-gray-text">
          {t("checkoutHint")}
        </p>
      )}

      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">{t("fullName")}</Label>
          <Input
            id="fullName"
            type="text"
            placeholder={t("fullNamePlaceholder")}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{tLogin("email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={tLogin("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{tLogin("password")}</Label>
          <Input
            id="password"
            type="password"
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder={t("confirmPasswordPlaceholder")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <Button type="submit" className="w-full bg-gold text-dark hover:bg-gold-light" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {t("submit")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-text">
        {t("haveAccount")}{" "}
        <Link href={loginHref} className="text-gold hover:underline">
          {t("loginLink")}
        </Link>
      </p>
    </div>
  );
}
