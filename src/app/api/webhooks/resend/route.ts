import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Webhook do Resend para rastrear o ciclo de vida de cada email apos o envio.
 *
 * Resend usa Svix para assinar webhooks. Headers:
 *   svix-id: identificador unico do evento
 *   svix-timestamp: epoch seconds quando o evento foi gerado
 *   svix-signature: "v1,<base64>" (pode ter multiplas separadas por espaco)
 *
 * Verificacao:
 *   secret = decode(strip "whsec_" prefix da env RESEND_WEBHOOK_SECRET, base64)
 *   sig    = HMAC-SHA256(`${svix-id}.${svix-timestamp}.${rawBody}`, secret)
 *   sig em base64 deve bater com algum dos valores em svix-signature.
 *
 * Eventos relevantes do Resend:
 *   email.sent, email.delivered, email.delivery_delayed,
 *   email.bounced, email.complained, email.opened, email.clicked
 *
 * Mapeamos para email_logs.status com a regra "ultimo evento ganha", exceto que:
 *   - 'clicked' eh o estado mais avancado (nao retrocede)
 *   - eventos de erro (bounced/complained) sempre sobrescrevem
 */

const STATUS_PRIORITY: Record<string, number> = {
  sent: 1,
  delivered: 2,
  opened: 3,
  clicked: 4,
  delivery_delayed: 5,
  complained: 6,
  bounced: 7,
  failed: 8,
};

const EVENT_TO_STATUS: Record<string, string> = {
  "email.sent": "sent",
  "email.delivered": "delivered",
  "email.delivery_delayed": "delivery_delayed",
  "email.bounced": "bounced",
  "email.complained": "complained",
  "email.opened": "opened",
  "email.clicked": "clicked",
};

function verifySvixSignature(
  rawBody: string,
  svixId: string | null,
  svixTimestamp: string | null,
  svixSignature: string | null,
  secretEnv: string
): boolean {
  if (!svixId || !svixTimestamp || !svixSignature) return false;

  const stripped = secretEnv.startsWith("whsec_") ? secretEnv.slice(6) : secretEnv;
  let secretBytes: Buffer;
  try {
    secretBytes = Buffer.from(stripped, "base64");
  } catch {
    return false;
  }

  const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
  const expected = crypto
    .createHmac("sha256", secretBytes)
    .update(signedContent, "utf8")
    .digest("base64");

  // svix-signature pode ter "v1,sig1 v1,sig2 v2,sig3"
  const parts = svixSignature.split(" ").map((p) => p.trim()).filter(Boolean);
  for (const part of parts) {
    const [version, value] = part.split(",");
    if (version !== "v1" || !value) continue;
    try {
      if (
        crypto.timingSafeEqual(
          Buffer.from(expected, "base64"),
          Buffer.from(value, "base64")
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

export async function POST(request: Request) {
  const rawBody = await request.text();
  const headersList = await headers();
  const svixId = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[resend webhook] RESEND_WEBHOOK_SECRET ausente");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  if (!verifySvixSignature(rawBody, svixId, svixTimestamp, svixSignature, secret)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let payload: { type?: string; data?: { email_id?: string } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const type = payload.type ?? "";
  const emailId = payload.data?.email_id;

  if (!emailId) {
    return NextResponse.json({ received: true, ignored: "no_email_id" });
  }

  const newStatus = EVENT_TO_STATUS[type];
  if (!newStatus) {
    return NextResponse.json({ received: true, ignored: `unknown_event_${type}` });
  }

  const supabase = createAdminClient();

  // Le status atual para nao retroceder (ex.: 'clicked' nao volta para 'delivered').
  const { data: current } = await supabase
    .from("email_logs")
    .select("id, status")
    .eq("resend_id", emailId)
    .maybeSingle();

  if (!current) {
    return NextResponse.json({ received: true, ignored: "unknown_email_id" });
  }

  const currentPriority = STATUS_PRIORITY[current.status] ?? 0;
  const newPriority = STATUS_PRIORITY[newStatus] ?? 0;

  // bounced/complained sempre sobrescrevem
  const forceOverwrite = newStatus === "bounced" || newStatus === "complained";

  if (!forceOverwrite && newPriority <= currentPriority) {
    return NextResponse.json({ received: true, ignored: "lower_priority" });
  }

  await supabase
    .from("email_logs")
    .update({ status: newStatus })
    .eq("id", current.id);

  return NextResponse.json({ received: true, status: newStatus });
}
