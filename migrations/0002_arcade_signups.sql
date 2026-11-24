-- Ship It! Arcade parent sign-ups (see src/lib/arcadeSignups.ts, which also creates this on first use).
CREATE TABLE IF NOT EXISTS arcade_signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_name TEXT NOT NULL,
  email TEXT NOT NULL,
  grade TEXT NOT NULL,
  game TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS arcade_signups_by_date ON arcade_signups (created_at);
