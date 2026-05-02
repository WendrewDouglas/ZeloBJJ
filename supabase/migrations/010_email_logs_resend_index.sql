-- ==============================================
-- Zelo BJJ — Indice em email_logs.resend_id
-- ==============================================
-- O webhook /api/webhooks/resend faz lookup por resend_id para atualizar
-- o status de entrega (delivered/bounced/opened/clicked). Indice acelera
-- esse caminho — atualmente sao poucas linhas, mas escala se a base crescer.

CREATE INDEX IF NOT EXISTS idx_email_logs_resend_id
  ON email_logs(resend_id)
  WHERE resend_id IS NOT NULL;
