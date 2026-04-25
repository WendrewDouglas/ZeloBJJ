"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";

export default function RecuperarSenhaPage() {
  const t = useTranslations("auth.recover");
  const tLogin = useTranslations("auth.login");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold text-white">{t("sentTitle")}</h2>
        <p className="mb-6 text-gray-text">
          {t.rich("sentMessage", {
            email,
            strong: (chunks) => <strong className="text-white">{chunks}</strong>,
          })}
        </p>
        <Link href="/login">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToLogin")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-white">{t("title")}</h2>
      <p className="mb-8 text-sm text-gray-text">{t("subtitle")}</p>

      <form onSubmit={handleReset} className="space-y-4">
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

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <Button type="submit" className="w-full bg-gold text-dark hover:bg-gold-light" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {t("submit")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-text">
        <Link href="/login" className="text-gold hover:underline">
          <ArrowLeft className="mr-1 inline h-3 w-3" />
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}
