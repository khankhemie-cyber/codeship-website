import { cookies } from "next/headers";
import { QUIZZES } from "@/data/quizzes";
import {
  INSTRUCTOR_COOKIE,
  type QuizSubmission,
  deleteSubmission,
  getQuizById,
  getQuizDb,
  isInstructor,
  listSubmissions,
  quizId,
} from "@/lib/quizzes";

export const runtime = "edge";

const NO_STORE = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

async function authorized() {
  return isInstructor(cookies().get(INSTRUCTOR_COOKIE)?.value);
}

function csvCell(value: string | number) {
  const s = String(value);
  // Quote everything; also defuse spreadsheet formulas in student-typed text.
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
}

function toCsv(rows: QuizSubmission[]) {
  const header = ["Submitted at", "Quiz", "Student", "Class", "Score", "Out of"];
  // One column per question id (q1, q2, …), in the order the quizzes list them.
  const qids: string[] = [];
  for (const r of rows) {
    for (const q of getQuizById(r.quizId)?.questions ?? []) if (!qids.includes(q.id)) qids.push(q.id);
  }
  const lines = [[...header, ...qids.map((_, i) => `Q${i + 1}`)].map(csvCell).join(",")];

  for (const r of rows) {
    const quiz = getQuizById(r.quizId);
    const cells: (string | number)[] = [
      r.submittedAt,
      quiz ? `${quiz.program} ${quiz.title}` : r.quizId,
      r.studentName,
      r.className,
      r.score,
      r.maxScore,
    ];
    for (const qid of qids) {
      const q = quiz?.questions.find((x) => x.id === qid);
      const a = r.answers[qid];
      if (!q || a === undefined) cells.push("");
      else if (q.type === "choice") cells.push(`${r.correct[qid] ? "✓" : "✗"} ${q.options[a as number] ?? ""}`);
      else cells.push(String(a));
    }
    lines.push(cells.map(csvCell).join(","));
  }
  return "﻿" + lines.join("\r\n");
}

/** Instructor-only: GET ?quiz=<program/slug>&format=csv|json. */
export async function GET(request: Request) {
  if (!(await authorized())) return Response.json({ ok: false }, { status: 401, headers: NO_STORE });

  const db = getQuizDb();
  if (!db) return Response.json({ ok: false, error: "not_configured" }, { status: 500, headers: NO_STORE });

  const params = new URL(request.url).searchParams;
  const id = params.get("quiz") || undefined;
  if (id && !getQuizById(id)) return Response.json({ ok: false }, { status: 404, headers: NO_STORE });

  const rows = await listSubmissions(db, id);

  if (params.get("format") === "csv") {
    const name = id ? id.replace("/", "-") : "all";
    return new Response(toCsv(rows), {
      headers: {
        ...NO_STORE,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="codeship-quiz-${name}.csv"`,
      },
    });
  }

  // Instructors see the full quizzes, answer key included, to read each submission.
  const quizzes = QUIZZES.filter((q) => !id || quizId(q) === id);
  return Response.json({ ok: true, submissions: rows, quizzes }, { headers: NO_STORE });
}

/** Instructor-only: removes one submission (e.g. a test run). Body: { id }. */
export async function DELETE(request: Request) {
  if (!(await authorized())) return Response.json({ ok: false }, { status: 401, headers: NO_STORE });
  const db = getQuizDb();
  if (!db) return Response.json({ ok: false, error: "not_configured" }, { status: 500, headers: NO_STORE });
  try {
    const { id } = (await request.json()) as { id?: number };
    if (!Number.isInteger(id)) return Response.json({ ok: false }, { status: 400, headers: NO_STORE });
    await deleteSubmission(db, id as number);
    return Response.json({ ok: true }, { headers: NO_STORE });
  } catch {
    return Response.json({ ok: false }, { status: 400, headers: NO_STORE });
  }
}
