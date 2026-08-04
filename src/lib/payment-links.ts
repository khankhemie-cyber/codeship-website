export type ProgramLevel = "explorers" | "builders" | "developers" | "engineers";

export interface ProgramConfig {
  order: number;
  label: string;
  labelFr: string;
  ageMin: number;
  ageMax: number;
  gradesEn: string;
  gradesFr: string;
  priceCad: number;
  techEn: string;
  techFr: string;
  projectsEn: string;
  projectsFr: string;
  summary: string; // one-line pitch (English) for the registration page
  outcomes: string[]; // "what your child will learn" (English)
  url: string; // Stripe Payment Link
}

/**
 * Single source of truth for the four CODEship program levels' Stripe Payment
 * Links, prices, and age bands. These links, prices, and ages are the real,
 * live products — do not guess or change them without confirming with the owner.
 *
 * Note: the numeric age bands here (4–6 / 7–9 / 9–11 / 11–14) are the Stripe
 * product ages the customer actually pays for. The grade bands match the
 * curriculum data in src/data/programs.ts (K–1, 2–3, 4–5, 6–8).
 */
export const PROGRAM_LINKS: Record<ProgramLevel, ProgramConfig> = {
  explorers: {
    order: 1,
    label: "Explorers",
    labelFr: "Explorateurs",
    ageMin: 4,
    ageMax: 6,
    gradesEn: "K–1",
    gradesFr: "M–1re",
    priceCad: 175,
    techEn: "Scratch Jr, digital literacy, creative problem-solving",
    techFr: "Scratch Jr, littératie numérique, résolution créative",
    projectsEn: "Interactive stories and simple games",
    projectsFr: "Histoires interactives et mini-jeux",
    summary:
      "A playful first step into coding, where young learners build confidence with technology through stories, games, and creative challenges.",
    outcomes: [
      "Understand core coding ideas like sequencing and logic",
      "Build early problem-solving and computational thinking",
      "Grow confidence and independence with technology",
      "Create and share a first interactive project",
    ],
    url: "https://buy.stripe.com/00wbIV4Abdo1dbz7TKdAk09",
  },
  builders: {
    order: 2,
    label: "Builders",
    labelFr: "Bâtisseurs",
    ageMin: 7,
    ageMax: 9,
    gradesEn: "Grades 2–3",
    gradesFr: "2e–3e année",
    priceCad: 175,
    techEn: "Scratch, HTML, CSS, problem-solving, teamwork",
    techFr: "Scratch, HTML, CSS, résolution de problèmes, travail d'équipe",
    projectsEn: "Web pages and classroom challenge sites",
    projectsFr: "Sites web et défis de classe",
    summary:
      "Learners deepen their coding skills and start building for the web, turning their own ideas into working pages and games.",
    outcomes: [
      "Build fluency in Scratch and the basics of HTML & CSS",
      "Plan, prototype, and finish a real digital project",
      "Debug independently and iterate on their work",
      "Collaborate with peers on team challenges",
    ],
    url: "https://buy.stripe.com/7sY8wJ6Ij6ZD6Nb7TKdAk0b",
  },
  developers: {
    order: 3,
    label: "Developers",
    labelFr: "Développeurs",
    ageMin: 9,
    ageMax: 11,
    gradesEn: "Grades 4–5",
    gradesFr: "4e–5e année",
    priceCad: 199,
    techEn: "JavaScript, Python, AI learning foundations",
    techFr: "JavaScript, Python, bases de l'IA",
    projectsEn: "Apps, bots, and data storytelling",
    projectsFr: "Applications, robots logiciels, narration de données",
    summary:
      "The move into real programming languages — learners write JavaScript and Python and get their first hands-on look at how AI works.",
    outcomes: [
      "Write real code in JavaScript and Python",
      "Build interactive apps and simple bots",
      "Understand the foundations of AI and how data drives it",
      "Present and explain their own technical projects",
    ],
    url: "https://buy.stripe.com/4gM4gtc2D2JnefD0ridAk0a",
  },
  engineers: {
    order: 4,
    label: "Engineers",
    labelFr: "Ingénieurs",
    ageMin: 11,
    ageMax: 14,
    gradesEn: "Grades 6–8",
    gradesFr: "6e–8e année",
    priceCad: 199,
    techEn: "Advanced JS/Python, app development, product design",
    techFr: "JS/Python avancé, développement d'apps, conception produit",
    projectsEn: "Community impact solutions",
    projectsFr: "Solutions d'impact communautaire",
    summary:
      "Advanced building for teens — full applications, product design, and AI, aimed at real projects and post-secondary readiness.",
    outcomes: [
      "Work across multiple languages and modern frameworks",
      "Design and ship a more sophisticated application",
      "Apply AI/ML concepts to a project that matters to them",
      "Lead a build and explore tech career pathways",
    ],
    url: "https://buy.stripe.com/14AfZbc2D1Fjc7vfmcdAk08",
  },
};

export const PROGRAM_ORDER: ProgramLevel[] = (Object.keys(PROGRAM_LINKS) as ProgramLevel[]).sort(
  (a, b) => PROGRAM_LINKS[a].order - PROGRAM_LINKS[b].order
);

export function isProgramLevel(value: string): value is ProgramLevel {
  return (PROGRAM_ORDER as string[]).includes(value);
}

export function programName(level: ProgramLevel, fr: boolean): string {
  return fr ? PROGRAM_LINKS[level].labelFr : PROGRAM_LINKS[level].label;
}

export function ageLabel(level: ProgramLevel, fr: boolean): string {
  const c = PROGRAM_LINKS[level];
  const range = `${c.ageMin}–${c.ageMax}`;
  return fr ? `${range} ans · ${c.gradesFr}` : `Ages ${range} · ${c.gradesEn}`;
}
