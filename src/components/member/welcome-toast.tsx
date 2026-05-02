"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export function WelcomeToast() {
  const t = useTranslations("member.dashboard");
  const router = useRouter();
  const searchParams = useSearchParams();
  const shown = useRef(false);

  useEffect(() => {
    const welcome = searchParams.get("welcome");
    if (welcome !== "1" || shown.current) return;
    shown.current = true;

    toast.success(t("welcomeToast"), {
      description: t("welcomeToastDesc"),
      duration: 6000,
    });

    // Limpa o query param sem dar reload
    const url = new URL(window.location.href);
    url.searchParams.delete("welcome");
    router.replace(url.pathname + url.search);
  }, [searchParams, router, t]);

  return null;
}
