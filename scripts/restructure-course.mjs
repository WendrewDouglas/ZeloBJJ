// Restructure the course modules and lessons to the new 11-module layout.
// Wipes existing modules + lessons + lesson_progress for the course,
// then inserts the new structure.
//
// Usage:
//   node scripts/restructure-course.mjs           # dry-run (prints plan)
//   node scripts/restructure-course.mjs --apply   # actually applies changes

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const ENV_PATH =
  process.env.ENV_FILE ||
  "C:/Users/WENDRE~1/AppData/Local/Temp/.env.prod";
const APPLY = process.argv.includes("--apply");

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

const STRUCTURE = [
  { title: "Abertura", lessons: ["Abertura"] },
  { title: "Base e Postura", lessons: ["Base e Postura"] },
  {
    title: "Movimentação Corporal",
    lessons: [
      "Movimentação Corporal",
      "Fuga de Quadril",
      "Meia Volta",
      "Movimentos na Prática",
      "Levantada Técnica",
    ],
  },
  {
    title: "Hierarquia das Posições",
    lessons: [
      "Montada",
      "100 KG",
      "Guarda Fechada",
      "Meia Guarda",
      "Recapitulando as Posições",
    ],
  },
  {
    title: "Guarda",
    lessons: [
      "Apresentação Guarda Fechada",
      "Guarda Fechada na Prática",
      "Guarda Aberta",
      "Guarda Aberta na Prática",
    ],
  },
  {
    title: "Raspagem",
    lessons: [
      "Tipos de Raspagens",
      "Raspagem Tesourada",
      "Raspagem de Gancho",
      "Raspagem do Elevador",
      "Domínio de Manga - Dica extra",
      "Raspagens na Prática",
    ],
  },
  {
    title: "Finalizações",
    lessons: [
      "Tipos de Finalização",
      "Mata Leão",
      "Estrangulamento com Lapela",
      "Triângulo",
      "Posição Americana",
      "Armlock da Montada",
      "Efetividade das Finalizações",
    ],
  },
  {
    title: "Sobrevivência",
    lessons: [
      "Sobrevivência",
      "Conceitos Essênciais",
      "Sobrevivência nos 100KG",
      "Protegendo o Pescoço",
      "Modo Sobrevivência Montada",
    ],
  },
  {
    title: "Defesa Pessoal",
    lessons: [
      "Defesa Pessoal",
      "Roubo de Celular",
      "Agarrão por Trás",
      "Gravata de Caminhoneiro",
      "Ataque por Trás",
    ],
  },
  {
    title: "Conduta e Mentalidade",
    lessons: [
      "Postura",
      "Respiração Calma",
      "Conduta e Mentalidade",
      "Etiqueta no Tatame",
    ],
  },
  { title: "Encerramento", lessons: ["Encerramento"] },
];

const totalLessons = STRUCTURE.reduce((acc, m) => acc + m.lessons.length, 0);

console.log(`\n=== Plano: ${STRUCTURE.length} módulos · ${totalLessons} aulas ===\n`);
STRUCTURE.forEach((m, i) => {
  console.log(`${i + 1}. ${m.title}`);
  m.lessons.forEach((l, j) => console.log(`   ${j + 1}. ${l}`));
});
console.log("");

// Find course
const { data: course, error: courseErr } = await supabase
  .from("courses")
  .select("id, title")
  .order("sort_order")
  .limit(1)
  .single();
if (courseErr || !course) {
  console.error("Curso não encontrado:", courseErr);
  process.exit(1);
}
console.log(`Curso alvo: ${course.title} (${course.id})`);

if (!APPLY) {
  console.log("\n[DRY-RUN] Use --apply para executar.");
  process.exit(0);
}

console.log("\n=== Aplicando migração ===");

// 1. Identify existing modules and lessons
const { data: oldModules } = await supabase
  .from("course_modules")
  .select("id")
  .eq("course_id", course.id);
const oldModuleIds = (oldModules ?? []).map((m) => m.id);
console.log(`Módulos antigos: ${oldModuleIds.length}`);

const { data: oldLessons } =
  oldModuleIds.length > 0
    ? await supabase.from("lessons").select("id").in("module_id", oldModuleIds)
    : { data: [] };
const oldLessonIds = (oldLessons ?? []).map((l) => l.id);
console.log(`Aulas antigas: ${oldLessonIds.length}`);

// 2. Wipe lesson_progress
if (oldLessonIds.length > 0) {
  const { error: lpErr } = await supabase
    .from("lesson_progress")
    .delete()
    .in("lesson_id", oldLessonIds);
  if (lpErr) {
    console.error("Erro ao limpar lesson_progress:", lpErr);
    process.exit(1);
  }
  console.log("✓ lesson_progress limpo");
}

// 3. Wipe lessons
if (oldLessonIds.length > 0) {
  const { error: lErr } = await supabase
    .from("lessons")
    .delete()
    .in("id", oldLessonIds);
  if (lErr) {
    console.error("Erro ao deletar lessons:", lErr);
    process.exit(1);
  }
  console.log("✓ Aulas antigas deletadas");
}

// 4. Wipe modules
if (oldModuleIds.length > 0) {
  const { error: mErr } = await supabase
    .from("course_modules")
    .delete()
    .in("id", oldModuleIds);
  if (mErr) {
    console.error("Erro ao deletar modules:", mErr);
    process.exit(1);
  }
  console.log("✓ Módulos antigos deletados");
}

// 5. Insert new modules and lessons
let modulesInserted = 0;
let lessonsInserted = 0;

for (const [idx, mod] of STRUCTURE.entries()) {
  const { data: newModule, error: insertModErr } = await supabase
    .from("course_modules")
    .insert({
      course_id: course.id,
      title: mod.title,
      description: null,
      sort_order: idx + 1,
      is_published: true,
    })
    .select("id")
    .single();

  if (insertModErr || !newModule) {
    console.error(`Erro inserindo módulo "${mod.title}":`, insertModErr);
    process.exit(1);
  }
  modulesInserted += 1;

  const lessonRows = mod.lessons.map((title, i) => ({
    module_id: newModule.id,
    title,
    description: null,
    sort_order: i + 1,
    is_published: true,
    storage_path: null,
    video_url: null,
    bunny_video_id: null,
  }));

  const { error: insertLErr } = await supabase
    .from("lessons")
    .insert(lessonRows);
  if (insertLErr) {
    console.error(`Erro inserindo aulas do módulo "${mod.title}":`, insertLErr);
    process.exit(1);
  }
  lessonsInserted += lessonRows.length;
  console.log(`✓ Módulo ${idx + 1}: "${mod.title}" (${lessonRows.length} aulas)`);
}

// 6. Update course description (was "9 módulos")
const { error: courseUpdErr } = await supabase
  .from("courses")
  .update({
    description:
      "Do fundamento ao combate real. 11 módulos estruturados com vídeo-aulas em HD, material de apoio e comunidade.",
  })
  .eq("id", course.id);
if (courseUpdErr) {
  console.warn("Aviso: não consegui atualizar description do curso:", courseUpdErr);
}

console.log(
  `\n✅ Pronto. ${modulesInserted} módulos · ${lessonsInserted} aulas inseridos.`
);
