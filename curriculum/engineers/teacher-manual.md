# Engineers Teacher Manual
**Document ID:** CSA-ENG-TM-EN-v1.0 · **Program:** Engineers (Grades 6–8) · Companion to CSA-ENG-MCM-EN

---

## How to use this volume

One block per session: objectives, materials, minute-by-minute plan, callouts. Timing: Warm-up 5 → Teach 10 → Build 30 → Reflect 10; quiz days (x.3, x.5): Quiz 10 → Re-teach 5 → Build 30 → Reflect 10. References: workbook CSA-ENG-SW-EN, printables CSA-ENG-PRB-EN, quizzes CSA-ENG-AM-EN. 💻 = online adaptation.

**Preparation checklist (every session):** room/tech per OPS §2 · Python environment + starter staged · reference cards on desks · printable copied · dataset/model assets staged for the unit · fallback packed.

> **📌 Teacher Note (program-wide):** teach Engineers like junior colleagues — real terminology, real trade-offs, real "we don't know yet"s. Live-code with errors left in; think aloud while reading tracebacks.

> **⚠️ Safety rails (non-negotiable):** no real passwords ever (S1); no personal data in datasets, models, or bots (all semesters); no offensive-technique instruction — defence and understanding only; AI ethics discussions stay concrete and age-appropriate.

---

## Semester 1 — Password Strength Checker

### S1.1 Hello, Python / Know Your Enemy
**Objectives:** first Python (`print`, `input`, variables); how passwords actually fall (concepts).
**Materials:** starter `checker-1`; diagnostic sheet (AM §3); "how accounts get cracked" story cards (PRB-1).

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | "Raise a hand if an account you know of ever got 'hacked'. What do you think actually happened?" — collect theories. |
| 5–15 | Teach | Reality check with story cards: most break-ins are guessing (common passwords), reuse after leaks, or tricking you (phishing) — not movie hacking. Then: our defence tool needs a language. Live Python: `print("hello")`, `name = input(...)`, f-string reply. |
| 15–45 | Build | **Diagnostic** (10 min, AM §3). Then console missions: variables, input/print round-trips, first traceback read-aloud. Core: input→transform→print program. Stretch: multi-question mini-interview program. |
| 45–55 | Reflect | "One thing about 'hacking' you now believe differently." Workbook myth/fact page. |

> **⚠️ Watch For:** war stories about breaking into things → redirect to defence framing immediately (see safety rails).

