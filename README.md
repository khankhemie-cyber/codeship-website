This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## SEO & GEO (AI-search) foundation

### Canonical host

`https://www.codeshipacademy.com` is the single canonical host. Every page's `alternates.canonical`
and `openGraph.url` are generated from this via `pageMetadata()` (`src/lib/pageMetadata.ts`) — every
page now emits its **own** self-referential `og:title`/`og:description`/`og:url`/`twitter:*` instead
of inheriting the root layout's homepage-only defaults (the previous bug: e.g. the Explorers page's
`og:url` pointed at `/`). If `codeshipacademy.com` (no `www`) or any other host is still live and
indexed, add a 301 from it to the `www` host at the DNS/hosting level — that's outside this repo.

### Structured data (JSON-LD)

`src/lib/schema.ts` exports one function per schema type — `organizationSchema` (rendered once,
sitewide, by `(site)/layout.tsx`), `localBusinessSchema` (per official in-person city, with `geo` and
`openingHours` only for the 5 real cities — Toronto, Vaughan, Oshawa, Calgary, Vancouver — not the
broader 12-city browsing list), `courseSchema` (per `/programs/:slug`, with in-person + online
`CourseInstance`s derived from `locations.ts`, no invented facts), `faqSchema`, `breadcrumbSchema`
(paired with the visible `<Breadcrumbs>` component), `articleSchema` (now includes `dateModified` and
an `authorName` override), `itemListSchema` (for future listicle articles), and `speakableSchema`
(pairs with the `.faq-answer` CSS class every `FAQAccordion` answer already renders, for voice/AI
extraction). Validate any page with Google's Rich Results Test after changes.

### Crawl / index hygiene

- `/lp/*` (paid-only landing pages): `noindex`, excluded from `sitemap.ts`, disallowed in `robots.ts`.
- `/gy/*` (Guyana, SEO-relevant): indexable, included in `sitemap.ts`, **not** disallowed.
- `/franchise/{ali-saad,jaspreet,raghavi,tom-che}` (private, password-gated kits): `noindex`,
  disallowed — unchanged, pre-existing.
- Everything else (programs, locations, resources/blog, schools, franchise overview): indexable.

### AI-crawler policy

`robots.ts` explicitly allows `GPTBot`, `PerplexityBot`, `Google-Extended`, and `CCBot` (same policy
as the wildcard `*` rule — stated explicitly since some AI-discovery audits check for named
user-agent rules specifically, not just the wildcard). `public/llms.txt` summarizes what CODEship is,
its programs, locations, and key page URLs for the emerging llms.txt AI-discovery convention — keep
it in sync when adding major new sections (e.g. new program levels, new countries).

### Manual steps (require account access this repo doesn't have)

These can't be done from code — whoever owns the relevant accounts needs to complete them:

1. **Bing Webmaster Tools**: add `codeshipacademy.com` as a site, verify ownership, and submit
   `https://www.codeshipacademy.com/sitemap.xml`. This matters because ChatGPT Search uses Bing's
   index, not Google's.
2. **Google Search Console**: same — verify the property and submit the sitemap there too.
3. **GA4 custom channel group for AI referrals**: in GA4 → Admin → Data display → Channel groups,
   create a custom channel (e.g. "AI Referral") matching source contains `chatgpt.com`, `perplexity.ai`,
   `gemini.google.com`, `claude.ai`, or `copilot.microsoft.com`, so AI-driven traffic is measurable
   separately from generic Referral/Organic Search.
4. Re-submit the sitemap to both Bing and Google after each batch of new articles is published.

## The CODEship Journey: Programs, Locations & Registration

The site's K–8 curriculum ("Explorers", "Builders", "Developers", "Engineers") is modeled as two typed
sources of truth:

- `src/data/programs.ts` — curriculum facts per level: grade band, coding space, outcome, the 4
  semesters + capstone, and per-level provincial alignment copy.
