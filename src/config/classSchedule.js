/**
 * Mode-correct class schedule per program (informational display only).
 * Each cohort is 8 weekly classes (see SEMESTER_WEEKS in src/config/offering.ts).
 * In-person runs Saturdays; online runs Tuesdays (Explorers/Builders) or
 * Thursdays (Developers/Engineers).
 *
 * Families choose one of three start dates at checkout — September, October,
 * or November — all at the same weekly day and time. A single Stripe Payment
 * Link (see src/lib/payment-links.ts) serves every start; the desired start is
 * confirmed by a question on the Stripe checkout, so no per-start links exist.
 *
 * No classes run the weeks of Sep 1, Sep 12, and Oct 19, 2026, or during the
 * winter break (weeks of Dec 21 and Dec 28, 2026). Each cohort's 8 classes skip
 * those weeks, so the date ranges below already account for the breaks. Times
 * are Eastern (ET) — cohorts that run past Nov 1 cross the EDT→EST change, so
 * ranges are labelled ET rather than a single offset.
 */

/** The three enrollment starts, in display order. */
export const START_OPTIONS = [
  { key: "september", label: "September start" },
  { key: "october", label: "October start" },
  { key: "november", label: "November start" },
];

/**
 * The first class date pulled from a "Weekly, <start> – <end>, <year>" range,
 * e.g. "Weekly, Sep 19 – Nov 14, 2026" -> "Sep 19". Used to build compact
 * multi-start labels where a full range per start would not fit.
 */
export function startDate(rangeString) {
  const first = rangeString.replace(/^Weekly,\s*/, "").split("–")[0].trim();
  return first.replace(/,?\s*20\d\d$/, "").trim();
}

/**
 * Compact one-line summary of the three starts for a format slot, e.g.
 * "starts Sep 19, Oct 3 or Nov 7".
 */
export function startsSummary(slot) {
  return `starts ${startDate(slot.starts.september)}, ${startDate(slot.starts.october)} or ${startDate(
    slot.starts.november
  )}`;
}

export const CLASS_SCHEDULE = {
  explorers: {
    inperson: {
      days: "Saturdays",
      time: "9:00–10:00 AM ET",
      starts: {
        september: "Weekly, Sep 19 – Nov 14, 2026",
        october: "Weekly, Oct 3 – Nov 28, 2026",
        november: "Weekly, Nov 7, 2026 – Jan 9, 2027",
      },
    },
    online: {
      days: "Tuesdays",
      time: "4:00–5:00 PM ET",
      starts: {
        september: "Weekly, Sep 15 – Nov 10, 2026",
        october: "Weekly, Oct 6 – Dec 1, 2026",
        november: "Weekly, Nov 3, 2026 – Jan 5, 2027",
      },
    },
  },
  builders: {
    inperson: {
      days: "Saturdays",
      time: "10:10–11:05 AM ET",
      starts: {
        september: "Weekly, Sep 19 – Nov 14, 2026",
        october: "Weekly, Oct 3 – Nov 28, 2026",
        november: "Weekly, Nov 7, 2026 – Jan 9, 2027",
      },
    },
    online: {
      days: "Tuesdays",
      time: "5:00–5:55 PM ET",
      starts: {
        september: "Weekly, Sep 15 – Nov 10, 2026",
        october: "Weekly, Oct 6 – Dec 1, 2026",
        november: "Weekly, Nov 3, 2026 – Jan 5, 2027",
      },
    },
  },
  developers: {
    inperson: {
      days: "Saturdays",
      time: "11:40 AM–12:35 PM ET",
      starts: {
        september: "Weekly, Sep 19 – Nov 14, 2026",
        october: "Weekly, Oct 3 – Nov 28, 2026",
        november: "Weekly, Nov 7, 2026 – Jan 9, 2027",
      },
    },
    online: {
      days: "Thursdays",
      time: "4:00–4:55 PM ET",
      starts: {
        september: "Weekly, Sep 17 – Nov 12, 2026",
        october: "Weekly, Oct 1 – Nov 26, 2026",
        november: "Weekly, Nov 5, 2026 – Jan 7, 2027",
      },
    },
  },
  engineers: {
    inperson: {
      days: "Saturdays",
      time: "12:50–1:45 PM ET",
      starts: {
        september: "Weekly, Sep 19 – Nov 14, 2026",
        october: "Weekly, Oct 3 – Nov 28, 2026",
        november: "Weekly, Nov 7, 2026 – Jan 9, 2027",
      },
    },
    online: {
      days: "Thursdays",
      time: "5:00–5:55 PM ET",
      starts: {
        september: "Weekly, Sep 17 – Nov 12, 2026",
        october: "Weekly, Oct 1 – Nov 26, 2026",
        november: "Weekly, Nov 5, 2026 – Jan 7, 2027",
      },
    },
  },
};
