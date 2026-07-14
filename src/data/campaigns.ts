import { getProgram, PROGRAM_STRUCTURE, type ProgramSlug } from "./programs";
import { IN_PERSON, ONLINE } from "./locations";

export type LPSlug = "explorers" | "builders" | "developers" | "engineers" | "quebec-fr";

export interface CampaignFAQ {
  question: string;
  answer: string;
}

export interface Campaign {
  slug: LPSlug;
  /** Which program's schedule/registration data this LP registers into. */
  program: ProgramSlug;
  lang: "en" | "fr";
  adHeadline: string;
  subhead: string;
  trustLine: string;
  /** 3-5 real project titles, drawn from the authoritative curriculum. */
  projects: string[];
  /** 3 outcome bullets — what the child builds/can do. */
  outcomeBullets: string[];
  offerHeadline: string;
  offerBody: string;
  faq: CampaignFAQ[];
  /** Ad-platform defaults used when the incoming URL carries no utm_source/utm_medium. */
  defaultSource: "meta" | "google";
  defaultMedium: "cpc" | "paid_social";
  ogImage: string;
  /** Secondary, non-competing text link (e.g. Québec's Builders cross-link). */
  secondaryLink?: { label: string; program: ProgramSlug };
}

const CITIES_LINE = IN_PERSON.join(", ");

function englishFaq(programSlug: ProgramSlug): CampaignFAQ[] {
  const program = getProgram(programSlug)!;
  const online = ONLINE[programSlug];
  return [
    {
      question: `Is ${program.level} the right fit for my child?`,
      answer: `${program.level} is designed for ${program.gradeBand}. No prior coding experience is needed — every class starts from the basics of ${program.codingSpace.toLowerCase()}.`,
    },
    {
      question: "Does my child need any coding experience?",
      answer: "No experience is required. Classes are built for complete beginners, with inclusive-design accommodations for a range of learning styles.",
    },
    {
      question: "How long is the program?",
      answer: `${PROGRAM_STRUCTURE.semesters} semesters (~${PROGRAM_STRUCTURE.sessionsApprox} sessions total) plus a capstone project, project-based throughout.`,
    },
    {
      question: "What are the location and schedule options?",
      answer: `In-person Saturdays in ${CITIES_LINE}, or online ${online.day}s, ${online.window} (${online.length} class).`,
    },
  ];
}

const explorers: Campaign = {
  slug: "explorers",
  program: "explorers",
  lang: "en",
  adHeadline: "Your 5–7 year old's first real coding class.",
  subhead: "Explorers turns screen time into a first real coding class — visual blocks, real logic, one project at a time.",
  trustLine: "Project-based · Inclusive by design · In 5 Canadian cities + online",
  projects: ["My Helpful Robot", "Kindness Cards", "Recycling Sorter"],
  outcomeBullets: [
    "Gives a computer clear, step-by-step instructions",
    "Builds a simple interactive app from their own idea",
    "Learns kindness online from their very first class",
  ],
  offerHeadline: "Register for Explorers",
  offerBody: "Save your child's spot in Explorers — in 5 Canadian cities or online.",
  faq: englishFaq("explorers"),
  defaultSource: "meta",
  defaultMedium: "paid_social",
  ogImage: "/logo-banner.png",
};

const builders: Campaign = {
  slug: "builders",
  program: "builders",
  lang: "en",
  adHeadline: "Your child builds their first real website.",
  subhead: "Builders write real HTML and CSS — not drag-and-drop — and walk away with a real, working website they built themselves.",
  trustLine: "Project-based · Inclusive by design · In 5 Canadian cities + online",
  projects: ["All About Me Page", "Weather Helper", "Community Helper Website"],
  outcomeBullets: [
    "Writes real HTML and CSS — not just drag-and-drop",
    "Builds and styles a real multi-page website",
    "Learns to write for a real audience online",
  ],
  offerHeadline: "Register for Builders",
  offerBody: "Save your child's spot in Builders — in 5 Canadian cities or online.",
  faq: englishFaq("builders"),
  defaultSource: "meta",
  defaultMedium: "paid_social",
  ogImage: "/logo-banner.png",
};

