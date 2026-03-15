"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface CommentFormProps {
  postId: string;
}

export function CommentForm({ postId }: CommentFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Você precisa estar logado para comentar.");
        return;
      }

      const { error: insertError } = await supabase
        .from("forum_comments")
        .insert({
          post_id: postId,
          author_id: user.id,
          content: content.trim(),
        });

      if (insertError) {
        setError("Erro ao enviar comentário. Tente novamente.");
        return;
      }

      setContent("");
      router.refresh();
    } catch {
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Escreva seu comentário..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="bg-dark-lighter border-white/5 text-white placeholder:text-gray-text resize-none"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button
        type="submit"
        disabled={loading || !content.trim()}
        className="bg-gold text-black hover:bg-gold/90 disabled:opacity-50"
      >
        <Send className="h-4 w-4 mr-2" />
        {loading ? "Enviando..." : "Comentar"}
      </Button>
    </form>
  );
}
