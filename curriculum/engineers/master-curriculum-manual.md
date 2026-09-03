# Engineers Master Curriculum Manual
**Document ID:** CSA-ENG-MCM-EN-v1.0 · **Program:** Engineers (Grades 6–8) · **Coding space:** Python + AI + Cybersecurity · **Journey arc:** Achieve · **Accent colour:** #0D1B2A

---

## 1. Course overview

Engineers write Python, train and evaluate their own AI models with an eye on bias and ethics, analyze real data, and learn practical cybersecurity — culminating in a pitched prototype.

**Headline outcome (public promise):** *Codes in Python, trains an AI responsibly, and pitches a real tech solution.*

**Structure:** 4 semesters × 5 sessions + 2 capstone sessions = 22 × 55-minute sessions. 8 quizzes (2 per semester). One project per semester plus the capstone Innovation Challenge (a prototype addressing a UN Sustainable Development Goal, pitched). Session flow: Warm-up (5) → Teach (10) → Build (30) → Reflect (10) (→ CSA-STD-CF §4).

**Program skills (public promise):** Python logic & data · Training & evaluating an AI model · Bias & ethics in AI · Responsible AI · Data analysis · Real cybersecurity.

**Tools:** browser-based Python environment; no-code ML trainer (Teachable-Machine-style) for image/text classification; CSV/spreadsheet tooling for data work (→ CSA-STD-CF §10). All accounts class-managed.

**Alignment posture:** supports Ontario's coding and AI literacy expectations, maps to Alberta's Computer Science and CTF outcomes, and aligns with Québec's Cadre de référence de la compétence numérique (available in French — → CSA-STD-FR). *Not endorsed or approved by any ministry of education.*

## 2. Semester overviews

| Sem | Project | Big Idea (driving question) | Skills |
|-----|---------|----------------------------|--------|
| 1 | Password Strength Checker | Python logic can help protect people online. (*What makes us safe — or exposed — online?*) | Python logic & data, Real cybersecurity |
| 2 | Smart Sorting AI | AI models learn patterns from data — and inherit the biases in that data. (*What does it mean for a machine to "learn"?*) | Training & evaluating an AI model, Bias & ethics in AI |
| 3 | Chatbot for Good | Building AI responsibly means thinking about who it helps and who it might harm. (*Who does our AI serve — and who could it hurt?*) | Responsible AI, Training & evaluating an AI model |
| 4 | Data Detective | Real data analysis turns raw numbers into insight. (*What are the numbers actually saying?*) | Data analysis, Python logic & data |
| ★ | Capstone: Innovation Challenge | Engineers design a prototype addressing a UN Sustainable Development Goal and pitch it, combining Python, AI, and data skills. | All program skills + pitching |

## 3. Skills matrix

| Skill | S1 | S2 | S3 | S4 | Capstone |
|-------|----|----|----|----|----------|
| Python logic & data | ● introduce (variables, conditionals, functions, loops, strings) | ○ use | ● deepen (dictionaries, program structure) | ● deepen (files, aggregation) | ◆ apply independently |
| Real cybersecurity | ● introduce (passwords, phishing, privacy) | ○ revisit (data privacy) | ○ revisit (user data) | ○ revisit (data handling) | ◆ security check on prototype |
| Training & evaluating an AI model | | ● introduce | ● deepen | | ◆ optional component |
| Bias & ethics in AI | | ● introduce | ○ apply | ○ data ethics | ◆ ethics review required |
| Responsible AI | ○ seeded | ○ raised | ● introduce (framework) | ○ applied | ◆ applied to prototype |
| Data analysis | | ○ (model metrics) | | ● introduce | ◆ evidence for the pitch |
| Communication & pitching | ○ demo | ● findings brief | ○ user demo | ● insight report | ◆ full pitch |

## 4. Weekly progression — full session sequence

### Semester 1 — Password Strength Checker
*Big Idea: Python logic can help protect people online.*

