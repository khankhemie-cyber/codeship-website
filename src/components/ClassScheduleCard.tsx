import { CLASS_SCHEDULE } from "@/config/classSchedule";
import { CLASSES_PER_SEMESTER, SEMESTER_WEEKS } from "@/config/offering";
import type { ProgramSlug } from "@/data/locations";

interface ClassScheduleCardProps {
  program: ProgramSlug;
  /** Optional heading override. */
  heading?: string;
  className?: string;
}

interface RowProps {
  label: string;
  accent: string;
  schedule: { days: string; dates: string; time: string };
  note: string;
}

function ScheduleRow({ label, accent, schedule, note }: RowProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
        <h3 className="font-bold text-[#001532]">{label}</h3>
      </div>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">Day</dt>
          <dd className="font-semibold text-[#001532] text-right">{schedule.days}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">Time</dt>
          <dd className="font-semibold text-[#001532] text-right">{schedule.time}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">Dates</dt>
          <dd className="font-semibold text-[#001532] text-right">{schedule.dates}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-gray-500">{note}</p>
    </div>
  );
}

/**
 * Always-visible class dates & times for a program, showing BOTH formats
 * (in-person in Oshawa and online) side by side. Reads from the single
 * source of truth in src/config/classSchedule.js so dates stay consistent
 * everywhere they appear.
 */
export default function ClassScheduleCard({ program, heading = "Class dates & times", className = "" }: ClassScheduleCardProps) {
  const schedule = CLASS_SCHEDULE[program];

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold text-[#001532] mb-1">{heading}</h2>
      <p className="text-gray-500 text-sm mb-5">
        {CLASSES_PER_SEMESTER} weekly classes — one class a week for {SEMESTER_WEEKS} weeks. Pick the format that fits
        your family at checkout.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ScheduleRow
          label="In-Person — Oshawa"
          accent="#138A9A"
          schedule={schedule.inperson}
          note="Serving families across Durham Region."
        />
        <ScheduleRow
          label="Online — anywhere"
          accent="#E5A823"
          schedule={schedule.online}
          note="Live, instructor-led — open to every city."
        />
      </div>
    </div>
  );
}
