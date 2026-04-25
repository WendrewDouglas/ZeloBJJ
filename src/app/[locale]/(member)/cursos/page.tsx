export const dynamic = 'force-dynamic';

import { getTranslations } from "next-intl/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { BookOpen, Lock } from "lucide-react";

export default async function CursosPage() {
  const t = await getTranslations("member.courses");
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const enrolledCourseIds = new Set(enrollments?.map((e) => e.course_id) || []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
        <p className="text-gray-text">{t("subtitle")}</p>
      </div>

      {!courses?.length ? (
        <div className="rounded-xl border border-white/5 bg-dark-lighter p-12 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-text" />
          <h3 className="mb-2 text-lg font-bold text-white">{t("empty")}</h3>
          <p className="text-sm text-gray-text">{t("emptyDesc")}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const isEnrolled = enrolledCourseIds.has(course.id);
            return (
              <Link
                key={course.id}
                href={isEnrolled ? `/cursos/${course.id}` : "#"}
                className={`group relative rounded-xl border bg-dark-lighter overflow-hidden transition-colors ${
                  isEnrolled
                    ? "border-white/5 hover:border-gold/20"
                    : "border-white/5 opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="flex h-40 items-center justify-center bg-gradient-to-br from-gold/10 to-green-dark/10">
                  <BookOpen className="h-12 w-12 text-gold/50" />
                </div>

                <div className="p-5">
                  <h3 className="mb-2 font-bold text-white group-hover:text-gold">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-text line-clamp-2">
                    {course.description}
                  </p>
                </div>

                {!isEnrolled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-dark/60">
                    <div className="text-center">
                      <Lock className="mx-auto mb-2 h-8 w-8 text-gray-text" />
                      <p className="text-sm text-gray-text">{t("subscribeToAccess")}</p>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
