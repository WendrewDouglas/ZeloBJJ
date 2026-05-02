# PagBank — Setup pos-deploy

Esse passo a passo eh **manual no painel PagBank** e precisa ser feito uma unica vez para a jornada de pagamento funcionar end-to-end.

## 1) Return URL (apos o pagamento)

Sem isso, depois de pagar o aluno fica preso no dominio do PagBank — nao volta para `/obrigado` e nao ve o polling de confirmacao.

1. Acesse https://minhaconta.pagbank.com.br e faca login.
2. Menu lateral: **Vendas → Links e botoes de pagamento**.
3. Localize o link cadastrado para o produto `curso_digital` (mesmo link salvo em `plans.payment_link` no Supabase).
4. Clique em **Editar**.
5. Procure a secao **"Apos o pagamento"** ou **"URL de redirecionamento"** (o nome exato pode variar). Cole:

   ```
   https://zelobjj.com.br/obrigado?ref={reference_id}
   ```

   Se o painel **nao oferecer** macro `{reference_id}` (alguns templates do pag.ae nao oferecem), use a URL fixa:

   ```
   https://zelobjj.com.br/obrigado
   ```

   Nesse caso o `/obrigado` simplesmente mostra a mensagem padrao com link para WhatsApp e o aluno acompanha pelo e-mail. Funciona, mas perde o polling.

6. Salve.

## 2) Webhook de notificacao

Sem o webhook, nenhuma subscription e nenhum enrollment sao criados, e nenhum e-mail proprio eh enviado. **Esse passo eh critico.**

1. No mesmo link de pagamento, abra a secao **"Notificacoes"** ou **"Webhooks"**.
2. Cadastre a URL do webhook com Basic Auth embutido na propria URL:

   ```
   https://USUARIO:SENHA@zelobjj.com.br/api/webhooks/pagbank
   ```

   - Substitua `USUARIO` e `SENHA` pelos valores das env vars `PAGBANK_WEBHOOK_USERNAME` e `PAGBANK_WEBHOOK_PASSWORD` configuradas na Vercel. Se ainda nao foram criadas, gere uma string longa aleatoria para cada (ex.: `openssl rand -hex 24`) e adicione tanto na Vercel quanto no `.env.local`.
   - Importante: a URL completa precisa estar em `https://`. Se o painel rejeitar o formato `user:pass@host`, use a aba **"Cabecalhos personalizados"** se existir e adicione manualmente:
     - Header: `Authorization`
     - Valor: `Basic <base64(USUARIO:SENHA)>`

3. Eventos a marcar (correspondem ao map em `src/lib/pagbank/index.ts:5-23`):
   - `PAID` — pagamento confirmado
   - `AUTHORIZED` — autorizado (cartao)
   - `IN_ANALYSIS` — em analise (anti-fraude)
   - `WAITING` / `PENDING` — aguardando (PIX/boleto)
   - `DECLINED` — recusado
   - `CANCELED` — cancelado
   - `REFUNDED` — estornado
   - `PENDING_ACTION` (se existir)

4. Salve. Faca um pagamento de teste e verifique:
   - No Supabase: linha em `subscriptions` com `pagbank_subscription_id` preenchido e `status` correto.
   - No Supabase: linha em `audit_logs` com `action LIKE 'pagbank.%'`.
   - No Supabase: linha em `email_logs` com `template = 'payment_approved'` e `status = 'sent'` (apos PAID).
   - No Resend dashboard: e-mail aparece em **Emails → Recent**.

## 3) Env vars necessarias na Vercel

Na **Vercel → Project → Settings → Environment Variables**, garanta que existem em **Production**, **Preview** e **Development**:

| Nome | Onde usado | Exemplo |
|---|---|---|
| `RESEND_API_KEY` | `src/lib/resend/index.ts` | `re_xxxxxxxxxxxx` |
| `RESEND_FROM_EMAIL` | `src/lib/resend/index.ts` (default `contato@zelobjj.com.br`) | `contato@zelobjj.com.br` |
| `NEXT_PUBLIC_APP_URL` | URLs absolutas em e-mails (`src/lib/email/layout.ts`) | `https://zelobjj.com.br` |
| `PAGBANK_WEBHOOK_USERNAME` | Validacao Basic Auth (`src/lib/pagbank/index.ts`) | string aleatoria |
| `PAGBANK_WEBHOOK_PASSWORD` | Validacao Basic Auth | string aleatoria |
| `PAGBANK_WEBHOOK_SECRET` (opcional) | Fallback HMAC | so se PagBank fornecer |
| `SUPABASE_SERVICE_ROLE_KEY` | Webhook + e-mails server-side | ja configurado |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client/server Supabase | ja configurados |

Apos adicionar, rode um redeploy em Production (qualquer push em master serve) para que as novas vars valham.

## 4) Dominio verificado no Resend

Os e-mails saem do `RESEND_FROM_EMAIL`. Para `@zelobjj.com.br` ser entregue (e nao cair em spam), o dominio precisa estar verificado na Resend:

1. Acesse https://resend.com/domains.
2. Clique **Add Domain** → digite `zelobjj.com.br`.
3. Adicione os registros DNS (SPF, DKIM, DMARC) que a Resend gerar — cole no painel da Vercel (DNS) ou no provedor onde o DNS de `zelobjj.com.br` esta hospedado.
4. Aguarde verificacao (alguns minutos).

Em desenvolvimento sem dominio verificado, voce pode usar `RESEND_FROM_EMAIL=onboarding@resend.dev` — funciona apenas com o e-mail da conta Resend como destinatario.

## 5) Testes pos-setup

Smoke test recomendado, em ordem:

1. **Cadastro novo:** crie uma conta com e-mail teste → confirme via link Supabase Auth → cai em `/dashboard`. Verifique `email_logs` com `template='welcome'` e `status='sent'`.
2. **Intencao de compra:** deslogue. Na home (sem login), clique **"Garantir acesso"**. Voce deve ir para `/cadastro?next=checkout`. Faca login (com a conta criada acima). Voce deve ser redirecionado direto para o link PagBank, sem passar pelo dashboard.
3. **Subscription pending:** confirme no Supabase que `subscriptions` tem 1 linha com `status='pending'` e `pagbank_reference_id` preenchido.
4. **Pagamento PIX (teste):** finalize com PIX. O webhook recebera `WAITING` → `email_logs.template='payment_pending'`. Pague o PIX → recebe `PAID` → `email_logs.template='payment_approved'` + enrollments criados. A `/obrigado` deve detectar e redirecionar para `/dashboard?welcome=1`.
5. **Dashboard pos-pagamento:** o aluno ve o toast **"Acesso liberado!"** e o card amarelo **"Pronto para comecar?"** com link para a primeira aula.
6. **Idempotencia:** force o PagBank a reenviar o webhook PAID (via painel ou re-POST manual). `email_logs` nao pode ganhar uma segunda linha `payment_approved`.

## 6) Follow-ups (nao bloqueia merge)

- Templates do **Supabase Auth** (confirmar e-mail, recuperar senha) ainda estao em PT-BR. Para multi-idioma, usar **Supabase Auth Hooks** (`send_email_hook`) e mover envio para Resend, lendo `profiles.locale`. Hoje, EN/KO veem confirmation em PT — aceitavel para MVP.
- Reprocessamento de webhooks `unattributed` (sem match de user_id e e-mail). Entry point: `audit_logs` onde `action='pagbank.webhook.unattributed'`. Pode virar uma rotina manual ou job no futuro.
- Retry automatico no Resend em caso de falha. Hoje fica `email_logs.status='failed'` para inspecao manual.
