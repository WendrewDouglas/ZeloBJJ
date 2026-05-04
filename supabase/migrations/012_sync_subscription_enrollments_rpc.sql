-- 012: RPC para sincronizar subscription + enrollments atomicamente
-- Substitui o par subscription.upsert + enrollments.upsert do webhook PagBank
-- e do /api/admin/regularize por uma unica funcao em transacao.
--
-- Antes: se enrollments.upsert falhar, subscription fica 'paid' sem enrollment
-- (estado orfao: usuario pagou mas dashboard nao mostra primeira aula).
-- Depois: tudo commit junto ou nada commit.

CREATE OR REPLACE FUNCTION public.sync_subscription_enrollments(
  p_user_id            uuid,
  p_plan_id            uuid,
  p_pagbank_subscription_id text,
  p_pagbank_reference_id    text,
  p_pagbank_last_charge_id  text,
  p_status             text,
  p_paid_at            timestamptz,
  p_grant_access       boolean
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Upsert subscription. ON CONFLICT preserva valores anteriores quando o novo
  -- payload nao trouxe (COALESCE evita perder pagbank_subscription_id em
  -- callbacks de charge isolada, por exemplo).
  INSERT INTO subscriptions (
    user_id, plan_id,
    pagbank_subscription_id, pagbank_reference_id, pagbank_last_charge_id,
    status, paid_at
  )
  VALUES (
    p_user_id, p_plan_id,
    p_pagbank_subscription_id, p_pagbank_reference_id, p_pagbank_last_charge_id,
    p_status, p_paid_at
  )
  ON CONFLICT (user_id, plan_id) DO UPDATE SET
    pagbank_subscription_id = COALESCE(EXCLUDED.pagbank_subscription_id, subscriptions.pagbank_subscription_id),
    pagbank_reference_id    = COALESCE(EXCLUDED.pagbank_reference_id,    subscriptions.pagbank_reference_id),
    pagbank_last_charge_id  = COALESCE(EXCLUDED.pagbank_last_charge_id,  subscriptions.pagbank_last_charge_id),
    status                  = EXCLUDED.status,
    paid_at                 = COALESCE(EXCLUDED.paid_at, subscriptions.paid_at);

  IF p_grant_access THEN
    -- Libera enrollment para todos os cursos publicados
    INSERT INTO enrollments (user_id, course_id, plan_id, is_active, expires_at)
    SELECT p_user_id, c.id, p_plan_id, true, NULL
    FROM courses c
    WHERE c.is_published = true
    ON CONFLICT (user_id, course_id) DO UPDATE SET
      is_active  = true,
      expires_at = NULL,
      plan_id    = EXCLUDED.plan_id;
  ELSE
    -- Revoga acesso (mantem registro, so desativa)
    UPDATE enrollments SET is_active = false WHERE user_id = p_user_id;
  END IF;
END;
$$;

-- Permite que clientes autenticados (anon/auth) NAO chamem essa RPC.
-- Apenas service_role (admin client) deve invocar.
REVOKE ALL ON FUNCTION public.sync_subscription_enrollments(uuid, uuid, text, text, text, text, timestamptz, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_subscription_enrollments(uuid, uuid, text, text, text, text, timestamptz, boolean) FROM anon;
REVOKE ALL ON FUNCTION public.sync_subscription_enrollments(uuid, uuid, text, text, text, text, timestamptz, boolean) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.sync_subscription_enrollments(uuid, uuid, text, text, text, text, timestamptz, boolean) TO service_role;
