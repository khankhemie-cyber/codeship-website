import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

// Env var pattern: FRANCHISE_PASSWORD_TOM_CHE for personKey "tom-che"
function envKey(personKey: string) {
  return "FRANCHISE_PASSWORD_" + personKey.toUpperCase().replace(/-/g, "_");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password, personKey } = body as { password?: string; personKey?: string };

    if (!personKey || !password) {
      return Response.json({ ok: false }, { status: 400 });
    }

    const env = getRequestContext().env as Record<string, string | undefined>;
    const secret = env[envKey(personKey)];
    if (!secret) {
      return Response.json({ ok: false, error: "not_configured" }, { status: 500 });
    }

    if (password === secret) {
      return Response.json({ ok: true });
    }

    return Response.json({ ok: false }, { status: 401 });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}
