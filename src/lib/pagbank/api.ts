import "server-only";

const PAGBANK_BASE_URL =
  process.env.PAGBANK_API_BASE_URL ?? "https://api.pagseguro.com";

export interface PagbankCheckoutItem {
  /** Nome do item exibido na tela de checkout */
  name: string;
  /** Quantidade (geralmente 1 para curso digital) */
  quantity: number;
  /** Valor unitario em centavos (ex.: 6990 = R$ 69,90) */
  unit_amount: number;
}

export interface PagbankCustomer {
  name: string;
  email: string;
  /** CPF/CNPJ do comprador. Opcional para checkouts, pode ser preenchido pelo cliente na tela do PagBank. */
  tax_id?: string;
}

export type PagbankPaymentMethodType = "CREDIT_CARD" | "DEBIT_CARD" | "BOLETO" | "PIX";

export interface PagbankPaymentMethod {
  type: PagbankPaymentMethodType;
  /** Bandeiras aceitas (so para CREDIT_CARD/DEBIT_CARD). Se omitido, todas as bandeiras suportadas. */
  brands?: string[];
}

export interface CreatePagbankCheckoutInput {
  /** Identificador interno nosso para correlacionar webhook (`USER_<uuid>__PLAN_<slug>`). */
  referenceId: string;
  /**
   * Se omitido, customer_modifiable=true (default) e o cliente preenche nome/email/CPF/telefone
   * na propria tela do PagBank. Recomendado quando nao temos esses dados completos no nosso lado.
   */
  customer?: PagbankCustomer;
  items: PagbankCheckoutItem[];
  /** URL onde o PagBank notifica mudancas no checkout (ex.: criado, expirado). 5-100 chars. */
  notificationUrl: string;
  /** URL onde o PagBank notifica mudancas no pagamento (paid, declined, refunded). 5-100 chars. */
  paymentNotificationUrl: string;
  /** URL onde o cliente eh redirecionado apos finalizar/cancelar o pagamento. */
  redirectUrl: string;
  /**
   * Meios de pagamento aceitos. Se omitido, usamos CREDIT_CARD + BOLETO + PIX por default
   * (cobre praticamente todos os clientes BR).
   */
  paymentMethods?: PagbankPaymentMethod[];
}

export interface CreatePagbankCheckoutResult {
  /** ID do checkout no PagBank (formato CHEC_xxx ou ORDE_xxx). */
  id: string;
  /** URL hospedada pra onde devemos redirecionar o cliente. */
  payUrl: string;
  /** Resposta bruta para auditoria/debug. */
  raw: unknown;
}

interface PagbankLink {
  rel?: string;
  href?: string;
  media?: string;
}

function appendQueryParam(url: string, key: string, value: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}

/**
 * Cria uma sessao de Checkout hospedada no PagBank V4.
 *
 * Doc: https://developer.pagbank.com.br/reference/criar-checkout
 *
 * Diferenca-chave vs link pag.ae estatico: aqui passamos por order
 * o `reference_id` (correlação webhook), `notification_urls` e
 * `redirect_url` específicos. O link pag.ae nao suporta nada disso.
 */
export async function createPagbankCheckout(
  input: CreatePagbankCheckoutInput
): Promise<CreatePagbankCheckoutResult> {
  const token = process.env.PAGBANK_API_TOKEN;
  if (!token) {
    throw new Error("PAGBANK_API_TOKEN nao configurado");
  }

  const paymentMethods: PagbankPaymentMethod[] = input.paymentMethods ?? [
    { type: "CREDIT_CARD" },
    { type: "BOLETO" },
    { type: "PIX" },
  ];

  // PagBank /checkouts NAO adiciona automaticamente nenhum query param na redirect_url
  // (diferente da aplicacao "Pagar com PagBank Deeplink" no painel). Como o /obrigado
  // depende de um identificador para fazer polling do status, anexamos ?ref=<reference_id>
  // explicitamente — assim a tela /obrigado consegue identificar o pagamento.
  const redirectUrlWithRef = appendQueryParam(
    input.redirectUrl,
    "ref",
    input.referenceId
  );

  const body: Record<string, unknown> = {
    reference_id: input.referenceId,
    items: input.items,
    payment_methods: paymentMethods,
    notification_urls: [input.notificationUrl],
    payment_notification_urls: [input.paymentNotificationUrl],
    redirect_url: redirectUrlWithRef,
  };

  if (input.customer) {
    body.customer = input.customer;
  }

  const res = await fetch(`${PAGBANK_BASE_URL}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(
      `PagBank /checkouts retornou JSON invalido (${res.status}): ${text.slice(0, 300)}`
    );
  }

  if (!res.ok) {
    const summary = JSON.stringify(json).slice(0, 600);
    throw new Error(`PagBank /checkouts ${res.status}: ${summary}`);
  }

  const obj = json as { id?: string; links?: PagbankLink[] };
  const links = obj.links ?? [];
  const payLink = links.find(
    (l) => l.rel === "PAY" || l.rel === "CHECKOUT" || l.rel === "PAYMENT"
  );

  if (!obj.id || !payLink?.href) {
    throw new Error(
      `PagBank /checkouts: resposta sem id ou link de pagamento. Resposta: ${JSON.stringify(json).slice(0, 400)}`
    );
  }

  return {
    id: obj.id,
    payUrl: payLink.href,
    raw: json,
  };
}
