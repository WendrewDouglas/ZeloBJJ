import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Pin, Lock } from "lucide-react";

export default async function ForumAdminPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("forum_posts")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-6 h-6 text-gold" />
        <h1 className="text-2xl font-bold text-white">Fórum</h1>
      </div>

      <Card className="bg-dark-lighter border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-gray-text uppercase tracking-wider px-6 py-4">
                  Título
                </th>
                <th className="text-left text-xs font-medium text-gray-text uppercase tracking-wider px-6 py-4">
                  Autor
                </th>
                <th className="text-left text-xs font-medium text-gray-text uppercase tracking-wider px-6 py-4">
                  Categoria
                </th>
                <th className="text-left text-xs font-medium text-gray-text uppercase tracking-wider px-6 py-4">
                  Data
                </th>
                <th className="text-left text-xs font-medium text-gray-text uppercase tracking-wider px-6 py-4">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {posts && posts.length > 0 ? (
                posts.map((post) => {
                  const author = post.profiles as {
                    full_name?: string;
                    email?: string;
                  } | null;

                  return (
                    <tr
                      key={post.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-white text-sm font-medium">
                          {post.title}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-text text-sm">
                        {author?.full_name || author?.email || "Desconhecido"}
                      </td>
                      <td className="px-6 py-4">
                        {post.category ? (
                          <Badge
                            variant="outline"
                            className="text-gray-text border-white/10 text-xs"
                          >
                            {post.category}
                          </Badge>
                        ) : (
                          <span className="text-gray-text text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-text text-sm">
                        {new Date(post.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {post.pinned && (
                            <Badge className="bg-gold/10 text-gold border-gold/20 text-xs">
                              <Pin className="w-3 h-3 mr-1" />
                              Fixado
                            </Badge>
                          )}
                          {post.locked && (
                            <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">
                              <Lock className="w-3 h-3 mr-1" />
                              Trancado
                            </Badge>
                          )}
                          {!post.pinned && !post.locked && (
                            <span className="text-gray-text text-sm">—</span>
                          )}
                        </div>
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
                    Nenhum post encontrado.
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
