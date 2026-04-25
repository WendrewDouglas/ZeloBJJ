import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import { headers } from "next/headers";
import { routing } from "@/i18n/routing";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zelo BJJ - Jiu-Jitsu Brasileiro | Cursos Online e Presencial",
  description:
    "Aprenda Jiu-Jitsu Brasileiro com os melhores instrutores. Cursos online completos, do iniciante ao avançado. Fundamentos, técnicas e muito mais.",
  keywords:
    "jiu-jitsu, bjj, jiu-jitsu brasileiro, curso online, arte marcial, zelo bjj",
  openGraph: {
    title: "Zelo BJJ - Jiu-Jitsu Brasileiro",
    description: "Cursos online e presenciais de Jiu-Jitsu Brasileiro",
    url: "https://zelobjj.com.br",
    siteName: "Zelo BJJ",
    type: "website",
  },
};

const validLocales = routing.locales as readonly string[];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let locale: string = routing.defaultLocale;
  try {
    const headerStore = await headers();
    // next-intl middleware sets this on every matched request, even on first visit
    const fromHeader = headerStore.get("x-next-intl-locale");
    if (fromHeader && validLocales.includes(fromHeader)) {
      locale = fromHeader;
    } else {
      // Fallback: parse first path segment (covers cases the header isn't set)
      const pathname =
        headerStore.get("x-invoke-path") ??
        headerStore.get("x-pathname") ??
        headerStore.get("next-url") ??
        "";
      const segment = pathname.split("/").filter(Boolean)[0];
      if (segment && validLocales.includes(segment)) {
        locale = segment;
      }
    }
  } catch {
    // No request context (e.g. build of internal _global-error / _not-found)
  }

  return (
    <html lang={locale} className={`dark ${geist.variable}`} suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
