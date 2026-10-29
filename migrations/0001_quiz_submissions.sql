-- Quiz submissions (see src/lib/quizzes.ts, which also creates this on first use).
CREATE TABLE IF NOT EXISTS quiz_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id TEXT NOT NULL,
  program TEXT NOT NULL,
  student_name TEXT NOT NULL,
  class_name TEXT NOT NULL DEFAULT '',
  answers TEXT NOT NULL,
  correct TEXT NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  submitted_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS quiz_submissions_by_quiz ON quiz_submissions (quiz_id, submitted_at);
