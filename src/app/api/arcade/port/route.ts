// © 2026 CODEship Academy. All rights reserved. Proprietary and confidential: see LICENSE.
import { cookies } from "next/headers";
import { cookieName, hasAccess } from "@/lib/workbooks";
import type { ProgramSlug } from "@/data/programs";
import { portContent } from "@/lib/games/port/content";

export const runtime = "edge";

/**
 * Port CODEship challenge content (goals, hints, starter code, test worlds).
 * Sent only to a browser holding a CODEship class-password cookie, so the
 * challenges stay students-only even if someone edits the game in their
 * browser, and the content isn't in the public game files.
 */
const PROGRAMS: ProgramSlug[] = ["explorers", "builders", "developers", "engineers"];

const headers = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

export async function GET() {
  const jar = cookies();
  const checks = await Promise.all(PROGRAMS.map((p) => hasAccess(p, jar.get(cookieName(p))?.value)));
  if (!checks.some(Boolean)) return Response.json({ ok: false }, { status: 401, headers });
  return Response.json({ ok: true, content: portContent() }, { headers });
}
