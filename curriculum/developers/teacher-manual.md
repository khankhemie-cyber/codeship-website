# Developers Teacher Manual
**Document ID:** CSA-DEV-TM-EN-v1.0 · **Program:** Developers (Grades 4–5) · Companion to CSA-DEV-MCM-EN

---

## How to use this volume

One block per session: objectives, materials, minute-by-minute plan, callouts. Timing: Warm-up 5 → Teach 10 → Build 30 → Reflect 10; quiz days (x.3, x.5): Quiz 10 → Re-teach 5 → Build 30 → Reflect 10. References: workbook CSA-DEV-SW-EN, printables CSA-DEV-PRB-EN, quizzes CSA-DEV-AM-EN. 💻 = online adaptation.

**Preparation checklist (every session):** room/tech per OPS §2 · playground + starter open, console visible · printable copied · trace tables on desks · Error Detective cards out · fallback packed.

> **📌 Teacher Note (program-wide):** live-code with a visible console, and make errors on purpose — read them aloud, hunt them with the class. Developers who see you enjoy errors learn to read errors instead of fearing them. Trace tables before typing, every new construct.

---

## Semester 1 — Homework Timer & Focus Tool

### S1.1 Hello, JavaScript
**Objectives:** run JS in the console; store/change a value with `let`; define "variable".
**Materials:** starter `timer-1` (page with display area); trace tables (PRB-4); workbook p. S1.1.

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | "Builders made pages. What could a page DO if it could think? Ideas!" |
| 5–15 | Teach | The console = talking directly to the browser. Live: `2 + 2` → answer. `let minutes = 25` → `minutes` → `minutes - 5`. "A variable is a labelled box holding a value that can change." Show the box drawing every time. |
| 15–45 | Build | **Diagnostic:** logic warm-up sheet (AM §3), 10 min. Then console play from the mission card: make variables for your age, pet count, favourite number; change them; combine them (`age + petCount`). Core: 3 variables made and changed. Stretch: a variable holding words (string) — what happens with `name + age`? |
| 45–55 | Reflect | Circle: "what's in the box NOW?" trace game. Workbook: draw your variable boxes. |

> **🗣 Suggested Dialogue:** "In Builders you told the page what things ARE. In Developers you tell it what to DO. That's the difference between a poster and a machine."
> 💻 Online: console play via screen-share rotations; mission card in chat.

### S1.2 Numbers That Move
**Objectives:** update variables with math; display a variable on the page.
**Materials:** starter `timer-2` (display + a `show()` helper explained as "given for now").

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Trace-table starter: `let x = 10; x = x + 5; x = x - 3` — what's in the box? |
| 5–15 | Teach | The weirdest line in coding: `count = count - 1` — "take what's in the box, subtract 1, put it back." Live-run with the trace table, then display it on the page with the helper. |
| 15–45 | Build | Mission: a countdown you control — variable `secondsLeft`, buttons run your code to subtract and re-display (event wiring pre-stubbed this week). Core: countdown updates on the page. Stretch: it also counts *up*, or jumps by 5s. |
| 45–55 | Reflect | Pair-trace a partner's code aloud. Goal set. |

### S1.3 Name the Job (Quiz Q1)
**Objectives:** define and call functions; "a function is a named job."
**Materials:** Q1; starter `timer-3`.

| Time | Phase | Plan |
|------|-------|------|
| 0–10 | Quiz Q1 | Variables & updates. |
| 10–15 | Re-teach | Rebuild the most-missed trace live. |
| 15–45 | Build | Teach-in-build: recipes have names so we don't re-explain ("make my lunch"). `function startTimer() { ... }` bundles the job; `startTimer()` runs it. Students wrap yesterday's countdown steps into `startTimer`, `resetTimer`. Core: 2 working functions called from the console. Stretch: `addMinute()`. |
| 45–55 | Reflect | "Why name a job instead of repeating the steps?" Workbook function-machine page. |

