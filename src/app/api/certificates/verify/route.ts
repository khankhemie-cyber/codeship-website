import { getRequestContext } from "@cloudflare/next-on-pages";
import { checkPassword, type CertificatesEnv } from "@/lib/certificates/server";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { password } = (await request.json()) as { password?: string };
    const result = checkPassword(getRequestContext().env as CertificatesEnv, password);
    if (result === "ok") return Response.json({ ok: true });
    if (result === "not_configured") return Response.json({ ok: false, error: "not_configured" }, { status: 500 });
    return Response.json({ ok: false }, { status: 401 });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}
