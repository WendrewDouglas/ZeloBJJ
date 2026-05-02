import "server-only";
import type { Locale } from "@/i18n/routing";
import type { EmailRender, PaymentFailedReason } from "@/types/email";
import { renderLayout, localizedAppUrl } from "@/lib/email/layout";

export interface PaymentFailedTemplateParams {
  locale: Locale;
  fullName: string | null;
  reason: PaymentFailedReason;
  /** Link PagBank para tentar de novo (declined). Pode vir nulo. */
  retryUrl: string | null;
}

interface ReasonCopy {
  subject: string;
  preheader: string;
  bodyHtml: string;
  cta: string | null; // null = sem botao
  ctaIsRetry: boolean; // true = botao usa retryUrl; false = botao usa whatsappUrl
}

interface Copy {
  heading: (firstName: string) => string;
  whatsappLabel: string;
  reasons: Record<PaymentFailedReason, ReasonCopy>;
}

const WHATSAPP_URL = "https://wa.me/5518981328589";

const COPY: Record<Locale, Copy> = {
  pt: {
    heading: (name) => `${name}, sobre seu pagamento`,
    whatsappLabel: "Falar no WhatsApp",
    reasons: {
      declined: {
        subject: "Seu pagamento não foi aprovado",
        preheader: "Tentamos confirmar seu pagamento, mas ele não foi aprovado.",
        bodyHtml: `
          <p style="margin:0 0 12px;">Tentamos confirmar seu pagamento na Zelo BJJ, mas o emissor do cartão recusou a transação.</p>
          <p style="margin:0 0 12px;">Isso costuma acontecer por limite, restrição de compra online ou inconsistência nos dados. Você pode tentar novamente — escolha PIX se preferir uma confirmação imediata.</p>
        `,
        cta: "Tentar novamente",
        ctaIsRetry: true,
      },
      canceled: {
        subject: "Sua compra foi cancelada",
        preheader: "Identificamos um cancelamento na sua compra na Zelo BJJ.",
        bodyHtml: `
          <p style="margin:0 0 12px;">Sua compra na Zelo BJJ foi cancelada antes de ser confirmada e seu acesso permanece bloqueado.</p>
          <p style="margin:0 0 12px;">Se foi um engano ou se você ainda quer participar, é só refazer a compra. Caso precise de ajuda, fale com a gente no WhatsApp.</p>
        `,
        cta: null,
        ctaIsRetry: false,
      },
      refunded: {
        subject: "Estorno processado",
        preheader: "Confirmamos o estorno da sua compra na Zelo BJJ.",
        bodyHtml: `
          <p style="margin:0 0 12px;">Processamos o estorno da sua compra na Zelo BJJ. O valor pode levar alguns dias para aparecer na fatura ou conta, dependendo da forma de pagamento.</p>
          <p style="margin:0 0 12px;">Seu acesso à plataforma foi removido nesta data. Se foi um engano ou você quiser voltar mais tarde, fale com a gente no WhatsApp — vamos te ajudar.</p>
        `,
        cta: null,
        ctaIsRetry: false,
      },
    },
  },
  en: {
    heading: (name) => `${name}, about your payment`,
    whatsappLabel: "Talk on WhatsApp",
    reasons: {
      declined: {
        subject: "Your payment was not approved",
        preheader: "We tried to confirm your payment but it was not approved.",
        bodyHtml: `
          <p style="margin:0 0 12px;">We tried to confirm your Zelo BJJ payment, but the card issuer declined the transaction.</p>
          <p style="margin:0 0 12px;">This usually happens due to limits, online-purchase restrictions, or data mismatch. You can try again — choose PIX for instant confirmation.</p>
        `,
        cta: "Try again",
        ctaIsRetry: true,
      },
      canceled: {
        subject: "Your purchase was canceled",
        preheader: "We detected a cancellation on your Zelo BJJ purchase.",
        bodyHtml: `
          <p style="margin:0 0 12px;">Your Zelo BJJ purchase was canceled before being confirmed and your access remains locked.</p>
          <p style="margin:0 0 12px;">If it was a mistake or you still want to join, simply place the order again. Need help? Reach out on WhatsApp.</p>
        `,
        cta: null,
        ctaIsRetry: false,
      },
      refunded: {
        subject: "Refund processed",
        preheader: "We've confirmed the refund of your Zelo BJJ purchase.",
        bodyHtml: `
          <p style="margin:0 0 12px;">We've processed the refund for your Zelo BJJ purchase. The amount may take a few days to appear on your statement or account depending on the payment method.</p>
          <p style="margin:0 0 12px;">Your platform access has been removed today. If it was a mistake or you'd like to come back later, talk to us on WhatsApp — we'll help.</p>
        `,
        cta: null,
        ctaIsRetry: false,
      },
    },
  },
  ko: {
    heading: (name) => `${name}님, 결제 관련 안내`,
    whatsappLabel: "WhatsApp으로 문의",
    reasons: {
      declined: {
        subject: "결제가 승인되지 않았습니다",
        preheader: "결제를 시도했지만 승인되지 않았습니다.",
        bodyHtml: `
          <p style="margin:0 0 12px;">Zelo BJJ 결제를 확인하려 했지만 카드 발급사가 거래를 거절했습니다.</p>
          <p style="margin:0 0 12px;">한도, 온라인 구매 제한 또는 데이터 불일치로 인한 경우가 일반적입니다. 다시 시도하실 수 있으며, 즉시 확인을 원하시면 PIX를 선택하세요.</p>
        `,
        cta: "다시 시도",
        ctaIsRetry: true,
      },
      canceled: {
        subject: "구매가 취소되었습니다",
        preheader: "Zelo BJJ 구매에서 취소를 감지했습니다.",
        bodyHtml: `
          <p style="margin:0 0 12px;">Zelo BJJ 구매가 확정되기 전에 취소되었으며 접근 권한은 잠금 상태로 유지됩니다.</p>
          <p style="margin:0 0 12px;">실수였거나 여전히 참여하고 싶으시면 다시 주문해 주세요. 도움이 필요하시면 WhatsApp으로 문의해 주세요.</p>
        `,
        cta: null,
        ctaIsRetry: false,
      },
      refunded: {
        subject: "환불 처리 완료",
        preheader: "Zelo BJJ 구매에 대한 환불을 확인했습니다.",
        bodyHtml: `
          <p style="margin:0 0 12px;">Zelo BJJ 구매에 대한 환불을 처리했습니다. 결제 수단에 따라 명세서나 계좌에 반영되기까지 며칠이 걸릴 수 있습니다.</p>
          <p style="margin:0 0 12px;">오늘부로 플랫폼 접근이 제거되었습니다. 실수였거나 나중에 다시 참여하고 싶으시면 WhatsApp으로 문의해 주세요. 도와드리겠습니다.</p>
        `,
        cta: null,
        ctaIsRetry: false,
      },
    },
  },
};

