import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zelo BJJ - Jiu-Jitsu Brasileiro | Cursos Online e Presencial",
  description:
    "Aprenda Jiu-Jitsu Brasileiro com os melhores instrutores. Cursos online completos, do iniciante ao avançado. Fundamentos, técnicas e muito mais.",
  keywords: "jiu-jitsu, bjj, jiu-jitsu brasileiro, curso online, arte marcial, zelo bjj",
  openGraph: {
    title: "Zelo BJJ - Jiu-Jitsu Brasileiro",
    description: "Cursos online e presenciais de Jiu-Jitsu Brasileiro",
    url: "https://zelobjj.com.br",
    siteName: "Zelo BJJ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`dark ${geist.variable}`}>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
