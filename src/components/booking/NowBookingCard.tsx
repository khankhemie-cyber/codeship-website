import Link from "next/link";
import { IN_PERSON_VENUE } from "@/data/locations";
import { PRICE_LABEL, SEMESTER_SHAPE_LABEL } from "@/config/offering";
import { SEMESTERS, SATURDAY_SLOTS } from "@/lib/booking";

/** The at-a-glance booking card: open semesters and Saturday class times. */
export default function NowBookingCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-white shadow-2xl p-6 sm:p-8 ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-2xl font-extrabold text-[#001532]">Now booking</h2>
        <span className="text-sm font-bold bg-[#138A9A]/10 text-[#0f6f7c] px-3 py-1">
          {PRICE_LABEL}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {SEMESTERS.map((sem) => (
          <div key={sem.key} className=" border-2 border-[#F4D734] bg-[#F4D734]/10 p-4">
            <p className="font-extrabold text-[#001532] text-lg leading-tight">{sem.label}</p>
            <p className="text-[#001532] text-sm sm:text-base mt-1">{sem.dates}</p>
          </div>
        ))}
      </div>

      <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">
        Saturdays at {IN_PERSON_VENUE.building}
      </p>
      <div className="divide-y divide-gray-100 border border-gray-200">
        {SATURDAY_SLOTS.map((slot) => (
          <div key={slot.time} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
            <p className="font-extrabold text-[#001532] text-lg sm:w-44 shrink-0">{slot.time}</p>
            <div className="flex flex-wrap gap-2">
              {slot.programs.map((p) => (
                <Link
                  key={p.slug}
                  href={`/register/${p.slug}`}
                  className="inline-flex items-baseline gap-2 bg-[#001532] text-white px-3 py-2 text-base font-semibold hover:bg-[#138A9A] transition-colors"
                >
                  {p.level}
                  <span className="text-sm font-normal text-gray-300">{p.gradeBand}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-base text-gray-600 mt-5">
        {SEMESTER_SHAPE_LABEL} per semester.{" "}
        <Link href="/register" className="text-[#0f6f7c] font-semibold underline underline-offset-2">
          Online classes
        </Link>{" "}
        are also available.
      </p>
    </div>
  );
}
