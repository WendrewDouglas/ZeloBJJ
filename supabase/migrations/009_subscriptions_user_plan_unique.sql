-- ==============================================
-- Zelo BJJ — UNIQUE em subscriptions(user_id, plan_id)
-- ==============================================
-- O webhook PagBank e o endpoint /api/admin/regularize fazem upsert em
-- subscriptions com onConflict='user_id,plan_id', mas a tabela original
-- (migration 001) so tinha PK em (id) e UNIQUE em pagbank_subscription_id.
-- Sem a constraint composta, todo upsert falha com:
--   "there is no unique or exclusion constraint matching the ON CONFLICT specification"
-- Esta migration adiciona a constraint que faltava.

ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_user_plan_unique
  UNIQUE (user_id, plan_id);
