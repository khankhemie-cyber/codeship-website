import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getLevelCurriculum, type LevelSlug } from "@/data/academy/curriculum";

export const runtime = "edge";

/**
 * Student-authenticated. Grades quiz submissions and records project
 * self-checks server-side — these two feed capstone/semester gating
 * (src/lib/academy/gating.ts), so they're never written directly by the
 * client (see the removed RLS insert policies in supabase/schema.sql).
 * Passing a quiz here does NOT require a teacher; passing a *project*
 * only reaches `status: "submitted"` — a teacher marks it "passed" via
 * POST /api/academy/mark (rubric criteria are graded by a human).
 */
export async function POST(request: Request) {
  const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!accessToken) return Response.json({ error: "missing_session" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userData.user) return Response.json({ error: "invalid_session" }, { status: 401 });

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id, level")
    .eq("auth_user_id", userData.user.id)
    .maybeSingle();
  if (studentError) return Response.json({ error: "server_error" }, { status: 500 });
  if (!student) return Response.json({ error: "not_a_student" }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body?.type) return Response.json({ error: "invalid_body" }, { status: 400 });

  if (body.type === "quiz_submission") {
    const { quizId, answers } = body as { quizId: string; answers: Record<string, string> };
    const level = getLevelCurriculum(student.level as LevelSlug);
    const quiz = level.quizzes.find((q) => q.id === quizId);
    if (!quiz) return Response.json({ error: "quiz_not_found" }, { status: 404 });

    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[String(i)] === q.answer) score += 1;
    });
    const passed = score >= Math.ceil(quiz.questions.length * 0.7); // 7/10 pass bar

    const { error } = await supabase
      .from("quiz_results")
      .upsert({ student_id: student.id, quiz_id: quizId, score, total: quiz.questions.length, passed, completed_at: new Date().toISOString() });
    if (error) return Response.json({ error: "server_error" }, { status: 500 });
    return Response.json({ ok: true, score, total: quiz.questions.length, passed });
  }

  if (body.type === "project_submission") {
    const { projectId, selfCheck } = body as { projectId: string; selfCheck: Record<string, boolean> };
    const { error } = await supabase.from("project_submissions").upsert({
      student_id: student.id,
      project_id: projectId,
      self_check: selfCheck,
      status: "submitted",
      updated_at: new Date().toISOString(),
    });
    if (error) return Response.json({ error: "server_error" }, { status: 500 });
    return Response.json({ ok: true, status: "submitted" });
  }

  if (body.type === "lesson_mastery") {
    const { lessonId, status } = body as { lessonId: string; status: "in_progress" | "mastered" };
    const { error } = await supabase
      .from("mastery_state")
      .upsert({ student_id: student.id, lesson_id: lessonId, status, last_attempt_at: new Date().toISOString() });
    if (error) return Response.json({ error: "server_error" }, { status: 500 });
    return Response.json({ ok: true });
  }

  return Response.json({ error: "unknown_type" }, { status: 400 });
}