### S1.2 Strings & Secrets
**Objectives:** string operations; what makes passwords weak.
**Materials:** starter `checker-2`; weak-password gallery (PRB-1 back — famous *published* worst-passwords list).

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Guess the top 3 most-common passwords ever leaked. Reveal ("123456", "password"…) — laughter, then the point: guessable = gone. |
| 5–15 | Teach | Strings live-coded: `len(pw)`, `"cat" in pw`, `pw.lower()`. Weakness anatomy: short, common word, personal info, no variety. Test strings only — never real passwords (say it, post it). |
| 15–45 | Build | Missions on test strings: measure lengths, detect common words from a list, check for digits. Core: 3 string checks working. Stretch: check against a small "banned list" with a loop preview. |
| 45–55 | Reflect | "Which check would catch YOUR old habits?" (no specifics allowed — that's the discipline). |

### S1.3 Rules of Strength (Quiz Q1)
**Objectives:** conditionals for rules; combining with `and`/`or`.
**Materials:** Q1; starter `checker-3`; rule cards (PRB-2).

| Time | Phase | Plan |
|------|-------|------|
| 0–10 | Quiz Q1 | Python basics & strings. |
| 10–15 | Re-teach | Most-missed, re-traced live. |
| 15–45 | Build | Teach-in-build: `if len(pw) < 12: print("too short")`; combine: `if len(pw) >= 12 and has_digit:`. Students implement 4 rules from the rule cards (length, digit, mixed case, no banned words). Core: 4 rules firing correctly on test strings. Stretch: special-character rule; rule messages that explain *why*. |
| 45–55 | Reflect | Rule defence: each pair justifies one rule aloud ("length beats cleverness because…"). |

### S1.4 Functions & Scoring
**Objectives:** scoring function with loop; verdict bands.
**Materials:** starter `checker-4`.

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Trace: score starts 0, +1 per rule passed, 4 rules — max score? |
| 5–15 | Teach | Wrap rules into `def strength(pw):` — loop over checks, accumulate score, return verdict by bands (0–1 weak / 2–3 okay / 4+ strong). Trace one call fully. |
| 15–45 | Build | Students build `strength()` and a test loop over a provided test-string list, printing verdicts. Core: function + bands working. Stretch: weighted scoring (length worth more); passphrase suggestion generator (random word combos from a safe word list). |
| 45–55 | Reflect | "What would fool your checker?" — collect adversarial ideas for launch day. |

### S1.5 Checker launch + Safety Audit (Quiz Q2)
**Objectives:** finish & demo; personal digital-safety audit (concepts).
**Materials:** Q2; safety audit sheet (PRB-3); rubric; Home Link (PRB-6).

| Time | Phase | Plan |
|------|-------|------|
| 0–10 | Quiz Q2 | Conditionals, functions, security concepts. |
| 10–15 | Re-teach | Verdict-band trace from misses. |
| 15–45 | Build | Polish + adversarial testing (trade checkers, try to sneak a weak test-string past). Then the **Safety Audit** (paper, private, taken home unread by us): do I reuse passwords? do I know what phishing looks like? is my recovery info set? — checkbox concepts only. Rubric scoring during circulation. |
| 45–55 | Reflect | Demos: rule + why. "You now write Python that protects people. Next: machines that learn." Home Link goes home. |

---

## Semester 2 — Smart Sorting AI

### S2.1 How Machines Learn
**Objectives:** rules-coded vs. learned-from-examples; spot training data in daily AI.
**Materials:** two-jar sorting demo props; AI-in-your-day cards (PRB-7).

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | "How does your phone's photo app find 'dog pictures'? Someone wrote `if fur…`? Really?" |
| 5–15 | Teach | The two ways to teach a machine: RULES (we write them — that was S1) vs. EXAMPLES (it finds patterns — machine learning). Human demo: show 6 labelled doodles, class infers the rule; that inference is what a model does — from data, not understanding. |
| 15–45 | Build | Card sort: which everyday AI is rules vs. learned? (autocorrect, face unlock, spam filter, video recommendations). Then plan the class sorter: pick 2–3 categories (e.g., recycling photos: paper/plastic/metal, or drawings: cat/dog) and start gathering training examples (class-created images/drawings — no personal photos). |
| 45–55 | Reflect | "Where did today's AI get its examples? Who chose them?" — leave it hanging (S2.4 pays it off). |

### S2.2 Train Your First Model
**Objectives:** train a classifier; make predictions; read confidence.
**Materials:** ML trainer on all devices; example sets from S2.1 topped up by instructor pack.

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Predict: "if we show it something it's never seen, what happens?" Theories on the board. |
| 5–15 | Teach | Live: create classes, feed examples, train, predict — narrate the trainer's parts (classes = labels, samples = training data, the % = confidence, not certainty). |
| 15–45 | Build | Teams (trainer/tester/recorder roles) train their sorter on gathered examples; probe it with new inputs; record hits/misses in the workbook log. Core: trained model + 10 recorded predictions. Stretch: a "confuser" input designed to sit between classes. |
| 45–55 | Reflect | Warm-up theories revisited: who called it? Confidence ≠ correctness examples from logs. |

### S2.3 Trust but Verify (Quiz Q3)
**Objectives:** held-back test sets; simple accuracy.
**Materials:** Q3; evaluation sheets (PRB-8).

| Time | Phase | Plan |
|------|-------|------|
| 0–10 | Quiz Q3 | ML concepts & training. |
| 10–15 | Re-teach | Training-vs-test data with the jar props. |
| 15–45 | Build | The professional move: hold back examples the model never saw. Teams build a 10-item test set, run it, compute accuracy (right/total) on the sheet. Compare team accuracies — why different? (data amount, variety, blur…). Core: accuracy computed honestly. Stretch: per-class accuracy — is it better at paper than metal? |
| 45–55 | Reflect | "Would you trust your model in a real recycling plant at ___%? What % would be enough?" — no right answer, real engineering. |

### S2.4 The Bias Experiment
**Objectives:** cause and observe bias via skewed data; state the inheritance principle.
**Materials:** skew-kit example packs (PRB-9: e.g., "cats = only orange cats" sets).

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | "Your model is only as fair as ___?" — collect endings. |
| 5–15 | Teach | Today we *break* a model on purpose. Demo: train cats-vs-dogs where every cat example is orange → show it a black cat → watch it fail. The model didn't learn "cat"; it learned "orange". **The data's blind spots become the model's blind spots.** Real-world echoes, age-appropriate: face systems that fail some skin tones; voice systems that miss some accents. |
| 15–45 | Build | Teams run the skew experiment on their own sorter (skew one class per the kit), document the failure, then FIX it: rebalance with varied examples, retrain, re-test with S2.3's method. Core: failure demonstrated + accuracy before/after recorded. |
| 45–55 | Reflect | Circle: "Who gets hurt when real systems have blind spots? Whose job is it to catch them?" (Answer we land on: the people who build them. Us.) |

### S2.5 Findings brief (Quiz Q4)
**Objectives:** retrain well; present findings like an ML team.
**Materials:** Q4; findings brief frame (PRB-8 back); rubric; Home Link.

| Time | Phase | Plan |
|------|-------|------|
| 0–10 | Quiz Q4 | Evaluation & bias. |
| 10–15 | Re-teach | Accuracy math from misses. |
| 15–45 | Build | Teams finalize models and complete the findings brief: what we trained · how we tested · what broke · how we fixed it · what we'd never trust it to do. Rubric scoring. |
| 45–55 | Reflect | Briefs presented (2 min/team) + "I wonder" questions. "You just did what real AI teams do — including the honest part." |

---

## Semester 3 — Chatbot for Good

### S3.1 Bots Among Us
**Objectives:** rule-based vs. learned bots; choose a helpful purpose.
**Materials:** bot transcript cards (PRB-10); purpose planner (workbook p. S3.1).

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | "Where did you talk to a bot this month?" (game NPCs, help widgets, voice assistants). |
| 5–15 | Teach | Transcript autopsy: which replies are canned rules, which feel learned? Our build: rule-based in Python — we choose every word it can say (that's a responsibility superpower: nothing unvetted comes out). The brief: a bot that genuinely helps someone. |
| 15–45 | Build | Purpose workshop: brainstorm → pick (homework helper, kindness bot, recycling guide, new-kid school FAQ…) → planner: who it helps, 5 things they'd ask, best answers. Bot-name and personality sketch. |
| 45–55 | Reflect | One-line pitches: "My bot helps ___ when they ___." |

### S3.2 Talk to Me
**Objectives:** input loop + keyword matching + responses.
**Materials:** starter `bot-1`.

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Human bot: instructor answers ONLY on keywords ("homework" → canned reply) — class reverse-engineers the rules. |
| 5–15 | Teach | Live-build the skeleton: `while` loop, `input()`, `if "homework" in message.lower():` → reply, `"bye"` to exit. Case-normalize everything (the classic bug, shown live). |
| 15–45 | Build | Students build their loop with 3 keyword intents from their planner. Core: 3 intents + exit. Stretch: multi-keyword intents (`"sad" or "upset"`). |
| 45–55 | Reflect | Pair chats with each other's bots; note the first "it didn't understand me" — tomorrow's problem. |

### S3.3 Smarter Answers (Quiz Q5)
**Objectives:** dictionary-organized intents; graceful fallback.
**Materials:** Q5; starter `bot-2`.

| Time | Phase | Plan |
|------|-------|------|
| 0–10 | Quiz Q5 | Loops, keywords, bot structure. |
| 10–15 | Re-teach | Case-normalization or loop-exit misses. |
| 15–45 | Build | Teach-in-build: the if-forest becomes a dictionary `intents = {"homework": "...", ...}` + lookup loop; add the fallback ("I don't know that yet — try…" + suggestions). Fallbacks are honesty in code. Core: dictionary-driven bot + fallback. Stretch: randomized reply variants; a "help" intent listing abilities. |
| 45–55 | Reflect | "What does your bot do when it doesn't know? What do the best people do?" |

### S3.4 The Responsibility Review
**Objectives:** run the Responsible AI checklist; fix one finding.
**Materials:** Responsible AI checklist (PRB-11).

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | "A homework-helper bot answers a question wrong and a kid fails the quiz. Whose fault?" — debate spark. |
| 5–15 | Teach | The checklist, walked on a demo bot: WHO does it help? WHO could it harm (wrong answers, hurt feelings, bad advice)? WHAT data does it touch (names? worries?) — and does it need to? Does it FAIL SAFELY (fallback, no fake expertise)? Is it HONEST that it's a bot? |
| 15–45 | Build | Students run the checklist on their own bot, log findings, and fix at least one (add disclosure line, soften an over-confident answer, route serious topics to "ask a trusted adult", drop stored names). |
| 45–55 | Reflect | Findings share: the most surprising thing the checklist caught. |

> **⚠️ Watch For:** bots drifting into advice-giving on serious topics (health, safety, feelings-in-crisis). Standard fix, taught as professional practice: serious topics get a "talk to a trusted adult" route — bots know their limits.

### S3.5 Bot demo day (Quiz Q6)
**Objectives:** user-test; present bot + responsibility review.
**Materials:** Q6; user-test sheets (PRB-12); rubric; Home Link.

| Time | Phase | Plan |
|------|-------|------|
| 0–10 | Quiz Q6 | Dictionaries, fallbacks, responsible AI. |
| 10–15 | Re-teach | Dictionary-lookup trace from misses. |
| 15–45 | Build | User-test rotations (tester tries 5 real questions; builder logs hits/fallbacks); one improvement made live. Rubric scoring. |
| 45–55 | Reflect | Presentations: bot demo + one line from the responsibility review ("my bot could harm by ___, so I ___"). |

---

## Semester 4 — Data Detective

### S4.1 Questions First
**Objectives:** investigable questions; CSV structure; first load.
**Materials:** dataset packs (PRB-13); starter `data-1`.

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | "Data never speaks first. Detectives ask, THEN look. Wrong: 'here's weather data.' Right: 'is October really our rainiest month?'" |
| 5–15 | Teach | CSV anatomy on screen: rows = records, columns = facts, header = names. Load in Python (starter's `load_csv` helper), print row count, peek at rows. |
| 15–45 | Build | Teams pick a dataset pack, browse structure, write 3 investigable questions on the case-file sheet (must be answerable from the columns!), load and explore. Core: loaded + 3 valid questions. Stretch: spot a column that could mislead (units? missing values?). |
| 45–55 | Reflect | Question exchange: is your partner's question answerable from these columns — or a wish? |

### S4.2 Compute the Truth
**Objectives:** count, sum, mean, min/max with loops.
**Materials:** starter `data-2`; trace tables.

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Accumulator trace warm-up (they've met it if they came from Developers; fresh trace if not — no assumption). |
| 5–15 | Teach | Live: loop a column → count, total, mean = total/count; min/max with a "best so far" variable. Sanity-check culture: does 4 500 °C look right for Toronto? No? Hunt the bug. |
| 15–45 | Build | Teams compute the stats their questions need. Core: mean + min/max on one column, sanity-checked. Stretch: median discussion; multiple columns. |
| 45–55 | Reflect | "One number that surprised you + whether you trust it yet." |

### S4.3 Group & Compare (Quiz Q7)
**Objectives:** group by category; compare; meet outliers.
**Materials:** Q7; starter `data-3`.

| Time | Phase | Plan |
|------|-------|------|
| 0–10 | Quiz Q7 | CSVs & aggregation. |
| 10–15 | Re-teach | Mean-math or loop misses. |
| 15–45 | Build | Teach-in-build: split by category (dictionary of running totals — S3's dictionaries return!), compare group means. Outliers: the weird point isn't wrong, it's a *question* ("why did THAT month spike?"). Core: one grouped comparison. Stretch: outlier hunt with a hypothesis. |
| 45–55 | Reflect | Detective board: each team posts their most interesting comparison so far. |

### S4.4 Show, Don't Tell
**Objectives:** honest charts; honest headlines.
**Materials:** starter `data-4` (simple chart helper); misleading-graph gallery (PRB-14).

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Misleading-graph gallery: "what is this chart trying to make you feel? What's the trick?" (truncated axis, cherry-picked range). Media literacy meets data. |
| 5–15 | Teach | Chart the S4.3 comparison live: bars for categories, line for time. Honest rules: axis starts at zero (or says why not), labels everything, headline states the finding without stretching it. |
| 15–45 | Build | Teams chart their key finding + draft two headlines: one honest, one clickbait — then keep the honest one (writing both teaches the difference). Core: one labelled chart + honest headline. Stretch: second chart; a caveat line ("only 3 years of data"). |
| 45–55 | Reflect | Chart swap: "what does my chart say?" — if the reader misreads it, revise. |

### S4.5 Insight report day (Quiz Q8)
**Objectives:** full report: question → evidence → insight → caveat.
**Materials:** Q8; report frame (PRB-13 back); rubric; Home Link + capstone note.

| Time | Phase | Plan |
|------|-------|------|
| 0–10 | Quiz Q8 | Whole-year integration. |
| 10–15 | Re-teach | Class-choice replay. |
| 15–45 | Build | Assemble reports; rehearse 2-minute presentations. Rubric scoring. |
| 45–55 | Reflect | Reports presented. Capstone teaser: "Next, everything at once — pick a world problem and build your answer." |

---

## Capstone — Innovation Challenge (SDG prototype + pitch)

### C.1 Pick Your Problem, Build Your Proof
**Objectives:** choose an SDG angle; scope a prototype; build the core.
**Materials:** SDG cards (PRB-15); innovation planner (PRB-16).

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | SDG cards on tables: "which of these makes you angry, curious, or hopeful? Pick up the card." |
| 5–15 | Teach | The brief: a prototype + pitch addressing your SDG angle, using ≥2 skill families (Python tool / AI model / data analysis). Scope talk: a prototype PROVES the idea, it doesn't finish it — "water-waste tracker for one home" beats "fix the ocean". Planner: problem → who has it → my solution → skills used → demo plan. |
| 15–45 | Build | Scope (10 min hard cap, planner signed off by instructor) → build the core. Coach with questions; hold scopes small ruthlessly. |
| 45–55 | Reflect | Stand-up: SDG, problem, what my demo will show. |

### C.2 Pitch Day
**Objectives:** finish; ethics & security check; pitch to families/panel.
**Materials:** ethics & security check (PRB-11 capstone edition); pitch frame (PRB-16 back); certificates (PRB-17, AM §9); rubric.

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Pitch-day checklist on the board: demo works · check done · pitch timed. |
| 5–15 | Teach | Pitch anatomy (5 parts, ~2 min): the problem (make us care) → my solution → LIVE demo → impact (who it helps) → next steps (honest). Model a bad pitch (all features, no problem) vs. a good one. |
| 15–45 | Build | Ethics & security check run and signed · final fixes · timed rehearsals in pairs. Capstone rubric scoring; pitch stations set. |
| 45–55 | Reflect | **Pitch Day:** families (and community panel where arranged) hear every pitch. Certificates presented. Photos per consent rules. |

---

## Troubleshooting quick table

| Problem | Likely cause | Fix |
|---------|--------------|-----|
| SyntaxError wall | Missing `:`, unmatched quotes/parens | Read the traceback line number aloud; check line above too |
| IndentationError | Mixed/missing indents | "Indentation is grammar in Python" — re-indent the block |
| NameError | Typo/case or not yet defined | Match names exactly; defined before used? |
| Model seems "wrong" | Training data too few/too same | More + varied examples; retrain; re-test |
| Bot never matches | Case/punctuation in input | `.lower()` everything; check keyword actually in phrase |
| Stats look absurd | Wrong column, string-vs-number, units | Sanity-check culture: estimate first, then trust |
| Chart misleads | Truncated axis, unlabelled | Honest-chart rules checklist |

## Homework guidance

No required homework. Home Links: password-habit conversation (concepts only, S1); spot-the-AI-in-our-house hunt (S2); family bot test (S3); "estimate, then check" data game (S4). Optional at-home building on class-style browser tools, ~45 min sessions.

## Parent talking points (pickup)

- "Ask what actually gets accounts cracked — they know the real answer now." (S1)
- "Ask them to explain how their AI got biased — and how they fixed it." (S2)
- "Ask who their bot helps, and who it could hurt. They've genuinely thought about it." (S3)
- "Ask for their headline — and their caveat. The caveat is the impressive part." (S4)

## Closure script (every session)

"Engineers, commit your work — save and close. One line for the log: what did you prove today? Goal's on the board. Dream. Code. Achieve."

## Revision history

| Version | Date | Author role | Change |
|---------|------|-------------|--------|
| 1.0 | 2026-07-14 | Senior Instructional Designer | First published edition |
