import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildReferenceId } from "@/lib/pagbank";
import { createPagbankCheckout } from "@/lib/pagbank/api";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://zelobjj.com.br";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { planSlug } = (await request.json()) as { planSlug?: string };
    if (!planSlug) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    const { data: plan } = await supabase
      .from("plans")
      .select("id, slug, name, price_monthly")
      .eq("slug", planSlug)
      .eq("is_active", true)
      .single();

    if (!plan?.price_monthly) {
      return NextResponse.json(
        { error: "Plano sem valor configurado" },
        { status: 503 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", user.id)
      .single();

    const reference = buildReferenceId(user.id, plan.slug);

    // Se o usuario ja tem subscription ativa (vitalicio), so atualiza o reference_id
    // para tracking — NAO sobrescreve status='paid' por 'pending'. Isso evita downgrade
    // se o usuario re-clicar em "Garantir acesso" depois de ja ter pago.
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .eq("plan_id", plan.id)
      .maybeSingle();

    const ACTIVE_STATUSES = new Set(["paid", "active", "trial"]);
    const isAlreadyActive = existing?.status
      ? ACTIVE_STATUSES.has(existing.status)
      : false;

    if (isAlreadyActive) {
      const { error: updError } = await supabase
        .from("subscriptions")
        .update({ pagbank_reference_id: reference })
        .eq("user_id", user.id)
        .eq("plan_id", plan.id);
      if (updError) {
        console.error("[checkout] erro ao atualizar reference_id:", updError);
      }
    } else {
      // Cria/atualiza subscription como pending antes de mandar o usuario para o PagBank.
      // Isso permite que /obrigado e /api/checkout/status encontrem o registro mesmo
      // antes do primeiro webhook chegar, e elimina o "race condition" onde o aluno
      // volta ao dashboard antes do PagBank notificar e ve "sem plano".
      const { error: upsertError } = await supabase.from("subscriptions").upsert(
        {
          user_id: user.id,
          plan_id: plan.id,
          status: "pending",
          pagbank_reference_id: reference,
        },
        { onConflict: "user_id,plan_id" }
      );

      if (upsertError) {
        // Nao bloqueia o checkout — webhook ainda consegue criar a subscription depois.
        console.error("[checkout] erro ao gravar subscription pending:", upsertError);
      }
    }

    // V4 hosted checkout: cria order com reference_id e notification_urls.
    // Substitui o antigo link estatico pag.ae, que so disparava NPI legacy e gerava
    // vendas orfas (webhook V4 nao chegava). Doc: api.pagseguro.com/checkouts.
    const unitAmount = Math.round(Number(plan.price_monthly) * 100);
    const buyerEmail = profile?.email ?? user.email;

    const checkout = await createPagbankCheckout({
      referenceId: reference,
      items: [
        {
          name: plan.name,
          quantity: 1,
          unit_amount: unitAmount,
        },
      ],
      customer: buyerEmail
        ? {
            name: profile?.full_name?.trim() || buyerEmail.split("@")[0],
            email: buyerEmail,
          }
        : undefined,
      notificationUrl: `${APP_URL}/api/webhooks/pagbank`,
      paymentNotificationUrl: `${APP_URL}/api/webhooks/pagbank`,
      redirectUrl: `${APP_URL}/obrigado`,
    });

    return NextResponse.json({ url: checkout.payUrl });
  } catch (error) {
    console.error("Checkout error:", error);
    const message = error instanceof Error ? error.message : "Erro ao gerar link de pagamento";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
