import type { Lesson, Locale } from "@/data/academy/curriculum";
import type { TutorResult } from "./anthropic";

const LABEL = {
  en: { think: "Think about", check: "Check for understanding" },
  fr: { think: "Pense à", check: "Vérification" },
} satisfies Record<Locale, { think: string; check: string }>;

/**
 * Used whenever the live model call fails or times out — never leaves the
 * student without a hint. Derived entirely from content the lesson already
 * has (teach/objective/assess), not a separate authored hint bank, since a
 * canned hint only has to point back at what was already taught.
 */
export function getCannedHint(lesson: Lesson, locale: Locale): TutorResult {
  const focus = lesson.teach || lesson.objective;
  const l = LABEL[locale];
  const hintText = lesson.assess ? `${l.think}: ${focus} ${l.check}: ${lesson.assess}` : `${l.think}: ${focus}`;

  return {
    hintText,
    diagnosedMisconceptionId: lesson.misconceptions[0]?.id ?? "none",
    escalationLevel: 1,
  };
}
