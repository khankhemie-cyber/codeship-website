import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sha256Hex } from "@/lib/academy/pin";

export const runtime = "edge";

/**
 * Links a Supabase *anonymous* auth session (created client-side via
 * `supabase.auth.signInAnonymously()`, no email collected) to a pre-provisioned
 * `students` row, using a teacher-issued class code + PIN. This is how a child
 * gets a real, server-verifiable JWT without any child PII beyond a display
 * name the teacher already set when adding them to the roster.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace(/^Bearer\s+/i, "");
  if (!accessToken) {
    return Response.json({ error: "missing_session" }, { status: 401 });
  }

  let body: { classCode?: string; pin?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }
  const classCode = body.classCode?.trim().toUpperCase();
  const pin = body.pin?.trim();
  if (!classCode || !pin) {
    return Response.json({ error: "missing_fields" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userData.user || !userData.user.is_anonymous) {
    return Response.json({ error: "invalid_session" }, { status: 401 });
  }

  const { data: klass, error: classError } = await supabase
    .from("classes")
    .select("id")
    .eq("class_code", classCode)
    .maybeSingle();
  if (classError) return Response.json({ error: "server_error" }, { status: 500 });
  if (!klass) return Response.json({ error: "class_not_found" }, { status: 404 });

  const pinHash = await sha256Hex(pin);

  // Find an unclaimed roster row (auth_user_id still null) in this class whose PIN matches.
  const { data: candidates, error: candidatesError } = await supabase
    .from("students")
    .select("id, join_pin_hash, auth_user_id")
    .in(
      "id",
      (
        await supabase.from("enrollments").select("student_id").eq("class_id", klass.id)
      ).data?.map((row) => row.student_id) ?? []
    );
  if (candidatesError) return Response.json({ error: "server_error" }, { status: 500 });

  const match = candidates?.find((s) => s.join_pin_hash === pinHash && !s.auth_user_id);
  if (!match) {
    return Response.json({ error: "invalid_code_or_pin" }, { status: 401 });
  }

  const { error: linkError } = await supabase
    .from("students")
    .update({ auth_user_id: userData.user.id })
    .eq("id", match.id);
  if (linkError) return Response.json({ error: "server_error" }, { status: 500 });

  return Response.json({ ok: true, studentId: match.id });
}
