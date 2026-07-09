/**
 * CODEship Guyana — online-only landing pages. Single source of truth for
 * the 5 /gy/:slug pages. These are separate from the K-8 program taxonomy
 * (programs.ts) — Guyana registrations are a generic "online semester",
 * not tied to a specific Explorers/Builders/Developers/Engineers level.
 */

export type GuyanaPageSlug =
  | "online-coding-classes"
  | "math-english-coding"
  | "ngsa-digital-skills"
  | "computer-classes-for-kids"
  | "online-stem-classes";

export interface GuyanaCampaign {
  slug: GuyanaPageSlug;
  headline: string;
  subhead: string;
  corePromise: string;
  metaTitle: string;
  metaDescription: string;
  /** Only set for the NGSA page — approved phrasing, never "guaranteed" or "official". */
  complianceNote?: string;
}

export const GUYANA_CAMPAIGNS: GuyanaCampaign[] = [
  {
    slug: "online-coding-classes",
    headline: "Online Coding Classes for Kids in Guyana",
    subhead:
      "Help your child build confidence with coding, computers, problem-solving, and creative thinking from home.",
    corePromise:
      "By the end of the semester, children should be able to build simple digital projects, explain how their code works, and use technology with more confidence.",
    metaTitle: "Online Coding Classes for Kids in Guyana | CODEship Academy",
    metaDescription:
      "Live online coding classes for children in Guyana. Build coding, computer literacy, Math thinking, writing, and problem-solving skills. GYD $20,000 per semester.",
  },
  {
    slug: "math-english-coding",
    headline: "Math, English, Writing, and Coding Support for Kids in Guyana",
    subhead:
      "A practical online program that helps children strengthen school skills while learning how to create with technology.",
    corePromise:
      "By the end of the semester, children should be able to solve structured problems, write clearer explanations, build simple projects, and use computers with better confidence.",
    metaTitle: "Math, English, Writing and Coding Support for Kids in Guyana",
    metaDescription:
      "Online enrichment classes for children in Guyana. Support school learning while building coding, writing, Math, and computer confidence.",
  },
  {
    slug: "ngsa-digital-skills",
    headline: "Build Stronger Thinking Skills Before Secondary School",
    subhead:
      "Online enrichment for Guyanese children that supports Math, English, writing, logic, and computer confidence.",
    corePromise:
      "By the end of the semester, children should be able to break down word problems, explain their thinking, write clearer responses, and complete beginner-friendly digital projects.",
    metaTitle: "NGSA Skill-Building and Digital Skills for Kids in Guyana",
    metaDescription:
      "Help your child strengthen Math, English, writing, problem-solving, and computer confidence with CODEship's online enrichment program.",
    complianceNote:
      "CODEship supports NGSA skill-building and helps strengthen skills used in NGSA preparation. This is not an official NGSA program, is not Ministry-approved, and does not guarantee exam results.",
  },
  {
    slug: "computer-classes-for-kids",
    headline: "Computer Classes for Children in Guyana",
    subhead:
      "Help your child become more confident using computers, online tools, coding basics, and digital problem-solving.",
    corePromise:
      "By the end of the semester, children should be able to use common digital tools more confidently, understand basic coding concepts, and create a simple digital project.",
    metaTitle: "Computer Classes for Children in Guyana | CODEship Academy",
    metaDescription:
      "Online computer literacy classes for kids in Guyana. Build digital confidence, coding basics, and problem-solving skills from home. GYD $20,000 per semester.",
  },
  {
    slug: "online-stem-classes",
    headline: "Online STEM Classes for Kids in Guyana",
    subhead:
      "A practical online program that helps children build skills in coding, logic, Math, writing, and digital creativity.",
    corePromise:
      "By the end of the semester, children should be able to build a project, explain their process, solve problems step by step, and present what they created.",
    metaTitle: "Online STEM Classes for Kids in Guyana | CODEship Academy",
    metaDescription:
      "Online STEM classes for children in Guyana. Build coding, Math thinking, writing, and problem-solving skills through hands-on projects. GYD $20,000 per semester.",
  },
];

export function getGuyanaCampaign(slug: string): GuyanaCampaign | undefined {
  return GUYANA_CAMPAIGNS.find((c) => c.slug === slug);
}

/** Shared page-anatomy content — identical across all 5 pages per the brief. */

export const GUYANA_TRUST_LINE = "Online · Small-group learning · Math, English, writing, coding, and computer skills";

export const GUYANA_PARENT_PROBLEMS: string[] = [
  "My child needs more confidence with schoolwork.",
  "My child uses devices but does not really understand technology.",
  "My child needs stronger Math and English foundations.",
  "My child needs better writing and explanation skills.",
  "I want my child to learn useful skills for the future.",
];

export const GUYANA_LEARN_AREAS: string[] = [
  "Coding basics",
  "Math thinking",
  "English comprehension",
  "Writing and explanation",
  "Computer literacy",
  "Problem-solving",
  "Digital creativity",
  "Presentation confidence",
];

export const GUYANA_OUTCOME_BULLETS: string[] = [
  "Build a simple digital project",
  "Explain how their project works",
  "Use step-by-step thinking to solve problems",
  "Strengthen Math reasoning through coding activities",
  "Write clearer explanations and project reflections",
  "Use computers and online tools with more confidence",
  "Present their work to a teacher, parent, or class group",
  "Understand how technology connects to real life",
];

