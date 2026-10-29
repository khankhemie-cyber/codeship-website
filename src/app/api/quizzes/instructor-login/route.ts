import {
  INSTRUCTOR_COOKIE,
  INSTRUCTOR_COOKIE_MAX_AGE,
  getInstructorPassword,
  instructorToken,
} from "@/lib/quizzes";
import { safeEqual } from "@/lib/workbooks";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { password } = (await request.json()) as { password?: string };
    if (!password) return Response.json({ ok: false }, { status: 400 });

    const secret = getInstructorPassword();
    if (!secret) return Response.json({ ok: false, error: "not_configured" }, { status: 500 });

    if (!safeEqual(password.trim(), secret.trim())) {
      // Slow down password guessing.
      await new Promise((resolve) => setTimeout(resolve, 800));
      return Response.json({ ok: false }, { status: 401 });
    }

    const token = await instructorToken(secret);
    const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
    return Response.json(
      { ok: true },
      {
        headers: {
          "Set-Cookie": `${INSTRUCTOR_COOKIE}=${token}; Path=/; Max-Age=${INSTRUCTOR_COOKIE_MAX_AGE}; HttpOnly; SameSite=Strict${secure}`,
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}