- `src/data/locations.ts` — the 5 in-person cities (Toronto, Vaughan, Oshawa, Calgary, Vancouver),
  their shared Saturday schedule (9:00 AM–1:45 PM, 15-min transitions, one 35-min break — see
  `IN_PERSON_SATURDAY_AGENDA`), and the online Tue/Thu 4–6 PM ET schedule.

Both are consumed by `JourneyMap` (home page + `/programs#journey`), `ProgramLocationSelector`
(the location/schedule picker on each `/programs/[slug]` page), and `AlignmentStrip`.

### Registration — reusing the existing form

There is no new registration form. Every "Register" CTA in the Journey Map and program pages routes
to the site's **existing** `/register` page, which embeds the existing HubSpot registration form
(`src/components/RegistrationForm.tsx` → `HubSpotForm`, portal `342242925`).

`REG_FORM_URL` (`src/lib/registration.ts`) points at `/register`. If registration ever moves to an
external form, update that one constant.

`buildRegistrationUrl({ program, location, source?, medium?, campaign?, content?, term? })` appends
UTM parameters to `REG_FORM_URL`:

| Param | Default | Override source | Purpose |
|---|---|---|---|
| `utm_source` | `"website"` | `source` (paid LPs pass `"meta"` \| `"google"`) | traffic source |
| `utm_medium` | `"registration"` | `medium` (paid LPs pass `"cpc"` \| `"paid_social"`) | traffic medium |
| `utm_campaign` | the program slug | `campaign` | **program** attribution |
| `utm_content` | the location slug | `content` | **location** attribution |
| `utm_term` | `in-person` or `online-{day}-1600` | `term` | schedule slot |

Main-site CTAs (Journey Map, `/programs/[slug]`) call it with just `{ program, location }` and get the
original `website`/`registration` defaults. Paid landing pages (below) pass the ad platform's own
`source`/`medium` so attribution reflects where the visitor actually came from.

The HubSpot forms embed script executes on `/register`, so it reads the page's own URL — the UTM
parameters above are picked up and attributed automatically with no backend changes. `program` and
`location` are also passed as plain query params; if the HubSpot form is later given hidden fields
named `program` / `location` (Form settings → "prefill fields using URL parameters" in HubSpot),
those values will prefill too. UTM parameters remain the durable source of truth either way.

### Analytics

`src/lib/analytics.ts` exports `trackView`, `trackSelectLocation`, `trackRegisterClick`, and
`trackPriceView` stubs, each called with `{ program, location? }` (or `{ page, country, location }`
on the Guyana pages) plus whatever UTMs are relevant. They currently `console.debug` in development.
To wire up real analytics, uncomment and fill in the `gtag`/`fbq` calls inside `dispatch()` in
`src/lib/analytics.ts`.

## Paid-ad landing pages (`/lp/:slug`)

Five standalone, conversion-focused landing pages for paid campaigns live at `/lp/explorers`,
`/lp/builders`, `/lp/developers`, `/lp/engineers`, and `/lp/quebec-fr` (fully French). Each matches
one ad's message, presents one program, and drives one action — register via the existing form.
See `CAMPAIGN_KIT.md` for the full messaging/ad-copy/compliance kit.

### These pages are intentionally not part of the main site

- **No nav, no footer links.** `src/app/lp/layout.tsx` replaces (does not extend) the main site's
  `(site)` layout — it renders only `LPHeader` (logo → home, nothing else). The main `Navigation` and
  `Footer` components never link to `/lp/*`, and `/lp/*` never appears in `sitemap.ts`.
- **`noindex`.** Every `/lp/:slug` page sets `robots: { index: false, follow: false }`
  (`src/app/lp/[slug]/page.tsx`), and `robots.ts` disallows `/lp/` for crawlers.
- If you ever want an LP to be reachable from the main site or search, that's a deliberate
  architecture change (move it into the `(site)` group, add a nav/footer link, drop `noindex`) — don't
  do it by accident.

### Data sources

- `src/data/campaigns.ts` — one `Campaign` per LP: ad headline, subhead, real project titles, outcome
  bullets, offer copy, FAQ, and the ad platform's default `source`/`medium`.
