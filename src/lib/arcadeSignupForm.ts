/**
 * The arcade parent sign-up form: grade choices and the checks the server runs.
 * No server imports, so the game page and the tests can use it too.
 */

export const GRADES = ["JK/SK", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9+"] as const;

export type ArcadeSignup = { parentName: string; email: string; grade: string; game: string; createdAt: string };

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

/** Checks a submitted form; returns the clean values or an error to show. */
export function validateSignup(raw: unknown): { ok: true; value: Omit<ArcadeSignup, "createdAt"> } | { ok: false; error: string } {
  const r = (raw ?? {}) as Record<string, unknown>;
  const parentName = String(r.parentName ?? "").trim().slice(0, 60);
  const email = String(r.email ?? "").trim().toLowerCase().slice(0, 254);
  const grade = String(r.grade ?? "");
  const game = String(r.game ?? "").replace(/[^a-z0-9-]/g, "").slice(0, 40) || "arcade";
  if (!parentName) return { ok: false, error: "Please add your first name." };
  if (!EMAIL.test(email)) return { ok: false, error: "Please check the email address." };
  if (!(GRADES as readonly string[]).includes(grade)) return { ok: false, error: "Please pick your child's grade." };
  if (r.consent !== true) return { ok: false, error: "Please tick the box to agree." };
  return { ok: true, value: { parentName, email, grade, game } };
}

