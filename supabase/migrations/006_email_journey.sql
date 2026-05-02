-- ==============================================
-- Zelo BJJ — Email Journey & i18n preferences
-- ==============================================
-- Adiciona suporte a locale por usuario e idempotencia do email de boas-vindas.
-- Indices em email_logs para deduplicacao rapida no dispatcher.

-- ============= PROFILES =============
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'pt'
    CHECK (locale IN ('pt', 'en', 'ko'));

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_locale ON profiles(locale);

-- Trigger handle_new_user agora tambem grava o locale escolhido no signUp
-- (lido de raw_user_meta_data->>'locale'; default 'pt' se ausente/invalido).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  meta_locale TEXT;
BEGIN
  meta_locale := COALESCE(NEW.raw_user_meta_data->>'locale', 'pt');
  IF meta_locale NOT IN ('pt', 'en', 'ko') THEN
    meta_locale := 'pt';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, avatar_url, locale)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    meta_locale
  );
  RETURN NEW;
END;
$$;

-- ============= EMAIL_LOGS =============
-- Indices usados pelo dispatcher (sendEmail) para deduplicar envios:
-- - (template, status) acelera filtros por template+status='sent'
-- - (user_id, template, created_at DESC) acelera "ultimo envio do template X para o usuario Y"
CREATE INDEX IF NOT EXISTS idx_email_logs_template_status
  ON email_logs(template, status);

CREATE INDEX IF NOT EXISTS idx_email_logs_user_template_created
  ON email_logs(user_id, template, created_at DESC);
