"use client";

import { useEffect, useState } from "react";
import ClassPasswordForm, { useClassAccess } from "@/components/ClassPasswordForm";
import type { PublicQuestion, PublicQuiz } from "@/lib/quizzes";

interface Props {
  quiz: PublicQuiz;
  level: string;
}

type Answers = Record<string, number | string>;
type Result = { score: number; maxScore: number; correct: Record<string, boolean> };

// Per-device conveniences only: an unfinished quiz survives a refresh, and
// the student's name is filled in on their next quiz.
const STUDENT_KEY = "cs_quiz_student";
const draftKey = (quiz: PublicQuiz) => `cs_quiz_draft_${quiz.program}_${quiz.slug}`;

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function save(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage blocked: nothing to remember
  }
}

export default function QuizRunner({ quiz, level }: Props) {
  const [access, setAccess] = useClassAccess(quiz.program);
  const [answers, setAnswers] = useState<Answers>({});
  const [student, setStudent] = useState({ name: "", className: "" });
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setAnswers(load<Answers>(draftKey(quiz)) ?? {});
    setStudent(load<{ name: string; className: string }>(STUDENT_KEY) ?? { name: "", className: "" });
    setLoaded(true);
  }, [quiz]);

  useEffect(() => {
    if (loaded && !result) save(draftKey(quiz), answers);
  }, [answers, loaded, result, quiz]);

  useEffect(() => {
    if (loaded) save(STUDENT_KEY, student);
  }, [student, loaded]);

  // A "please answer…" message is stale once the student changes something.
  useEffect(() => setError(""), [answers, student]);

  if (access === "checking") return <div className="h-64" aria-busy="true" />;
  if (access === "locked") {
    return <ClassPasswordForm program={quiz.program} level={level} action="Start the quiz" onUnlock={() => setAccess("open")} />;
  }

  const unanswered = quiz.questions.filter((q) => q.type === "choice" && answers[q.id] === undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!student.name.trim()) {
      setError("Please type your name at the top so your instructor knows whose quiz this is.");
      document.getElementById("quiz-student-name")?.focus();
      return;
    }
    if (unanswered.length) {
      setError(`Please answer every question. Question ${quiz.questions.indexOf(unanswered[0]) + 1} still needs an answer.`);
      document.getElementById(`quiz-${unanswered[0].id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const payload: Answers = {};
      for (const q of quiz.questions) payload[q.id] = answers[q.id] ?? (q.type === "choice" ? -1 : q.type === "code" ? (q.starter ?? "") : "");
      const res = await fetch("/api/quizzes/submit/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          program: quiz.program,
          quiz: quiz.slug,
          studentName: student.name,
          className: student.className,
          answers: payload,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as Partial<Result> & { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setResult({ score: data.score ?? 0, maxScore: data.maxScore ?? 0, correct: data.correct ?? {} });
        save(draftKey(quiz), null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (res.status === 401) {
        setAccess("locked");
      } else if (data.error === "not_configured") {
        setError("Quizzes are not switched on yet. Please tell your instructor.");
      } else {
        setError("Your quiz could not be sent. Please try again. Your answers are still here.");
      }
    } catch {
      setError("Could not reach the server. Check your internet connection and try again. Your answers are still here.");
    }
    setSubmitting(false);
  };

  if (result) {
    return (
      <div className="bg-white border border-gray-200 shadow-sm p-6 sm:p-8 max-w-2xl" role="status">
        <p className="text-sm font-bold uppercase tracking-widest text-[#0F6F7C]">Submitted</p>
        <h2 className="font-display text-3xl font-extrabold text-[#001532] mt-2">Great work, {student.name.trim()}!</h2>
        <p className="text-lg text-gray-700 mt-3">
          You got <strong>{result.score}</strong> out of <strong>{result.maxScore}</strong> multiple-choice questions right.
          {quiz.questions.some((q) => q.type !== "choice") && " Your instructor will read your written answers and code."}
        </p>
        <ul className="mt-6 space-y-2">
          {quiz.questions.map((q, i) => (
            <li key={q.id} className="flex gap-3 text-base text-gray-700">
              <span aria-hidden className="w-6 shrink-0 font-bold">
                {q.type !== "choice" ? "✎" : result.correct[q.id] ? "✓" : "✗"}
              </span>
              <span>
                <strong>Question {i + 1}:</strong>{" "}
                {q.type !== "choice" ? "sent to your instructor" : result.correct[q.id] ? "right" : "not quite. Ask your instructor about it in class."}
              </span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => {
            setResult(null);
            setAnswers({});
            setStudent({ name: "", className: student.className });
          }}
          className="mt-8 text-base font-bold text-[#001532] underline"
        >
          Start again for a different student
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6" noValidate>
      <div className="bg-white border border-gray-200 shadow-sm p-6 sm:p-8">
        <p className="text-base text-gray-700">{quiz.intro}</p>
        <div className="grid gap-4 sm:grid-cols-2 mt-6">
          <div>
            <label htmlFor="quiz-student-name" className="block text-sm font-bold text-[#001532] mb-2">
              Your name (first name and last initial)
            </label>
            <input
              id="quiz-student-name"
              value={student.name}
              onChange={(e) => setStudent({ ...student, name: e.target.value })}
              maxLength={60}
              autoComplete="off"
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 outline-none focus:border-[#138A9A]"
            />
          </div>
          <div>
            <label htmlFor="quiz-class-name" className="block text-sm font-bold text-[#001532] mb-2">
              Your class or instructor <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <input
              id="quiz-class-name"
              value={student.className}
              onChange={(e) => setStudent({ ...student, className: e.target.value })}
              maxLength={60}
              autoComplete="off"
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 outline-none focus:border-[#138A9A]"
            />
          </div>
        </div>
      </div>

      {quiz.questions.map((q, i) => (
        <fieldset key={q.id} id={`quiz-${q.id}`} className="bg-white border border-gray-200 shadow-sm p-6 sm:p-8 scroll-mt-28">
          <legend className="sr-only">Question {i + 1}</legend>
          <p className="text-sm font-bold uppercase tracking-widest text-[#0F6F7C]">Question {i + 1}</p>
          <p className="font-display text-xl font-extrabold text-[#001532] mt-1">{q.prompt}</p>
          {q.type !== "code" && q.code && (
            <pre className="mt-4 bg-[#001532] text-[#F4F1EA] text-base p-4 overflow-x-auto">
              <code>{q.code}</code>
            </pre>
          )}
          {q.type === "choice" ? (
            <div className="mt-4 space-y-2">
              {q.options.map((option, j) => (
                <label
                  key={j}
                  className={`flex items-start gap-3 p-3 border-2 cursor-pointer text-lg ${
                    answers[q.id] === j ? "border-[#138A9A] bg-[#E8F5F6]" : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === j}
                    onChange={() => setAnswers({ ...answers, [q.id]: j })}
                    className="mt-1.5 h-5 w-5 shrink-0 accent-[#138A9A]"
                  />
                  <span className={/[<>(){};=]/.test(option) ? "font-mono" : ""}>{option}</span>
                </label>
              ))}
            </div>
          ) : q.type === "code" ? (
            <CodeBox
              question={q}
              label={`Your code for question ${i + 1}`}
              value={(answers[q.id] as string | undefined) ?? q.starter ?? ""}
              onChange={(value) => setAnswers({ ...answers, [q.id]: value })}
            />
          ) : (
            <textarea
              aria-label={`Answer to question ${i + 1}`}
              value={(answers[q.id] as string | undefined) ?? ""}
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
              maxLength={1000}
              rows={4}
              className="mt-4 w-full px-4 py-3 text-lg border-2 border-gray-300 outline-none focus:border-[#138A9A]"
            />
          )}
        </fieldset>
      ))}

      {error && (
        <p role="alert" className="text-base font-semibold text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto px-10 bg-[#F4D734] text-[#001532] font-bold text-lg py-3.5 hover:bg-[#E6C51E] shadow-lg disabled:opacity-50"
      >
        {submitting ? "Sending…" : "Submit my quiz"}
      </button>
    </form>
  );
}

