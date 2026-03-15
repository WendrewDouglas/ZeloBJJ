import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Settings, Database, Shield, Bell, Palette } from "lucide-react";

export default async function ConfiguracoesAdminPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [plansResult, coursesResult] = await Promise.all([
    supabase.from("plans").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }),
  ]);

  const sections = [
    {
      title: "Geral",
      description:
        "Configurações gerais da plataforma, como nome, logo e informações de contato.",
      icon: Settings,
      status: "Em breve",
    },
    {
      title: "Segurança",
      description:
        "Gerenciamento de permissões, políticas de senha e autenticação.",
      icon: Shield,
      status: "Em breve",
    },
    {
      title: "Notificações",
      description:
        "Configurações de e-mail, notificações push e alertas do sistema.",
      icon: Bell,
      status: "Em breve",
    },
    {
      title: "Aparência",
      description: "Personalização de cores, fontes e tema da plataforma.",
      icon: Palette,
      status: "Em breve",
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-6 h-6 text-gold" />
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
      </div>

      {/* App Info */}
      <Card className="bg-dark-lighter border-white/5 p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-5 h-5 text-gold" />
          <h2 className="text-lg font-semibold text-white">
            Informações da Plataforma
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
            <p className="text-gray-text text-xs uppercase tracking-wider mb-1">
              Total de Planos
            </p>
            <p className="text-white text-xl font-bold">
              {plansResult.count ?? 0}
            </p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
            <p className="text-gray-text text-xs uppercase tracking-wider mb-1">
              Total de Cursos
            </p>
            <p className="text-white text-xl font-bold">
              {coursesResult.count ?? 0}
            </p>
          </div>
        </div>
      </Card>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <Card
              key={section.title}
              className="bg-dark-lighter border-white/5 p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-gray-text" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-medium">{section.title}</h3>
                    <span className="text-xs text-gray-text bg-white/5 px-2 py-0.5 rounded">
                      {section.status}
                    </span>
                  </div>
                  <p className="text-gray-text text-sm">
                    {section.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
