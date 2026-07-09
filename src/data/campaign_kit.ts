/**
 * The CODEship campaign kit — the single source of truth the paid landing
 * pages, ad platforms, and marketing team all read from. See
 * CAMPAIGN_KIT.md for the human-readable version of this same content.
 */
import { PROGRAMS, PROGRAM_STRUCTURE, getProgram, type ProgramSlug } from "./programs";
import { IN_PERSON, ONLINE, type InPersonCity } from "./locations";
import { CAMPAIGNS, getCampaign } from "./campaigns";

export interface MessagingPillar {
  title: string;
  description: string;
}

/** Messaging pillars — rewritten to sell the complete, finished K-8 curriculum. */
export const MESSAGING_PILLARS: MessagingPillar[] = [
  {
    title: "A real K–8 progression",
    description:
      "Blocks → HTML/CSS → JavaScript → Python + AI. Four levels, each capstone-gated before advancing to the next.",
  },
  {
    title: "Project-based & tangible",
    description:
      "Every level ends with something real a child built — a robot, a website, an app, an AI model — never a worksheet.",
  },
  {
    title: "Future-ready & responsible",
    description:
      "Real Python, hands-on AI with bias & ethics built into the curriculum, and practical cybersecurity — not just screen time.",
  },
  {
    title: "Inclusive by design",
    description: "Accommodations are built into every level from the start, not bolted on after the fact.",
  },
  {
    title: "Province-aligned, including French for Québec",
    description:
      "Curriculum is aligned to / maps to / supports Ontario's baseline, BC's ADST, Alberta's CS/CTF, and Québec's Cadre de référence de la compétence numérique — including a full French Explorers kit. Never \"endorsed\" or \"approved by\" a ministry.",
  },
];

/** Per-level one-liner + outcome, reusing the Part A outcome statements verbatim. */
export const LEVEL_ONE_LINERS: Record<ProgramSlug, { oneLiner: string; outcome: string }> = {
  explorers: { oneLiner: "Your 5–7 year old's first real coding class.", outcome: getProgram("explorers")!.outcome },
  builders: { oneLiner: "Your child builds their first real website.", outcome: getProgram("builders")!.outcome },
  developers: { oneLiner: "Real code that solves real problems.", outcome: getProgram("developers")!.outcome },
  engineers: { oneLiner: "Your teen can build AI — responsibly.", outcome: getProgram("engineers")!.outcome },
};

export type LocationKey = Lowercase<InPersonCity> | "online" | "national";

export const LOCATION_KEYS: LocationKey[] = [...IN_PERSON.map((c) => c.toLowerCase() as LocationKey), "online"];

