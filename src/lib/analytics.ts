import type { ProgramSlug } from "@/data/locations";
import type { LocationSlug } from "@/lib/registration";

/**
 * Analytics stubs. The registration link's UTM (see lib/registration.ts) is
 * the durable source of attribution; these events mirror it for on-site
 * funnel analysis. Wire these up to GA4 (gtag) and/or the Meta Pixel by
 * filling in the calls below — see README.md.
 */

interface EventPayload {
  program: ProgramSlug;
  location?: LocationSlug;
}

function dispatch(eventName: string, payload: EventPayload) {
  if (typeof window === "undefined") return;

  // GA4, once wired:
  // window.gtag?.("event", eventName, payload);

  // Meta Pixel, once wired:
  // window.fbq?.("trackCustom", eventName, payload);

  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug(`[analytics] ${eventName}`, payload);
  }
}

export function trackView(payload: EventPayload) {
  dispatch("program_view", payload);
}

export function trackSelectLocation(payload: EventPayload) {
  dispatch("select_location", payload);
}

export function trackRegisterClick(payload: EventPayload) {
  dispatch("register_click", payload);
}
