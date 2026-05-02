import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseReferenceId } from "@/lib/pagbank";

/**
 * Retorna o status atual da subscription para a tela /obrigado fazer polling.
 *
 * Sem auth: a `ref` (reference_id) ja eh o token. So responde { status }, sem
 * dados pessoais. UUID v4 dentro da ref dificulta enumeracao.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("ref");

  if (!ref) {
    return NextResponse.json({ error: "missing_ref" }, { status: 400 });
  }

  const parsed = parseReferenceId(ref);
  if (!parsed) {
    return NextResponse.json({ error: "invalid_ref" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("pagbank_reference_id", ref)
    .maybeSingle();

  if (error) {
    console.error("[checkout/status] erro lendo subscription:", error);
    return NextResponse.json({ error: "lookup_failed" }, { status: 500 });
  }

  return NextResponse.json(
    { status: data?.status ?? null },
    {
      headers: {
        // Sem cache — o status muda em segundos.
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
