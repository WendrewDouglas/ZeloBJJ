import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt", "en", "ko"],
  defaultLocale: "pt",
  localeDetection: true,
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
