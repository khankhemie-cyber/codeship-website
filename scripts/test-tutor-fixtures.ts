/**
 * Seeded buggy-state fixtures for /api/tutor, exercised directly against the
 * tutoring logic (bypassing the edge route's Supabase auth, since there's no
 * live project this session — see README "Known gaps").
 *
 * Always runs the canned-hint fallback path (no credentials required) for
 * every fixture. If ANTHROPIC_API_KEY is set, also calls the real model via
 * callTutorModel() so the same fixtures double as a live-model smoke test
 * once credentials are provisioned:
 *
 *   npx tsx scripts/test-tutor-fixtures.ts
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/test-tutor-fixtures.ts
 */
import { getLocalizedLevel, type LevelSlug, type Locale } from "../src/data/academy/curriculum";
import { buildSystemPrompt, buildUserContent } from "../src/lib/academy/tutor/prompt";
import { callTutorModel } from "../src/lib/academy/tutor/anthropic";
import { getCannedHint } from "../src/lib/academy/tutor/cannedHints";

interface Fixture {
  description: string;
  level: LevelSlug;
  lessonId: string;
  locale: Locale;
  currentCode: string;
  attemptHistory: string[];
}

const FIXTURES: Fixture[] = [
  {
    description: "Explorers (EN) — blocks placed out of order",
    level: "explorers",
    lessonId: "explorers-s1-c1",
    locale: "en",
    currentCode: "[Grow, Start on Tap, Say 'hi']",
    attemptHistory: ["[Grow, Start on Tap, Say 'hi']"],
  },
  {
    description: "Explorers (FR) — same misconception, French kit",
    level: "explorers",
    lessonId: "explorers-s1-c1",
    locale: "fr",
    currentCode: "[Grandir, Au toucher, Dire 'salut']",
    attemptHistory: ["[Grandir, Au toucher, Dire 'salut']"],
  },
  {
    description: "Builders (EN) — unclosed <p> tag",
    level: "builders",
    lessonId: "builders-s1-c2",
    locale: "en",
    currentCode: "<p>My favourite animal<p>Cats are great.</p>",
    attemptHistory: ["<p>My favourite animal<p>Cats are great.</p>"],
  },
  {
    description: "Developers (EN) — redeclaring instead of reassigning",
    level: "developers",
    lessonId: "developers-s1-c1",
    locale: "en",
    currentCode: "let score = 0;\nlet score = score + 1;",
    attemptHistory: ["let score = 0;\nlet score = score + 1;"],
  },
  {
    description: "Developers (EN) — expects both if and else branches to run",
    level: "developers",
    lessonId: "developers-s3-c1",
    locale: "en",
    currentCode: "if (answer === correct) {\n  say('Right!');\n}\nelse {\n  say('Right!');\n  say('Try again');\n}",
    attemptHistory: ["if (answer === correct) { say('Right!'); } else { say('Try again'); }"],
  },
  {
    description: "Engineers (EN) — inconsistent indentation",
    level: "engineers",
    lessonId: "engineers-s1-c1",
    locale: "en",
    currentCode: "def greet():\n  print('hi')\n   print('there')",
    attemptHistory: ["def greet():\nprint('hi')"],
  },
  {
    description: "Engineers (EN, AI-era) — trusts a 90% confidence score as certainly correct",
    level: "engineers",
    lessonId: "engineers-s2-c2",
    locale: "en",
    currentCode: "if confidence > 0.9:\n    label = prediction  # must be right",
    attemptHistory: ["# the model said 90% confident so I didn't check the label"],
  },
];

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log(apiKey ? "ANTHROPIC_API_KEY set — testing live model + fallback.\n" : "No ANTHROPIC_API_KEY — testing fallback path only.\n");

  let failures = 0;

  for (const fixture of FIXTURES) {
    console.log(`--- ${fixture.description} ---`);
    const level = getLocalizedLevel(fixture.level, fixture.locale);
    const lesson = level.lessons.find((l) => l.id === fixture.lessonId);
    if (!lesson) {
      console.error(`  FAIL: lesson ${fixture.lessonId} not found for ${fixture.level}/${fixture.locale}`);
      failures++;
      continue;
    }

    const cannedHint = getCannedHint(lesson, fixture.locale);
    console.log(`  fallback hintText: ${cannedHint.hintText}`);
    console.log(`  fallback diagnosedMisconceptionId: ${cannedHint.diagnosedMisconceptionId}`);
    if (!cannedHint.hintText || cannedHint.hintText.includes("N/A")) {
      console.error("  FAIL: fallback hint is empty or contains a literal N/A placeholder");
      failures++;
    }

    if (apiKey) {
      try {
        const systemPrompt = buildSystemPrompt({
          level: fixture.level,
          locale: fixture.locale,
          lesson,
          escalationHint: fixture.attemptHistory.length,
        });
        const userContent = buildUserContent({
          currentCode: fixture.currentCode,
          attemptHistory: fixture.attemptHistory,
        });
        const result = await callTutorModel({ apiKey, model: process.env.ANTHROPIC_MODEL, systemPrompt, userContent });
        console.log(`  model hintText: ${result.hintText}`);
        console.log(`  model diagnosedMisconceptionId: ${result.diagnosedMisconceptionId}`);
        console.log(`  model escalationLevel: ${result.escalationLevel}`);
        if (lesson.misconceptions.length && !lesson.misconceptions.some((m) => m.id === result.diagnosedMisconceptionId)) {
          console.error("  FAIL: model returned a misconception id not on this lesson's list");
          failures++;
        }
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
  console.log(`✓ All ${FIXTURES.length} tutor fixtures passed (fallback path${apiKey ? " + live model" : ""}).`);
}

main();
