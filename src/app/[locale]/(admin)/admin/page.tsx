export const dynamic = 'force-dynamic';

import { getLocale, getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Users, BookOpen, CreditCard, PlayCircle } from "lucide-react";

const localeMap: Record<string, string> = {
  pt: "pt-BR",
  en: "en-US",
  ko: "ko-KR",
};

export default async function AdminDashboardPage() {
  await requireAdmin();
  const locale = await getLocale();
  const t = await getTranslations("admin.dashboard");
  const tCommon = await getTranslations("common");
  const supabase = await createClient();

  const [usersResult, subscriptionsResult, coursesResult, lessonsResult] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),
      supabase.from("courses").select("*", { count: "exact", head: true }),
      supabase.from("lessons").select("*", { count: "exact", head: true }),
    ]);

  const stats = [
    {
      label: t("stats.totalStudents"),
      value: usersResult.count ?? 0,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      label: t("stats.activeSubscriptions"),
      value: subscriptionsResult.count ?? 0,
      icon: CreditCard,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      label: t("stats.totalCourses"),
      value: coursesResult.count ?? 0,
      icon: BookOpen,
      color: "text-gold",
      bgColor: "bg-gold/10",
    },
    {
      label: t("stats.totalLessons"),
      value: lessonsResult.count ?? 0,
      icon: PlayCircle,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
  ];

  const { data: recentSignups } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const dateLocale = localeMap[locale] || "pt-BR";

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">{t("title")}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="bg-dark-lighter border-white/5 p-6"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}
                >
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-text">{stat.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="bg-dark-lighter border-white/5 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          {t("recentSignups")}
        </h2>

        {recentSignups && recentSignups.length > 0 ? (
          <div className="space-y-3">
            {recentSignups.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                    <span className="text-gold text-sm font-medium">
                      {(profile.full_name || "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {profile.full_name || tCommon("noName")}
                    </p>
                    <p className="text-gray-text text-xs">{profile.email}</p>
                  </div>
                </div>
                <p className="text-gray-text text-xs">
                  {new Date(profile.created_at).toLocaleDateString(dateLocale)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-text text-sm">{t("noSignups")}</p>
        )}
      </Card>
    </div>
  );
}
