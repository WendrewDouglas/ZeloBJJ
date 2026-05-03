# Migração PagBank: link pag.ae estático → API V4 Checkout

## Contexto

Hoje o checkout (`src/app/api/checkout/route.ts`) redireciona o aluno para o link `https://pag.ae/81KNTg9Kt` (PagBank). Esse modelo:
- ❌ Não dispara webhook (PagBank ignora a aplicação cadastrada quando a venda vem de pag.ae estático).
- ❌ Não tem return URL configurável (cliente fica preso na tela do PagBank).
- ❌ Toda venda exige regularize manual via `POST /api/admin/regularize`.

Migração planejada: usar `POST https://api.pagseguro.com/checkouts` (API V4 hospedada). Vantagens:
- ✅ `notification_urls` dispara webhook por venda.
- ✅ `redirect_url` traz o aluno de volta a `/obrigado` com `?transaction_id=...`.
- ✅ `reference_id` customizado correlaciona webhook → user/plan automaticamente.

## Bloqueio atual

Em 03/05/2026 testamos a chamada e o PagBank devolveu:

```json
{
  "errors": [
    { "error": "allowlist_access_required", "description": "Allowlist access required. Contact PagBank." }
  ]
}
```

A conta (Wendrew/zelo-bjj, token V4 já válido) precisa de **liberação manual pelo suporte PagBank** para usar o endpoint `/checkouts`.

## O que está pronto

- `src/lib/pagbank/api.ts` — função `createPagbankCheckout({ referenceId, customer, items, notificationUrl, paymentNotificationUrl, redirectUrl })` retornando `{ id, payUrl, raw }`. Arquivo já no repo, ainda não importado em lugar nenhum (zero efeito em runtime).
- A `aplicação zelo-bjj` já está cadastrada no painel PagBank com:
  - URL de notificação: `https://zelobjj.com.br/api/webhooks/pagbank`
  - URL de redirecionamento: `https://zelobjj.com.br/obrigado`
  - Redirecionamento com código da transação: ATIVADO

## Como ativar quando o PagBank liberar

Trocar `src/app/api/checkout/route.ts` para usar `createPagbankCheckout` em vez de `buildCheckoutUrl`. Diff esperado (resumido):

```diff
-import { buildCheckoutUrl, buildReferenceId } from "@/lib/pagbank";
+import { buildReferenceId } from "@/lib/pagbank";
+import { createPagbankCheckout } from "@/lib/pagbank/api";

-    const { data: plan } = await supabase.from("plans")
-      .select("id, slug, payment_link")
+    const { data: plan } = await supabase.from("plans")
+      .select("id, slug, name, price_monthly")

-    const url = buildCheckoutUrl(plan.payment_link, reference, profile?.email ?? user.email);
+    const checkout = await createPagbankCheckout({
+      referenceId: reference,
+      customer: profile?.email ? { name: profile.full_name ?? "Aluno", email: profile.email } : undefined,
+      items: [{ name: plan.name, quantity: 1, unit_amount: Math.round(parseFloat(plan.price_monthly) * 100) }],
+      notificationUrl: `${appUrl}/api/webhooks/pagbank`,
+      paymentNotificationUrl: `${appUrl}/api/webhooks/pagbank`,
+      redirectUrl: `${appUrl}/obrigado`,
+    });
+    return NextResponse.json({ url: checkout.payUrl });
```

E no upsert de `subscriptions` adicionar `pagbank_subscription_id: checkout.id` para correlação com o webhook.

Tempo total da troca depois de allowlist: ~5 minutos + deploy.

## Como abrir o ticket no PagBank

1. Acesse https://minhaconta.pagbank.com.br/ajuda → Desenvolvedor → "Falar com a gente".
2. Tema: **API de Checkout / Liberação de endpoint**.
3. Mensagem sugerida:

> Olá, tenho a aplicação **zelo-bjj** cadastrada (CNPJ/CPF: [seu CPF]) e gostaria de solicitar liberação (allowlist) do endpoint `POST https://api.pagseguro.com/checkouts` para criar sessões de Checkout hospedado via API V4. A aplicação já está com URL de notificação e URL de redirecionamento configuradas. Token de aplicação ativo. A chamada atual retorna `allowlist_access_required`. Obrigado.

SLA típico: 2-5 dias úteis. Quando liberarem, me avisa que faço o switch em ~5 min.
