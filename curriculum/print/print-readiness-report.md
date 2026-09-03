# Print-Readiness & Asset Verification Report — English Print Edition v1.0
**Document ID:** CSA-RPT-PRINT-EN-v1.0 · **Package:** `CODEship_K8_Curriculum_EN_Print_Ready_v1.0/` · **Scope:** English only; no provincial crosswalk documents (per owner instruction)

---

## 1. What was received and what ships

The owner supplied `CODEship_K8_Complete_Curriculum_EN.zip` — the complete production kit: 4 programs × 16 PDFs (1 Curriculum Guide, 5 Student Workbooks, 5 Quiz Packs, 5 Assessment Sheets covering S1–S4 + Capstone) = **64 documents**. This directory contains the verified, print-ready edition of that kit plus `00_PRINT_SUBMISSION_SPEC.pdf` (vendor sheet) and `MANIFEST.csv` (titles, page counts, SHA-256 checksums).

## 2. Verification results (all 64 documents + spec sheet)

| Check | Result |
|-------|--------|
| Structure: 16 files per program; blocks S1–S4 + Capstone | ✅ exact |
| All 20 project titles match the approved curriculum (website canon) | ✅ verbatim |
| Page counts: guides 11–14 · workbooks 7 · quiz packs 4 (Quiz 1 + Quiz 2 + answer key) · assessment sheets 2 | ✅ |
| Page size: US Letter throughout; assessment sheets landscape, all else portrait | ✅ |
| Fonts embedded (subset TrueType, DejaVu family) | ✅ 100% |
| Encryption / open passwords | ✅ none |
| Brand: navy/gold/teal, "DREAM. CODE. ACHIEVE." footer, no emojis | ✅ |
| Alignment language "aligned to / maps to / supports" only, never "endorsed/approved by" | ✅ |
| Internal tool names in student/teacher documents | ✅ none |
| No provincial crosswalk tables anywhere in the edition | ✅ (after the fix below) |
| Document metadata (Title/Author/Subject) | ✅ stamped on all 64 |
| Layout sampling (workbook, quiz, assessment, guide pages rendered and reviewed) | ✅ clean |

## 3. Corrections made for print

1. **Explorers Curriculum Guide — rebuilt.** The supplied file was a working draft, not a publishable teacher edition: 9 pages in an older 10-section spec format containing internal production language ("Phase 1 build", "K–1 (confirm)"), an embedded **Ontario alignment crosswalk table (§9)** (excluded from this edition per owner instruction), a "Platform seeding summary" (§10, internal), and a closing "Confirm / next" page with internal pricing notes. It was rebuilt to the exact series standard of the other three guides (8 sections, same cover, header band, typography, rubric/alignment tag pills), **preserving all approved teaching content** — theory units, all 20 lesson plans, worksheet descriptions, project briefs, rubrics, and graduation criteria. Per-semester alignment now appears as light tags only, identical to the Builders/Developers/Engineers guides, with the locked compliance note stating that detailed provincial crosswalks are maintained separately and are not part of this edition. The original draft is preserved outside the print package for the archive.
2. **Metadata stamped** on all 64 PDFs (Title/Author/Subject) for professional vendor file handling.
3. **Font hygiene:** an unused unembedded Helvetica reference in the rebuilt files was stripped; every shipped document embeds 100% of its fonts.

## 4. Known observations (no action required for print)

- **Capstone quiz packs exist** (2 quizzes per block × 5 blocks = 10 per program) while public copy says "8 quizzes (2 per semester)". The guides themselves count "8 quizzes" per level (semester quizzes), treating capstone quizzes as the graduation check — internally consistent; no public contradiction.
- **Structural parameters vs. the markdown library (v1.0):** the print kit defines a semester as **4 classes** with **10-question quizzes** (Quiz 1 mid-block, Quiz 2 pre-project) and rubric levels *emerging / developing / meeting / exceeding*; the markdown manuals in `curriculum/` (authored before the kit was supplied) used 5 sessions per semester, 5-question quizzes at sessions x.3/x.5, and *Emerging / Developing / Proficient / Extending*. **The print kit is the delivered teaching reality and takes precedence.** Logged as reconciliation item R-7 for the library's v1.1 minor release (audit report §7/U-1 updated accordingly). Both realizations satisfy every public promise (4 semesters + capstone, ~20 sessions, 8 quizzes/2 per semester, 55-minute classes).

## 5. Submission checklist for the owner

- [x] 64 documents verified and packaged
- [x] Vendor spec sheet included (`00_PRINT_SUBMISSION_SPEC.pdf`)
- [x] Manifest with checksums included (`MANIFEST.csv`)
- [ ] Quantities per document type confirmed on the purchase order (see spec sheet's per-classroom set suggestion)
- [ ] Vendor proof of one guide + one workbook approved before full run

## 6. Revision history

| Version | Date | Author role | Change |
|---------|------|-------------|--------|
| 1.0 | 2026-07-15 | Quality Assurance Lead / Graphic Publication Director | Print verification, Explorers guide rebuild, packaging |
