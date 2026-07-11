"use client";

import { useState } from "react";
import type { Quiz, Locale } from "@/data/academy/curriculum";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function QuizPlayer({ quiz, locale = "en" }: { quiz: Quiz; locale?: Locale }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; total: number; passed: boolean } | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  async function submit() {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { session },
    } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
    if (!session) {
      setStatus("error");
      return;
    }
    setStatus("saving");
    const response = await fetch("/api/academy/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ type: "quiz_submission", quizId: quiz.id, answers }),
    });
    if (!response.ok) {
      setStatus("error");
      return;
    }
    const data = await response.json();
    setResult({ score: data.score, total: data.total, passed: data.passed });
    setStatus("idle");
  }

  const allAnswered = quiz.questions.every((_, i) => answers[String(i)]);

  return (
    <div>
      <ol className="mt-4 space-y-6">
        {quiz.questions.map((q, i) => (
          <li key={i} className="rounded-lg border border-[#138A9A]/30 bg-white p-4">
            <p className="font-medium text-[#001532]">
              {i + 1}. {q.prompt}
            </p>
            <div className="mt-2 space-y-1" role="radiogroup" aria-label={q.prompt}>
              {q.choices.map((choice) => (
                <label key={choice} className="flex items-center gap-2 text-sm text-[#2E3440]">
                  <input
                    type="radio"
                    name={`q${i}`}
                    value={choice}
                    checked={answers[String(i)] === choice}
                    onChange={() => setAnswers((prev) => ({ ...prev, [String(i)]: choice }))}
                  />
                  {choice}
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={submit}
        disabled={!allAnswered || status === "saving"}
        className="mt-4 rounded-md bg-[#001532] px-4 py-2 text-sm font-medium text-white hover:bg-[#0D1B2A] disabled:opacity-60"
      >
        {locale === "fr" ? "Vérifier mes réponses" : "Check my answers"}
      </button>

      {status === "error" && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {locale === "fr" ? "Connecte-toi d'abord pour soumettre le quiz." : "Sign in first to submit the quiz."}
        </p>
      )}
      {result && (
        <p role="status" className={`mt-2 font-medium ${result.passed ? "text-green-700" : "text-[#2E3440]"}`}>
          {locale === "fr"
            ? `${result.score} / ${result.total} — ${result.passed ? "réussi!" : "réessaie la prochaine fois."}`
            : `${result.score} / ${result.total} — ${result.passed ? "Passed!" : "keep practicing."}`}
        </p>
      )}
    </div>
  );
}
