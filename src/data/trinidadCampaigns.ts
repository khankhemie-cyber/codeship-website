/**
 * CODEship Trinidad and Tobago — online-only landing pages. Single source of
 * truth for the 5 /tt/:slug pages. Like the Guyana set (guyanaCampaigns.ts),
 * these are separate from the K-8 program taxonomy (programs.ts) — Trinidad
 * registrations are a generic four-week online cohort, not tied to a specific
 * Explorers/Builders/Developers/Engineers level. Unlike Guyana, each Trinidad
 * page carries its own outcome bullets and project examples.
 */

export type TrinidadPageSlug =
  | "online-coding-classes"
  | "math-language-arts-coding"
  | "sea-digital-skills"
  | "computer-classes-for-kids"
  | "online-stem-classes";

export interface TrinidadCampaign {
  slug: TrinidadPageSlug;
  headline: string;
  subhead: string;
  corePromise: string;
  outcomeBullets: string[];
  projectExamples: string[];
  metaTitle: string;
  metaDescription: string;
  /** Only set for the SEA page — approved phrasing, never "guaranteed" or "official". */
  complianceNote?: string;
}

/** Shared programme constants — update once, reflected on every /tt page. */
export const TRINIDAD_PROGRAMME_FEE = "TT$600";
export const TRINIDAD_PER_CLASS_FEE = "TT$150";
export const TRINIDAD_NEXT_COHORT_START = "September 1, 2026";

export const TRINIDAD_CAMPAIGNS: TrinidadCampaign[] = [
  {
    slug: "online-coding-classes",
    headline: "Online Coding Classes for Kids in Trinidad and Tobago",
    subhead:
      "Help your child move from simply using technology to building with it through live, beginner-friendly online classes.",
    corePromise:
      "After four weeks, students should be able to use beginner coding concepts, complete an age-appropriate digital project and explain how their project works.",
    outcomeBullets: [
      "Follow clear step-by-step digital instructions",
      "Use beginner-friendly coding concepts",
      "Build a simple interactive project",
      "Explain the logic behind their work",
      "Use computers and technology with greater confidence",
    ],
    projectExamples: [
      "My Helpful Robot",
      "Interactive Story",
      "Quiz Game",
      "Simple Webpage",
      "Pattern Builder",
      "Digital Kindness Card",
    ],
    metaTitle: "Online Coding Classes for Kids in Trinidad and Tobago | CODEship",
    metaDescription:
      "Live online coding classes for children across Trinidad and Tobago. Build coding, computer confidence and problem-solving skills through practical projects. Four weeks for TT$600.",
  },
  {
    slug: "math-language-arts-coding",
    headline: "Mathematics, Language Arts, Creative Writing and Coding for Kids",
    subhead:
      "A practical online programme that connects important school skills with coding, computer confidence and project-based learning.",
    corePromise:
      "After four weeks, students should be able to break down structured problems, follow written instructions, explain their thinking more clearly and apply those skills in a digital project.",
    outcomeBullets: [
      "Break larger problems into manageable steps",
      "Strengthen Mathematics reasoning through patterns and logic",
      "Read and follow instructions more carefully",
      "Write clearer project explanations",
      "Apply academic skills while creating with technology",
    ],
    projectExamples: [
      "Mathematics Quiz Game",
      "Interactive Story Project",
      "Homework Timer",
      "Shape and Pattern Builder",
      "Community Helper Webpage",
      "Weather Helper",
    ],
    metaTitle: "Mathematics, Language Arts, Writing and Coding for Kids in Trinidad",
    metaDescription:
      "Online enrichment combining Mathematics, Language Arts, Creative Writing, coding and computer skills for children across Trinidad and Tobago. Four weeks for TT$600.",
  },
  {
    slug: "sea-digital-skills",
    headline: "Build Stronger Thinking Skills Before Secondary School",
    subhead:
      "Live online enrichment supporting Mathematics, Language Arts, Creative Writing, problem-solving and digital confidence.",
    corePromise:
      "After four weeks, students should be better able to break down word problems, explain their thinking, write clearer responses and complete beginner-friendly digital activities.",
    outcomeBullets: [
      "Break down multi-step questions",
      "Identify important information in written tasks",
      "Explain problem-solving steps",
      "Write clearer structured responses",
      "Build confidence using digital tools",
    ],
    projectExamples: [
      "Word-Problem Challenge",
      "Fact or Opinion Quiz",
      "Story Planner",
      "Mathematics Logic Game",
      "Digital Study Helper",
      "Community Information Project",
    ],
    metaTitle: "SEA Skill-Building and Digital Skills for Kids in Trinidad and Tobago",
    metaDescription:
      "Online enrichment supporting Mathematics, Language Arts, Creative Writing, problem-solving and computer confidence before secondary school.",
    complianceNote:
      "CODEship supports skill-building in Mathematics, Language Arts, Creative Writing, problem-solving and digital confidence. It is an independent enrichment programme. It is not an official SEA programme, is not Ministry-approved or endorsed, and does not guarantee examination results or secondary-school placement.",
  },
  {
    slug: "computer-classes-for-kids",
    headline: "Computer Classes for Children in Trinidad and Tobago",
    subhead:
      "Help your child develop practical computer skills, coding basics, digital confidence and safer, more productive technology habits.",
    corePromise:
      "After four weeks, students should be able to use common digital tools more confidently, understand beginner coding concepts and complete a simple digital project.",
    outcomeBullets: [
      "Navigate age-appropriate digital tools",
      "Use the keyboard and mouse more confidently",
      "Organize simple digital work",
      "Understand introductory coding concepts",
      "Create and explain a digital project",
    ],
    projectExamples: [
      "My First Digital Story",
      "File and Folder Challenge",
      "Online Safety Poster",
      "Simple Quiz",
      "Digital Kindness Card",
      "All About Me Webpage",
    ],
    metaTitle: "Computer Classes for Children in Trinidad and Tobago | CODEship",
    metaDescription:
      "Live online computer classes for kids across Trinidad and Tobago. Build practical computer confidence, coding basics and problem-solving skills. Four weeks for TT$600.",
  },
  {
    slug: "online-stem-classes",
    headline: "Online STEM Classes for Kids in Trinidad and Tobago",
    subhead:
      "Help your child build, solve, explain and create through coding, Mathematics thinking, writing and practical digital projects.",
    corePromise:
      "After four weeks, students should be able to complete an age-appropriate project, explain their process, solve problems step by step and present what they created.",
    outcomeBullets: [
      "Use logical steps to solve a challenge",
      "Connect Mathematics thinking with project activities",
      "Build a practical digital project",
      "Record and explain decisions",
      "Present completed work with greater confidence",
    ],
    projectExamples: [
      "Weather Helper",
      "Interactive Science Quiz",
      "Data Detective",
      "Recycling Sorter",
      "Budget Buddy",
      "Community Problem Solver",
    ],
    metaTitle: "Online STEM Classes for Kids in Trinidad and Tobago | CODEship",
    metaDescription:
      "Live online STEM classes combining coding, Mathematics, writing, logic and digital creativity for children across Trinidad and Tobago. Four weeks for TT$600.",
  },
];

