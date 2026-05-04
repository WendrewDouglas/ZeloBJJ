import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { resend, FROM_EMAIL } from "@/lib/resend";

const TEMPLATE_KEY = "admin_alert";
const DEDUP_WINDOW_SECONDS = 10 * 60;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Dispara um e-mail para o operador (ALERT_EMAIL) quando algo critico acontece
 * em background — webhook PagBank falhando, RPC quebrada, etc.
 *
 * Dedup por (template=admin_alert, subject) numa janela de 10 minutos via
 * email_logs, para evitar spam quando o PagBank reenvia o mesmo webhook varias
 * vezes durante uma indisponibilidade.
 *
 * Nunca lanca: alerta nao deve quebrar o caller.
 */
export async function notifyAdmin(
  supabase: SupabaseClient,
  subject: string,
  body: string
): Promise<void> {
  try {
    const adminEmail = process.env.ALERT_EMAIL;
    if (!adminEmail || !process.env.RESEND_API_KEY) return;

    const since = new Date(Date.now() - DEDUP_WINDOW_SECONDS * 1000).toISOString();
    const { data: recent } = await supabase
      .from("email_logs")
      .select("id")
      .eq("template", TEMPLATE_KEY)
      .eq("subject", subject)
      .eq("status", "sent")
      .gte("created_at", since)
      .limit(1)
      .maybeSingle();
    if (recent) return;

    const html = `<pre style="font-family: ui-monospace, Menlo, monospace; white-space: pre-wrap; background: #f6f8fa; padding: 16px; border-radius: 8px;">${escapeHtml(body)}</pre>`;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `[ZeloBJJ] ${subject}`,
      html,
    });

    await supabase.from("email_logs").insert({
      to_email: adminEmail,
      subject: `[ZeloBJJ] ${subject}`,
      template: TEMPLATE_KEY,
      status: result?.error ? "failed" : "sent",
      resend_id: (result?.data?.id as string | undefined) ?? null,
    });
  } catch (err) {
    console.error("[notifyAdmin] erro ao enviar alerta:", err);
  }
}
