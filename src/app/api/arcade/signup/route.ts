import { getQuizDb } from "@/lib/quizzes";
import { saveSignup, validateSignup } from "@/lib/arcadeSignups";

export const runtime = "edge";

const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

/** A parent signs up so their child can keep playing a Ship It! Arcade game. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 400, headers });
  }
  const v = validateSignup(body);
  if (!v.ok) return Response.json({ ok: false, error: v.error }, { status: 400, headers });
  const db = getQuizDb();
  if (!db) return Response.json({ ok: false, error: "Sign-up isn't available right now." }, { status: 503, headers });
  try {
    await saveSignup(db, v.value);
  } catch {
    return Response.json({ ok: false, error: "Sign-up isn't available right now." }, { status: 503, headers });
  }
  return Response.json({ ok: true }, { headers });
}
