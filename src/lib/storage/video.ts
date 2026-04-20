import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "course-videos";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 4; // 4h

/**
 * Resolve a URL final do video de uma aula.
 * Prioridade:
 *   1. bunny_video_id -> tratado pelo VideoPlayer (retorna null aqui)
 *   2. storage_path   -> gera signed URL do Supabase Storage
 *   3. video_url      -> URL publica (MP4 externo)
 */
export async function getLessonVideoUrl(
  supabase: SupabaseClient,
  lesson: { storage_path: string | null; video_url: string | null; bunny_video_id: string | null }
): Promise<string | null> {
  if (lesson.bunny_video_id) return null;

  if (lesson.storage_path) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(lesson.storage_path, SIGNED_URL_TTL_SECONDS);
    if (error) {
      console.error("getLessonVideoUrl: signed url error", error);
      return null;
    }
    return data?.signedUrl ?? null;
  }

  return lesson.video_url ?? null;
}

export const VIDEO_BUCKET = BUCKET;
