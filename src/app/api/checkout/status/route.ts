import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseReferenceId } from "@/lib/pagbank";

/**
 * Retorna o status atual da subscription para a tela /obrigado fazer polling.
 *
 * Aceita dois identificadores na query (qualquer um basta):
 *  - ?ref=USER_<uuid>__PLAN_<slug>  (nosso reference_id, gerado em /api/checkout)
 *  - ?transaction_id=...           (codigo da transacao do PagBank, vem no redirect
 *                                    quando a URL de redirecionamento esta com
 *                                    "Redirecionamento com o codigo da transacao"
 *                                    ATIVADO no painel)
 *
 * Sem auth: o identificador atua como token de baixa-permissao. Resposta
 * intencionalmente minima ({ status }).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("ref");
  const transactionId = searchParams.get("transaction_id");

  if (!ref && !transactionId) {
    return NextResponse.json({ error: "missing_identifier" }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (ref) {
    const parsed = parseReferenceId(ref);
    if (!parsed) {
      return NextResponse.json({ error: "invalid_ref" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("pagbank_reference_id", ref)
      .maybeSingle();

    if (error) {
      console.error("[checkout/status] erro lendo subscription por ref:", error);
      return NextResponse.json({ error: "lookup_failed" }, { status: 500 });
    }
    return NextResponse.json(
      { status: data?.status ?? null },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  // transactionId path: o id pode bater com pagbank_subscription_id
  // ou com pagbank_last_charge_id (depende de qual evento o PagBank usou).
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status")
    .or(
      `pagbank_subscription_id.eq.${transactionId},pagbank_last_charge_id.eq.${transactionId}`
    )
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[checkout/status] erro lendo subscription por transaction_id:", error);
    return NextResponse.json({ error: "lookup_failed" }, { status: 500 });
  }

  return NextResponse.json(
    { status: data?.status ?? null },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
