export type ConsentValue = "all" | "essential";

/** localStorage key holding the visitor's cookie choice. */
const CONSENT_KEY = "codeship-cookie-consent";

/** Window event broadcast whenever the choice changes, so analytics can react without a reload. */
export const CONSENT_EVENT = "codeship-consent-change";

export function getConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(CONSENT_KEY);
  return v === "all" || v === "essential" ? v : null;
}

export function setConsent(value: ConsentValue): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new CustomEvent<ConsentValue>(CONSENT_EVENT, { detail: value }));
}

/** True only when the visitor opted into all cookies — the gate for any analytics/pixel loading. */
export function hasAnalyticsConsent(): boolean {
  return getConsent() === "all";
}
