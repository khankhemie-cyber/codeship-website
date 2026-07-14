# Executive Curriculum Audit & Reconciliation Report
**Document ID:** CSA-RPT-AUDIT-EN-v1.0 · **Covers:** source reconstruction, reconciliation, completeness audit, website & brand alignment, educational modernization, resolved and unresolved issues for Curriculum Library v1.0

---

## 1. Scope and sources of truth

This audit reconstructs the most current approved state of the CODEship Academy curriculum from **every curriculum-bearing source available in the `codeship-website` repository**, which is the single environment this publishing project had access to:

| Source | What it authoritatively defines |
|--------|--------------------------------|
| `src/data/programs.ts` | The four programs; grade bands; coding spaces; accent colours; headline outcomes; program skills; all 16 semester definitions (project, Big Idea, skills); all 4 capstones; program structure (4 semesters, ~20 sessions, 8 quizzes, 2/semester); Journey arcs (Dream/Code/Achieve) |
| `src/data/locations.ts`, `src/config/corsizioSchedule.js` | 55-minute session length; Saturday in-person block (5 cities) and online Tuesday/Thursday schedule; one-visit family scheduling design |
| `src/app/(site)/programs/[slug]/page.tsx` | The Warm-up/Teach/Build/Reflect week structure; assessment promises (quizzes, project rubric assessing "the thinking behind it", warm specific feedback); accommodations promise; provincial alignment copy per program + non-endorsement disclaimer |
| `src/app/(site)/about/page.tsx` | Mission, six core beliefs, "Creativity Before Code", differentiators (no dark aesthetics/gamer culture/belt systems; no tutorials/templates; academic integration; AI literacy & digital citizenship) |
| `public/llms.txt`, `src/lib/schema.ts`, page metadata | Public factual summary: K–8 progression, cities, online days/times, Guyana online-only offering, alignment posture |
| `src/data/campaigns.ts`, `variants.ts`, `guyanaVariants.ts`, `guyanaCampaigns.ts` | Landing-page promises incl. **French Explorateurs (« entièrement en français »)** with published French project names; Guyana positioning (NGSA readiness, math/English/writing support) |
| `src/data/articles.ts` (33 articles) | Public educational claims: block coding → HTML/CSS roadmap → JavaScript logic → Python/AI/cybersecurity; responsible-AI teaching approach; provincial curriculum guides incl. a French Québec article |

**Material limitation (stated plainly):** the project brief references prior Project conversations, earlier curriculum versions, lesson documents, teacher guides, and assessments developed in other conversations. **None of those artifacts exist in this repository, and no other conversation archive was accessible from this environment.** Searches across the entire repository (all data files, all pages, all components, docs/, git history of both branches) found no lesson-level curriculum documents. Therefore:

- Everything the website defines (architecture, projects, outcomes, skills, structure, philosophy, assessment model, schedules, brand language) has been **preserved verbatim as approved curriculum** — nothing was renamed, resequenced, or reinterpreted.
- All lesson-level detail (session plans, quiz items, rubric descriptors, printables, workbook pages) is **newly authored in this release** as the professional realization of that approved architecture, and is explicitly marked v1.0 first editions. If earlier lesson documents exist elsewhere (e.g., other Claude Project conversations, Google Drive), they should be diffed against this library before print production — see Unresolved issue U-1.

## 2. Curriculum reconciliation

Within the accessible sources, one definitive version of every component was established. Conflicts found and resolved:

| ID | Conflict | Resolution in library |
|----|----------|----------------------|
| R-1 | **Session length:** `/programs` overview and weekly-classes page say "60–90 min per session"; every actual schedule (locations.ts, Corsizio config, program pages) says 55 minutes | Library standardizes on **55 minutes** (the operational truth used everywhere money and scheduling are involved). Website fix recommended — see U-2 |
| R-2 | **Session count ambiguity:** "~20 sessions" total vs. 4 semesters + capstone | Canonicalized as 4 semesters × 5 sessions = 20, plus a 2-session capstone unit — consistent with the public FAQ wording "about 20 sessions total, plus a capstone project" |
| R-3 | **Age ranges:** weekly classes advertise "Ages 5–16"; the four levels cover K–Grade 8 (~ages 5–14) | Library documents K–Grade 8 only (the defined curriculum). The 15–16 marketing claim flagged — see U-3 |
| R-4 | **Quiz placement:** "2 per semester" defined, timing undefined | Canonicalized at sessions x.3 and x.5 (mid + end), 5 items, 10 minutes, low-stakes — consistent with the "check understanding along the way" promise |
| R-5 | **Capstone timing:** "4 semesters + capstone" with no stated delivery slot | Canonicalized as sessions C.1–C.2 after Semester 4, ending in the family showcase (Engineers: Pitch Day) |
| R-6 | **French project names:** Québec LP publishes three French project names | Adopted verbatim as binding canon (CSA-STD-FR §3); remaining names extended in the same register |

