import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : (null as unknown as Stripe);

export const PLAN_PRICE_MAP: Record<string, string> = {
  iniciante: process.env.STRIPE_PRICE_INICIANTE || "",
  completo: process.env.STRIPE_PRICE_COMPLETO || "",
  presencial: process.env.STRIPE_PRICE_PRESENCIAL || "",
};
