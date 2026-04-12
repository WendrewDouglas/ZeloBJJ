"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard } from "lucide-react";
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
        .eq("status", "active")
        .single();

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

  async function openPortal() {
    const res = await fetch("/api/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
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

        {/* Subscription info */}
        <div className="rounded-xl border border-white/5 bg-dark-lighter p-6">
          <h2 className="mb-6 text-lg font-bold text-white">Assinatura</h2>
          {subscription ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-text">Plano atual</p>
                <p className="text-lg font-bold text-gold">
                  {subscription.plan?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-text">Status</p>
                <span className="inline-block rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
                  Ativo
                </span>
              </div>
              {subscription.current_period_end && (
                <div>
                  <p className="text-sm text-gray-text">Próxima cobrança</p>
                  <p className="text-white">
                    {new Date(subscription.current_period_end).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              )}
              <Button onClick={openPortal} variant="outline" className="w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                Gerenciar Assinatura
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-4 text-gray-text">
                Você não possui uma assinatura ativa.
              </p>
              <Link
                href="/#planos"
                className="inline-block rounded-full bg-gold px-6 py-2 text-sm font-semibold text-dark hover:bg-gold-light"
              >
                Ver Planos
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
