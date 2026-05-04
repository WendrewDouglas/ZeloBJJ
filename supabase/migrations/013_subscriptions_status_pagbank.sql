-- 013: Expande o CHECK constraint de subscriptions.status para aceitar
-- todos os status mapeados pelo PagBank (mapPagbankStatus em src/lib/pagbank/index.ts).
--
-- migration 001 criou o CHECK so com status do Stripe ('active','past_due','canceled',
-- 'unpaid','trialing','incomplete'). O webhook PagBank tenta gravar 'paid','pending',
-- 'declined','refunded','expired','suspended','overdue','in_analysis','pending_action',
-- e quebrava com violacao de constraint.
--
-- Idempotente: drop + recreate com o conjunto completo.

ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_status_check CHECK (status IN (
    'pending',
    'trial',
    'active',
    'overdue',
    'pending_action',
    'suspended',
    'canceled',
    'expired',
    'paid',
    'refunded',
    'in_analysis',
    'declined'
  ));
