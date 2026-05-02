import "server-only";
import type { Locale } from "@/i18n/routing";
import type { EmailRender } from "@/types/email";
import { renderLayout, localizedAppUrl } from "@/lib/email/layout";

export interface PaymentApprovedTemplateParams {
  locale: Locale;
  fullName: string | null;
  planName: string;
  /** Valor em centavos (vindo do PagBank em charge.amount.value). Pode vir nulo. */
  amountCents: number | null;
  paidAt: string | null; // ISO string
}

interface Copy {
  subject: string;
  preheader: string;
  heading: (firstName: string) => string;
  introHtml: string;
  receiptLabel: string;
  planLabel: string;
  amountLabel: string;
  paidAtLabel: string;
  outroHtml: string;
  cta: string;
  currency: string;
}

const COPY: Record<Locale, Copy> = {
  pt: {
    subject: "Pagamento aprovado — acesso liberado",
    preheader: "Sua compra foi confirmada e o acesso ao curso já está liberado.",
    heading: (name) => `Pagamento aprovado, ${name}!`,
    introHtml: `
      <p style="margin:0 0 12px;">Recebemos seu pagamento e seu acesso à <strong>Zelo BJJ</strong> está liberado.</p>
      <p style="margin:0 0 12px;">Você pode começar a estudar agora pelo módulo 1 — recomendamos seguir a ordem das aulas para evoluir sem pular etapas.</p>
    `,
    receiptLabel: "Recibo",
    planLabel: "Plano",
    amountLabel: "Valor",
    paidAtLabel: "Pago em",
    outroHtml: `
      <p style="margin:16px 0 0;">Este e-mail serve como comprovante. Guarde-o ou consulte seu histórico no dashboard.</p>
    `,
    cta: "Acessar minha primeira aula",
    currency: "R$",
  },
  en: {
    subject: "Payment approved — access unlocked",
    preheader: "Your purchase is confirmed and access to the course is now unlocked.",
    heading: (name) => `Payment approved, ${name}!`,
    introHtml: `
      <p style="margin:0 0 12px;">We received your payment and your access to <strong>Zelo BJJ</strong> is unlocked.</p>
      <p style="margin:0 0 12px;">You can start studying now from module 1 — we recommend following the lesson order to progress without skipping steps.</p>
    `,
    receiptLabel: "Receipt",
    planLabel: "Plan",
    amountLabel: "Amount",
    paidAtLabel: "Paid on",
    outroHtml: `
      <p style="margin:16px 0 0;">This email serves as your receipt. Save it or check your dashboard history.</p>
    `,
    cta: "Go to my first lesson",
    currency: "BRL",
  },
  ko: {
    subject: "결제 승인 — 강의 접근이 활성화되었습니다",
    preheader: "결제가 확인되었고 강의 접근 권한이 활성화되었습니다.",
    heading: (name) => `${name}님, 결제가 승인되었습니다!`,
    introHtml: `
      <p style="margin:0 0 12px;">결제를 확인했으며 <strong>Zelo BJJ</strong> 접속이 활성화되었습니다.</p>
      <p style="margin:0 0 12px;">지금 모듈 1부터 학습을 시작하실 수 있습니다. 단계를 건너뛰지 않도록 강의 순서를 따르시길 권장합니다.</p>
    `,
    receiptLabel: "영수증",
    planLabel: "강좌",
    amountLabel: "금액",
    paidAtLabel: "결제일",
    outroHtml: `
      <p style="margin:16px 0 0;">이 이메일은 영수증 역할을 합니다. 보관하시거나 대시보드에서 결제 내역을 확인하세요.</p>
    `,
    cta: "첫 강의 보러 가기",
    currency: "BRL",
  },
};

function firstNameOf(fullName: string | null): string {
  if (!fullName) return "";
  return fullName.split(" ")[0] ?? "";
}

function formatAmount(cents: number | null, currency: string, locale: Locale): string | null {
  if (cents == null) return null;
  const value = cents / 100;
  if (locale === "pt") {
    return `${currency} ${value.toFixed(2).replace(".", ",")}`;
  }
  return `${currency} ${value.toFixed(2)}`;
}

function formatPaidAt(iso: string | null, locale: Locale): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const intlLocale = locale === "pt" ? "pt-BR" : locale === "ko" ? "ko-KR" : "en-US";
  return new Intl.DateTimeFormat(intlLocale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(d);
}

export function paymentApprovedTemplate(params: PaymentApprovedTemplateParams): EmailRender {
  const { locale, fullName, planName, amountCents, paidAt } = params;
  const copy = COPY[locale] ?? COPY.pt;
  const name = firstNameOf(fullName) || (locale === "ko" ? "수련생" : locale === "en" ? "athlete" : "aluno");

  const amountStr = formatAmount(amountCents, copy.currency, locale);
  const paidAtStr = formatPaidAt(paidAt, locale);

  const receiptRows = [
    `<tr><td style="padding:4px 0;color:#9a9a9a;width:120px;">${copy.planLabel}</td><td style="padding:4px 0;color:#ffffff;">${planName}</td></tr>`,
    amountStr ? `<tr><td style="padding:4px 0;color:#9a9a9a;">${copy.amountLabel}</td><td style="padding:4px 0;color:#ffffff;">${amountStr}</td></tr>` : "",
    paidAtStr ? `<tr><td style="padding:4px 0;color:#9a9a9a;">${copy.paidAtLabel}</td><td style="padding:4px 0;color:#ffffff;">${paidAtStr}</td></tr>` : "",
  ].filter(Boolean).join("");

  const receiptHtml = `
    <div style="margin:20px 0;padding:16px 18px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;">
      <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:1px;color:${"#c5a028"};text-transform:uppercase;">${copy.receiptLabel}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;">
        ${receiptRows}
      </table>
    </div>
  `;

  return {
    subject: copy.subject,
    html: renderLayout({
      locale,
      preheader: copy.preheader,
      heading: copy.heading(name),
      bodyHtml: copy.introHtml + receiptHtml + copy.outroHtml,
      ctaText: copy.cta,
      ctaUrl: localizedAppUrl(locale, "/dashboard?welcome=1"),
    }),
  };
}
