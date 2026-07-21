import Link from "next/link";
import type { Metadata } from "next";
import { CURRICULUM_LEVELS } from "@/data/academy/curriculum";

export const metadata: Metadata = { title: "Levels", robots: { index: false, follow: false } };

export default function AcademyLevelsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-[#001532]">The CODEship Journey</h1>
      <ol className="mt-6 space-y-4">
        {CURRICULUM_LEVELS.map((level, i) => (
          <li key={level.level}>
            <Link
              href={`/academy/levels/${level.level}`}
              className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm hover:shadow-md"
              style={{ borderColor: level.accentColour }}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-white"
                style={{ backgroundColor: level.accentColour }}
                aria-hidden
              >
                {i + 1}
              </span>
              <span>
                <span className="block text-lg font-semibold text-[#001532]">
                  {level.name} <span className="font-normal text-sm text-[#2E3440]">· {level.gradeBand}</span>
                </span>
                <span className="block text-sm text-[#2E3440]">
                  {level.codingSpace} · 4 semesters + capstone · {level.lessons.length} lessons
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
