// Env var pattern: FRANCHISE_PASSWORD_TOM_CHE for personKey "tom-che"
function envKey(personKey) {
  return "FRANCHISE_PASSWORD_" + personKey.toUpperCase().replace(/-/g, "_");
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { password, personKey } = body;

    if (!personKey || !password) {
      return Response.json({ ok: false }, { status: 400 });
    }

    const secret = context.env[envKey(personKey)];
    if (!secret) {
      return Response.json({ ok: false, error: "not_configured" }, { status: 500 });
    }

    if (password === secret) {
      return Response.json({ ok: true });
    }

    return Response.json({ ok: false }, { status: 401 });
  } catch (e) {
    return Response.json({ ok: false }, { status: 400 });
  }
}

export async function onRequestGet() {
  return new Response("Method Not Allowed", { status: 405 });
}
