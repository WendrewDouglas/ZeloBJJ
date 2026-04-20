import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildCheckoutUrl, buildReferenceId } from "@/lib/pagbank";

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
      .select("id, slug, payment_link")
      .eq("slug", planSlug)
      .eq("is_active", true)
      .single();

    if (!plan?.payment_link) {
      return NextResponse.json(
        { error: "Plano sem link de pagamento configurado" },
        { status: 503 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", user.id)
      .single();

    const reference = buildReferenceId(user.id, plan.slug);
    const url = buildCheckoutUrl(plan.payment_link, reference, profile?.email ?? user.email);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar link de pagamento" },
      { status: 500 }
    );
  }
}
