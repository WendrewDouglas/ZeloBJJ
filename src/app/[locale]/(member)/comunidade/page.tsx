export const dynamic = 'force-dynamic';

import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import { MessageSquare, Clock, User, FolderOpen } from "lucide-react";

const localeMap: Record<string, string> = {
  pt: "pt-BR",
  en: "en-US",
  ko: "ko-KR",
};

export default async function ComunidadePage() {
  await requireAuth();
  const locale = await getLocale();
  const t = await getTranslations("member.community");
  const tCommon = await getTranslations("common");
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("forum_categories")
    .select("*, forum_posts(count)")
    .order("name");

  const { data: recentPosts } = await supabase
    .from("forum_posts")
    .select(
      "*, author:profiles(full_name, avatar_url), forum_categories(name, slug), forum_comments(count)"
    )
    .order("created_at", { ascending: false })
    .limit(20);

  const dateLocale = localeMap[locale] || "pt-BR";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
        <Link
          href="/comunidade/novo"
          className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-black hover:bg-gold/90 transition-colors"
        >
          {t("newPost")}
        </Link>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{t("categories")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories?.map((category) => (
            <Link
              key={category.id}
              href={`/comunidade?categoria=${category.slug}`}
              className="rounded-lg border border-white/5 bg-dark-lighter p-5 hover:border-gold/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <FolderOpen className="h-5 w-5 text-gold" />
                <h3 className="font-semibold text-white">{category.name}</h3>
              </div>
              <p className="text-sm text-gray-text">
                {t("postsCount", { count: category.forum_posts?.[0]?.count ?? 0 })}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">{t("recentPosts")}</h2>
        <div className="space-y-2">
          {recentPosts?.length === 0 && (
            <p className="text-gray-text">{t("empty")}</p>
          )}
          {recentPosts?.map((post) => (
            <Link
              key={post.id}
              href={`/comunidade/${post.id}`}
              className="block rounded-lg border border-white/5 bg-dark-lighter p-4 hover:border-gold/30 transition-colors"
            >
              <h3 className="font-semibold text-white mb-2">{post.title}</h3>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-text">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {post.author?.full_name ?? tCommon("anonymous")}
                </span>
                <span className="flex items-center gap-1">
                  <FolderOpen className="h-4 w-4" />
                  {post.forum_categories?.name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(post.created_at).toLocaleDateString(dateLocale)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {t("commentsCount", { count: post.forum_comments?.[0]?.count ?? 0 })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