### S1.4 When You Click
**Objectives:** connect button events to functions; trace click → function → variable → display.
**Materials:** starter `timer-4` (buttons visible, unwired).

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Human event demo: instructor is the button — poke = run the "wave" function. Events from Explorers ("triggers!") now have real syntax. |
| 5–15 | Teach | Wire it live: button click → `startTimer`. The chain on the board: **click → function runs → variable changes → display updates.** Trace one full click together. |
| 15–45 | Build | Students wire Start/Stop/Reset to their functions; test furiously. Core: 2 buttons wired. Stretch: a "focus message" that changes when the timer starts (their own words — "eyes on homework, future you says thanks!"). |
| 45–55 | Reflect | Demo chains: partner clicks, you narrate the chain. Goal for launch day. |

### S1.5 Timer launch (Quiz Q2)
**Objectives:** assemble & demo the full tool.
**Materials:** Q2; rubric (AM §6); Home Link (PRB-6).

| Time | Phase | Plan |
|------|-------|------|
| 0–10 | Quiz Q2 | Functions & events. |
| 10–15 | Re-teach | Chain-trace the most-missed link. |
| 15–45 | Build | Assemble: countdown + focus message + reset; personalize (their study lengths, their messages). Error Detective rounds. Rubric scoring during circulation. |
| 45–55 | Reflect | Launch demos: "My tool helps me ___ . Watch the chain: click → …" Peer "I like / I wonder". Home Link goes home. |

---

## Semester 2 — Healthy Snack Calculator

### S2.1 If This, Then That
**Objectives:** write `if/else` on real input; predict branches.
**Materials:** starter `snack-1`; branch cards (PRB-7).

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Human conditional: "IF you have a sibling, stand. ELSE, hands on head." Two more, faster. |
| 5–15 | Teach | Live: `let sugar = 12; if (sugar > 10) { … "whoa, sugary!" } else { … "not bad!" }`. Change `sugar`, re-run, watch the branch flip. Trace-table the condition: true or false? |
| 15–45 | Build | Mission: snack judge v0 — one `if/else` on a sugar variable, messages in their own voice. Core: working if/else. Stretch: judge two things (sugar AND your enthusiasm). |
| 45–55 | Reflect | Branch-prediction game with cards. Workbook fork-in-the-road page. |

### S2.2 Compare & Decide
**Objectives:** comparison operators; `else if` chains.
**Materials:** starter `snack-2`; operator reference card (PRB-7 back).

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Operator flash: `7 > 3`? `5 === 5`? `2 < 1`? — thumbs true/false. |
| 5–15 | Teach | The `=` trap: one `=` puts in the box, three `===` asks "same?". Then chains: if / else if / else = a ladder, first true rung wins. Live-build a 3-rung sugar ladder (low/medium/high). |
| 15–45 | Build | Students build their 3-rung rating ladder with their own thresholds and messages. Core: 3 branches working. Stretch: 4 rungs, or rate two nutrients. |
| 45–55 | Reflect | Ladder walk-throughs: partner gives a number, you point to the rung that fires. |

### S2.3 Functions With Inputs (Quiz Q3)
**Objectives:** parameters and return values.
**Materials:** Q3; starter `snack-3`.

| Time | Phase | Plan |
|------|-------|------|
| 0–10 | Quiz Q3 | Conditionals & comparisons. |
| 10–15 | Re-teach | `=` vs `===` — the classic; re-trace it. |
| 15–45 | Build | Teach-in-build: the function machine gets a slot — `function rate(sugar) { … return "low"; }`. Feed it different values, it answers. Students convert their ladder into `rate(sugar)` and call it with several inputs. Core: parameterized function returning a rating. Stretch: second parameter (`rate(sugar, fibre)`). |
| 45–55 | Reflect | Function-machine drawings: label input slot, job, output chute. |

