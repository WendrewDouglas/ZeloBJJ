// Configura Site URL, redirect URLs e templates de email do Supabase Auth em portugues.
// Uso:
//   SUPABASE_PAT=sbp_xxx PROJECT_REF=iqmokjhxfwyvxfllxcps SITE_URL=https://zelobjj.com.br node scripts/supabase-auth-branding.mjs

const PAT = process.env.SUPABASE_PAT;
const REF = process.env.PROJECT_REF;
const SITE_URL = process.env.SITE_URL;
if (!PAT || !REF || !SITE_URL) {
  console.error("SUPABASE_PAT, PROJECT_REF e SITE_URL sao obrigatorios");
  process.exit(1);
}

const BASE = "https://api.supabase.com/v1";
const headers = { Authorization: `Bearer ${PAT}`, "Content-Type": "application/json" };

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} => ${res.status} ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : null;
}

const LOGO_URL = `${SITE_URL}/logo.png`;
const SUPPORT_URL = "https://wa.me/5518981328589";
const BRAND_GOLD = "#c5a028";
const BRAND_DARK = "#0a0a0a";
const BRAND_DARK2 = "#1e1e1e";

function layout({ preheader, heading, bodyHtml, ctaText, ctaUrl, footerNote }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Zelo BJJ</title>
</head>
<body style="margin:0;padding:0;background:${BRAND_DARK};font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#e5e5e5;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_DARK};">
  <tr><td align="center" style="padding:24px 16px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${BRAND_DARK2};border:1px solid rgba(255,255,255,0.06);border-radius:16px;overflow:hidden;">
      <tr>
        <td align="center" style="padding:36px 24px 12px;border-bottom:1px solid rgba(255,255,255,0.06);">
          <img src="${LOGO_URL}" alt="Zelo BJJ" width="64" height="64" style="display:block;border:0;">
          <div style="margin-top:12px;font-size:20px;font-weight:800;letter-spacing:2px;color:#ffffff;">
            ZELO <span style="color:${BRAND_GOLD};">BJJ</span>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:32px 32px 24px;">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">${heading}</h1>
          <div style="font-size:15px;line-height:1.6;color:#cfcfcf;">${bodyHtml}</div>
          ${ctaUrl ? `
          <div style="margin:28px 0 8px;">
            <a href="${ctaUrl}" style="display:inline-block;background:${BRAND_GOLD};color:#0a0a0a;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:999px;font-size:15px;">${ctaText}</a>
          </div>
          <p style="font-size:12px;color:#9a9a9a;margin:12px 0 0;line-height:1.5;">
            Se o botao nao funcionar, copie e cole este link no seu navegador:<br>
            <a href="${ctaUrl}" style="color:${BRAND_GOLD};word-break:break-all;">${ctaUrl}</a>
          </p>` : ""}
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px 32px;border-top:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0;font-size:12px;color:#8a8a8a;line-height:1.6;">
            ${footerNote ?? "Se voce nao solicitou este email, pode ignora-lo com seguranca."}
          </p>
          <p style="margin:14px 0 0;font-size:12px;color:#8a8a8a;">
            Precisa de ajuda? <a href="${SUPPORT_URL}" style="color:${BRAND_GOLD};text-decoration:none;">Fale com a gente no WhatsApp</a>
          </p>
          <p style="margin:18px 0 0;font-size:11px;color:#6a6a6a;">
            &copy; 2026 Zelo BJJ &middot; <a href="${SITE_URL}" style="color:#6a6a6a;text-decoration:none;">${SITE_URL.replace(/^https?:\/\//, "")}</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

const confirmation = layout({
  preheader: "Confirme seu email para liberar o acesso ao curso de Jiu-Jitsu.",
  heading: "Confirme seu e-mail",
  bodyHtml: `
    <p style="margin:0 0 12px;">Ola!</p>
    <p style="margin:0 0 12px;">Seja bem-vindo a <strong>Zelo BJJ</strong>. Para ativar sua conta e liberar o acesso a area do aluno, clique no botao abaixo:</p>
  `,
  ctaText: "Confirmar meu e-mail",
  ctaUrl: "{{ .ConfirmationURL }}",
  footerNote: "Se voce nao criou uma conta na Zelo BJJ, pode ignorar este e-mail.",
});

const recovery = layout({
  preheader: "Redefina a senha da sua conta Zelo BJJ.",
  heading: "Redefinir senha",
  bodyHtml: `
    <p style="margin:0 0 12px;">Recebemos um pedido para redefinir a senha da sua conta na <strong>Zelo BJJ</strong>.</p>
    <p style="margin:0 0 12px;">Clique no botao abaixo para criar uma nova senha. O link expira em 1 hora.</p>
  `,
  ctaText: "Redefinir minha senha",
  ctaUrl: "{{ .ConfirmationURL }}",
  footerNote: "Se voce nao solicitou a redefinicao, pode ignorar este e-mail com seguranca.",
});

const magic = layout({
  preheader: "Seu link de acesso a Zelo BJJ.",
  heading: "Entrar na Zelo BJJ",
  bodyHtml: `
    <p style="margin:0 0 12px;">Clique no botao abaixo para entrar na sua conta. O link expira em 1 hora e so pode ser usado uma vez.</p>
  `,
  ctaText: "Entrar agora",
  ctaUrl: "{{ .ConfirmationURL }}",
  footerNote: "Se voce nao solicitou este acesso, ignore este e-mail.",
});

const invite = layout({
  preheader: "Voce foi convidado para a Zelo BJJ.",
  heading: "Voce foi convidado",
  bodyHtml: `
    <p style="margin:0 0 12px;">Voce recebeu um convite para fazer parte da <strong>Zelo BJJ</strong>.</p>
    <p style="margin:0 0 12px;">Clique no botao abaixo para criar sua senha e comecar.</p>
  `,
  ctaText: "Criar minha conta",
  ctaUrl: "{{ .ConfirmationURL }}",
  footerNote: "Se voce nao esperava este convite, pode ignora-lo com seguranca.",
});

const emailChange = layout({
  preheader: "Confirme o novo e-mail na sua conta Zelo BJJ.",
  heading: "Confirme seu novo e-mail",
  bodyHtml: `
    <p style="margin:0 0 12px;">Recebemos um pedido para alterar o e-mail da sua conta.</p>
    <p style="margin:0 0 12px;">Clique no botao abaixo para confirmar a mudanca. Se voce nao solicitou essa alteracao, entre em contato imediatamente.</p>
  `,
  ctaText: "Confirmar novo e-mail",
  ctaUrl: "{{ .ConfirmationURL }}",
});

const config = {
  site_url: SITE_URL,
  uri_allow_list: [
    `${SITE_URL}/**`,
    "http://localhost:3000/**",
  ].join(","),

  mailer_subjects_confirmation: "Confirme seu e-mail - Zelo BJJ",
  mailer_templates_confirmation_content: confirmation,

  mailer_subjects_recovery: "Redefinir senha - Zelo BJJ",
  mailer_templates_recovery_content: recovery,

  mailer_subjects_magic_link: "Seu link de acesso - Zelo BJJ",
  mailer_templates_magic_link_content: magic,

  mailer_subjects_invite: "Voce foi convidado - Zelo BJJ",
  mailer_templates_invite_content: invite,

  mailer_subjects_email_change: "Confirme seu novo e-mail - Zelo BJJ",
  mailer_templates_email_change_content: emailChange,
};

const result = await api("PATCH", `/projects/${REF}/config/auth`, config);
console.log("OK. site_url:", result.site_url);
console.log("uri_allow_list:", result.uri_allow_list);
