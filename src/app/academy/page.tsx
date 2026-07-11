import Link from "next/link";
import type { Metadata } from "next";
import { CURRICULUM_LEVELS } from "@/data/academy/curriculum";

export const metadata: Metadata = {
  title: "CODEship Academy Learning Platform",
  robots: { index: false, follow: false },
};

export default function AcademyHomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-[#001532]">Dream. Code. Achieve.</h1>
      <p className="mt-2 max-w-2xl text-[#2E3440]">
        The CODEship Academy learning platform — semester-kit lessons, projects, and quizzes for
        Explorers, Builders, Developers, and Engineers, alongside your live class.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/academy/join"
          className="rounded-lg border border-[#138A9A] bg-white p-5 shadow-sm hover:shadow-md"
        >
          <h2 className="font-semibold text-[#001532]">I&apos;m a student</h2>
          <p className="mt-1 text-sm text-[#2E3440]">
            Join with the class code and PIN your teacher gave you.
          </p>
        </Link>
        <Link
          href="/academy/login"
          className="rounded-lg border border-[#138A9A] bg-white p-5 shadow-sm hover:shadow-md"
        >
          <h2 className="font-semibold text-[#001532]">I&apos;m a teacher, parent, or school admin</h2>
          <p className="mt-1 text-sm text-[#2E3440]">Sign in with your email to see your dashboard.</p>
        </Link>
      </div>

      <h2 className="mt-12 text-xl font-semibold text-[#001532]">Browse the curriculum</h2>
      <p className="mt-1 text-sm text-[#2E3440]">
        Anyone can preview lessons, projects, and quizzes — sign in to track progress.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {CURRICULUM_LEVELS.map((level) => (
          <Link
            key={level.level}
            href={`/academy/levels/${level.level}`}
            className="rounded-lg border p-4 shadow-sm hover:shadow-md"
            style={{ borderColor: level.accentColour }}
          >
            <div className="text-sm font-medium" style={{ color: level.accentColour }}>
              {level.gradeBand}
            </div>
            <div className="text-lg font-semibold text-[#001532]">{level.name}</div>
            <div className="mt-1 text-xs text-[#2E3440]">{level.codingSpace}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
