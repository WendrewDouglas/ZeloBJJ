import "server-only";
import type { Locale } from "@/i18n/routing";
import type { EmailRender } from "@/types/email";
import { renderLayout, localizedAppUrl } from "@/lib/email/layout";

export interface WelcomeTemplateParams {
  locale: Locale;
  fullName: string | null;
  hasActiveSubscription: boolean;
}

interface Copy {
  subject: string;
  preheader: string;
  heading: (firstName: string) => string;
  bodyHtmlActive: string;
  bodyHtmlOffer: string;
  ctaActive: string;
  ctaOffer: string;
}

const COPY: Record<Locale, Copy> = {
  pt: {
    subject: "Bem-vindo à Zelo BJJ",
    preheader: "Sua conta está pronta. Veja como começar a estudar Jiu-Jitsu.",
    heading: (name) => `Bem-vindo, ${name}!`,
    bodyHtmlActive: `
      <p style="margin:0 0 12px;">É um prazer ter você na <strong>Zelo BJJ</strong>.</p>
      <p style="margin:0 0 12px;">Seu acesso já está liberado. Recomendamos começar pelo módulo 1 e seguir a ordem das aulas — a estrutura foi pensada para você evoluir do zero ao avançado sem pular etapas.</p>
      <p style="margin:0 0 12px;">Quando tiver dúvida em alguma técnica, marque a aula como concluída e use a Comunidade — vamos te ajudar.</p>
    `,
    bodyHtmlOffer: `
      <p style="margin:0 0 12px;">É um prazer ter você na <strong>Zelo BJJ</strong>.</p>
      <p style="margin:0 0 12px;">Sua conta está pronta. Para liberar todas as aulas, garanta o acesso ao curso completo. São 9 módulos estruturados para você evoluir do zero ao avançado.</p>
    `,
    ctaActive: "Começar a estudar",
    ctaOffer: "Garantir meu acesso",
  },
  en: {
    subject: "Welcome to Zelo BJJ",
    preheader: "Your account is ready. Here's how to start training Jiu-Jitsu.",
    heading: (name) => `Welcome, ${name}!`,
    bodyHtmlActive: `
      <p style="margin:0 0 12px;">It's a pleasure to have you at <strong>Zelo BJJ</strong>.</p>
      <p style="margin:0 0 12px;">Your access is already unlocked. We recommend starting with module 1 and following the lesson order — the curriculum is designed to take you from zero to advanced without skipping steps.</p>
      <p style="margin:0 0 12px;">When in doubt about a technique, mark the lesson as completed and use the Community — we'll help you.</p>
    `,
    bodyHtmlOffer: `
      <p style="margin:0 0 12px;">It's a pleasure to have you at <strong>Zelo BJJ</strong>.</p>
      <p style="margin:0 0 12px;">Your account is ready. To unlock all lessons, secure your access to the full course. 9 structured modules will take you from zero to advanced.</p>
    `,
    ctaActive: "Start training",
    ctaOffer: "Get my access",
  },
  ko: {
    subject: "Zelo BJJ에 오신 것을 환영합니다",
    preheader: "계정이 준비되었습니다. 주짓수 학습을 시작하는 방법을 안내해 드립니다.",
    heading: (name) => `${name}님, 환영합니다!`,
    bodyHtmlActive: `
      <p style="margin:0 0 12px;"><strong>Zelo BJJ</strong>에 오신 것을 진심으로 환영합니다.</p>
      <p style="margin:0 0 12px;">접속 권한이 활성화되었습니다. 1번 모듈부터 순서대로 시작하시길 권장합니다. 커리큘럼은 초보부터 고급까지 단계를 건너뛰지 않고 발전하도록 설계되었습니다.</p>
      <p style="margin:0 0 12px;">기술에 대해 궁금한 점이 있으면 강의를 완료로 표시하고 커뮤니티를 활용하세요. 도움을 드립니다.</p>
    `,
    bodyHtmlOffer: `
      <p style="margin:0 0 12px;"><strong>Zelo BJJ</strong>에 오신 것을 진심으로 환영합니다.</p>
      <p style="margin:0 0 12px;">계정이 준비되었습니다. 모든 강의를 잠금 해제하려면 전체 강좌에 대한 접근 권한을 확보하세요. 초보부터 고급까지 9개의 체계적인 모듈로 구성되어 있습니다.</p>
    `,
    ctaActive: "학습 시작하기",
    ctaOffer: "접근 권한 받기",
  },
};

function firstNameOf(fullName: string | null): string {
  if (!fullName) return "";
  return fullName.split(" ")[0] ?? "";
}

export function welcomeTemplate(params: WelcomeTemplateParams): EmailRender {
  const { locale, fullName, hasActiveSubscription } = params;
  const copy = COPY[locale] ?? COPY.pt;
  const name = firstNameOf(fullName) || (locale === "ko" ? "수련생" : locale === "en" ? "athlete" : "aluno");

  const ctaUrl = hasActiveSubscription
    ? localizedAppUrl(locale, "/dashboard")
    : localizedAppUrl(locale, "/#oferta");

  const ctaText = hasActiveSubscription ? copy.ctaActive : copy.ctaOffer;
  const bodyHtml = hasActiveSubscription ? copy.bodyHtmlActive : copy.bodyHtmlOffer;

  return {
    subject: copy.subject,
    html: renderLayout({
      locale,
      preheader: copy.preheader,
      heading: copy.heading(name),
      bodyHtml,
      ctaText,
      ctaUrl,
    }),
  };
}
