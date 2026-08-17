/**
 * Single source of truth for CODEship's standing price and semester length.
 * One flat price and one schedule apply to every offering — all four coding
 * programs, in-person or online, in every city. Change these constants once and
 * every price/schedule mention updates.
 *
 * This is the standing price, not a promotion — no countdown or "limited time"
 * framing should ever wrap it.
 */

/** Flat tuition per semester, in CAD, for every program and format. */
export const FLAT_PRICE_CAD = 129;

/** Weeks in one semester. One class per week, so this also equals CLASSES_PER_SEMESTER. */
export const SEMESTER_WEEKS = 8;

/** Classes in one semester (one per week). */
export const CLASSES_PER_SEMESTER = SEMESTER_WEEKS;

/** e.g. "CAD $129" — the price with no per-unit suffix. */
export const PRICE_LABEL = `CAD $${FLAT_PRICE_CAD}`;

/** e.g. "CAD $129/semester" — the price with its per-unit suffix. */
export const PRICE_PER_SEMESTER_LABEL = `${PRICE_LABEL}/semester`;

/** e.g. "8 weekly classes" — human phrase for the semester's shape. */
export const SEMESTER_SHAPE_LABEL = `${CLASSES_PER_SEMESTER} weekly classes`;
