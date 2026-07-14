# CODEship Academy Publishing Standards
**Document ID:** CSA-STD-PUB-EN-v1.0 · **Status:** Approved for production · **Applies to:** every document in the CODEship Academy Curriculum Library

---

## 1. Purpose

This manual defines the single publishing system used across the entire CODEship Academy Curriculum Library. Every manual — teacher, student, parent, assessment, project, operations, or franchise — follows these standards so that the whole library reads as the work of one professional educational publisher.

Designers preparing print or digital editions must treat this document as the production specification. Authors updating curriculum must treat it as the style guide.

---

## 2. Library structure and document types

Each of the four programs (Explorers, Builders, Developers, Engineers) publishes the same eight-volume set:

| Code | Volume | Primary audience |
|------|--------|------------------|
| MCM | Master Curriculum Manual | Curriculum leads, franchise owners |
| TM | Teacher Manual | Instructors |
| SW | Student Workbook | Students |
| AM | Assessment Manual | Instructors, curriculum leads |
| PM | Project Manual | Instructors, students |
| PRB | Printable Resource Book | Instructors |
| PH | Parent Handbook | Parents and guardians |
| QRG | Instructor Quick Reference Guide | Instructors |

Shared volumes (not program-specific):

| Code | Volume |
|------|--------|
| STD-PUB | Publishing Standards (this document) |
| STD-CF | Curriculum Framework |
| STD-OPS | Classroom Operations Manual |
| STD-FDS | Franchise Delivery Standards Manual |
| STD-FR | French Curriculum Localization Plan |

## 3. Document naming and version numbering

**Document ID format:** `CSA-[PROGRAM]-[VOLUME]-[LANG]-v[MAJOR].[MINOR]`

- Program codes: `EXP` (Explorers), `BLD` (Builders), `DEV` (Developers), `ENG` (Engineers), `STD` (shared standards).
- Language codes: `EN` (Canadian English), `FR` (Canadian French).
- Example: `CSA-DEV-TM-EN-v1.0` = Developers Teacher Manual, English, version 1.0.

**Versioning rules:**

- **Major** increments when learning outcomes, projects, sequencing, or assessments change. A major change to an English volume opens a mandatory localization ticket for its French counterpart (see STD-FR).
- **Minor** increments for corrections, clarity edits, and formatting fixes that do not change what is taught or assessed.
- Every volume carries a **Revision History** table as its final section: version, date, author role, summary of change.
- The Version Control Log in `curriculum/README.md` is the master record; a volume's revision history must never disagree with it.

## 4. Typography hierarchy (print specification)

| Element | Spec (print) | Markdown source |
|---------|--------------|-----------------|
| Volume title | 28 pt bold, brand navy `#001532` | `#` H1 (one per document) |
| Part / unit title | 20 pt bold, program accent colour | `##` H2 |
| Section heading | 16 pt bold, navy | `###` H3 |
| Sub-heading | 12 pt bold small caps | `####` H4 |
| Body | 10.5 pt / 15 pt leading, near-black `#1A1A1A` | paragraph |
| Captions & footnotes | 8.5 pt, grey `#555` | italic paragraph |
| Code (Builders and up) | 10 pt monospace on `#F5F5F0` panel | fenced code block |

Program accent colours (from the brand system): Explorers `#E5A823`, Builders `#138A9A`, Developers `#3A5B9E`, Engineers `#0D1B2A`. Brand navy `#001532` and gold `#E5A823` are the shared identity colours. Backgrounds use warm paper `#FAF8F4`.

Student-facing volumes for Explorers and Builders print body text at 12 pt minimum with generous line spacing; all student pages use a rounded, friendly sans-serif consistent with the website's typography.

## 5. Page structure

- **Trim:** US Letter (8.5" × 11"), portrait. Printables are designed to photocopy cleanly in black and white.
- **Margins:** 0.75" outer, 1" binding edge.
- **Header:** volume short title (outer), program name (inner). **Footer:** page number (outer), document ID (inner).
- **Front matter order:** title page → document ID block → table of contents → "How to use this volume" → body.
- **Back matter order:** cross-reference index → revision history.

## 6. Standard callout boxes

All volumes use the same five callouts. In markdown source they are blockquotes with a bold label; in print they are tinted panels with an icon.

