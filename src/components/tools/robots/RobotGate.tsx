"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ClassPasswordForm from "@/components/ClassPasswordForm";
import type { ProgramSlug } from "@/data/programs";
import type { Program } from "./kit";

const RobotLab = dynamic(() => import("./RobotLab"), { ssr: false, loading: () => <div className="min-h-[100dvh] bg-[#001532]" /> });

/**
 * Robot Lab is for enrolled students: a program's class password opens that
 * program's missions (the same password as its workbook and quizzes, checked
 * on the server, which sets an HttpOnly cookie per program). A device that
 * already unlocked a program's workbook, quiz or arcade levels goes straight
 * in to that program.
 */

const PROGRAMS: { slug: ProgramSlug; level: string; grades: string; colour: string }[] = [
  { slug: "explorers", level: "Explorers", grades: "K to Gr 1", colour: "#D58401" },
  { slug: "builders", level: "Builders", grades: "Gr 2 to 3", colour: "#0F6F7C" },
  { slug: "developers", level: "Developers", grades: "Gr 4 to 5", colour: "#6E43A8" },
  { slug: "engineers", level: "Engineers", grades: "Gr 6 to 8", colour: "#2B3A9E" },
];

export default function RobotGate() {
  const [status, setStatus] = useState<"checking" | "locked" | "open">("checking");
  const [open, setOpen] = useState<string[]>([]);
  const [picked, setPicked] = useState<ProgramSlug>("explorers");

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      PROGRAMS.map((p) =>
        fetch(`/api/workbooks/session/?program=${p.slug}`, { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : { ok: false }))
          .then((d: { ok?: boolean }) => Boolean(d.ok))
          .catch(() => false),
      ),
    ).then((ok) => {
      if (cancelled) return;
      setOpen(PROGRAMS.filter((_, i) => ok[i]).map((p) => p.level));
      setStatus(ok.some(Boolean) ? "open" : "locked");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "open") return <RobotLab programs={open as Program[]} />;
  if (status === "checking") return <div className="min-h-[100dvh] bg-[#001532]" aria-busy="true" />;

  const p = PROGRAMS.find((x) => x.slug === picked)!;
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#001532] text-[#E6EDF7]">
      <header className="flex items-center gap-2 border-b border-white/10 bg-[#012C61] px-4 py-2">
        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
          <span className="block h-7 w-6 bg-no-repeat" style={{ backgroundImage: "url(/logo-header.png)", backgroundSize: "auto 100%", backgroundPosition: "left center" }} />
        </span>
        <h1 className="font-display text-lg font-extrabold tracking-tight sm:text-xl">
          CODEship <span className="text-[#D58401]">Robot Lab</span>
        </h1>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center">
        <div className="w-full max-w-lg">
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#D58401]">For CODEship students</p>
          <h2 className="mt-1 font-display text-3xl font-extrabold">Program a real-world robot, right in your browser.</h2>
          <p className="mt-2 text-[15px] text-white/70">Choose your class, then enter the class password your instructor gave you. You only need to do this once on this device.</p>
          <div className="mt-6 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Which class are you in?">
            {PROGRAMS.map((x) => (
              <button
                key={x.slug}
                type="button"
                role="radio"
                aria-checked={picked === x.slug}
                onClick={() => setPicked(x.slug)}
                className={`rounded-xl border-2 px-3 py-2.5 text-left text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4D734] ${picked === x.slug ? "border-[#F4D734] bg-white/10" : "border-white/15 hover:bg-white/5"}`}
              >
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: x.colour }} />
                {x.level}
                <span className="block pl-[18px] text-[12px] font-semibold text-white/60">{x.grades}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 text-[#001532] [&>div]:max-w-none [&>div]:rounded-2xl">
            <ClassPasswordForm key={picked} program={picked} level={p.level} action="Open Robot Lab" onUnlock={() => {
                setOpen([p.level]);
                setStatus("open");
              }} />
          </div>
          <p className="mt-6 text-sm text-white/60">
            Not a CODEship student yet? <a href="/programs/" className="font-bold text-[#F4D734] hover:underline">See our programs</a>.
          </p>
        </div>
      </main>
    </div>
  );
}
