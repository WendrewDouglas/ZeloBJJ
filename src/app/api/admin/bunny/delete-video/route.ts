import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertBunnyConfigured, deleteBunnyVideo } from "@/lib/bunny";

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

  const body = (await req.json().catch(() => null)) as { videoId?: string } | null;
  if (!body?.videoId) {
    return NextResponse.json({ error: "videoId required" }, { status: 400 });
  }

  try {
    await deleteBunnyVideo(body.videoId);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "bunny error" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
