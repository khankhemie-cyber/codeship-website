# Engineers Project Manual
**Document ID:** CSA-ENG-PM-EN-v1.0 · **Program:** Engineers (Grades 6–8)

Standard template per CSA-STD-PUB §8; rubrics in CSA-ENG-AM-EN §6–7. Safety rails (CSA-ENG-TM-EN header) apply to every project.

---

## Project 1 — Password Strength Checker (Semester 1)

- **Overview:** a Python tool that scores password strength against student-implemented rules and returns a verdict with explanations — Python logic in service of protecting people online.
- **Objectives / outcomes:** Python fundamentals (variables, strings, conditionals, functions, loops); real cybersecurity concepts (how accounts actually fall: guessing, reuse, phishing).
- **Required skills by launch:** string operations (S1.2), compound conditionals (S1.3), scoring function + loop (S1.4).
- **Materials:** browser Python + `checker` starters; rule cards; published worst-passwords list; test-string sets.
- **Timeline:** basics S1.1–S1.2 → rules S1.3 → scoring S1.4 → launch + safety audit S1.5.
- **Teacher guide:** the hook is agency — "you can measure what keeps you safe." Enforce the absolute rule from minute one: **real passwords are never typed, spoken, or hinted at**; all testing on provided test strings. Keep the security framing defensive; redirect any offensive curiosity to "how would you defend it?" The adversarial-testing session (trading checkers and trying to sneak weak strings past) is the debugging highlight — keep it playful and rigorous.
- **Student instructions:** "Build a checker with at least four rules you can defend out loud. Score with a function, verdict in bands, and explain the *why* of every rule. Test strings only — that's professional discipline."
- **Extensions:** special-character rule; weighted scoring; passphrase suggester from a safe word list.
- **Presentation guide:** live demo on test strings + "my strongest rule and why".
- **Example outcomes:** 4-rule checker with weak/okay/strong bands; weighted checker that explains each deduction.
- **Common challenges:** boolean logic tangles (`and`/`or` truth-tables on the board); students naming real passwords (stop, reset norm, no drama); indentation errors (grammar framing).

## Project 2 — Smart Sorting AI (Semester 2)

- **Overview:** a team-trained image/text classifier taken through the full professional loop: train → test honestly → break it with biased data on purpose → fix it → publish findings.
- **Objectives / outcomes:** training & evaluating an AI model; accuracy on held-back tests; bias as inherited from data; honest reporting.
- **Required skills:** rules-vs-ML distinction (S2.1), training (S2.2), evaluation (S2.3), bias experiment (S2.4).
- **Materials:** no-code ML trainer; class-created example sets (drawings/objects — never personal photos); skew kits; evaluation sheets; findings brief frames.
- **Timeline:** concepts S2.1 → trained S2.2 → evaluated S2.3 → broken & fixed S2.4 → findings brief S2.5.
- **Teacher guide:** the bias experiment is the program's ethical centrepiece — let the model fail *visibly* before naming the principle ("the data's blind spots become the model's blind spots"), then connect to real systems age-appropriately (face/voice systems failing groups of people). Team roles (trainer/tester/recorder) rotate daily. Guard scientific honesty: accuracies are reported as measured, never massaged.
- **Student instructions:** "Train it, test it on examples it's never seen, then break it on purpose and fix what you broke. Your findings brief tells the whole truth — including what you'd never trust it to do."
- **Extensions:** per-class accuracy; a third category; confuser inputs and what they reveal.
- **Presentation guide:** 2-minute team findings brief: trained / tested / broke / fixed / limits.
- **Example outcomes:** recycling-photo sorter (paper/plastic/metal) with before/after bias accuracy; cat/dog drawing classifier that "learned orange".
- **Common challenges:** treating confidence as correctness (log real counterexamples); too-few examples (set minimums per class); teams hiding failures (celebrate the best documented failure publicly).

## Project 3 — Chatbot for Good (Semester 3)

