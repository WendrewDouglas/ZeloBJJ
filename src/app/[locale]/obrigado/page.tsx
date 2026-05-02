export const dynamic = "force-dynamic";

import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseReferenceId } from "@/lib/pagbank";
import { ThankYouPolling } from "@/components/public/thank-you-polling";
import { SiteHeader } from "@/components/public/site-header";
import { CheckCircle2, Loader2 } from "lucide-react";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string }>;
}

const ACTIVE_STATUSES = new Set(["paid", "active", "trial"]);

export default async function ThankYouPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { ref } = await searchParams;
  const t = await getTranslations("thankYou");
  const localeTyped = (await getLocale()) as Locale;

  let status: string | null = null;
  let validRef = false;

  if (ref && parseReferenceId(ref)) {
    validRef = true;
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("pagbank_reference_id", ref)
      .maybeSingle();

    status = data?.status ?? null;

    // Ja foi pago — manda direto pro dashboard com toast.
    if (status && ACTIVE_STATUSES.has(status)) {
      redirect({ href: "/dashboard?welcome=1", locale: localeTyped });
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteHeader />

      <section className="px-4 pt-32 pb-20 md:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-gold/30 bg-gradient-to-b from-dark-lighter to-dark-light p-8 text-center md:p-12">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
                <CheckCircle2 className="h-9 w-9 text-gold" />
              </div>
            </div>

            <h1 className="mb-3 text-2xl font-bold text-white md:text-3xl">
              {t("title")}
            </h1>
            <p className="mb-6 text-sm text-gray-text md:text-base">
              {t("subtitle")}
            </p>

            {validRef ? (
              <ThankYouPolling reference={ref!} initialStatus={status} />
            ) : (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-sm text-gray-text">
                <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin text-gold" />
                <p>{t("missingRef")}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