const developers: Campaign = {
  slug: "developers",
  program: "developers",
  lang: "en",
  adHeadline: "Real code that solves real problems.",
  subhead: "Developers write real JavaScript to build tools that solve problems they actually have — with media and financial literacy built in.",
  trustLine: "Project-based · Inclusive by design · In 5 Canadian cities + online",
  projects: ["Homework Timer & Focus Tool", "Fact or Fake? Media-Literacy Quiz", "Budget Buddy"],
  outcomeBullets: [
    "Writes real JavaScript with variables, functions, and logic",
    "Builds interactive tools that solve everyday problems",
    "Learns to question sources and manage money smartly",
  ],
  offerHeadline: "Register for Developers",
  offerBody: "Save your child's spot in Developers — in 5 Canadian cities or online.",
  faq: englishFaq("developers"),
  defaultSource: "google",
  defaultMedium: "cpc",
  ogImage: "/logo-banner.png",
};

const engineers: Campaign = {
  slug: "engineers",
  program: "engineers",
  lang: "en",
  adHeadline: "Your teen can build AI — responsibly.",
  subhead: "Engineers write real Python, train their own AI model, and learn to think about bias, ethics, and cybersecurity along the way.",
  trustLine: "Project-based · Inclusive by design · In 5 Canadian cities + online",
  projects: ["Password Strength Checker", "Smart Sorting AI", "Chatbot for Good", "Data Detective", "Innovation Challenge"],
  outcomeBullets: [
    "Codes in real Python — logic, data, structure",
    "Trains and evaluates their own AI model, responsibly",
    "Learns practical cybersecurity, like password strength",
  ],
  offerHeadline: "Register for Engineers",
  offerBody: "Save your child's spot in Engineers — in 5 Canadian cities or online.",
  faq: englishFaq("engineers"),
  defaultSource: "google",
  defaultMedium: "cpc",
  ogImage: "/logo-banner.png",
};

const quebecFr: Campaign = {
  slug: "quebec-fr",
  program: "explorers",
  lang: "fr",
  adHeadline: "Le codage pour les jeunes, en français.",
  subhead: "La Trousse Explorateurs, entièrement en français — la première expérience de codage de votre enfant, en blocs visuels, un projet à la fois.",
  trustLine: "Apprentissage par projet · Conçu pour l'inclusion · En ligne partout au Québec",
  projects: ["Mon robot serviable", "Cartes de gentillesse", "Trieur de recyclage"],
  outcomeBullets: [
    "Donne des instructions claires, étape par étape, à un ordinateur",
    "Construit une application interactive simple à partir de sa propre idée",
    "Apprend la bienveillance en ligne dès le premier cours",
  ],
  offerHeadline: "Inscrivez-vous à Explorateurs",
  offerBody: "Réservez la place de votre enfant chez Explorateurs — en ligne partout au Québec.",
  faq: [
    {
      question: "Explorateurs convient-il à mon enfant ?",
      answer: "Explorateurs s'adresse aux enfants de la maternelle à la 1re année. Aucune expérience de codage préalable n'est requise.",
    },
    {
      question: "Mon enfant doit-il avoir de l'expérience en codage ?",
      answer: "Aucune expérience n'est requise. Les cours sont conçus pour les débutants complets, avec des mesures d'adaptation inclusives.",
    },
    {
      question: "Quelle est la durée du programme ?",
      answer: `${PROGRAM_STRUCTURE.semesters} sessions (environ ${PROGRAM_STRUCTURE.sessionsApprox} rencontres au total) plus un projet final, par apprentissage par projet.`,
    },
    {
      question: "Quels sont les horaires offerts ?",
      answer: `En ligne les mardis, ${ONLINE.explorers.window.replace("PM ET", "HE")} (cours de ${ONLINE.explorers.length}). Des villes en personne sont aussi offertes ailleurs au Canada (${CITIES_LINE}) pour les familles qui voyagent.`,
    },
  ],
  defaultSource: "meta",
  defaultMedium: "paid_social",
  ogImage: "/logo-banner.png",
  secondaryLink: { label: "Vous avez un enfant de 2e ou 3e année? Découvrez Bâtisseurs", program: "builders" },
};

export const CAMPAIGNS: Campaign[] = [explorers, builders, developers, engineers, quebecFr];

export function getCampaign(slug: string): Campaign | undefined {
  return CAMPAIGNS.find((c) => c.slug === slug);
}
