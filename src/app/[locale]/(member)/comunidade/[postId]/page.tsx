export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, User } from "lucide-react";
import { CommentForm } from "@/components/member/comment-form";

interface PostPageProps {
  params: Promise<{ postId: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params;
  const session = await requireAuth();
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <Link
        href="/comunidade"
        className="inline-flex items-center gap-2 text-sm text-gray-text hover:text-gold transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Comunidade
      </Link>

      {/* Post */}
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
            {post.author?.full_name ?? "Anônimo"}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {new Date(post.created_at).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div className="prose prose-invert max-w-none text-gray-text whitespace-pre-wrap">
          {post.content}
        </div>
      </article>

      {/* Comments */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">
          Comentários ({comments?.length ?? 0})
        </h2>

        {comments?.length === 0 && (
          <p className="text-sm text-gray-text">
            Nenhum comentário ainda. Seja o primeiro!
          </p>
        )}

        <div className="space-y-3">
          {comments?.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border border-white/5 bg-dark-lighter p-4 space-y-2"
            >
              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium text-white">
                  {comment.author?.full_name ?? "Anônimo"}
                </span>
                <span className="text-gray-text">
                  {new Date(comment.created_at).toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
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
