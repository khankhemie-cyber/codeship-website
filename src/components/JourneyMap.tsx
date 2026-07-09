"use client";

import Link from "next/link";
import { PROGRAMS, JOURNEY_ARC } from "@/data/programs";
import { trackView } from "@/lib/analytics";

interface JourneyMapProps {
  className?: string;
  /** Slug of the program page this map is currently embedded on, if any — marks that node aria-current="page". */
  currentSlug?: string;
}

/** Ascending offsets create the "rising path" from Explorers to Engineers on desktop. */
const RISE_CLASS = ["md:mb-0", "md:mb-6", "md:mb-12", "md:mb-16"];

export default function JourneyMap({ className = "", currentSlug }: JourneyMapProps) {
  return (
    <div className={`relative bg-[#001532] rounded-3xl overflow-hidden ${className}`}>
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E5A823]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#138A9A]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative px-5 py-14 sm:px-10 sm:py-16">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <p className="text-[#E5A823] font-bold text-sm uppercase tracking-widest mb-2">The CODEship Journey</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Dream. Code. Achieve.</h2>
          <p className="text-gray-300 mt-3 text-sm md:text-base leading-relaxed">
            One rising path, four connected stops — Explorers dream up their first program, Builders and Developers
            code it into something real, and Engineers achieve a working pitch. Select a stop to see the full program.
          </p>
        </div>

        {/* Decorative rising path line — hidden from assistive tech, the <ol> below carries the real semantics */}
        <svg
          className="hidden md:block absolute left-0 right-0 pointer-events-none"
          style={{ top: "13.5rem", height: "9rem", width: "100%" }}
          viewBox="0 0 400 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polyline
            points="40,90 153,64 260,38 360,12"
            fill="none"
            stroke="#E5A823"
            strokeWidth="2"
            strokeDasharray="6 6"
            strokeOpacity="0.5"
          />
        </svg>

        <ol
          aria-label="The CODEship program journey, from Explorers to Engineers"
          className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 md:items-end list-none"
        >
          {PROGRAMS.map((program, i) => {
            const isLast = i === PROGRAMS.length - 1;
            const isCurrent = program.slug === currentSlug;
            const next = PROGRAMS[i + 1];

            return (
              <li key={program.slug} className={`relative ${RISE_CLASS[i]}`}>
                <Link
                  href={`/programs/${program.slug}`}
                  aria-current={isCurrent ? "page" : undefined}
                  onClick={() => trackView({ program: program.slug })}
                  className={`group block h-full bg-[#0d2547] border-2 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 focus-visible:-translate-y-1 outline-none focus-visible:ring-4 focus-visible:ring-[#E5A823]/40 ${
                    isCurrent ? "border-[#E5A823]" : "border-[#E5A823]/30 hover:border-[#E5A823] focus-visible:border-[#E5A823]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E5A823] text-[#001532] font-extrabold text-sm shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5A823]">
                      {JOURNEY_ARC[program.slug]}
                    </span>
                    {isCurrent && (
                      <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-white/70">
                        You are here
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-bold text-lg mb-0.5">{program.level}</h3>
                  <p className="text-gray-400 text-xs mb-2">{program.gradeBand}</p>
                  <p className="text-[#E5A823] text-xs font-semibold mb-3">{program.codingSpace}</p>
                  <p className="text-gray-300 text-sm leading-snug">{program.outcome}</p>
                </Link>

                {!isLast && (
                  <>
                    {/* Desktop: hover/focus tooltip connector between nodes */}
                    <div className="hidden md:block absolute top-1/2 -right-4 translate-x-1/2 -translate-y-1/2 z-10">
                      <button
                        type="button"
                        aria-label={`Pass the ${program.level} capstone project, "${program.capstone.title}", to advance to ${next.level}.`}
                        className="peer relative flex items-center justify-center w-7 h-7 rounded-full bg-[#E5A823] text-[#001532] font-bold text-sm outline-none focus-visible:ring-4 focus-visible:ring-[#E5A823]/50 cursor-help"
                      >
                        →
                      </button>
                      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden peer-hover:block peer-focus-visible:block whitespace-nowrap bg-white text-[#001532] text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg">
                        Pass the capstone project to advance
                      </span>
                    </div>

                    {/* Mobile: always-visible caption between stacked cards */}
                    <div className="flex md:hidden items-center justify-center gap-2 py-3">
                      <span className="text-[#E5A823] text-lg" aria-hidden="true">↓</span>
                      <span className="text-gray-400 text-xs italic">Pass the capstone project to advance</span>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
