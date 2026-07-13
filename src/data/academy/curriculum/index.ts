import { builders } from "./builders";
import { developers } from "./developers";
import { engineers } from "./engineers";
import { explorers } from "./explorers";
import { applyMasteryGraph } from "./masteryGraph";
import { CURRICULUM_TRANSLATIONS } from "./translations";
import type { LevelCurriculum, LevelSlug, Locale } from "./types";

export const CURRICULUM: Record<LevelSlug, LevelCurriculum> = {
  explorers: applyMasteryGraph(explorers),
  builders: applyMasteryGraph(builders),
  developers: applyMasteryGraph(developers),
  engineers: applyMasteryGraph(engineers),
};

export const CURRICULUM_LEVELS: LevelCurriculum[] = [
  CURRICULUM.explorers,
  CURRICULUM.builders,
  CURRICULUM.developers,
  CURRICULUM.engineers,
].sort((a, b) => a.orderIndex - b.orderIndex);

export { CURRICULUM_TRANSLATIONS };

export function getLevelCurriculum(level: LevelSlug): LevelCurriculum {
  return CURRICULUM[level];
}

export function getAvailableLocales(level: LevelSlug): Locale[] {
  return ["en", ...(Object.keys(CURRICULUM_TRANSLATIONS[level] ?? {}) as Locale[])];
}

/**
 * Merges a level's English content with its French translation (falling back
 * to English field-by-field for anything not translated) — never returns
 * partially-French content silently; `locale: "en"` or a level with no
 * translation always returns the untouched English source.
 */
export function getLocalizedLevel(level: LevelSlug, locale: Locale): LevelCurriculum {
  const base = CURRICULUM[level];
  if (locale === "en") return base;

  const translation = CURRICULUM_TRANSLATIONS[level]?.[locale];
  if (!translation) return base;

  return {
    ...base,
    name: translation.name,
    gradeBand: translation.gradeBand,
    codingSpace: translation.codingSpace,
    theoryUnits: base.theoryUnits.map((t) => ({
      ...t,
      ...(translation.theoryUnits[t.id] ?? {}),
    })),
    lessons: base.lessons.map((lesson) => ({
      ...lesson,
      ...(translation.lessons[lesson.id] ?? {}),
    })),
    blockPuzzles: base.blockPuzzles.map((puzzle) => ({
      ...puzzle,
      goal: {
        ...puzzle.goal,
        description: translation.blockPuzzleGoals?.[puzzle.id] ?? puzzle.goal.description,
      },
    })),
    projects: base.projects.map((project) => ({
      ...project,
      ...(translation.projects[project.id] ?? {}),
    })),
    quizzes: base.quizzes.map((quiz) => ({
      ...quiz,
      questions: translation.quizzes[quiz.id] ?? quiz.questions,
    })),
    capstone: { ...base.capstone, ...translation.capstone },
  };
}

export function getLesson(lessonId: string): { level: LevelSlug; lesson: LevelCurriculum["lessons"][number] } | undefined {
  for (const level of CURRICULUM_LEVELS) {
    const lesson = level.lessons.find((l) => l.id === lessonId);
    if (lesson) return { level: level.level, lesson };
  }
  return undefined;
}

export * from "./types";
