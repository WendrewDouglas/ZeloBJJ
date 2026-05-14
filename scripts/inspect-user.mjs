// Read-only: inspeciona estado de cadastro/assinatura/email de um usuario.
// Uso: node scripts/inspect-user.mjs <email>

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const envFile = readFileSync(".env.local", "utf8");
for (const line of envFile.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.argv[2] || "").toLowerCase().trim();

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("faltam SUPABASE_URL/SERVICE_KEY");
  process.exit(1);
}
if (!email) {
  console.error("uso: node scripts/inspect-user.mjs <email>");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log(`\n=== inspecao: ${email} ===\n`);

// 1) auth user
const { data: authList, error: authErr } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (authErr) { console.error("auth.listUsers:", authErr); process.exit(1); }
const authUser = authList.users.find((u) => (u.email || "").toLowerCase() === email);
console.log("[auth.users]", authUser ? {
  id: authUser.id,
  email: authUser.email,
  email_confirmed_at: authUser.email_confirmed_at,
  created_at: authUser.created_at,
  last_sign_in_at: authUser.last_sign_in_at,
} : "(nao encontrado)");

if (!authUser) {
  console.log("\nUsuario NAO existe em auth.users. Provavelmente nunca completou cadastro.");
  process.exit(0);
}
const userId = authUser.id;

// 2) profile
const { data: profile } = await sb
  .from("profiles")
  .select("id, email, full_name, role, locale, welcome_email_sent_at, created_at")
  .eq("id", userId)
  .maybeSingle();
console.log("\n[profiles]", profile ?? "(nao encontrado)");

// 3) subscriptions
const { data: subs } = await sb
  .from("subscriptions")
  .select("id, plan_id, status, pagbank_subscription_id, pagbank_reference_id, pagbank_last_charge_id, paid_at, created_at, updated_at")
  .eq("user_id", userId);
console.log("\n[subscriptions]", subs ?? []);

// 4) enrollments
const { data: enrolls } = await sb
  .from("enrollments")
  .select("course_id, plan_id, is_active, expires_at, enrolled_at")
  .eq("user_id", userId);
console.log("\n[enrollments]", enrolls ?? []);

// 5) email_logs (ultimos 20)
const { data: emails } = await sb
  .from("email_logs")
  .select("template, status, subject, to_email, created_at, resend_id")
  .or(`user_id.eq.${userId},to_email.eq.${email}`)
  .order("created_at", { ascending: false })
  .limit(20);
console.log("\n[email_logs]", emails ?? []);

// 6) audit_logs (ultimos 30)
const { data: audit } = await sb
  .from("audit_logs")
  .select("action, entity_type, entity_id, metadata, created_at")
  .eq("user_id", userId)
  .order("created_at", { ascending: false })
  .limit(30);
console.log("\n[audit_logs user]", audit ?? []);

// 7) audit_logs nao atribuidos com email/reference parecidos
const { data: unattr } = await sb
  .from("audit_logs")
  .select("action, entity_id, metadata, created_at")
  .eq("action", "pagbank.webhook.unattributed")
  .order("created_at", { ascending: false })
  .limit(50);
const filtered = (unattr ?? []).filter((r) => {
  const md = r.metadata || {};
  return (md.email || "").toLowerCase() === email;
});
console.log("\n[audit_logs unattributed para esse email]", filtered);

// 8) plano vigente
const { data: plan } = await sb
  .from("plans")
  .select("id, slug, name, is_active, payment_link")
  .eq("is_active", true)
  .order("sort_order", { ascending: true })
  .limit(1)
  .single();
console.log("\n[plano ativo]", plan);
