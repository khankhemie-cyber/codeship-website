import { cookies } from "next/headers";
import { cookieName, hasAccess } from "@/lib/workbooks";
import type { ProgramSlug } from "@/data/programs";
import { ROVER_PAID_LEVELS } from "@/lib/games/paid/rover";
import { RULE_CHALLENGES_PAID } from "@/lib/games/paid/bot";

export const runtime = "edge";

/**
 * Ship It! Arcade paid levels (6+). Their content is never in the public
 * JavaScript: this route sends it only to a browser holding the program's
 * class-password cookie (the same check as the workbook download).
 */
const PAID: Record<string, { program: ProgramSlug; levels: unknown[] }> = {
  rover: { program: "developers", levels: ROVER_PAID_LEVELS },
  bot: { program: "engineers", levels: RULE_CHALLENGES_PAID },
};

const headers = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

export async function GET(request: Request) {
  const game = new URL(request.url).searchParams.get("game") ?? "";
  const entry = Object.prototype.hasOwnProperty.call(PAID, game) ? PAID[game] : undefined;
  if (!entry) {
    return Response.json({ ok: false }, { status: 404, headers });
  }
  if (!(await hasAccess(entry.program, cookies().get(cookieName(entry.program))?.value))) {
    return Response.json({ ok: false }, { status: 401, headers });
  }
  return Response.json({ ok: true, levels: entry.levels }, { headers });
}
