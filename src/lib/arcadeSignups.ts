/**
 * Ship It! Arcade parent sign-ups (Port CODEship asks for one after a child
 * finishes a challenge or plays for 15 minutes).
 *
 * Stored in the same D1 database as quiz submissions (the QUIZ_DB binding).
 * Only a parent's first name, their email and the child's grade are kept:
 * nothing about the child that identifies them. Staff download the list as
 * CSV from /api/arcade/signups/ after signing in on the quiz results page.
 */

import { getQuizDb } from "@/lib/quizzes";
import type { ArcadeSignup } from "@/lib/arcadeSignupForm";

export { GRADES, validateSignup, type ArcadeSignup } from "@/lib/arcadeSignupForm";

type Db = NonNullable<ReturnType<typeof getQuizDb>>;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS arcade_signups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_name TEXT NOT NULL,
    email TEXT NOT NULL,
    grade TEXT NOT NULL,
    game TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS arcade_signups_by_date ON arcade_signups (created_at)`,
];

let ready: Promise<void> | null = null;
function ensureSchema(db: Db) {
  ready ??= (async () => {
    for (const sql of SCHEMA) await db.prepare(sql).run();
  })().catch((err) => {
    ready = null;
    throw err;
  });
  return ready;
}

export async function saveSignup(db: Db, s: Omit<ArcadeSignup, "createdAt">) {
  await ensureSchema(db);
  await db
    .prepare(`INSERT INTO arcade_signups (parent_name, email, grade, game, created_at) VALUES (?, ?, ?, ?, ?)`)
    .bind(s.parentName, s.email, s.grade, s.game, new Date().toISOString())
    .run();
}

export async function listSignups(db: Db): Promise<ArcadeSignup[]> {
  await ensureSchema(db);
  const { results } = await db
    .prepare(`SELECT parent_name, email, grade, game, created_at FROM arcade_signups ORDER BY created_at DESC LIMIT 5000`)
    .all<{ parent_name: string; email: string; grade: string; game: string; created_at: string }>();
  return results.map((r) => ({ parentName: r.parent_name, email: r.email, grade: r.grade, game: r.game, createdAt: r.created_at }));
}
