import { CLASS_SCHEDULE, START_OPTIONS } from "@/config/classSchedule";
import { CLASSES_PER_SEMESTER } from "@/config/offering";
import { IN_PERSON_VENUE, type ProgramSlug } from "@/data/locations";

interface ClassScheduleCardProps {
  program: ProgramSlug;
  /** Optional heading override. */
  heading?: string;
  className?: string;
}

interface FormatSchedule {
  days: string;
  time: string;
  starts: Record<string, string>;
}

interface RowProps {
  label: string;
  accent: string;
  schedule: FormatSchedule;
  note: string;
}

function ScheduleRow({ label, accent, schedule, note }: RowProps) {
  return (
    <div className=" border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: accent }} />
        <h3 className="text-xl font-bold text-[#001532]">{label}</h3>
      </div>
      <p className="text-lg font-bold text-[#001532]">
        {schedule.days}, {schedule.time.replace(" ET", "")}
      </p>
      <dl className="mt-4 space-y-3 border-t border-gray-100 pt-4">
        {START_OPTIONS.map((opt) => (
          <div key={opt.key}>
            <dt className="text-sm text-gray-500">{opt.label}</dt>
            <dd className="text-base font-semibold text-[#001532]">{schedule.starts[opt.key].replace(/^Weekly,\s*/, "")}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-base text-gray-600">{note}</p>
    </div>
  );
}

/**
 * Always-visible class dates & times for a program, showing BOTH formats
 * (in-person in Oshawa and online) side by side. Reads from the single
 * source of truth in src/config/classSchedule.js so dates stay consistent
 * everywhere they appear.
 */
export default function ClassScheduleCard({ program, heading = "Dates and times", className = "" }: ClassScheduleCardProps) {
  const schedule = CLASS_SCHEDULE[program];

  return (
    <div className={className}>
      <h2 className="text-3xl font-extrabold text-[#001532]">{heading}</h2>
      <p className="text-lg text-gray-600 mt-2 mb-6">
        {CLASSES_PER_SEMESTER} weekly classes per semester. Choose your semester at checkout.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ScheduleRow
          label="In person"
          accent="#138A9A"
          schedule={schedule.inperson}
          note={`${IN_PERSON_VENUE.building}, ${IN_PERSON_VENUE.street}, ${IN_PERSON_VENUE.city}`}
        />
        <ScheduleRow label="Online" accent="#F4D734" schedule={schedule.online} note="Live with an instructor. Eastern Time." />
      </div>
    </div>
  );
}
