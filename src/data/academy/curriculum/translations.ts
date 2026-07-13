import { explorersFR } from "./explorers.fr";
import type { LevelSlug, LevelTranslation, Locale } from "./types";

/** Only levels with a real FR kit get an entry — currently just Explorers (Trousse Explorateurs). */
export const CURRICULUM_TRANSLATIONS: Partial<Record<LevelSlug, Partial<Record<Locale, LevelTranslation>>>> = {
  explorers: { fr: explorersFR },
};
