"use client";

import Link from "next/link";
import { useState } from "react";
import ClassPasswordForm from "@/components/ClassPasswordForm";
import type { ProgramSlug } from "@/data/programs";

const PROGRAMS: { slug: ProgramSlug; level: string; grades: string }[] = [
  { slug: "explorers", level: "Explorers", grades: "K–Gr 1" },
  { slug: "builders", level: "Builders", grades: "Gr 2–3" },
  { slug: "developers", level: "Developers", grades: "Gr 4–5" },
  { slug: "engineers", level: "Engineers", grades: "Gr 6–8" },
];

/**
 * Shown after a child finishes their first challenge or plays for 15 minutes.
 * To keep playing, the family signs up for a CODEship course; the class
 * password that comes with it unlocks the game on this device (the same
 * password as the program's workbook, quizzes and Arcade levels). Progress is
 * kept, so the child carries on where they stopped.
 */
export default function SignupGate({ reason, onDone }: { reason: "challenge" | "time"; onDone: () => void }) {
  const [program, setProgram] = useState<ProgramSlug>("developers");

  return (
    <div className="absolute inset-0 z-50 overflow-y-auto bg-[#0d1b2a]/85 p-4 backdrop-blur-sm">
      <div className="mx-auto my-6 w-full max-w-lg rounded-2xl bg-[#0d1b2a] p-6 shadow-2xl ring-1 ring-white/15">
        <div className="text-xs font-bold uppercase tracking-wider text-amber">Ask a grown-up</div>
        <h2 className="mt-1 text-2xl font-extrabold">
          {reason === "challenge" ? "Challenge complete! Want to keep exploring Port CODEship?" : "You've been exploring for 15 minutes!"}
        </h2>
        <p className="mt-2 text-white/80">
          The rest of Port CODEship is for CODEship Academy students. Sign up for a coding course to keep playing, and your progress is saved right where you left off.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <a href="/register/" target="_blank" rel="noopener" className="rounded-xl bg-amber px-4 py-3 text-center text-lg font-extrabold text-navy">
            Sign up for a course
          </a>
          <a href="/programs/" target="_blank" rel="noopener" className="rounded-xl bg-white/10 px-4 py-3 text-center font-bold hover:bg-white/20">
            See all courses
          </a>
        </div>

        <div className="mt-6 border-t border-white/10 pt-5">
          <h3 className="font-extrabold">Already a CODEship student?</h3>
          <p className="mt-1 text-sm text-white/80">Pick your program and type the class password your teacher gave you. It&apos;s the same one as your workbook.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PROGRAMS.map((p) => (
              <button key={p.slug} onClick={() => setProgram(p.slug)} aria-pressed={program === p.slug} className={`rounded-lg px-3 py-1.5 text-sm font-bold ${program === p.slug ? "bg-amber text-navy" : "bg-white/10"}`}>
                {p.level} <span className="font-normal opacity-80">{p.grades}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-white p-4 text-navy">
            <ClassPasswordForm key={program} program={program} level={PROGRAMS.find((p) => p.slug === program)!.level} action="Keep playing" onUnlock={onDone} />
          </div>
        </div>

        <div className="mt-5 text-center">
          <Link href="/ship-it/" className="text-sm font-semibold text-white/70 underline hover:text-white">Back to the Arcade</Link>
        </div>
      </div>
    </div>
  );
}
