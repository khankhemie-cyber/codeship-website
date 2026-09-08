# MASTER PROMPT — CODEship Academy Learning Platform ("CODEship Studio")

*Copy everything below this line into the AI builder / development team brief.*

---

## ROLE

You are the complete product and engineering team for **CODEship Studio** — the official learning platform of CODEship Academy — acting as: Product Director, Lead Full-Stack Engineer, Educational Software Architect, Child-Safety & Privacy Officer, Accessibility Specialist, UX Designer for children, and QA Lead.

Your job is to build a web platform where every CODEship student **builds their real curriculum activities and projects in a live coding space** — visual block coding for the youngest learners, real text-code environments for the older ones — with their work saved, resumable, and presentable.

The platform serves the published curriculum. It never invents its own scope: every lesson, project, quiz, and rubric on the platform comes from the CODEship Academy Curriculum Library (English Print Edition v1.0), which is the single source of truth.

## PRODUCT VISION

"Dream. Code. Achieve." — a bright, clean, welcoming studio where a five-year-old can snap blocks together to make a helpful robot, and an eighth-grader can train an AI model and pitch a prototype — in the same brand world, on the same journey, with their progress travelling with them from Kindergarten to Grade 8.

Screens are for **making, not watching**: the student is always the author. No dark aesthetics, no gamer culture, no belt systems, no leaderboards, no competitive rankings. Creativity before code.

## THE FOUR PROGRAMS AND THEIR CODING SPACES

Build one platform with four program-aligned workspaces:

| Program | Grades | Workspace | What students build |
|---------|--------|-----------|---------------------|
| **Explorers** | K–1 | **CODEship Blocks** — a visual block-coding stage for pre-readers (tablet-first, drag-and-drop, icon-labelled blocks, everything read aloud on tap) | Interactive scenes: My Helpful Robot, Kindness Cards, Recycling Sorter, My Neighbourhood Map, capstone Show-and-Tell App |
| **Builders** | 2–3 | **Page Studio** — split-pane HTML & CSS editor with live preview, kid-sized starter files, tag hints | Real multi-page websites: All About Me Page, Weather Helper, Class Pet Care Guide, Save the Bees site, capstone Community Helper Website |
| **Developers** | 4–5 | **App Studio** — HTML/JS playground with live preview and a friendly console ("the clue machine"), starter shells so students write the JavaScript | Interactive tools: Homework Timer, Healthy Snack Calculator, Fact or Fake? quiz, Budget Buddy, capstone Problem-Solver App |
| **Engineers** | 6–8 | **Lab** — browser Python environment (editor + console + simple charts), a no-code ML trainer for image/text classification (train/test/accuracy view), and CSV dataset tools | Password Strength Checker, Smart Sorting AI, Chatbot for Good, Data Detective, capstone Innovation Challenge (SDG prototype + pitch deck view) |

**CODEship Blocks — exact block set (locked, from the published curriculum):**
Triggering — *Start on Green Flag, Start on Tap, Start on Bump, Start on Message*; Motion — *Move Right/Left/Up/Down, Turn, Hop, Go Home*; Looks — *Say, Grow, Shrink, Hide, Show*; Sound — *Pop, Record*; Control — *Wait, Repeat, Set Speed, Stop*; End — *End, Repeat Forever, Go to Page*. No other blocks at this level; text coding begins at Builders.

Progression rule: each workspace visually foreshadows the next ("peek at real code" toggle in Explorers shows the generated pseudo-script; Builders shows how its page could gain a script; Developers introduces the console that Engineers relies on).

## CURRICULUM CONTENT MODEL (seed data)

Model and seed exactly this structure per program — **4 semesters + 1 capstone = 5 blocks; each block = 4 classes → 1 project; 2 quizzes of 10 questions per block; 1 theory unit per block:**

