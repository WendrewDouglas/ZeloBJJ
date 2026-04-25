export const dynamic = 'force-dynamic';

import { getTranslations } from "next-intl/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BookOpen, Trophy, Clock, TrendingUp } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default async function DashboardPage() {
  const t = await getTranslations("member.dashboard");
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*, plan:plans(*)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  const { count: enrollmentCount } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_active", true);

  const { count: completedLessons } = await supabase
    .from("lesson_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("completed", true);

  const { count: totalLessons } = await supabase
    .from("lessons")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);

  const progressPercent =
    totalLessons && completedLessons
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

  const stats = [
    { label: t("stats.enrolled"), value: enrollmentCount || 0, icon: BookOpen },
    { label: t("stats.completed"), value: completedLessons || 0, icon: Trophy },
    { label: t("stats.progress"), value: `${progressPercent}%`, icon: TrendingUp },
    {
      label: t("stats.currentPlan"),
      value: subscription?.plan?.name || t("stats.noPlan"),
      icon: Clock,
    },
  ];

  const firstName = profile?.full_name?.split(" ")[0] || t("greetingFallback");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          {t("greeting", { name: firstName })}
        </h1>
        <p className="text-gray-text">{t("subtitle")}</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-white/5 bg-dark-lighter p-5"
            >
              <div className="mb-3 flex items-center gap-2">
                <Icon className="h-4 w-4 text-gold" />
                <span className="text-xs text-gray-text">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {!subscription && (
        <div className="mb-8 rounded-xl border border-gold/20 bg-gold/5 p-6">
          <h3 className="mb-2 text-lg font-bold text-white">
            {t("noPlanTitle")}
          </h3>
          <p className="mb-4 text-sm text-gray-text">{t("noPlanDesc")}</p>
          <Link
            href="/#planos"
            className="inline-block rounded-full bg-gold px-6 py-2 text-sm font-semibold text-dark hover:bg-gold-light"
          >
            {t("viewPlans")}
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/cursos"
          className="group rounded-xl border border-white/5 bg-dark-lighter p-6 transition-colors hover:border-gold/20"
        >
          <BookOpen className="mb-3 h-8 w-8 text-gold" />
          <h3 className="mb-1 font-bold text-white group-hover:text-gold">
            {t("actions.myCourses")}
          </h3>
          <p className="text-sm text-gray-text">{t("actions.myCoursesDesc")}</p>
        </Link>

        <Link
          href="/comunidade"
          className="group rounded-xl border border-white/5 bg-dark-lighter p-6 transition-colors hover:border-gold/20"
        >
          <Trophy className="mb-3 h-8 w-8 text-gold" />
          <h3 className="mb-1 font-bold text-white group-hover:text-gold">
            {t("actions.community")}
          </h3>
          <p className="text-sm text-gray-text">{t("actions.communityDesc")}</p>
        </Link>
      </div>
    </div>
  );
}
