// Sincroniza env vars na Vercel via API REST.
// Remove STRIPE_* e adiciona/atualiza as PAGBANK_* em Production.
// Uso:
//   VERCEL_TOKEN=xxx PAGBANK_USER=xxx PAGBANK_PASS=xxx PAGBANK_API_TOKEN=xxx node scripts/vercel-sync-env.mjs

const TEAM_ID = "team_4ZlVBoqyLDrL6kdoAQsIV3kU";
const PROJECT_ID = "prj_tgDEOqShdcdMyAEHrGbtzc7oTZhI";
const BASE = "https://api.vercel.com";

const token = process.env.VERCEL_TOKEN;
if (!token) {
  console.error("VERCEL_TOKEN nao definido");
  process.exit(1);
}

const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

async function api(method, path, body) {
  const url = `${BASE}${path}${path.includes("?") ? "&" : "?"}teamId=${TEAM_ID}`;
  const res = await fetch(url, {
    method,
    headers: auth,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} => ${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

const DESIRED = {
  PAGBANK_WEBHOOK_USERNAME: process.env.PAGBANK_USER,
  PAGBANK_WEBHOOK_PASSWORD: process.env.PAGBANK_PASS,
  PAGBANK_API_TOKEN: process.env.PAGBANK_API_TOKEN,
};

for (const [k, v] of Object.entries(DESIRED)) {
  if (!v) {
    console.error(`Falta ${k}`);
    process.exit(1);
  }
}

// 1) Lista envs atuais
const list = await api("GET", `/v9/projects/${PROJECT_ID}/env?decrypt=false`);
const envs = list.envs ?? list; // SDK retorna diferente em versoes
console.log(`Envs atuais: ${envs.length}`);

// 2) Remove STRIPE_* e NEXT_PUBLIC_STRIPE_*
const toDelete = envs.filter(
  (e) => e.key?.startsWith("STRIPE_") || e.key?.startsWith("NEXT_PUBLIC_STRIPE_")
);
for (const e of toDelete) {
  console.log(`- removendo ${e.key} (${e.id})`);
  await api("DELETE", `/v9/projects/${PROJECT_ID}/env/${e.id}`);
}

// 3) Remove envs PagBank antigas (pra fazer upsert limpo)
const toReplace = envs.filter((e) => Object.prototype.hasOwnProperty.call(DESIRED, e.key ?? ""));
for (const e of toReplace) {
  console.log(`- substituindo ${e.key} (${e.id})`);
  await api("DELETE", `/v9/projects/${PROJECT_ID}/env/${e.id}`);
}

// 4) Cria as 3 novas envs em Production
for (const [key, value] of Object.entries(DESIRED)) {
  console.log(`+ criando ${key}`);
  await api("POST", `/v10/projects/${PROJECT_ID}/env?upsert=true`, {
    key,
    value,
    target: ["production"],
    type: "encrypted",
  });
}

console.log("OK");
