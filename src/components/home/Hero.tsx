import Link from "next/link";
import { PRICE_LABEL, SEMESTER_SHAPE_LABEL } from "@/config/offering";
import { SATURDAY_SLOTS, ONLINE_DAYS, SEMESTERS, startDates, gradeSpan } from "@/lib/booking";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3 border-t border-gray-200">
      <dt className="text-base text-gray-600 whitespace-nowrap">{label}</dt>
      <dd className="text-base font-semibold text-[#001532] text-right">{value}</dd>
    </div>
  );
}

/**
 * Home hero: a calm, editorial split — headline on the left, classroom
 * footage in a clean frame on the right — followed by one panel that lays out
 * the in-person and online semesters side by side.
 */
export default function Hero() {
  return (
    <section className="bg-[#FAF8F4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 lg:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Message */}
          <div className="lg:col-span-5">
            <div className="h-1 w-14 bg-[#F4D734] mb-6" aria-hidden="true" />
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F6F7C]">
              Kindergarten to Grade 8
            </p>
            <h1 className="font-display text-4xl sm:text-5xl xl:text-[3.5rem] font-extrabold text-[#001532] leading-[1.08] tracking-tight mt-4">
              Coding classes for curious kids.
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mt-6 leading-relaxed max-w-md">
              Small groups. Real projects. In person or live online.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link
                href="#semesters"
                className="inline-flex items-center rounded-lg bg-[#001532] px-8 py-4 text-lg font-semibold text-white hover:bg-[#0d2547] transition-colors"
              >
                See Semesters
              </Link>
              <Link
                href="/program-finder"
                className="text-lg font-semibold text-[#001532] border-b-2 border-[#F4D734] pb-0.5 hover:border-[#001532] transition-colors"
              >
                Find your child&apos;s level
              </Link>
            </div>
          </div>

          {/* Footage */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] lg:aspect-[5/4] rounded-2xl overflow-hidden bg-[#001532] shadow-[0_30px_60px_-20px_rgba(0,21,50,0.35)]">
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
          </div>
        </div>

        {/* Semesters */}
        <div
          id="semesters"
          className="scroll-mt-28 mt-14 lg:mt-20 bg-white rounded-2xl shadow-[0_20px_50px_-25px_rgba(0,21,50,0.25)] border-t-4 border-[#F4D734]"
        >
          <div className="px-6 sm:px-10 pt-8 pb-2 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#001532]">
              Now booking: {SEMESTERS.map((s) => s.label).join(" & ")} semesters
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
                  <Row key={s.key} label={`${s.label} semester`} value={`Starts ${startDates("inperson", s.key)}`} />
                ))}
                {SATURDAY_SLOTS.map((slot) => (
                  <Row key={slot.time} label={gradeSpan(slot.programs)} value={slot.time} />
                ))}
              </dl>
              <Link
                href="#book"
                className="mt-6 inline-flex items-center rounded-lg bg-[#F4D734] px-6 py-3 text-base font-semibold text-[#001532] hover:bg-[#E6C51E] transition-colors"
              >
                Book In Person
              </Link>
            </div>

            {/* Online */}
            <div className="px-6 sm:px-10 py-8 border-t border-gray-200 md:border-t-0">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F6F7C]">Live online</p>
              <h3 className="font-display text-xl font-bold text-[#001532] mt-2">After-school classes from home</h3>
              <dl className="mt-5">
                {SEMESTERS.map((s) => (
                  <Row key={s.key} label={`${s.label} semester`} value={`Starts ${startDates("online", s.key)}`} />
                ))}
                {ONLINE_DAYS.map((row) => (
                  <Row key={row.days} label={gradeSpan(row.programs)} value={`${row.days}, 4–6 PM ET`} />
                ))}
              </dl>
              <Link
                href="/register"
                className="mt-6 inline-flex items-center rounded-lg border-2 border-[#001532] px-6 py-2.5 text-base font-semibold text-[#001532] hover:bg-[#001532] hover:text-white transition-colors"
              >
                Book Online
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
