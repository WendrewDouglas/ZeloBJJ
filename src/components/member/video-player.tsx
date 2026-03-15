"use client";

import { PlayCircle } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string | null;
  bunnyVideoId: string | null;
}

export function VideoPlayer({ videoUrl, bunnyVideoId }: VideoPlayerProps) {
  // Bunny Stream embed
  if (bunnyVideoId) {
    const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || "";
    return (
      <div className="relative aspect-video w-full">
        <iframe
          src={`https://iframe.mediadelivery.net/embed/${libraryId}/${bunnyVideoId}?autoplay=false&preload=true`}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Direct video URL
  if (videoUrl) {
    return (
      <div className="relative aspect-video w-full">
        <video
          src={videoUrl}
          controls
          className="h-full w-full"
          controlsList="nodownload"
        />
      </div>
    );
  }

  // Placeholder
  return (
    <div className="flex aspect-video w-full items-center justify-center bg-dark-light">
      <div className="text-center">
        <PlayCircle className="mx-auto mb-3 h-16 w-16 text-gray-text/30" />
        <p className="text-sm text-gray-text">Vídeo em breve</p>
      </div>
    </div>
  );
}
