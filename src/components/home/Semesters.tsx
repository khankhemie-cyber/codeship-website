import Link from "next/link";
import { PRICE_LABEL, SEMESTER_SHAPE_LABEL } from "@/config/offering";
import { SATURDAY_SLOTS, ONLINE_DAYS, SEMESTERS, startDates, gradeSpan } from "@/lib/booking";

function Row({ label, value, open = false }: { label: string; value: string; open?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3 border-t border-gray-200">
      <dt className="text-base text-gray-600 whitespace-nowrap">
        {label}
        {open && <OpenTag />}
      </dt>
      <dd className="text-base font-semibold text-[#001532] text-right">{value}</dd>
    </div>
  );
}

/** Small "Open now" marker for the semester taking registrations. */
export function OpenTag() {
  return (
    <span className="ml-2 inline-block bg-[#F4D734] px-1.5 py-0.5 align-middle text-xs font-bold uppercase tracking-wider text-[#001532]">
      Open now
    </span>
  );
}

/** The in-person and online semesters side by side, with class times. */
export default function Semesters() {
  return (
    <div
      id="semesters"
      className="scroll-mt-28 mt-12 bg-white shadow-[0_20px_50px_-25px_rgba(0,21,50,0.25)] border-t-4 border-[#F4D734]"
    >
      <div className="px-6 sm:px-10 pt-8 pb-2 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#001532]">
          November registration is open
        </h2>
        <p className="text-base text-gray-600">
          {PRICE_LABEL} · {SEMESTER_SHAPE_LABEL}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x divide-gray-200">
        {/* In person */}
        <div className="px-6 sm:px-10 py-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F6F7C]">In person</p>
          <h3 className="font-display text-xl font-bold text-[#001532] mt-2">Saturday classes</h3>
          <dl className="mt-5">
            {SEMESTERS.map((s) => (
              <Row key={s.key} label={`${s.label} semester`} value={`Starts ${startDates("inperson", s.key)}`} open={s.key === "november"} />
            ))}
            {SATURDAY_SLOTS.map((slot) => (
              <Row key={slot.time} label={gradeSpan(slot.programs)} value={slot.time} />
            ))}
          </dl>
          <Link
            href="#book"
            className="mt-6 inline-flex items-center bg-[#F4D734] px-6 py-3 text-base font-semibold text-[#001532] hover:bg-[#E6C51E] transition-colors"
          >
            Enroll In Person
          </Link>
        </div>

        {/* Online */}
        <div className="px-6 sm:px-10 py-8 border-t border-gray-200 md:border-t-0">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F6F7C]">Live online</p>
          <h3 className="font-display text-xl font-bold text-[#001532] mt-2">After-school classes from home</h3>
          <dl className="mt-5">
            {SEMESTERS.map((s) => (
              <Row key={s.key} label={`${s.label} semester`} value={`Starts ${startDates("online", s.key)}`} open={s.key === "november"} />
            ))}
            {ONLINE_DAYS.map((row) => (
              <Row key={row.days} label={gradeSpan(row.programs)} value={`${row.days}, 4–6 PM ET`} />
            ))}
          </dl>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center border-2 border-[#001532] px-6 py-2.5 text-base font-semibold text-[#001532] hover:bg-[#001532] hover:text-white transition-colors"
          >
            Enroll Online
          </Link>
        </div>
      </div>
    </div>
  );
}
