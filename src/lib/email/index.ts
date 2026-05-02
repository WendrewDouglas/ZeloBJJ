import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { routing, type Locale } from "@/i18n/routing";
import type { EmailTemplate, EmailRender, PaymentFailedReason } from "@/types/email";
import { welcomeTemplate, type WelcomeTemplateParams } from "@/lib/email/templates/welcome";
import {
  paymentApprovedTemplate,
  type PaymentApprovedTemplateParams,
} from "@/lib/email/templates/payment-approved";
import {
  paymentPendingTemplate,
  type PaymentPendingTemplateParams,
} from "@/lib/email/templates/payment-pending";
import {
  paymentFailedTemplate,
  type PaymentFailedTemplateParams,
} from "@/lib/email/templates/payment-failed";

type AnySupabase = SupabaseClient;

type SendEmailParamsByTemplate = {
  welcome: WelcomeTemplateParams;
  payment_approved: PaymentApprovedTemplateParams;
  payment_pending: PaymentPendingTemplateParams;
  payment_failed: PaymentFailedTemplateParams;
};

interface SendEmailArgs<T extends EmailTemplate> {
  supabase: AnySupabase;
  userId: string | null;
  toEmail: string;
  locale: string | null | undefined;
  template: T;
  params: SendEmailParamsByTemplate[T];
  /**
   * Quando definido, ignora o envio se houver email_logs com mesmo (user_id, template, status='sent')
   * criado nos ultimos N segundos. Default depende do template.
   */
  dedupWindowSeconds?: number;
  /**
   * Discriminador opcional usado no nome efetivo do template em email_logs (ex.: payment_failed:declined).
   * Permite reenviar payment_failed com motivo diferente (declined vs refunded) sem hit de dedup.
   */
  variant?: PaymentFailedReason;
}

const DEFAULT_DEDUP_SECONDS: Record<EmailTemplate, number> = {
  welcome: 60 * 60 * 24 * 365, // praticamente unico (idempotencia tambem por profiles.welcome_email_sent_at)
  payment_approved: 60 * 60 * 24 * 365, // unico por usuario+plano
  payment_pending: 60 * 60 * 24, // 1x por dia
  payment_failed: 60 * 60, // 1x por hora por motivo
};

function resolveLocale(locale: string | null | undefined): Locale {
  if (!locale) return routing.defaultLocale;
  return (routing.locales as readonly string[]).includes(locale)
    ? (locale as Locale)
    : routing.defaultLocale;
}

function renderTemplate<T extends EmailTemplate>(
  template: T,
  locale: Locale,
  params: SendEmailParamsByTemplate[T]
): EmailRender {
  switch (template) {
    case "welcome":
      return welcomeTemplate({
        ...(params as WelcomeTemplateParams),
        locale,
      });
    case "payment_approved":
      return paymentApprovedTemplate({
        ...(params as PaymentApprovedTemplateParams),
        locale,
      });
    case "payment_pending":
      return paymentPendingTemplate({
        ...(params as PaymentPendingTemplateParams),
        locale,
      });
    case "payment_failed":
      return paymentFailedTemplate({
        ...(params as PaymentFailedTemplateParams),
        locale,
      });
    default:
      throw new Error(`Unknown email template: ${String(template)}`);
  }
}

function effectiveTemplateKey(template: EmailTemplate, variant?: PaymentFailedReason): string {
  return variant ? `${template}:${variant}` : template;
}

/**
 * Envia um e-mail transacional pelo Resend e registra em email_logs.
 *
 * Garantias:
 * - Nunca lanca; retorna { sent: boolean, reason?: string } para o caller decidir o que fazer.
 * - Deduplica por (user_id, template, dedupWindowSeconds). welcome eh dedup adicional pelo
 *   profiles.welcome_email_sent_at (definido pelo caller).
 * - Resolve template invalido / locale invalido cain do em fallback (pt).
 */
export async function sendEmail<T extends EmailTemplate>(
  args: SendEmailArgs<T>
): Promise<{ sent: boolean; reason?: string; resendId?: string }> {
  const {
    supabase,
    userId,
    toEmail,
    locale,
    template,
    params,
    dedupWindowSeconds,
    variant,
  } = args;

  const effectiveLocale = resolveLocale(locale);
  const effectiveTemplate = effectiveTemplateKey(template, variant);
  const dedupSeconds = dedupWindowSeconds ?? DEFAULT_DEDUP_SECONDS[template];

  if (!toEmail) {
    return { sent: false, reason: "missing_to_email" };
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn(`[email] RESEND_API_KEY ausente — pulando envio de ${effectiveTemplate} para ${toEmail}`);
    await safeLog(supabase, {
      userId,
      toEmail,
      subject: "(skipped: missing RESEND_API_KEY)",
      template: effectiveTemplate,
      status: "skipped",
      resendId: null,
    });
    return { sent: false, reason: "no_api_key" };
  }

  // Dedup: ja enviamos esse template (com a mesma variante) recentemente para esse user?
  if (userId && dedupSeconds > 0) {
    const since = new Date(Date.now() - dedupSeconds * 1000).toISOString();
    const { data: recent } = await supabase
      .from("email_logs")
      .select("id, created_at")
      .eq("user_id", userId)
      .eq("template", effectiveTemplate)
      .eq("status", "sent")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recent?.id) {
      return { sent: false, reason: "dedup_recent_send" };
    }
  }

  let render: EmailRender;
  try {
    render = renderTemplate(template, effectiveLocale, params);
  } catch (err) {
    console.error(`[email] erro ao renderizar template ${effectiveTemplate}:`, err);
    return { sent: false, reason: "render_failed" };
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: render.subject,
      html: render.html,
    });

    const resendId = (result?.data?.id as string | undefined) ?? null;

    if (result?.error) {
      console.error(`[email] Resend erro (${effectiveTemplate} → ${toEmail}):`, result.error);
      await safeLog(supabase, {
        userId,
        toEmail,
        subject: render.subject,
        template: effectiveTemplate,
        status: "failed",
        resendId: null,
      });
      return { sent: false, reason: "resend_error" };
    }

    await safeLog(supabase, {
      userId,
      toEmail,
      subject: render.subject,
      template: effectiveTemplate,
      status: "sent",
      resendId,
    });

    return { sent: true, resendId: resendId ?? undefined };
  } catch (err) {
    console.error(`[email] excecao ao enviar ${effectiveTemplate}:`, err);
    await safeLog(supabase, {
      userId,
      toEmail,
      subject: render.subject,
      template: effectiveTemplate,
      status: "failed",
      resendId: null,
    });
    return { sent: false, reason: "exception" };
  }
}

interface LogArgs {
  userId: string | null;
  toEmail: string;
  subject: string;
  template: string;
  status: "sent" | "failed" | "skipped";
  resendId: string | null;
}

async function safeLog(supabase: AnySupabase, log: LogArgs): Promise<void> {
  try {
    await supabase.from("email_logs").insert({
      user_id: log.userId,
      to_email: log.toEmail,
      subject: log.subject,
      template: log.template,
      status: log.status,
      resend_id: log.resendId,
    });
  } catch (err) {
    console.error("[email] falha ao gravar email_logs:", err);
  }
}