### S2.4 Building the Calculator
**Objectives:** full assembly; reading nutrition-style numbers.
**Materials:** starter `snack-full` (input fields wired to a stub); snack fact cards (PRB-8).

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Read a real-style nutrition label together: find sugar per serving. (Financial-literacy seed: unit amounts.) |
| 5–15 | Teach | Assembly map on the board: input field → variable → `rate()` → message on page. Model one full path. |
| 15–45 | Build | Students connect their `rate()` to the page inputs and display advice. Test with the snack fact cards (real-ish numbers). Core: end-to-end working calculator. Stretch: advice includes a swap suggestion ("try the yogurt instead"). |
| 45–55 | Reflect | Calculator exchange: rate a snack your partner picks. Goal for demo. |

### S2.5 Calculator demo (Quiz Q4)
**Objectives:** finish; demo; explain one code decision.
**Materials:** Q4; rubric; Home Link.

| Time | Phase | Plan |
|------|-------|------|
| 0–10 | Quiz Q4 | Parameters/returns + integration. |
| 10–15 | Re-teach | Most-missed, live. |
| 15–45 | Build | Polish + rehearse: demo a snack rating live and *narrate the branch* ("12 grams, so this rung fires"). Rubric scoring. |
| 45–55 | Reflect | Demos + warm feedback. "Your code made a decision today. Next semester: hundreds of decisions." |

---

## Semester 3 — Fact or Fake? Media-Literacy Quiz

### S3.1 Question Everything
**Objectives:** apply the 3 source-checking questions; sort real vs. fake examples.
**Materials:** headline cards (PRB-9); checker poster.

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Instructor reads an absurd-but-plausible "headline". Thumbs: real or fake? Reveal: you can't tell from the headline alone — that's the point. |
| 5–15 | Teach | The 3 checker questions: **Who made it? What's the evidence? What do others say?** Walk one real and one fake headline card through all three. |
| 15–45 | Build | Pairs sort headline cards with the checker sheet; must justify each verdict with a question, not a feeling. Then: plan quiz topics — each student lists 3 fact/fake pairs they *think* they know (verification comes S3.4). |
| 45–55 | Reflect | "Which card fooled you? Which question saved you?" |

> **📌 Teacher Note:** keep examples age-safe and non-political (animals, space, food, sports records). The skill is the checking habit, not the topic.

### S3.2 Lists in Code
**Objectives:** create arrays; index access; add items.
**Materials:** starter `quiz-1`; index cards (literal ones).

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | "How would you store 20 quiz questions — twenty variables?! There must be a better way." |
| 5–15 | Teach | `let questions = ["...", "...", "..."]` — one box with numbered compartments, **starting at 0** (say it three times, it still surprises them). Access `questions[0]`; `push` to add. Human array: 5 kids hold cards, class calls indexes. |
| 15–45 | Build | Console missions: build an array of your 3 planned questions; access each by index; push a 4th; make a parallel `answers` array (true/false). Core: both arrays working. Stretch: array of snack ratings from S2 — arrays hold anything. |
| 45–55 | Reflect | Index-0 gotcha check: "who got tricked? Everyone. Welcome to programming." |

### S3.3 Loop the Loop (Quiz Q5)
**Objectives:** loop over arrays; trace iterations.
**Materials:** Q5; starter `quiz-2`; trace tables.

| Time | Phase | Plan |
|------|-------|------|
| 0–10 | Quiz Q5 | Arrays & indexing. |
| 10–15 | Re-teach | Index-counting re-trace. |
| 15–45 | Build | Teach-in-build: the loop visits every compartment — `for` loop over `questions`, printing each. Trace table: `i` = 0, 1, 2… Students loop-print their arrays, then loop-check answers against a guess. Core: loop prints all questions. Stretch: loop counts how many answers are "fake". |
| 45–55 | Reflect | Loop-trace relay on the board. "Loops do the boring part; you do the thinking part." |

