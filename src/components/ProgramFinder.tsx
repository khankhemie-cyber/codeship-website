"use client";

import { useState } from "react";
import Link from "next/link";
import { PROGRAMS } from "@/data/programs";
import { saturdayTime } from "@/lib/booking";

const grades = PROGRAMS.map((p) => ({ label: p.gradeBand, slug: p.slug }));

const goals = [
  { label: "Weekly classes", href: null },
  { label: "A camp", href: "/programs/camps" },
  { label: "A birthday party", href: "/programs/birthday-parties" },
  { label: "A school program", href: "/schools" },
] as const;

/** Two quick questions: grade, then what the family is looking for. */
export default function ProgramFinder() {
  const [grade, setGrade] = useState<(typeof grades)[number] | null>(null);
  const [goal, setGoal] = useState<(typeof goals)[number] | null>(null);

  const reset = () => {
    setGrade(null);
    setGoal(null);
  };

  const optionClass =
    "p-5 text-left text-lg font-semibold text-[#001532] border-2 border-gray-200 rounded-xl hover:border-[#F4D734] hover:bg-[#FAF8F4] transition-colors";

  if (grade && goal) {
    const program = PROGRAMS.find((p) => p.slug === grade.slug)!;
    const weekly = goal.href === null;
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-[#138A9A]">Our pick for you</p>
        {weekly ? (
          <>
            <h2 className="text-3xl font-extrabold text-[#001532] mt-2">{program.level}</h2>
            <p className="text-lg text-gray-600 mt-3">{program.summary}</p>
            <p className="text-lg font-semibold text-[#001532] mt-3">Saturdays, {saturdayTime(program.slug)}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/register/${program.slug}`}
                className="bg-[#F4D734] text-[#001532] text-lg font-bold px-7 py-3.5 rounded-xl hover:bg-[#E6C51E] transition-colors"
              >
                Book {program.level}
              </Link>
              <Link
                href={`/programs/${program.slug}`}
                className="border-2 border-[#001532] text-[#001532] text-lg font-bold px-7 py-3.5 rounded-xl hover:bg-[#001532] hover:text-white transition-colors"
              >
                Learn More
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-extrabold text-[#001532] mt-2">{goal.label.replace(/^A /, "").replace(/^./, (c) => c.toUpperCase())}</h2>
            <p className="text-lg text-gray-600 mt-3">See the details and get in touch.</p>
            <div className="mt-8">
              <Link
                href={goal.href}
                className="inline-block bg-[#F4D734] text-[#001532] text-lg font-bold px-7 py-3.5 rounded-xl hover:bg-[#E6C51E] transition-colors"
              >
                See Details
              </Link>
            </div>
          </>
        )}
        <button onClick={reset} className="mt-6 text-base font-semibold text-gray-600 underline underline-offset-2">
          Start over
        </button>
      </div>
    );
  }

  const step = grade ? 2 : 1;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10">
      <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Question {step} of 2</p>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#001532] mt-2 mb-6">
        {grade ? "What are you looking for?" : "What grade is your child in?"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {grade
          ? goals.map((g) => (
              <button key={g.label} onClick={() => setGoal(g)} className={optionClass}>
                {g.label}
              </button>
            ))
          : grades.map((g) => (
              <button key={g.slug} onClick={() => setGrade(g)} className={optionClass}>
                {g.label}
              </button>
            ))}
      </div>
      {grade && (
        <button onClick={() => setGrade(null)} className="mt-6 text-base font-semibold text-gray-600">
          ← Back
        </button>
      )}
    </div>
  );
}