export const GUYANA_PROGRAM_STRUCTURE_BULLETS: string[] = [
  "Online classes only",
  "Live instructor-led sessions",
  "Beginner-friendly",
  "Small-group format",
  "GYD $20,000 per semester",
  "Designed for children in Guyana",
  "Suitable for children who are new to coding",
];

export const GUYANA_CURRICULUM_INTRO =
  "CODEship combines coding with academic skill-building. Students are not only learning to click and type. They are learning how to think, explain, create, and solve problems.";

export const GUYANA_CURRICULUM_PILLARS: { title: string; desc: string }[] = [
  { title: "Math", desc: "Patterns, sequencing, logic, problem-solving" },
  { title: "English", desc: "Reading instructions, understanding tasks, vocabulary" },
  { title: "Writing", desc: "Explaining steps, reflecting on projects, presenting ideas" },
  { title: "Computer sense", desc: "Typing, navigating tools, using digital platforms safely" },
  { title: "Coding", desc: "Blocks, websites, JavaScript, Python, or age-appropriate tools" },
  { title: "Confidence", desc: "Completing projects and showing their work" },
];

export const GUYANA_PROJECTS_BY_AGE: { group: string; projects: string[] }[] = [
  {
    group: "For younger children",
    projects: ["My Helpful Robot", "Digital Kindness Card", "Shape and Pattern Builder", "Animal Sorting Game", "My First Story Project"],
  },
  {
    group: "For middle grades",
    projects: ["All About Me Webpage", "Weather Helper", "Homework Timer", "Quiz Game", "Community Helper Website"],
  },
  {
    group: "For older students",
    projects: ["Budget Buddy", "Fact or Fake Quiz", "Password Strength Checker", "Data Detective", "Chatbot for Good"],
  },
];

export const GUYANA_WHY_CHOOSE: string[] = [
  "Helps children build real projects",
  "Strengthens school-related skills",
  "Teaches technology in a structured way",
  "Beginner-friendly and supportive",
  "Helps children explain their thinking",
  "Builds confidence beyond the classroom",
  "Designed for children growing up in a digital world",
];

export const GUYANA_PRICING = {
  semesterFeeLabel: "Semester Fee: GYD $20,000",
  includesLine: "Includes live online instruction, project-based learning, guided activities, and semester outcomes.",
  perSessionLine: "That works out to GYD $5,000 per session, depending on the semester schedule.",
  ctaLabel: "Register for the Next Online Semester",
};

export interface GuyanaFAQItem {
  question: string;
  answer: string;
}

export const GUYANA_FAQ: GuyanaFAQItem[] = [
  {
    question: "Is this only a coding class?",
    answer:
      "No. CODEship teaches coding, but also supports Math thinking, English comprehension, writing, computer literacy, and problem-solving.",
  },
  {
    question: "Does my child need coding experience?",
    answer: "No. The program is beginner-friendly.",
  },
  {
    question: "Is this available in Georgetown only?",
    answer:
      "No. This is online, so children can join from Georgetown, East Bank Demerara, East Coast Demerara, Berbice, Linden, Essequibo, and across Guyana.",
  },
  {
    question: "Does this replace school or tutoring?",
    answer:
      "No. CODEship is an enrichment program that supports school learning and helps children build practical digital skills.",
  },
  {
    question: "How much is the semester?",
    answer: "The semester fee is GYD $20,000.",
  },
  {
    question: "What will my child be able to do after one semester?",
    answer:
      "They will complete a digital project, explain how it works, practise problem-solving, and build confidence with computers, Math thinking, English, and writing.",
  },
];

export const GUYANA_FINAL_CTA = {
  headline: "Give your child skills they can use in school, online, and in the future.",
  ctaLabel: "Register for Online Classes",
};

export const GUYANA_COMPLIANCE_DISCLAIMER =
  "CODEship is an online enrichment program. It supports school learning and NGSA skill-building — it is not an official NGSA program, is not Ministry-approved or endorsed, and does not guarantee grades or exam results.";

/** Communities/regions offered in the lead-capture form's region field. */
export const GUYANA_REGIONS: { value: string; label: string }[] = [
  { value: "georgetown", label: "Georgetown" },
  { value: "greater-georgetown", label: "Greater Georgetown" },
  { value: "east-bank-demerara", label: "East Bank Demerara" },
  { value: "east-coast-demerara", label: "East Coast Demerara" },
  { value: "west-demerara", label: "West Demerara" },
  { value: "linden", label: "Linden" },
  { value: "berbice", label: "Berbice" },
  { value: "new-amsterdam", label: "New Amsterdam" },
  { value: "essequibo", label: "Essequibo" },
  { value: "bartica", label: "Bartica" },
  { value: "lethem", label: "Lethem" },
  { value: "guyana", label: "Other / Guyana-wide" },
];

/** "Main support needed" options in the lead-capture form. */
export const GUYANA_SUPPORT_NEEDED: string[] = ["Coding", "Math", "English", "Writing", "Computer Skills", "NGSA Support"];