function firstNameOf(fullName: string | null): string {
  if (!fullName) return "";
  return fullName.split(" ")[0] ?? "";
}

export function paymentFailedTemplate(params: PaymentFailedTemplateParams): EmailRender {
  const { locale, fullName, reason, retryUrl } = params;
  const localeCopy = COPY[locale] ?? COPY.pt;
  const reasonCopy = localeCopy.reasons[reason];
  const name = firstNameOf(fullName) || (locale === "ko" ? "수련생" : locale === "en" ? "athlete" : "aluno");

  let ctaText: string | undefined;
  let ctaUrl: string | undefined;

  if (reasonCopy.cta && reasonCopy.ctaIsRetry && retryUrl) {
    ctaText = reasonCopy.cta;
    ctaUrl = retryUrl;
  } else {
    // Sempre oferece WhatsApp como CTA secundario quando nao ha retry
    ctaText = localeCopy.whatsappLabel;
    ctaUrl = WHATSAPP_URL;
  }

  // Caso especial: declined sem retryUrl — degrada para tela de oferta
  if (reason === "declined" && !retryUrl) {
    ctaText = reasonCopy.cta ?? localeCopy.whatsappLabel;
    ctaUrl = localizedAppUrl(locale, "/#oferta");
  }

  return {
    subject: reasonCopy.subject,
    html: renderLayout({
      locale,
      preheader: reasonCopy.preheader,
      heading: localeCopy.heading(name),
      bodyHtml: reasonCopy.bodyHtml,
      ctaText,
      ctaUrl,
    }),
  };
}
