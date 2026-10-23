"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { useTrialPhase } from "@/components/trial/useTrialPhase";

/**
 * A few seconds of each student tool, recorded from the real apps in
 * /tools. Only the clips are shown here; the tools themselves stay
 * link-only for enrolled students (see src/app/tools/layout.tsx).
 */
const TOOLS = [
  {
    key: "blocks",
    name: "CODEship Blocks",
    kind: "Block coding",
    who: "Explorers · K–Grade 1",
    blurb: "Snap blocks together, press the green flag, and watch your character come alive.",
    glow: "#F4D734",
  },
  {
    key: "launchpad",
    name: "CODEship Launchpad",
    kind: "HTML, CSS & JavaScript",
    who: "Builders & Developers · Grades 2–5",
    blurb: "Write real web code on one side and see the page change on the other, live.",
    glow: "#19B3C4",
  },
  {
    key: "python",
    name: "CODEship Python",
    kind: "Python",
    who: "Engineers · Grades 6–8",
    blurb: "Type real Python, press Run, and read what your program says back.",
    glow: "#9B6BE0",
  },
] as const;

export default function ToolPreviews() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(false);
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const tool = TOOLS[active];
  const trial = useTrialPhase() !== "closed";

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    if (section.current) io.observe(section.current);
    return () => io.disconnect();
  }, []);

  // Play only the visible clip, only while the section is on screen.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    setProgress(0);
    if (inView && !reduced) v.play().catch(() => {});
    else v.pause();
  }, [active, inView, reduced]);

  return (
    <section id="tools" ref={section} className="relative overflow-hidden bg-[#000B1C] py-16 sm:py-24 text-white scroll-mt-28">
      <div
        className="absolute inset-0 transition-[background] duration-700"
        style={{ background: `radial-gradient(ellipse at 75% 45%, ${tool.glow}33, transparent 55%)` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-dotgrid-dark opacity-60" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#F4D734]">02 · Inside the tools</p>
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold mt-3 leading-tight">
            Kids code in tools we built for them.
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mt-5">
            A quick peek at what your child will use in class. The full toolkit, missions and projects unlock once they join.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Tool list */}
          <div className="lg:col-span-4" role="tablist" aria-label="Student tools">
            {TOOLS.map((t, i) => {
              const on = i === active;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  id={`tool-tab-${t.key}`}
                  aria-selected={on}
                  aria-controls="tool-panel"
                  onClick={() => setActive(i)}
                  className={`group relative block w-full border-l-2 py-4 pl-6 pr-2 text-left transition-colors ${
                    on ? "border-white" : "border-white/15 hover:border-white/50"
                  }`}
                >
                  {/* Clip progress */}
                  {on && (
                    <span
                      className="absolute -left-0.5 top-0 w-0.5"
                      style={{ height: `${progress * 100}%`, backgroundColor: t.glow }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="text-xs font-bold tracking-widest" style={{ color: on ? t.glow : "rgba(255,255,255,0.45)" }}>
                    0{i + 1} · {t.who}
                  </span>
                  <span
                    className={`mt-1 block font-display font-extrabold uppercase tracking-wide transition-all ${
                      on ? "text-2xl sm:text-3xl text-white" : "text-xl text-white/45 group-hover:text-white/80"
                    }`}
                  >
                    {t.kind}
                  </span>
                  <span
                    className={`block overflow-hidden text-base text-gray-300 transition-all duration-500 ${
                      on ? "mt-2 max-h-24 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    {t.blurb}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Clip */}
          <div className="lg:col-span-8" id="tool-panel" role="tabpanel" aria-labelledby={`tool-tab-${tool.key}`}>
            <div className="relative">
              <div
                className="absolute -inset-6 rounded-[2rem] blur-3xl opacity-40 transition-colors duration-700"
                style={{ backgroundColor: tool.glow }}
                aria-hidden="true"
              />
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#001532] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
                {/* Window bar */}
                <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-2.5">
                  <span className="h-3 w-3 rounded-full bg-[#FF5F57]" aria-hidden="true" />
                  <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" aria-hidden="true" />
                  <span className="h-3 w-3 rounded-full bg-[#28C840]" aria-hidden="true" />
                  <span className="ml-3 text-sm font-semibold text-gray-300">{tool.name}</span>
                </div>
                <div className="relative aspect-[960/570]">
                  <video
                    key={tool.key}
                    ref={video}
                    muted
                    playsInline
                    preload="metadata"
                    controls={reduced}
                    poster={`/previews/${tool.key}.jpg`}
                    onTimeUpdate={(e) => {
                      const v = e.currentTarget;
                      if (v.duration) setProgress(v.currentTime / v.duration);
                    }}
                    onEnded={() => {
                      if (!reduced) setActive((a) => (a + 1) % TOOLS.length);
                    }}
                    className="absolute inset-0 h-full w-full object-cover"
                    aria-label={`${tool.name}: ${tool.blurb}`}
                  >
                    <source src={`/previews/${tool.key}.mp4`} type="video/mp4" />
                  </video>
                  {/* Only a peek: the bottom fades out */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#001532] via-[#001532]/70 to-transparent" aria-hidden="true" />
                  <span className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/25 bg-[#001532]/80 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                    The full toolkit unlocks in class
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link
                href={trial ? "#free-trial" : "#book"}
                className="inline-flex items-center rounded-full bg-[#F4D734] px-7 py-3.5 text-lg font-bold text-[#001532] shadow-[0_0_40px_-8px_rgba(244,215,52,0.7)] hover:bg-white transition-colors"
              >
                {trial ? "Try it in a free class" : "Enroll your child"}
              </Link>
              <span className="text-base text-gray-400">Real tools. Real code. No downloads.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
