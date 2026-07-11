"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getLocalizedLevel, type LevelSlug, type Locale, type Semester } from "@/data/academy/curriculum";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getAcademySession } from "@/lib/academy/session";
import { isSemesterUnlocked, isLevelComplete, SEMESTER_ORDER, type StudentProgress } from "@/lib/academy/gating";

const SEMESTER_LABEL: Record<Locale, Record<Semester, string>> = {
  en: { "1": "Semester 1", "2": "Semester 2", "3": "Semester 3", "4": "Semester 4", capstone: "Capstone" },
  fr: { "1": "Semestre 1", "2": "Semestre 2", "3": "Semestre 3", "4": "Semestre 4", capstone: "Synthèse" },
};

export default function LevelSemesterMap({ level, locale = "en" }: { level: LevelSlug; locale?: Locale }) {
  const curriculum = getLocalizedLevel(level, locale);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [isThisStudent, setIsThisStudent] = useState(false);

  useEffect(() => {
    (async () => {
      const session = await getAcademySession();
      const supabase = getSupabaseBrowserClient();
      if (!session || session.role !== "student" || !supabase) return;

      const [{ data: projects }, { data: quizzes }, { data: capstones }] = await Promise.all([
        supabase.from("project_submissions").select("project_id, status").eq("student_id", session.id),
        supabase.from("quiz_results").select("quiz_id, passed").eq("student_id", session.id),
        supabase.from("capstone_results").select("capstone_id, passed").eq("student_id", session.id),
      ]);

      setIsThisStudent(true);
      setProgress({
        projectsPassed: new Set((projects ?? []).filter((p) => p.status === "passed").map((p) => p.project_id)),
        quizzesPassed: new Set((quizzes ?? []).filter((q) => q.passed).map((q) => q.quiz_id)),
        capstonesPassed: new Set((capstones ?? []).filter((c) => c.passed).map((c) => c.capstone_id)),
      });
    })();
  }, [level]);

  const emptyProgress: StudentProgress = {
    projectsPassed: new Set(),
    quizzesPassed: new Set(),
    capstonesPassed: new Set(),
  };
  const activeProgress = progress ?? emptyProgress;

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-[#001532]">{curriculum.name}</h1>
        <span className="rounded-full px-3 py-1 text-sm font-medium text-white" style={{ backgroundColor: curriculum.accentColour }}>
          {curriculum.gradeBand}
        </span>
      </div>
      <p className="mt-1 text-[#2E3440]">{curriculum.codingSpace}</p>
      {isThisStudent && isLevelComplete(curriculum, activeProgress) && (
        <p className="mt-3 rounded-md bg-green-50 px-4 py-2 text-green-800">
          {locale === "fr"
            ? `🎓 Tu as complété ${curriculum.name} — félicitations!`
            : `🎓 You've completed ${curriculum.name} — congratulations!`}
        </p>
      )}

      <ol className="mt-6 space-y-3">
        {SEMESTER_ORDER.map((semester) => {
          const unlocked = !isThisStudent || isSemesterUnlocked(curriculum, semester, activeProgress);
          const project = curriculum.projects.find((p) => p.semester === semester);
          const title = semester === "capstone" ? curriculum.capstone.title : project?.title;
          const langSuffix = locale === "fr" ? "?lang=fr" : "";
          const href =
            (semester === "capstone" ? `/academy/capstones/${level}` : `/academy/levels/${level}/${semester}`) +
            langSuffix;

          return (
            <li key={semester}>
              {unlocked ? (
                <Link
                  href={href}
                  className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm hover:shadow-md"
                  style={{ borderColor: curriculum.accentColour }}
                >
                  <span>
                    <span className="block font-semibold text-[#001532]">{SEMESTER_LABEL[locale][semester]}</span>
                    <span className="block text-sm text-[#2E3440]">{title}</span>
                  </span>
                  <span aria-hidden>→</span>
                </Link>
              ) : (
                <div
                  aria-disabled
                  className="flex items-center justify-between rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-gray-400"
                >
                  <span>
                    <span className="block font-semibold">{SEMESTER_LABEL[locale][semester]}</span>
                    <span className="block text-sm">{title}</span>
                  </span>
                  <span aria-hidden>🔒</span>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
