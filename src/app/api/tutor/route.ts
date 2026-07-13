import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getEnv } from "@/lib/env";
import { getLocalizedLevel, type LevelSlug, type Locale } from "@/data/academy/curriculum";
import { buildSystemPrompt, buildUserContent } from "@/lib/academy/tutor/prompt";
import { callTutorModel } from "@/lib/academy/tutor/anthropic";
import { getCannedHint } from "@/lib/academy/tutor/cannedHints";

export const runtime = "edge";

const MAX_ATTEMPT_HISTORY = 5;
const MAX_FIELD_LENGTH = 4000;

/**
 * Student-authenticated. Request: { lessonId, locale, currentCode, attemptHistory }.
 * No free-text chat field exists on this contract at all — the only inputs are the
 * student's own code/block program and their past attempts on *this* lesson, which
 * is itself the guardrail against an open-ended conversation ever starting (see
 * buildSystemPrompt's doc comment). Response: { hintText, diagnosedMisconceptionId,
 * escalationLevel }. Falls back to a canned hint on any model error/timeout/missing key.
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
  if (!body?.lessonId) return Response.json({ error: "invalid_body" }, { status: 400 });

  const requestedLocale: Locale = body.locale === "fr" ? "fr" : "en";
  const currentCode = String(body.currentCode ?? "").slice(0, MAX_FIELD_LENGTH);
  const attemptHistory: string[] = Array.isArray(body.attemptHistory)
    ? body.attemptHistory.slice(-MAX_ATTEMPT_HISTORY).map((a: unknown) => String(a).slice(0, MAX_FIELD_LENGTH))
    : [];

  // "Enrolled in the requested lesson": Phase 0's data model enrolls a student in a
  // class at a level, not per-lesson, so this is the real granularity available —
  // the lesson must belong to the student's own level. Look it up once in English
  // to check locale support (locales/misconceptions aren't touched by translation).
  const baseLevel = getLocalizedLevel(student.level as LevelSlug, "en");
  const baseLesson = baseLevel.lessons.find((l) => l.id === body.lessonId);
  if (!baseLesson) return Response.json({ error: "not_enrolled_in_lesson" }, { status: 403 });

  // Only respond in French if this specific lesson actually has FR content —
  // otherwise the hint would be in a language the lesson itself was never taught in.
  const localeForResponse: Locale = baseLesson.locales.includes(requestedLocale) ? requestedLocale : "en";
  // The localized lesson object: teach/objective/assess/title in the response
  // language, misconceptions/strand/etc. untouched (translations don't cover those).
  const lesson = getLocalizedLevel(student.level as LevelSlug, localeForResponse).lessons.find(
    (l) => l.id === body.lessonId
  )!;

  const env = getEnv();
  const apiKey = env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return Response.json({ ...getCannedHint(lesson, localeForResponse), fallback: true });
  }

  try {
    const systemPrompt = buildSystemPrompt({
      level: student.level as LevelSlug,
      locale: localeForResponse,
      lesson,
      escalationHint: Math.min(3, attemptHistory.length + 1),
    });
    const userContent = buildUserContent({ currentCode, attemptHistory });
    const result = await callTutorModel({ apiKey, model: env.ANTHROPIC_MODEL, systemPrompt, userContent });
    return Response.json(result);
  } catch {
    return Response.json({ ...getCannedHint(lesson, localeForResponse), fallback: true });
  }
}
