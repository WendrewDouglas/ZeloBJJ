import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export default async function AlunosPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch subscriptions for all profiles
  const profileIds = profiles?.map((p) => p.id) ?? [];
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*, plans(name)")
    .in("user_id", profileIds);

  const subscriptionMap = new Map(
    subscriptions?.map((s) => [s.user_id, s]) ?? []
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-gold" />
          <h1 className="text-2xl font-bold text-white">Alunos</h1>
        </div>
        <p className="text-gray-text text-sm">
          {profiles?.length ?? 0} aluno(s) encontrado(s)
        </p>
      </div>

      <Card className="bg-dark-lighter border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-gray-text uppercase tracking-wider px-6 py-4">
                  Nome
                </th>
                <th className="text-left text-xs font-medium text-gray-text uppercase tracking-wider px-6 py-4">
                  E-mail
                </th>
                <th className="text-left text-xs font-medium text-gray-text uppercase tracking-wider px-6 py-4">
                  Plano
                </th>
                <th className="text-left text-xs font-medium text-gray-text uppercase tracking-wider px-6 py-4">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-gray-text uppercase tracking-wider px-6 py-4">
                  Data de Cadastro
                </th>
              </tr>
            </thead>
            <tbody>
              {profiles && profiles.length > 0 ? (
                profiles.map((profile) => {
                  const subscription = subscriptionMap.get(profile.id);
                  const planName =
                    (subscription?.plans as { name?: string })?.name ?? "—";
                  const isActive = subscription?.status === "active";

                  return (
                    <tr
                      key={profile.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-gold text-sm font-medium">
                              {(profile.full_name || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                          <span className="text-white text-sm font-medium">
                            {profile.full_name || "Sem nome"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-text text-sm">
                        {profile.email}
                      </td>
                      <td className="px-6 py-4 text-gray-text text-sm">
                        {planName}
                      </td>
                      <td className="px-6 py-4">
                        {subscription ? (
                          <Badge
                            variant={isActive ? "default" : "secondary"}
                            className={
                              isActive
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                            }
                          >
                            {isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-white/5 text-gray-text border-white/10"
                          >
                            Sem plano
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-text text-sm">
                        {new Date(profile.created_at).toLocaleDateString(
                          "pt-BR"
                        )}
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
                    Nenhum aluno encontrado.
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
