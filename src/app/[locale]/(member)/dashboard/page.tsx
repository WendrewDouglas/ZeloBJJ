export const dynamic = 'force-dynamic';

import { getTranslations } from "next-intl/server";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BookOpen, Trophy, Clock, TrendingUp, PlayCircle, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { WelcomeToast } from "@/components/member/welcome-toast";

const ACTIVE_STATUSES = new Set(["paid", "active", "trial"]);

export default async function DashboardPage() {
  const t = await getTranslations("member.dashboard");
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Pega a subscription mais recente (qualquer status) — para mostrar pending corretamente.
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*, plan:plans(*)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const hasActiveAccess = subscription && ACTIVE_STATUSES.has(subscription.status);
  const isPending = subscription && subscription.status === "pending";

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

  // Resolve a primeira aula do primeiro curso publicado para a CTA "comece agora".
  let firstLessonHref: string | null = null;
  if (hasActiveAccess && (!completedLessons || completedLessons === 0)) {
    firstLessonHref = await resolveFirstLessonHref(supabase, user.id);
  }

  const stats = [
    { label: t("stats.enrolled"), value: enrollmentCount || 0, icon: BookOpen },
    { label: t("stats.completed"), value: completedLessons || 0, icon: Trophy },
    { label: t("stats.progress"), value: `${progressPercent}%`, icon: TrendingUp },
    {
      label: t("stats.currentPlan"),
      value: hasActiveAccess
        ? subscription?.plan?.name || t("stats.noPlan")
        : isPending
          ? t("stats.pendingPlan")
          : t("stats.noPlan"),
      icon: Clock,
    },
  ];

  const firstName = profile?.full_name?.split(" ")[0] || t("greetingFallback");

  return (
    <div>
      <WelcomeToast />

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

      {firstLessonHref && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-gold/5 p-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="mb-1 text-lg font-bold text-white">
                {t("firstLessonTitle")}
              </h3>
              <p className="text-sm text-gray-text">{t("firstLessonDesc")}</p>
            </div>
            <Link
              href={firstLessonHref}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-dark shadow-lg transition-colors hover:bg-gold-light"
            >
              <PlayCircle className="h-4 w-4" />
              {t("firstLessonCta")}
            </Link>
          </div>
        </div>
      )}

      {isPending && (
        <div className="mb-8 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6">
          <div className="mb-2 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
            <h3 className="text-lg font-bold text-white">
              {t("paymentPendingTitle")}
            </h3>
          </div>
          <p className="mb-4 text-sm text-gray-text">{t("paymentPendingDesc")}</p>
          {subscription?.plan?.payment_link && (
            <a
              href={subscription.plan.payment_link}
              className="inline-block rounded-full border border-yellow-400/40 bg-transparent px-6 py-2 text-sm font-semibold text-yellow-300 hover:bg-yellow-500/10"
            >
              {t("paymentPendingCta")}
            </a>
          )}
        </div>
      )}

      {!subscription && (
        <div className="mb-8 rounded-xl border border-gold/20 bg-gold/5 p-6">
          <h3 className="mb-2 text-lg font-bold text-white">
            {t("noPlanTitle")}
          </h3>
          <p className="mb-4 text-sm text-gray-text">{t("noPlanDesc")}</p>
          <Link
            href="/#oferta"
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

type SupabaseFromCreateClient = Awaited<ReturnType<typeof createClient>>;

async function resolveFirstLessonHref(
  supabase: SupabaseFromCreateClient,
  userId: string
): Promise<string | null> {
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("enrolled_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!enrollment?.course_id) return null;

  const { data: firstModule } = await supabase
    .from("course_modules")
    .select("id")
    .eq("course_id", enrollment.course_id)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!firstModule?.id) return null;

  const { data: firstLesson } = await supabase
    .from("lessons")
    .select("id")
    .eq("module_id", firstModule.id)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!firstLesson?.id) return null;

  return `/cursos/${enrollment.course_id}/aulas/${firstLesson.id}`;
}