### S3.4 Building the Quiz
**Objectives:** assemble the game; verify every question.
**Materials:** starter `quiz-full` (ask/answer UI stubbed); verification sheet (PRB-9 back); supervised reference materials.

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | The 3 checker questions, chanted. Today they get real: *your* quiz must survive checking. |
| 5–15 | Teach | Assembly map: question array + loop + `score` variable + if/else feedback per answer. Model one round. **Verification rule:** every "fact" needs a source note; every "fake" needs a one-line why-it's-fake. |
| 15–45 | Build | Build the engine; verify questions with the sheet (supervised reference materials/printed sources). Core: 5 verified questions, working loop + score. Stretch: final-score messages by conditional bands. |
| 45–55 | Reflect | Trade one question with a partner for a verification audit. |

### S3.5 Quiz arcade (Quiz Q6)
**Objectives:** play, present, reflect on being fooled.
**Materials:** Q6; rubric; Home Link.

| Time | Phase | Plan |
|------|-------|------|
| 0–10 | Quiz Q6 | Loops + media literacy. |
| 10–15 | Re-teach | Loop-trace the miss. |
| 15–45 | Build | Arcade: rotate through classmates' quizzes; tally "nearly fooled me" moments. Rubric scoring during rotations. |
| 45–55 | Reflect | Circle: "the fake that nearly got me — and the checker question that catches it." Home Link (family fact-check game) goes home. |

---

## Semester 4 — Budget Buddy

### S4.1 Money In, Money Out
**Objectives:** earning/saving/spending; needs vs. wants; plan the Buddy.
**Materials:** scenario cards (PRB-10); planner (workbook p. S4.1).

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | "You have $20 and a Saturday. Go." — collect plans, no judging yet. |
| 5–15 | Teach | Money flows: in (allowance, gifts, jobs) and out (spending). Needs vs. wants sort — fast, honest, funny. A **budget** is a plan so money does what YOU choose. Show the Buddy vision: list expenses → see totals → get alerts → hit a goal. |
| 15–45 | Build | Scenario card work: each pair budgets a scenario (class-trip snacks, pet fund, gift for grandma) on paper — income, expenses, the choice moment. Then plan their own Buddy scenario on the planner. |
| 45–55 | Reflect | "Where in your scenario would an ALERT have helped?" |

### S4.2 The Running Total
**Objectives:** accumulate totals by looping an expense array.
**Materials:** starter `budget-1`; trace tables.

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Mental accumulate: "start at 0: +4, +7, +2 — where are you?" That's the pattern. |
| 5–15 | Teach | The accumulator: `let total = 0; for (…) { total = total + expenses[i]; }` — trace it fully, one row per loop turn. This line is S1's `count = count - 1` all grown up. |
| 15–45 | Build | Students code their scenario's expense array + loop total + display. Core: correct loop-computed total. Stretch: separate totals for needs vs. wants (two arrays or a tag check). |
| 45–55 | Reflect | Pair-verify: paper-math the total, does the code agree? (If not — Error Detective!) |

### S4.3 Budget Alerts (Quiz Q7)
**Objectives:** conditional alerts; compound conditions.
**Materials:** Q7; starter `budget-2`.

| Time | Phase | Plan |
|------|-------|------|
| 0–10 | Quiz Q7 | Accumulation + conditionals. |
| 10–15 | Re-teach | Accumulator re-trace. |
| 15–45 | Build | Teach-in-build: thresholds — `if (total > budget)` → "over budget!"; `else if (total > budget * 0.8)` → "getting close…". Compound: `if (total > budget && daysLeft > 3)`. Students add 2+ alerts in their own voice ("Whoa there, wallet!"). Core: 2 alerts firing correctly. Stretch: a compound-condition alert. |
| 45–55 | Reflect | Alert theatre: partner enters expenses until your alerts fire. |

### S4.4 Building Budget Buddy
**Objectives:** full assembly with savings goal.
**Materials:** starter `budget-full` (input UI stubbed).

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Needs/wants lightning sort, banker voice optional. |
| 5–15 | Teach | Assembly map: add-expense input → array → loop total → alerts → goal tracker (`goal - total = to go`). Model the add-expense path once. |
| 15–45 | Build | Assemble end-to-end; test with the scenario cards' numbers. Core: add expenses, see total + alerts + goal progress. Stretch: "afford it?" checker (`price <= goal - total`). |
| 45–55 | Reflect | Self-check vs. success criteria; goal for demo day. |

