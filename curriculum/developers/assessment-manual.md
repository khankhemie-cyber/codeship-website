# Developers Assessment Manual
**Document ID:** CSA-DEV-AM-EN-v1.0 · **Program:** Developers (Grades 4–5) · Instructor-only volume — contains answer keys.

---

## 1. Assessment philosophy at this level

Grades 4–5 quizzes mix code-reading, tracing, and short answer. Students read items themselves; instructor reads aloud on request (standing accommodation). Low-stakes, never ranked; quiz results steer the re-teach and parent updates.

## 2. Assessment calendar

| When | Instrument |
|------|-----------|
| S1.1 | Diagnostic — logic warm-up + console comfort scan |
| Sx.3 | Q1, Q3, Q5, Q7 |
| Sx.5 | Q2, Q4, Q6, Q8 + semester project rubric |
| C.2 | Capstone rubric + user-test evidence + self-assessment + certificate |

## 3. Diagnostic — "First Voyage" (S1.1, no grade)

Logic warm-up sheet (10 min): sequence completion, "what comes out of this machine" (function intuition), a two-branch flowchart to follow, one number-pattern item. Console scan during Build: typed a line unaided? edited it? Prior coding exposure noted. Feeds pairing and starter-level defaults.

## 4. Quizzes (5 items, 10 min) — with keys

### Q1 — Box Thinking (S1.3: variables, updates)
1. `let score = 8;` What is in the box `score`? **Key:** 8.
2. Trace: `let x = 4; x = x + 3; x = x - 1;` Final `x`? **Key:** 6.
3. What does `count = count - 1` do, in words? **Key:** takes the current value of count, subtracts 1, stores it back (any faithful wording).
4. Which line CREATES a variable? `points = 5;` / `let points = 5;` **Key:** `let points = 5;`
5. True/false: a variable's value can change. **Key:** true.

### Q2 — Job & Chain (S1.5: functions, events)
1. What is a function? **Key:** a named job/set of steps we can run by calling its name.
2. Which line RUNS the function? `function go() {}` / `go();` **Key:** `go();`
3. Complete the chain: click → ___ runs → variable changes → ___ updates. **Key:** function; display/page.
4. `startTimer` vs `StartTimer` — same? **Key:** no, case matters.
5. The button does nothing when clicked. Give one likely cause. **Key:** not wired to the function / function name mismatch / function not defined (any one).

### Q3 — Fork Reader (S2.3: conditionals, comparisons)
1. `let sugar = 12; if (sugar > 10) {A} else {B}` — which runs? **Key:** A.
2. `5 === 5` is… **Key:** true.
3. What's the difference between `=` and `===`? **Key:** `=` assigns/puts in the box; `===` compares/asks if equal.
4. In an if / else if / else ladder, how many branches run? **Key:** exactly one (the first true; else if none are).
5. Write a condition for "age is less than 13". **Key:** `age < 13`.

### Q4 — Machine With a Slot (S2.5: parameters, return, integration)
1. In `function rate(sugar) {…}`, `sugar` is the… **Key:** parameter.
2. `rate(12)` — what is 12 called? **Key:** argument (accept "the input").
3. What does `return` do? **Key:** sends the answer/value back out of the function.
4. Trace: `function double(n) { return n + n; }` → `double(7)`? **Key:** 14.
5. Why is a function with a parameter better than 3 copied if-ladders? **Key:** write once, reuse with any input (any faithful wording).

### Q5 — Compartment Counter (S3.3: arrays, indexing)
1. `let pets = ["cat","dog","fish"];` What is `pets[0]`? **Key:** "cat".
2. What is `pets[2]`? **Key:** "fish".
3. How many elements in `pets`? **Key:** 3.
4. Which adds "hamster" to the end? **Key:** `pets.push("hamster")`.
5. Why does `pets[3]` fail before the push? **Key:** indexes go 0–2; there is no compartment 3 yet.

