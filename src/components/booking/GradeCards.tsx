import Link from "next/link";
import { PROGRAMS } from "@/data/programs";
import { CLASS_SCHEDULE } from "@/config/classSchedule";
import { SEMESTERS, LEVEL_ACCENT, rangeOnly, saturdayTime } from "@/lib/booking";

/** One card per level: grade, what they code, Saturday time, open semesters, Book button. */
export default function GradeCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {PROGRAMS.map((p) => (
        <div
          key={p.slug}
          className="h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow border-t-4 p-6 flex flex-col"
          style={{ borderTopColor: LEVEL_ACCENT[p.slug] }}
        >
          <p className="text-sm font-bold uppercase tracking-widest text-gray-500">{p.gradeBand}</p>
          <h3 className="text-2xl font-extrabold text-[#001532] mt-1">{p.level}</h3>
          <p className="text-base text-gray-600 mt-1">{p.codingSpace}</p>

          <dl className="mt-5 mb-6 space-y-3 flex-1">
            <div>
              <dt className="text-sm text-gray-500">Saturdays</dt>
              <dd className="text-base font-bold text-[#001532]">{saturdayTime(p.slug)}</dd>
            </div>
            {SEMESTERS.map((sem) => (
              <div key={sem.key}>
                <dt className="text-sm text-gray-500">{sem.label} semester</dt>
                <dd className="text-base font-semibold text-[#001532]">
                  {rangeOnly(CLASS_SCHEDULE[p.slug].inperson.starts[sem.key])}
                </dd>
              </div>
            ))}
          </dl>

          <Link
            href={`/register/${p.slug}`}
            className="bg-[#F4D734] text-[#001532] text-lg font-bold px-4 py-3 rounded-xl text-center hover:bg-[#E6C51E] transition-colors"
          >
            Book {p.level}
          </Link>
          <Link
            href={`/programs/${p.slug}`}
            className="text-center text-base text-[#001532] font-semibold mt-3 hover:text-[#138A9A]"
          >
            What they&apos;ll learn →
          </Link>
        </div>
      ))}
    </div>
  );
}
