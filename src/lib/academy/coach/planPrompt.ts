import type { Lesson, LevelSlug, Semester } from "@/data/academy/curriculum";

export interface ClassAggregate {
  lessonId: string;
  lessonTitle: string;
  masteredCount: number;
  inProgressCount: number;
  notStartedCount: number;
  /** misconceptionId -> how many students in this class have it flagged, aggregated — no student names. */
  misconceptionCounts: Record<string, number>;
}

/**
 * The model only ever sees class-wide counts, never a student name or id — the
 * "check the machine's work" privacy posture applies to teachers too: a
 * third-party API call is not the place for child roster data when an
 * aggregate is all a lesson-prep briefing needs.
 */
export function buildPlanSystemPrompt(params: { level: LevelSlug; semester: Semester; rosterSize: number }): string {
  const { level, semester, rosterSize } = params;
  return [
    `You are a teaching co-pilot for CODEship Academy, helping a teacher prep for their next class.`,
    `Level: ${level}. Semester: ${semester}. Class size: ${rosterSize} students.`,
    ``,
    `You will be given this semester's lessons (with their known misconceptions) and anonymized,`,
    `class-wide mastery counts — never individual student names or ids. Do not invent students,`,
    `names, or data not given to you.`,
    ``,
    `Hard rules:`,
    `1. Never refer to a specific student by name — you were not given any names.`,
    `2. Ground every talking point and every "watch for" item in the data you were actually given.`,
    `3. Keep talkingPoints to 2-4 short, concrete items a teacher could say or do in the next class.`,
    `4. Keep watchFor to the misconceptions with the highest counts in the data — omit ones with a`,
    `   count of 0.`,
    `5. groupingSuggestion should describe how to split the class by mastery level (e.g. "students who`,
    `   have mastered X can move to the stretch activity while others get more practice on Y") without`,
    `   naming anyone.`,
    `Call the provide_plan tool with your answer — do not respond in plain text.`,
  ].join("\n");
}

export function buildPlanUserContent(params: { lessons: Lesson[]; aggregates: ClassAggregate[] }): string {
  const { lessons, aggregates } = params;
  const lessonList = lessons
    .map((l) => {
      const misconceptions = l.misconceptions.map((m) => `${m.id} (${m.name})`).join(", ") || "none listed";
      return `- ${l.id} "${l.title}": ${l.objective}\n  Known misconceptions: ${misconceptions}`;
    })
    .join("\n");

  const aggregateList = aggregates
    .map((a) => {
      const misconceptionCounts =
        Object.entries(a.misconceptionCounts)
          .filter(([, count]) => count > 0)
          .map(([id, count]) => `${id}: ${count}`)
          .join(", ") || "none flagged";
      return `- ${a.lessonId} "${a.lessonTitle}": mastered=${a.masteredCount}, in_progress=${a.inProgressCount}, not_started=${a.notStartedCount}; misconception flags: ${misconceptionCounts}`;
    })
    .join("\n");

  return [
    `This semester's lessons:`,
    lessonList,
    ``,
    `Class-wide mastery counts (anonymized — no student identities):`,
    aggregateList,
  ].join("\n");
}
