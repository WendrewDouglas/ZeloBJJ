const BUNNY_API_KEY = process.env.BUNNY_STREAM_API_KEY || "";
const BUNNY_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID || "";
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_STREAM_CDN_HOSTNAME || "";

export function getBunnyEmbedUrl(videoId: string): string {
  return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}`;
}

export function getBunnyThumbnailUrl(videoId: string): string {
  return `https://${BUNNY_CDN_HOSTNAME}/${videoId}/thumbnail.jpg`;
}

export async function listVideos() {
  const res = await fetch(
    `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`,
    {
      headers: { AccessKey: BUNNY_API_KEY },
    }
  );
  return res.json();
}

export async function getVideo(videoId: string) {
  const res = await fetch(
    `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
    {
      headers: { AccessKey: BUNNY_API_KEY },
    }
  );
  return res.json();
}
