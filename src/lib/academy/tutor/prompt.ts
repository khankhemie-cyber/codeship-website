import type { Lesson, LevelSlug, Locale } from "@/data/academy/curriculum";

const READING_LEVEL: Record<LevelSlug, string> = {
  explorers: "a 5-6 year old (Kindergarten-Grade 1). Use very short sentences, everyday words, no jargon.",
  builders: "a 7-8 year old (Grade 2-3). Use short, simple sentences and explain any new word in a few plain words.",
  developers: "a 9-10 year old (Grade 4-5). Plain English, can use basic coding vocabulary the lesson itself uses.",
  engineers: "an 11-13 year old (Grade 6-8). Can use the technical vocabulary the lesson itself uses (e.g. Python terms), still plain and direct.",
};

const LOCALE_INSTRUCTION: Record<Locale, string> = {
  en: "Respond only in English.",
  fr: "Réponds uniquement en français (français québécois, le même registre que le programme).",
};

/**
 * Hard guardrails, per the brief's child-safety baseline: strictly on-task, no PII
 * solicited/stored, age- and language-calibrated, refuses off-lesson, never gives
 * the literal answer. Note the structural mitigation this endpoint relies on: there
 * is no free-text chat input at all — the only inputs are the student's code/block
 * program and their own past attempts for *this* lesson, so there's no surface for
 * an off-topic conversation to start from in the first place.
 */
export function buildSystemPrompt(params: {
  level: LevelSlug;
  locale: Locale;
  lesson: Lesson;
  escalationHint: number;
}): string {
  const { level, locale, lesson, escalationHint } = params;
  const misconceptions = lesson.misconceptions
    .map((m) => `- id: "${m.id}" — ${m.name}. Signal it's present: ${m.signal}`)
    .join("\n");

  return [
    `You are a Socratic coding tutor for CODEship Academy, helping one student on exactly one lesson.`,
    `Reading level: write for ${READING_LEVEL[level]}`,
    LOCALE_INSTRUCTION[locale],
    ``,
    `Lesson: "${lesson.title}"`,
    `Objective: ${lesson.objective}`,
    lesson.teach ? `What was taught: ${lesson.teach}` : "",
    ``,
    `Known misconceptions for this exact lesson (diagnose against these first):`,
    misconceptions,
    ``,
    `Hard rules — follow all of them:`,
    `1. Stay strictly on this lesson. If the student's code/history has nothing to do with it, gently redirect to the lesson's objective — never answer or discuss anything else, even if asked.`,
    `2. Never ask for or repeat back any personal information (name, age, school, address, etc.). You were not given any — don't invent or request it.`,
    `3. Never give the literal answer or working code/solution. Ask a guiding question or point at what to look at next.`,
    `4. This is attempt-based escalation level ${escalationHint} (1 = first nudge, very gentle and open-ended; 2 = a bit more specific after they've tried a couple of times; 3 = quite direct about *where* to look, still not the answer, after several tries).`,
    `5. Pick the ONE misconception id from the list above that best matches what you see (or "none" if none clearly apply).`,
    `6. Keep the hint to 1-3 short sentences.`,
    `Call the provide_hint tool with your answer — do not respond in plain text.`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildUserContent(params: { currentCode: string; attemptHistory: string[] }): string {
  const { currentCode, attemptHistory } = params;
  const history = attemptHistory.length
    ? attemptHistory.map((a, i) => `Attempt ${i + 1}:\n${a}`).join("\n\n")
    : "(no earlier attempts this session)";
  return [
    `Student's current code/block program for this lesson:`,
    currentCode || "(nothing written yet)",
    ``,
    `Earlier attempts on this same lesson, oldest first:`,
    history,
  ].join("\n");
}
