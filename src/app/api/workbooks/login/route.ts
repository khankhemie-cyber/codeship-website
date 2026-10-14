import {
  COOKIE_MAX_AGE,
  accessToken,
  cookieName,
  getWorkbookPassword,
  isWorkbookProgram,
  safeEqual,
} from "@/lib/workbooks";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { password, program } = (await request.json()) as { password?: string; program?: string };
    if (!isWorkbookProgram(program) || !password) {
      return Response.json({ ok: false }, { status: 400 });
    }

    const secret = await getWorkbookPassword(program);
    if (!secret) {
      return Response.json({ ok: false, error: "not_configured" }, { status: 500 });
    }

    // Students type these on phones and tablets: ignore stray spaces and capitals.
    if (!safeEqual(password.trim().toLowerCase(), secret.trim().toLowerCase())) {
      // Slow down password guessing.
      await new Promise((resolve) => setTimeout(resolve, 800));
      return Response.json({ ok: false }, { status: 401 });
    }

    const token = await accessToken(program, secret);
    const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
    return Response.json(
      { ok: true },
      {
        headers: {
          "Set-Cookie": `${cookieName(program)}=${token}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax${secure}`,
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}
