import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { generatePin, sha256Hex } from "@/lib/academy/pin";
import type { LevelSlug } from "@/lib/supabase/types";

export const runtime = "edge";

/**
 * Teacher-only: adds a student to the roster with a freshly generated PIN,
 * returned once in the response for the teacher to hand out (never stored
 * in plaintext — only its hash is persisted, matching the join flow).
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace(/^Bearer\s+/i, "");
  if (!accessToken) return Response.json({ error: "missing_session" }, { status: 401 });

  let body: { classId?: string; displayName?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }
  const { classId, displayName } = body;
  if (!classId || !displayName) {
    return Response.json({ error: "missing_fields" }, { status: 400 });
  }

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

  const { data: klass, error: classError } = await supabase
    .from("classes")
    .select("id, level, teacher_id")
    .eq("id", classId)
    .maybeSingle();
  if (classError) return Response.json({ error: "server_error" }, { status: 500 });
  if (!klass || klass.teacher_id !== teacher.id) {
    return Response.json({ error: "not_your_class" }, { status: 403 });
  }

  const pin = generatePin();
  const pinHash = await sha256Hex(pin);

  const { data: student, error: studentError } = await supabase
    .from("students")
    .insert({ level: klass.level as LevelSlug, display_name: displayName, join_pin_hash: pinHash })
    .select("id")
    .single();
  if (studentError || !student) return Response.json({ error: "server_error" }, { status: 500 });

  const { error: enrollError } = await supabase
    .from("enrollments")
    .insert({ student_id: student.id, class_id: klass.id });
  if (enrollError) return Response.json({ error: "server_error" }, { status: 500 });

  return Response.json({ ok: true, studentId: student.id, pin });
}
