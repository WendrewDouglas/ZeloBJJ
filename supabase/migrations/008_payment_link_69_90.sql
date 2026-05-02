-- ==============================================
-- Zelo BJJ — Atualizacao do link de pagamento PagBank
-- ==============================================
-- O PagBank nao permite editar valor de um link de pagamento existente.
-- Em 02/05/2026, com o reajuste de R$ 29,90 -> R$ 69,90, o cliente teve
-- que criar um novo link no painel:
--   antigo (R$ 29,90, desativado): https://pag.ae/81HAeDbNJ
--   novo (R$ 69,90, ativo):        https://pag.ae/81KNTg9Kt

UPDATE plans
SET payment_link = 'https://pag.ae/81KNTg9Kt'
WHERE slug = 'curso_digital';