### S4.5 Buddy demo (Quiz Q8)
**Objectives:** demo with a realistic scenario; name the smarter decision.
**Materials:** Q8; rubric; Home Link + capstone note.

| Time | Phase | Plan |
|------|-------|------|
| 0–10 | Quiz Q8 | Whole-year integration. |
| 10–15 | Re-teach | Class-choice replay. |
| 15–45 | Build | Polish + rehearse: live scenario demo, narrating the loop and the alert branch. Rubric scoring. |
| 45–55 | Reflect | Demos: "My Buddy helps you decide ___ ." Capstone teaser: "Next, YOU pick the problem." |

---

## Capstone — Problem-Solver App

### C.1 Find Your Problem
**Objectives:** pick a real personal problem; spec it; build the core.
**Materials:** problem-solver planner (PRB-11); problem-hunt cards for the stuck.

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | "What bugs you every week? Chores? Remembering library books? Sharing the good controller fairly?" — the wall of problems. |
| 5–15 | Teach | The brief: *a real problem in YOUR life, solved with an interactive JavaScript app.* Planner spec: the problem → who has it → what the app does → which tools it needs (variables? events? conditionals? arrays?). Requirement bar shown (mirrors rubric). Two past examples as sparks, then hidden. |
| 15–45 | Build | Spec (10 min cap) → build the core loop of the app. Instructor coaches with questions only ("what changes? that's your variable. what triggers it? that's your event."). |
| 45–55 | Reflect | Stand-up: "My problem is ___ . My app will ___ ." |

### C.2 Ship & Show
**Objectives:** finish; user-test; present at family showcase.
**Materials:** user-test sheet (PRB-12); frames (PRB-13); certificates (PRB-17, AM §9); rubric.

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Ship checklist on the board: works? tested? can you demo the chain? |
| 5–15 | Teach | **User test protocol:** trade apps; user tries it cold while builder watches silently; user answers 2 questions (What was it for? What confused you?). One fix from feedback. |
| 15–45 | Build | User tests → one fix → rehearse the pitch frame: "The problem… My solution… Watch… What I'd add next…" Capstone rubric scoring; showcase stations set. |
| 45–55 | Reflect | **Family showcase:** live demos with the frame; certificates presented. |

---

## Troubleshooting quick table

| Problem | Likely cause | Fix |
|---------|--------------|-----|
| "X is not defined" | Typo/case or function not created yet | Error Detective step 1: match names exactly |
| Nothing happens on click | Event not wired / function name mismatch | Trace the chain: click → which function? |
| Condition never fires | `=` instead of `===`, or threshold logic | Read the condition aloud as a question |
| Loop runs forever / not at all | Bad start/stop/step | Trace table, three rows minimum |
| Off-by-one array errors | Index starts at 0 | Human-array replay |
| Console error wall panics a child | Errors read as failure | Reframe: "the console is giving you a clue — read it like a detective" |

## Homework guidance

No required homework. Home Links are family-scale: estimate-then-check totals at the grocery store (S4); the fact-check dinner game (S3); "spot the variables" in board games (S1). The class playground may be used at home optionally; keep sessions ~30 min.

## Parent talking points (pickup)

- "Ask them what a variable is — expect the labelled-box speech."
- "They wrote code today that made a decision by itself."
- "Try them: 'is that headline real? How would you check?'" (S3)
- "Have them narrate the Budget Buddy alert — it's their own words." (S4)

## Closure script (every session)

"Developers, save and close… Trace it with me: click → function → variable → display. Goal's on the board. You built tools today — Dream. Code. Achieve!"

## Revision history

| Version | Date | Author role | Change |
|---------|------|-------------|--------|
| 1.0 | 2026-07-14 | Senior Instructional Designer | First published edition |
