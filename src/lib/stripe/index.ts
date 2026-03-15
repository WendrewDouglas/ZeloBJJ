import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const PLAN_PRICE_MAP: Record<string, string> = {
  iniciante: process.env.STRIPE_PRICE_INICIANTE || "",
  completo: process.env.STRIPE_PRICE_COMPLETO || "",
  presencial: process.env.STRIPE_PRICE_PRESENCIAL || "",
};