export function getTrinidadCampaign(slug: string): TrinidadCampaign | undefined {
  return TRINIDAD_CAMPAIGNS.find((c) => c.slug === slug);
}

/** Shared page-anatomy content — identical across all 5 pages per the brief. */

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
  ctaLabel: "Register for the Next Online Cohort",
  startDateLine: `Next cohort begins ${TRINIDAD_NEXT_COHORT_START}.`,
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
    answer: "No. The programme is designed to be beginner-friendly.",
  },
  {
    question: "Is the programme available in Tobago?",
    answer:
      "Yes. Classes are online, so children can participate from Trinidad or Tobago with a suitable computer and reliable internet connection.",
  },
  {
    question: "Does this replace school or private lessons?",
    answer:
      "No. CODEship is an enrichment programme that supports school-related skills while helping children develop practical technology and problem-solving abilities.",
  },
  {
    question: "How much does the programme cost?",
    answer:
      "The four-week programme costs TT$600, which works out to TT$150 per live class.",
  },
  {
    question: "What will my child complete?",
    answer:
      "Your child will work toward an age-appropriate digital project and practise explaining the steps, decisions and skills used to create it.",
  },
];

export const TRINIDAD_COMPLIANCE_DISCLAIMER =
  "CODEship is an independent online enrichment programme for children across Trinidad and Tobago. It supports school-related skills — it is not an official SEA programme, is not Ministry-approved or endorsed, and does not guarantee grades, examination results or secondary-school placement.";

/** Shown on any /tt page opened with ?lead_submitted=1 (paid Meta Instant Form leads). */
export const TRINIDAD_LEAD_SUBMITTED_MESSAGE =
  "Your registration request has been received. Our team will contact you with class placement, schedule and payment information.";
