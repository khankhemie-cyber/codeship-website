/**
 * Single source of truth for CODEship program locations & schedules.
 * Render these facts exactly as defined here — do not restate them inline elsewhere.
 *
 * Format model:
 *   - Online is available everywhere — no location gating (no physical capacity).
 *   - In-person is open for registration in Oshawa only. The other 11 cities are
 *     in-person waitlist (online still open). See LOCATIONS below.
 */

/** The only city where in-person classes are open for registration today. */
export const IN_PERSON = ["Oshawa"] as const;
export type InPersonCity = (typeof IN_PERSON)[number];

/** City-center coordinates (public geographic facts, not a claimed street address) for LocalBusiness geo. */
export const IN_PERSON_CITY_GEO: Record<InPersonCity, { latitude: number; longitude: number }> = {
  Oshawa: { latitude: 43.8971, longitude: -78.8658 },
};

/** Oshawa runs every program on Saturdays, 9:00 AM–1:45 PM — see IN_PERSON_SATURDAY_AGENDA below. */
export const IN_PERSON_OPENING_HOURS = ["Sa 09:00-13:45"];

export type LocationStatus = "open" | "waitlist";

export interface LocationInfo {
  name: string;
  slug: string;
  province: "ON" | "AB" | "BC";
  /** In-person status. Online is open at every location regardless of this. */
  inPerson: LocationStatus;
}

/**
 * The 12 CODEship locations. Exactly these — do not add or remove any.
 * Oshawa in-person is open; the other 11 are in-person waitlist. Online is open
 * everywhere.
 */
export const LOCATIONS: LocationInfo[] = [
  { name: "Oshawa", slug: "oshawa", province: "ON", inPerson: "open" },
  { name: "Toronto", slug: "toronto", province: "ON", inPerson: "waitlist" },
  { name: "Mississauga", slug: "mississauga", province: "ON", inPerson: "waitlist" },
  { name: "Brampton", slug: "brampton", province: "ON", inPerson: "waitlist" },
  { name: "Markham", slug: "markham", province: "ON", inPerson: "waitlist" },
  { name: "Scarborough", slug: "scarborough", province: "ON", inPerson: "waitlist" },
  { name: "Vaughan", slug: "vaughan", province: "ON", inPerson: "waitlist" },
  { name: "Milton", slug: "milton", province: "ON", inPerson: "waitlist" },
  { name: "Calgary", slug: "calgary", province: "AB", inPerson: "waitlist" },
  { name: "Edmonton", slug: "edmonton", province: "AB", inPerson: "waitlist" },
  { name: "Vancouver", slug: "vancouver", province: "BC", inPerson: "waitlist" },
  { name: "Surrey", slug: "surrey", province: "BC", inPerson: "waitlist" },
];

export const LOCATIONS_BY_SLUG: Record<string, LocationInfo> = Object.fromEntries(
  LOCATIONS.map((l) => [l.slug, l])
);

/**
 * Durham Region municipalities CODEship serves from its Oshawa base. Oshawa is
 * the in-person location; the neighbouring towns are service-area only (families
 * travel in, or attend online) — not claims of a physical presence there.
 */
export const DURHAM_SERVICE_AREA = ["Oshawa", "Whitby", "Courtice", "Bowmanville", "Clarington"] as const;

export type ProgramSlug = "explorers" | "builders" | "developers" | "engineers";

/**
 * Online (virtual) weekly schedule — one 55-minute class per program, back-to-back
 * by pair (Explorers/Builders on Tuesday, Developers/Engineers on Thursday, each
 * pair younger-first). Display dates and times live in
 * src/config/classSchedule.js — keep the two in sync if the schedule changes.
 */
export const ONLINE: Record<
  ProgramSlug,
  { day: "Tuesday" | "Thursday"; window: string; length: string; start24: string }
> = {
  explorers: { day: "Tuesday", window: "4:00–4:55 PM ET", length: "55 min", start24: "1600" },
  builders: { day: "Tuesday", window: "5:00–5:55 PM ET", length: "55 min", start24: "1700" },
  developers: { day: "Thursday", window: "4:00–4:55 PM ET", length: "55 min", start24: "1600" },
  engineers: { day: "Thursday", window: "5:00–5:55 PM ET", length: "55 min", start24: "1700" },
};

/**
 * In-person Saturday schedule, run at the Oshawa location.
 * Every Saturday, Oshawa runs all 4 programs back-to-back, 9:00 AM–1:45 PM, with
 * 15-minute transitions between classes and one 35-minute break after the 2nd
 * class. Classes run in grade order (youngest to oldest) so families can drop
 * off / pick up in one visit.
 */
export const IN_PERSON_SATURDAY_SCHEDULE: Record<
  ProgramSlug,
  { start: string; end: string; length: string }
> = {
  explorers: { start: "9:00 AM", end: "9:55 AM", length: "55 min" },
  builders: { start: "10:10 AM", end: "11:05 AM", length: "55 min" },
  developers: { start: "11:40 AM", end: "12:35 PM", length: "55 min" },
  engineers: { start: "12:50 PM", end: "1:45 PM", length: "55 min" },
};

/** The full Saturday agenda at the Oshawa location, in run order. */
export const IN_PERSON_SATURDAY_AGENDA: Array<
  | { type: "class"; program: ProgramSlug; start: string; end: string }
  | { type: "transition" | "break"; start: string; end: string; length: string }
> = [
  { type: "class", program: "explorers", start: "9:00 AM", end: "9:55 AM" },
  { type: "transition", start: "9:55 AM", end: "10:10 AM", length: "15 min" },
  { type: "class", program: "builders", start: "10:10 AM", end: "11:05 AM" },
  { type: "break", start: "11:05 AM", end: "11:40 AM", length: "35 min" },
  { type: "class", program: "developers", start: "11:40 AM", end: "12:35 PM" },
  { type: "transition", start: "12:35 PM", end: "12:50 PM", length: "15 min" },
  { type: "class", program: "engineers", start: "12:50 PM", end: "1:45 PM" },
];
