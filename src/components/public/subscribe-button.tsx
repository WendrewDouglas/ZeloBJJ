"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

type Props = {
  planSlug: "curso_digital";
  planName: string;
  featured?: boolean;
};

export function SubscribeButton({ planSlug, planName, featured }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug }),
      });

      if (res.status === 401) {
        const next = encodeURIComponent(`/?comprar=${planSlug}`);
        window.location.href = `/cadastro?redirect=${next}`;
        return;
      }

      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? `Nao foi possivel abrir o checkout do ${planName}`);
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setError("Erro de rede. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`flex w-full items-center justify-center gap-2 rounded-full py-3 text-center font-semibold transition-colors disabled:opacity-60 ${
          featured
            ? "bg-gold text-dark hover:bg-gold-light"
            : "border border-white/20 text-white hover:border-gold hover:text-gold"
        }`}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Abrindo checkout..." : "Comprar Agora"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
