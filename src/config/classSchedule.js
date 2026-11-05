/**
 * Mode-correct class schedule per program (informational display only).
 * Each cohort is 8 weekly classes (see SEMESTER_WEEKS in src/config/offering.ts).
 * In-person runs Saturdays; online runs Tuesdays (Explorers/Builders) or
 * Thursdays (Developers/Engineers).
 *
 * Families choose one of two open semesters at checkout: November or
 * January, both at the same weekly day and time. (The September and October
 * semesters are already underway and no longer bookable.) A single Stripe Payment
 * Link (see src/lib/payment-links.ts) serves every start; the desired start is
 * confirmed by a question on the Stripe checkout, so no per-start links exist.
 *
 * No classes run the weeks of Sep 1, Sep 12, and Oct 19, 2026, or during the
 * winter break (weeks of Dec 21 and Dec 28, 2026). Each cohort's 8 classes skip
 * those weeks, so the date ranges below already account for the breaks. Times
 * are Eastern (ET): cohorts that run past Nov 1 cross the EDT→EST change, so
 * ranges are labelled ET rather than a single offset.
 */

/** The enrollment starts open for booking, in display order. */
export const START_OPTIONS = [
  { key: "november", label: "November semester" },
  { key: "january", label: "January semester" },
];

/**
 * The first class date pulled from a "Weekly, <start> to <end>, <year>" range,
 * e.g. "Weekly, Sep 19 to Nov 14, 2026" -> "Sep 19". Used to build compact
 * multi-start labels where a full range per start would not fit.
 */
export function startDate(rangeString) {
  const first = rangeString.replace(/^Weekly,\s*/, "").split(/ to |–/)[0].trim();
  return first.replace(/,?\s*20\d\d$/, "").trim();
}

/**
 * Compact one-line summary of the open starts for a format slot, e.g.
 * "starts Nov 7 or Jan 16".
 */
export function startsSummary(slot) {
  return `starts ${startDate(slot.starts.november)} or ${startDate(slot.starts.january)}`;
}

export const CLASS_SCHEDULE = {
  explorers: {
    inperson: {
      days: "Saturdays",
      time: "9:00–10:00 AM ET",
      starts: {
        november: "Weekly, Nov 7, 2026 to Jan 9, 2027",
        january: "Weekly, Jan 16 to Mar 6, 2027",
      },
    },
    online: {
      days: "Tuesdays",
      time: "4:00–4:55 PM ET",
      starts: {
        november: "Weekly, Nov 3, 2026 to Jan 5, 2027",
        january: "Weekly, Jan 12 to Mar 2, 2027",
      },
    },
  },
  builders: {
    inperson: {
      days: "Saturdays",
      time: "9:00–10:00 AM ET",
      starts: {
        november: "Weekly, Nov 7, 2026 to Jan 9, 2027",
        january: "Weekly, Jan 16 to Mar 6, 2027",
      },
    },
    online: {
      days: "Tuesdays",
      time: "5:00–5:55 PM ET",
      starts: {
        november: "Weekly, Nov 3, 2026 to Jan 5, 2027",
        january: "Weekly, Jan 12 to Mar 2, 2027",
      },
    },
  },
  developers: {
    inperson: {
      days: "Saturdays",
      time: "11:30 AM–12:30 PM ET",
      starts: {
        november: "Weekly, Nov 7, 2026 to Jan 9, 2027",
        january: "Weekly, Jan 16 to Mar 6, 2027",
      },
    },
    online: {
      days: "Thursdays",
      time: "4:00–4:55 PM ET",
      starts: {
        november: "Weekly, Nov 5, 2026 to Jan 7, 2027",
        january: "Weekly, Jan 14 to Mar 4, 2027",
      },
    },
  },
  engineers: {
    inperson: {
      days: "Saturdays",
      time: "11:30 AM–12:30 PM ET",
      starts: {
        november: "Weekly, Nov 7, 2026 to Jan 9, 2027",
        january: "Weekly, Jan 16 to Mar 6, 2027",
      },
    },
    online: {
      days: "Thursdays",
      time: "5:00–5:55 PM ET",
      starts: {
        november: "Weekly, Nov 5, 2026 to Jan 7, 2027",
        january: "Weekly, Jan 14 to Mar 4, 2027",
      },
    },
  },
};
