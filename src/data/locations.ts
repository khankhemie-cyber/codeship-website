/**
 * Single source of truth for CODEship program locations & schedules.
 * Render these facts exactly as defined here — do not restate them inline elsewhere.
 */

export const IN_PERSON = ["Toronto", "Vaughan", "Oshawa", "Calgary", "Vancouver"] as const;
export type InPersonCity = (typeof IN_PERSON)[number];

/** City-center coordinates (public geographic facts, not a claimed street address) for LocalBusiness geo. */
export const IN_PERSON_CITY_GEO: Record<InPersonCity, { latitude: number; longitude: number }> = {
  Toronto: { latitude: 43.6532, longitude: -79.3832 },
  Vaughan: { latitude: 43.8361, longitude: -79.4983 },
  Oshawa: { latitude: 43.8971, longitude: -78.8658 },
  Calgary: { latitude: 51.0447, longitude: -114.0719 },
  Vancouver: { latitude: 49.2827, longitude: -123.1207 },
};

/** All 5 in-person cities run every program on Saturdays, 9:00 AM-1:45 PM — see IN_PERSON_SATURDAY_AGENDA below. */
export const IN_PERSON_OPENING_HOURS = ["Sa 09:00-13:45"];

export type ProgramSlug = "explorers" | "builders" | "developers" | "engineers";

/**
 * Online (virtual) weekly schedule — one 55-minute class per program, back-to-back
 * by pair (Explorers/Builders on Tuesday, Developers/Engineers on Thursday, each
 * pair younger-first). `start24` is the 24-hour ET start time, used only to build
 * a stable registration UTM slot slug (see src/lib/registration.ts) — keep it in
 * sync with `window` if the schedule changes again.
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
 * In-person Saturday schedule, shared across all 5 in-person cities.
 * Every Saturday, each in-person location runs all 4 programs back-to-back,
 * 9:00 AM–1:45 PM, with 15-minute transitions between classes and one
 * 35-minute break after the 2nd class. Classes run in grade order
 * (youngest to oldest) so families can drop off / pick up in one visit.
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

/** The full Saturday agenda at each in-person location, in run order. */
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

export type LocationOption =
  | { type: "in-person"; city: InPersonCity; label: string }
  | { type: "online"; label: string };

/** Every program's selectable options = the 5 in-person cities (Saturdays) plus Online on that program's day. */
export function getLocationOptions(program: ProgramSlug): LocationOption[] {
  const schedule = IN_PERSON_SATURDAY_SCHEDULE[program];
  const inPerson: LocationOption[] = IN_PERSON.map((city) => ({
    type: "in-person",
    city,
    label: `${city} — Saturdays, ${schedule.start}–${schedule.end}`,
  }));
  const online: LocationOption = {
    type: "online",
    label: `Online — ${ONLINE[program].day}s, ${ONLINE[program].window}`,
  };
  return [...inPerson, online];
}

export type LocationValue = Lowercase<InPersonCity> | "online";

export function locationLabel(value: LocationValue): string {
  if (value === "online") return "Online";
  const city = IN_PERSON.find((c) => c.toLowerCase() === value);
  return city ?? value;
}
