/**
 * Integrity gate for the academy curriculum data. Run via `npm run verify:academy`,
 * wired into CI alongside tsc/lint/build. Extended in Phase 1 to check the
 * mastery-graph fields: missing field, orphan prerequisite, prerequisite cycle,
 * unresolved provincial ref, and a capstone gate that wouldn't actually block
 * progression. Extended in Phase 2 to check "Coding in the Age of AI" strand
 * coverage (every level has a touchpoint; all five skills appear somewhere).
 */
import { CURRICULUM_LEVELS, CURRICULUM_TRANSLATIONS, type AiEraSkill } from "../src/data/academy/curriculum";

let failures = 0;

function fail(message: string) {
  failures++;
  console.error(`✗ ${message}`);
}

for (const level of CURRICULUM_LEVELS) {
  const prefix = `[${level.level}]`;

  if (level.lessons.length !== 20) {
    fail(`${prefix} expected 20 lessons, found ${level.lessons.length}`);
  }
  // The guide's "5 projects" = 4 semester projects + the capstone project (modeled
  // separately here since it also carries a pass rule that gates level-up).
  if (level.projects.length !== 4) {
    fail(`${prefix} expected 4 semester projects (+1 capstone), found ${level.projects.length}`);
  }
  if (level.theoryUnits.length < 4) {
    fail(`${prefix} expected at least 4 theory units, found ${level.theoryUnits.length}`);
  }

  // orderIndex must be a gapless 1..20 sequence, no duplicates.
  const orderIndexes = level.lessons.map((l) => l.orderIndex).sort((a, b) => a - b);
  for (let i = 0; i < orderIndexes.length; i++) {
    if (orderIndexes[i] !== i + 1) {
      fail(`${prefix} lesson orderIndex is not a gapless 1..N sequence (found ${orderIndexes.join(",")})`);
      break;
    }
  }

  for (const lesson of level.lessons) {
    if (!lesson.id || !lesson.title || !lesson.objective) {
      fail(`${prefix} lesson missing required field (id/title/objective): ${JSON.stringify(lesson.id)}`);
    }
  }

  // Every semester (1-4) should have exactly 4 lessons + 1 project; capstone should have 4 lessons.
  const semesters = ["1", "2", "3", "4", "capstone"] as const;
  for (const semester of semesters) {
    const lessonsInSemester = level.lessons.filter((l) => l.semester === semester);
    if (lessonsInSemester.length !== 4) {
      fail(`${prefix} semester ${semester} has ${lessonsInSemester.length} lessons, expected 4`);
    }
  }

  const quizzesBySemester = new Map<string, number>();
  for (const quiz of level.quizzes) {
    quizzesBySemester.set(quiz.semester, (quizzesBySemester.get(quiz.semester) ?? 0) + 1);
    if (quiz.questions.length !== 10) {
      fail(`${prefix} quiz ${quiz.id} has ${quiz.questions.length} questions, expected 10`);
    }
    for (const q of quiz.questions) {
      if (!q.choices.includes(q.answer)) {
        fail(`${prefix} quiz ${quiz.id} question "${q.prompt}" has an answer not present in its choices`);
      }
    }
  }
  for (const semester of ["1", "2", "3", "4"] as const) {
    if ((quizzesBySemester.get(semester) ?? 0) !== 2) {
      fail(`${prefix} semester ${semester} has ${quizzesBySemester.get(semester) ?? 0} quizzes, expected 2`);
    }
  }

  const lessonIds = new Set(level.lessons.map((l) => l.id));
  for (const puzzle of level.blockPuzzles) {
    if (!lessonIds.has(puzzle.lessonId)) {
      fail(`${prefix} block puzzle ${puzzle.id} references unknown lesson ${puzzle.lessonId}`);
    }
  }

  // Capstone must exist and its pass rule must actually be able to block progression.
  if (!level.capstone) {
    fail(`${prefix} missing capstone`);
  } else {
    if (level.capstone.rubric.length === 0) {
      fail(`${prefix} capstone has an empty rubric — cannot gate progression`);
    }
    if (level.capstone.passRule.type === "min_points" && level.capstone.passRule.min > level.capstone.passRule.of) {
      fail(`${prefix} capstone pass rule requires more points than the rubric has`);
    }
  }

  // --- Phase 1: mastery-graph checks ---
  for (const lesson of level.lessons) {
    if (!lesson.strand) fail(`${prefix} lesson ${lesson.id} missing strand`);
    if (lesson.misconceptions.length === 0) fail(`${prefix} lesson ${lesson.id} has no misconceptions mapped`);
    if (!lesson.branches?.stretch || !lesson.branches?.support) {
      fail(`${prefix} lesson ${lesson.id} missing a stretch or support branch`);
    }
    if (lesson.rubric.length === 0) fail(`${prefix} lesson ${lesson.id} has an empty rubric`);
    if (!lesson.locales.includes("en")) fail(`${prefix} lesson ${lesson.id} locales must include "en"`);

    const pt = lesson.provincialTags;
    for (const province of ["ON", "BC", "AB", "QC"] as const) {
      if (!pt || pt[province].length === 0) {
        fail(`${prefix} lesson ${lesson.id} has an unresolved provincial ref for ${province}`);
      }
    }

    // Orphan prerequisite: every prerequisite id must be a real lesson in this level.
    for (const prereqId of lesson.prerequisites) {
      if (!lessonIds.has(prereqId)) {
        fail(`${prefix} lesson ${lesson.id} has an orphan prerequisite "${prereqId}"`);
      }
    }
    // A capstone-semester lesson must actually have a prerequisite chain behind it —
    // an unreachable/ungated capstone lesson wouldn't block anything.
    if (lesson.capstoneGate && lesson.prerequisites.length === 0) {
      fail(`${prefix} capstone-gate lesson ${lesson.id} has no prerequisites — the gate wouldn't block progression`);
    }
    if (!lesson.capstoneGate && lesson.semester === "capstone") {
      fail(`${prefix} lesson ${lesson.id} is in the capstone semester but capstoneGate is false`);
    }
    if (lesson.capstoneGate && lesson.semester !== "capstone") {
      fail(`${prefix} lesson ${lesson.id} has capstoneGate=true outside the capstone semester`);
    }
  }

  // Prerequisite cycle detection (DFS over this level's lesson graph).
  const lessonById = new Map(level.lessons.map((l) => [l.id, l]));
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>(level.lessons.map((l) => [l.id, WHITE]));
  const visit = (id: string, path: string[]): void => {
    if (color.get(id) === BLACK) return;
    if (color.get(id) === GRAY) {
      fail(`${prefix} prerequisite cycle detected: ${[...path, id].join(" → ")}`);
      return;
    }
    color.set(id, GRAY);
    const lesson = lessonById.get(id);
    for (const prereqId of lesson?.prerequisites ?? []) {
      if (lessonById.has(prereqId)) visit(prereqId, [...path, id]);
    }
    color.set(id, BLACK);
  };
  for (const lesson of level.lessons) visit(lesson.id, []);
}

