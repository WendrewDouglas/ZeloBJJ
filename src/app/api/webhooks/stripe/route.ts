import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe ainda não configurado" },
      { status: 503 }
    );
  }

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(supabase, session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(supabase, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(supabase, invoice);
        break;
      }
    }

    // Audit log
    await supabase.from("audit_logs").insert({
      action: `stripe.${event.type}`,
      entity_type: "stripe_event",
      entity_id: event.id,
      metadata: { type: event.type },
    });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(
  supabase: ReturnType<typeof createAdminClient>,
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.supabase_user_id;
  const planSlug = session.metadata?.plan_slug;

  if (!userId || !planSlug) return;

  // Get plan
  const { data: plan } = await supabase
    .from("plans")
    .select("*")
    .eq("slug", planSlug)
    .single();

  if (!plan) return;

  // Get Stripe subscription details
  const stripeSubscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  ) as unknown as Stripe.Subscription & { current_period_start: number; current_period_end: number };

  // Create or update subscription
  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      plan_id: plan.id,
      stripe_subscription_id: stripeSubscription.id,
      status: "active",
      current_period_start: new Date(
        stripeSubscription.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        stripeSubscription.current_period_end * 1000
      ).toISOString(),
    },
    { onConflict: "stripe_subscription_id" }
  );

  // Enroll in courses based on plan
  const { data: courses } = await supabase
    .from("courses")
    .select("id")
    .eq("is_published", true);

  if (courses) {
    const enrollments = courses.map((course) => ({
      user_id: userId,
      course_id: course.id,
      plan_id: plan.id,
      is_active: true,
    }));

    await supabase.from("enrollments").upsert(enrollments, {
      onConflict: "user_id,course_id",
    });
  }
}

async function handleSubscriptionUpdated(
  supabase: ReturnType<typeof createAdminClient>,
  subscription: Stripe.Subscription
) {
  const status = subscription.status as string;
  const sub = subscription as Stripe.Subscription & { current_period_start: number; current_period_end: number };

  await supabase
    .from("subscriptions")
    .update({
      status,
      current_period_start: new Date(
        sub.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        sub.current_period_end * 1000
      ).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq("stripe_subscription_id", subscription.id);

  // If not active, deactivate enrollments
  if (status !== "active" && status !== "trialing") {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", subscription.id)
      .single();

    if (sub) {
      await supabase
        .from("enrollments")
        .update({ is_active: false })
        .eq("user_id", sub.user_id);
    }
  }
}

async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof createAdminClient>,
  subscription: Stripe.Subscription
) {
  await supabase
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("stripe_subscription_id", subscription.id);

  // Deactivate enrollments
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (sub) {
    await supabase
      .from("enrollments")
      .update({ is_active: false })
      .eq("user_id", sub.user_id);
  }
}

async function handlePaymentFailed(
  supabase: ReturnType<typeof createAdminClient>,
  invoice: Stripe.Invoice
) {
  const subscriptionId = (invoice as unknown as { subscription?: string }).subscription;
  if (!subscriptionId) return;

  await supabase
    .from("subscriptions")
    .update({ status: "past_due" })
    .eq("stripe_subscription_id", subscriptionId);
}