| Callout | Label | Tint / icon recommendation | Used for |
|---------|-------|---------------------------|----------|
| Teacher note | **📌 Teacher Note:** | Navy panel, pin icon | Delivery guidance, pitfalls |
| Say it like this | **🗣 Suggested Dialogue:** | Gold panel, speech icon | Word-for-word instructor language |
| Watch for | **⚠️ Watch For:** | Amber panel, alert icon | Common misconceptions, safety |
| Inclusion | **🤝 Every Learner:** | Teal panel, hands icon | Differentiation, accommodations |
| Home link | **🏠 Home Link:** | Purple panel, house icon | Parent communication touchpoints |

## 7. Lesson formatting standard

Every session in every Teacher Manual and Master Curriculum Manual uses this block, in this order:

1. **Session header** — session code, title, duration (55 min).
2. **Learning objectives** — 2–4, each starting "Students will…".
3. **Vocabulary** — new terms introduced this session.
4. **Materials & setup** — checklist form.
5. **Session flow table** — the four-phase model with minute allocations: Warm-up (5) → Teach (10) → Build (30) → Reflect (10). Quiz sessions replace the Warm-up and the first 5 minutes of Teach with a 10-minute knowledge check.
6. **Callouts** — teacher notes, dialogue, watch-fors, inclusion, home links as needed.

**Session codes:** `S[semester].[session]` (e.g., S2.4 = Semester 2, Session 4); capstone sessions are `C.1` and `C.2`. Quiz codes: `Q[number]` 1–8, delivered in sessions x.3 and x.5 of each semester.

## 8. Activity, project, and assessment formatting

- **Activities** state: purpose, group size, time, steps (numbered), and "what success looks like".
- **Projects** follow the Project Manual template: overview → objectives → required skills → materials → timeline → teacher guide → student instructions → extensions → presentation guide → rubric → example outcomes → common challenges.
- **Rubrics** are 4-level tables: *Emerging → Developing → Proficient → Extending*. Rubrics assess the thinking as well as the artifact (this is a public brand promise: "not just whether it works, but the thinking behind it").
- **Quizzes** are 5 questions, 10 minutes, low-stakes, and always followed by a warm re-teach moment. Answer keys live only in the Assessment Manual, never in student volumes.

## 9. Voice and terminology

- Canadian English spelling (colour, centre, behaviour). Canadian French per STD-FR for FR volumes.
- Warm, encouraging, never gamer-coded or dark-themed — consistent with the brand's "clean, inclusive design" positioning. No belt systems, no leaderboard language, no "ninja/hacker" archetypes (exception: "cybersecurity" as a subject name in Engineers).
- Students are "Explorers / Builders / Developers / Engineers" (capitalized when naming the cohort). Instructors are "instructors" (not "coaches" or "senseis"). Sessions are "sessions"; the four-semester sequence plus capstone is "the CODEship Journey" with arcs **Dream** (Explorers, Builders) → **Code** (Developers) → **Achieve** (Engineers).
- Fixed brand phrases, used verbatim: **"Dream. Code. Achieve."**, **"Creativity Before Code"**, **"Every child has ideas worth building."**
- Curriculum-alignment language must always say "designed to support / maps to / aligns with" provincial curricula and must never claim endorsement. Required disclaimer wherever alignment is described: *"Not endorsed or approved by any ministry of education."*

## 10. Cross-references

Cross-reference format: `→ [Document ID] §[section]`, e.g., `→ CSA-EXP-AM-EN §Q3`. Every session in a Teacher Manual cross-references its workbook pages, printables, and any quiz delivered that day.

## 11. Print production notes

- Teacher-facing volumes: coil-bound so they lie flat during class.
- Student Workbooks: perfect-bound with perforated certificate page.
- Printable Resource Books: single-sided masters, no page bleed, ≥ 0.5" margins for photocopier safety.
- Colour is an enhancement, never a carrier of meaning — all materials must remain fully usable in black-and-white photocopy (accessibility and franchise-cost requirement).

## 12. Revision history

| Version | Date | Author role | Change |
|---------|------|-------------|--------|
| 1.0 | 2026-07-14 | Publishing Director | Initial unified publishing system for Curriculum Library v1.0 |
