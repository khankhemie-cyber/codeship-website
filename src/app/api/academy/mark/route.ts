import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getLevelCurriculum, type LevelSlug } from "@/data/academy/curriculum";
import { evaluateCapstonePass } from "@/lib/academy/gating";

export const runtime = "edge";

/**
 * Teacher-authenticated: marks a submitted project as passed, or records a
 * capstone rubric score and evaluates it against the level's pass rule —
 * the actual level-up gate. Only a teacher who owns the student's class may
 * mark; verified server-side, not just by RLS (capstone_results has no
 * client write policy at all).
 */
export async function POST(request: Request) {
  const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!accessToken) return Response.json({ error: "missing_session" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userData.user) return Response.json({ error: "invalid_session" }, { status: 401 });

  const { data: teacher, error: teacherError } = await supabase
    .from("teachers")
    .select("id")
    .eq("auth_user_id", userData.user.id)
    .maybeSingle();
  if (teacherError) return Response.json({ error: "server_error" }, { status: 500 });
  if (!teacher) return Response.json({ error: "not_a_teacher" }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body?.type || !body?.studentId) return Response.json({ error: "invalid_body" }, { status: 400 });

  const { data: taughtRow } = await supabase
    .from("enrollments")
    .select("class_id, classes!inner(teacher_id)")
    .eq("student_id", body.studentId);
  const teachesThisStudent = (taughtRow ?? []).some(
    (row) => (row as unknown as { classes: { teacher_id: string } }).classes.teacher_id === teacher.id
  );
  if (!teachesThisStudent) return Response.json({ error: "not_your_student" }, { status: 403 });

  if (body.type === "project_pass") {
    const { studentId, projectId } = body as { studentId: string; projectId: string };
    const { error } = await supabase
      .from("project_submissions")
      .update({ status: "passed", marked_by: teacher.id, updated_at: new Date().toISOString() })
      .eq("student_id", studentId)
      .eq("project_id", projectId);
    if (error) return Response.json({ error: "server_error" }, { status: 500 });
    return Response.json({ ok: true });
  }

  if (body.type === "capstone_score") {
    const { studentId, level, rubricScores, presented } = body as {
      studentId: string;
      level: LevelSlug;
      rubricScores: Record<string, number>;
      presented: boolean;
    };
    const curriculum = getLevelCurriculum(level);
    const passed = evaluateCapstonePass(curriculum, rubricScores);
    const { error } = await supabase.from("capstone_results").upsert({
      student_id: studentId,
      capstone_id: curriculum.capstone.id,
      rubric_scores: rubricScores,
      passed,
      presented_at: presented ? new Date().toISOString() : null,
    });
    if (error) return Response.json({ error: "server_error" }, { status: 500 });

    if (passed) {
      const { error: certError } = await supabase
        .from("certificates")
        .insert({ student_id: studentId, level, capstone_id: curriculum.capstone.id });
      if (certError) return Response.json({ error: "server_error" }, { status: 500 });
    }
    return Response.json({ ok: true, passed });
  }

  return Response.json({ error: "unknown_type" }, { status: 400 });
}