- **Overview:** a rule-based Python chatbot with a genuinely helpful purpose, built with a dictionary of intents and a graceful fallback — then audited with the Responsible AI checklist and improved from real user tests.
- **Objectives / outcomes:** responsible AI as practice, not lecture (who it helps / who it could harm / data minimalism / failing safely / disclosure); Python dictionaries; conversational program structure.
- **Required skills:** purpose selection (S3.1), input loop + keywords (S3.2), dictionary intents + fallback (S3.3), responsibility review (S3.4).
- **Materials:** `bot` starters; transcript cards; Responsible AI checklist; user-test sheets.
- **Timeline:** purpose S3.1 → loop S3.2 → dictionary S3.3 → review + fix S3.4 → user-tested demo S3.5.
- **Teacher guide:** rule-based is a *feature* here — every word the bot can say was chosen by its builder, which makes responsibility concrete. Insist the purpose serves someone real (new students, younger kids, recyclers). The review must find something — a bot with "no possible harms" gets the instructor as adversarial user. Serious-topic routing ("talk to a trusted adult") is taught as professional practice, not punishment.
- **Student instructions:** "Build a bot that actually helps someone: five intents minimum, an honest fallback, and a disclosure that it's a bot. Then audit it — name who it could harm and fix one real finding."
- **Extensions:** randomized reply variants; a "help" intent; session memory that stores nothing personal.
- **Presentation guide:** live demo + one review line: "my bot could harm by ___, so I ___."
- **Example outcomes:** new-kid school FAQ bot; homework-strategy bot that refuses to just give answers; recycling-rules bot.
- **Common challenges:** advice-scope creep on serious topics (routing rule); keyword misses from case/punctuation (`.lower()` ritual); over-promising bots ("I can answer anything!") — honesty pass in S3.4 catches it.

## Project 4 — Data Detective (Semester 4)

- **Overview:** a real-data investigation from question to insight: load a CSV, compute the truth, group and compare, chart it honestly, and present an insight report with a caveat.
- **Objectives / outcomes:** data analysis (aggregation, comparison, outliers); honest visualization; question-first inquiry; Python file/loop skills consolidated.
- **Required skills:** CSV structure + questions (S4.1), aggregation (S4.2), grouping (S4.3), honest charts (S4.4).
- **Materials:** curated dataset packs (weather history, sports stats, nutrition tables, endangered-species counts — real, age-safe, no personal data); `data` starters with `load_csv` and chart helpers; misleading-graph gallery.
- **Timeline:** questions S4.1 → stats S4.2 → comparisons S4.3 → charts S4.4 → insight reports S4.5.
- **Teacher guide:** hold the "questions first" discipline — data browsing without a question becomes screenshot tourism. The sanity-check culture (estimate before trusting) is the debugging skill of this semester. The two-headlines exercise (honest vs. clickbait) does more for media literacy than any lecture; connect it back to Developers' fact-checking if students came up through the journey.
- **Student instructions:** "Ask a question the data can answer. Compute it, compare it, chart it honestly, and report: question, evidence, insight — and the caveat that keeps you honest."
- **Extensions:** second dataset cross-check; median vs. mean discussion; outlier investigation with hypothesis.
- **Presentation guide:** 2-minute insight report; the caveat is delivered proudly, not apologetically.
- **Example outcomes:** "October really is our rainiest month (5-year mean) — but we only have 5 years"; "smaller animals aren't more endangered in this table — size wasn't the pattern".
- **Common challenges:** uninvestigable questions ("is weather cool?") — the case-file check catches them; string-vs-number arithmetic bugs (sanity checks); charts that stretch findings (honest-chart rules + gallery inoculation).

## Capstone — Innovation Challenge (SDG prototype + pitch)

- **Overview:** the program's summit and the public promise made real: Engineers design a prototype addressing a UN Sustainable Development Goal and pitch it — combining Python, AI, and data skills.
- **Objectives / outcomes:** integration of ≥2 skill families; problem scoping; ethics & security review; persuasive, honest pitching.
- **Requirements:** specific SDG-linked problem; working prototype using ≥2 of {Python tool, AI model, data analysis}; ethics & security check completed; 5-part pitch (problem → solution → live demo → impact → next steps) delivered.
- **Timeline:** scoped + core built C.1 → finished, checked, pitched C.2.
- **Teacher guide:** scope is everything — sign off every planner personally and shrink ruthlessly ("one home's water waste, not the ocean"). The SDG connection must be *felt*: start from what angers or excites them, then find the goal, not the reverse. Arrange a small community panel (location lead, a parent-professional, a franchise owner) if possible; pitching to strangers is the growth moment. Model pitch honesty: "next steps" admits what doesn't work yet.
- **Student instructions:** "Pick a goal you actually care about. Prove one small piece of a solution with a working prototype — two skill families minimum. Run the ethics and security check like a professional. Then pitch it: make us care, show us it works, tell us the truth about what's next."
- **Presentation guide:** Pitch Day with families/panel; ~2 minutes + demo + one question; certificates follow (AM §9).
- **Example outcomes:** water-waste tracker (data + Python) for SDG 6; food-share matching prototype (Python + simple classifier) for SDG 2; school energy dashboard (data + chart) for SDG 7; kindness-check message coach (rule-based bot) for SDG 16.
- **Common challenges:** planet-scale scoping (planner sign-off gate); demo fragility (rehearse the demo path twice, have a recorded fallback per OPS tech rules); pitch memorization panic (frame cards allow reading — composure over theatre).

## Revision history

| Version | Date | Author role | Change |
|---------|------|-------------|--------|
| 1.0 | 2026-07-14 | Senior Instructional Designer | First published edition |
