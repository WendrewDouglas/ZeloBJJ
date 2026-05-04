-- ==============================================
-- Zelo BJJ - Aumenta limite de upload do bucket course-videos para 5 GiB
-- ==============================================
-- Videos de aulas tem media de ~3GB, e queremos margem ate 5000 MiB.
-- Antes: 2 GiB (2147483648). Depois: 5 GiB (5368709120 = 5 * 1024^3).
--
-- IMPORTANTE: o limite GLOBAL do projeto (Supabase Dashboard -> Storage ->
-- Settings -> Global File Size Limit) precisa ser >= 5 GiB. Caso contrario
-- uploads grandes falham mesmo com este limite de bucket aumentado.
-- O limite global so e configuravel em planos pagos (Pro+).

UPDATE storage.buckets
SET file_size_limit = 5368709120
WHERE id = 'course-videos';