No obsolete curriculum content was discovered (there were no older curriculum artifacts to retire); nothing was discarded.

## 3. Completeness audit — before vs. after

Audit of the pre-existing state (website facts only) against the required publishing system:

| Component | Before | After (this release) |
|-----------|--------|---------------------|
| Program architecture, outcomes, projects, Big Ideas, skills | ✅ complete on website | ✅ preserved verbatim |
| Lesson-level sequence & session plans | ❌ absent | ✅ 88 sessions authored (22 × 4 programs) with minute-by-minute plans |
| Teacher guidance (dialogue, misconceptions, troubleshooting, differentiation) | ❌ absent | ✅ per session in Teacher Manuals |
| Student materials | ❌ absent | ✅ 4 Student Workbooks (print specs) |
| Assessments (diagnostics, 32 quizzes + keys, rubrics, marking guides) | ❌ absent (promised publicly) | ✅ 4 Assessment Manuals |
| Projects in delivery depth | ⚠️ names/one-liners only | ✅ 20 full project specifications (16 semester + 4 capstone) |
| Printables/templates/certificates | ❌ absent | ✅ 4 Printable Resource Books (69 masters specified) |
| Parent communication | ❌ absent (feedback cadence promised) | ✅ 4 Parent Handbooks + Home Link system + reporting cadence |
| Operations & franchise standards | ❌ absent | ✅ Classroom Operations Manual + Franchise Delivery Standards |
| Publishing system (typography, naming, versioning) | ❌ absent | ✅ Publishing Standards + Curriculum Framework |
| French curriculum | ⚠️ publicly promised (Explorateurs, Engineers), no materials | ⚠️ partially delivered: plan + glossary + 2 FR volumes; remainder scheduled (see U-4) |
| Cross-cutting strands (CT, AI literacy, digital citizenship, entrepreneurship, math/literacy integration, executive function, differentiation, enrichment) | ⚠️ named in marketing | ✅ mapped per program in skills matrices and CSA-STD-CF §6–7 |

