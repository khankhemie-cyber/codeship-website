import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getEnv } from "@/lib/env";
import { buildNoteSystemPrompt, buildNoteUserContent } from "@/lib/academy/coach/notePrompt";
import { callNoteModel } from "@/lib/academy/coach/coachModel";
import { getCannedNote } from "@/lib/academy/coach/cannedNote";

export const runtime = "edge";

const MAX_NOTE_LENGTH = 2000;

/**
 * Teacher-authenticated. Request: { classId, rawNote }. Returns
 * { polishedNote }, a cleaned-up version of the teacher's quick session
 * note — this route only transforms text, it does not persist anything.
 * The client saves the note the teacher chooses to keep via a direct
 * Supabase insert into session_notes (RLS already grants teachers write
 * access there, unlike the server-enforced grading tables — see
 * supabase/schema.sql's teachers_write_session_notes policy), the same
 * pattern RosterClient already uses for advancing a class's semester.
 *
 * Unlike /api/tutor, this route accepts freeform text — student names a
 * teacher jots are a fundamentally different risk profile from an
 * open-ended chat surface for a child (see README "Misconception-aware AI
 * tutor" section for the contrast). Falls back to trivial (non-AI)
 * whitespace/casing cleanup on any model error/timeout/missing key.
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
  if (!body?.classId || typeof body?.rawNote !== "string" || !body.rawNote.trim()) {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  const { data: klass, error: classError } = await supabase
    .from("classes")
    .select("id, teacher_id")
    .eq("id", body.classId)
    .maybeSingle();
  if (classError) return Response.json({ error: "server_error" }, { status: 500 });
  if (!klass || klass.teacher_id !== teacher.id) return Response.json({ error: "not_your_class" }, { status: 403 });

  const rawNote = String(body.rawNote).slice(0, MAX_NOTE_LENGTH);

  const env = getEnv();
  const apiKey = env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return Response.json({ ...getCannedNote(rawNote), fallback: true });
  }

  try {
    const systemPrompt = buildNoteSystemPrompt();
    const userContent = buildNoteUserContent(rawNote);
    const result = await callNoteModel({ apiKey, model: env.ANTHROPIC_MODEL, systemPrompt, userContent });
    return Response.json(result);
  } catch {
    return Response.json({ ...getCannedNote(rawNote), fallback: true });
  }
}
