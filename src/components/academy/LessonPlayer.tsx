"use client";

import { useEffect, useState } from "react";
import type { BlockPuzzle, Lesson, LevelSlug, Locale } from "@/data/academy/curriculum";
import BlockCanvas from "./BlockCanvas";
import CodeSandbox, { type SandboxLanguage } from "./CodeSandbox";
import TutorHint from "./TutorHint";
import { getAcademySession } from "@/lib/academy/session";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const MAX_ATTEMPT_HISTORY = 5;

const SANDBOX_LANGUAGE: Partial<Record<LevelSlug, SandboxLanguage>> = {
  builders: "html",
  developers: "javascript",
  engineers: "python",
};

const FIELD_LABEL: Record<Locale, Array<[keyof Lesson, string]>> = {
  en: [
    ["warmUp", "Warm-up"],
    ["teach", "Teach"],
    ["activity", "Activity"],
    ["practice", "Practice"],
    ["reflect", "Reflect"],
    ["assess", "Check for understanding"],
    ["home", "At home"],
  ],
  fr: [
    ["warmUp", "Amorce"],
    ["teach", "Enseigner"],
    ["activity", "Espace de code"],
    ["practice", "Pratique"],
    ["reflect", "Retour"],
    ["assess", "Évaluation"],
    ["home", "À la maison"],
  ],
};

export default function LessonPlayer({
  level,
  lesson,
  puzzle,
  locale = "en",
}: {
  level: LevelSlug;
  lesson: Lesson;
  puzzle?: BlockPuzzle;
  locale?: Locale;
}) {
  const [markedDone, setMarkedDone] = useState(false);
  const [canMark, setCanMark] = useState(false);
  const [currentCode, setCurrentCode] = useState("");
  const [attemptHistory, setAttemptHistory] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const session = await getAcademySession();
      setCanMark(session?.role === "student");
    })();
  }, []);

  async function markDone() {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { session },
    } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
    if (!session) return;
    const response = await fetch("/api/academy/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ type: "lesson_mastery", lessonId: lesson.id, status: "mastered" }),
    });
    if (response.ok) setMarkedDone(true);
  }

  const sandboxLanguage = SANDBOX_LANGUAGE[level];

  function recordAttempt(text: string) {
    setCurrentCode(text);
    setAttemptHistory((prev) => [...prev, text].slice(-MAX_ATTEMPT_HISTORY));
  }

  function handleBlockAttempt(programText: string, passed: boolean) {
    setCurrentCode(programText);
    if (!passed) setAttemptHistory((prev) => [...prev, programText].slice(-MAX_ATTEMPT_HISTORY));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#001532]">{lesson.title}</h1>
      <p className="mt-1 text-[#2E3440]">
        <strong>{locale === "fr" ? "Objectif" : "Objective"}:</strong> {lesson.objective}
      </p>
      {lesson.align && (
        <p className="mt-1 text-sm text-[#2E3440]">
          {locale === "fr" ? "Arrimage" : "Aligned to"}: {lesson.align}
        </p>
      )}

      <dl className="mt-4 space-y-3">
        {FIELD_LABEL[locale].filter(([key]) => lesson[key]).map(([key, label]) => (
          <div key={key}>
            <dt className="text-sm font-semibold text-[#001532]">{label}</dt>
            <dd className="text-sm text-[#2E3440]">{lesson[key] as string}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6">
        {puzzle && <BlockCanvas puzzle={puzzle} onSolved={markDone} onAttempt={handleBlockAttempt} />}
        {!puzzle && sandboxLanguage && <CodeSandbox language={sandboxLanguage} onRun={recordAttempt} />}
      </div>

      {canMark && (
        <TutorHint lessonId={lesson.id} locale={locale} currentCode={currentCode} attemptHistory={attemptHistory} />
      )}

      {canMark && !puzzle && (
        <button
          type="button"
          onClick={markDone}
          disabled={markedDone}
          className="mt-4 rounded-md bg-[#001532] px-4 py-2 text-sm font-medium text-white hover:bg-[#0D1B2A] disabled:opacity-60"
        >
          {markedDone
            ? locale === "fr"
              ? "Marqué comme fait ✓"
              : "Marked done ✓"
            : locale === "fr"
              ? "Marquer ce cours comme fait"
              : "Mark this lesson done"}
        </button>
      )}
    </div>
  );
}
