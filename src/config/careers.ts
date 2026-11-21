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
  summary: string;
  requirements: string[];
  assets: string[];
}

export const ROLE_TERMS = [
  "Contract position (not permanent)",
  "Start immediately",
  "Approximately 2–4 hours a week, with the opportunity to take on more classes and shifts",
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
    summary: "Leads and manages classes.",
    requirements: [
      "Background in coding, programming and robotics",
      "English speaking",
      "Must provide a current Vulnerable Sector Check before starting",
    ],
    assets: ["Experience working with children", "Teaching experience"],
  },
  {
    slug: "assistant-instructor",
    title: "Assistant Instructor",
    hourlyRate: 20,
    summary: "Supports the lead instructor in classes. Can be junior in the field; less experience required.",
    requirements: [
      "Interest or background in coding, programming or robotics",
      "English speaking",
      "Must provide a current Vulnerable Sector Check before starting",
    ],
    assets: ["Experience working with children", "Teaching experience"],
  },
];
