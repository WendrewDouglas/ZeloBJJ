export const dynamic = 'force-dynamic';

import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";

export default async function PlanosAdminPage() {
  await requireAdmin();
  const t = await getTranslations("admin.plans");
  const tCommon = await getTranslations("common");
  const supabase = await createClient();

  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .order("price", { ascending: true });

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <CreditCard className="w-6 h-6 text-gold" />
        <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
      </div>

      <Card className="bg-dark-lighter border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-gray-text uppercase tracking-wider px-6 py-4">
                  {t("table.name")}
                </th>
                <th className="text-left text-xs font-medium text-gray-text uppercase tracking-wider px-6 py-4">
                  {t("table.slug")}
                </th>
                <th className="text-left text-xs font-medium text-gray-text uppercase tracking-wider px-6 py-4">
                  {t("table.price")}
                </th>
                <th className="text-left text-xs font-medium text-gray-text uppercase tracking-wider px-6 py-4">
                  {t("table.status")}
                </th>
                <th className="text-left text-xs font-medium text-gray-text uppercase tracking-wider px-6 py-4">
                  {t("table.features")}
                </th>
              </tr>
            </thead>
            <tbody>
              {plans && plans.length > 0 ? (
                plans.map((plan) => {
                  const features = Array.isArray(plan.features) ? plan.features : [];
                  const isActive = plan.active !== false;

                  return (
                    <tr
                      key={plan.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-white text-sm font-medium">
                          {plan.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-gray-text text-sm bg-white/5 px-2 py-0.5 rounded">
                          {plan.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-white text-sm">
                        {typeof plan.price === "number"
                          ? `R$ ${plan.price.toFixed(2)}`
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        {isActive ? (
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                            {tCommon("active")}
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-red-500/10 text-red-400 border-red-500/20"
                          >
                            {tCommon("inactive")}
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-text text-sm">
                        {t("featuresCount", { count: features.length })}
                      </td>
                    </tr>
                  );
                })
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
