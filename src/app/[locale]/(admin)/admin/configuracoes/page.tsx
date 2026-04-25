export const dynamic = 'force-dynamic';

import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Settings, Database, Shield, Bell, Palette } from "lucide-react";

export default async function ConfiguracoesAdminPage() {
  await requireAdmin();
  const t = await getTranslations("admin.settings");
  const tCommon = await getTranslations("common");
  const supabase = await createClient();

  const [plansResult, coursesResult] = await Promise.all([
    supabase.from("plans").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }),
  ]);

  const sections = [
    {
      title: t("sections.general.title"),
      description: t("sections.general.description"),
      icon: Settings,
    },
    {
      title: t("sections.security.title"),
      description: t("sections.security.description"),
      icon: Shield,
    },
    {
      title: t("sections.notifications.title"),
      description: t("sections.notifications.description"),
      icon: Bell,
    },
    {
      title: t("sections.appearance.title"),
      description: t("sections.appearance.description"),
      icon: Palette,
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-6 h-6 text-gold" />
        <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
      </div>

      <Card className="bg-dark-lighter border-white/5 p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-5 h-5 text-gold" />
          <h2 className="text-lg font-semibold text-white">{t("platformInfo")}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
            <p className="text-gray-text text-xs uppercase tracking-wider mb-1">
              {t("totalPlans")}
            </p>
            <p className="text-white text-xl font-bold">{plansResult.count ?? 0}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
            <p className="text-gray-text text-xs uppercase tracking-wider mb-1">
              {t("totalCourses")}
            </p>
            <p className="text-white text-xl font-bold">{coursesResult.count ?? 0}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <Card
              key={section.title}
              className="bg-dark-lighter border-white/5 p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-gray-text" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-medium">{section.title}</h3>
                    <span className="text-xs text-gray-text bg-white/5 px-2 py-0.5 rounded">
                      {tCommon("comingSoon")}
                    </span>
                  </div>
                  <p className="text-gray-text text-sm">{section.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
