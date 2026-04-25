import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import { cookies } from "next/headers";
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let locale: string = routing.defaultLocale;
  try {
    const cookieStore = await cookies();
    const candidate = cookieStore.get("NEXT_LOCALE")?.value;
    if (candidate && (routing.locales as readonly string[]).includes(candidate)) {
      locale = candidate;
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
