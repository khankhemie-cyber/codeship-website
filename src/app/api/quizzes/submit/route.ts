import { cookies } from "next/headers";
import { cookieName, hasAccess } from "@/lib/workbooks";
import { MAX_NAME_LENGTH, getQuiz, getQuizDb, markQuiz, quizId, saveSubmission } from "@/lib/quizzes";

export const runtime = "edge";

/**
 * Marks and saves one student's quiz. Needs the program's class-password
 * cookie (the same one the workbooks use). Replies with the score and which
 * auto-marked questions were right, never the right answers themselves.
 */
export async function POST(request: Request) {
  let body: { program?: string; quiz?: string; studentName?: string; className?: string; answers?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const quiz = getQuiz(body.program ?? "", body.quiz ?? "");
  if (!quiz) return Response.json({ ok: false }, { status: 404 });

  if (!(await hasAccess(quiz.program, cookies().get(cookieName(quiz.program))?.value))) {
    return Response.json({ ok: false, error: "locked" }, { status: 401 });
  }

  const studentName = (body.studentName ?? "").trim().slice(0, MAX_NAME_LENGTH);
  const className = (body.className ?? "").trim().slice(0, MAX_NAME_LENGTH);
  const marked = markQuiz(quiz, body.answers);
  if (!studentName || !marked) {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const db = getQuizDb();
  if (!db) return Response.json({ ok: false, error: "not_configured" }, { status: 500 });

  try {
    await saveSubmission(db, { quizId: quizId(quiz), program: quiz.program, studentName, className, ...marked });
  } catch {
    return Response.json({ ok: false, error: "save_failed" }, { status: 500 });
  }

  return Response.json(
    { ok: true, score: marked.score, maxScore: marked.maxScore, correct: marked.correct },
    { headers: { "Cache-Control": "no-store" } },
  );
}
