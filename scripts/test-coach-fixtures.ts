/**
 * Seeded fixtures for the teacher co-pilot (/api/coach/plan, /api/coach/note),
 * exercised directly against the coach logic (bypassing the edge routes'
 * Supabase auth + roster aggregation, since there's no live project this
 * session — see README "Known gaps").
 *
 * Always runs the canned (no-model) fallback paths. If ANTHROPIC_API_KEY is
 * set, also calls the real model so the same fixtures double as a live-model
 * smoke test once credentials are provisioned:
 *
 *   npx tsx scripts/test-coach-fixtures.ts
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/test-coach-fixtures.ts
 */
import { getLevelCurriculum, type LevelSlug, type Semester } from "../src/data/academy/curriculum";
import { buildPlanSystemPrompt, buildPlanUserContent, type ClassAggregate } from "../src/lib/academy/coach/planPrompt";
import { buildNoteSystemPrompt, buildNoteUserContent } from "../src/lib/academy/coach/notePrompt";
import { callPlanModel, callNoteModel } from "../src/lib/academy/coach/coachModel";
import { getCannedPlan } from "../src/lib/academy/coach/cannedPlan";
import { getCannedNote } from "../src/lib/academy/coach/cannedNote";

function lessonsFor(level: LevelSlug, semester: Semester) {
  return getLevelCurriculum(level)
    .lessons.filter((l) => l.semester === semester)
    .sort((a, b) => a.classNumber - b.classNumber);
}

interface PlanFixture {
  description: string;
  level: LevelSlug;
  semester: Semester;
  rosterSize: number;
  aggregates: (lessonIds: string[]) => ClassAggregate[];
}

const PLAN_FIXTURES: PlanFixture[] = [
  {
    description: "Explorers S1 — one misconception trending across most of the class",
    level: "explorers",
    semester: "1",
    rosterSize: 6,
    aggregates: (lessonIds) =>
      lessonIds.map((id, i) => ({
        lessonId: id,
        lessonTitle: id,
        masteredCount: i === 0 ? 2 : 0,
        inProgressCount: i === 0 ? 4 : 0,
        notStartedCount: i === 0 ? 0 : 6,
        misconceptionCounts: i === 0 ? ({ "steps-can-be-any-order": 4 } as Record<string, number>) : {},
      })),
  },
  {
    description: "Engineers S2 — brand-new class, nothing attempted yet",
    level: "engineers",
    semester: "2",
    rosterSize: 8,
    aggregates: (lessonIds) =>
      lessonIds.map((id) => ({
        lessonId: id,
        lessonTitle: id,
        masteredCount: 0,
        inProgressCount: 0,
        notStartedCount: 8,
        misconceptionCounts: {},
      })),
  },
  {
    description: "Developers S3 — class fully mastered, ready to move on",
    level: "developers",
    semester: "3",
    rosterSize: 5,
    aggregates: (lessonIds) =>
      lessonIds.map((id) => ({
        lessonId: id,
        lessonTitle: id,
        masteredCount: 5,
        inProgressCount: 0,
        notStartedCount: 0,
        misconceptionCounts: {},
      })),
  },
];

const NOTE_FIXTURES: string[] = [
  "priya and jordan still mixing up if and else. alex got it first try. good energy today",
  "  quiet class, ran out of time for the project demo, pick up next week   ",
  "everyone finished the quiz. two kids asked about how hashing works, tangent but good question",
];

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log(apiKey ? "ANTHROPIC_API_KEY set — testing live model + fallback.\n" : "No ANTHROPIC_API_KEY — testing fallback path only.\n");

  let failures = 0;

  console.log("=== /api/coach/plan fixtures ===\n");
  for (const fixture of PLAN_FIXTURES) {
    console.log(`--- ${fixture.description} ---`);
    const lessons = lessonsFor(fixture.level, fixture.semester);
    if (!lessons.length) {
      console.error(`  FAIL: no lessons found for ${fixture.level}/${fixture.semester}`);
      failures++;
      continue;
    }
    const aggregates = fixture.aggregates(lessons.map((l) => l.id));

    const cannedPlan = getCannedPlan(lessons, aggregates);
    console.log(`  fallback talkingPoints: ${cannedPlan.talkingPoints.length}`);
    console.log(`  fallback watchFor: ${JSON.stringify(cannedPlan.watchFor)}`);
    console.log(`  fallback groupingSuggestion: ${cannedPlan.groupingSuggestion}`);
    if (!cannedPlan.talkingPoints.length || !cannedPlan.groupingSuggestion) {
      console.error("  FAIL: fallback plan missing required fields");
      failures++;
    }

    if (apiKey) {
      try {
        const systemPrompt = buildPlanSystemPrompt({ level: fixture.level, semester: fixture.semester, rosterSize: fixture.rosterSize });
        const userContent = buildPlanUserContent({ lessons, aggregates });
        const result = await callPlanModel({ apiKey, model: process.env.ANTHROPIC_MODEL, systemPrompt, userContent });
        console.log(`  model talkingPoints: ${JSON.stringify(result.talkingPoints)}`);
        console.log(`  model watchFor: ${JSON.stringify(result.watchFor)}`);
        console.log(`  model groupingSuggestion: ${result.groupingSuggestion}`);
      } catch (err) {
        console.error(`  FAIL: live model call threw — ${(err as Error).message}`);
        failures++;
      }
    }
    console.log();
  }

  console.log("=== /api/coach/note fixtures ===\n");
  for (const rawNote of NOTE_FIXTURES) {
    console.log(`--- "${rawNote.trim()}" ---`);
    const cannedNote = getCannedNote(rawNote);
    console.log(`  fallback polishedNote: ${cannedNote.polishedNote}`);
    if (!cannedNote.polishedNote) {
      console.error("  FAIL: fallback note is empty");
      failures++;
    }

    if (apiKey) {
      try {
        const systemPrompt = buildNoteSystemPrompt();
        const userContent = buildNoteUserContent(rawNote);
        const result = await callNoteModel({ apiKey, model: process.env.ANTHROPIC_MODEL, systemPrompt, userContent });
        console.log(`  model polishedNote: ${result.polishedNote}`);
      } catch (err) {
        console.error(`  FAIL: live model call threw — ${(err as Error).message}`);
        failures++;
      }
    }
    console.log();
  }

  if (failures > 0) {
    console.error(`✗ ${failures} fixture check(s) failed.`);
    process.exit(1);
  }
  console.log(
    `✓ All ${PLAN_FIXTURES.length} plan fixtures + ${NOTE_FIXTURES.length} note fixtures passed (fallback path${apiKey ? " + live model" : ""}).`
  );
}

main();
