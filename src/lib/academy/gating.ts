import type { LevelCurriculum, Semester } from "@/data/academy/curriculum";

export interface StudentProgress {
  /** project id -> passed */
  projectsPassed: Set<string>;
  /** quiz id -> passed */
  quizzesPassed: Set<string>;
  /** capstone id -> passed */
  capstonesPassed: Set<string>;
}

export const SEMESTER_ORDER: Semester[] = ["1", "2", "3", "4", "capstone"];

/**
 * Server-enforced capstone gating (see src/app/api/academy/progress/route.ts,
 * which runs this same check before writing mastery_state — the client-side
 * lock/unlock UI here is a convenience, not the actual gate).
 */
export function isSemesterUnlocked(level: LevelCurriculum, semester: Semester, progress: StudentProgress): boolean {
  const index = SEMESTER_ORDER.indexOf(semester);
  if (index <= 0) return true; // semester "1" is always open

  const previous = SEMESTER_ORDER[index - 1];
  if (previous === "capstone") return false; // nothing follows the capstone within a level

  const project = level.projects.find((p) => p.semester === previous);
  const quizzes = level.quizzes.filter((q) => q.semester === previous);

  const projectDone = project ? progress.projectsPassed.has(project.id) : true;
  const quizzesDone = quizzes.every((q) => progress.quizzesPassed.has(q.id));

  return projectDone && quizzesDone;
}

export function isLevelComplete(level: LevelCurriculum, progress: StudentProgress): boolean {
  return progress.capstonesPassed.has(level.capstone.id);
}

/** Evaluates a capstone rubric's pass rule against submitted per-criterion scores (0/1). */
export function evaluateCapstonePass(level: LevelCurriculum, scores: Record<string, number>): boolean {
  const rule = level.capstone.passRule;
  const total = level.capstone.rubric.length;
  const earned = level.capstone.rubric.reduce((sum, r) => sum + (scores[r.criterion] ? 1 : 0), 0);
  if (rule.type === "all_criteria") return earned === total;
  return earned >= rule.min && rule.of === total;
}
