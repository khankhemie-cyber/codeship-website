import type { TrinidadPageSlug } from "@/data/trinidadCampaigns";

/**
 * Trinidad and Tobago registrations stay on the existing HubSpot lead-capture
 * form (embedded on /register) — Trinidad prices in TTD. Like Guyana
 * (buildGuyanaRegistrationUrl.ts), Trinidad registrations are a generic
 * online cohort — not tied to a specific K-8 program slug — so this builds
 * its own UTM shape onto /register.
 */
const TERM_BY_PAGE: Record<TrinidadPageSlug, string> = {
  "online-coding-classes": "online-coding",
  "math-language-arts-coding": "math-language-arts-coding",
  "sea-digital-skills": "sea-digital-skills",
  "computer-classes-for-kids": "computer-classes",
  "online-stem-classes": "online-stem",
};

interface BuildTrinidadRegistrationUrlArgs {
  page: TrinidadPageSlug;
  /** meta | google | whatsapp | facebook | instagram — defaults to website for organic/direct visitors */
  source?: string;
  /** paid_social | cpc | organic_social | referral */
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}

export function buildTrinidadRegistrationUrl({
  page,
  source = "website",
  medium = "registration",
  campaign = "trinidad-online",
  content = "trinidad-and-tobago",
  term,
}: BuildTrinidadRegistrationUrlArgs): string {
  const params = new URLSearchParams({
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign,
    utm_content: content,
    utm_term: term ?? TERM_BY_PAGE[page],
  });

  params.set("country", "trinidad-tobago");
  params.set("location", "online");
  params.set("page", page);

  return `/register?${params.toString()}`;
}