- `src/data/variants.ts` — A/B variants (`?v=a` default, `?v=b`) for headline / hero image / CTA label
  only; facts, projects, and FAQ never change between variants.
- `src/data/campaign_kit.ts` + `CAMPAIGN_KIT.md` — the broader ad-campaign kit (messaging pillars,
  per-level × per-location ad copy sets, audience map, UTM plan, compliance checklist) that the
  marketing team and ad platforms read from.

### Location targeting

Each LP reads `utm_content` (falling back to `?loc=`) from the incoming URL to default the location
bar. If neither is present, the full 5-city + online selector shows expanded instead of collapsed.
Whatever the visitor lands on or picks flows straight into the registration URL's `utm_content` —
`src/components/lp/LPView.tsx` is the orchestrator; `LocationBar` is the selector itself.

### Swapping in real assets before launch

- **Testimonials**: `LPView`'s proof section renders an explicit "add a real testimonial here" slot —
  no quotes or names were fabricated. Replace it with real, permissioned parent testimonials.
- **Hero/OG images**: `variants.ts` (`heroImage`) and `campaigns.ts` (`ogImage`) currently point at the
  same stock photography already used on the main site. Swap in campaign-specific assets per LP.
- **French copy**: `/lp/quebec-fr`'s copy was drafted by direct translation of the authoritative
  English curriculum facts and needs a native French-speaker pass before it runs as a live ad
  destination (see the compliance checklist in `CAMPAIGN_KIT.md`).

## Guyana online-course landing pages (`/gy/:slug`)

Five landing pages for CODEship's Guyana **online-only** offering live at `/gy/online-coding-classes`,
`/gy/math-english-coding`, `/gy/ngsa-digital-skills`, `/gy/computer-classes-for-kids`, and
`/gy/online-stem-classes`. Data lives in `src/data/guyanaCampaigns.ts` (per-page headline/subhead/
core-promise/meta copy, plus the shared page-anatomy content — parent problems, outcomes, projects,
pricing, FAQ, regions) and `src/data/guyanaVariants.ts` (3 A/B headlines per page via `?v=1|2|3`).

