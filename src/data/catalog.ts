import type { ProgramSlug } from "./locations";

/**
 * Stripe catalog reference — lookup keys only, never raw `price_...` IDs.
 * Each program has a single multi-currency Price (CAD default + USD via
 * `currency_options`) carrying `program={slug}` metadata. The catalog is
 * built and maintained in the Stripe Dashboard (Test now, Live at
 * go-live) — this file only records the lookup keys the site depends on.
 */
export const PRICE_LOOKUP_KEYS: Record<ProgramSlug, string> = {
  explorers: "explorers_term_cad",
  builders: "builders_term_cad",
  developers: "developers_term_cad",
  engineers: "engineers_term_cad",
};

export type CheckoutCurrency = "cad" | "usd";

/**
 * Display-only mirror of the per-term amounts on each Stripe Price, for
 * showing a price near the pay button. The actual charge always comes
 * from Stripe (resolved by lookup key) — this is never sent to Stripe.
 */
export const PROGRAM_PRICING: Record<ProgramSlug, Record<CheckoutCurrency, number>> = {
  explorers: { cad: 175, usd: 135 },
  builders: { cad: 175, usd: 135 },
  developers: { cad: 199, usd: 156 },
  engineers: { cad: 199, usd: 156 },
};

export type CheckoutMode = "in_person" | "online";

/**
 * Current class-Refund & Class Minimum Policy version stamped onto every
 * checkout session's metadata and recorded with the order, so a future
 * policy revision never gets attributed to an order accepted under the
 * previous wording. Bump this string whenever the policy copy changes.
 */
export const REFUND_POLICY_VERSION = "2026-07-10";
