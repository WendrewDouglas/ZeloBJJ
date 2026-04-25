export const dynamic = 'force-dynamic';

import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default async function CursosAdminPage() {
  await requireAdmin();
  const t = await getTranslations("admin.courses");
  const tCommon = await getTranslations("common");
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  const courseIds = courses?.map((c) => c.id) ?? [];

  const { data: modules } = await supabase
    .from("modules")
    .select("id, course_id")
    .in("course_id", courseIds);

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, module_id, modules(course_id)")
    .in("module_id", modules?.map((m) => m.id) ?? []);

  const modulesCountMap = new Map<string, number>();
  const lessonsCountMap = new Map<string, number>();

  modules?.forEach((m) => {
    modulesCountMap.set(m.course_id, (modulesCountMap.get(m.course_id) ?? 0) + 1);
  });

  lessons?.forEach((l) => {
    const courseId = (l.modules as { course_id?: string })?.course_id;
    if (courseId) {
      lessonsCountMap.set(courseId, (lessonsCountMap.get(courseId) ?? 0) + 1);
    }
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-gold" />
          <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
        </div>
        <Button className="bg-gold hover:bg-gold-light text-black font-medium">
          <Plus className="w-4 h-4 mr-2" />
          {t("newCourse")}
        </Button>
      </div>

      <Card className="bg-dark-lighter border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-gray-text uppercase tracking-wider px-6 py-4">
                  {t("table.title")}
                </th>
                <th className="text-left text-xs font-medium text-gray-text uppercase tracking-wider px-6 py-4">
                  {t("table.status")}
                </th>
                <th className="text-left text-xs font-medium text-gray-text uppercase tracking-wider px-6 py-4">
                  {t("table.modules")}
                </th>
                <th className="text-left text-xs font-medium text-gray-text uppercase tracking-wider px-6 py-4">
                  {t("table.lessons")}
                </th>
                <th className="text-left text-xs font-medium text-gray-text uppercase tracking-wider px-6 py-4">
                  {t("table.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {courses && courses.length > 0 ? (
                courses.map((course) => (
                  <tr
                    key={course.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-white text-sm font-medium">
                        {course.title}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {course.published ? (
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                          {t("published")}
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        >
                          {tCommon("draft")}
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-text text-sm">
                      {modulesCountMap.get(course.id) ?? 0}
                    </td>
                    <td className="px-6 py-4 text-gray-text text-sm">
                      {lessonsCountMap.get(course.id) ?? 0}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/cursos/${course.id}`}
                        className="text-gold hover:text-gold-light text-sm font-medium transition-colors"
                      >
                        {t("edit")}
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-text text-sm"
                  >
                    {t("empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
