# CODEship Academy Curriculum Library — v1.0

The definitive, print-ready publishing library for all CODEship Academy programs. This directory is the **single source of truth** for instructors, students, parents, franchisees, marketing, website content, and future curriculum development. The website's `src/data/programs.ts` and this library must always agree; the library defines delivery, the site defines the public promise.

**Tagline:** Dream. Code. Achieve. · **Principle:** Creativity Before Code.

---

## Library map

### Shared standards (`standards/`)
| Document | ID |
|----------|----|
| [Publishing Standards](standards/publishing-standards.md) — the unified publishing system (typography, page structure, callouts, naming, versioning, print specs) | CSA-STD-PUB-EN-v1.0 |
| [Curriculum Framework](standards/curriculum-framework.md) — philosophy, program architecture, session model, assessment model, inclusion standards, delivery modes | CSA-STD-CF-EN-v1.0 |
| [Classroom Operations Manual](standards/classroom-operations-manual.md) | CSA-STD-OPS-EN-v1.0 |
| [Franchise Delivery Standards Manual](standards/franchise-delivery-standards.md) | CSA-STD-FDS-EN-v1.0 |

### Program libraries (8 volumes each)
Every program folder contains: `master-curriculum-manual` (MCM) · `teacher-manual` (TM) · `student-workbook` (SW) · `assessment-manual` (AM — instructor-only, contains answer keys) · `project-manual` (PM) · `printable-resources` (PRB) · `parent-handbook` (PH) · `instructor-quick-reference` (QRG).

| Program | Grades | Coding space | Folder |
|---------|--------|--------------|--------|
| Explorers | K–1 | Visual block coding | [`explorers/`](explorers/) |
| Builders | 2–3 | HTML & CSS | [`builders/`](builders/) |
| Developers | 4–5 | JavaScript | [`developers/`](developers/) |
| Engineers | 6–8 | Python + AI + Cybersecurity | [`engineers/`](engineers/) |

### French (`french/`)
| Document | ID |
|----------|----|
| [Localization Plan & binding glossary](french/localization-plan.md) | CSA-STD-FR-EN/FR-v1.0 |
| [Guide des parents — Explorateurs](french/explorateurs-guide-des-parents.md) | CSA-EXP-PH-FR-v1.0 |
| [Aperçu du programme — Explorateurs](french/explorateurs-apercu-du-programme.md) | CSA-EXP-SMAP-FR-v1.0 |

### Reports (`reports/`)
| Document | ID |
|----------|----|
| [Executive Curriculum Audit & Reconciliation Report](reports/executive-curriculum-audit.md) — sources of truth, reconciliation decisions, completeness audit, website alignment, modernization summary, resolved/unresolved issues | CSA-RPT-AUDIT-EN-v1.0 |

## Publishing standards applied

All 43 documents follow one system (CSA-STD-PUB): unified document IDs and version numbering; identical volume structure per program; one session-formatting standard (55 min: Warm-up 5 → Teach 10 → Build 30 → Reflect 10); one quiz standard (5 items, 10 min, sessions x.3/x.5); one rubric system (Emerging → Developing → Proficient → Extending across Concept & creativity / Technical skill / Process & problem-solving / Communication & sharing); five standard callout types; fixed brand phrases and terminology; alignment disclaimers wherever alignment is claimed; black-and-white photocopy-safe print rules.

## Version control log

| Date | Version | Change | Documents |
|------|---------|--------|-----------|
| 2026-07-14 | 1.0 | Initial publication of the complete library: shared standards (4), Explorers set (8), Builders set (8), Developers set (8), Engineers set (8), French plan + 2 FR volumes (3), audit report (1), this index (1) | 43 documents |

**Open work (scheduled, not yet published):** Phase-1 French completion — full Explorateurs FR set + Ingénieurs FR teacher set (spec: CSA-STD-FR §1) · resolution of audit items U-1 to U-6 (→ reports/executive-curriculum-audit.md §7).

## Rules for changing this library

1. **The English edition is the master.** A major change (outcomes, projects, sequencing, assessment) bumps the major version, must be reconciled with `src/data/programs.ts` and the live site in the same release, and opens a French localization ticket (CSA-STD-FR §4).
2. **Minor edits** (clarity, fixes, formatting) bump the minor version and batch into the next FR minor release.
3. Every changed volume updates its own revision-history table **and** this log — they must never disagree.
4. Marketing may not publish claims the library cannot support, and the library may not contradict published claims without a coordinated release (FDS §8).
5. Franchise locations never modify volumes locally; improvement proposals flow through the annual feedback cycle (FDS §10).

## Future maintenance recommendations

1. **Immediately:** obtain any pre-existing curriculum documents from prior project conversations or storage and diff against v1.0 (audit item U-1) before commissioning print design.
2. **Before next enrolment cycle:** fix the two website copy mismatches (55-minute sessions; age range — U-2/U-3) and complete French Phase 1 (U-4).
3. **Annually:** one minor release folding in franchise feedback (FDS §10) plus a website-alignment re-audit; one terminology sweep against STD-PUB §9 and the FR glossary.
4. **Before adding locations:** onboard instructors exclusively through this library (FDS §6); commission curriculum definitions for camps/workshops/parties/AI-robotics before franchising those offerings (U-5).
5. **Print production:** hand designers CSA-STD-PUB as the production spec; produce instructor volumes coil-bound, workbooks perfect-bound with perforated certificates, printables as single-sided masters.
