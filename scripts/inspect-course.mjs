// Inspect current course/modules/lessons + storage in production Supabase
// Usage: node scripts/inspect-course.mjs (loads env from /tmp/.env.prod)
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const ENV_PATH =
  process.env.ENV_FILE ||
  "C:/Users/WENDRE~1/AppData/Local/Temp/.env.prod";

const env = Object.fromEntries(
  readFileSync(ENV_PATH, "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

console.log("=== Courses ===");
const { data: courses, error: cErr } = await supabase
  .from("courses")
  .select("*");
if (cErr) console.error(cErr);
else console.log(JSON.stringify(courses, null, 2));

console.log("\n=== Modules ===");
const { data: modules, error: mErr } = await supabase
  .from("course_modules")
  .select("*")
  .order("sort_order");
if (mErr) console.error(mErr);
else console.log(JSON.stringify(modules, null, 2));

console.log("\n=== Lessons ===");
const { data: lessons, error: lErr } = await supabase
  .from("lessons")
  .select("id, title, sort_order, module_id, is_published, storage_path, video_url, bunny_video_id")
  .order("sort_order");
if (lErr) console.error(lErr);
else console.log(JSON.stringify(lessons, null, 2));

console.log("\n=== Storage: course-videos ===");
const { data: bucket, error: bErr } = await supabase.storage
  .from("course-videos")
  .list("", { limit: 1000, sortBy: { column: "name", order: "asc" } });
if (bErr) console.error(bErr);
else {
  console.log("Top-level entries:", bucket?.length ?? 0);
  for (const entry of bucket ?? []) {
    if (entry.id == null) {
      // Folder — list inside
      const { data: inner } = await supabase.storage
        .from("course-videos")
        .list(entry.name, { limit: 1000 });
      console.log(`  ${entry.name}/ (${inner?.length ?? 0} files)`);
      for (const f of inner ?? []) {
        console.log(`    ${entry.name}/${f.name} (${f.metadata?.size ?? "?"} bytes)`);
      }
    } else {
      console.log(`  ${entry.name} (${entry.metadata?.size ?? "?"} bytes)`);
    }
  }
}
