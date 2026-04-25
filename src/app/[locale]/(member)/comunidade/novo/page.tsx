export const dynamic = 'force-dynamic';

import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { NewPostForm } from "@/components/member/new-post-form";

export default async function NovoPostPage() {
  await requireAuth();
  const t = await getTranslations("member.community");
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("forum_categories")
    .select("id, name, slug")
    .order("name");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/comunidade"
        className="inline-flex items-center gap-2 text-sm text-gray-text hover:text-gold transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("back")}
      </Link>

      <h1 className="text-2xl font-bold text-white">{t("newPost")}</h1>

      <div className="rounded-lg border border-white/5 bg-dark-lighter p-6">
        <NewPostForm categories={categories ?? []} />
      </div>
    </div>
  );
}
