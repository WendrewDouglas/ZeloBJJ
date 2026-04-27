import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  assertBunnyConfigured,
  createBunnyVideo,
  getBunnyTusAuth,
} from "@/lib/bunny";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    assertBunnyConfigured();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "config error" },
      { status: 500 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as {
    lessonId?: string;
    title?: string;
  } | null;
  if (!body?.lessonId || !body.title) {
    return NextResponse.json(
      { error: "lessonId and title required" },
      { status: 400 }
    );
  }

  const { data: lesson, error: lessonErr } = await supabase
    .from("lessons")
    .select("id")
    .eq("id", body.lessonId)
    .single();
  if (lessonErr || !lesson) {
    return NextResponse.json({ error: "lesson not found" }, { status: 404 });
  }

  let video: { guid: string };
  try {
    video = await createBunnyVideo(body.title);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "bunny error" },
      { status: 502 }
    );
  }

  const auth = getBunnyTusAuth(video.guid);
  return NextResponse.json(auth);
}