| Code | Title | Objectives (students will…) | New vocabulary |
|------|-------|-----------------------------|----------------|
| S1.1 | Hello, Python / Know Your Enemy | run first Python (`print`, `input`, variables); describe how passwords actually get cracked (guessing, leaks, phishing — concepts only) | Python, variable, input/output, phishing |
| S1.2 | Strings & Secrets | manipulate strings (length, contains, case); state what makes passwords weak (short, common, personal) | string, `len()`, character |
| S1.3 | Rules of Strength **(Q1)** | write conditionals testing password rules; combine conditions | conditional, boolean, `and`/`or` |
| S1.4 | Functions & Scoring | build a scoring function with loops over the string; return a strength verdict | function, loop, score |
| S1.5 | Checker launch + Safety Audit **(Q2)** | complete and demo the checker; complete a personal digital-safety audit (concepts checklist, no real passwords ever entered) | (review week) |

**Project milestone:** working Password Strength Checker demoed S1.5. **Success criteria:** ≥4 rule checks; scoring function with loop; verdict bands; student can explain each rule's *why*. **Safety rule (absolute):** real passwords are never typed, shared, or discussed — test strings only.

### Semester 2 — Smart Sorting AI
*Big Idea: AI models learn patterns from data — and inherit the biases in that data.*

| Code | Title | Objectives | New vocabulary |
|------|-------|------------|----------------|
| S2.1 | How Machines Learn | contrast rules-coded vs. learned-from-examples; identify training data in everyday AI | machine learning, training data, model |
| S2.2 | Train Your First Model | train an image/text classifier on class-gathered examples; make predictions | class/label, prediction, confidence |
| S2.3 | Trust but Verify **(Q3)** | evaluate the model with held-back test examples; compute simple accuracy | test data, accuracy, evaluation |
| S2.4 | The Bias Experiment | deliberately train on skewed data and observe failure; explain "the model learns the data's blind spots" | bias, skewed data, representative |
| S2.5 | Findings brief **(Q4)** | retrain on improved data; present a findings brief (what we trained, how it failed, how we fixed it) | (review week) |

**Project milestone:** trained + evaluated + de-biased sorter with findings brief S2.5. **Success criteria:** model trained on own examples; tested with held-back data; a bias demonstrated and mitigated; brief uses the terms accuracy/bias correctly.

### Semester 3 — Chatbot for Good
*Big Idea: Building AI responsibly means thinking about who it helps and who it might harm.*

| Code | Title | Objectives | New vocabulary |
|------|-------|------------|----------------|
| S3.1 | Bots Among Us | distinguish rule-based vs. learned chatbots; choose a helpful purpose (homework helper, kindness bot, recycling guide…) | chatbot, rule-based, intent |
| S3.2 | Talk to Me | build a Python chatbot loop: input → keyword matching → response | keyword, response loop |
| S3.3 | Smarter Answers **(Q5)** | organize intents with dictionaries; handle "I don't understand" gracefully | dictionary, fallback |
| S3.4 | The Responsibility Review | run the Responsible AI checklist on their bot (who it helps / who it could harm / what data it touches / how it fails safely); fix one issue found | responsible AI, harm, transparency |
| S3.5 | Bot demo day **(Q6)** | user-test with classmates; present bot + its responsibility review | (review week) |

**Project milestone:** working chatbot + completed responsibility review S3.5. **Success criteria:** ≥5 intents with fallback; a genuinely helpful purpose; review honestly names a possible harm and its mitigation; bot discloses it's a bot.

### Semester 4 — Data Detective
*Big Idea: Real data analysis turns raw numbers into insight.*

