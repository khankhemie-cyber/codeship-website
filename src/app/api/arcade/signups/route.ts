import { cookies } from "next/headers";
import { INSTRUCTOR_COOKIE, getQuizDb, isInstructor } from "@/lib/quizzes";
import { listSignups } from "@/lib/arcadeSignups";

export const runtime = "edge";

const NO_STORE = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

function csvCell(value: string) {
  // Quote everything and defuse spreadsheet formulas in typed text.
  return `"${(/^[=+\-@]/.test(value) ? `'${value}` : value).replace(/"/g, '""')}"`;
}

/** Staff only: the arcade parent sign-ups as CSV (sign in on /quizzes/results/ first). */
export async function GET() {
  if (!(await isInstructor(cookies().get(INSTRUCTOR_COOKIE)?.value))) {
    return new Response("Sign in on the quiz results page first.", { status: 401, headers: NO_STORE });
  }
  const db = getQuizDb();
  if (!db) return new Response("Database not available.", { status: 503, headers: NO_STORE });
  const rows = await listSignups(db);
  const lines = [["Signed up", "Parent first name", "Email", "Child's grade", "Game"].map(csvCell).join(",")];
  for (const r of rows) lines.push([r.createdAt, r.parentName, r.email, r.grade, r.game].map(csvCell).join(","));
  return new Response(lines.join("\n"), {
    headers: { ...NO_STORE, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="arcade-signups.csv"' },
  });
}
