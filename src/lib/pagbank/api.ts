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

export interface CreatePagbankCheckoutInput {
  /** Identificador interno nosso para correlacionar webhook (`USER_<uuid>__PLAN_<slug>`). */
  referenceId: string;
  customer?: PagbankCustomer;
  items: PagbankCheckoutItem[];
  /** URL onde o PagBank notifica mudancas no checkout (ex.: criado, expirado). */
  notificationUrl: string;
  /** URL onde o PagBank notifica mudancas no pagamento (paid, declined, refunded). */
  paymentNotificationUrl: string;
  /** URL onde o cliente eh redirecionado apos finalizar/cancelar o pagamento. */
  redirectUrl: string;
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

  const body: Record<string, unknown> = {
    reference_id: input.referenceId,
    items: input.items,
    notification_urls: [input.notificationUrl],
    payment_notification_urls: [input.paymentNotificationUrl],
    redirect_url: input.redirectUrl,
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
