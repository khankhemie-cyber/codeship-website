import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getEnv } from "@/lib/env";
import { getLevelCurriculum, type LevelSlug, type Semester } from "@/data/academy/curriculum";
import { buildPlanSystemPrompt, buildPlanUserContent, type ClassAggregate } from "@/lib/academy/coach/planPrompt";
import { callPlanModel } from "@/lib/academy/coach/coachModel";
import { getCannedPlan } from "@/lib/academy/coach/cannedPlan";

export const runtime = "edge";

/**
 * Teacher-authenticated. Request: { classId }. Builds a lesson-prep briefing
 * for the class's current semester from class-wide mastery aggregates — the
 * model is only ever given counts, never a student name or id (same "don't
 * hand a third-party API more than it needs" posture as the student tutor,
 * applied here to roster privacy instead of open-ended chat). Response:
 * { talkingPoints, watchFor, groupingSuggestion }. Falls back to a
 * curriculum-derived plan on any model error/timeout/missing key.
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
  if (!body?.classId) return Response.json({ error: "invalid_body" }, { status: 400 });

  const { data: klass, error: classError } = await supabase
    .from("classes")
    .select("id, level, semester, teacher_id")
    .eq("id", body.classId)
    .maybeSingle();
  if (classError) return Response.json({ error: "server_error" }, { status: 500 });
  if (!klass || klass.teacher_id !== teacher.id) return Response.json({ error: "not_your_class" }, { status: 403 });

  const level = klass.level as LevelSlug;
  const semester = klass.semester as Semester;
  const curriculum = getLevelCurriculum(level);
  const lessons = curriculum.lessons
    .filter((l) => l.semester === semester)
    .sort((a, b) => a.classNumber - b.classNumber);

  const { data: enrollments, error: enrollError } = await supabase
    .from("enrollments")
    .select("student_id")
    .eq("class_id", klass.id);
  if (enrollError) return Response.json({ error: "server_error" }, { status: 500 });
  const studentIds = (enrollments ?? []).map((e) => e.student_id);

  const { data: masteryRows, error: masteryError } =
    studentIds.length === 0
      ? { data: [], error: null }
      : await supabase
          .from("mastery_state")
          .select("lesson_id, status, misconception_flags")
          .in("student_id", studentIds)
          .in(
            "lesson_id",
            lessons.map((l) => l.id)
          );
  if (masteryError) return Response.json({ error: "server_error" }, { status: 500 });

  const aggregates: ClassAggregate[] = lessons.map((lesson) => {
    const rowsForLesson = (masteryRows ?? []).filter((r) => r.lesson_id === lesson.id);
    const misconceptionCounts: Record<string, number> = {};
    for (const m of lesson.misconceptions) misconceptionCounts[m.id] = 0;
    for (const row of rowsForLesson) {
      for (const flag of row.misconception_flags ?? []) {
        misconceptionCounts[flag] = (misconceptionCounts[flag] ?? 0) + 1;
      }
    }
    return {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      masteredCount: rowsForLesson.filter((r) => r.status === "mastered").length,
      inProgressCount: rowsForLesson.filter((r) => r.status === "in_progress").length,
      notStartedCount: studentIds.length - rowsForLesson.length,
      misconceptionCounts,
    };
  });

  const env = getEnv();
  const apiKey = env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return Response.json({ ...getCannedPlan(lessons, aggregates), fallback: true });
  }

  try {
    const systemPrompt = buildPlanSystemPrompt({ level, semester, rosterSize: studentIds.length });
    const userContent = buildPlanUserContent({ lessons, aggregates });
    const result = await callPlanModel({ apiKey, model: env.ANTHROPIC_MODEL, systemPrompt, userContent });
    return Response.json(result);
  } catch {
    return Response.json({ ...getCannedPlan(lessons, aggregates), fallback: true });
  }
}