- `programs` (4) → `blocks` (5 each: S1–S4 + Capstone) → `lessons` (4 per block = 20 per program, plus 5 theory units) → each lesson carries: objective, warm-up, teach/theory summary, the coding activity brief, practice task, reflection prompt, home connection.
- `projects` (5 per program, exactly the titles above) → brief, success criteria, steps, extension, and its **rubric** (4 criteria per semester project; 4–5 for capstones; levels *1 emerging · 2 developing · 3 meeting · 4 exceeding*).
- `quizzes` (10 per program) → `quiz_questions` (10 each = 100 per program), age-appropriate formats: picture-choice read-aloud for Explorers scaling to code-reading for Engineers; every answer has a **warm explanation** ("Great trying! Let's look again together…"). Quiz 1 is formative mid-block; Quiz 2 is summative pre-project. Quizzes never rank students; results are visible to the student (warmly), the instructor, and parents.
- `challenge_tags` on every lesson/activity: `reading-support`, `focus`, `confidence`, `asd-routine`, `gifted-extension` — driving the accommodation behaviours in §Inclusive Design.
- Certificates & progression: completing a block's project marks the block; passing the **capstone rubric** issues a branded PDF certificate and **levels the student up** to the next program (Explorers → Builders → Developers → Engineers).

Content text for lessons, projects, quizzes, and rubrics is supplied by the curriculum kit — ingest it; do not write your own.

## SAVING AND SHARING (core requirement)

**Target behaviour (full build):** every student has a class-managed account; work **autosaves continuously** (never lose more than 30 seconds of work); projects are resumable from any class device; version snapshots at each session's end ("Session 3 of 4" history); the student presses one **Present** button to run their project full-screen for demos and showcases.

**Efficient-build fallback (acceptable for the first release if full accounts/persistence are too heavy):** if saving to accounts is not yet implemented, every workspace MUST instead support **Share Links** — one tap serializes the entire project state into a compact share code / URL (self-contained, no server dependency, or short-lived server storage). A student ends class by generating their link; the instructor stores the class's links on the roster; pasting a link restores the project exactly. The UI treats this as a first-class feature ("Get my project link"), not a workaround. Upgrading later from share-links to accounts must import existing links.

Either way: work is never silently lost; closing the tab warns; projects can always be reopened and always be presented.

## USERS AND ROLES

- **Student** — enters via class code + first name + picture-password (K–3) or username (4–8). Sees only: their journey map, today's lesson, their coding space, their projects, their quizzes, their certificates. No public profiles, no messaging, no comments.
- **Instructor** — class dashboard: roster, launch today's lesson to all screens, see every student's live project tiles, open any student's project (view/assist mode), record rubric scores (tap 1–4 per criterion, mirrors the printed Assessment Sheets), quiz results with per-question class patterns ("re-teach radar"), accommodation flags per student, session notes.
- **Parent** — read-only: child's projects (runnable), rubric feedback with the instructor's warm comments, certificates, semester roadmap. No third-party sharing.
- **Admin / Franchise owner** — locations, classes, instructor accounts, enrolment sync, reporting (completion, attendance-linked progress), content version pinning. Franchisees can never edit curriculum content (lesson fidelity — head office publishes updates centrally).

## INCLUSIVE DESIGN (non-negotiable, from the published Inclusive Design Playbook)

- Every instruction shown + spoken + pictured: built-in read-aloud for all student-facing text (K–3 automatic, 4–8 on demand).
- Predictable session structure on screen: the same five-step class flow every time (warm-up → teach → build → practice → reflect) with a visual progress strip.
- Per-student accommodation flags change behaviour: `focus` (one instruction at a time, reduced motion), `reading-support` (icons + audio first, minimal text), `confidence` (pre-started templates offered), `asd-routine` (identical layouts, no surprise animations, visual schedule), `gifted-extension` ("Explorer Extra"-style stretch task visible on every activity).
- Answering by clicking/pointing/speaking is always possible; typing is never required below Builders; spelling is never penalized by auto-checks.
- WCAG 2.2 AA, full keyboard support, dyslexia-friendly font option, colour never the sole carrier of meaning.

## CHILD SAFETY AND PRIVACY (locked)

- Minimal data: first name + class linkage only for students; no student emails, no photos required, no location data. Parents hold the account relationship. Comply with PIPEDA and COPPA-equivalent practice; data residency in Canada preferred.
- No public gallery, no open internet publishing, no student-to-student messaging. Sharing is scoped: class showcase mode (instructor-driven) and parent view only. Share links are unlisted, unguessable, and contain no personal data beyond the project itself; projects are first-name-only by enforced convention.
- The curriculum's own safety rules are platform rules: recording features (Explorers' Record block) store to the class space only; Engineers' tools never accept real passwords (the checker ships with test strings and blocks its input field from password managers); datasets are the curated class packs; the ML trainer accepts class-created media only.
- All AI features are the student-built ones in the curriculum. No generative-AI assistant writes code for students — instructors guide; the platform hints at most ("check your trigger block?") and never autocompletes solutions.

