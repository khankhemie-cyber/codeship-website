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

/** Where the Oshawa in-person Saturday classes run. Render these exactly — do not restate the address inline. */
export const IN_PERSON_VENUE = {
  building: "Core21",
  street: "21 Simcoe St South",
  city: "Oshawa",
  region: "ON",
  /** e.g. "Core21, 21 Simcoe St South, Oshawa" */
  full: "Core21, 21 Simcoe St South, Oshawa",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Core21%2C+21+Simcoe+St+S%2C+Oshawa%2C+ON",
} as const;

/** Oshawa runs every program on Saturdays, 9:00 AM–12:30 PM — see IN_PERSON_SATURDAY_AGENDA below. */
export const IN_PERSON_OPENING_HOURS = ["Sa 09:00-12:30"];

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
 * In-person Saturday schedule, run at the Oshawa location (Core21, 21 Simcoe St South).
 * Explorers and Builders run at the same time, 9:00–10:00 AM; Developers and
 * Engineers run together, 11:30 AM–12:30 PM.
 */
export const IN_PERSON_SATURDAY_SCHEDULE: Record<
  ProgramSlug,
  { start: string; end: string; length: string }
> = {
  explorers: { start: "9:00 AM", end: "10:00 AM", length: "60 min" },
  builders: { start: "9:00 AM", end: "10:00 AM", length: "60 min" },
  developers: { start: "11:30 AM", end: "12:30 PM", length: "60 min" },
  engineers: { start: "11:30 AM", end: "12:30 PM", length: "60 min" },
};

/** The full Saturday agenda at the Oshawa location, in run order. */
export const IN_PERSON_SATURDAY_AGENDA: Array<
  | { type: "class"; program: ProgramSlug; start: string; end: string }
  | { type: "transition" | "break"; start: string; end: string; length: string }
> = [
  { type: "class", program: "explorers", start: "9:00 AM", end: "10:00 AM" },
  { type: "class", program: "builders", start: "9:00 AM", end: "10:00 AM" },
  { type: "break", start: "10:00 AM", end: "11:30 AM", length: "90 min" },
  { type: "class", program: "developers", start: "11:30 AM", end: "12:30 PM" },
  { type: "class", program: "engineers", start: "11:30 AM", end: "12:30 PM" },
];
