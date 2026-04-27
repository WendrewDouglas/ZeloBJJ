import { createHash } from "node:crypto";

const BUNNY_API_KEY = process.env.BUNNY_STREAM_API_KEY || "";
const BUNNY_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID || "";
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_STREAM_CDN_HOSTNAME || "";

const BUNNY_VIDEO_API = "https://video.bunnycdn.com";
export const BUNNY_TUS_ENDPOINT = "https://video.bunnycdn.com/tusupload";

export function getBunnyEmbedUrl(videoId: string): string {
  return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}`;
}

export function getBunnyThumbnailUrl(videoId: string): string {
  return `https://${BUNNY_CDN_HOSTNAME}/${videoId}/thumbnail.jpg`;
}

export async function listVideos() {
  const res = await fetch(`${BUNNY_VIDEO_API}/library/${BUNNY_LIBRARY_ID}/videos`, {
    headers: { AccessKey: BUNNY_API_KEY },
  });
  return res.json();
}

export async function getVideo(videoId: string) {
  const res = await fetch(
    `${BUNNY_VIDEO_API}/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
    { headers: { AccessKey: BUNNY_API_KEY } }
  );
  return res.json();
}

export async function createBunnyVideo(title: string): Promise<{ guid: string }> {
  const res = await fetch(`${BUNNY_VIDEO_API}/library/${BUNNY_LIBRARY_ID}/videos`, {
    method: "POST",
    headers: {
      AccessKey: BUNNY_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    throw new Error(`bunny createVideo failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function deleteBunnyVideo(videoId: string): Promise<void> {
  const res = await fetch(
    `${BUNNY_VIDEO_API}/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
    { method: "DELETE", headers: { AccessKey: BUNNY_API_KEY } }
  );
  if (!res.ok && res.status !== 404) {
    throw new Error(`bunny deleteVideo failed: ${res.status} ${await res.text()}`);
  }
}

export type BunnyTusAuth = {
  libraryId: string;
  videoId: string;
  authorizationSignature: string;
  authorizationExpire: number;
};

export function getBunnyTusAuth(videoId: string, ttlSeconds = 60 * 60 * 6): BunnyTusAuth {
  const expire = Math.floor(Date.now() / 1000) + ttlSeconds;
  const signature = createHash("sha256")
    .update(`${BUNNY_LIBRARY_ID}${BUNNY_API_KEY}${expire}${videoId}`)
    .digest("hex");
  return {
    libraryId: BUNNY_LIBRARY_ID,
    videoId,
    authorizationSignature: signature,
    authorizationExpire: expire,
  };
}

export function assertBunnyConfigured(): void {
  if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
    throw new Error("Bunny Stream not configured: missing BUNNY_STREAM_API_KEY or BUNNY_STREAM_LIBRARY_ID");
  }
}
