import { PROGRAMS, type Program } from "@/data/programs";
import { IN_PERSON_SATURDAY_SCHEDULE } from "@/data/locations";
import { CLASS_SCHEDULE, START_OPTIONS } from "@/config/classSchedule";

export type OpenStart = "october" | "november";

/** "Weekly, Oct 3 to Nov 28, 2026" -> "Oct 3 to Nov 28, 2026" */
export function rangeOnly(range: string) {
  return range.replace(/^Weekly,\s*/, "");
}

/** The semesters open for booking. In-person dates are the same for every level. */
export const SEMESTERS = START_OPTIONS.map((opt) => ({
  key: opt.key as OpenStart,
  label: opt.label.replace(" semester", ""),
  dates: rangeOnly(CLASS_SCHEDULE.explorers.inperson.starts[opt.key as OpenStart]),
}));

/** "9:00 AM" -> "9 AM"; "11:30 AM" stays as is. */
function shortTime(t: string) {
  return t.replace(":00", "");
}

/** Saturday time slots with the levels that share each one, in run order. */
export const SATURDAY_SLOTS = PROGRAMS.reduce<{ time: string; programs: Program[] }[]>((slots, p) => {
  const { start, end } = IN_PERSON_SATURDAY_SCHEDULE[p.slug];
  const time = `${shortTime(start)} to ${shortTime(end)}`;
  const slot = slots.find((s) => s.time === time);
  if (slot) slot.programs.push(p);
  else slots.push({ time, programs: [p] });
  return slots;
}, []);

/** Saturday class time for one level, e.g. "9:00–10:00 AM". */
export function saturdayTime(slug: Program["slug"]) {
  return CLASS_SCHEDULE[slug].inperson.time.replace(" ET", "");
}

/** "Weekly, Oct 6 to Dec 1, 2026" -> "Oct 6" */
function firstDate(range: string) {
  return rangeOnly(range).split(/ to |–/)[0].trim().replace(/,?\s*20\d\d$/, "");
}

/** Every distinct first-class date for a format and semester, in date order, e.g. "Oct 1 or Oct 6". */
export function startDates(format: "inperson" | "online", sem: OpenStart) {
  const dates = Array.from(new Set(PROGRAMS.map((p) => firstDate(CLASS_SCHEDULE[p.slug][format].starts[sem]))));
  dates.sort((a, b) => Date.parse(`${a} 2026`) - Date.parse(`${b} 2026`));
  return dates.join(" or ");
}

/** Online class days with the levels that meet on each, in run order. */
export const ONLINE_DAYS = PROGRAMS.reduce<{ days: string; programs: Program[] }[]>((acc, p) => {
  const days = CLASS_SCHEDULE[p.slug].online.days;
  const row = acc.find((r) => r.days === days);
  if (row) row.programs.push(p);
  else acc.push({ days, programs: [p] });
  return acc;
}, []);

/** Combined grade span for a group of levels, e.g. ["K–Grade 1", "Grades 2–3"] -> "K–Grade 3". */
export function gradeSpan(programs: Program[]) {
  const start = programs[0].gradeBand.replace(/^Grades?\s*/, "").split("–")[0];
  const end = programs[programs.length - 1].gradeBand.split("–").pop()!.replace(/^Grade\s*/, "");
  return start === "K" ? `K–Grade ${end}` : `Grades ${start}–${end}`;
}

export const LEVEL_ACCENT: Record<Program["slug"], string> = {
  explorers: "#F4D734",
  builders: "#138A9A",
  developers: "#6E43A8",
  engineers: "#001532",
};
