import { cookies } from "next/headers";
import { cookieName, hasAccess } from "@/lib/workbooks";
import type { ProgramSlug } from "@/data/programs";
import { ROVER_PAID_LEVELS } from "@/lib/games/paid/rover";
import { RULE_CHALLENGES_PAID } from "@/lib/games/paid/bot";
import { PROMPT_PAID_LEVELS } from "@/lib/games/paid/prompt";
import { BUS_PAID_LEVELS } from "@/lib/games/paid/bus";

export const runtime = "edge";

/**
 * Ship It! Arcade paid levels (6+). Their content is never in the public
 * JavaScript: this route sends it only to a browser holding the program's
 * class-password cookie (the same check as the workbook download).
 */
const PAID: Record<string, { programs: ProgramSlug[]; levels: unknown[] }> = {
  rover: { programs: ["developers"], levels: ROVER_PAID_LEVELS },
  bot: { programs: ["engineers"], levels: RULE_CHALLENGES_PAID },
  // Ages 7–10: either class password unlocks it.
  prompt: { programs: ["builders", "developers"], levels: PROMPT_PAID_LEVELS },
  // Bus Buddies Road Trip (ages 4–6): levels 11–20.
  bus: { programs: ["explorers"], levels: BUS_PAID_LEVELS },
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
  const jar = cookies();
  const checks = await Promise.all(entry.programs.map((p) => hasAccess(p, jar.get(cookieName(p))?.value)));
  if (!checks.some(Boolean)) {
    return Response.json({ ok: false }, { status: 401, headers });
  }
  return Response.json({ ok: true, levels: entry.levels }, { headers });
}
