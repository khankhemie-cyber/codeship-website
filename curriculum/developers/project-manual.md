# Developers Project Manual
**Document ID:** CSA-DEV-PM-EN-v1.0 · **Program:** Developers (Grades 4–5)

Standard template per CSA-STD-PUB §8; rubrics in CSA-DEV-AM-EN §6–7.

---

## Project 1 — Homework Timer & Focus Tool (Semester 1)

- **Overview:** a personal study timer: countdown variable, start/stop/reset buttons, and a self-written focus message — the student's first tool that tracks and responds to change.
- **Objectives / outcomes:** variables; functions; events; the click→function→variable→display chain.
- **Required skills by launch:** `let` + updates (S1.1–S1.2), functions (S1.3), button events (S1.4).
- **Materials:** JS playground + `timer` starters (HTML shell pre-built); trace tables; Error Detective cards.
- **Timeline:** console basics S1.1–S1.2 → functions S1.3 → events S1.4 → launched S1.5.
- **Teacher guide:** the emotional hook is *self-help* — a tool for their actual homework. Let them choose their own timer lengths and write their own focus messages; that ownership is the Concept criterion. Keep the interval mechanics stubbed (the starter's `show()` helper) — the learning target is the variable/function/event chain, not timer APIs.
- **Student instructions:** "Build the timer YOU would actually use: pick your focus length, make Start/Stop/Reset work, and write the message that gets you working."
- **Extensions:** break timer mode; +1 minute button; session counter ("3 focus blocks today!").
- **Presentation guide:** live demo narrating the chain ("I click Start → startTimer runs → secondsLeft changes → the page updates").
- **Example outcomes:** 25-minute homework timer with "Future-you says thanks!"; violin-practice timer with piece checklist message.
- **Common challenges:** function/name mismatches (Error Detective step 1); wanting flashy visuals first (park in extensions); the `count = count - 1` conceptual hump (trace tables until it lands).

## Project 2 — Healthy Snack Calculator (Semester 2)

- **Overview:** an input-driven tool that rates a snack (sugar and friends) through a conditional ladder inside a parameterized function, and offers advice in the student's own voice.
- **Objectives / outcomes:** conditionals; comparison operators; functions with parameters and returns; reading nutrition-style numbers.
- **Required skills:** if/else (S2.1), else-if ladders + operators (S2.2), `rate(sugar)` with return (S2.3).
- **Materials:** `snack` starters; snack fact cards (realistic label numbers); operator reference cards.
- **Timeline:** branches S2.1–S2.2 → parameterized function S2.3 → assembled S2.4 → demoed S2.5.
- **Teacher guide:** thresholds are theirs to choose and defend — "why is 10 grams your 'high'?" is a richer assessment conversation than any fixed answer. Keep the health framing positive and shame-free: the tool gives *information and swaps*, never food guilt. This project quietly seeds S4's number-reading (labels ≈ unit data).
- **Student instructions:** "Build a rater that takes a snack's numbers and gives honest, kind advice — your thresholds, your words, and at least three different verdicts."
- **Extensions:** two-nutrient rating (sugar + fibre); swap suggestions; emoji verdict scale.
- **Presentation guide:** demo one snack live and narrate which rung fired and why.
- **Example outcomes:** sugar rater with "rocket fuel / steady / super steady" bands; two-input rater that praises fibre.
- **Common challenges:** `=` vs `===` (the classic — re-trace, don't re-explain); ladder rungs in the wrong order (biggest threshold first, walk it); advice text copied flat from the demo (require their voice).

## Project 3 — Fact or Fake? Media-Literacy Quiz (Semester 3)

- **Overview:** a quiz game the student authors and codes: an array of verified fact-or-fake questions, a loop-driven game flow, score tracking, and conditional feedback — media literacy taught by *making* the quiz, not just taking one.
- **Objectives / outcomes:** arrays; loops; score state; the three source-checking questions (Who made it? What's the evidence? What do others say?).
- **Required skills:** checker habit (S3.1), arrays/indexing (S3.2), loops (S3.3).
- **Materials:** headline card deck (age-safe topics); `quiz` starters; verification sheets; supervised reference materials.
- **Timeline:** media literacy S3.1 → arrays S3.2 → loops S3.3 → built + verified S3.4 → arcade S3.5.
- **Teacher guide:** the non-negotiable is **verification** — every "fact" carries a source note, every "fake" a one-line debunk. That rule *is* the media-literacy lesson. Keep topics age-safe and non-political (animals, space, food, records). The arcade (S3.5) is deliberately playful; the reflection ("the fake that nearly got me") is where the learning shows.
- **Student instructions:** "Write five fact-or-fake questions that could fool a smart friend — then verify every single one. Code the game: array, loop, score, and feedback with personality."
- **Extensions:** score-band endings ("Media Master!"); a 'source reveal' after each answer; category rounds.
- **Presentation guide:** arcade rotation + present the near-fooler with its checker question.
- **Example outcomes:** "Animal Facts That Sound Fake" (all true, sourced); space quiz with debunk reveals.
- **Common challenges:** unverifiable "facts" (cut or replace — modelling intellectual honesty); index-0 stumbles (human array replay); questions that are opinions (route back to the fact/opinion line from Builders S4).

## Project 4 — Budget Buddy (Semester 4)

- **Overview:** a money tool: expense list, loop-computed running total, threshold alerts in the student's own voice, and a savings-goal tracker — code helping people make smarter money decisions.
- **Objectives / outcomes:** loop accumulation; conditional (incl. compound) alerts; earning/saving/spending; needs vs. wants.
- **Required skills:** money concepts + scenario (S4.1), accumulator loop (S4.2), alerts (S4.3).
- **Materials:** scenario cards (class trip, pet fund, gift budget); `budget` starters; trace tables.
- **Timeline:** concepts S4.1 → totals S4.2 → alerts S4.3 → assembled S4.4 → demoed S4.5.
- **Teacher guide:** ground everything in kid-real money (allowance-scale numbers, scenario cards) — never family finances, which stay private. The paper-math-vs-code-total check (S4.2) is both debugging practice and math integration; keep it. Alert voice is the personality outlet ("Whoa there, wallet!") — encourage it, it powers the demo.
- **Student instructions:** "Build the Buddy for a real scenario: list the expenses, let the loop do the adding, set alerts that sound like YOU, and track progress to a savings goal."
- **Extensions:** needs/wants split totals; "can I afford it?" checker; weekly allowance projection.
- **Presentation guide:** live scenario demo narrating the loop and the alert branch, ending with "the smarter decision my Buddy enables is ___."
- **Example outcomes:** class-trip snack budget with 80% warning; "new bike fund" tracker with weeks-to-goal math.
- **Common challenges:** accumulator confusion (one trace row per loop turn, always); alerts that all fire at once (walk the ladder order); scenario drift into family money (redirect to card scenarios).

## Capstone — Problem-Solver App

- **Overview:** the student identifies a real problem in their own life and builds an interactive JavaScript app to solve it — the program's headline outcome, delivered.
- **Objectives / outcomes:** independent integration: variables, functions, events, conditionals (arrays/loops encouraged); problem-specification; user testing.
- **Requirements:** real, self-identified problem; the technical bar (variables + ≥1 function + ≥1 event + ≥1 conditional); one user test with one fix; pitch-frame presentation.
- **Timeline:** spec + core C.1 → user test, fix, showcase C.2.
- **Teacher guide:** the spec conversation is the differentiator — "what changes? that's your variable; what triggers it? that's your event" turns any kid-problem into an architecture. Problem-hunt cards rescue the stuck, but the problem must be *felt* by the student. Protect the silent-watch user test; the squirm is the lesson.
- **Student instructions:** "Pick something that genuinely bugs you every week. Spec it, build it, test it on a classmate, fix one thing, and pitch it to your family: the problem, your solution, the demo, and what you'd add next."
- **Presentation guide:** family showcase, pitch frame, certificates after (AM §9).
- **Example outcomes:** chore-picker with fairness memory; library-book day reminder; sibling screen-time turn tracker; hockey-practice streak counter.
- **Common challenges:** "problems" that are really wishes ("I want a game") — dig for the friction behind it; overscoping (spec caps the feature list; extensions hold the dreams); demo-day nerves (pair rehearsal + frame card).

## Revision history

| Version | Date | Author role | Change |
|---------|------|-------------|--------|
| 1.0 | 2026-07-14 | Senior Instructional Designer | First published edition |
