# Developers Master Curriculum Manual
**Document ID:** CSA-DEV-MCM-EN-v1.0 · **Program:** Developers (Grades 4–5) · **Coding space:** JavaScript · **Journey arc:** Code · **Accent colour:** #3A5B9E

---

## 1. Course overview

Developers write real JavaScript — variables, functions, conditionals, and loops — while building tools that solve everyday problems and learning media and financial literacy.

**Headline outcome (public promise):** *Builds interactive tools that solve real problems.*

**Structure:** 4 semesters × 5 sessions + 2 capstone sessions = 22 × 55-minute sessions. 8 quizzes (2 per semester). One tool built per semester plus the capstone Problem-Solver App. Session flow: Warm-up (5) → Teach (10) → Build (30) → Reflect (10) (→ CSA-STD-CF §4).

**Program skills (public promise):** Variables · Functions · Events · Conditionals · Arrays · Loops · Media literacy · Financial literacy.

**Tool:** browser-based HTML/JS playground with console and live preview (same editor family as Builders, with JavaScript enabled — CSA-STD-CF §10). Semester starters provide the HTML shell; Developers write the JavaScript.

**Alignment posture:** maps to Ontario's coding and financial literacy expectations; aligns with Alberta's Computer Science and CTF outcomes. *Not endorsed or approved by any ministry of education.*

## 2. Semester overviews

| Sem | Project | Big Idea (driving question) | Skills |
|-----|---------|----------------------------|--------|
| 1 | Homework Timer & Focus Tool | Variables and functions let programs track and respond to change. (*How can a program keep track of things for us?*) | Variables, Functions, Events |
| 2 | Healthy Snack Calculator | Conditionals let programs make decisions based on data. (*How does a program choose?*) | Conditionals, Functions |
| 3 | Fact or Fake? Media-Literacy Quiz | Arrays and loops help programs process lots of information — just like people should question lots of sources. (*How do we handle many things at once — in code and in news?*) | Arrays, Loops, Media literacy |
| 4 | Budget Buddy | Code can help people make smarter decisions with their money. (*How can a tool make money choices clearer?*) | Loops, Conditionals, Financial literacy |
| ★ | Capstone: Problem-Solver App | Developers identify a real problem in their own life and build an interactive JavaScript app to solve it. | All program skills |

## 3. Skills matrix

| Skill | S1 | S2 | S3 | S4 | Capstone |
|-------|----|----|----|----|----------|
| Variables | ● introduce | ○ use | ○ use | ○ use | ◆ apply independently |
| Functions | ● introduce | ● deepen (parameters/return) | ○ use | ○ use | ◆ apply independently |
| Events | ● introduce | ○ use | ○ use | ○ use | ◆ apply independently |
| Conditionals | | ● introduce | ○ use | ● deepen (compound) | ◆ apply independently |
| Arrays | | | ● introduce | ○ use | ◆ apply independently |
| Loops | | | ● introduce | ● deepen (accumulation) | ◆ apply independently |
| Media literacy | ○ seeded (S4 Builders bridge) | | ● introduce | ○ revisit (ads & money) | ◆ modelled in research |
| Financial literacy | | ○ seeded (unit prices) | | ● introduce | ◆ optional strand |

## 4. Weekly progression — full session sequence

### Semester 1 — Homework Timer & Focus Tool
*Big Idea: Variables and functions let programs track and respond to change.*

| Code | Title | Objectives (students will…) | New vocabulary |
|------|-------|-----------------------------|----------------|
| S1.1 | Hello, JavaScript | run first JS in the console; use `let` to store and change a value; explain what a variable is | JavaScript, console, variable, `let` |
| S1.2 | Numbers That Move | update variables with math (`count = count - 1`); display a variable on the page | value, update, display |
| S1.3 | Name the Job **(Q1)** | write and call functions; explain "a function is a named job" | function, call, define |
| S1.4 | When You Click | wire button events to functions (start/stop/reset); trace what happens on each click | event, click, listener |
| S1.5 | Timer launch **(Q2)** | assemble the Homework Timer (countdown + focus message + reset); demo it | (review week) |

**Project milestone:** working Timer & Focus Tool demoed S1.5. **Success criteria:** a variable tracks time; ≥2 functions; ≥2 button events; a focus message the student wrote.

### Semester 2 — Healthy Snack Calculator
*Big Idea: Conditionals let programs make decisions based on data.*

| Code | Title | Objectives | New vocabulary |
|------|-------|------------|----------------|
| S2.1 | If This, Then That | write `if/else` on real inputs; predict branches | conditional, `if`, `else`, boolean |
| S2.2 | Compare & Decide | use comparison operators (`>`, `<`, `===`) and `else if` chains | comparison, `else if` |
| S2.3 | Functions With Inputs **(Q3)** | write functions with parameters and return values (`rate(sugar)`) | parameter, argument, return |
| S2.4 | Building the Calculator | combine inputs + conditionals + functions into the snack rater; read nutrition-style numbers | input, nutrition label |
| S2.5 | Calculator demo **(Q4)** | finish and demo; explain one decision the code makes | (review week) |

