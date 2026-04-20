-- ==============================================
-- Zelo BJJ - Storage para videos das aulas
-- ==============================================
-- Cria bucket privado no Supabase Storage + coluna storage_path em lessons.
-- Admins fazem upload pelo painel. Alunos recebem signed URL temporaria.

-- 1) Bucket privado (2GB por arquivo, so formatos de video)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-videos',
  'course-videos',
  false,
  2147483648,
  ARRAY['video/mp4','video/webm','video/quicktime','video/x-matroska']
)
ON CONFLICT (id) DO NOTHING;

-- 2) Policies: so admin pode manipular. Alunos nao precisam de policy de SELECT
--    porque usamos signed URLs (token embutido na URL).
DROP POLICY IF EXISTS "Admins upload course videos" ON storage.objects;
CREATE POLICY "Admins upload course videos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'course-videos' AND public.is_admin());

DROP POLICY IF EXISTS "Admins update course videos" ON storage.objects;
CREATE POLICY "Admins update course videos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'course-videos' AND public.is_admin());

DROP POLICY IF EXISTS "Admins delete course videos" ON storage.objects;
CREATE POLICY "Admins delete course videos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'course-videos' AND public.is_admin());

DROP POLICY IF EXISTS "Admins list course videos" ON storage.objects;
CREATE POLICY "Admins list course videos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'course-videos' AND public.is_admin());

-- 3) Coluna para o path do arquivo no bucket (ex.: "{lesson_id}/video.mp4")
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Opcional: indice para facilitar queries futuras
CREATE INDEX IF NOT EXISTS idx_lessons_storage_path ON lessons(storage_path) WHERE storage_path IS NOT NULL;
