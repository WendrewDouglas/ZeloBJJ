"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";
import type { Profile, SubscriptionWithPlan } from "@/types";

const localeMap: Record<string, string> = {
  pt: "pt-BR",
  en: "en-US",
  ko: "ko-KR",
};

export default function PerfilPage() {
  const t = useTranslations("member.profile");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (p) {
        setProfile(p);
        setFullName(p.full_name || "");
        setPhone(p.phone || "");
      }

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*, plan:plans(*)")
        .eq("user_id", user.id)
        .in("status", ["active", "paid"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setSubscription(sub);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", profile!.id);

    if (error) {
      setMessage({ type: "error", text: t("errorSave") });
    } else {
      setMessage({ type: "ok", text: t("successSave") });
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  const dateLocale = localeMap[locale] || "pt-BR";

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-white">{t("title")}</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-white/5 bg-dark-lighter p-6">
          <h2 className="mb-6 text-lg font-bold text-white">{t("personalDataTitle")}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("email")}</Label>
              <Input value={profile?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">{t("fullName")}</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("phonePlaceholder")}
              />
            </div>
            {message && (
              <p className={`text-sm ${message.type === "error" ? "text-red-500" : "text-green-500"}`}>
                {message.text}
              </p>
            )}
            <Button type="submit" className="bg-gold text-dark hover:bg-gold-light" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {tCommon("save")}
            </Button>
          </form>
        </div>

        <div className="rounded-xl border border-white/5 bg-dark-lighter p-6">
          <h2 className="mb-6 text-lg font-bold text-white">{t("accessTitle")}</h2>
          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-gold/30 bg-gold/5 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="font-bold text-gold">{t("accessActiveTitle")}</p>
                  <p className="mt-1 text-xs text-gray-text">{t("accessActiveDesc")}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-text">{t("product")}</p>
                <p className="font-medium text-white">{subscription.plan?.name}</p>
              </div>
              {subscription.paid_at && (
                <div>
                  <p className="text-sm text-gray-text">{t("purchasedAt")}</p>
                  <p className="text-white">
                    {new Date(subscription.paid_at).toLocaleDateString(dateLocale)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-4 text-gray-text">{t("noAccess")}</p>
              <Link
                href="/#planos"
                className="inline-block rounded-full bg-gold px-6 py-2 text-sm font-semibold text-dark hover:bg-gold-light"
              >
                {t("buyNow")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