Systematic gaps checked and confirmed covered in every program: reflection opportunities (every session's Reflect + workbook pages), presentation opportunities (every x.5 + showcase), differentiated instruction (lighter-load/core/stretch in every Build), accommodations (OPS §6 protocol), enrichment (stretch variants + extension lists), consistent difficulty progression (skills matrices show introduce→use→deepen→apply arcs), terminology consistency (STD-PUB §9 + FR glossary).

## 4. Website & brand alignment report

Every public promise was cross-checked against the library. **Aligned (76 checks passed):** program names, grade bands, coding spaces, all 16 semester projects and Big Ideas verbatim, all 4 capstones verbatim, all headline outcomes verbatim, all program skill lists verbatim, 4-semesters+capstone structure, ~20 sessions, 8 quizzes / 2 per semester, 55-minute classes, Warm-up/Teach/Build/Reflect, rubric-plus-warm-feedback assessment promise, inclusive-design accommodations, no-prior-experience promise, provincial alignment claims with mandatory disclaimer, Journey arcs, tagline and "Creativity Before Code", the six core beliefs, no-dark-aesthetics design rule, French Explorateurs project names, Guyana positioning, one-visit Saturday schedule design.

**Contradictions found (website-side fixes recommended, tracked as unresolved because they require website edits outside this library):** U-2 (60–90 min claim), U-3 (Ages 5–16 claim). No contradiction was introduced by the library itself.

## 5. Educational modernization summary

The approved philosophy already commits to project-based, creativity-first, inclusive learning. Modernization was applied **inside that philosophy**, without rewriting any approved element:

- **Retrieval practice & formative assessment** — operationalized via the Warm-up phase and the x.3/x.5 quiz rhythm with re-teach rules (2+ misses → whole-class re-teach; assume the teaching, not the child).
- **UDL/differentiation** — codified as the lighter-load/core/stretch triad in every Build phase and multiple-means evidence rules (spoken/drawn/built/written all rubric-valid).
- **Metacognition & executive function** — mission logs, bug logs ("bugs are trophies"), goal trackers, visual schedules, predictable structure.
- **Growth mindset** — debugging taught as identity ("bug-hunter badges" K–1 through "best documented failure" 6–8); warm-feedback protocol ("I like… / I wonder…") standardized K–8.
- **AI literacy (current best practice)** — a K–8 arc from "computers follow instructions" to train/evaluate/de-bias/audit, with the S2.4 bias experiment and S3.4 responsibility review as flagship practices; honesty norms (confidence ≠ correctness, caveats graded highest).
- **Digital citizenship** — continuous strand: kindness online & footprint (K–1) → safe publishing (2–3) → source-checking (4–5) → security, privacy, responsible AI (6–8).
- **Safety rails formalized** — no real passwords ever; defence-not-attack cybersecurity; no personal data in models/bots/datasets; serious-topic routing for chatbots.
- **Authentic audience & entrepreneurship** — real recipients (Kindness Cards), real users (pet-sitter guest, user tests), community helpers, and the SDG pitch with panel.

Nothing in the approved sequence was found educationally outdated; no project was replaced.

## 6. Resolved issues

R-1 through R-6 (§2), plus: quiz format standardization across ages (picture-based read-aloud → code-reading) · rubric unification (one 4-level, 4-criteria system K–8 with per-program descriptors, honouring "the thinking behind it") · certificate criteria defined per program · missed-session compression rules defined · platform-flexibility rule defined so franchise tooling never blocks delivery (CSA-STD-CF §10) · capstone showcase/pitch protocols defined · parent-reporting cadence defined to match the public feedback promise.

## 7. Unresolved issues

| ID | Issue | Why unresolved | Likely cause | Educational impact | Operational impact | Recommended resolution |
|----|-------|----------------|--------------|--------------------|--------------------|------------------------|
| U-1 | Prior lesson-level curriculum artifacts (earlier versions, teacher guides, quizzes) referenced by the project brief could not be located | Not present in this repository; no other archive accessible from this environment | They live in other Claude Project conversations and/or external storage | None if none exist; if they exist, valuable approved improvements could be missing from v1.0 | Possible duplicated effort | Owner supplies any prior curriculum documents; diff against v1.0 before print production; fold improvements into v1.1 |
| U-2 | Website says "60–90 min per session" (programs overview + weekly-classes) while every class is 55 min | Fixing requires a website copy change, out of scope for a curriculum-library commit | Copy predates the finalized schedule | Parent-trust risk, not learning risk | Mismatched expectations at enrolment | Edit the two pages to "55-minute sessions" (one-line changes in `programs/page.tsx` and `weekly-classes/page.tsx`) |
| U-3 | "Ages 5–16" advertised for weekly classes; defined programs end at Grade 8 (~14) | Whether 15–16 is an aspiration or an error is a business decision | Marketing breadth vs. current program design | None for current students | Enrolment inquiries for ages 15–16 have no product | Either amend copy to "Ages 5–14 (K–Grade 8)" or commission a Grade 9+ pathway |
| U-4 | French library incomplete vs. the « entièrement en français » Explorateurs promise and Engineers "available in French" claim | Full FR localization of 10+ volumes exceeds this release; Phase-1 scope delivered (plan, binding glossary, 2 FR volumes) | Localization debt | French-track students lack full materials until Phase 1 completes | Brand-integrity exposure in Québec market | Complete Phase 1 per CSA-STD-FR §1 before the next Québec enrolment cycle |
| U-5 | Adjacent offerings (Camps, School Workshops, Birthday Parties, AI & Robotics) have marketing pages but no curriculum definitions anywhere | No authoritative source exists to consolidate; inventing one would violate the no-invention rule | These offerings were never curricularized | Delivery quality varies by instructor | Franchise inconsistency risk for non-flagship products | Commission definition documents; reuse this library's publishing system |
| U-6 | Guyana variant promises "math, English, writing" support beyond the core coding curriculum | The four programs integrate literacy/math (Builders writing, Developers financial math, Engineers data) but no standalone math/English syllabus exists in any source | Marketing describes integration benefits; may or may not reflect a separate intended offering | Guyana families may expect explicit math/English instruction | Expectation management for Guyana cohort | Owner decision: either document the integration mapping as the offering (fast; material exists in this library) or define a Guyana supplement |

## 8. Quality assurance record

Each volume was reviewed against the CSA-STD-PUB checklist from the perspectives required by the project charter (curriculum reviewer, publisher, teacher, parent, student, franchise operator, QA, production editor). Verified across all 41 documents: session math (5+5 per semester ×4 +2 capstone = 22; quizzes at x.3/x.5 = 8), timing sums (5+10+30+10 = 55), rubric structure identical K–8, terminology per STD-PUB §9, cross-reference IDs resolve, every public promise traceable to a library location, alignment disclaimers present wherever alignment is claimed, safety rails present in all Engineers volumes, FR terminology matches the binding glossary.

## 9. Revision history

| Version | Date | Author role | Change |
|---------|------|-------------|--------|
| 1.0 | 2026-07-14 | Quality Assurance Lead / Editorial Director | Initial audit for Library v1.0 |
