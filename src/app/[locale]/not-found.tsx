export const dynamic = 'force-dynamic';

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gold mb-4">{t("code")}</h1>
        <h2 className="text-2xl font-semibold mb-4">{t("title")}</h2>
        <p className="text-gray-400 mb-8">{t("subtitle")}</p>
        <Link
          href="/"
          className="px-6 py-3 bg-gold text-dark font-semibold rounded-lg hover:bg-gold/90 transition-colors"
        >
          {t("back")}
        </Link>
      </div>
    </div>
  );
}