**Unlike `/lp/*`, these pages are meant to be found via organic search** — they carry real SEO
metadata (no `noindex`), are included in `sitemap.ts`, and `robots.ts` does not disallow `/gy/`. They
still share `/lp`'s nav isolation: no links from the main `Navigation`/`Footer`, and `src/app/gy/
layout.tsx` renders only the shared `LPHeader` (logo → home) — never the main site nav.

### Guyana is not a K-8 program

The main site's registration (`buildRegistrationUrl`) is keyed to a specific program
(explorers/builders/developers/engineers). Guyana registrations are a generic **online semester**
with no such mapping, so they use their own builder:

`buildGuyanaRegistrationUrl({ page, source?, medium?, campaign?, content?, term? })`
(`src/lib/buildGuyanaRegistrationUrl.ts`) — appends UTMs to the same `REG_FORM_URL` (`/register`,
the existing form) plus `country=guyana`, `location=online`, and `page`:

| Param | Default | Values |
|---|---|---|
| `utm_source` | `meta` | `meta` \| `google` \| `whatsapp` \| `facebook` \| `instagram` |
| `utm_medium` | `paid_social` | `paid_social` \| `cpc` \| `organic_social` \| `referral` |
| `utm_campaign` | `guyana-online` | — |
| `utm_content` | `guyana` | `georgetown` \| `east-bank-demerara` \| `east-coast-demerara` \| `berbice` \| `linden` \| `essequibo` \| `guyana` \| ... (any community slug) |
| `utm_term` | derived from `page` | `online-coding` \| `math-english-coding` \| `ngsa-digital-skills` \| `computer-classes` \| `online-stem` |

`GYView` reads any incoming `utm_*` from the URL and passes them straight through, falling back to
these defaults for direct/testing traffic.

### Pricing (authoritative — render exactly this)

**GYD $20,000 per semester** (optionally broken down as **GYD $5,000 per session**, "depending on the
semester schedule"), with the next semester starting **September 1, 2026** (`NEXT_SEMESTER_START` in
`src/data/programs.ts` — shared across the K-8 journey, `/lp/*`, and `/gy/*`) — see `GUYANA_PRICING`
in `guyanaCampaigns.ts`. No Canadian city schedule or in-person language appears anywhere on these
pages; the trust line is explicitly "Online · Small-group learning · Math, English, writing, coding,
and computer skills."

There is no secondary lead-capture form on these pages — every CTA goes straight to registration.

### Compliance language

Only "supports NGSA skill-building" / "helps strengthen skills used in NGSA preparation" —
**never** "guaranteed," "official NGSA program," "Ministry-approved," or "certified by the Ministry."
The `/gy/ngsa-digital-skills` page's `complianceNote` field carries this explicitly, and
`GUYANA_COMPLIANCE_DISCLAIMER` repeats a shorter version in `GYFooter` on every Guyana page.

## CODEship Academy learning platform (`/academy`)

A separate, authenticated product surface from the marketing site above — the actual K–8 lesson
engine (Phase 0 of the "adaptive learning platform" build). Isolated the same way `/lp` and `/gy`
are: its own layout (`src/app/academy/layout.tsx`), never linked from the main `Navigation`/`Footer`.

### Curriculum content — transcribed from the real Curriculum Guides, not invented

`src/data/academy/curriculum/{explorers,builders,developers,engineers}.ts` hold every level's 20
lessons (4 classes × 4 semesters + capstone), 4 projects + capstone project, theory units, and
quizzes, transcribed from the attached `*_Curriculum_Guide.pdf` files. Run `npm run verify:academy`
(the integrity gate) to check structural completeness — it fails the build on a missing field, a
lesson count that doesn't match 20, a quiz with the wrong question count, or an unsolvable block
puzzle.

**Quiz question text**: only the Explorers guide (S1 Quiz 1/2, S2 Quiz 1) and the French
`Explorateurs_Guide_Pedagogique.pdf` inline literal quiz wording — every other quiz's guide gives
just the format (10 Q, formative + summative) and topic list, not the words themselves (the real
wording lives in the separate Quiz Pack PDFs, which weren't transcribed). Those quizzes are marked
`authored: true` in the data files: written to test the exact documented concepts/rubric criteria,
in the same style as the verbatim ones. Swappable with verbatim Quiz Pack text later without a
schema change.

**French**: `src/data/academy/curriculum/explorers.fr.ts` is a real translation from the attached
Trousse Explorateurs (`Explorateurs_Guide_Pedagogique.pdf`) — Québec-specific (Cadre de référence de
la compétence numérique), not a direct translation of the English guide. It's the only level with a
FR kit; `getLocalizedLevel()` merges it field-by-field over the English source, falling back to
English for anything untranslated, and `npm run verify:academy` checks 100% lesson coverage. The
`?lang=fr` query param switches locale on every academy content page.

### Explorers block puzzles — solver-verified, not hand-typed

`src/lib/academy/blocks/{interpreter,solver}.ts` — a small interpreter for the CODEship Blocks
subset (trigger/motion/looks/sound/control blocks) and a real BFS solver. Every puzzle in
`explorers.ts` is built through `makeBlockPuzzle()`, which runs the solver at module-load time — a
puzzle's `par` (minimum block count) is therefore a proven fact, and an accidentally-unsolvable
puzzle throws at build time instead of shipping broken. Builders/Developers/Engineers use real code
sandboxes instead (`CodeSandbox.tsx`: sandboxed iframe for HTML/CSS and JavaScript, Pyodide loaded
on demand for Python) — no block puzzles at those levels, matching what the guides describe.

### Data model & auth

`supabase/schema.sql` — content tables (read-only to any signed-in academy user) plus roster/progress
tables with RLS on every table. Reuses PR #14's exact conventions: `src/lib/supabaseAdmin.ts`
(`getSupabaseAdmin()`) and `src/lib/env.ts` (`getEnv()`, Cloudflare `getRequestContext().env` with a
`process.env` fallback for `next dev`) — both features can share one Supabase project. New
`NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` client vars were added because Next.js
requires that prefix for anything read in the browser; the brief's plain `SUPABASE_URL`/
`SUPABASE_ANON_KEY` names are kept for the server-only service-role client, matching PR #14.

Students never provide an email (COPPA/PIPEDA: no child PII beyond a teacher-set display name) —
they use Supabase **anonymous sign-in**, linked to a roster row a teacher pre-creates via a class
code + PIN (`src/app/api/academy/join/route.ts`, `.../roster/route.ts`). Teachers/parents/school
admins sign in with an email magic link; those role rows are provisioned by CODEship staff, not
self-serve, in this phase.

**Capstone/semester gating is server-enforced**, not just UI-hidden: `project_submissions`,
`quiz_results`, and `capstone_results` have no client insert/update RLS policy at all — they're only
written by `POST /api/academy/progress` (grades quizzes server-side against the answer key) and
`POST /api/academy/mark` (teacher-only; evaluates a capstone's rubric against its `pass_rule`). A
student's own browser client can read these tables but cannot self-report a pass. See
`src/lib/academy/gating.ts`.

### Mastery graph (Phase 1)

`src/data/academy/curriculum/masteryGraph.ts` adds `strand`, `capstoneGate`, `prerequisites`,
`misconceptions`, `branches`, `rubric`, `provincialTags`, and `locales` to every lesson, per the
brief's schema — as a companion layer merged on by `applyMasteryGraph()`, not by editing the 80
Phase 0 lesson literals directly (a Phase 2 lesson addition doesn't have to touch this file's shape).
What's hand-authored vs. computed, and why:

- **`provincialTags`** — hand-authored per level × semester from the 4 crosswalk PDFs (`ON` from each
  Curriculum Guide's own embedded Ontario alignment; `BC`/`AB`/`QC` from `Crosswalk_BC.pdf`/
  `Crosswalk_AB.pdf`/`Crosswalk_QC.pdf`). The crosswalks map at semester granularity, so the 4 classes
  in a semester share that semester's tags — that's the real granularity of the source documents, not
  a shortcut.
- **`strand`** — hand-assigned per level × semester, directly from each crosswalk's own
  framework-dimension language for that semester (e.g. BC's "Computational thinking — data & models"
  → `strand: "data"`).
- **`misconceptions`** — hand-authored per lesson (80 total), since this is genuine pedagogical
  content — a plausible common error for that lesson's specific concept — that can't be derived from
  existing fields. Used later by the Phase 3 AI tutor to diagnose what a student is stuck on.
- **`prerequisites`, `capstoneGate`, `branches`, `rubric`, `locales`** — computed from fields Phase 0
  already has (`orderIndex` → a linear per-level prerequisite chain; `accommodationNotes.gifted`/
  `dyslexia`/`anxiety`/`adhd` → stretch/support branches; `objective`/`assess` → a 3-level rubric;
  `CURRICULUM_TRANSLATIONS` → locale coverage). Computing these instead of hand-typing 80 graph edges
  is what makes "no orphan/cyclic prerequisite" a structural guarantee rather than something to
  proofread.

`npm run verify:academy` fails the build on a missing mastery-graph field, an orphan prerequisite, a
prerequisite cycle (DFS-detected), an unresolved (empty) provincial ref, or a capstone-semester
lesson whose gate wouldn't actually block progression (no prerequisite chain behind it).

### "Coding in the Age of AI" strand (Phase 2)

Five skills — decomposition as specification, prompting as precise instruction, verifying/critiquing
AI output, spotting confident-but-wrong answers, iterating with a collaborator — woven into **7
existing touchpoint lessons** across all 4 levels, not added as new lessons. Confirmed with the user
before starting: every level is fixed at 20 lessons, a number already published on the marketing site
(`PROGRAM_STRUCTURE.sessionsApprox`), so this phase extends lessons that already sit closest to each
skill (e.g. Developers' S3 "Fact or Fake?" is already the guide's own "Exemplar semester" for
AI/algorithm literacy; Engineers' S3-C3 already teaches prompt design directly) rather than inventing
new curriculum. Full rationale, including why each specific lesson was chosen, in
`docs/coding-in-the-age-of-ai-strand.md`.

Every touchpoint is a **sandboxed, teacher-framed "check the machine's work" task** — a pre-written
example the class examines together. None introduces a live, open-ended AI chat for children; that's
a different, separately-guardrailed surface (Phase 3's `/api/tutor`). `npm run verify:academy` checks
every level has at least one touchpoint, all 5 skills are covered somewhere, and the lesson count
didn't change.

### Misconception-aware AI tutor (Phase 3)

`POST /api/tutor` (edge runtime) is a student-authenticated hint endpoint. Its request contract —
`{ lessonId, locale, currentCode, attemptHistory }` — deliberately has **no free-text chat field at
all**. That's not a prompt-level guardrail on top of an open chat; it's a structural one, because an
open-ended conversation with a child can never start on a contract that has nowhere to put one. The
response (`{ hintText, diagnosedMisconceptionId, escalationLevel }`) is forced via
`tool_choice: { type: "tool", name: "provide_hint" }` on the Anthropic Messages API (called via raw
`fetch`, no SDK dependency), so the model can't return anything but that shape.

- **Auth**: same session-token pattern as `/api/academy/progress` — `Authorization: Bearer` header,
  `getSupabaseAdmin().auth.getUser()`, then a `students` row lookup by `auth_user_id`. Returns
  `missing_session`/`invalid_session`/`not_a_student` before touching the model. Verified without a
  live Supabase project: a request with no `Authorization` header returns `401 {"error":
  "missing_session"}` against the dev server.
- **Locale-aware**: only responds in French if the specific lesson actually has FR content
  (`lesson.locales.includes(locale)`); otherwise falls back to English rather than mixing a French UI
  label onto untranslated English lesson text.
- **Guardrails** (`src/lib/academy/tutor/prompt.ts`): reading level scaled to the student's age band,
  stay strictly on this lesson, never hand over the literal answer, escalate hint specificity only
  after repeated attempts (levels 1–3), pick `diagnosedMisconceptionId` only from the lesson's own
  `misconceptions` list (or omit it), 1–3 sentences.
- **Fallback, not failure**: no `ANTHROPIC_API_KEY`, a model error, or an 8-second timeout all fall
  through to `getCannedHint()` — a real hint derived from the lesson's own `teach`/`objective`/
  `assess` fields (localized), not a generic "try again" message. This is what makes the endpoint
  fully testable without live credentials, and it's exercised by `npm run test:tutor` — 7 seeded
  buggy-state fixtures across all 4 levels (including one French Explorers case), verified against the
  fallback path now and re-runnable against the live model once a real key is set.

### Teacher co-pilot (Phase 4)

Two teacher-authenticated edge routes, sharing the tutor's Anthropic transport
(`src/lib/academy/aiClient.ts`, extracted from `tutor/anthropic.ts` in this
phase so both consumers call one tool-forcing `fetch` helper instead of two
near-identical copies):

- **`POST /api/coach/plan`** — `{ classId }` → a prep briefing for the class's current semester
  (`{ talkingPoints, watchFor, groupingSuggestion }`). Built from **class-wide aggregates only** —
  per-lesson mastered/in-progress/not-started counts and summed `misconception_flags` counts. The
  model is never given a student name or id, even though the teacher requesting the briefing already
  has legitimate roster access to those names — a third-party API call is the wrong place for child
  roster data when an aggregate answers the question just as well. Falls back to a plan derived
  directly from curriculum + aggregate data (`getCannedPlan()`) on any error/timeout/missing key.
- **`POST /api/coach/note`** — `{ classId, rawNote }` → `{ polishedNote }`, a grammar/structure cleanup
  of a teacher's quick session note. Unlike the tutor, this route **does** accept freeform text, and
  that's a deliberate, not overlooked, difference: a teacher jotting a colleague-facing note about
  their own class is a fundamentally different risk profile from an open-ended chat surface handed to
  a child — same reasoning schools already apply to existing (human-only) note-taking. The route only
  transforms text; it never persists anything. Saving is a direct client-side `supabase.from(
  "session_notes").insert(...)`, which was already possible before this phase (`schema.sql`'s
  `teachers_write_session_notes` RLS policy predates Phase 4) but had no UI — this phase is what
  actually uses that table. Falls back to trivial whitespace/capitalization cleanup, explicitly labeled
  as non-AI in the UI, on any error/timeout/missing key.

Both routes are wired into the teacher class page (`RosterClient.tsx`): a "Get prep briefing" button
and a note composer with "Polish note" / "Save note". `npm run test:coach` exercises 3 plan fixtures
(a trending-misconception class, a brand-new class, a fully-mastered class) and 3 note fixtures against
the fallback path now, re-runnable against the live model once a key is set — same pattern as
`npm run test:tutor`.

### Known gaps — flagged, not silently resolved

- **Not seeded to a live Supabase project.** `supabase/schema.sql` and `npm run seed:academy` are
  written and type-checked but never run against real infrastructure — this session has no
  `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`. Provision a project, apply the schema, then run the
  seed script.
- **Magic-link teacher/parent/admin accounts aren't self-serve.** Those three role tables need rows
  created by whoever holds the service-role key (or a future admin UI) before someone can sign in as
  that role — flagged in the login page's own copy rather than hidden.
- **Builders/Developers/Engineers have no French kit** in what was provided — only Explorers does.
  `getAvailableLocales()` correctly reflects this (no FR toggle on those levels) rather than showing
  a broken/partial translation. **By explicit direction, a French pass across all 4 levels is planned
  as its own step after Phase 4 completes** — not per-phase, so it isn't repeated 4 times.
- **Provincial tags are validation drafts**, same caveat as the source crosswalk PDFs themselves —
  every cell needs checking against the current official provincial document before any public claim
  ("aligned to / maps to / supports" language only, never "endorsed"/"approved").
- **`/api/tutor` and `/api/coach/*` not exercised against the live Anthropic API.** No
  `ANTHROPIC_API_KEY` this session — auth-gating and every canned-fallback path are verified
  (`npm run test:tutor`, `npm run test:coach`, plus manual curls against the dev server confirming the
  401 on a missing session for all three routes), but the real-model paths (tool-forced JSON output)
  have only been exercised by TypeScript's type checker, not a live call. Same fixtures re-run against
  the real model the moment a key is set.
- **This was the last planned build phase.** By explicit direction, the remaining work is the deferred
  French-for-all-4-levels pass (see above) — no further phases are queued after that.
- **No production polish pass**: the teacher/parent/admin views are functional MVPs (a plain table,
  no pagination, no bulk actions) — real but intentionally not pixel-final.
- **Code sandboxes are real but unproctored**: nothing stops a student from writing something other
  than the lesson's intended code in the JS/Python sandbox — grading is via the block-puzzle solver
  (Explorers) or teacher rubric review (everyone else), not static analysis of submitted code.
- **`/api/coach/plan`'s aggregation reads `mastery_state.misconception_flags`, which nothing writes yet.**
  The column exists (Phase 0 schema) and the tutor *diagnoses* a misconception per hint
  (`diagnosedMisconceptionId`), but no route currently persists that diagnosis back onto the student's
  `mastery_state` row — so `watchFor` will show real data once quizzes/projects flag misconceptions
  through some future write path, but is empty today even on a live project. Flagged rather than wired
  up silently, since deciding *when* a hint's diagnosis should count as a flag (one hint vs. a repeated
  pattern) is a product judgment call, not a mechanical follow-on to this phase.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
