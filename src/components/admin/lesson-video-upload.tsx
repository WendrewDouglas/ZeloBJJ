"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, CheckCircle2, Loader2, Trash2, AlertCircle } from "lucide-react";

const BUCKET = "course-videos";
const MAX_MB = 1024; // 1GB

type Props = {
  lessonId: string;
  lessonTitle: string;
  initialStoragePath: string | null;
  onUpdated?: (storagePath: string | null) => void;
};

export function LessonVideoUpload({ lessonId, lessonTitle, initialStoragePath, onUpdated }: Props) {
  const [storagePath, setStoragePath] = useState(initialStoragePath);
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setMessage(null);

    if (!file.type.startsWith("video/")) {
      setMessage({ type: "error", text: "Arquivo precisa ser um video (MP4, WebM, MOV, MKV)." });
      return;
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_MB) {
      setMessage({ type: "error", text: `Arquivo muito grande (${sizeMB.toFixed(0)}MB). Maximo ${MAX_MB}MB.` });
      return;
    }

    const supabase = createClient();

    // Path: {lessonId}/video.<ext> (sobrescreve ao re-upload)
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "mp4";
    const path = `${lessonId}/video.${ext}`;

    setProgress(0);

    try {
      // Supabase-js (fetch) nao expõe progresso. Simulamos incremento leve até concluir.
      const interval = setInterval(() => {
        setProgress((p) => (p === null ? 5 : Math.min(p + 3, 90)));
      }, 300);

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });

      clearInterval(interval);

      if (upErr) {
        setProgress(null);
        setMessage({ type: "error", text: "Falha no upload: " + upErr.message });
        return;
      }

      // Persiste o path no lesson
      const { error: updErr } = await supabase
        .from("lessons")
        .update({
          storage_path: path,
          video_url: null, // limpa URL externa antiga se existir
        })
        .eq("id", lessonId);

      if (updErr) {
        setProgress(null);
        setMessage({ type: "error", text: "Upload feito, mas nao consegui atualizar a aula: " + updErr.message });
        return;
      }

      setProgress(100);
      setStoragePath(path);
      onUpdated?.(path);
      setMessage({ type: "ok", text: "Video enviado com sucesso!" });
      setTimeout(() => setProgress(null), 1200);
    } catch (err) {
      setProgress(null);
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erro desconhecido" });
    }
  }

  async function handleRemove() {
    if (!storagePath) return;
    if (!confirm(`Remover o video da aula "${lessonTitle}"?`)) return;

    const supabase = createClient();

    const { error: rmErr } = await supabase.storage.from(BUCKET).remove([storagePath]);
    if (rmErr) {
      setMessage({ type: "error", text: "Erro ao remover: " + rmErr.message });
      return;
    }

    await supabase.from("lessons").update({ storage_path: null }).eq("id", lessonId);
    setStoragePath(null);
    onUpdated?.(null);
    setMessage({ type: "ok", text: "Video removido." });
  }

  const hasVideo = !!storagePath;
  const isUploading = progress !== null && progress < 100;

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-gold hover:text-gold disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Enviando {progress}%
            </>
          ) : hasVideo ? (
            <>
              <Upload className="h-3.5 w-3.5" />
              Trocar vídeo
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" />
              Subir vídeo
            </>
          )}
        </button>

        {hasVideo && !isUploading && (
          <>
            <span className="inline-flex items-center gap-1 text-xs text-green-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Vídeo publicado
            </span>
            <button
              type="button"
              onClick={handleRemove}
              className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/10"
              title="Remover video"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      {isUploading && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-gold to-gold-light transition-all"
            style={{ width: `${progress ?? 0}%` }}
          />
        </div>
      )}

      {message && (
        <p
          className={`flex items-center gap-1.5 text-xs ${
            message.type === "ok" ? "text-green-400" : "text-red-400"
          }`}
        >
          {message.type === "error" ? (
            <AlertCircle className="h-3.5 w-3.5" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          {message.text}
        </p>
      )}
    </div>
  );
}
