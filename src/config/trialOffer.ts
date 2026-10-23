import type { ProgramSlug } from "@/data/locations";

/**
 * November 2026 free trial class. One source of truth for the offer's dates,
 * terms and Stripe Payment Links, so the banner, hero and trial section can
 * never disagree.
 *
 * The trial links are separate Stripe products from the full-semester links in
 * src/lib/payment-links.ts: do not swap one for the other.
 *
 * Booking buttons are live only between OPENS_AT and CLOSES_AT (Toronto time),
 * checked in the visitor's browser, so a static build never goes stale. Before
 * the window they read "Opens Nov 1"; after it the offer disappears.
 */

/** Nov 1, 2026 00:00 in Toronto (still EDT until 2 AM that day). */
export const TRIAL_OPENS_AT = "2026-11-01T00:00:00-04:00";

/** Dec 1, 2026 00:00 in Toronto (EST): the end of Nov 30. */
export const TRIAL_CLOSES_AT = "2026-12-01T00:00:00-05:00";

export const TRIAL_MONTH_LABEL = "November 2026";

export type TrialPhase = "soon" | "open" | "closed";

export function trialPhase(now: Date = new Date()): TrialPhase {
  const t = now.getTime();
  if (t < Date.parse(TRIAL_OPENS_AT)) return "soon";
  if (t < Date.parse(TRIAL_CLOSES_AT)) return "open";
  return "closed";
}

/** Stripe Payment Link for each program's free trial class. */
export const TRIAL_LINKS: Record<ProgramSlug, string> = {
  explorers: "https://buy.stripe.com/cNi7sFgiTfw9fjH0ridAk0o",
  builders: "https://buy.stripe.com/8x2cMZ4Ab2Jn8Vj8XOdAk0n",
  developers: "https://buy.stripe.com/14A8wJgiT0Bf9Zn7TKdAk0m",
  engineers: "https://buy.stripe.com/dRm6oBeaLcjX1sRde4dAk0l",
};

/** The offer's rules, in the order parents should read them. */
export const TRIAL_TERMS = [
  "Register and attend your free class in November 2026.",
  "One free trial class per student.",
  "One program per student. Pick the level that matches your child's grade.",
  "Valid for in-person classes in Oshawa and live online classes.",
];
