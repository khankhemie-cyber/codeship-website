import { PROGRAMS, type Program } from "@/data/programs";
import { IN_PERSON_SATURDAY_SCHEDULE } from "@/data/locations";
import { CLASS_SCHEDULE, START_OPTIONS } from "@/config/classSchedule";

export type OpenStart = "october" | "november";

/** "Weekly, Oct 3 – Nov 28, 2026" -> "Oct 3 – Nov 28, 2026" */
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
  const time = `${shortTime(start)} – ${shortTime(end)}`;
  const slot = slots.find((s) => s.time === time);
  if (slot) slot.programs.push(p);
  else slots.push({ time, programs: [p] });
  return slots;
}, []);

/** Saturday class time for one level, e.g. "9:00–10:00 AM". */
export function saturdayTime(slug: Program["slug"]) {
  return CLASS_SCHEDULE[slug].inperson.time.replace(" ET", "");
}

export const LEVEL_ACCENT: Record<Program["slug"], string> = {
  explorers: "#F4D734",
  builders: "#138A9A",
  developers: "#6E43A8",
  engineers: "#001532",
};
