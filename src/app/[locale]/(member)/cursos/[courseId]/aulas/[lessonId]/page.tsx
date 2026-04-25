export const dynamic = 'force-dynamic';

import { getLocale, getTranslations } from "next-intl/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Link, redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { VideoPlayer } from "@/components/member/video-player";
import { LessonProgressButton } from "@/components/member/lesson-progress-button";
import { getLessonVideoUrl } from "@/lib/storage/video";

interface Props {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function LessonPage({ params }: Props) {
  const { courseId, lessonId } = await params;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("member.lesson");
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .eq("is_active", true)
    .single();

  if (!enrollment) {
    redirect({ href: "/cursos", locale });
  }

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*, module:course_modules(*)")
    .eq("id", lessonId)
    .single();

  if (!lesson) {
    redirect({ href: `/cursos/${courseId}`, locale });
  }

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .single();

  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, title, sort_order, module_id")
    .eq("module_id", lesson.module_id)
    .eq("is_published", true)
    .order("sort_order");

  const currentIndex = allLessons?.findIndex((l) => l.id === lessonId) ?? -1;
  const prevLesson = currentIndex > 0 ? allLessons![currentIndex - 1] : null;
  const nextLesson =
    allLessons && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/cursos/${courseId}`}
          className="inline-flex items-center text-sm text-gray-text hover:text-gold"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t("back")}
        </Link>
      </div>

      <div className="mb-6 overflow-hidden rounded-xl border border-white/5 bg-dark-lighter">
        <VideoPlayer
          videoUrl={await getLessonVideoUrl(supabase, lesson)}
          bunnyVideoId={lesson.bunny_video_id}
        />
      </div>

      <div className="mb-6">
        <p className="mb-1 text-xs font-bold text-gold">
          {lesson.module?.title}
        </p>
        <h1 className="mb-3 text-2xl font-bold text-white">{lesson.title}</h1>
        {lesson.description && (
          <p className="text-gray-text">{lesson.description}</p>
        )}
      </div>

      <div className="mb-8">
        <LessonProgressButton
          lessonId={lessonId}
          completed={progress?.completed || false}
        />
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-6">
        {prevLesson ? (
          <Link
            href={`/cursos/${courseId}/aulas/${prevLesson.id}`}
            className="flex items-center gap-2 text-sm text-gray-text hover:text-gold"
          >
            <ChevronLeft className="h-4 w-4" />
            {prevLesson.title}
          </Link>
        ) : (
          <div />
        )}
        {nextLesson ? (
          <Link
            href={`/cursos/${courseId}/aulas/${nextLesson.id}`}
            className="flex items-center gap-2 text-sm text-gray-text hover:text-gold"
          >
            {nextLesson.title}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
