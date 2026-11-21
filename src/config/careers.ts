/**
 * Careers page (/careers) facts: the open instructor roles, where they teach,
 * the application form endpoint and the JobPosting dates. Render these
 * exactly as written: do not add benefits, requirements or details here that
 * have not been confirmed by CODEship.
 */

/**
 * Formspree form ID for instructor applications (the part after
 * https://formspree.io/f/). Submissions are delivered to whichever email the
 * form is set up with in Formspree; it should be admin@codeshipacademy.com.
 * While this is empty the page shows an email-to-apply note instead of the form.
 */
export const CAREERS_FORMSPREE_ID = "";

export const CAREERS_EMAIL = "admin@codeshipacademy.com";

/**
 * JobPosting dates. Fixed (not the build date) so the posting does not look
 * newly posted on every deploy. When the roles are re-posted, move both dates:
 * validThrough is 90 days after datePosted.
 */
export const JOB_DATE_POSTED = "2026-11-21";
export const JOB_VALID_THROUGH = "2027-02-19";

/** Areas with partner sites, in the order they are listed to candidates. */
export const CAREER_AREAS = ["Durham Region", "Markham", "Stouffville", "Scarborough", "Vaughan"] as const;

/** "Durham Region, Markham, Stouffville, Scarborough and Vaughan" */
export const CAREER_AREAS_TEXT = `${CAREER_AREAS.slice(0, -1).join(", ")} and ${CAREER_AREAS[CAREER_AREAS.length - 1]}`;

/** Where Durham-based hires may also have shifts. */
export const CAREERS_HOME_LOCATION = "21 Simcoe St South, Oshawa";

export type RoleSlug = "senior-instructor" | "assistant-instructor";

export interface CareerRole {
  slug: RoleSlug;
  title: string;
  /** CAD per hour. */
  hourlyRate: number;
  /** One line for the careers list. */
  tagline: string;
  /** "About the role" paragraph. */
  about: string;
  /** "What you'll do": verb-led duties. */
  duties: string[];
  requirements: string[];
  assets: string[];
}

/** Applies to every role. Shown as a requirement and as a required box on the form. */
export const WORK_AUTHORIZATION = "Legally able to work in Canada without sponsorship";

export const VSC_REQUIREMENT = "A current Vulnerable Sector Check, provided before you start";

/** The at-a-glance facts shared by both roles (pay is added per role). */
export const ROLE_DETAILS = [
  { label: "Type", value: "Contract (not permanent)" },
  { label: "Start", value: "Immediately" },
  { label: "Hours", value: "About 2–4 hours a week, with more classes and shifts available" },
  { label: "Format", value: "Online, or in person at partner sites" },
  { label: "Students", value: "Ages 4 to 16, up to 20 per class" },
];

/** Who and what instructors teach with. Shared by both roles. */
export const CLASSROOM = [
  "Students aged 4 to 16",
  "Classes of up to 20 students",
  "Robotics kits: Makebot, LEGO SPIKE, Edison V3 and micro:bit",
  "CODEship's own coding software and lessons",
];

/** Steps from application to start. */
export const HIRING_STEPS: { title: string; body?: string }[] = [
  { title: "Screening" },
  { title: "First interview" },
  { title: "Second interview" },
  { title: "Offer", body: "Provide a current Vulnerable Sector Check before you start." },
];

export const WHY_CODESHIP = [
  { title: "Flexible scheduling", body: "About 2–4 hours a week to start, with more classes and shifts available." },
  { title: "Grow your teaching career", body: "The opportunity to grow as a teacher of coding, programming and robotics." },
];

export const LOCATION_TERMS = [
  `Classes are online or at partner sites in ${CAREER_AREAS_TEXT}`,
  "Travel allowance included when travelling to partner sites",
  `Durham-based hires may also have shifts at our location at ${CAREERS_HOME_LOCATION}`,
];

export const ROLES: CareerRole[] = [
  {
    slug: "senior-instructor",
    title: "Senior Instructor",
    hourlyRate: 35,
    tagline: "Lead and manage classes, online and at partner sites.",
    about:
      "As Senior Instructor, you lead and manage CODEship classes, online or at our partner sites.",
    duties: [
      "Lead and manage classes",
      "Prepare lessons",
      "Set up the classroom and equipment",
      "Mark student projects",
      "Prepare report and progress cards",
      "Send updates to parents",
    ],
    requirements: [
      "A background in coding, programming and robotics",
      "English speaking",
      WORK_AUTHORIZATION,
      VSC_REQUIREMENT,
    ],
    assets: ["Experience working with children", "Teaching experience"],
  },
  {
    slug: "assistant-instructor",
    title: "Assistant Instructor",
    hourlyRate: 20,
    tagline: "Support the lead instructor in class. Less experience required.",
    about:
      "As Assistant Instructor, you support the lead instructor in CODEship classes, online or at our partner sites. The role is open to people who are junior in the field: less experience is required.",
    duties: [
      "Support the lead instructor in class",
      "Help with lesson preparation and classroom setup",
      "Help mark student projects and prepare report and progress cards",
      "Help with updates to parents",
    ],
    requirements: [
      "An interest or background in coding, programming or robotics",
      "English speaking",
      WORK_AUTHORIZATION,
      VSC_REQUIREMENT,
    ],
    assets: ["Experience working with children", "Teaching experience"],
  },
];
