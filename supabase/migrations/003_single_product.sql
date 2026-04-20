-- ==============================================
-- Zelo BJJ - Modelo de venda unica (pagamento unico, acesso vitalicio)
-- ==============================================
-- O cliente optou por vender apenas um produto: R$ 29,90, pagamento unico, vitalicio.
-- Esta migration:
--   1) Adiciona is_lifetime em plans e paid_at em subscriptions
--   2) Limpa o seed antigo (3 planos recorrentes) e cria o plano unico
--   3) Ajusta CHECK de status para incluir 'paid' e 'refunded' do pagamento unico

-- ============= PLANS =============
ALTER TABLE plans ADD COLUMN IF NOT EXISTS is_lifetime BOOLEAN NOT NULL DEFAULT false;

-- Se algum slug antigo existir, deleta o seed original.
-- Importante: o CHECK de plan_slug foi baseado em seed, nao em CHECK no banco, entao ok limpar.
DELETE FROM enrollments WHERE plan_id IN (SELECT id FROM plans WHERE slug IN ('iniciante','completo','presencial'));
DELETE FROM subscriptions WHERE plan_id IN (SELECT id FROM plans WHERE slug IN ('iniciante','completo','presencial'));
DELETE FROM plans WHERE slug IN ('iniciante','completo','presencial');

INSERT INTO plans (slug, name, description, price_monthly, features, is_active, is_lifetime, sort_order, payment_link)
VALUES (
  'curso_digital',
  'Curso Brazilian Jiu-Jitsu - Completo Digital',
  'Curso digital completo com 9 modulos estruturados do zero ao avancado. Acesso vitalicio, pagamento unico.',
  29.90,
  '["Acesso vitalicio a todos os 9 modulos","Videos em HD","Material de apoio em PDF","Suporte via WhatsApp","Comunidade exclusiva (forum)","Pagamento unico em ate 18x no cartao"]'::jsonb,
  true,
  true,
  1,
  'https://pag.ae/81HAeDbNJ'
);

-- ============= SUBSCRIPTIONS =============
-- Em pagamento unico nao existe "proxima cobranca", usamos paid_at para registrar quando virou vitalicio.
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Expandir CHECK de status para incluir estados do fluxo avulso (PAID, REFUNDED)
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN (
    'pending','trial','active','overdue','pending_action','suspended','canceled','expired',
    'paid','refunded','in_analysis','declined'
  ));
