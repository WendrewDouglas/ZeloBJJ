import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  CheckCircle2,
  Shield,
  Clock,
  GraduationCap,
  Zap,
  CreditCard,
  Smartphone,
  PlayCircle,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Infinity as InfinityIcon,
  BookOpen,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { SubscribeButton } from "@/components/public/subscribe-button";
import { SiteHeader } from "@/components/public/site-header";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const moduleIds = ["01", "02", "03", "04", "05", "06", "07", "08", "09"] as const;
const forWhomItems = [
  { key: "beginners" as const, icon: GraduationCap },
  { key: "whiteBlue" as const, icon: Zap },
  { key: "review" as const, icon: BookOpen },
];
const principleItems = [
  { key: "position" as const, icon: Shield },
  { key: "technique" as const, icon: Zap },
  { key: "consistency" as const, icon: Clock },
];
const trustItems = [
  { key: "secure" as const, icon: Shield },
  { key: "instant" as const, icon: Zap },
  { key: "lifetime" as const, icon: InfinityIcon },
  { key: "installments" as const, icon: CreditCard },
];
const featureKeys = ["f1", "f2", "f3", "f4", "f5", "f6"] as const;
const faqIds = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;
const paymentMethods = ["card", "pix", "boleto", "googlePay", "applePay"] as const;
const statKeys = [
  { key: "modules" as const, value: "9" },
  { key: "techniques" as const, value: "50+" },
  { key: "videos" as const, value: "HD" },
  { key: "lifetime" as const, value: "∞" },
];

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const offerName = t("offer.name");
  const whatsappMessage = encodeURIComponent(t("whatsapp.message"));
  const whatsappHref = `https://wa.me/5518981328589?text=${whatsappMessage}`;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteHeader />

      {/* Hero */}
      <section className="hero-gradient relative flex min-h-[92vh] items-center justify-center overflow-hidden px-4 pt-28 pb-20 md:px-6">
        <div className="grid-fade absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              {t("hero.badge")}
            </span>
          </div>

          <Image
            src="/logo.png"
            alt="Zelo BJJ"
            width={140}
            height={140}
            className="mx-auto mb-6 animate-float drop-shadow-[0_0_40px_rgba(197,160,40,0.25)]"
            priority
          />

          <h1 className="mb-5 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            {t("hero.title1")}{" "}
            <span className="gradient-gold">{t("hero.titleHighlight")}</span>
            <br className="hidden md:block" /> {t("hero.title2")}
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-pretty text-base text-gray-text md:text-lg">
            {t("hero.subtitle")}
          </p>

          <div className="mx-auto flex max-w-md flex-col items-stretch gap-3">
            <a
              href="#oferta"
              className="group relative inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-8 py-4 text-base font-bold text-dark shadow-xl shadow-gold/20 transition-all hover:bg-gold-light md:text-lg"
            >
              {t("hero.ctaPrimary")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-8 py-3 text-sm font-medium text-gray-text transition-colors hover:border-gold hover:text-gold"
            >
              {t("hero.ctaSecondary")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-6">
            {trustItems.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-gray-text"
              >
                <item.icon className="h-3.5 w-3.5 text-gold" />
                {t(`hero.trust.${item.key}`)}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre + Stats */}
      <section id="sobre" className="px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-gold">
                {t("about.eyebrow")}
              </span>
              <h2 className="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">
                {t("about.title1")}{" "}
                <span className="gradient-gold">{t("about.titleHighlight")}</span>
              </h2>
              <p className="mb-4 text-gray-text leading-relaxed">
                {t("about.p1")}
              </p>
              <p className="text-gray-text leading-relaxed">{t("about.p2")}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {statKeys.map((stat) => (
                <div
                  key={stat.key}
                  className="card-hover rounded-2xl border border-white/10 bg-dark-lighter/50 p-6 text-center backdrop-blur"
                >
                  <div className="mb-2 text-4xl font-extrabold text-gold">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-text">
                    {t(`about.stats.${stat.key}`)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Para quem */}
      <section className="bg-dark-light px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-gold">
              {t("forWhom.eyebrow")}
            </span>
            <h2 className="text-3xl font-bold md:text-4xl">
              {t("forWhom.title1")}{" "}
              <span className="gradient-gold">{t("forWhom.titleHighlight")}</span>{" "}
              {t("forWhom.title2")}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {forWhomItems.map((item) => (
              <div
                key={item.key}
                className="card-hover rounded-2xl border border-white/5 bg-dark-lighter/60 p-6 backdrop-blur"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">
                  {t(`forWhom.items.${item.key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-gray-text">
                  {t(`forWhom.items.${item.key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modulos */}
      <section id="modulos" className="px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-gold">
              {t("modules.eyebrow")}
            </span>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              {t("modules.title1")}{" "}
              <span className="gradient-gold">{t("modules.titleHighlight")}</span>
            </h2>
            <p className="mx-auto max-w-xl text-gray-text">
              {t("modules.subtitle")}
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {moduleIds.map((n) => (
              <div
                key={n}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-dark-lighter/60 p-6 transition-all hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_10px_40px_-10px_rgba(197,160,40,0.3)]"
              >
                <div className="absolute -right-6 -top-6 text-7xl font-black text-gold/5 transition-colors group-hover:text-gold/10">
                  {n}
                </div>
                <span className="relative mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold">
                  <PlayCircle className="h-3.5 w-3.5" />
                  {t("modules.moduleLabel")} {n}
                </span>
                <h3 className="relative mb-2 text-lg font-bold text-white">
                  {t(`modules.items.${n}.title`)}
                </h3>
                <p className="relative text-sm leading-relaxed text-gray-text">
                  {t(`modules.items.${n}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Princípios */}
      <section className="bg-dark-light px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-gold">
              {t("principles.eyebrow")}
            </span>
            <h2 className="text-3xl font-bold md:text-4xl">
              {t("principles.title1")}{" "}
              <span className="gradient-gold">
                {t("principles.titleHighlight")}
              </span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {principleItems.map((item) => (
              <div
                key={item.key}
                className="card-hover rounded-2xl border border-white/5 bg-dark-lighter/60 p-7 text-center backdrop-blur"
              >
                <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-lg font-bold">
                  {t(`principles.items.${item.key}.title`)}
                </h3>
                <p className="text-sm text-gray-text leading-relaxed">
                  {t(`principles.items.${item.key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Oferta */}
      <section id="oferta" className="relative px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <span className="mb-3 inline-block rounded-full border border-gold/30 bg-gold/5 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
              {t("offer.eyebrow")}
            </span>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
              {t("offer.title1")}{" "}
              <span className="gradient-gold">{t("offer.titleHighlight")}</span>
            </h2>
            <p className="mx-auto max-w-xl text-gray-text">
              {t("offer.subtitle")}
            </p>
          </div>

          <div className="glow-gold relative rounded-3xl border border-gold/50 bg-gradient-to-b from-dark-lighter to-dark-light p-6 pt-10 md:p-10 md:pt-12">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-5 py-1 text-xs font-bold uppercase tracking-widest text-dark shadow-lg">
              {t("offer.ribbon")}
            </span>

            <div className="mb-8 text-center">
              <p className="mb-2 text-xs uppercase tracking-widest text-gold">
                {t("offer.kicker")}
              </p>
              <h3 className="mb-6 text-xl font-bold md:text-2xl">{offerName}</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-xl text-gray-text">
                  {t("offer.currency")}
                </span>
                <span className="text-6xl font-extrabold text-gold md:text-7xl">
                  {t("offer.price")}
                </span>
                <span className="text-2xl font-bold text-gold">
                  ,{t("offer.cents")}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-text">
                {t.rich("offer.installments", {
                  strong: (chunks) => (
                    <strong className="text-white">{chunks}</strong>
                  ),
                })}
              </p>
            </div>

            <ul className="mb-8 grid gap-3 sm:grid-cols-2">
              {featureKeys.map((key) => (
                <li
                  key={key}
                  className="flex items-start gap-2.5 text-sm text-gray-text"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span>{t(`offer.features.${key}`)}</span>
                </li>
              ))}
            </ul>

            <div className="mx-auto max-w-md space-y-3">
              <div className="pulse-ring rounded-full">
                <SubscribeButton
                  planSlug="curso_digital"
                  planName={offerName}
                  featured
                  size="lg"
                  label={t("offer.ctaLabel")}
                />
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-text">
                <Shield className="h-3.5 w-3.5 text-gold" />
                {t("offer.secure")}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {paymentMethods.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-gray-text"
                  >
                    <Smartphone className="h-3 w-3" /> {t(`offer.methods.${m}`)}
                  </span>
                ))}
              </div>
              <p className="pt-2 text-center text-xs text-gray-text">
                {t("offer.alreadyBought")}{" "}
                <Link
                  href="/login"
                  className="font-semibold text-gold hover:text-gold-light"
                >
                  {t("offer.loginLink")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-dark-light px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-gold">
              {t("faq.eyebrow")}
            </span>
            <h2 className="text-3xl font-bold md:text-4xl">
              {t("faq.title1")}{" "}
              <span className="gradient-gold">{t("faq.titleHighlight")}</span>
            </h2>
          </div>
          <div className="space-y-3">
            {faqIds.map((id) => (
              <details
                key={id}
                className="group overflow-hidden rounded-2xl border border-white/5 bg-dark-lighter/60 transition-colors hover:border-gold/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-white md:text-base">
                  {t(`faq.items.${id}.q`)}
                  <span className="ml-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-gold transition-transform group-open:rotate-45">
                    <span className="text-lg leading-none">+</span>
                  </span>
                </summary>
                <div className="border-t border-white/5 px-5 py-4 text-sm leading-relaxed text-gray-text">
                  {t(`faq.items.${id}.a`)}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final + Contato */}
      <section
        id="contato"
        className="relative overflow-hidden px-4 py-20 md:px-6 md:py-28"
      >
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-gradient-to-b from-dark-lighter to-dark p-8 text-center md:p-12">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">
            {t("cta.title1")}{" "}
            <span className="gradient-gold">{t("cta.titleHighlight")}</span>?
          </h2>
          <p className="mb-8 text-gray-text">{t("cta.subtitle")}</p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#oferta"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 text-sm font-bold text-dark shadow-lg transition-colors hover:bg-gold-light"
            >
              {t("cta.buy")}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3 text-sm font-semibold text-white transition-colors hover:border-gold hover:text-gold"
            >
              <MessageCircle className="h-4 w-4" />
              {t("cta.whatsapp")}
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-4 py-12 md:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Zelo BJJ" width={36} height={36} />
            <span className="font-bold text-white">
              ZELO <span className="text-gold">BJJ</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/login"
              className="text-gray-text transition-colors hover:text-gold"
            >
              {t("footer.login")}
            </Link>
            <a
              href="#faq"
              className="text-gray-text transition-colors hover:text-gold"
            >
              {t("footer.faq")}
            </a>
            <a
              href="https://instagram.com/zelobjj"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-text transition-colors hover:text-gold"
            >
              {t("footer.instagram")}
            </a>
            <a
              href="https://wa.me/5518981328589"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-text transition-colors hover:text-gold"
            >
              {t("footer.whatsapp")}
            </a>
          </div>
          <p className="text-xs text-gray-text">{t("footer.rights")}</p>
        </div>
      </footer>

      {/* WhatsApp Float */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 shadow-lg ring-4 ring-green-500/20 transition-transform hover:scale-110"
        aria-label={t("whatsapp.ariaLabel")}
      >
        <svg
          className="h-7 w-7 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}
