import Stripe from "stripe";
import { getEnv } from "./env";

/**
 * Stripe's default Node HTTP client uses the `http`/`https` modules, which
 * don't exist on Cloudflare's edge runtime — the fetch-based client keeps
 * this working under `export const runtime = "edge"`.
 */
export function getStripeClient(): Stripe {
  const secretKey = getEnv().STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(secretKey, {
    httpClient: Stripe.createFetchHttpClient(),
  });
}