// Global uniqueness across all levels.
const allIds = new Map<string, string>();
for (const level of CURRICULUM_LEVELS) {
  const items: Array<{ id: string; kind: string }> = [
    ...level.lessons.map((l) => ({ id: l.id, kind: "lesson" })),
    ...level.projects.map((p) => ({ id: p.id, kind: "project" })),
    ...level.quizzes.map((q) => ({ id: q.id, kind: "quiz" })),
    ...level.theoryUnits.map((t) => ({ id: t.id, kind: "theoryUnit" })),
    { id: level.capstone.id, kind: "capstone" },
  ];
  for (const { id, kind } of items) {
    if (allIds.has(id)) {
      fail(`Duplicate id "${id}" used by both ${allIds.get(id)} and ${kind}`);
    }
    allIds.set(id, kind);
  }
}

// French (or any other locale) translations must not reference ids the English
// source doesn't have — a stale id here would silently fail to render.
for (const level of CURRICULUM_LEVELS) {
  const translations = CURRICULUM_TRANSLATIONS[level.level];
  if (!translations) continue;
  const theoryIds = new Set(level.theoryUnits.map((t) => t.id));
  const lessonIds = new Set(level.lessons.map((l) => l.id));
  const projectIds = new Set(level.projects.map((p) => p.id));
  const quizIds = new Map(level.quizzes.map((q) => [q.id, q.questions.length]));
  const puzzleIds = new Set(level.blockPuzzles.map((p) => p.id));

  for (const [locale, translation] of Object.entries(translations)) {
    const prefix = `[${level.level}/${locale}]`;
    for (const id of Object.keys(translation.theoryUnits)) {
      if (!theoryIds.has(id)) fail(`${prefix} translates unknown theory unit id ${id}`);
    }
    for (const id of Object.keys(translation.lessons)) {
      if (!lessonIds.has(id)) fail(`${prefix} translates unknown lesson id ${id}`);
    }
    for (const id of Object.keys(translation.projects)) {
      if (!projectIds.has(id)) fail(`${prefix} translates unknown project id ${id}`);
    }
    for (const id of Object.keys(translation.blockPuzzleGoals ?? {})) {
      if (!puzzleIds.has(id)) fail(`${prefix} translates unknown block puzzle id ${id}`);
    }
    for (const [id, questions] of Object.entries(translation.quizzes)) {
      const expected = quizIds.get(id);
      if (expected === undefined) {
        fail(`${prefix} translates unknown quiz id ${id}`);
      } else if (questions.length !== expected) {
        fail(`${prefix} quiz ${id} has ${questions.length} translated questions, expected ${expected}`);
      }
    }
    if (lessonIds.size !== Object.keys(translation.lessons).length) {
      fail(`${prefix} translates ${Object.keys(translation.lessons).length}/${lessonIds.size} lessons — incomplete`);
    }
  }
}

