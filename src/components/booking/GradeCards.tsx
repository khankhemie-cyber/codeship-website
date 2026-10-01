import Link from "next/link";
import Image from "next/image";
import { PROGRAMS } from "@/data/programs";
import { CLASS_SCHEDULE } from "@/config/classSchedule";
import { SEMESTERS, LEVEL_ACCENT, rangeOnly, saturdayTime } from "@/lib/booking";
import { LevelIcon, LEVEL_PHOTO } from "@/components/ui/Stem";

/** Text colour that reads on each level's accent colour. */
const ON_ACCENT: Record<string, string> = {
  explorers: "#001532",
  builders: "#FFFFFF",
  developers: "#FFFFFF",
  engineers: "#FFFFFF",
};

/** One card per level: photo, level colour and icon, Saturday time, open semesters, Enroll button. */
export default function GradeCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {PROGRAMS.map((p) => (
        <div key={p.slug} className="group h-full bg-white shadow-sm hover:shadow-xl transition-shadow flex flex-col">
          {/* Photo with the level's colour band */}
          <div className="relative h-40 overflow-hidden">
            <Image
              src={LEVEL_PHOTO[p.slug].src}
              alt={LEVEL_PHOTO[p.slug].alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <div
              className="absolute left-0 bottom-0 flex items-center gap-2 px-4 py-2"
              style={{ backgroundColor: LEVEL_ACCENT[p.slug], color: ON_ACCENT[p.slug] }}
            >
              <LevelIcon slug={p.slug} className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-widest">{p.gradeBand}</span>
            </div>
          </div>

          <div className="p-6 flex flex-col flex-1 border-t-4" style={{ borderTopColor: LEVEL_ACCENT[p.slug] }}>
            <h3 className="font-display text-2xl font-extrabold text-[#001532]">{p.level}</h3>
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
              className="bg-[#F4D734] text-[#001532] text-lg font-bold px-4 py-3 text-center hover:bg-[#E6C51E] transition-colors"
            >
              Enroll in {p.level}
            </Link>
            <Link
              href={`/programs/${p.slug}`}
              className="text-center text-base text-[#001532] font-semibold mt-3 hover:text-[#138A9A]"
            >
              What they&apos;ll learn →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
