"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Loader2, MessageCircle, Clock } from "lucide-react";

const POLL_INTERVAL_MS = 3000;
const TIMEOUT_MS = 60_000;
const ACTIVE_STATUSES = new Set(["paid", "active", "trial"]);
const FAILED_STATUSES = new Set(["declined", "canceled", "expired", "suspended", "refunded"]);

type Identifier =
  | { kind: "ref"; value: string }
  | { kind: "transaction_id"; value: string };

interface Props {
  identifier: Identifier;
  initialStatus: string | null;
}

type View = "polling" | "timeout" | "failed";

function buildStatusUrl(identifier: Identifier): string {
  const param = identifier.kind === "ref" ? "ref" : "transaction_id";
  return `/api/checkout/status?${param}=${encodeURIComponent(identifier.value)}`;
}

export function ThankYouPolling({ identifier, initialStatus }: Props) {
  const t = useTranslations("thankYou");
  const router = useRouter();
  const [view, setView] = useState<View>(
    initialStatus && FAILED_STATUSES.has(initialStatus) ? "failed" : "polling"
  );
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (view !== "polling") return;

    if (startedAtRef.current === null) {
      startedAtRef.current = Date.now();
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const statusUrl = buildStatusUrl(identifier);

    async function tick() {
      if (cancelled) return;

      try {
        const res = await fetch(statusUrl, { cache: "no-store" });
        if (cancelled) return;

        if (res.ok) {
          const data = (await res.json()) as { status: string | null };
          if (data.status && ACTIVE_STATUSES.has(data.status)) {
            router.replace("/dashboard?welcome=1");
            return;
          }
          if (data.status && FAILED_STATUSES.has(data.status)) {
            setView("failed");
            return;
          }
        }
      } catch {
        // Erro de rede — continua tentando
      }

      const startedAt = startedAtRef.current ?? Date.now();
      const elapsed = Date.now() - startedAt;
      if (elapsed >= TIMEOUT_MS) {
        setView("timeout");
        return;
      }

      timeoutId = setTimeout(tick, POLL_INTERVAL_MS);
    }

    timeoutId = setTimeout(tick, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [identifier, router, view]);

  if (view === "polling") {
    return (
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-gold/20 bg-gold/5 p-5 text-sm text-gray-text">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-gold" />
          <span>{t("confirming")}</span>
        </div>
        <p className="text-xs text-gray-text">{t("autoRedirect")}</p>
      </div>
    );
  }

  if (view === "failed") {
    return (
      <div className="mt-6 space-y-4">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-left">
          <h3 className="mb-2 font-bold text-white">{t("failedTitle")}</h3>
          <p className="text-sm text-gray-text">{t("failedBody")}</p>
        </div>
        <a
          href="https://wa.me/5518981328589"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:border-gold hover:text-gold"
        >
          <MessageCircle className="h-4 w-4" />
          {t("whatsapp")}
        </a>
      </div>
    );
  }

  // timeout
  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left">
        <div className="mb-2 flex items-center gap-2">
          <Clock className="h-4 w-4 text-gold" />
          <h3 className="font-bold text-white">{t("timeoutTitle")}</h3>
        </div>
        <p className="text-sm text-gray-text">{t("timeoutBody")}</p>
      </div>
      <a
        href="https://wa.me/5518981328589"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:border-gold hover:text-gold"
      >
        <MessageCircle className="h-4 w-4" />
        {t("whatsapp")}
      </a>
    </div>
  );
}
