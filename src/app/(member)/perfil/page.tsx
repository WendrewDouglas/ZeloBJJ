"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";
import type { Profile, SubscriptionWithPlan } from "@/types";

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (p) {
        setProfile(p);
        setFullName(p.full_name || "");
        setPhone(p.phone || "");
      }

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*, plan:plans(*)")
        .eq("user_id", user.id)
        .in("status", ["active", "paid"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setSubscription(sub);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", profile!.id);

    if (error) {
      setMessage("Erro ao salvar.");
    } else {
      setMessage("Perfil atualizado!");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-white">Meu Perfil</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Profile form */}
        <div className="rounded-xl border border-white/5 bg-dark-lighter p-6">
          <h2 className="mb-6 text-lg font-bold text-white">Dados Pessoais</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={profile?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
            {message && (
              <p className={`text-sm ${message.includes("Erro") ? "text-red-500" : "text-green-500"}`}>
                {message}
              </p>
            )}
            <Button type="submit" className="bg-gold text-dark hover:bg-gold-light" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar
            </Button>
          </form>
        </div>

        {/* Acesso ao curso */}
        <div className="rounded-xl border border-white/5 bg-dark-lighter p-6">
          <h2 className="mb-6 text-lg font-bold text-white">Acesso ao Curso</h2>
          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-gold/30 bg-gold/5 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="font-bold text-gold">Acesso Vitalicio Liberado</p>
                  <p className="mt-1 text-xs text-gray-text">
                    Pagamento unico confirmado. Voce tem acesso permanente ao curso.
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-text">Produto</p>
                <p className="font-medium text-white">{subscription.plan?.name}</p>
              </div>
              {subscription.paid_at && (
                <div>
                  <p className="text-sm text-gray-text">Comprado em</p>
                  <p className="text-white">
                    {new Date(subscription.paid_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-4 text-gray-text">
                Voce ainda nao adquiriu o curso.
              </p>
              <Link
                href="/#planos"
                className="inline-block rounded-full bg-gold px-6 py-2 text-sm font-semibold text-dark hover:bg-gold-light"
              >
                Comprar Agora
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