// Phase 2: "Coding in the Age of AI" strand coverage — a level with zero
// touchpoints, or a skill that's never taught anywhere, means the strand
// isn't actually coherent across the curriculum (see docs/coding-in-the-age-of-ai-strand.md).
const ALL_AI_ERA_SKILLS: AiEraSkill[] = [
  "decomposition-as-spec",
  "prompting",
  "verifying-ai-output",
  "spotting-confident-wrong-answers",
  "iterating-with-a-collaborator",
];
const skillsCovered = new Set<AiEraSkill>();
for (const level of CURRICULUM_LEVELS) {
  const touchpoints = level.lessons.filter((l) => l.aiEra && l.aiEra.length > 0);
  if (touchpoints.length === 0) {
    fail(`[${level.level}] no "Coding in the Age of AI" touchpoint lesson — the strand isn't present at this level`);
  }
  for (const lesson of touchpoints) {
    for (const extension of lesson.aiEra ?? []) {
      if (!extension.activity || extension.activity.length < 10) {
        fail(`[${level.level}] lesson ${lesson.id} has an aiEra entry with no real activity description`);
      }
      skillsCovered.add(extension.skill);
    }
  }
}
for (const skill of ALL_AI_ERA_SKILLS) {
  if (!skillsCovered.has(skill)) {
    fail(`"Coding in the Age of AI" skill "${skill}" is never taught anywhere in the curriculum`);
  }
}
// Lesson count must not have changed — Phase 2 was scoped as weave-in, not add-to (confirmed with the user).
for (const level of CURRICULUM_LEVELS) {
  if (level.lessons.length !== 20) {
    fail(`[${level.level}] lesson count changed to ${level.lessons.length} — Phase 2 was scoped as weave-in-only (20/level)`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} integrity failure(s).`);
  process.exit(1);
} else {
  console.log(`✓ Academy content integrity OK — ${CURRICULUM_LEVELS.length} levels, ` +
    `${CURRICULUM_LEVELS.reduce((n, l) => n + l.lessons.length, 0)} lessons, ` +
    `${CURRICULUM_LEVELS.reduce((n, l) => n + l.blockPuzzles.length, 0)} solver-verified block puzzles, ` +
    `${skillsCovered.size}/${ALL_AI_ERA_SKILLS.length} AI-era skills covered.`);
}
