# Engineers Assessment Manual
**Document ID:** CSA-ENG-AM-EN-v1.0 · **Program:** Engineers (Grades 6–8) · Instructor-only volume — contains answer keys.

---

## 1. Assessment philosophy at this level

Grades 6–8 quizzes use code-reading, tracing, short answer, and scenario judgment. Ethics items grade *reasoning*, never opinions. Low-stakes, never ranked. Experiment logs and review checklists (workbook) are first-class rubric evidence — Engineers are assessed like junior engineers: on evidence trails, not just artifacts.

## 2. Assessment calendar

| When | Instrument |
|------|-----------|
| S1.1 | Diagnostic — logic/typing/AI-conceptions scan |
| Sx.3 | Q1, Q3, Q5, Q7 |
| Sx.5 | Q2, Q4, Q6, Q8 + semester project rubric |
| C.2 | Capstone rubric + ethics/security check + pitch + certificate |

## 3. Diagnostic — "First Voyage" (S1.1, no grade)

10-minute sheet: follow a 3-branch flowchart · trace a 3-step variable update · "what does AI mean to you?" (2 lines — reveals conceptions to build on/correct) · typing/tools comfort self-rating. Build-phase observation: traceback reaction (reads it / freezes). Feeds team-role defaults and starter levels.

## 4. Quizzes (5 items, 10 min) — with keys

### Q1 — Python & Weakness (S1.3)
1. `pw = "sunshine"` — what is `len(pw)`? **Key:** 8.
2. `"sun" in pw` → ? **Key:** True.
3. Name two things that make a password weak. **Key:** short / common word / personal info / no variety (any two).
4. Most accounts are broken by: movie-style code cracking / guessing & reuse & phishing. **Key:** guessing, reuse, phishing.
5. `if len(pw) >= 12 and has_digit:` — fires when? **Key:** both conditions true.

### Q2 — Checker Logic (S1.5)
1. Score starts 0, +1 per rule passed; 3 of 4 rules pass → score? **Key:** 3.
2. What does `return` give us here? **Key:** the verdict/value back from the function.
3. Why loop over a list of test strings instead of retyping? **Key:** reuse/automation — loop runs the same check on each.
4. Why must we never test real passwords in class? **Key:** exposure/privacy — a real password typed anywhere but its login is a leak risk.
5. A checker says "strong" for `Password123!` — which rule is missing? **Key:** banned/common-word check (it contains "password").

### Q3 — Learning Machines (S2.3)
1. Rules-based vs. ML: which one did our S1 checker use? **Key:** rules.
2. What is training data? **Key:** the labelled examples the model learns patterns from.
3. Confidence 92% means the model is right. True/false + why. **Key:** false — confidence is the model's certainty, not correctness.
4. Why hold back test examples? **Key:** to measure performance on data the model never saw.
5. 8 right of 10 tests → accuracy? **Key:** 80%.

### Q4 — Bias & Evidence (S2.5)
1. Every cat example was orange; the model calls a black cat "dog". What did it actually learn? **Key:** orange(colour) pattern, not "cat".
2. Complete: the data's blind spots become the model's ___. **Key:** blind spots.
3. One real-world harm of biased AI (age-appropriate). **Key:** e.g., face/voice systems failing some groups (any reasonable example).
4. The fix for skewed training data is ___. **Key:** rebalance/add varied, representative examples and retrain.
5. A findings brief must include what went wrong. Why? **Key:** honest evaluation is the professional/scientific standard (any faithful wording).

### Q5 — Bot Builder (S3.3)
1. What keeps the conversation going in our bot? **Key:** the `while` loop.
2. Why `.lower()` the user's message? **Key:** so keyword matching isn't broken by capitalization.
3. `intents = {"homework": "Try breaking it into steps."}` — what is `"homework"`? **Key:** the key/keyword (intent).
4. What is a fallback? **Key:** the response when no intent matches ("I don't know that yet").
5. Advantage of a dictionary over 15 if-statements? **Key:** organized/scalable — add intents without new branching code.

