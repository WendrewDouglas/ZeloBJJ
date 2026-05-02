-- ==============================================
-- Zelo BJJ — Reajuste do preco do curso digital
-- ==============================================
-- Cliente passou de R$ 29,90 para R$ 69,90 em 02/05/2026.
-- Valores antigos em assinaturas/enrollments existentes nao sao alterados (sao snapshots historicos).

UPDATE plans
SET price_monthly = 69.90
WHERE slug = 'curso_digital';
