import crypto from "node:crypto";

// Estados no payload do PagBank (uppercase) mapeados para o nosso enum (lowercase).
// https://developer.pagbank.com.br/reference/listar-assinaturas
const STATUS_MAP: Record<string, string> = {
  // Assinatura recorrente
  PENDING: "pending",
  TRIAL: "trial",
  ACTIVE: "active",
  OVERDUE: "overdue",
  PENDING_ACTION: "pending_action",
  SUSPENDED: "suspended",
  CANCELED: "canceled",
  CANCELLED: "canceled",
  EXPIRED: "expired",
  // Pagamento avulso (nosso caso atual: link pag.ae unico)
  AUTHORIZED: "active",
  PAID: "paid",
  IN_ANALYSIS: "in_analysis",
  DECLINED: "declined",
  WAITING: "pending",
  REFUNDED: "refunded",
};

export function mapPagbankStatus(status: string | undefined | null): string {
  if (!status) return "pending";
  return STATUS_MAP[status.toUpperCase()] ?? "pending";
}

/**
 * Monta o reference_id enviado ao PagBank no link de pagamento.
 * Formato: USER_<uuid>__PLAN_<slug> — permite identificar usuario e plano ao receber webhook.
 */
export function buildReferenceId(userId: string, planSlug: string): string {
  return `USER_${userId}__PLAN_${planSlug}`;
}

export function parseReferenceId(
  reference: string | undefined | null
): { userId: string; planSlug: string } | null {
  if (!reference) return null;
  const match = reference.match(/^USER_([0-9a-fA-F-]{36})__PLAN_([a-z0-9_-]+)$/);
  if (!match) return null;
  return { userId: match[1], planSlug: match[2] };
}

/**
 * Acrescenta ?reference_id=... ao link de assinatura do PagBank.
 * A doc publica permite passar reference_id via query string em links hospedados.
 */
export function buildCheckoutUrl(
  paymentLink: string,
  reference: string,
  email?: string | null
): string {
  const url = new URL(paymentLink);
  url.searchParams.set("reference_id", reference);
  if (email) url.searchParams.set("email", email);
  return url.toString();
}

/**
 * Valida o webhook do PagBank usando Basic Authentication.
 *
 * O PagBank permite configurar a URL do webhook no formato
 * https://usuario:senha@host/path e envia o header Authorization: Basic base64(user:pass)
 * em toda notificacao. Essa e a forma mais robusta (vs HMAC) de validar origem.
 */
export function verifyBasicAuth(authHeader: string | null | undefined): boolean {
  const expectedUser = process.env.PAGBANK_WEBHOOK_USERNAME;
  const expectedPass = process.env.PAGBANK_WEBHOOK_PASSWORD;

  if (!expectedUser || !expectedPass) {
    // Sem credenciais configuradas, so liberamos em dev.
    return process.env.NODE_ENV !== "production";
  }
  if (!authHeader?.toLowerCase().startsWith("basic ")) return false;

  const decoded = Buffer.from(authHeader.slice(6).trim(), "base64").toString("utf8");
  const idx = decoded.indexOf(":");
  if (idx === -1) return false;

  const user = decoded.slice(0, idx);
  const pass = decoded.slice(idx + 1);

  return safeEqual(user, expectedUser) && safeEqual(pass, expectedPass);
}

/**
 * Verificacao oficial do PagBank V4 — webhooks (Order, Checkout, Assinaturas).
 *
 * Doc: https://developer.pagbank.com.br/reference/confirmar-autenticidade-da-notificacao
 *
 * Algoritmo:
 *   sig = SHA-256( token + "-" + rawBody ).hex
 * Header:
 *   x-authenticity-token: <hex>
 * Token:
 *   process.env.PAGBANK_API_TOKEN (mesmo token usado para chamar /checkouts e /orders)
 *
 * Importante: rawBody precisa ser a string EXATA que o PagBank enviou — sem
 * pretty-print, sem normalizacao. Nosso webhook ja le `await request.text()`
 * antes de fazer JSON.parse, entao isso esta correto.
 */
export function verifyPagbankAuthenticity(
  rawBody: string,
  signatureHeader: string | null | undefined
): boolean {
  if (!signatureHeader) return false;

  // Aceita producao (PAGBANK_API_TOKEN) e tambem sandbox (PAGBANK_SANDBOX_TOKEN)
  // — o token usado pra criar o checkout determina qual assina o webhook.
  const tokens = [
    process.env.PAGBANK_API_TOKEN,
    process.env.PAGBANK_SANDBOX_TOKEN,
  ].filter((t): t is string => Boolean(t));

  if (tokens.length === 0) return false;

  const received = signatureHeader.trim().toLowerCase();

  for (const token of tokens) {
    const expected = crypto
      .createHash("sha256")
      .update(`${token}-${rawBody}`, "utf8")
      .digest("hex")
      .toLowerCase();

    try {
      if (
        crypto.timingSafeEqual(
          Buffer.from(expected, "hex"),
          Buffer.from(received, "hex")
        )
      ) {
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
}

/**
 * Fallback: HMAC-SHA256 com um secret compartilhado.
 * Mantido caso alguma integracao futura precise (PagBank legacy, ou outros webhooks).
 */
export function verifyHmacSignature(
  rawBody: string,
  signatureHeader: string | null | undefined
): boolean {
  const secret = process.env.PAGBANK_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const computed = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  const received = signatureHeader.replace(/^sha256=/i, "").trim();
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, "hex"),
      Buffer.from(received, "hex")
    );
  } catch {
    return false;
  }
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export const PAGBANK_WEBHOOK_EVENTS = {
  PAID: "PAID",
  AUTHORIZED: "AUTHORIZED",
  DECLINED: "DECLINED",
  IN_ANALYSIS: "IN_ANALYSIS",
  CANCELED: "CANCELED",
  WAITING: "WAITING",
} as const;
