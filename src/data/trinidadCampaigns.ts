/**
 * CODEship Trinidad and Tobago — online program landing pages. Single source of
 * truth for the four /tt/:slug program pages. Unlike the earlier marketing-angle
 * pages, TT is now organized by the same four grade-band programs as Canada
 * (Explorers / Builders / Developers / Engineers), each with its own schedule
 * and its own TTD Stripe checkout so a parent registers and pays in one step.
 *
 * Prices are in TTD (TT$600 flat, four weeks). Day and time mirror the Canadian
 * online groups (CLASS_SCHEDULE[...].online in classSchedule.js) so TT and the
 * Canadian online cohort run the same weekly slot — the only difference is
 * length (TT is 4 weeks, Canadian is 8).
 */

import type { ProgramLevel } from "@/lib/payment-links";
import { CLASS_SCHEDULE } from "@/config/classSchedule";

/** The /tt page slugs are the four program levels. */
export type TrinidadPageSlug = ProgramLevel;

export interface TrinidadCampaign {
  slug: TrinidadPageSlug;
  label: string;
  grades: string;
  ages: string;
  headline: string;
  subhead: string;
  corePromise: string;
  outcomeBullets: string[];
  projectExamples: string[];
  /** Weekly class day — sourced from the Canadian online group so they align. */
  days: string;
  /** Weekly class time (ET; equals TT local time during the cohort). */
  time: string;
  /** The four weekly session dates for the 4-week TT cohort. */
  dates: string;
  /** The program's real, live TTD Stripe Payment Link. */
  stripeUrl: string;
  metaTitle: string;
  metaDescription: string;
}

/** Shared programme constants — update once, reflected on every /tt page. */
export const TRINIDAD_PROGRAMME_FEE = "TT$600";
export const TRINIDAD_PER_CLASS_FEE = "TT$150";
export const TRINIDAD_NEXT_COHORT_START = "the week of September 14, 2026";

/** The four weekly sessions, by class day, aligned to the week-of-Sep-14 start. */
const TT_TUESDAY_DATES = "Sep 15, 22, 29 & Oct 6";
const TT_THURSDAY_DATES = "Sep 17, 24, Oct 1 & 8";

export const TRINIDAD_CAMPAIGNS: TrinidadCampaign[] = [
  {
    slug: "explorers",
    label: "Explorers",
    grades: "K–1",
    ages: "Ages 4–6",
    headline: "Explorers: Online Coding for Ages 4–6 in Trinidad and Tobago",
    subhead:
      "A playful first step into coding, where young learners build confidence with technology through stories, games and creative challenges.",
    corePromise:
      "After four weeks, your child should be able to give a computer clear step-by-step instructions and build and explain a simple interactive project.",
    outcomeBullets: [
      "Understand core coding ideas like sequencing and logic",
      "Follow clear step-by-step digital instructions",
      "Build a simple interactive project",
      "Explain the thinking behind their work",
      "Grow confidence and independence with technology",
    ],
    projectExamples: [
      "My Helpful Robot",
      "Interactive Story",
      "Quiz Game",
      "Pattern Builder",
      "Simple Animation",
      "Digital Kindness Card",
    ],
    days: CLASS_SCHEDULE.explorers.online.days,
    time: CLASS_SCHEDULE.explorers.online.time,
    dates: TT_TUESDAY_DATES,
    stripeUrl: "https://buy.stripe.com/4gM6oB6Ij6ZD1sR1vmdAk06",
    metaTitle: "Explorers — Online Coding for Ages 4–6 in Trinidad and Tobago | CODEship",
    metaDescription:
      "Live online coding classes for children ages 4–6 (K–1) across Trinidad and Tobago. A playful first step into coding through stories, games and creative projects. Four weeks for TT$600.",
  },
  {
    slug: "builders",
    label: "Builders",
    grades: "Grades 2–3",
    ages: "Ages 7–9",
    headline: "Builders: Coding & Web Projects for Ages 7–9 in Trinidad and Tobago",
    subhead:
      "Learners deepen their coding skills and start building for the web, turning their own ideas into working pages and games.",
    corePromise:
      "After four weeks, your child should be able to plan, build and explain a real digital project and debug it independently.",
    outcomeBullets: [
      "Build fluency in block coding and the basics of HTML & CSS",
      "Plan, prototype and finish a real digital project",
      "Debug independently and iterate on their work",
      "Read and follow instructions more carefully",
      "Collaborate with peers on team challenges",
    ],
    projectExamples: [
      "Multi-Page Website",
      "Classroom Challenge Site",
      "Interactive Quiz Game",
      "Shape and Pattern Builder",
      "Community Helper Webpage",
      "Weather Helper",
    ],
    days: CLASS_SCHEDULE.builders.online.days,
    time: CLASS_SCHEDULE.builders.online.time,
    dates: TT_TUESDAY_DATES,
    stripeUrl: "https://buy.stripe.com/5kQfZb9Uv0Bf5J78XOdAk03",
    metaTitle: "Builders — Coding & Web Projects for Ages 7–9 in Trinidad and Tobago | CODEship",
    metaDescription:
      "Live online coding classes for children ages 7–9 (Grades 2–3) across Trinidad and Tobago. Build real web pages and games with block coding, HTML and CSS. Four weeks for TT$600.",
  },
  {
    slug: "developers",
    label: "Developers",
    grades: "Grades 4–5",
    ages: "Ages 9–11",
    headline: "Developers: Real Code for Ages 9–11 in Trinidad and Tobago",
    subhead:
      "The move into real programming languages — learners write JavaScript and Python and get their first hands-on look at how AI works.",
    corePromise:
      "After four weeks, your child should be able to write simple real code, build an interactive app or bot and present how it works.",
    outcomeBullets: [
      "Write real code in JavaScript and Python",
      "Build interactive apps and simple bots",
      "Break larger problems into manageable steps",
      "Understand the foundations of how data drives AI",
      "Present and explain their own technical projects",
    ],
    projectExamples: [
      "Interactive App",
      "Simple Chatbot",
      "Data Detective",
      "Mathematics Logic Game",
      "Budget Buddy",
      "Community Problem Solver",
    ],
    days: CLASS_SCHEDULE.developers.online.days,
    time: CLASS_SCHEDULE.developers.online.time,
    dates: TT_THURSDAY_DATES,
    stripeUrl: "https://buy.stripe.com/6oU8wJgiT2JnfjH0ridAk05",
    metaTitle: "Developers — Real Code for Ages 9–11 in Trinidad and Tobago | CODEship",
    metaDescription:
      "Live online coding classes for children ages 9–11 (Grades 4–5) across Trinidad and Tobago. Write real JavaScript and Python and explore the foundations of AI. Four weeks for TT$600.",
  },
  {
    slug: "engineers",
    label: "Engineers",
    grades: "Grades 6–8",
    ages: "Ages 12–16",
    headline: "Engineers: Build AI Responsibly, Ages 12–16 in Trinidad and Tobago",
    subhead:
      "Advanced building for teens — full applications, product design and AI, aimed at real projects and post-secondary readiness.",
    corePromise:
      "After four weeks, your teen should be able to design a more sophisticated application, apply AI concepts responsibly and pitch their solution.",
    outcomeBullets: [
      "Work across multiple languages and modern tools",
      "Design and ship a more sophisticated application",
      "Apply AI concepts to a project that matters to them",
      "Consider ethics and responsibility in their build",
      "Lead a build and explore tech career pathways",
    ],
    projectExamples: [
      "Full Application Build",
      "AI-Assisted Tool",
      "Community Impact Solution",
      "Data Dashboard",
      "Product Pitch",
      "Automation Helper",
    ],
    days: CLASS_SCHEDULE.engineers.online.days,
    time: CLASS_SCHEDULE.engineers.online.time,
    dates: TT_THURSDAY_DATES,
    stripeUrl: "https://buy.stripe.com/7sY7sFaYz6ZDb3r6PGdAk07",
    metaTitle: "Engineers — Build AI Responsibly, Ages 12–16 in Trinidad and Tobago | CODEship",
    metaDescription:
      "Live online coding classes for teens ages 12–16 (Grades 6–8) across Trinidad and Tobago. Build full applications and apply AI responsibly. Four weeks for TT$600.",
  },
];

