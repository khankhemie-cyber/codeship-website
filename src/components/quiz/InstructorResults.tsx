"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Quiz } from "@/data/quizzes";
import type { QuizSubmission } from "@/lib/quizzes";

interface Props {
  /** Every quiz, for the picker: { id: "builders/s1-quiz-1", label }. */
  quizzes: { id: string; label: string }[];
}

type State =
  | { kind: "checking" }
  | { kind: "locked" }
  | { kind: "error"; message: string }
  | { kind: "loaded"; submissions: QuizSubmission[]; quizzes: Quiz[] };

function resultsUrl(quiz: string, csv = false) {
  const params = new URLSearchParams();
  if (quiz) params.set("quiz", quiz);
  if (csv) params.set("format", "csv");
  const qs = params.toString();
  return `/api/quizzes/results/${qs ? `?${qs}` : ""}`;
}

export default function InstructorResults({ quizzes }: Props) {
  const [state, setState] = useState<State>({ kind: "checking" });
  const [quiz, setQuiz] = useState(quizzes[0]?.id ?? "");
  const [classFilter, setClassFilter] = useState("");
  const [open, setOpen] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(resultsUrl(quiz), { cache: "no-store" });
      if (res.status === 401) return setState({ kind: "locked" });
      const data = await res.json();
      if (data.error === "not_configured") {
        return setState({ kind: "error", message: "The quiz database is not connected yet. See docs/quizzes.md for setup." });
      }
      if (!res.ok) return setState({ kind: "error", message: "Could not load results. Please try again." });
      setState({ kind: "loaded", submissions: data.submissions, quizzes: data.quizzes });
    } catch {
      setState({ kind: "error", message: "Could not reach the server. Check your connection and try again." });
    }
  }, [quiz]);

  useEffect(() => {
    load();
  }, [load]);

  if (state.kind === "checking") return <div className="h-64" aria-busy="true" />;
  if (state.kind === "locked") return <InstructorLogin onUnlock={load} />;
  if (state.kind === "error") {
    return (
      <p role="alert" className="text-base font-semibold text-red-600">
        {state.message}
      </p>
    );
  }

  const filter = classFilter.trim().toLowerCase();
  const rows = state.submissions.filter((s) => !filter || s.className.toLowerCase().includes(filter));
  const byId = new Map(state.quizzes.map((q) => [`${q.program}/${q.slug}`, q]));
  const average = rows.length ? rows.reduce((sum, s) => sum + s.score / (s.maxScore || 1), 0) / rows.length : 0;

  const remove = async (id: number) => {
    if (!window.confirm("Delete this submission? This cannot be undone.")) return;
    const res = await fetch("/api/quizzes/results/", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="results-quiz" className="block text-sm font-bold text-[#001532] mb-2">
            Quiz
          </label>
          <select
            id="results-quiz"
            value={quiz}
            onChange={(e) => {
              setQuiz(e.target.value);
              setOpen(null);
            }}
            className="px-3 py-2.5 text-base border-2 border-gray-300 bg-white max-w-full"
          >
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.label}
              </option>
            ))}
            <option value="">All quizzes</option>
          </select>
        </div>
        <div>
          <label htmlFor="results-class" className="block text-sm font-bold text-[#001532] mb-2">
            Filter by class
          </label>
          <input
            id="results-class"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            placeholder="e.g. Vaughan Saturday"
            className="px-3 py-2.5 text-base border-2 border-gray-300"
          />
        </div>
        <a href={resultsUrl(quiz, true)} className="px-5 py-2.5 font-bold bg-[#F4D734] text-[#001532] hover:bg-[#E6C51E]">
          Download CSV
        </a>
        <button type="button" onClick={load} className="px-5 py-2.5 font-bold border-2 border-[#001532] text-[#001532]">
          Refresh
        </button>
      </div>

      <p className="text-base text-gray-600 mt-6">
        {rows.length} submission{rows.length === 1 ? "" : "s"}
        {rows.length > 0 && ` · average ${Math.round(average * 100)}% on multiple choice`}
      </p>

      {rows.length === 0 ? (
        <p className="text-base text-gray-600 mt-4">No submissions yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto bg-white border border-gray-200">
          <table className="w-full text-left text-base">
            <thead className="bg-[#F1EEE8] text-sm uppercase tracking-wider text-[#001532]">
              <tr>
                <th className="p-3">Student</th>
                <th className="p-3">Class</th>
                {!quiz && <th className="p-3">Quiz</th>}
                <th className="p-3">Score</th>
                <th className="p-3">Submitted</th>
                <th className="p-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const q = byId.get(s.quizId);
                return (
                  <SubmissionRow
                    key={s.id}
                    submission={s}
                    quiz={q}
                    showQuiz={!quiz}
                    expanded={open === s.id}
                    onToggle={() => setOpen(open === s.id ? null : s.id)}
                    onDelete={() => remove(s.id)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SubmissionRow({
  submission: s,
  quiz,
  showQuiz,
  expanded,
  onToggle,
  onDelete,
}: {
  submission: QuizSubmission;
  quiz?: Quiz;
  showQuiz: boolean;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const cols = showQuiz ? 6 : 5;
  return (
    <>
      <tr className="border-t border-gray-200 align-top">
        <td className="p-3 font-bold text-[#001532]">{s.studentName}</td>
        <td className="p-3 text-gray-600">{s.className || "—"}</td>
        {showQuiz && <td className="p-3 text-gray-600">{quiz ? `${quiz.program} · ${quiz.title}` : s.quizId}</td>}
        <td className="p-3 whitespace-nowrap">
          {s.score} / {s.maxScore}
        </td>
        <td className="p-3 text-gray-600 whitespace-nowrap">{new Date(s.submittedAt).toLocaleString()}</td>
        <td className="p-3 whitespace-nowrap">
          <button type="button" onClick={onToggle} className="font-bold text-[#0F6F7C] underline" aria-expanded={expanded}>
            {expanded ? "Hide" : "Answers"}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-[#FAF8F4]">
          <td colSpan={cols} className="p-4">
            <ol className="space-y-3">
              {quiz?.questions.map((q, i) => {
                const a = s.answers[q.id];
                return (
                  <li key={q.id}>
                    <p className="text-sm font-bold text-[#001532]">
                      Q{i + 1}. {q.prompt}
                    </p>
                    {q.type === "choice" ? (
                      <p className="text-base">
                        <span aria-hidden>{s.correct[q.id] ? "✓ " : "✗ "}</span>
                        <span className="sr-only">{s.correct[q.id] ? "Correct: " : "Incorrect: "}</span>
                        {q.options[a as number] ?? "—"}
                        {!s.correct[q.id] && <span className="text-gray-500"> (answer: {q.options[q.answer]})</span>}
                      </p>
                    ) : (
                      <p className="text-base whitespace-pre-wrap">{(a as string) || <em className="text-gray-500">No answer</em>}</p>
                    )}
                  </li>
                );
              }) ?? <li>This quiz is no longer in the site&apos;s quiz list.</li>}
            </ol>
            <button type="button" onClick={onDelete} className="mt-4 text-sm font-bold text-red-700 underline">
              Delete this submission
            </button>
          </td>
        </tr>
      )}
    </>
  );
}

function InstructorLogin({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/quizzes/instructor-login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onUnlock();
      } else if (res.status === 401) {
        setError("That password is not right.");
        setPassword("");
        inputRef.current?.focus();
      } else {
        setError("Instructor access is not set up yet (QUIZ_INSTRUCTOR_PASSWORD).");
      }
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 shadow-sm p-6 sm:p-8 max-w-md">
      <h2 className="font-display text-2xl font-extrabold text-[#001532]">Instructor sign-in</h2>
      <label htmlFor="instructor-password" className="block text-sm font-bold text-[#001532] mt-6 mb-2">
        Instructor password
      </label>
      <input
        id="instructor-password"
        ref={inputRef}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        className={`w-full px-4 py-3 text-lg border-2 outline-none focus:border-[#138A9A] ${error ? "border-red-500" : "border-gray-300"}`}
      />
      {error && (
        <p role="alert" className="text-sm font-semibold text-red-600 mt-3">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading || !password.trim()}
        className="mt-5 w-full bg-[#F4D734] text-[#001532] font-bold text-lg py-3.5 hover:bg-[#E6C51E] disabled:opacity-50"
      >
        {loading ? "Checking…" : "See results"}
      </button>
    </form>
  );
}
