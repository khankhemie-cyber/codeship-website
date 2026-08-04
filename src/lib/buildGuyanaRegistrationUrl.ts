import type { GuyanaPageSlug } from "@/data/guyanaCampaigns";

/**
 * Guyana registrations stay on the existing HubSpot lead-capture form
 * (embedded on /register) — Guyana prices in GYD. Guyana registrations are a
 * generic "online semester" — not tied to a specific K-8 program slug (the
 * Canadian flow checks out per-program via Stripe on /register/[program]) —
 * so this builds its own UTM shape onto /register.
 */
const TERM_BY_PAGE: Record<GuyanaPageSlug, string> = {
  "online-coding-classes": "online-coding",
  "math-english-coding": "math-english-coding",
  "ngsa-digital-skills": "ngsa-digital-skills",
  "computer-classes-for-kids": "computer-classes",
  "online-stem-classes": "online-stem",
};

interface BuildGuyanaRegistrationUrlArgs {
  page: GuyanaPageSlug;
  /** meta | google | whatsapp | facebook | instagram */
  source?: string;
  /** paid_social | cpc | organic_social | referral */
  medium?: string;
  campaign?: string;
  /** Community/region slug, e.g. georgetown | east-bank-demerara | berbice | guyana */
  content?: string;
  term?: string;
}

export function buildGuyanaRegistrationUrl({
  page,
  source = "meta",
  medium = "paid_social",
  campaign = "guyana-online",
  content = "guyana",
  term,
}: BuildGuyanaRegistrationUrlArgs): string {
  const params = new URLSearchParams({
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign,
    utm_content: content,
    utm_term: term ?? TERM_BY_PAGE[page],
  });

  params.set("country", "guyana");
  params.set("location", "online");
  params.set("page", page);

  return `/register?${params.toString()}`;
}