export function getTrinidadCampaign(slug: string): TrinidadCampaign | undefined {
  return TRINIDAD_CAMPAIGNS.find((c) => c.slug === slug);
}

/** Shared page-anatomy content — identical across all program pages. */

export const TRINIDAD_TRUST_LINE =
  "Live online classes · Small-group learning · Beginner-friendly · Available across Trinidad and Tobago";

export const TRINIDAD_HOW_IT_WORKS: string[] = [
  "Four live online classes — one instructor-led class each week",
  "Beginner-friendly activities with small-group learning",
  "Practical digital projects your child builds and keeps",
  "Guided academic and problem-solving activities",
  "Parent communication and next-step guidance",
  "A laptop or desktop computer and internet connection are required",
];

export const TRINIDAD_PRICING = {
  heading: "Four-Week Online Programme",
  primaryPrice: TRINIDAD_PROGRAMME_FEE,
  supportingPrice: `${TRINIDAD_PER_CLASS_FEE} per live class`,
  includes: [
    "Four live instructor-led classes",
    "Guided learning activities",
    "Practical digital project work",
    "Academic and problem-solving skill-building",
    "End-of-programme outcomes",
  ],
  ctaLabel: "Register & Pay",
  startDateLine: `Next online cohort begins ${TRINIDAD_NEXT_COHORT_START}.`,
};

export interface TrinidadFAQItem {
  question: string;
  answer: string;
}

export const TRINIDAD_FAQ: TrinidadFAQItem[] = [
  {
    question: "Is this only a coding class?",
    answer:
      "No. CODEship teaches coding and digital skills while also strengthening problem-solving, Mathematics reasoning, reading instructions, written explanations and presentation confidence.",
  },
  {
    question: "Does my child need coding experience?",
    answer: "No. Every program is designed to be beginner-friendly at its grade band.",
  },
  {
    question: "How do I choose the right program?",
    answer:
      "Programs are grouped by grade band — Explorers (K–1), Builders (Grades 2–3), Developers (Grades 4–5) and Engineers (Grades 6–8). Choose the one that matches your child's grade. If you're unsure, email admin@codeshipacademy.com and our team will help.",
  },
  {
    question: "Is the programme available in Tobago?",
    answer:
      "Yes. Classes are online, so children can participate from Trinidad or Tobago with a suitable computer and reliable internet connection.",
  },
  {
    question: "How much does the programme cost?",
    answer:
      "The four-week programme costs TT$600, which works out to TT$150 per live class.",
  },
  {
    question: "How do I register?",
    answer:
      "Choose your child's program, review the schedule and complete registration and payment securely online. Our team will then confirm class placement and next steps.",
  },
];

export const TRINIDAD_COMPLIANCE_DISCLAIMER =
  "CODEship is an independent online enrichment programme for children across Trinidad and Tobago. It supports school-related skills — it is not an official SEA programme, is not Ministry-approved or endorsed, and does not guarantee grades, examination results or secondary-school placement.";

/** Shown on any /tt page opened with ?lead_submitted=1 (paid Meta Instant Form leads). */
export const TRINIDAD_LEAD_SUBMITTED_MESSAGE =
  "Your registration request has been received. Our team will contact you with class placement, schedule and payment information.";
