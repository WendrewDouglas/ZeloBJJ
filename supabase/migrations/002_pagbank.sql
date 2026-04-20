-- ==============================================
-- Zelo BJJ — Migracao Stripe -> PagBank
-- ==============================================
-- Migra o modelo de pagamentos de Stripe (API) para PagBank (link de pagamento/assinatura).
-- Assume que nao ha dados de producao (nenhum usuario pagante real ainda).

-- ============= PROFILES =============
ALTER TABLE profiles DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE profiles ADD COLUMN pagbank_customer_id TEXT UNIQUE;
DROP INDEX IF EXISTS idx_profiles_stripe_customer;
CREATE INDEX idx_profiles_pagbank_customer ON profiles(pagbank_customer_id);

-- ============= PLANS =============
ALTER TABLE plans DROP COLUMN IF EXISTS stripe_price_id;
-- Link de assinatura hospedado no PagBank (gerado pelo painel)
ALTER TABLE plans ADD COLUMN payment_link TEXT;
-- ID interno do PagBank quando conhecido (pode vir via webhook)
ALTER TABLE plans ADD COLUMN pagbank_plan_id TEXT UNIQUE;

-- ============= SUBSCRIPTIONS =============
-- Descarta CHECK antigo (stripe-centric) e recria com estados do PagBank
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE subscriptions DROP COLUMN IF EXISTS stripe_subscription_id;
ALTER TABLE subscriptions ADD COLUMN pagbank_subscription_id TEXT UNIQUE;
-- Referencia externa que enviamos ao PagBank (ex.: USER_<uuid>_<plan_slug>)
ALTER TABLE subscriptions ADD COLUMN pagbank_reference_id TEXT;
-- Ultimo ID de charge/order recebido via webhook (para rastreio)
ALTER TABLE subscriptions ADD COLUMN pagbank_last_charge_id TEXT;

-- Default novo: pending
ALTER TABLE subscriptions ALTER COLUMN status SET DEFAULT 'pending';

-- Novo CHECK com estados oficiais do PagBank (lowercase para manter padrao do app)
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('pending', 'trial', 'active', 'overdue', 'pending_action', 'suspended', 'canceled', 'expired'));

DROP INDEX IF EXISTS idx_subscriptions_stripe;
CREATE INDEX idx_subscriptions_pagbank ON subscriptions(pagbank_subscription_id);
CREATE INDEX idx_subscriptions_reference ON subscriptions(pagbank_reference_id);
