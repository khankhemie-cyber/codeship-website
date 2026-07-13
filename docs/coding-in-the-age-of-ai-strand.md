# "Coding in the Age of AI" — pedagogical rationale (Phase 2)

## What this is

Not a new unit bolted onto the curriculum — a named, coherent thread that makes explicit
something the curriculum already teaches in pieces: **computational thinking done *with* an AI
collaborator**, not despite one. Five skills, taught at an age-appropriate depth per level:

1. **Decomposition as specification** — breaking a goal into steps precise enough that a helper
   (human or AI) could follow them.
2. **Prompting as precise instruction** — the words you choose change what you get back.
3. **Verifying/critiquing AI output** — checking a result against what you actually asked for.
4. **Spotting confident-but-wrong answers** — sounding sure and being right are different things.
5. **Iterating with a collaborator** — the first result is a draft, not a finish line.

## Why weave-in, not new lessons

Every level is fixed at 20 lessons (4 per semester), a number already published on the
marketing site (`PROGRAM_STRUCTURE.sessionsApprox` in `src/data/programs.ts`) and tied to the
live-class cadence. Per the build brief's own framing — *"building on the curriculum's existing
AI-with-bias/ethics thread rather than duplicating it"* — and confirmed with the user before
starting this phase: **no lesson count changes**. Every touchpoint below is an existing lesson
that already sits closest to one of the five skills; Phase 2 makes that connection explicit and
gives it consistent framing, rather than inventing a parallel curriculum.

## The age-banded progression

| Level | Touchpoint lesson(s) | Skill(s) made explicit | Why this lesson |
|---|---|---|---|
| **Explorers** (K–1) | `explorers-s1-c4` — Test, fix, share | Spotting confident-but-wrong answers | Already about finding a planted bug. The guide's own S1 theory already seeds "smart helpers like voice assistants follow instructions too" — this lesson is where "and sometimes they get it wrong, just like we do" lands naturally, as an **unplugged, teacher-narrated** example (a puppet "helper" gives a confidently wrong answer to "how many sides does a triangle have?"), not a live AI interaction. |
| **Builders** (Gr 2–3) | `builders-s1-c3` — Plan my page | Decomposition as specification | Already about ordering heading/paragraph/image before building. Extended with: a vague instruction ("make a good page") vs. a precise one (heading first, then two facts, then a picture) — precision is what makes instructions followable, for a page *or* a helper. |
| **Developers** (Gr 4–5) | `developers-s3-c1` (If/else), `developers-s3-c3` (Spot the fake), `developers-s3-c4` (Plan my quiz) | Decomposition, verifying AI output, iterating | S3 "Fact or Fake?" is already the guide's own "Exemplar semester" for AI/algorithm literacy — its theory unit already names AI-generated media directly. C1 gets decomposition framing (turning "check if this is true" into concrete steps); C3 (already "Spot the fake") gets explicit verifying/critiquing framing; C4 gets "a first draft quiz isn't the final quiz" iteration framing. |
| **Engineers** (Gr 6–8) | `engineers-s2-c2` (Classify & confidence), `engineers-s3-c1` (Dictionaries), `engineers-s3-c3` (Prompt design) | Spotting confident-but-wrong answers, decomposition, prompting + iterating | S2-C2 already teaches confidence scores — "what if it's 50/50?" *is* the confident-but-wrong skill, named explicitly here. S3-C1 gets decomposition framing (an intents dictionary *is* a specification). S3-C3 already teaches prompt design directly — extended with "iterate with a collaborator" (rewrite, test, rewrite again) rather than treating the first prompt as final. |

## Child-safety posture (unchanged from the platform-wide baseline)

Every touchpoint is a **sandboxed, teacher-framed "check the machine's work" task** — a
pre-written example the class examines together, not a live, open-ended AI conversation. No
touchpoint requires or introduces a child-facing AI chat interface; that's Phase 3's `/api/tutor`,
which has its own separate guardrails (server-proxied key, lesson-scoped context, no PII, content
filtered). Phase 2 adds no new surface for a child to interact with an AI model directly.

## What's in the data, concretely

`src/data/academy/curriculum/types.ts` adds an optional `aiEra?: AiEraExtension[]` field to
`RawLesson` — present only on the 7 touchpoint lessons above. Each entry names one of the five
skills and the concrete sandboxed activity. `npm run verify:academy` checks that all five skills
are covered at least once across the curriculum and that every level has at least one touchpoint.

## Known gap — flagged, not silently resolved

This phase does not add French content for these touchpoints on Builders/Developers/Engineers
(those levels have no FR kit at all yet — see Phase 0/1's known gaps). Per direction, a French
pass across **all** levels is planned as its own step after Phase 4, not per-phase.
