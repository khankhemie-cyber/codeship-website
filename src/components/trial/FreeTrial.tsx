"use client";

import { PROGRAMS } from "@/data/programs";
import { LEVEL_ACCENT } from "@/lib/booking";
import { LevelIcon } from "@/components/ui/Stem";
import Reveal from "@/components/ui/Reveal";
import { TRIAL_LINKS, TRIAL_TERMS } from "@/config/trialOffer";
import { trackTrialClick } from "@/lib/analytics";
import { useTrialPhase } from "./useTrialPhase";

const ON_ACCENT: Record<string, string> = {
  explorers: "#001532",
  builders: "#FFFFFF",
  developers: "#FFFFFF",
  engineers: "#FFFFFF",
};

const STEPS = [
  { title: "Pick your child's grade", desc: "Each grade band has its own program and tools." },
  { title: "Register for free", desc: "Book any time up to November 30. It takes a minute." },
  { title: "Come to class", desc: "Take your free class in November, in person in Oshawa or live online." },
];

/**
 * The November free trial: one card per program with its own Stripe trial
 * link, three steps, and the offer's terms. Hidden once November is over.
 */
export default function FreeTrial() {
  const phase = useTrialPhase();
  if (phase === "closed") return null;

  return (
    <section id="free-trial" className="relative overflow-hidden bg-[#FAF8F4] bg-dotgrid py-16 sm:py-24 scroll-mt-28">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-3xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0F6F7C]">
            01 · Free trial · November 2026 only
          </p>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-[#001532] mt-3 leading-tight">
            One free class. Any program. Online or in person.
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mt-5">
            See how your child learns with us before you commit to a semester.
          </p>
        </Reveal>

        {/* Programs */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROGRAMS.map((p, i) => (
            <Reveal key={p.slug} delay={i * 80} className="h-full">
              <div className="group relative flex h-full flex-col bg-white shadow-sm transition-shadow hover:shadow-xl">
                <div
                  className="flex items-center justify-between px-5 py-3"
                  style={{ backgroundColor: LEVEL_ACCENT[p.slug], color: ON_ACCENT[p.slug] }}
                >
                  <span className="text-sm font-bold uppercase tracking-widest">{p.gradeBand}</span>
                  <LevelIcon slug={p.slug} className="h-5 w-5" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-2xl font-extrabold text-[#001532]">{p.level}</h3>
                  <p className="text-base text-gray-600 mt-1 flex-1">{p.codingSpace}</p>
                  <p className="mt-5 flex items-baseline gap-2 text-[#001532]">
                    <span className="font-display text-3xl font-extrabold">Free</span>
                    <span className="text-sm text-gray-500">1 trial class</span>
                  </p>
                  <a
                    href={TRIAL_LINKS[p.slug]}
                    onClick={() => trackTrialClick({ program: p.slug })}
                    aria-label={`Book a free ${p.level} trial class`}
                    className="mt-4 inline-flex items-center justify-center whitespace-nowrap bg-[#001532] px-5 py-3 text-base font-bold text-white transition-colors hover:bg-[#F4D734] hover:text-[#001532]"
                  >
                    Book free trial →
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Steps + fine print */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <Reveal className="lg:col-span-3">
            <h3 className="font-display text-xl font-bold text-[#001532]">How it works</h3>
            <ol className="mt-5 space-y-5">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="w-6 flex-none font-display text-2xl font-extrabold text-[#0F6F7C]">{i + 1}</span>
                  <div>
                    <p className="text-lg font-bold text-[#001532]">{s.title}</p>
                    <p className="text-base text-gray-600">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-2">
            <div className="border-l-4 border-[#F4D734] bg-white p-6 shadow-sm">
              <h3 className="font-display text-xl font-bold text-[#001532]">The fine print</h3>
              <ul className="mt-4 space-y-3">
                {TRIAL_TERMS.map((t) => (
                  <li key={t} className="text-base text-gray-700">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
