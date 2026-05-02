import "server-only";
import type { Locale } from "@/i18n/routing";
import type { EmailRender } from "@/types/email";
import { renderLayout } from "@/lib/email/layout";

export interface PaymentPendingTemplateParams {
  locale: Locale;
  fullName: string | null;
  planName: string;
  /** Link PagBank original (pag.ae) para o usuario voltar e finalizar (PIX/boleto). Pode vir nulo. */
  paymentLinkUrl: string | null;
}

interface Copy {
  subject: string;
  preheader: string;
  heading: (firstName: string) => string;
  bodyWithLink: (planName: string) => string;
  bodyWithoutLink: (planName: string) => string;
  cta: string;
}

const COPY: Record<Locale, Copy> = {
  pt: {
    subject: "Estamos aguardando seu pagamento",
    preheader: "Sua compra está pendente. Finalize o pagamento para liberar o acesso.",
    heading: (name) => `${name}, falta um passo`,
    bodyWithLink: (plan) => `
      <p style="margin:0 0 12px;">Recebemos seu pedido do plano <strong>${plan}</strong>, mas o pagamento ainda não foi confirmado.</p>
      <p style="margin:0 0 12px;">Se você escolheu PIX ou boleto, conclua o pagamento clicando no botão abaixo. Assim que cair, seu acesso é liberado automaticamente e você recebe um e-mail de confirmação.</p>
    `,
    bodyWithoutLink: (plan) => `
      <p style="margin:0 0 12px;">Recebemos seu pedido do plano <strong>${plan}</strong>, mas o pagamento ainda não foi confirmado.</p>
      <p style="margin:0 0 12px;">Se você escolheu PIX ou boleto, finalize o pagamento usando o link/QR Code que aparece no fim da compra. Assim que cair, seu acesso é liberado automaticamente.</p>
      <p style="margin:0 0 12px;">Não consegue concluir? Fale com a gente no WhatsApp.</p>
    `,
    cta: "Finalizar pagamento",
  },
  en: {
    subject: "We're waiting on your payment",
    preheader: "Your purchase is pending. Complete the payment to unlock access.",
    heading: (name) => `${name}, one step left`,
    bodyWithLink: (plan) => `
      <p style="margin:0 0 12px;">We received your order for the <strong>${plan}</strong> plan, but the payment hasn't been confirmed yet.</p>
      <p style="margin:0 0 12px;">If you chose PIX or boleto, complete the payment by clicking the button below. As soon as it clears, your access is unlocked automatically and you receive a confirmation email.</p>
    `,
    bodyWithoutLink: (plan) => `
      <p style="margin:0 0 12px;">We received your order for the <strong>${plan}</strong> plan, but the payment hasn't been confirmed yet.</p>
      <p style="margin:0 0 12px;">If you chose PIX or boleto, finish the payment using the link/QR code shown at the end of checkout. As soon as it clears, your access is unlocked automatically.</p>
      <p style="margin:0 0 12px;">Can't complete it? Reach out to us on WhatsApp.</p>
    `,
    cta: "Complete payment",
  },
  ko: {
    subject: "결제를 기다리고 있습니다",
    preheader: "구매가 보류 중입니다. 결제를 완료하여 접근을 활성화하세요.",
    heading: (name) => `${name}님, 한 단계만 남았습니다`,
    bodyWithLink: (plan) => `
      <p style="margin:0 0 12px;"><strong>${plan}</strong> 강좌 주문을 접수했지만 결제가 아직 확인되지 않았습니다.</p>
      <p style="margin:0 0 12px;">PIX 또는 boleto를 선택하셨다면 아래 버튼을 클릭하여 결제를 완료해 주세요. 결제가 확인되는 즉시 접근이 자동으로 활성화되며 확인 이메일을 받으시게 됩니다.</p>
    `,
    bodyWithoutLink: (plan) => `
      <p style="margin:0 0 12px;"><strong>${plan}</strong> 강좌 주문을 접수했지만 결제가 아직 확인되지 않았습니다.</p>
      <p style="margin:0 0 12px;">PIX 또는 boleto를 선택하셨다면 결제 마지막 단계에 표시된 링크/QR 코드를 사용하여 결제를 완료해 주세요. 결제가 확인되는 즉시 접근이 자동으로 활성화됩니다.</p>
      <p style="margin:0 0 12px;">완료할 수 없나요? WhatsApp으로 문의해 주세요.</p>
    `,
    cta: "결제 완료하기",
  },
};

function firstNameOf(fullName: string | null): string {
  if (!fullName) return "";
  return fullName.split(" ")[0] ?? "";
}

export function paymentPendingTemplate(params: PaymentPendingTemplateParams): EmailRender {
  const { locale, fullName, planName, paymentLinkUrl } = params;
  const copy = COPY[locale] ?? COPY.pt;
  const name = firstNameOf(fullName) || (locale === "ko" ? "수련생" : locale === "en" ? "athlete" : "aluno");

  const hasLink = Boolean(paymentLinkUrl);

  return {
    subject: copy.subject,
    html: renderLayout({
      locale,
      preheader: copy.preheader,
      heading: copy.heading(name),
      bodyHtml: hasLink ? copy.bodyWithLink(planName) : copy.bodyWithoutLink(planName),
      ctaText: hasLink ? copy.cta : undefined,
      ctaUrl: hasLink ? paymentLinkUrl ?? undefined : undefined,
    }),
  };
}
