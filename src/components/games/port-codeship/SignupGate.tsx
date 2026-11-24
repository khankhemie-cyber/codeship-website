"use client";

import Link from "next/link";
import { useState } from "react";
import ClassPasswordForm from "@/components/ClassPasswordForm";
import { GRADES } from "@/lib/arcadeSignupForm";
import type { ProgramSlug } from "@/data/programs";

const PROGRAMS: { slug: ProgramSlug; level: string; grades: string }[] = [
  { slug: "explorers", level: "Explorers", grades: "K–Gr 1" },
  { slug: "builders", level: "Builders", grades: "Gr 2–3" },
  { slug: "developers", level: "Developers", grades: "Gr 4–5" },
  { slug: "engineers", level: "Engineers", grades: "Gr 6–8" },
];

/**
 * Shown after a child finishes their first challenge or plays for 15 minutes.
 * A parent signs up (first name, email, child's grade), or an enrolled student
 * types their class password. Either one unlocks the game on this device, and
 * the child's progress is kept.
 */
export default function SignupGate({ reason, onDone }: { reason: "challenge" | "time"; onDone: (how: "parent" | "student") => void }) {
  const [tab, setTab] = useState<"parent" | "student">("parent");
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [grade, setGrade] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [program, setProgram] = useState<ProgramSlug>("developers");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/arcade/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentName, email, grade, consent, game: "port-codeship" }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (data.ok) onDone("parent");
      else setError(data.error ?? "Something went wrong. Please try again.");
    } catch {
      setError("Couldn't connect. Check your internet and try again.");
    } finally {
      setSending(false);
    }
  };

  const input = "w-full rounded-lg bg-white/10 px-3 py-2 text-base text-white outline-none ring-1 ring-white/20 focus:ring-amber";

  return (
    <div className="absolute inset-0 z-50 overflow-y-auto bg-[#0d1b2a]/85 p-4 backdrop-blur-sm">
      <div className="mx-auto my-6 w-full max-w-lg rounded-2xl bg-[#0d1b2a] p-6 shadow-2xl ring-1 ring-white/15">
        <div className="text-xs font-bold uppercase tracking-wider text-amber">Ask a grown-up</div>
        <h2 className="mt-1 text-2xl font-extrabold">
          {reason === "challenge" ? "Challenge complete! Keep exploring Port CODEship" : "You've been exploring for 15 minutes!"}
        </h2>
        <p className="mt-2 text-white/80">
          To keep playing, a parent or guardian signs up for free. It takes a minute, and your progress is saved right where you left off.
        </p>

        <div className="mt-4 flex rounded-lg bg-white/10 p-1" role="tablist">
          {(["parent", "student"] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`flex-1 rounded-md px-3 py-1.5 text-sm font-bold ${tab === t ? "bg-amber text-navy" : "text-white/80"}`}>
              {t === "parent" ? "Parent sign-up" : "I'm a CODEship student"}
            </button>
          ))}
        </div>

        {tab === "parent" ? (
          <form onSubmit={submit} className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm font-semibold text-white/85">
              Parent or guardian first name
              <input id="gate-parent-name" value={parentName} onChange={(e) => setParentName(e.target.value)} autoComplete="given-name" className={input} required maxLength={60} />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-white/85">
              Parent or guardian email
              <input id="gate-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={input} required maxLength={254} />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-white/85">
              Child&apos;s grade
              <select id="gate-grade" value={grade} onChange={(e) => setGrade(e.target.value)} className={input} required>
                <option value="" className="text-navy">Pick a grade</option>
                {GRADES.map((g) => (
                  <option key={g} value={g} className="text-navy">{g}</option>
                ))}
              </select>
            </label>
            <label className="flex items-start gap-2 text-sm text-white/80">
              <input id="gate-consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
              <span>
                I&apos;m the parent or guardian. CODEship Academy may email me about this game and its classes. I can unsubscribe any time. See our{" "}
                <a href="/privacy-policy/" target="_blank" rel="noopener" className="underline">privacy policy</a>.
              </span>
            </label>
            {error && <p className="rounded-lg bg-rose-900/60 p-2 text-sm" role="alert">{error}</p>}
            <button type="submit" disabled={sending} className="rounded-xl bg-amber px-5 py-3 text-lg font-extrabold text-navy disabled:opacity-60">
              {sending ? "Signing up…" : "Sign up and keep playing"}
            </button>
            <p className="text-xs text-white/60">We never ask for your child&apos;s name or email.</p>
          </form>
        ) : (
          <div className="mt-4 grid gap-3">
            <p className="text-sm text-white/80">Use the class password your teacher gave you. It&apos;s the same one as your workbook.</p>
            <div className="flex flex-wrap gap-2">
              {PROGRAMS.map((p) => (
                <button key={p.slug} onClick={() => setProgram(p.slug)} aria-pressed={program === p.slug} className={`rounded-lg px-3 py-1.5 text-sm font-bold ${program === p.slug ? "bg-amber text-navy" : "bg-white/10"}`}>
                  {p.level} <span className="font-normal opacity-80">{p.grades}</span>
                </button>
              ))}
            </div>
            <div className="rounded-xl bg-white p-4 text-navy">
              <ClassPasswordForm key={program} program={program} level={PROGRAMS.find((p) => p.slug === program)!.level} action="Keep playing" onUnlock={() => onDone("student")} />
            </div>
          </div>
        )}

        <div className="mt-5 text-center">
          <Link href="/ship-it/" className="text-sm font-semibold text-white/70 underline hover:text-white">Back to the Arcade</Link>
        </div>
      </div>
    </div>
  );
}
