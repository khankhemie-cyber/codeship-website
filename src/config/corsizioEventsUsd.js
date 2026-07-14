/**
 * USD Corsizio account stub for Guyana (/gy/:slug) markets. Corsizio is
 * one-currency-per-account, so USD registrations need a SEPARATE Corsizio
 * account from the CAD one in corsizioEvents.js. That account doesn't
 * exist yet — every value below is null until it's created, and /gy/:slug
 * CTAs show an "opening soon" placeholder instead of linking out.
 *
 * Fill in real event URLs here (same shape as CORSIZIO_EVENTS) once the
 * USD account and events exist — no other code changes should be needed.
 */
export const CORSIZIO_EVENTS_USD = {
  online: null,
};

export function getCorsizioUrlUsd(location) {
  return CORSIZIO_EVENTS_USD[location] || null;
}