| Code | Title | Objectives | New vocabulary |
|------|-------|------------|----------------|
| S4.1 | Questions First | form investigable questions; read a CSV's structure (rows/columns); load one in Python | dataset, CSV, row/column |
| S4.2 | Compute the Truth | compute count, sum, mean, min/max over columns with loops | mean, minimum/maximum, aggregate |
| S4.3 | Group & Compare **(Q7)** | group by category and compare; spot outliers and ask why | category, comparison, outlier |
| S4.4 | Show, Don't Tell | turn findings into simple charts (bar/line) and honest headlines; avoid misleading presentation | chart, axis, misleading graph |
| S4.5 | Insight report day **(Q8)** | present an insight report: question → evidence → insight → caveat | insight, caveat |

**Project milestone:** insight report presented S4.5. **Success criteria:** own question; correct computations over a real dataset; one comparison or grouping; a chart that honestly shows the finding; one stated caveat.

**Datasets:** curated class packs (weather history, school-appropriate sports stats, food/nutrition tables, endangered-species counts) — real numbers, age-safe topics, no personal data.

### Capstone — Innovation Challenge (SDG prototype + pitch)

| Code | Title | Objectives |
|------|-------|------------|
| C.1 | Pick Your Problem, Build Your Proof | choose a UN Sustainable Development Goal angle they care about; scope a prototype (Python tool, AI model, data analysis, or combination); build the core with the innovation planner |
| C.2 | Pitch Day | finish the prototype; run the ethics/security check; deliver the pitch (problem → solution → demo → impact → next steps) to families/panel |

**Success criteria:** prototype addresses a specific SDG-linked problem; uses ≥2 program skill families (Python logic, AI model, data analysis); ethics & security check completed; pitch delivered with a demo and an honest "what's next".

## 5. Timing, materials, and classroom preparation

- **Timing:** standard four-phase flow; quiz sessions (x.3, x.5) open with the 10-minute quiz (→ CSA-ENG-AM-EN).
- **Materials:** keyboard devices with browser Python + ML trainer + dataset packs staged; instructor demo + display; printed reference cards (Python syntax, Responsible AI checklist); workbooks; printables (→ CSA-ENG-PRB-EN).
- **Preparation:** room per CSA-STD-OPS §2; per-session starter code staged; S2 requires example-image/text collections prepared (class-sourced, consent-safe); S4 dataset packs loaded; fallback pack ready.

## 6. Teacher notes (program level)

> **📌 Teacher Note:** Grades 6–8 can smell inauthenticity — the fastest way to lose them is toy problems with fake stakes. Every semester here has real stakes: their security (S1), AI they've watched fail (S2), users they know (S3), true numbers (S4), a goal they chose (capstone).

> **⚠️ Watch For:** cybersecurity teaching must never drift into attack tutorials. We teach *defence and understanding*: how attacks work conceptually so students can protect themselves — never step-by-step offensive technique. Redirect "how do I hack X" to "how would you defend X" every time.

> **🤝 Every Learner:** lighter-load = scaffolded starter code with TODO gaps; stretch = printed challenge lists per session. Group roles in AI/data sessions (trainer, tester, recorder) let non-typists lead. Ethics discussions honour multiple viewpoints — grade reasoning, never opinions.

## 7. Parent communication schedule

Standard cadence (→ CSA-STD-CF §5): Parent Handbook at enrolment (CSA-ENG-PH-EN); Home Links x.1/x.5; rubric + warm feedback per project; pitch-day invitation before C.2 (families + optional community panel).

## 8. Assessment references

Diagnostic ("First Voyage" logic + typing + AI-conceptions scan) S1.1; quizzes Q1–Q8; semester + capstone rubrics in CSA-ENG-AM-EN; certificate criteria AM §9.

## 9. Cross references

→ CSA-ENG-TM-EN · CSA-ENG-SW-EN · CSA-ENG-AM-EN · CSA-ENG-PM-EN · CSA-ENG-PRB-EN · CSA-ENG-PH-EN · CSA-ENG-QRG-EN · French availability: CSA-STD-FR.

## 10. Revision history

| Version | Date | Author role | Change |
|---------|------|-------------|--------|
| 1.0 | 2026-07-14 | Chief Curriculum Architect | First published edition |
