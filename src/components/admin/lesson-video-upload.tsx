"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import * as tus from "tus-js-client";
import { createClient } from "@/lib/supabase/client";
import { Upload, CheckCircle2, Loader2, Trash2, AlertCircle } from "lucide-react";

const MAX_MB = 5000;
const CHUNK_SIZE = 50 * 1024 * 1024;
const BUNNY_TUS_ENDPOINT = "https://video.bunnycdn.com/tusupload";

type Props = {
  lessonId: string;
  lessonTitle: string;
  initialBunnyVideoId: string | null;
  onUpdated?: (bunnyVideoId: string | null) => void;
};

type CreateVideoResponse = {
  libraryId: string;
  videoId: string;
  authorizationSignature: string;
  authorizationExpire: number;
};

export function LessonVideoUpload({ lessonId, lessonTitle, initialBunnyVideoId, onUpdated }: Props) {
  const t = useTranslations("admin.videoUpload");
  const [bunnyVideoId, setBunnyVideoId] = useState(initialBunnyVideoId);
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setMessage(null);

    if (!file.type.startsWith("video/")) {
      setMessage({ type: "error", text: t("errorType") });
      return;
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_MB) {
      setMessage({
        type: "error",
        text: t("errorSize", { sizeMB: sizeMB.toFixed(0), maxMB: MAX_MB }),
      });
      return;
    }

    setProgress(0);

    let auth: CreateVideoResponse;
    try {
      const res = await fetch("/api/admin/bunny/create-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, title: lessonTitle }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }
      auth = (await res.json()) as CreateVideoResponse;
    } catch (err) {
      setProgress(null);
      setMessage({
        type: "error",
        text: t("errorUpload", { message: err instanceof Error ? err.message : "create-video failed" }),
      });
      return;
    }

    const previousVideoId = bunnyVideoId;

    try {
      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: BUNNY_TUS_ENDPOINT,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          chunkSize: CHUNK_SIZE,
          uploadDataDuringCreation: false,
          removeFingerprintOnSuccess: true,
          headers: {
            AuthorizationSignature: auth.authorizationSignature,
            AuthorizationExpire: String(auth.authorizationExpire),
            VideoId: auth.videoId,
            LibraryId: auth.libraryId,
          },
          metadata: {
            filetype: file.type,
            title: lessonTitle,
          },
          onError: (err) => reject(err),
          onProgress: (bytesUploaded, bytesTotal) => {
            setProgress(Math.round((bytesUploaded / bytesTotal) * 100));
          },
          onSuccess: () => resolve(),
        });

        upload.findPreviousUploads().then((prev) => {
          if (prev.length) upload.resumeFromPreviousUpload(prev[0]);
          upload.start();
        });
      });

      const supabase = createClient();
      const { error: updErr } = await supabase
        .from("lessons")
        .update({
          bunny_video_id: auth.videoId,
          storage_path: null,
          video_url: null,
        })
        .eq("id", lessonId);

      if (updErr) {
        setProgress(null);
        setMessage({ type: "error", text: t("errorUpdate", { message: updErr.message }) });
        return;
      }

      if (previousVideoId && previousVideoId !== auth.videoId) {
        fetch("/api/admin/bunny/delete-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId: previousVideoId }),
        }).catch(() => undefined);
      }

      setProgress(100);
      setBunnyVideoId(auth.videoId);
      onUpdated?.(auth.videoId);
      setMessage({ type: "ok", text: t("successUpload") });
      setTimeout(() => setProgress(null), 1200);
    } catch (err) {
      setProgress(null);
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : t("errorUnknown"),
      });
    }
  }

  async function handleRemove() {
    if (!bunnyVideoId) return;
    if (!confirm(t("removeConfirm", { title: lessonTitle }))) return;

    const videoIdToDelete = bunnyVideoId;
    const supabase = createClient();

    const res = await fetch("/api/admin/bunny/delete-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId: videoIdToDelete }),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      setMessage({
        type: "error",
        text: t("errorRemove", { message: errBody.error || `HTTP ${res.status}` }),
      });
      return;
    }

    const { error: updErr } = await supabase
      .from("lessons")
      .update({ bunny_video_id: null })
      .eq("id", lessonId);
    if (updErr) {
      setMessage({ type: "error", text: t("errorRemove", { message: updErr.message }) });
      return;
    }

    setBunnyVideoId(null);
    onUpdated?.(null);
    setMessage({ type: "ok", text: t("successRemove") });
  }

  const hasVideo = !!bunnyVideoId;
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
              {t("uploading", { progress })}
            </>
          ) : hasVideo ? (
            <>
              <Upload className="h-3.5 w-3.5" />
              {t("replace")}
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" />
              {t("upload")}
            </>
          )}
        </button>

        {hasVideo && !isUploading && (
          <>
            <span className="inline-flex items-center gap-1 text-xs text-green-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t("published")}
            </span>
            <button
              type="button"
              onClick={handleRemove}
              className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/10"
              title={t("removeTooltip")}
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
