import Link from "next/link";
import { IN_PERSON_VENUE } from "@/data/locations";
import { PRICE_LABEL, SEMESTER_SHAPE_LABEL } from "@/config/offering";
import { SATURDAY_SLOTS, ONLINE_DAYS, startDates, gradeSpan } from "@/lib/booking";

/**
 * Home hero: real classroom footage beside a solid brand panel, with three
 * colour cards overlapping the bottom edge. The first two cards spell out
 * the in-person and online semesters open for booking.
 */
export default function Hero() {
  return (
    <>
      <section className="bg-[#001532]">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Classroom footage */}
          <div className="relative lg:col-span-7 h-64 sm:h-80 lg:h-auto lg:min-h-[600px] overflow-hidden">
            <video
              autoPlay
              muted
              loop
              playsInline
              poster="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1400&q=80"
              className="absolute inset-0 h-full w-full object-cover"
              aria-hidden="true"
            >
              <source
                src="https://videos.pexels.com/video-files/7868164/7868164-hd_1920_1080_25fps.mp4"
                type="video/mp4"
              />
            </video>
          </div>

          {/* Message panel */}
          <div className="lg:col-span-5 flex items-center px-6 sm:px-10 lg:px-14 pt-12 pb-32 lg:pt-16 lg:pb-40">
            <div>
              <p className="font-display text-2xl text-[#F4D734]">Dream. Code. Achieve.</p>
              <h1 className="font-display text-4xl sm:text-5xl xl:text-6xl font-semibold text-white leading-[1.05] mt-3">
                Coding classes for curious kids
              </h1>
              <p className="text-lg sm:text-xl text-gray-200 mt-5 leading-relaxed">
                Kindergarten to Grade 8. In person in Oshawa or live online.
              </p>
              <p className="text-lg sm:text-xl text-white font-semibold mt-2">
                New semesters start in October and November.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  href="#book"
                  className="inline-flex items-center rounded-full bg-[#F4D734] px-8 py-4 text-lg font-bold text-[#001532] hover:bg-[#E6C51E] transition-colors"
                >
                  Book a Semester
                </Link>
                <Link href="/program-finder" className="text-lg font-semibold text-white underline underline-offset-4 hover:text-[#F4D734]">
                  Which level fits?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overlapping cards */}
      <section className="bg-[#FAF8F4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 lg:-mt-28 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* In person */}
            <div className="rounded-3xl bg-[#F4D734] text-[#001532] p-7 shadow-xl flex flex-col">
              <p className="text-sm font-bold uppercase tracking-widest">In person</p>
              <h2 className="font-display text-3xl font-semibold mt-1">Saturdays in Oshawa</h2>
              <a
                href={IN_PERSON_VENUE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base mt-2 underline underline-offset-2"
              >
                {IN_PERSON_VENUE.building}, {IN_PERSON_VENUE.street}
              </a>
              <p className="mt-5 text-sm font-bold uppercase tracking-widest">Semesters</p>
              <dl className="mt-2 space-y-2 text-base flex-1">
                <div className="flex justify-between gap-3 border-t border-[#001532]/15 pt-2">
                  <dt>October</dt>
                  <dd className="font-bold text-right">Starts {startDates("inperson", "october")}</dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-[#001532]/15 pt-2">
                  <dt>November</dt>
                  <dd className="font-bold text-right">Starts {startDates("inperson", "november")}</dd>
                </div>
                {SATURDAY_SLOTS.map((slot) => (
                  <div key={slot.time} className="flex justify-between gap-3 border-t border-[#001532]/15 pt-2">
                    <dt className="whitespace-nowrap">{gradeSpan(slot.programs)}</dt>
                    <dd className="font-bold whitespace-nowrap">{slot.time}</dd>
                  </div>
                ))}
              </dl>
              <Link
                href="#book"
                className="mt-6 rounded-full bg-[#001532] px-6 py-3 text-center text-lg font-bold text-white hover:bg-[#0d2547] transition-colors"
              >
                Book In Person
              </Link>
            </div>

            {/* Online */}
            <div className="rounded-3xl bg-[#138A9A] text-white p-7 shadow-xl flex flex-col">
              <p className="text-sm font-bold uppercase tracking-widest text-white/80">Live online</p>
              <h2 className="font-display text-3xl font-semibold mt-1">After school, from home</h2>
              <p className="text-base mt-2 text-white/90">Anywhere in Canada · Eastern Time</p>
              <p className="mt-5 text-sm font-bold uppercase tracking-widest text-white/80">Semesters</p>
              <dl className="mt-2 space-y-2 text-base flex-1">
                <div className="flex justify-between gap-3 border-t border-white/25 pt-2">
                  <dt>October</dt>
                  <dd className="font-bold text-right">Starts {startDates("online", "october")}</dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-white/25 pt-2">
                  <dt>November</dt>
                  <dd className="font-bold text-right">Starts {startDates("online", "november")}</dd>
                </div>
                {ONLINE_DAYS.map((row) => (
                  <div key={row.days} className="flex justify-between gap-3 border-t border-white/25 pt-2">
                    <dt className="whitespace-nowrap">{gradeSpan(row.programs)}</dt>
                    <dd className="font-bold">{row.days}</dd>
                  </div>
                ))}
              </dl>
              <Link
                href="/register"
                className="mt-6 rounded-full bg-white px-6 py-3 text-center text-lg font-bold text-[#0f6f7c] hover:bg-[#FAF8F4] transition-colors"
              >
                Book Online
              </Link>
            </div>

            {/* Help choosing */}
            <div className="rounded-3xl bg-[#6E43A8] text-white p-7 shadow-xl flex flex-col md:col-span-2 lg:col-span-1">
              <p className="text-sm font-bold uppercase tracking-widest text-white/80">New to coding?</p>
              <h2 className="font-display text-3xl font-semibold mt-1">Find the right level</h2>
              <p className="text-lg mt-3 text-white/90 flex-1">
                Every level starts from the basics. Answer two quick questions and we will match your child&apos;s grade.
              </p>
              <p className="text-base font-bold mt-5 border-t border-white/25 pt-3">
                {PRICE_LABEL} · {SEMESTER_SHAPE_LABEL}
              </p>
              <Link
                href="/program-finder"
                className="mt-6 rounded-full bg-white px-6 py-3 text-center text-lg font-bold text-[#6E43A8] hover:bg-[#FAF8F4] transition-colors"
              >
                Take the Quiz
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