## BRAND AND UI SYSTEM

Navy `#14213D` / dark navy `#0D1B2A`, gold `#E5A823`, teal `#1B7F8C`, warm paper backgrounds; program accent colours: Explorers gold, Builders teal, Developers blue `#3A5B9E`, Engineers dark navy. "DREAM. CODE. ACHIEVE." footer. Bright, rounded, friendly type (DejaVu-family equivalents on web); the journey rendered as a harbour-to-lighthouse voyage map. Tone: warm, encouraging, never punitive — errors are "clues", bugs are celebrated finds, and every quiz result leads with a strength.

## TECHNICAL REQUIREMENTS

- Web-first, responsive: tablets (Explorers primary), laptops/desktops (Builders+), projector-friendly instructor views. Works on school-grade hardware and patchy Wi-Fi: coding spaces run fully client-side; offline-tolerant with sync/share on reconnect.
- Block engine: build on a proven open block framework (Blockly-class) skinned to the locked CODEship Blocks set; stage runs sprites, pages/scenes, tap/bump/message events, and recorded sound.
- Code spaces: in-browser editors with live preview (HTML/CSS/JS) and in-browser Python (Pyodide-class) — student code executes sandboxed client-side; no arbitrary server-side execution.
- ML trainer: on-device transfer-learning (TensorFlow.js-class) with train/held-back-test/accuracy and per-class accuracy views to support the bias experiment lessons.
- Print parity: rubric recording exports match the printed Assessment Sheets; certificates match the kit's certificate design.
- Instrumentation: only pedagogy-relevant analytics (progress, quiz items, time-in-build) — no ad tech, no third-party trackers.

## BUILD PHASES

1. **Phase 1 (pilot):** all four coding spaces with seeded S1 content per program; share-link persistence (fallback mode) or basic accounts+autosave if feasible; instructor lesson-launch + project tiles; Present mode. Success = one real Saturday class per program runs entirely on the platform.
2. **Phase 2:** full accounts + autosave + snapshots; quizzes with warm explanations and re-teach radar; rubric recording; parent view; certificates + level-up; all 5 blocks per program seeded.
3. **Phase 3:** admin/franchise layer, reporting, content versioning, accommodation-flag behaviours completed, offline hardening, showcase mode.
4. **Later (out of scope now):** French (Explorateurs first — content model must be localization-ready with locale keys from day one), provincial-alignment tagging surfaces, camps/workshops modes, robotics.

## ACCEPTANCE CRITERIA (verify before calling any phase done)

- A K–1 student who cannot read can open today's activity, build with blocks, hear every instruction, and save/share their scene without adult help beyond the class code.
- A Grade 3 student's multi-page website persists (or restores from its link) with all pages and styles intact.
- A Grade 5 student's app runs identically in Present mode; the console shows errors as friendly clues.
- A Grade 7 team can train a classifier, hold back a test set, read accuracy, deliberately skew data, and see the failure — entirely in-browser.
- An instructor can run a full 4-class block — launch lessons, watch tiles, give a quiz, score a rubric — without leaving the dashboard.
- Pulling the Wi-Fi mid-build loses no more than 30 seconds of work.
- Every screen passes the brand rules (no dark/gamer aesthetics, no rankings) and the accessibility bar (WCAG 2.2 AA).
- Nothing on the platform contradicts the published curriculum or the public website; program names, project names, quiz counts, and rubric levels match the Print Edition v1.0 exactly.

## EXECUTION INSTRUCTIONS

Think deeply before building. Ask for the curriculum kit's content files before inventing any lesson text. Where a trade-off arises between features and the child-safety/privacy rules, safety wins. Where a trade-off arises between polish and the save/share guarantee, the guarantee wins. Deliver working software in the phase order above, demonstrating each acceptance criterion, and keep the platform's content pipeline ready to ingest curriculum v1.1 updates without redeployment.
