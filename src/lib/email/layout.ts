import "server-only";
import type { EmailLayoutInput } from "@/types/email";
import type { Locale } from "@/i18n/routing";

const BRAND_GOLD = "#c5a028";
const BRAND_DARK = "#0a0a0a";
const BRAND_DARK2 = "#1e1e1e";
const SUPPORT_URL = "https://wa.me/5518981328589";

const FOOTER_COPY: Record<Locale, { help: string; rights: string; ignore: string }> = {
  pt: {
    help: "Precisa de ajuda? Fale com a gente no WhatsApp",
    rights: "© 2026 Zelo BJJ",
    ignore: "Se você não esperava este e-mail, pode ignorá-lo com segurança.",
  },
  en: {
    help: "Need help? Talk to us on WhatsApp",
    rights: "© 2026 Zelo BJJ",
    ignore: "If you weren't expecting this email, you can safely ignore it.",
  },
  ko: {
    help: "도움이 필요하신가요? WhatsApp으로 문의해 주세요",
    rights: "© 2026 Zelo BJJ",
    ignore: "이 이메일을 기대하지 않으셨다면 안전하게 무시하셔도 됩니다.",
  },
};

function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://zelobjj.com.br"
  );
}

export function appUrl(path = ""): string {
  const base = getAppUrl();
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function localePrefix(locale: Locale): string {
  return locale === "pt" ? "" : `/${locale}`;
}

export function localizedAppUrl(locale: Locale, path = ""): string {
  return appUrl(`${localePrefix(locale)}${path}`);
}

export function renderLayout(input: EmailLayoutInput): string {
  const { locale, preheader, heading, bodyHtml, ctaText, ctaUrl, footerNote } = input;
  const copy = FOOTER_COPY[locale] ?? FOOTER_COPY.pt;
  const logoUrl = appUrl("/logo.png");
  const siteUrl = getAppUrl();
  const siteHost = siteUrl.replace(/^https?:\/\//, "");
  const langAttr = locale === "pt" ? "pt-BR" : locale;

  const ctaBlock = ctaUrl && ctaText
    ? `
          <div style="margin:28px 0 8px;">
            <a href="${ctaUrl}" style="display:inline-block;background:${BRAND_GOLD};color:#0a0a0a;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:999px;font-size:15px;">${ctaText}</a>
          </div>
          <p style="font-size:12px;color:#9a9a9a;margin:12px 0 0;line-height:1.5;">
            ${locale === "en" ? "If the button doesn't work, paste this link into your browser:" : locale === "ko" ? "버튼이 작동하지 않으면 이 링크를 브라우저에 붙여넣으세요:" : "Se o botão não funcionar, copie e cole este link no seu navegador:"}<br>
            <a href="${ctaUrl}" style="color:${BRAND_GOLD};word-break:break-all;">${ctaUrl}</a>
          </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="${langAttr}">
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
          <img src="${logoUrl}" alt="Zelo BJJ" width="64" height="64" style="display:block;border:0;">
          <div style="margin-top:12px;font-size:20px;font-weight:800;letter-spacing:2px;color:#ffffff;">
            ZELO <span style="color:${BRAND_GOLD};">BJJ</span>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:32px 32px 24px;">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">${heading}</h1>
          <div style="font-size:15px;line-height:1.6;color:#cfcfcf;">${bodyHtml}</div>
          ${ctaBlock}
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px 32px;border-top:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0;font-size:12px;color:#8a8a8a;line-height:1.6;">
            ${footerNote ?? copy.ignore}
          </p>
          <p style="margin:14px 0 0;font-size:12px;color:#8a8a8a;">
            <a href="${SUPPORT_URL}" style="color:${BRAND_GOLD};text-decoration:none;">${copy.help}</a>
          </p>
          <p style="margin:18px 0 0;font-size:11px;color:#6a6a6a;">
            ${copy.rights} &middot; <a href="${siteUrl}" style="color:#6a6a6a;text-decoration:none;">${siteHost}</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