### Q6 — Responsible AI (S3.5)
1. Name two questions from the Responsibility Review. **Key:** who does it help / who could it harm / what data does it touch / does it fail safely / does it disclose it's a bot (any two).
2. Why must the bot say it's a bot? **Key:** honesty/transparency — users deserve to know.
3. A user asks the bot about a serious personal problem. Correct design? **Key:** route to a trusted adult; bots know their limits.
4. Your bot stores users' names but doesn't need them. Checklist verdict? **Key:** drop the data — collect only what's needed.
5. "Fails safely" means… **Key:** when it doesn't know, it says so (fallback) rather than faking an answer.

### Q7 — Data Handler (S4.3)
1. In a CSV, rows are ___ and columns are ___. **Key:** records/entries; facts/fields.
2. Values 4, 8, 6 → mean? **Key:** 6.
3. "Is October our rainiest month?" vs "Weather is interesting" — which is investigable and why? **Key:** the first; it's answerable from columns/specific.
4. Your mean daily temperature computes to 4 500. First move? **Key:** sanity-check/hunt the bug (wrong column, units, string-vs-number).
5. An outlier is… **Key:** a point far from the rest — a question to investigate, not automatically an error.

### Q8 — Engineer Expert (S4.5, whole-year)
1. Write a condition: temperature above 30. **Key:** `temp > 30`.
2. Which skill family for "which neighbourhood recycles most?" **Key:** data analysis.
3. Which for "recognize photos of full recycling bins?" **Key:** AI/ML model.
4. A chart starts its axis at 88 of 100 to make a tiny gap look huge. Verdict? **Key:** misleading — truncated axis (fix or disclose).
5. An insight report ends with a caveat because… **Key:** honest analysis states limits of the evidence.

## 5. Marking guide

Standard thresholds: 5 secure / 3–4 developing / 0–2 support (1:1 next Build). 2+ same-item misses → whole-class re-teach. Ethics/scenario items: full credit for any answer with sound reasoning on the taught framework, even if worded unexpectedly. Record within 24 h; return with a named strength.

## 6. Semester project rubric

Program-standard criteria, Engineers descriptors:

| Criterion | Emerging | Developing | Proficient | Extending |
|-----------|----------|------------|------------|-----------|
| Concept & creativity | Follows the example | Brief with own touches | Own purpose/questions, clearly theirs | Insight or purpose with genuine originality |
| Technical skill | Constructs with heavy support | Semester's constructs with prompts | Semester's constructs correct & independent | Combines beyond the ask across skill families |
| Process & problem-solving | Stalls; thin logs | Fixes with help; partial logs | Reads tracebacks; complete experiment/evidence logs; honest evaluation | Systematic experimentation; sanity-check culture; helps others |
| Communication & sharing | Shows silently | Describes what it does | Presents with evidence and correct terminology | Compelling, honest presentation incl. limits/caveats |

**Per-semester technical anchors:** S1 conditionals + scoring function on strings · S2 train/test/accuracy + bias demonstrated & mitigated · S3 dictionary-driven bot + fallback + completed responsibility review · S4 correct aggregation + grouped comparison + honest chart.

## 7. Capstone rubric (Innovation Challenge)

Anchors — Concept: specific SDG-linked problem, scoped as a prototype; Technical: ≥2 skill families integrated and working; Process: ethics & security check completed honestly, evidence trail in planner; Communication: 5-part pitch (problem → solution → live demo → impact → honest next steps) delivered within time. Safety compliance (no personal data, safety rails respected) is a pass/fail gate.

## 8. Reflection, self- and peer-assessment

Mission log (every Reflect) and experiment index are the metacognitive backbone — review at semester ends. Peer: "I like / I wonder" evolves into structured user tests (S3.5) and panel-style Q&A after pitches (C.2). Self: reflection pages per semester + the "would I trust it?" judgments (S2.3, S4.2) as calibrated self-assessment.

## 9. Certificate criteria

Issue at C.2 when: capstone integrates ≥2 skill families with completed ethics & security check AND pitch delivered AND ≥3 of 4 semester projects completed. Gaps → make-up time + family conversation first.

## 10. Revision history

| Version | Date | Author role | Change |
|---------|------|-------------|--------|
| 1.0 | 2026-07-14 | Assessment & Evaluation Specialist | First published edition |
