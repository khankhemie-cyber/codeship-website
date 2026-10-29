/**
 * Online quizzes (/quizzes) and their submissions.
 *
 * Students unlock a program's quizzes with the same class password as the
 * workbooks (the cs_workbook_<program> cookie, see workbooks.ts). Submissions
 * are marked here, on the server, and saved to a Cloudflare D1 database bound
 * to the Pages project as QUIZ_DB. Instructors read them at /quizzes/results/
 * after entering QUIZ_INSTRUCTOR_PASSWORD (a Pages environment variable).
 * Setup steps: docs/quizzes.md.
 */

import { getRequestContext } from "@cloudflare/next-on-pages";
import { QUIZZES, type Quiz } from "@/data/quizzes";
import type { ProgramSlug } from "@/data/programs";
import { hmacHex, safeEqual } from "@/lib/workbooks";

export type PublicQuestion =
  | { id: string; type: "choice"; prompt: string; code?: string; options: string[] }
  | { id: string; type: "short"; prompt: string; code?: string };

export type PublicQuiz = Omit<Quiz, "questions"> & { questions: PublicQuestion[] };

/** A student's answers: an option index for "choice", text for "short". */
export type QuizAnswers = Record<string, number | string>;

export interface QuizSubmission {
  id: number;
  quizId: string;
  program: ProgramSlug;
  studentName: string;
  className: string;
  answers: QuizAnswers;
  /** Per auto-marked question: whether it was right. */
  correct: Record<string, boolean>;
  score: number;
  maxScore: number;
  submittedAt: string;
}

export const MAX_NAME_LENGTH = 60;
export const MAX_SHORT_ANSWER_LENGTH = 1000;

/** Stable id across programs, e.g. "builders/s1-quiz-1". */
export function quizId(quiz: Pick<Quiz, "program" | "slug">) {
  return `${quiz.program}/${quiz.slug}`;
}

export function quizPath(quiz: Pick<Quiz, "program" | "slug">) {
  return `/quizzes/${quiz.program}/${quiz.slug}/`;
}

export function getQuiz(program: string, slug: string) {
  return QUIZZES.find((q) => q.program === program && q.slug === slug);
}

export function getQuizById(id: string) {
  return QUIZZES.find((q) => quizId(q) === id);
}

/** The quiz without its answer key: the only shape that may reach a student's browser. */
export function toPublicQuiz(quiz: Quiz): PublicQuiz {
  return {
    ...quiz,
    questions: quiz.questions.map((q) =>
      q.type === "choice"
        ? { id: q.id, type: q.type, prompt: q.prompt, code: q.code, options: q.options }
        : { id: q.id, type: q.type, prompt: q.prompt, code: q.code },
    ),
  };
}

/**
 * Checks the shape of submitted answers and marks the "choice" questions.
 * Returns null when the answers don't fit the quiz (unknown or missing
 * question, out-of-range option, overlong text).
 */
export function markQuiz(quiz: Quiz, raw: unknown) {
  if (!raw || typeof raw !== "object") return null;
  const input = raw as Record<string, unknown>;
  const answers: QuizAnswers = {};
  const correct: Record<string, boolean> = {};
  let score = 0;
  let maxScore = 0;

  for (const q of quiz.questions) {
    const value = input[q.id];
    if (q.type === "choice") {
      if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value >= q.options.length) {
        return null;
      }
      answers[q.id] = value;
      correct[q.id] = value === q.answer;
      maxScore++;
      if (correct[q.id]) score++;
    } else {
      if (typeof value !== "string") return null;
      const text = value.trim();
      if (text.length > MAX_SHORT_ANSWER_LENGTH) return null;
      answers[q.id] = text;
    }
  }
  return { answers, correct, score, maxScore };
}

// ── D1 storage ──

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<unknown>;
  all<T>(): Promise<{ results: T[] }>;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export function getQuizDb(): D1Database | null {
  try {
    return (getRequestContext().env as { QUIZ_DB?: D1Database }).QUIZ_DB ?? null;
  } catch {
    // not running on Cloudflare (e.g. plain `next dev`)
    return null;
  }
}

// Same statements as migrations/0001_quiz_submissions.sql; running them on
// first use means a fresh database needs no manual migration step.
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS quiz_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id TEXT NOT NULL,
    program TEXT NOT NULL,
    student_name TEXT NOT NULL,
    class_name TEXT NOT NULL DEFAULT '',
    answers TEXT NOT NULL,
    correct TEXT NOT NULL,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    submitted_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS quiz_submissions_by_quiz ON quiz_submissions (quiz_id, submitted_at)`,
];

let schemaReady: Promise<void> | null = null;

function ensureSchema(db: D1Database) {
  schemaReady ??= (async () => {
    for (const sql of SCHEMA) await db.prepare(sql).run();
  })().catch((err) => {
    schemaReady = null;
    throw err;
  });
  return schemaReady;
}

export async function saveSubmission(
  db: D1Database,
  s: Omit<QuizSubmission, "id" | "submittedAt">,
) {
  await ensureSchema(db);
  const submittedAt = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO quiz_submissions
        (quiz_id, program, student_name, class_name, answers, correct, score, max_score, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      s.quizId,
      s.program,
      s.studentName,
      s.className,
      JSON.stringify(s.answers),
      JSON.stringify(s.correct),
      s.score,
      s.maxScore,
      submittedAt,
    )
    .run();
  return submittedAt;
}

interface SubmissionRow {
  id: number;
  quiz_id: string;
  program: ProgramSlug;
  student_name: string;
  class_name: string;
  answers: string;
  correct: string;
  score: number;
  max_score: number;
  submitted_at: string;
}

/** Newest first. */
export async function listSubmissions(db: D1Database, id?: string): Promise<QuizSubmission[]> {
  await ensureSchema(db);
  const base = `SELECT * FROM quiz_submissions`;
  const order = ` ORDER BY submitted_at DESC LIMIT 5000`;
  const stmt = id ? db.prepare(`${base} WHERE quiz_id = ?${order}`).bind(id) : db.prepare(base + order);
  const { results } = await stmt.all<SubmissionRow>();
  return results.map((r) => ({
    id: r.id,
    quizId: r.quiz_id,
    program: r.program,
    studentName: r.student_name,
    className: r.class_name,
    answers: JSON.parse(r.answers),
    correct: JSON.parse(r.correct),
    score: r.score,
    maxScore: r.max_score,
    submittedAt: r.submitted_at,
  }));
}

export async function deleteSubmission(db: D1Database, id: number) {
  await ensureSchema(db);
  await db.prepare(`DELETE FROM quiz_submissions WHERE id = ?`).bind(id).run();
}

// ── Instructor access ──

export const INSTRUCTOR_COOKIE = "cs_quiz_instructor";
export const INSTRUCTOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function getInstructorPassword(): string | undefined {
  return process.env.QUIZ_INSTRUCTOR_PASSWORD || undefined;
}

export function instructorToken(password: string) {
  return hmacHex(password, "codeship-quiz-instructor");
}

/** True when `token` (the cookie value) was issued for the current instructor password. */
export async function isInstructor(token: string | undefined) {
  if (!token) return false;
  const password = getInstructorPassword();
  if (!password) return false;
  return safeEqual(token, await instructorToken(password));
}
