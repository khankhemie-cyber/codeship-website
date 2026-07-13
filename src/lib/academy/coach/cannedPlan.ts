import type { Lesson } from "@/data/academy/curriculum";
import type { ClassAggregate } from "./planPrompt";
import type { PlanResult } from "./coachModel";

/**
 * Derived entirely from curriculum + aggregate data — no model call, no
 * network — so the prep-briefing panel works before an ANTHROPIC_API_KEY
 * exists, same fallback posture as the tutor's cannedHints.ts.
 */
export function getCannedPlan(lessons: Lesson[], aggregates: ClassAggregate[]): PlanResult {
  const talkingPoints = lessons
    .slice(0, 4)
    .map((l) => `Class ${l.classNumber}: "${l.title}" — ${l.objective}`);

  const misconceptionTotals: Record<string, { count: number; name: string }> = {};
  for (const aggregate of aggregates) {
    for (const [id, count] of Object.entries(aggregate.misconceptionCounts)) {
      if (count <= 0) continue;
      misconceptionTotals[id] ??= { count: 0, name: id };
      misconceptionTotals[id].count += count;
    }
  }
  for (const lesson of lessons) {
    for (const m of lesson.misconceptions) {
      if (misconceptionTotals[m.id]) misconceptionTotals[m.id].name = m.name;
    }
  }
  const watchFor = Object.values(misconceptionTotals)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(({ count, name }) => `${name} (flagged for ${count} student${count === 1 ? "" : "s"})`);

  const totalMastered = aggregates.reduce((sum, a) => sum + a.masteredCount, 0);
  const totalStudents = aggregates.reduce((sum, a) => sum + a.masteredCount + a.inProgressCount + a.notStartedCount, 0);
  let groupingSuggestion: string;
  if (totalStudents === 0) {
    groupingSuggestion = "No mastery data recorded yet this semester — a whole-class walkthrough is a safe default.";
  } else if (totalMastered === totalStudents) {
    groupingSuggestion =
      "The whole class has mastered every lesson tracked this semester so far — no need to split groups; a good time to move ahead or offer stretch extensions.";
  } else {
    groupingSuggestion = `${totalMastered}/${totalStudents} lesson-completions are already mastered across this semester — consider pairing students who've mastered a lesson with those still in progress on it.`;
  }

  return {
    talkingPoints: talkingPoints.length ? talkingPoints : ["No lessons found for this semester."],
    watchFor: watchFor.length ? watchFor : ["No misconceptions flagged yet this semester."],
    groupingSuggestion,
  };
}
