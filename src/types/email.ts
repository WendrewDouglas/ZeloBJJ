import type { Locale } from "@/i18n/routing";

export type EmailTemplate =
  | "welcome"
  | "payment_approved"
  | "payment_pending"
  | "payment_failed";

export type PaymentFailedReason = "declined" | "canceled" | "refunded";

export interface EmailLayoutInput {
  locale: Locale;
  preheader: string;
  heading: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  footerNote?: string;
}

export interface EmailRender {
  subject: string;
  html: string;
}
