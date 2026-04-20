"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

type Stage = "checking" | "ready" | "invalid" | "saving" | "done";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();

    async function init() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      // Caso 1: veio direto do email com ?code=... (PKCE)
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setStage("invalid");
          return;
        }
        // Limpa o code da URL
        url.searchParams.delete("code");
        window.history.replaceState({}, "", url.toString());
        setStage("ready");
        return;
      }

      // Caso 2: callback ja trocou o code e redirecionou aqui — checa sessao
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setStage("ready");
        return;
      }

      setStage("invalid");
    }

    init();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("A senha precisa ter ao menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas nao conferem.");
      return;
    }

    setStage("saving");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setStage("ready");
      return;
    }

    setStage("done");
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  if (stage === "checking") {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  if (stage === "invalid") {
    return (
      <div className="text-center">
        <h2 className="mb-3 text-2xl font-bold text-white">Link expirado ou invalido</h2>
        <p className="mb-6 text-sm text-gray-text">
          Este link de redefinicao de senha nao e mais valido. Peca um novo
          clicando no botao abaixo.
        </p>
        <Link href="/recuperar-senha">
          <Button className="bg-gold text-dark hover:bg-gold-light">
            Solicitar novo link
          </Button>
        </Link>
        <p className="mt-4 text-xs text-gray-text">
          <Link href="/login" className="text-gold hover:underline">
            <ArrowLeft className="mr-1 inline h-3 w-3" />
            Voltar para o login
          </Link>
        </p>
      </div>
    );
  }

  if (stage === "done") {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-gold" />
        <h2 className="mb-2 text-2xl font-bold text-white">Senha atualizada</h2>
        <p className="text-sm text-gray-text">Redirecionando para o seu dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-white">Definir nova senha</h2>
      <p className="mb-8 text-sm text-gray-text">
        Crie uma senha forte para sua conta. Minimo de 8 caracteres.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Nova senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmar senha</Label>
          <Input
            id="confirm"
            type="password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            minLength={8}
            required
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          type="submit"
          className="w-full bg-gold text-dark hover:bg-gold-light"
          disabled={stage === "saving"}
        >
          {stage === "saving" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar nova senha
        </Button>
      </form>
    </div>
  );
}
