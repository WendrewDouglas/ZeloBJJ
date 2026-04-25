export const dynamic = 'force-dynamic';

import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlayCircle, CheckCircle, ChevronRight } from "lucide-react";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function CoursePage({ params }: Props) {
  const { courseId } = await params;
  const user = await requireAuth();
  const supabase = await createClient();

  // Verify enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .eq("is_active", true)
    .single();

  if (!enrollment) {
    redirect("/cursos");
  }

  // Get course with modules and lessons
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  const { data: modules } = await supabase
    .from("course_modules")
    .select("*")
    .eq("course_id", courseId)
    .eq("is_published", true)
    .order("sort_order");

  // Get lessons for each module
  const moduleIds = modules?.map((m) => m.id) || [];
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .in("module_id", moduleIds.length > 0 ? moduleIds : ["none"])
    .eq("is_published", true)
    .order("sort_order");

  // Get user progress
  const lessonIds = lessons?.map((l) => l.id) || [];
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", user.id)
    .in("lesson_id", lessonIds.length > 0 ? lessonIds : ["none"]);

  const completedSet = new Set(
    progress?.filter((p) => p.completed).map((p) => p.lesson_id) || []
  );

  // Group lessons by module
  const lessonsByModule = new Map<string, typeof lessons>();
  lessons?.forEach((lesson) => {
    const current = lessonsByModule.get(lesson.module_id) || [];
    current.push(lesson);
    lessonsByModule.set(lesson.module_id, current);
  });

  const totalLessons = lessons?.length || 0;
  const completedLessons = completedSet.size;
  const progressPercent = totalLessons
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href="/cursos" className="mb-4 inline-block text-sm text-gray-text hover:text-gold">
          ← Voltar aos cursos
        </Link>
        <h1 className="mb-2 text-2xl font-bold text-white">{course?.title}</h1>
        <p className="mb-4 text-gray-text">{course?.description}</p>

        {/* Progress bar */}
        <div className="flex items-center gap-4">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gold transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-sm text-gray-text">
            {completedLessons}/{totalLessons} aulas ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-6">
        {modules?.map((mod, index) => {
          const modLessons = lessonsByModule.get(mod.id) || [];
          const modCompleted = modLessons.filter((l) =>
            completedSet.has(l.id)
          ).length;

          return (
            <div
              key={mod.id}
              className="rounded-xl border border-white/5 bg-dark-lighter overflow-hidden"
            >
              {/* Module header */}
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-sm font-bold text-gold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-bold text-white">{mod.title}</h3>
                    {mod.description && (
                      <p className="text-xs text-gray-text">{mod.description}</p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-text">
                  {modCompleted}/{modLessons.length}
                </span>
              </div>

              {/* Lessons list */}
              <div className="divide-y divide-white/5">
                {modLessons.map((lesson) => {
                  const isCompleted = completedSet.has(lesson.id);
                  return (
                    <Link
                      key={lesson.id}
                      href={`/cursos/${courseId}/aulas/${lesson.id}`}
                      className="flex items-center gap-4 px-6 py-3 transition-colors hover:bg-white/5"
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                      ) : (
                        <PlayCircle className="h-5 w-5 shrink-0 text-gray-text" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white">{lesson.title}</p>
                        {lesson.duration_seconds && (
                          <p className="text-xs text-gray-text">
                            {Math.floor(lesson.duration_seconds / 60)} min
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-text" />
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
