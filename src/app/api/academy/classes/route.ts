import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { LevelSlug, Semester } from "@/data/academy/curriculum";

export const runtime = "edge";

function generateClassCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let code = "";
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  for (let i = 0; i < 5; i++) code += alphabet[bytes[i] % alphabet.length];
  return code;
}

/** Teacher-authenticated: creates a class with a fresh, unique join code. */
export async function POST(request: Request) {
  const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!accessToken) return Response.json({ error: "missing_session" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userData.user) return Response.json({ error: "invalid_session" }, { status: 401 });

  const { data: teacher, error: teacherError } = await supabase
    .from("teachers")
    .select("id, school_id")
    .eq("auth_user_id", userData.user.id)
    .maybeSingle();
  if (teacherError) return Response.json({ error: "server_error" }, { status: 500 });
  if (!teacher) return Response.json({ error: "not_a_teacher" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const { name, level } = (body ?? {}) as { name?: string; level?: LevelSlug };
  if (!name || !level) return Response.json({ error: "missing_fields" }, { status: 400 });

  let classCode = generateClassCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await supabase.from("classes").select("id").eq("class_code", classCode).maybeSingle();
    if (!existing) break;
    classCode = generateClassCode();
  }

  const { data: klass, error } = await supabase
    .from("classes")
    .insert({
      teacher_id: teacher.id,
      school_id: teacher.school_id ?? null,
      name,
      level,
      semester: "1" as Semester,
      class_code: classCode,
    })
    .select("id, class_code")
    .single();
  if (error || !klass) return Response.json({ error: "server_error" }, { status: 500 });

  return Response.json({ ok: true, classId: klass.id, classCode: klass.class_code });
}
