import type { Metadata } from "next";
import Link from "next/link";
import { PROGRAMS } from "@/data/programs";
import { QUIZZES } from "@/data/quizzes";
import { quizPath } from "@/lib/quizzes";
import { PageHero, Section } from "@/components/ui/Page";

export const metadata: Metadata = {
  title: "Student Quizzes | CODEship Academy",
  robots: { index: false, follow: false, nocache: true },
};

export default function QuizzesPage() {
  const programs = PROGRAMS.filter((p) => QUIZZES.some((q) => q.program === p.slug));
  return (
    <>
      <PageHero
        eyebrow="Students and families"
        title="Class quizzes"
        lead="Pick the quiz your instructor asked for, enter your class password, answer the questions, and press Submit. Your instructor gets your answers right away."
      />
      <Section tone="cream">
        <div className="grid gap-5 sm:grid-cols-2">
          {programs.map((p) => (
            <div
              key={p.slug}
              className="bg-white border border-gray-200 p-6 shadow-sm"
              style={{ borderTop: `6px solid ${p.accentColour}` }}
            >
              <p className="text-sm font-bold uppercase tracking-widest text-[#0F6F7C]">{p.gradeBand}</p>
              <h2 className="font-display text-2xl font-extrabold text-[#001532] mt-1">{p.level}</h2>
              <ul className="mt-4 space-y-2">
                {QUIZZES.filter((q) => q.program === p.slug).map((q) => (
                  <li key={q.slug}>
                    <Link href={quizPath(q)} className="font-bold text-[#001532] hover:underline">
                      {q.title} →
                    </Link>
                    <span className="block text-sm text-gray-600">
                      Semester {q.semester}, week {q.week}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