const LANGUAGE_NAMES = { html: "HTML", javascript: "JavaScript", python: "Python" } as const;

/**
 * A plain code box. Tab indents (4 spaces for Python, 2 otherwise) so
 * students can indent like in their editor; Esc then Tab moves on, so the
 * keyboard is never trapped.
 */
function CodeBox({
  question,
  label,
  value,
  onChange,
}: {
  question: Extract<PublicQuestion, { type: "code" }>;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [tabIndents, setTabIndents] = useState(true);
  const indent = question.language === "python" ? "    " : "  ";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      setTabIndents(false);
      return;
    }
    if (e.key !== "Tab" || e.shiftKey || !tabIndents) return;
    e.preventDefault();
    const el = e.currentTarget;
    const { selectionStart: start, selectionEnd: end } = el;
    onChange(value.slice(0, start) + indent + value.slice(end));
    requestAnimationFrame(() => el.setSelectionRange(start + indent.length, start + indent.length));
  };

  return (
    <div className="mt-4">
      {question.hint && (
        <div className="mb-3 border-l-4 border-[#F4D734] bg-[#FFFBE6] px-4 py-3">
          <p className="text-sm font-bold uppercase tracking-widest text-[#001532]">Tip</p>
          <p className="text-base text-gray-800 whitespace-pre-wrap font-mono">{question.hint}</p>
        </div>
      )}
      <div className="flex items-center justify-between bg-[#001532] px-4 py-2 text-sm font-bold text-[#F4D734]">
        <span>{LANGUAGE_NAMES[question.language]}</span>
        {question.starter !== undefined && value !== question.starter && (
          <button
            type="button"
            onClick={() => window.confirm("Start this question again? Your code here will be replaced.") && onChange(question.starter ?? "")}
            className="text-white underline font-normal"
          >
            Start again
          </button>
        )}
      </div>
      <textarea
        aria-label={label}
        aria-describedby={`${question.id}-keys`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setTabIndents(true)}
        maxLength={5000}
        rows={Math.max(6, value.split("\n").length + 2)}
        spellCheck={false}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        className="block w-full bg-[#0B1E3A] text-[#F4F1EA] font-mono text-base leading-relaxed px-4 py-3 outline-none border-2 border-[#0B1E3A] focus:border-[#138A9A] [tab-size:4]"
        placeholder="Type your code here"
      />
      <p id={`${question.id}-keys`} className="text-sm text-gray-500 mt-1">
        Tab adds an indent. Press Esc, then Tab, to move to the next question.
      </p>
    </div>
  );
}
