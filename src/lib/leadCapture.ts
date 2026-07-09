import type { ProgramSlug } from "@/data/locations";
import type { LocationSlug } from "@/lib/registration";

export interface LeadCapturePayload {
  email: string;
  program: ProgramSlug;
  location?: LocationSlug;
  /** UTMs present on the landing page at submit time, for attribution. */
  utm?: Record<string, string | undefined>;
}

/**
 * Stub for the free-sample-kit lead magnet. This is deliberately not a
 * registration — it's a low-friction email capture that unlocks a sample
 * curriculum PDF (see LEAD_MAGNETS in campaign_kit.ts). Wire this to your
 * ESP/CRM (e.g. a HubSpot forms API call, or a Zoho/Mailchimp endpoint).
 */
export async function leadCapture(payload: LeadCapturePayload): Promise<{ ok: boolean }> {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[leadCapture]", payload);
  }
  // TODO: POST to the real ESP/CRM endpoint once available.
  return { ok: true };
}
