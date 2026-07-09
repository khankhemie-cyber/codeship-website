import type { ProgramSlug } from "./locations";

export type { ProgramSlug };

export interface Semester {
  number: 1 | 2 | 3 | 4;
  project: string;
  bigIdea: string;
  learn: string[];
}

export interface Program {
  slug: ProgramSlug;
  level: string;
  gradeBand: string;
  codingSpace: string;
  accentColour: string; // hex, used for the program's identity colour
  outcome: string;
  summary: string;
  learns: string[];
  semesters: Semester[];
  capstone: { title: string; description: string };
}

/**
 * Authoritative curriculum facts for the four CODEship programs.
 * Every program: 4 semesters + a capstone, ~20 sessions, 8 quizzes,
 * project-based, with inclusive-design accommodations built in.
 */
export const PROGRAMS: Program[] = [
  {
    slug: "explorers",
    level: "Explorers",
    gradeBand: "K–Grade 1",
    codingSpace: "Visual block coding",
    accentColour: "#E5A823",
    outcome: "Gives a computer clear instructions and builds a simple interactive app.",
    summary:
      "Explorers introduces the youngest learners to computational thinking through visual block coding — sequencing, triggers, and simple logic — alongside early lessons in kindness online.",
    learns: [
      "Sequencing",
      "Triggers & events",
      "Simple if-then logic",
      "Position & direction",
      "Debugging",
      "Kindness online & digital footprint",
    ],
    semesters: [
      {
        number: 1,
        project: "My Helpful Robot",
        bigIdea: "Computers follow clear, ordered instructions.",
        learn: ["Sequencing", "Triggers & events", "Position & direction"],
      },
      {
        number: 2,
        project: "Kindness Cards",
        bigIdea: "What we build and share online can make someone's day better.",
        learn: ["Simple if-then logic", "Kindness online & digital footprint"],
      },
      {
        number: 3,
        project: "Recycling Sorter",
        bigIdea: "Programs can help us make good decisions.",
        learn: ["If-then logic", "Debugging"],
      },
      {
        number: 4,
        project: "My Neighbourhood Map",
        bigIdea: "Code can represent the real world around us.",
        learn: ["Position & direction", "Sequencing", "Debugging"],
      },
    ],
    capstone: {
      title: "Show-and-Tell App",
      description: "Explorers combine everything they've learned to build and present a simple interactive app of their own design.",
    },
  },
  {
    slug: "builders",
    level: "Builders",
    gradeBand: "Grades 2–3",
    codingSpace: "HTML & CSS",
    accentColour: "#138A9A",
    outcome: "Builds and styles a real multi-page website.",
    summary:
      "Builders move from blocks to real code, learning HTML structure and CSS styling while developing informational and persuasive writing skills for the web.",
    learns: [
      "Tags",
      "Structure",
      "CSS styling",
      "Lists",
      "Links",
      "Informational & persuasive writing",
      "Digital footprint",
    ],
    semesters: [
      {
        number: 1,
        project: "All About Me Page",
        bigIdea: "HTML tags give structure and meaning to a page.",
        learn: ["Tags", "Structure"],
      },
      {
        number: 2,
        project: "Weather Helper",
        bigIdea: "CSS styling shapes how information looks and feels.",
        learn: ["CSS styling", "Lists"],
      },
      {
        number: 3,
        project: "Class Pet Care Guide",
        bigIdea: "Good writing makes information easy to use.",
        learn: ["Informational writing", "Links"],
      },
      {
        number: 4,
        project: "Save the Bees Awareness Site",
        bigIdea: "Websites can persuade people to care about something.",
        learn: ["Persuasive writing", "Digital footprint"],
      },
    ],
    capstone: {
      title: "Community Helper Website",
      description: "Builders design and code a real multi-page website celebrating a helper in their community.",
    },
  },
  {
    slug: "developers",
    level: "Developers",
    gradeBand: "Grades 4–5",
    codingSpace: "JavaScript",
    accentColour: "#3A5B9E",
    outcome: "Builds interactive tools that solve real problems.",
    summary:
      "Developers write real JavaScript — variables, functions, conditionals, and loops — while building tools that solve everyday problems and learning media and financial literacy.",
    learns: [
      "Variables",
      "Functions",
      "Events",
      "Conditionals",
      "Arrays",
      "Loops",
      "Media literacy",
      "Financial literacy",
    ],
    semesters: [
      {
        number: 1,
        project: "Homework Timer & Focus Tool",
        bigIdea: "Variables and functions let programs track and respond to change.",
        learn: ["Variables", "Functions", "Events"],
      },
      {
        number: 2,
        project: "Healthy Snack Calculator",
        bigIdea: "Conditionals let programs make decisions based on data.",
        learn: ["Conditionals", "Functions"],
      },
      {
        number: 3,
        project: "Fact or Fake? Media-Literacy Quiz",
        bigIdea: "Arrays and loops help programs process lots of information — just like people should question lots of sources.",
        learn: ["Arrays", "Loops", "Media literacy"],
      },
      {
        number: 4,
        project: "Budget Buddy",
        bigIdea: "Code can help people make smarter decisions with their money.",
        learn: ["Loops", "Conditionals", "Financial literacy"],
      },
    ],
    capstone: {
      title: "Problem-Solver App",
      description: "Developers identify a real problem in their own life and build an interactive JavaScript app to solve it.",
    },
  },
  {
    slug: "engineers",
    level: "Engineers",
    gradeBand: "Grades 6–8",
    codingSpace: "Python + AI + Cybersecurity",
    accentColour: "#0D1B2A",
    outcome: "Codes in Python, trains an AI responsibly, and pitches a real tech solution.",
    summary:
      "Engineers write Python, train and evaluate their own AI models with an eye on bias and ethics, analyze real data, and learn practical cybersecurity — culminating in a pitched prototype.",
    learns: [
      "Python logic & data",
      "Training & evaluating an AI model",
      "Bias & ethics in AI",
      "Responsible AI",
      "Data analysis",
      "Real cybersecurity",
    ],
    semesters: [
      {
        number: 1,
        project: "Password Strength Checker",
        bigIdea: "Python logic can help protect people online.",
        learn: ["Python logic & data", "Real cybersecurity"],
      },
      {
        number: 2,
        project: "Smart Sorting AI",
        bigIdea: "AI models learn patterns from data — and inherit the biases in that data.",
        learn: ["Training & evaluating an AI model", "Bias & ethics in AI"],
      },
      {
        number: 3,
        project: "Chatbot for Good",
        bigIdea: "Building AI responsibly means thinking about who it helps and who it might harm.",
        learn: ["Responsible AI", "Training & evaluating an AI model"],
      },
      {
        number: 4,
        project: "Data Detective",
        bigIdea: "Real data analysis turns raw numbers into insight.",
        learn: ["Data analysis", "Python logic & data"],
      },
    ],
    capstone: {
      title: "Innovation Challenge (SDG prototype + pitch)",
      description: "Engineers design a prototype addressing a UN Sustainable Development Goal and pitch it, combining Python, AI, and data skills.",
    },
  },
];

export function getProgram(slug: string): Program | undefined {
  return PROGRAMS.find((p) => p.slug === slug);
}

/** Shared facts about every program's structure, for display without repeating literals. */
export const PROGRAM_STRUCTURE = {
  semesters: 4,
  sessionsApprox: 20,
  quizzes: 8,
  quizzesPerSemester: 2,
};

/** Next semester start date — applies to all programs (K-8 journey, paid LPs, and Guyana). */
export const NEXT_SEMESTER_START = "September 1, 2026";
export const NEXT_SEMESTER_START_FR = "1er septembre 2026";

export const JOURNEY_ARC: Record<ProgramSlug, "Dream" | "Code" | "Achieve"> = {
  explorers: "Dream",
  builders: "Dream",
  developers: "Code",
  engineers: "Achieve",
};
