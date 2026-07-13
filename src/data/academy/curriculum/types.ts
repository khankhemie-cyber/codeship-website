import type { ProgramSlug } from "@/data/locations";
import type { BlockInstance, BlockState } from "@/lib/academy/blocks/interpreter";

/** Reuse the marketing site's program slugs — one taxonomy, not a second one for the academy. */
export type LevelSlug = ProgramSlug;
export type Semester = "1" | "2" | "3" | "4" | "capstone";
export type Locale = "en" | "fr";

export interface AccommodationNotes {
  adhd?: string;
  asd?: string;
  dyslexia?: string;
  anxiety?: string;
  gifted?: string;
}

export interface TheoryUnit {
  id: string;
  level: LevelSlug;
  semester: Semester;
  title: string;
  bodyMd: string;
}

/** Pan-Canadian five-area spine every level's Curriculum Guide names as its cross-cutting strand. */
export type Strand = "programming" | "networks" | "data" | "society" | "design";

export interface Misconception {
  id: string;
  name: string;
  /** What a teacher/tutor would observe that signals this misconception is present. */
  signal: string;
}

export interface LessonBranches {
  /** What a student who's ahead does next (gifted/2e extension from the guide). */
  stretch: string;
  /** What a student who's struggling does instead (an accommodation from the guide). */
  support: string;
}

export interface LessonRubricLevel {
  level: "emerging" | "developing" | "secure";
  criteria: string;
}

/**
 * Named provincial frameworks only — never a generic "province" tag. ON comes from
 * each Curriculum Guide's own embedded Ontario alignment; BC/AB/QC come from the
 * separate crosswalk PDFs. Compliance language is always "aligned to / maps to /
 * supports" — never "endorsed"/"approved" — enforced in copy, not in this type.
 */
export interface ProvincialTags {
  ON: string[];
  BC: string[];
  AB: string[];
  QC: string[];
}

export interface Lesson {
  id: string;
  level: LevelSlug;
  semester: Semester;
  classNumber: number;
  orderIndex: number;
  title: string;
  objective: string;
  align?: string;
  warmUp?: string;
  teach?: string;
  activity?: string;
  practice?: string;
  reflect?: string;
  assess?: string;
  home?: string;
  accommodationNotes?: AccommodationNotes;

  // --- Mastery graph (Phase 1) ---
  strand: Strand;
  /** True only for capstone-semester lessons — the level-up gate (see src/lib/academy/gating.ts). */
  capstoneGate: boolean;
  /** lessonIds that must be mastered first — a single linear chain per level, computed from orderIndex. */
  prerequisites: string[];
  misconceptions: Misconception[];
  branches: LessonBranches;
  rubric: LessonRubricLevel[];
  provincialTags: ProvincialTags;
  locales: Locale[];
}

export interface BlockGoal {
  /** Human-readable description shown to the student. */
  description: string;
  /** Final interpreter state the student's program must reach (partial match). */
  state: Partial<Record<keyof BlockState, unknown>>;
  /** Block ids that must appear at least once (e.g. a required trigger block). */
  mustUse?: string[];
}

export interface BlockPuzzle {
  id: string;
  lessonId: string;
  /** Every block instance available in this puzzle's palette. */
  blockSet: BlockInstance[];
  goal: BlockGoal;
  /** Solver-computed (see makeBlockPuzzle) — provably minimal, not estimated. */
  par: number;
  starter?: BlockInstance[];
}

export interface RubricCriterion {
  criterion: string;
  description: string;
}

export interface Project {
  id: string;
  level: LevelSlug;
  semester: Semester;
  title: string;
  brief: string;
  successCriteria: string;
  rubric: RubricCriterion[];
  extension?: string;
}

export interface QuizQuestion {
  prompt: string;
  choices: string[];
  answer: string;
  explanation?: string;
}

export interface Quiz {
  id: string;
  level: LevelSlug;
  semester: Semester;
  quizNumber: 1 | 2;
  kind: "formative" | "summative";
  /**
   * Verbatim from the Curriculum Guide where the guide inlines quiz text (Explorers only);
   * otherwise authored to match the guide's documented topics/rubric — see `authored: true`.
   */
  authored?: boolean;
  questions: QuizQuestion[];
}

export type PassRule = { type: "min_points"; min: number; of: number } | { type: "all_criteria" };

export interface Capstone {
  id: string;
  level: LevelSlug;
  title: string;
  description: string;
  rubric: RubricCriterion[];
  passRule: PassRule;
}

/** Per-lesson French overrides — any field left out falls back to the English text. */
export interface LessonTranslation {
  title?: string;
  objective?: string;
  align?: string;
  warmUp?: string;
  teach?: string;
  activity?: string;
  practice?: string;
  reflect?: string;
  assess?: string;
  home?: string;
}

export interface ProjectTranslation {
  title: string;
  brief: string;
  successCriteria: string;
  rubric: RubricCriterion[];
  extension?: string;
}

/**
 * A French translation of one level's curriculum, from a real FR kit (e.g. the
 * Trousse Explorateurs) rather than a direct-translation placeholder. Only
 * levels with an actual FR kit get an entry — see CURRICULUM_TRANSLATIONS.
 */
export interface LevelTranslation {
  locale: "fr";
  name: string;
  gradeBand: string;
  codingSpace: string;
  /** Keyed by theory unit id. */
  theoryUnits: Record<string, { title: string; bodyMd: string }>;
  /** Keyed by lesson id. */
  lessons: Record<string, LessonTranslation>;
  /** Keyed by block-puzzle id — only the goal description needs translating (block ids/state are language-neutral). */
  blockPuzzleGoals?: Record<string, string>;
  /** Keyed by project id. */
  projects: Record<string, ProjectTranslation>;
  /** Keyed by quiz id — questions in the same order as the English quiz they translate. */
  quizzes: Record<string, QuizQuestion[]>;
  capstone: { title: string; description: string; rubric: RubricCriterion[] };
}

/**
 * A lesson as authored in the 4 curriculum data files — before Phase 1's
 * mastery-graph fields are merged on by applyMasteryGraph(). Keeps the Phase 0
 * lesson literals free of fields that are computed, not hand-typed, so a typo
 * can't create an orphan/cyclic prerequisite (see masteryGraph.ts).
 */
export type RawLesson = Omit<
  Lesson,
  "strand" | "capstoneGate" | "prerequisites" | "misconceptions" | "branches" | "rubric" | "provincialTags" | "locales"
>;

export interface RawLevelCurriculum extends Omit<LevelCurriculum, "lessons"> {
  lessons: RawLesson[];
}

export interface LevelCurriculum {
  level: LevelSlug;
  name: string;
  gradeBand: string;
  codingSpace: string;
  accentColour: string;
  orderIndex: number;
  theoryUnits: TheoryUnit[];
  lessons: Lesson[];
  blockPuzzles: BlockPuzzle[];
  projects: Project[];
  quizzes: Quiz[];
  capstone: Capstone;
}
