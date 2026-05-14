// Libera acesso manual ao curso para um aluno + envia email "payment_approved".
// Uso (dry-run):  node scripts/grant-access.mjs <email>
// Uso (execucao): node scripts/grant-access.mjs <email> --confirm

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { readFileSync } from "node:fs";

// Carrega .env.local manualmente (evita dependencia de dotenv).
try {
  const envFile = readFileSync(".env.local", "utf8");
  for (const line of envFile.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "contato@zelobjj.com.br";
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://zelobjj.com.br").replace(/\/$/, "");

const email = (process.argv[2] || "").toLowerCase().trim();
const confirm = process.argv.includes("--confirm");

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("faltam NEXT_PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!RESEND_KEY) {
  console.error("falta RESEND_API_KEY");
  process.exit(1);
}
if (!email) {
  console.error("uso: node scripts/grant-access.mjs <email> [--confirm]");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const resend = new Resend(RESEND_KEY);

console.log(`\n=== grant-access: ${email} ${confirm ? "" : "(DRY-RUN, sem --confirm)"} ===\n`);

// 1) Resolver user
const { data: authList, error: authErr } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (authErr) { console.error("auth.listUsers:", authErr); process.exit(1); }
const authUser = authList.users.find((u) => (u.email || "").toLowerCase() === email);
if (!authUser) { console.error("usuario nao existe em auth.users"); process.exit(1); }
const userId = authUser.id;
console.log(`user_id: ${userId}`);

const { data: profile } = await sb
  .from("profiles")
  .select("id, email, full_name, locale")
  .eq("id", userId)
  .single();
if (!profile) { console.error("profile nao encontrado"); process.exit(1); }
console.log(`profile: ${profile.full_name} (${profile.email}) locale=${profile.locale}`);

// 2) Plano vigente
const { data: plan } = await sb
  .from("plans")
  .select("id, slug, name, payment_link")
  .eq("is_active", true)
  .order("sort_order", { ascending: true })
  .limit(1)
  .single();
if (!plan) { console.error("nenhum plano ativo"); process.exit(1); }
console.log(`plano: ${plan.name} (${plan.slug}) -> ${plan.id}`);

// 3) Cursos publicados
const { data: courses } = await sb
  .from("courses")
  .select("id, title")
  .eq("is_published", true);
console.log(`cursos publicados: ${courses.length}`);
for (const c of courses) console.log(`  - ${c.title} (${c.id})`);

if (!confirm) {
  console.log("\n(dry-run) Para executar de fato: node scripts/grant-access.mjs " + email + " --confirm");
  process.exit(0);
}

// 4) Subscription paid
const now = new Date().toISOString();
const pagbankSubId = `MANUAL_GRANT_${Date.now()}`;
const refId = `USER_${userId}__PLAN_${plan.slug}`;

const { error: subErr } = await sb.from("subscriptions").upsert(
  {
    user_id: userId,
    plan_id: plan.id,
    pagbank_subscription_id: pagbankSubId,
    pagbank_reference_id: refId,
    status: "paid",
    paid_at: now,
  },
  { onConflict: "user_id,plan_id" }
);
if (subErr) { console.error("subscription:", subErr); process.exit(1); }
console.log(`\n[ok] subscription -> paid (${pagbankSubId})`);

// 5) Enrollments
const enrollments = courses.map((c) => ({
  user_id: userId,
  course_id: c.id,
  plan_id: plan.id,
  is_active: true,
  expires_at: null,
}));
const { error: enrErr } = await sb
  .from("enrollments")
  .upsert(enrollments, { onConflict: "user_id,course_id" });
if (enrErr) { console.error("enrollments:", enrErr); process.exit(1); }
console.log(`[ok] enrollments: ${enrollments.length} curso(s)`);

// 6) Audit log
await sb.from("audit_logs").insert({
  user_id: userId,
  action: "manual.grant_access",
  entity_type: "subscription",
  entity_id: pagbankSubId,
  metadata: {
    reason: "liberacao manual solicitada pelo admin",
    plan_id: plan.id,
    plan_slug: plan.slug,
    courses: courses.map((c) => c.id),
    granted_at: now,
  },
});
console.log("[ok] audit_logs -> manual.grant_access");

// 7) Email payment_approved (replica do template TS, locale pt)
const firstName = (profile.full_name || "").split(" ")[0] || "aluno";
const subject = "Pagamento aprovado — acesso liberado";
const preheader = "Sua compra foi confirmada e o acesso ao curso ja esta liberado.";
const heading = `Pagamento aprovado, ${firstName}!`;
const paidAtFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit",
  timeZone: "America/Sao_Paulo",
}).format(new Date(now));

const BRAND_GOLD = "#c5a028";
const BRAND_DARK = "#0a0a0a";
const BRAND_DARK2 = "#1e1e1e";
const SUPPORT_URL = "https://wa.me/5518981328589";
const logoUrl = `${APP_URL}/logo.png`;
const ctaUrl = `${APP_URL}/dashboard?welcome=1`;

const receiptHtml = `
  <div style="margin:20px 0;padding:16px 18px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;">
    <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:1px;color:${BRAND_GOLD};text-transform:uppercase;">Recibo</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;">
      <tr><td style="padding:4px 0;color:#9a9a9a;width:120px;">Plano</td><td style="padding:4px 0;color:#ffffff;">${plan.name}</td></tr>
      <tr><td style="padding:4px 0;color:#9a9a9a;">Pago em</td><td style="padding:4px 0;color:#ffffff;">${paidAtFmt}</td></tr>
    </table>
  </div>
`;

const bodyHtml = `
  <p style="margin:0 0 12px;">Recebemos seu pagamento e seu acesso a <strong>Zelo BJJ</strong> esta liberado.</p>
  <p style="margin:0 0 12px;">Voce pode comecar a estudar agora pelo modulo 1 — recomendamos seguir a ordem das aulas para evoluir sem pular etapas.</p>
  ${receiptHtml}
  <p style="margin:16px 0 0;">Este e-mail serve como comprovante. Guarde-o ou consulte seu historico no dashboard.</p>
`;

const html = `<!DOCTYPE html>
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
          <div style="margin:28px 0 8px;">
            <a href="${ctaUrl}" style="display:inline-block;background:${BRAND_GOLD};color:#0a0a0a;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:999px;font-size:15px;">Acessar minha primeira aula</a>
          </div>
          <p style="font-size:12px;color:#9a9a9a;margin:12px 0 0;line-height:1.5;">
            Se o botao nao funcionar, copie e cole este link no seu navegador:<br>
            <a href="${ctaUrl}" style="color:${BRAND_GOLD};word-break:break-all;">${ctaUrl}</a>
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px 32px;border-top:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0;font-size:12px;color:#8a8a8a;line-height:1.6;">
            Se voce nao esperava este e-mail, pode ignora-lo com seguranca.
          </p>
          <p style="margin:14px 0 0;font-size:12px;color:#8a8a8a;">
            <a href="${SUPPORT_URL}" style="color:${BRAND_GOLD};text-decoration:none;">Precisa de ajuda? Fale com a gente no WhatsApp</a>
          </p>
          <p style="margin:18px 0 0;font-size:11px;color:#6a6a6a;">
            © 2026 Zelo BJJ &middot; <a href="${APP_URL}" style="color:#6a6a6a;text-decoration:none;">${APP_URL.replace(/^https?:\/\//, "")}</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

const sendResult = await resend.emails.send({
  from: FROM_EMAIL,
  to: profile.email,
  subject,
  html,
});

if (sendResult.error) {
  console.error("[email] Resend erro:", sendResult.error);
  await sb.from("email_logs").insert({
    user_id: userId,
    to_email: profile.email,
    subject,
    template: "payment_approved",
    status: "failed",
    resend_id: null,
  });
  process.exit(1);
}

const resendId = sendResult.data?.id ?? null;
await sb.from("email_logs").insert({
  user_id: userId,
  to_email: profile.email,
  subject,
  template: "payment_approved",
  status: "sent",
  resend_id: resendId,
});
console.log(`[ok] email payment_approved enviado (resend_id=${resendId})`);

console.log("\n=== ACESSO LIBERADO ===");
console.log(`Aluno:  ${profile.full_name} <${profile.email}>`);
console.log(`Plano:  ${plan.name}`);
console.log(`Cursos: ${courses.length}`);