### Q6 — Loop & Check (S3.5: loops, media literacy)
1. A loop's job in one sentence. **Key:** repeat steps / visit each element without copying code.
2. Trace: loop prints `questions[i]` for i = 0,1,2 over a 3-question array — how many prints? **Key:** 3.
3. The score starts at 0 and adds 1 per correct answer. After 4 correct: score = ? **Key:** 4.
4. Name two of the three source-checking questions. **Key:** Who made it? / What's the evidence? / What do others say? (any two).
5. A quiz "fact" has no source note. What must happen before it ships? **Key:** verify it / find a source or cut it.

### Q7 — Alert Logic (S4.3: accumulation, conditionals)
1. Trace the accumulator: expenses [5, 3, 8], `total` starts 0 → final total? **Key:** 16.
2. Budget is 20, total is 22. Which alert fires: over / getting close / on track? **Key:** over.
3. `total > budget * 0.8` — in words? **Key:** total is past 80% of the budget / getting close.
4. `if (total > budget && daysLeft > 3)` — when does it fire? **Key:** only when BOTH are true.
5. Needs or want: winter boots that fit? **Key:** need.

### Q8 — Developer Expert (S4.5: whole-year integration)
1. Write a variable holding your budget of 25. **Key:** `let budget = 25;`
2. One line that adds `expenses[i]` into `total`. **Key:** `total = total + expenses[i];` (accept `+=`).
3. Which tool for "do this for every item"? variable / loop / event. **Key:** loop.
4. Which tool for "when the button is pressed"? **Key:** event.
5. Your app should warn when spending passes 50. Write the condition. **Key:** `total > 50`.

## 5. Marking guide

Standard thresholds: 5 secure / 3–4 developing / 0–2 support (1:1 next Build). 2+ same-item misses → whole-class re-teach. Record within 24 h; return with a named strength.

## 6. Semester project rubric

Program-standard criteria, Developers descriptors:

| Criterion | Emerging | Developing | Proficient | Extending |
|-----------|----------|------------|------------|-----------|
| Concept & creativity | Follows the example | Brief with own touches (own messages/thresholds) | Own version, clearly theirs — personalized purpose and voice | Feature beyond the brief that serves a real user |
| Technical skill | Constructs with heavy support | Semester's constructs with prompts | Semester's constructs correct & independent | Combines constructs beyond the ask |
| Process & problem-solving | Stalls at errors | Fixes with help | Reads console clues; uses Error Detective + trace tables independently | Debugs systematically; helps others; prevents bugs |
| Communication & sharing | Shows silently | One sentence | Full demo narrating the chain/branch/loop | Confident Q&A; explains *why* the code decides as it does |

**Per-semester technical anchors:** S1 variables/functions/events chain · S2 3-branch conditional + parameterized function · S3 array + loop + score, verified content · S4 loop accumulation + alerts + goal.

## 7. Capstone rubric (Problem-Solver App)

Anchors — Concept: a real problem from the student's own life; Technical: variables + ≥1 function + ≥1 event + ≥1 conditional (arrays/loops → Extending consideration); Process: user test run and one fix made from feedback; Communication: pitch frame delivered (problem → solution → demo → next).

## 8. Reflection, self- and peer-assessment

Bug logs (workbook) as metacognitive artifacts — review them at semester ends; reflection meters + semester reflections; "I like / I wonder" every demo day; C.2 structured user test (What was it for? What confused you?) is peer assessment with teeth.

## 9. Certificate criteria

Issue at C.2 when: capstone meets the technical bar (variables, function, event, conditional) AND solves a self-identified problem AND ≥3 of 4 semester projects completed. Gaps → make-up time + family conversation first.

## 10. Revision history

| Version | Date | Author role | Change |
|---------|------|-------------|--------|
| 1.0 | 2026-07-14 | Assessment & Evaluation Specialist | First published edition |
