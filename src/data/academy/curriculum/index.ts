import { builders } from "./builders";
import { developers } from "./developers";
import { engineers } from "./engineers";
import { explorers } from "./explorers";
import { explorersFR } from "./explorers.fr";
import type { LevelCurriculum, LevelSlug, LevelTranslation, Locale } from "./types";

export const CURRICULUM: Record<LevelSlug, LevelCurriculum> = {
  explorers,
  builders,
  developers,
  engineers,
};

export const CURRICULUM_LEVELS: LevelCurriculum[] = [explorers, builders, developers, engineers].sort(
  (a, b) => a.orderIndex - b.orderIndex
);

/** Only levels with a real FR kit get an entry — currently just Explorers (Trousse Explorateurs). */
export const CURRICULUM_TRANSLATIONS: Partial<Record<LevelSlug, Partial<Record<Locale, LevelTranslation>>>> = {
  explorers: { fr: explorersFR },
};

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