**Project milestone:** Snack Calculator demoed S2.5. **Success criteria:** takes user input; ≥3-branch decision (if / else if / else); a rating function with a parameter; advice text the student wrote.

### Semester 3 — Fact or Fake? Media-Literacy Quiz
*Big Idea: Arrays and loops help programs process lots of information — just like people should question lots of sources.*

| Code | Title | Objectives | New vocabulary |
|------|-------|------------|----------------|
| S3.1 | Question Everything | apply 3 source-checking questions (Who made it? What's the evidence? What do others say?) to sample headlines; sort real/fake examples | media literacy, source, evidence |
| S3.2 | Lists in Code | create arrays; access by index; add items | array, index, element |
| S3.3 | Loop the Loop **(Q5)** | use loops to visit every array element; trace loop execution | loop, `for`, iteration |
| S3.4 | Building the Quiz | assemble the quiz engine: question array + loop + score variable + conditional feedback; write their own fact-or-fake questions with source notes | score, game state |
| S3.5 | Quiz arcade **(Q6)** | play each other's quizzes; present one "fake" that nearly fooled them | (review week) |

**Project milestone:** working quiz game S3.5. **Success criteria:** ≥5 questions in an array; loop-driven flow; score tracking; every "fact" verified, every "fake" explained.

### Semester 4 — Budget Buddy
*Big Idea: Code can help people make smarter decisions with their money.*

| Code | Title | Objectives | New vocabulary |
|------|-------|------------|----------------|
| S4.1 | Money In, Money Out | distinguish earning/saving/spending; needs vs. wants; plan the Buddy | income, expense, budget, needs/wants |
| S4.2 | The Running Total | accumulate totals with loops over expense arrays | total, accumulate |
| S4.3 | Budget Alerts **(Q7)** | trigger conditional alerts (over budget / getting close / on track); compound conditions | threshold, alert |
| S4.4 | Building Budget Buddy | assemble: expense list input + totals + alerts + savings-goal tracker | savings goal |
| S4.5 | Buddy demo **(Q8)** | demo with a realistic scenario (class trip, pet fund); explain one smarter decision the tool enables | (review week) |

**Project milestone:** Budget Buddy demoed S4.5. **Success criteria:** expense array with loop-computed total; ≥2 conditional alerts; a savings goal feature; a realistic scenario presented.

### Capstone — Problem-Solver App

| Code | Title | Objectives |
|------|-------|------------|
| C.1 | Find Your Problem | identify a real problem from their own life (chore chaos, practice tracking, morning routine…); spec it with the problem-solver planner; build the core |
| C.2 | Ship & Show | complete, test with a classmate as "user", present at the family showcase |

**Success criteria:** the problem is real and their own; app uses variables, at least one function, one event, one conditional (arrays/loops encouraged); user-tested once; presented with the problem→solution frame.

## 5. Timing, materials, and classroom preparation

- **Timing:** standard four-phase flow; quiz sessions (x.3, x.5) open with the 10-minute quiz (→ CSA-DEV-AM-EN).
- **Materials:** keyboard devices with the JS playground and semester starters; instructor demo + display; tracing whiteboards or laminated trace tables (PRB-4); workbooks; printables (→ CSA-DEV-PRB-EN).
- **Starters:** each semester ships an HTML shell (buttons, input fields, display areas pre-built) so 100% of student-written code is JavaScript. Students *read* the HTML (Builders knowledge) but are never blocked by it.
- **Preparation:** room per CSA-STD-OPS §2; console visible in every editor; per-session printable copied; unplugged fallback packed (PRB-16).

## 6. Teacher notes (program level)

> **📌 Teacher Note:** Grades 4–5 can hold real syntax — but trace before they type. Every new construct is walked through on a trace table (what's in the variable *now*?) before it goes in the editor.

> **⚠️ Watch For:** the big four beginner errors — case sensitivity, missing brackets/parens, `=` vs `===`, and calling a function that was never defined. The Error Detective checklist (PRB-5) names all four; celebrate console errors as clues, not failures.

> **🤝 Every Learner:** lighter-load = fill-in-the-blank function bodies; stretch = extra features list printed per session. Readers who struggle with word problems get the numbers-first variant of media/financial tasks; the coding objective never depends on reading speed.

## 7. Parent communication schedule

Standard cadence (→ CSA-STD-CF §5): Parent Handbook at enrolment (CSA-DEV-PH-EN); Home Links x.1/x.5; rubric + warm feedback per project; showcase invite before C.2.

## 8. Assessment references

Diagnostic ("First Voyage" logic + console comfort scan) S1.1; quizzes Q1–Q8; semester + capstone rubrics in CSA-DEV-AM-EN; certificate criteria AM §9.

## 9. Cross references

→ CSA-DEV-TM-EN · CSA-DEV-SW-EN · CSA-DEV-AM-EN · CSA-DEV-PM-EN · CSA-DEV-PRB-EN · CSA-DEV-PH-EN · CSA-DEV-QRG-EN.

## 10. Revision history

| Version | Date | Author role | Change |
|---------|------|-------------|--------|
| 1.0 | 2026-07-14 | Chief Curriculum Architect | First published edition |
