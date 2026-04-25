export const dynamic = 'force-dynamic';

import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Clock, User } from "lucide-react";
import { CommentForm } from "@/components/member/comment-form";

interface PostPageProps {
  params: Promise<{ postId: string }>;
}

const localeMap: Record<string, string> = {
  pt: "pt-BR",
  en: "en-US",
  ko: "ko-KR",
};

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params;
  await requireAuth();
  const locale = await getLocale();
  const t = await getTranslations("member.community");
  const tCommon = await getTranslations("common");
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("forum_posts")
    .select("*, author:profiles(full_name, avatar_url), forum_categories(name)")
    .eq("id", postId)
    .single();

  if (!post) {
    notFound();
  }

  const { data: comments } = await supabase
    .from("forum_comments")
    .select("*, author:profiles(full_name, avatar_url)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  const dateLocale = localeMap[locale] || "pt-BR";
  const fullDateOpts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const shortDateOpts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <Link
        href="/comunidade"
        className="inline-flex items-center gap-2 text-sm text-gray-text hover:text-gold transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("back")}
      </Link>

      <article className="rounded-lg border border-white/5 bg-dark-lighter p-6 space-y-4">
        <div>
          <span className="text-xs font-medium text-gold">
            {post.forum_categories?.name}
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">{post.title}</h1>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-text">
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {post.author?.full_name ?? tCommon("anonymous")}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {new Date(post.created_at).toLocaleDateString(dateLocale, fullDateOpts)}
          </span>
        </div>

        <div className="prose prose-invert max-w-none text-gray-text whitespace-pre-wrap">
          {post.content}
        </div>
      </article>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {t("commentsTitle", { count: comments?.length ?? 0 })}
        </h2>

        {comments?.length === 0 && (
          <p className="text-sm text-gray-text">{t("noComments")}</p>
        )}

        <div className="space-y-3">
          {comments?.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border border-white/5 bg-dark-lighter p-4 space-y-2"
            >
              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium text-white">
                  {comment.author?.full_name ?? tCommon("anonymous")}
                </span>
                <span className="text-gray-text">
                  {new Date(comment.created_at).toLocaleDateString(dateLocale, shortDateOpts)}
                </span>
              </div>
              <p className="text-gray-text whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))}
        </div>

        <CommentForm postId={postId} />
      </section>
    </div>
  );
}