export interface AdCopySet {
  program: ProgramSlug;
  location: LocationKey;
  /** Google Ads headline assets (3). */
  headlines: [string, string, string];
  /** Two general-purpose primary-text lines, usable across platforms. */
  primaryTexts: [string, string];
  /** Google Ads description assets (3). */
  descriptions: [string, string, string];
  /** Google Ads sitelinks / callout extensions. */
  sitelinks: { text: string; description: string }[];
  /** Meta-specific primary text variants (feed tone, longer-form). */
  metaPrimaryTexts: [string, string];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function scheduleLine(program: ProgramSlug, location: LocationKey): string {
  if (location === "online") {
    const o = ONLINE[program];
    return `Online, ${o.day}s ${o.window}`;
  }
  return `Saturdays in ${capitalize(location)}`;
}

/** Generates a location-specific ad copy set from the program + location facts — no invented claims. */
function buildAdCopySet(program: ProgramSlug, location: LocationKey): AdCopySet {
  const p = getProgram(program)!;
  const campaign = getCampaign(program)!;
  const where = location === "online" ? "online" : `in ${capitalize(location)}`;
  const schedule = scheduleLine(program, location);

  return {
    program,
    location,
    headlines: [
      `${p.level} Coding, ${capitalize(where === "online" ? "Online" : where.replace("in ", ""))}`,
      campaign.adHeadline,
      `${p.gradeBand} · ${p.codingSpace}`,
    ],
    primaryTexts: [
      `${campaign.subhead} ${schedule}.`,
      `${p.outcome} Book a free trial class ${where}.`,
    ],
    descriptions: [
      `${p.level} (${p.gradeBand}): ${p.codingSpace}. ${PROGRAM_STRUCTURE.semesters} semesters + capstone, ~${PROGRAM_STRUCTURE.sessionsApprox} sessions.`,
      `${schedule}. Project-based, inclusive by design. No experience needed.`,
      `Free trial class, no long-term contract. Register in minutes.`,
    ],
    sitelinks: [
      { text: "See the full curriculum", description: `${PROGRAM_STRUCTURE.semesters} semesters, real projects, one capstone.` },
      { text: "Free sample kit", description: "Download a free sample lesson before you book." },
      { text: "Locations & schedule", description: "5 Canadian cities, Saturdays, or online." },
      { text: "Book a free trial", description: "No long-term contract required." },
    ],
    metaPrimaryTexts: [
      `${campaign.adHeadline} ${p.outcome} ${schedule}. Book a free trial class today.`,
      `Real projects, not worksheets: ${campaign.projects.slice(0, 3).join(", ")}. ${schedule}. Free trial class — no contract.`,
    ],
  };
}

/** Every level × every location (5 cities + online) — the full geo-targeted ad copy matrix. */
export const AD_COPY_SETS: AdCopySet[] = PROGRAMS.flatMap((p) =>
  LOCATION_KEYS.map((loc) => buildAdCopySet(p.slug, loc))
);

export function getAdCopySet(program: ProgramSlug, location: LocationKey): AdCopySet | undefined {
  return AD_COPY_SETS.find((s) => s.program === program && s.location === location);
}

/** Québec / French ad copy set — hand-authored, not generated from the English template. */
export const QUEBEC_FR_AD_COPY: AdCopySet = {
  program: "explorers",
  location: "online",
  headlines: [
    "Codage pour Enfants, en Français",
    "Le codage pour les jeunes, en français.",
    "Maternelle à 1re année · Blocs visuels",
  ],
  primaryTexts: [
    "La Trousse Explorateurs, entièrement en français. En ligne les mardis, 16h–18h HE.",
    "Donnez à votre enfant sa première expérience de codage, en français. Cours d'essai gratuit.",
  ],
  descriptions: [
    "Explorateurs (maternelle-1re année) : blocs visuels. 4 sessions + projet final, environ 20 rencontres.",
    "En ligne, mardis 16h–18h HE. Apprentissage par projet, conçu pour l'inclusion.",
    "Cours d'essai gratuit, sans contrat à long terme. Inscrivez-vous en quelques minutes.",
  ],
  sitelinks: [
    { text: "Voir le programme complet", description: "4 sessions, projets réels, un projet final." },
    { text: "Trousse d'exemples gratuite", description: "Téléchargez une leçon d'exemple avant de réserver." },
    { text: "Horaires", description: "En ligne les mardis, 16h–18h HE." },
    { text: "Réservez un cours d'essai", description: "Aucun contrat à long terme requis." },
  ],
  metaPrimaryTexts: [
    "Le codage pour les jeunes, en français. La Trousse Explorateurs, en ligne les mardis. Réservez un cours d'essai gratuit.",
    "Des projets réels, pas des feuilles d'exercices : Mon robot serviable, Cartes de gentillesse, Trieur de recyclage. Cours d'essai gratuit — sans contrat.",
  ],
};

export interface AudienceMapEntry {
  program: ProgramSlug;
  parentAudience: string;
  topAngle: string;
  eligibleLocations: LocationKey[];
  onlineDay: "Tuesday" | "Thursday";
}

/** Audience, top angle, and eligible locations/online day per level. */
export const AUDIENCE_MAP: AudienceMapEntry[] = PROGRAMS.map((p) => ({
  program: p.slug,
  parentAudience:
    p.slug === "explorers"
      ? "Parents of K–1 children looking for a first screen-time-positive activity"
      : p.slug === "builders"
        ? "Parents of Grade 2–3 children who enjoy building/making and want a tangible result"
        : p.slug === "developers"
          ? "Parents of Grade 4–5 children interested in problem-solving, money, and media literacy"
          : "Parents of Grade 6–8 teens interested in AI, tech careers, or cybersecurity",
  topAngle: getCampaign(p.slug)!.adHeadline,
  eligibleLocations: LOCATION_KEYS,
  onlineDay: ONLINE[p.slug].day,
}));

export interface RoutingEntry {
  campaignSlug: string;
  landingPage: string;
  registersVia: string;
}

/** Ad set → landing page → existing registration form routing map. */
export const LP_ROUTING: RoutingEntry[] = CAMPAIGNS.map((c) => ({
  campaignSlug: c.slug,
  landingPage: `/lp/${c.slug}`,
  registersVia: "/register (existing HubSpot-backed program registration form)",
}));

export const UTM_PLAN = {
  utm_source: "meta | google (the ad platform)",
  utm_medium: "cpc | paid_social",
  utm_campaign: "program slug (explorers | builders | developers | engineers)",
  utm_content: "location slug (toronto | vaughan | oshawa | calgary | vancouver | online)",
  utm_term: "in-person | online-{day}-1600",
} as const;

export const TRACKING_EVENTS = [
  { name: "program_view", when: "LP mounts", payload: "{ program, location? }" },
  { name: "select_location", when: "visitor changes the location/schedule selector", payload: "{ program, location }" },
  { name: "register_click", when: "visitor clicks any Register/Book-a-trial CTA", payload: "{ program, location }" },
] as const;

export interface ComplianceChecklistItem {
  item: string;
  status: "ready" | "needs-validation";
}

/**
 * Provincial alignment is mapped at the framework level and is
 * validation-ready, not yet verified against official outcome codes. Check
 * each claim against the current provincial document before it runs in a
 * live ad or LP, and always use "aligned to / maps to / supports" —
 * never "endorsed" or "approved by" a ministry.
 */
export const COMPLIANCE_CHECKLIST: ComplianceChecklistItem[] = [
  { item: "Ontario baseline coding/digital-literacy alignment wording", status: "needs-validation" },
  { item: "BC ADST alignment wording", status: "needs-validation" },
  { item: "Alberta CS / CTF alignment wording", status: "needs-validation" },
  { item: "Québec Cadre de référence de la compétence numérique alignment wording (FR)", status: "needs-validation" },
  { item: "No use of \"endorsed\" / \"approved by\" a ministry anywhere in ad copy or LPs", status: "ready" },
  { item: "No earnings, outcome-guarantee, or unverifiable superlative claims in ad copy", status: "ready" },
  { item: "French copy on /lp/quebec-fr reviewed by a native French speaker before launch", status: "needs-validation" },
];
