import { ONLINE, type ProgramSlug } from "@/data/locations";

/**
 * The existing program registration form lives at /register (see
 * src/app/register/page.tsx), which embeds the site's existing HubSpot
 * registration form via <RegistrationForm />. We do not build a new form —
 * every Register CTA in the Journey Map / program pages routes here.
 *
 * Because the HubSpot forms embed script runs on this page and reads the
 * page's own URL, the UTM parameters appended below are captured by
 * HubSpot automatically and attributed to the resulting contact/submission.
 * `program` and `location` are also passed as plain query params so that,
 * if the HubSpot form is later configured with hidden fields named
 * `program` / `location`, HubSpot's native "prefill via URL parameter"
 * feature will populate them too. See README.md for the full convention.
 */
export const REG_FORM_URL = "/register";

export type LocationSlug = "toronto" | "vaughan" | "oshawa" | "calgary" | "vancouver" | "online";

interface BuildRegistrationUrlArgs {
  program: ProgramSlug;
  location: LocationSlug;
  /** utm_source override — defaults to "website" for main-site CTAs. Paid LPs pass "meta" | "google". */
  source?: string;
  /** utm_medium override — defaults to "registration" for main-site CTAs. Paid LPs pass "cpc" | "paid_social". */
  medium?: string;
  /** utm_campaign override — defaults to the program slug. */
  campaign?: string;
  /** utm_content override — defaults to the location slug. */
  content?: string;
  /** utm_term override — defaults to the computed online/in-person slot. */
  term?: string;
}

function defaultTerm(program: ProgramSlug, location: LocationSlug): string {
  return location === "online" ? `online-${ONLINE[program].day.toLowerCase()}-1600` : "in-person";
}

/**
 * Builds the URL to the existing registration form, encoding the selected
 * program and location as UTM parameters so every registration is
 * attributable by program × location with no new backend.
 *
 * utm_campaign = program (default), utm_content = location (default),
 * utm_term = the specific online day/slot or "in-person" (default).
 * Paid landing pages override source/medium/campaign/content/term to
 * reflect the ad platform and campaign that sent the visitor.
 */
export function buildRegistrationUrl({
  program,
  location,
  source = "website",
  medium = "registration",
  campaign,
  content,
  term,
}: BuildRegistrationUrlArgs): string {
  const params = new URLSearchParams({
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign ?? program,
    utm_content: content ?? location,
    utm_term: term ?? defaultTerm(program, location),
  });
  params.set("program", program);
  params.set("location", location);

  return `${REG_FORM_URL}?${params.toString()}`;
}
