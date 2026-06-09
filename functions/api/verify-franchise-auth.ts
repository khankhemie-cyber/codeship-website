interface Env {
  [key: string]: string;
}

// Env var naming: FRANCHISE_PASSWORD_TOM_CHE for personKey "tom-che"
function envKey(personKey: string): string {
  return "FRANCHISE_PASSWORD_" + personKey.toUpperCase().replace(/-/g, "_");
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as { password?: string; personKey?: string };
    const { password, personKey } = body;

    if (!personKey || !password) {
      return Response.json({ ok: false }, { status: 400 });
    }

    const secret = context.env[envKey(personKey)];
    if (!secret) {
      return Response.json({ ok: false }, { status: 500 });
    }

    if (password === secret) {
      return Response.json({ ok: true });
    }

    return Response.json({ ok: false }, { status: 401 });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
};

export const onRequestGet: PagesFunction = async () => {
  return new Response("Method Not Allowed", { status: 405 });
};
