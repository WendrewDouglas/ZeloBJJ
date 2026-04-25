"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Loader2 } from "lucide-react";

type Props = {
  planSlug: "curso_digital";
  planName: string;
  featured?: boolean;
  size?: "md" | "lg";
  label?: string;
};

export function SubscribeButton({ planSlug, planName, featured, size = "md", label }: Props) {
  const t = useTranslations("subscribe");
  const tCommon = useTranslations("common");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug }),
      });

      if (res.status === 401) {
        const next = encodeURIComponent(`/?comprar=${planSlug}`);
        window.location.href = `/cadastro?redirect=${next}`;
        return;
      }

      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? t("errorCheckout", { planName }));
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setError(tCommon("errorNetwork"));
      setLoading(false);
    }
  }

  const sizeCls =
    size === "lg"
      ? "py-4 text-base md:text-lg"
      : "py-3 text-sm md:text-base";

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-6 text-center font-bold shadow-lg transition-all hover:shadow-gold/30 disabled:opacity-60 ${sizeCls} ${
          featured
            ? "bg-gold text-dark hover:bg-gold-light"
            : "border border-white/20 text-white hover:border-gold hover:text-gold"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("openingCheckout")}
          </>
        ) : (
          <>
            {label ?? t("buyNow")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>
      {error && <p className="text-center text-xs text-red-400">{error}</p>}
    </div>
  );
}
