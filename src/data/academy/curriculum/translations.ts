import { explorersFR } from "./explorers.fr";
import { buildersFR } from "./builders.fr";
import { developersFR } from "./developers.fr";
import { engineersFR } from "./engineers.fr";
import type { LevelSlug, LevelTranslation, Locale } from "./types";

/**
 * Explorers' French comes from a real kit (Trousse Explorateurs). Builders,
 * Developers, and Engineers have no French kit — their translations were
 * produced by AI from the English content and have not been reviewed by a
 * native speaker or curriculum specialist. See each file's header comment.
 */
export const CURRICULUM_TRANSLATIONS: Partial<Record<LevelSlug, Partial<Record<Locale, LevelTranslation>>>> = {
  explorers: { fr: explorersFR },
  builders: { fr: buildersFR },
  developers: { fr: developersFR },
  engineers: { fr: engineersFR },
};
