import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { resend, FROM_EMAIL } from "@/lib/resend";

const KIND_CONFIG = {
  alert: {
    icon: "\u{1F534}", // bolinha vermelha
    template: "admin_alert",
    dedupSeconds: 10 * 60,
  },
  sale: {
    icon: "\u{1F7E2}", // bolinha verde
    template: "admin_sale",
    dedupSeconds: 0, // cada venda eh unica; nao deduplica
  },
} as const;

type Kind = keyof typeof KIND_CONFIG;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function parseRecipients(): string[] {
  const raw = process.env.ALERT_EMAIL ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Dispara um e-mail para os operadores configurados em ALERT_EMAIL
 * (lista separada por virgula). Suporta dois tipos:
 *
 *  - 'alert' (padrao): falhas criticas (webhook quebrado, RPC failing).
 *    Icone vermelho. Dedup 10min por (template, subject) via email_logs.
 *
 *  - 'sale': confirmacao de venda. Icone verde. Sem dedup (cada venda
 *    eh um evento unico — o fluxo de chamada ja garante que so dispara
 *    em transicao previousStatus !== currentStatus).
 *
 * Nunca lanca: notificacao nao deve quebrar o caller.
 */
export async function notifyAdmin(
  supabase: SupabaseClient,
  subject: string,
  body: string,
  options: { kind?: Kind } = {}
): Promise<void> {
  try {
    const recipients = parseRecipients();
    if (recipients.length === 0 || !process.env.RESEND_API_KEY) return;

    const kind = options.kind ?? "alert";
    const cfg = KIND_CONFIG[kind];
    const fullSubject = `${cfg.icon} [ZeloBJJ] ${subject}`;

    if (cfg.dedupSeconds > 0) {
      const since = new Date(Date.now() - cfg.dedupSeconds * 1000).toISOString();
      const { data: recent } = await supabase
        .from("email_logs")
        .select("id")
        .eq("template", cfg.template)
        .eq("subject", fullSubject)
        .eq("status", "sent")
        .gte("created_at", since)
        .limit(1)
        .maybeSingle();
      if (recent) return;
    }

    const html = `<pre style="font-family: ui-monospace, Menlo, monospace; white-space: pre-wrap; background: #f6f8fa; padding: 16px; border-radius: 8px;">${escapeHtml(body)}</pre>`;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipients,
      subject: fullSubject,
      html,
    });

    await supabase.from("email_logs").insert({
      to_email: recipients.join(","),
      subject: fullSubject,
      template: cfg.template,
      status: result?.error ? "failed" : "sent",
      resend_id: (result?.data?.id as string | undefined) ?? null,
    });
  } catch (err) {
    console.error("[notifyAdmin] erro ao enviar notificacao:", err);
  }
}
