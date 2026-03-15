"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface NewPostFormProps {
  categories: { id: string; name: string; slug: string }[];
}

export function NewPostForm({ categories }: NewPostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !categoryId || !content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Você precisa estar logado para criar um post.");
        return;
      }

      const { data, error: insertError } = await supabase
        .from("forum_posts")
        .insert({
          title: title.trim(),
          content: content.trim(),
          category_id: categoryId,
          author_id: user.id,
        })
        .select("id")
        .single();

      if (insertError || !data) {
        setError("Erro ao criar post. Tente novamente.");
        return;
      }

      router.push(`/comunidade/${data.id}`);
    } catch {
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-white">
          Título
        </label>
        <Input
          id="title"
          placeholder="Título do post"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-dark-lighter border-white/5 text-white placeholder:text-gray-text"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-medium text-white">
          Categoria
        </label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-md border border-white/5 bg-dark-lighter px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold"
        >
          <option value="" disabled>
            Selecione uma categoria
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium text-white">
          Conteúdo
        </label>
        <Textarea
          id="content"
          placeholder="Escreva o conteúdo do seu post..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="bg-dark-lighter border-white/5 text-white placeholder:text-gray-text resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button
        type="submit"
        disabled={loading || !title.trim() || !categoryId || !content.trim()}
        className="bg-gold text-black hover:bg-gold/90 disabled:opacity-50"
      >
        <Send className="h-4 w-4 mr-2" />
        {loading ? "Publicando..." : "Publicar Post"}
      </Button>
    </form>
  );
}
