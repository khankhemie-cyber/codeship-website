"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTrialPhase } from "@/components/trial/useTrialPhase";
import { startDates } from "@/lib/booking";

/** The cube's four sides, in spin order, each with the glow it casts. */
const FACES = [
  { src: "/previews/blocks.jpg", alt: "", label: "Block coding", sub: "Explorers · K–Grade 1", glow: "#F4D734" },
  { src: "/previews/launchpad.jpg", alt: "", label: "HTML & CSS", sub: "Builders · Grades 2–3", glow: "#19B3C4" },
  { src: "/previews/python.jpg", alt: "", label: "Python", sub: "Engineers · Grades 6–8", glow: "#9B6BE0" },
  { src: null, alt: "", label: "Free trial class", sub: "November only", glow: "#F4D734" },
];

/** In-page chapters, the hero's quick way into the page. */
export const CHAPTERS = [
  { href: "#free-trial", label: "Free trial" },
  { href: "#tools", label: "Inside the tools" },
  { href: "#book", label: "Pick a grade" },
  { href: "#faq", label: "Questions" },
];

/**
 * Home hero: one glowing object on a dark stage, a short promise and two
 * clear next steps. The cube shows a sliver of each student tool; it turns on
 * its own and leans toward the pointer. Motion stops for reduced-motion users.
 */
export default function Hero() {
  const phase = useTrialPhase();
  const stage = useRef<HTMLDivElement>(null);

  const lean = (e: React.PointerEvent) => {
    const el = stage.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--lean-x", `${((e.clientY - r.top) / r.height - 0.5) * -14}deg`);
    el.style.setProperty("--lean-y", `${((e.clientX - r.left) / r.width - 0.5) * 18}deg`);
  };
  const settle = () => {
    stage.current?.style.setProperty("--lean-x", "0deg");
    stage.current?.style.setProperty("--lean-y", "0deg");
  };

  const trial = phase !== "closed";

  return (
    <section
      className="relative overflow-hidden bg-[#000B1C] text-white"
      onPointerMove={lean}
      onPointerLeave={settle}
    >
      {/* Stage lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(19,138,154,0.28),transparent_55%),radial-gradient(ellipse_at_10%_90%,rgba(110,67,168,0.22),transparent_50%)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-dotgrid-dark opacity-60" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10 lg:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Message */}
          <div className="lg:col-span-6 animate-fade-in-up">
            {trial ? (
              <Link
                href="#free-trial"
                className="inline-flex items-center gap-2 rounded-full border border-[#F4D734]/50 bg-[#F4D734]/10 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.15em] text-[#F4D734] backdrop-blur-sm hover:bg-[#F4D734]/20 transition-colors"
              >
                <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#F4D734] opacity-60 animate-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#F4D734]" />
                </span>
                {phase === "open" ? "November only · Free trial class" : "Free trial class · Opens Nov 1"}
              </Link>
            ) : (
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#5FD3E0]">Coding · AI · STEM</p>
            )}

            <h1 className="font-display text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.05] tracking-tight mt-6 [text-shadow:0_4px_30px_rgba(0,0,0,0.5)]">
              {trial ? (
                <>
                  Your child&apos;s first coding class is <span className="text-[#F4D734]">on us.</span>
                </>
              ) : (
                "Coding classes for curious kids."
              )}
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mt-6 leading-relaxed max-w-xl">
              {trial
                ? "Try one free class this November. Kindergarten to Grade 8, in person in Oshawa or live online. Kids build games, websites and AI projects from day one."
                : "Kindergarten to Grade 8. Kids build games, websites, robots and AI projects. In person or live online."}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href={trial ? "#free-trial" : "#book"}
                className="inline-flex items-center rounded-full bg-[#F4D734] px-8 py-4 text-lg font-bold text-[#001532] shadow-[0_0_40px_-6px_rgba(244,215,52,0.7)] hover:bg-white hover:shadow-[0_0_50px_-4px_rgba(255,255,255,0.6)] transition-all"
              >
                {phase === "open" ? "Claim a free class" : trial ? "See the free trial" : "Enroll now"}
              </Link>
              <Link
                href="#tools"
                className="inline-flex items-center rounded-full border border-white/40 bg-white/5 px-7 py-[15px] text-lg font-semibold text-white backdrop-blur-md hover:border-white hover:bg-white/10 transition-colors"
              >
                Peek inside our tools
              </Link>
            </div>
            <p className="mt-5 text-sm text-gray-400">
              {trial
                ? "Register and attend in November 2026 · 1 free class per student"
                : `November semester starts ${startDates("inperson", "november")} in person and ${startDates("online", "november")} online.`}
            </p>
          </div>

          {/* The cube */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div ref={stage} className="cube-stage relative flex h-[320px] w-full items-center justify-center sm:h-[400px]">
              <div className="cube-glow absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-60 sm:h-72 sm:w-72" aria-hidden="true" />
              <div className="cube-lean">
                <div className="cube-float">
                  <div className="cube" aria-hidden="true">
                    {FACES.map((f, i) => (
                      <div key={f.label} className={`cube-face cube-face-${i}`} style={{ ["--glow" as string]: f.glow }}>
                        {f.src ? (
                          <Image src={f.src} alt={f.alt} fill sizes="300px" className="object-cover object-left-top" priority={i === 0} />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center bg-[#001532] text-center">
                            <span className="font-display text-6xl font-extrabold text-[#F4D734] sm:text-7xl">1</span>
                            <span className="mt-1 text-sm font-bold uppercase tracking-[0.2em] text-white">free class</span>
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="cube-face cube-face-top" />
                    <div className="cube-face cube-face-bottom" />
                  </div>
                </div>
              </div>
              {/* Reflection on the floor */}
              <div className="cube-floor absolute bottom-2 left-1/2 h-16 w-72 -translate-x-1/2 rounded-[50%] blur-2xl" aria-hidden="true" />
            </div>
            {/* What the cube is showing right now */}
            <div className="relative h-14 w-full text-center" aria-hidden="true">
              {FACES.map((f, i) => (
                <div key={f.label} className={`cube-caption cube-caption-${i} absolute inset-x-0`}>
                  <p className="font-display text-lg font-bold">{f.label}</p>
                  <p className="text-sm uppercase tracking-[0.2em] text-gray-400">{f.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chapters */}
        <nav aria-label="On this page" className="mt-12 border-t border-white/10 pt-6">
          <ol className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
            {CHAPTERS.map((c, i) => (
              <li key={c.href}>
                <Link href={c.href} className="group flex items-baseline gap-3 text-gray-400 hover:text-white transition-colors">
                  <span className="text-xs font-bold tracking-widest text-[#F4D734]/70 group-hover:text-[#F4D734]">0{i + 1}</span>
                  <span className="relative font-display text-base font-bold uppercase tracking-wider">
                    {c.label}
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-[#F4D734] transition-all duration-300 group-hover:w-full" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
}
