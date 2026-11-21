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
    requirements: [
      "An interest or background in coding, programming or robotics",
      "English speaking",
      WORK_AUTHORIZATION,
      VSC_REQUIREMENT,
    ],
    assets: ["Experience working with children", "Teaching experience"],
  },
];
