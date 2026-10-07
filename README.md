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
  the Oshawa venue (`IN_PERSON_VENUE` — Core21, 21 Simcoe St South), the Saturday schedule
  (Explorers & Builders 9:00–10:00 AM, Developers & Engineers 11:30 AM–12:30 PM — see
  `IN_PERSON_SATURDAY_AGENDA`), and the online schedule: Tuesdays 4:00–4:55 PM ET (Explorers) / 5:00–5:55
  PM ET (Builders), Thursdays 4:00–4:55 PM ET (Developers) / 5:00–5:55 PM ET (Engineers) — see `ONLINE`.

Both are consumed by `JourneyMap` (home page + `/programs#journey`), `ProgramLocationSelector`
(the location/schedule picker on each `/programs/[slug]` page), and `AlignmentStrip`.

### Registration & payment — Corsizio (Canada) + HubSpot (Guyana)

Canadian program registration, payment, seat caps, waitlists, receipts, and refunds are all handled by
**Corsizio**, not this website. This site's job for those pages is to send families to the correct
Corsizio event and show the correct schedule. Guyana keeps the original HubSpot lead-capture form —
see the [Guyana section](#guyana-online-course-landing-pages-gyslug) below for why.

- `src/config/corsizioEvents.js` — the single source of truth mapping `{ program, location }` to a
  Corsizio event URL (CAD, one account for all 5 in-person cities + online). `getCorsizioUrl(program,
  location)` returns the URL, or `null` if that combination isn't live yet.
- `src/config/corsizioSchedule.js` — the mode-correct class days/dates/times per program
  (`CORSIZIO_SCHEDULE[program].inperson` / `.online`), shown next to the CTA on `/programs/[slug]` and
  `/lp/:slug` so visitors always see the right schedule for the mode they picked — online classes run
  on different days/dates than in-person and must never show the in-person Saturday dates.
- `src/lib/corsizioLink.ts` — `withUtmParams(baseUrl, searchParams)` appends any `utm_*` params found
  on the current page's URL onto the outgoing Corsizio link, so ad/campaign attribution survives the
  hand-off.

`ProgramLocationSelector` (`/programs/[slug]`) and `LPView`/`LocationBar` (`/lp/:slug`) both resolve
the CTA the same way: `getCorsizioUrl(program, location)` → append UTMs → open in a new tab. When a
program+location has no Corsizio URL yet, the CTA is disabled and reads "Registration opening soon"
instead of linking anywhere.

`/register` serves two purposes: for CAD requests (`?program=&location=`) it resolves the matching
Corsizio URL and forwards there (carrying `utm_*` through) — kept for old bookmarked/emailed links. For
Guyana requests (`?country=guyana`, built by `buildGuyanaRegistrationUrl`) it renders the HubSpot
`RegistrationForm` instead, unchanged from before the Corsizio migration. Anything else falls back to a
page pointing back to `/programs`.

### Analytics

`src/lib/analytics.ts` exports `trackView`, `trackSelectLocation`, `trackRegisterClick`, and
`trackPriceView` stubs, each called with `{ program, location? }` (or `{ page, country, location }`
on the Guyana pages) plus whatever UTMs are relevant. They currently `console.debug` in development.
To wire up real analytics, uncomment and fill in the `gtag`/`fbq` calls inside `dispatch()` in
`src/lib/analytics.ts`.

## Paid-ad landing pages (`/lp/:slug`)

Five standalone, conversion-focused landing pages for paid campaigns live at `/lp/explorers`,
`/lp/builders`, `/lp/developers`, `/lp/engineers`, and `/lp/quebec-fr` (fully French). Each matches
one ad's message, presents one program, and drives one action — register via Corsizio.
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
Whatever the visitor picks resolves to that program+location's Corsizio URL via `getCorsizioUrl` —
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

### Guyana is not a K-8 program, and stays on the HubSpot form

The main site's CAD registration (`src/config/corsizioEvents.js`) is keyed to a specific program
(explorers/builders/developers/engineers) × Canadian location. Guyana registrations are a generic
**online semester** priced in GYD, and Corsizio is one-currency-per-account, so a CAD-account Corsizio
event was never the right fit here. Guyana CTAs stay on the original HubSpot lead-capture form instead
of moving to Corsizio.

`GYView` builds its CTA with `buildGuyanaRegistrationUrl({ page, source?, medium?, campaign?, content?,
term? })` (`src/lib/buildGuyanaRegistrationUrl.ts`), which appends UTMs plus `country=guyana`,
`location=online`, and `page` onto `/register`. `/register` detects `country=guyana` and renders
`RegistrationForm` (the same `HubSpotForm` embed used before the Corsizio migration) instead of
attempting a Corsizio redirect.

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
semester schedule"), with the next semester starting **the week of September 14, 2026**
(`GUYANA_NEXT_SEMESTER_START` in `src/data/guyanaCampaigns.ts` — Guyana-specific, independent of the
Canadian `CORSIZIO_SCHEDULE`) — see `GUYANA_PRICING` in `guyanaCampaigns.ts`. No Canadian city schedule
or in-person language appears anywhere on these pages; the trust line is explicitly "Online ·
Small-group learning · Math, English, writing, coding, and computer skills."

There is no secondary lead-capture form on these pages — every CTA goes straight to registration.

### Compliance language

Only "supports NGSA skill-building" / "helps strengthen skills used in NGSA preparation" —
**never** "guaranteed," "official NGSA program," "Ministry-approved," or "certified by the Ministry."
The `/gy/ngsa-digital-skills` page's `complianceNote` field carries this explicitly, and
`GUYANA_COMPLIANCE_DISCLAIMER` repeats a shorter version in `GYFooter` on every Guyana page.

## Student tools (`/tools/*`)

`/tools/launchpad` (**CODEship Launchpad**, formerly "Web Playground"; `/tools/web-playground` redirects
there and keeps the `#code=` fragment) is an HTML/CSS/JavaScript editor with a live preview and console, for students
to use in class. Like `/lp/*`, it is **direct-link only**: `src/app/tools/layout.tsx` drops the main
site chrome, nothing in `Navigation`/`Footer` links to it, it is not in `sitemap.ts`, `robots.ts`
disallows `/tools/`, and it is `noindex` (page metadata plus `X-Robots-Tag` in `public/_headers`).

- **Progress lives in the link.** Every edit is compressed (deflate) into the URL's `#code=` hash, so
  the address bar is always a link to the student's latest work. "Save link" copies it. The hash never
  reaches the server, so nothing is stored on our side. A localStorage copy restores work when the
  bare URL is reopened on the same device. A link is a snapshot: after more edits, save a new one.
- **Sandboxed.** Student code runs in an iframe sandboxed without `allow-same-origin`, so it can't read
  the site's cookies, storage, or page.
- **Editor & UI.** CodeMirror 6 (syntax highlighting, autocomplete, bracket matching, search, per-file
  undo history), "Missions" (starter templates), light/dark themes in the brand palette (navy `#001532`, gold
  `#F4D734`, teal `#138A9A`, purple `#6E43A8`), EN/FR interface, desktop/tablet/phone preview sizes,
  open-in-new-tab (still sandboxed), and a console whose error rows jump to the line in `script.js`.
  Theme, language, text size and layout are remembered per device in localStorage.
- Code lives in `src/components/tools/launchpad/`: `lib.ts` (preview document + the link format; don't
  change the format without keeping old links decodable), `templates.ts`, `i18n.ts`, `CodeEditor.tsx`,
  `Launchpad.tsx`. The localStorage keys keep the old `codeship-web-playground` name on purpose.

### `/tools/python` (CODEship Python)

A one-file Python console for the Engineers programme (ages 11–14): `checker.py`, a **Run** button
(or Ctrl/Cmd+Enter) and an output panel. Same direct-link-only rules as the Launchpad. Things it
deliberately does **not** have, because the lessons depend on students doing them: autocomplete,
snippets, bracket auto-closing, auto-dedent of `else:`, "explain this error", AI help, `input()`,
`pip`/`micropip`, multiple files, a REPL.

**How Python is loaded and cached.** Python runs in the browser via [Pyodide](https://pyodide.org)
(pinned at an exact version in `package.json`; it currently ships Python 3.14). Nothing runs on our servers.
- `scripts/copy-pyodide.mjs` runs before `dev` and `build` and copies the five runtime files from
  `node_modules/pyodide` into `public/py/pyodide-<version>/` (gitignored). We serve them from our own
  origin rather than a CDN, so no third party sees students' requests and a school filter that
  blocks CDNs can't break a class.
- The folder name carries the version, so `public/_headers` caches it as `immutable` for a year.
  After the first visit a Chromebook loads Python from its own cache.
- The page starts a module Web Worker (`public/py/worker.js`) as soon as it opens, so Python is
  usually ready before a student finishes typing. Running in a worker means an infinite loop can't
  freeze the tab: **Stop** terminates the worker and boots a fresh one.
- Cold load (measured in Chromium with throttling, gzip): about 6.3 MB over the wire, ready in
  ~3 s on fast broadband, ~5 s at 20 Mbps, ~7 s at 10 Mbps, ~12 s at 5 Mbps. A whole class
  loading at once on one school connection shares that bandwidth, so ask students to open the page
  at the start of class.
- `public/py/runner.py` runs the student's code. It `compile()`s the source itself under the
  filename `checker.py` (Pyodide's own `runPython` silently dedents code, which would hide
  `IndentationError`), shows the **real, unmodified** Python error, drops interpreter frames so only
  the student's lines show, and replaces `input()` with a plain message. If you change `worker.js`
  or `runner.py`, bump `RUNNER_VERSION` in `src/components/tools/python/runtime.ts`.
- Upgrading Pyodide changes the Python version, and Python's error wording changes between
  versions. Run the tests below and check the printed error text against the workbook cheat sheet.

**Where students' work lives.** Nothing is stored on our server.
1. *Autosave* (`autosave.ts`): localStorage on this computer, ~2 s after typing stops. Labelled
   "Saved on this computer" on purpose. Restored when the page opens without a link. Opening a link
   never overwrites it until the student edits.
2. *Share link* (`share.ts`): **Share link** copies `/tools/python/#c=1<payload>`. The payload is
   raw deflate of the UTF-8 file, base64url-encoded; the `1` is the format version. It's in the
   fragment, so it never reaches the server. The address bar is also kept up to date as students
   type, so a refresh or a copied address bar never loses work.
3. *Download / Open* `checker.py`: a real `.py` file, the durable backup and the portfolio piece.
   Open it from the file picker or by dragging it onto the page. (CRLF line endings in a file
   edited on Windows come back as LF.)

**Size limit in practice.** Share links are capped at **2,000 characters** for the whole URL
(`SHARE_URL_LIMIT`), which is about what mail clients and messaging apps reliably pass through.
Over the cap, Share refuses with "This project is too big to share as a link. Download the file
instead." It never truncates. Measured: the finished Semester 1 student file (1,288 chars, no
comments) is a 688-char payload, about **735 characters** as a full `https://www.codeshipacademy.com`
link; the commented 1,697-char version comes to about 1,000. Varied code compresses to roughly
half its size and base64 adds a third, so the cap works out at roughly 2.5–3.5 KB of typical
Python. Repetitive code goes further.

**Adding stored projects later** (multi-file projects will need them): only `share.ts` knows the
link format. `createShareLink()` and `readSharedCode()` are already async, so a short-code link
such as `#p=<id>` can be resolved there without touching the editor. Keep `#c=1` links decodable
forever: instructors keep a sheet of them.

**Tests** (cases from the Semester 1 lesson plans; CI runs both in
`.github/workflows/python-console.yml`):
- `npm run test:python`: every lesson program, error and silent-failure case through `runner.py`
  on the same Pyodide build, in Node. A few seconds, no browser. Prints the real error text.
- `npm run build && npm run test:python:e2e`: the real page in Chromium. Share link round-trip
  and length, oversize refusal, autosave and link priority, download/open/drag-and-drop
  byte-identity, editor indentation keys, Stop, and a 150%-zoom Chromebook viewport. Needs
  Chromium for Playwright (`npx playwright-core install chromium`, or set `CHROMIUM_PATH`).
- Code: `src/components/tools/python/` (`PythonConsole.tsx`, `PythonEditor.tsx`, `share.ts`,
  `autosave.ts`, `runtime.ts`), `public/py/`, `scripts/test-python*.mjs`, `scripts/python-fixtures/`.

### `/tools/blocks` (CODEship Blocks, Explorers)

Picture-block coding for the Explorers programme (ages 5–7, four semesters). Children build with
pictures and colours; the instructor does all typing (`Say` words), settings and saving. Built on
[Blockly](https://developers.google.com/blockly) 13 (Apache-2.0, pinned) for the block editor;
the stage, characters and the engine that runs the blocks are ours.

- **The twenty blocks** (`blockDefs.ts`) are the whole vocabulary: do not add more without the
  curriculum changing. Colour groups match the printed books exactly: Start `#D58401`, Move
  `#E6ECF4`, Say/Record `#035762`, Fun `#4E2B6F`, Control `#012C61`. Gold and pale blocks use navy
  text. Settings (⋯, per device): English/French, "pictures and words" or "pictures only", and a
  palette filter by semester (default: all twenty).
- **How blocks run** (`engine.ts`, pure TypeScript): every stack is a thread on a 10 × 8 grid.
  Timings: a move is 0.3 s, `Say` holds 1.5 s (the bubble stays until that character's next `Say`),
  `Wait N` is N s, `Grow`/`Shrink` go 7 steps each way. Arriving on a page resets its characters
  and runs its Green Flag stacks; the green flag button does the same for the current page.
  `Go to Page` waits (up to 10 s) for the other characters on the page to finish, so a message sent
  just before a page turn plays out. A bump is a visible character moving onto another visible
  character's square. Silent failures the lessons rely on (empty `Repeat`, unheard `Send Message`,
  a `Go to Page` dead end, hidden characters not bumping) are deliberate and tested.
- **Project format** (`model.ts`): JSON `{ format: "codeship-blocks", version: 1, name,
  characters, pages, recordings }`. A character (a built-in picture) can appear on several pages;
  each appearance (an *actor*) has its own starting square and its own blocks, stored as Blockly's
  workspace JSON. Page 1 is the map. Bump `version` and migrate in `parseProject` if this changes:
  instructors keep these files.
- **Recordings** (`audio.ts`, `RecorderPanel.tsx`): tap a `Record` block to open Record / Stop /
  Play. Capped at 15 s, with a level meter and a "very quiet" warning; re-recording replaces the
  clip with no warning. Saved as 16 kHz mono WAV (plays in every browser, unlike each browser's own
  recording format), boosted up to 8× if quiet, embedded in the project as base64. About 32 KB per
  second: 3 s ≈ 96 KB, the 15 s cap ≈ 480 KB, so a four-recording Semester 4 project is well under
  2 MB.
- **Where work lives** (`files.ts`). Nothing is stored on our server.
  - **Save** downloads `<project name>.codeship`; **Open** (or dragging the file onto the page)
    loads it on any device. This is how work moves between classes.
  - **Autosave** goes to this browser's IndexedDB (localStorage is too small for audio), labelled
    "Saved on this computer". Opening a link or file never overwrites it until someone edits.
  - **Copy link** (`#p=1…`, raw deflate + base64url, capped at 2,000 characters) works only for
    projects without recordings: every Semester 1 project, and the Semester 3 Sorter (≈480
    characters). It refuses, with a reason, rather than dropping recordings.
- **Levels** (`levels.ts`, `LevelsMode.tsx`; the ⭐ Levels tab): 26 reach-the-goal puzzles, 6–8
  per semester, each limited to blocks taught by then. Semester 1: counting squares, turns, a path
  around rocks, collecting apples. Semester 2: a small door you must `Shrink` to fit, a bridge that
  appears 3 s after the green flag (`Wait`). Semester 3: `Repeat` paths and staircases, a ladder for
  a `Start on Bump` stack, a guard dog you can only pass while hidden (`Hide`, then `Show` at the
  goal). Semester 4: coloured gates that open on a matching `Send Message`. Win = the character is
  on the goal, visible, with every apple collected; a miss just stops, with no hint. Maps are 10 × 8
  text grids (legend at the top of `levels.ts`). Every level always opens. Finished levels and each
  level's blocks are remembered in this browser only. `scripts/blocks/level-solutions.mjs` holds a
  reference solution (the instructor's answer key) and the near miss each level is built to catch;
  the tests fail if any level becomes impossible or winnable by doing nothing.
  Each level opens with a short task prompt for 4–5 year olds (`levelPrompts.ts`, English and
  French, at most about ten words) that says what to do, never how. It is read aloud with the
  device's built-in voice when the level opens, stays in a strip above the level, and the 🔊 button
  reads it again. Devices without a voice show the text only.
  Every try starts from the beginning (a second tap doesn't carry on with gates still open); the
  bridge appears a few seconds after the program starts, however it starts; a hiding character
  shows faintly so children can follow it; a coming bridge shows as a dashed outline with its delay
  (⏱ 3); and a bouncing 👆 shows when the character has a `Start on Tap` stack. Hovering over any
  block or level object shows a one-line description of what it does (English/French).
- **Microphone**: "Set up microphone" in ⋯ asks for permission before class. Instructors should
  choose "Allow on every visit". On managed Chromebooks, IT can pre-approve the site with Chrome's
  `AudioCaptureAllowedUrls` policy so no prompt ever appears.
- **Tests** (CI: `.github/workflows/blocks.yml`); fixtures are the finished lesson projects in
  `scripts/blocks/fixtures.mjs`:
  - `npm run test:blocks`: all four semester projects and their deliberate-failure variants, plus
    every level's solution and near miss, through the real engine on a virtual clock. Needs Node 22 (runs the TypeScript directly).
  - `npm run build && npm run test:blocks:e2e`: the real page in Chromium with a fake microphone.
    Covers record/re-record/play, Save → Open in a fresh browser with recordings playing on the
    right pages, autosave and link priority, finger drag, 150% zoom, labels and semester filter.

## Staff certificates (`/admin/certificates`)

A password-protected page where staff issue a CODEship-branded PDF certificate and email it to
the family straight away. For every program (Explorers, Builders, Developers, Engineers) there is a
**semester certificate** (Semester 1–4, naming that semester's project and skills) and a **program
certificate** (all four semesters + the capstone). Staff pick the program and certificate, type the
child's name, completion date, optional instructor, and the parent's email (plus an optional
greeting name and personal note), check the live preview, then **Email certificate** or
**Download PDF**. After sending, the program/certificate/date/instructor stay selected so a whole
class can be issued in a row.

- Template: `src/lib/certificates/certificate.ts` (pdf-lib, US Letter landscape). Program names,
  projects, skills and capstones come from `src/data/programs.ts`; artwork is
  `public/certificates/{logo,seal}.png`. The same code renders the browser preview and the emailed
  PDF; the server always rebuilds the PDF from the details, it never emails an uploaded file.
- API: `/api/certificates/verify` (password) and `/api/certificates/send` (builds + emails via
  [Brevo](https://www.brevo.com)'s transactional email API). Email copy lives in `src/lib/certificates/server.ts`.
- Not linked anywhere, `noindex`, disallowed in `robots.ts`, not in the sitemap.
- Names print in the standard PDF fonts, which cover Latin letters with accents (é, ñ, ü…) but not
  other scripts; the page says so if a name can't be printed.

**Setup (Cloudflare Pages → Settings → Environment variables):**

| Variable | |
| --- | --- |
| `CERTIFICATES_PASSWORD` | Staff password for the page (required). |
| `BREVO_API_KEY` | Brevo API key: Brevo → SMTP & API → API keys (required to email). |
| `CERTIFICATES_FROM_EMAIL` | Sender, e.g. `CODEship Academy <certificates@codeshipacademy.com>`. Must be a sender or domain verified in Brevo (Senders, Domains & Dedicated IPs). |
| `CERTIFICATES_REPLY_TO` | Optional: where family replies go, e.g. the office inbox. |
| `CERTIFICATES_BCC` | Optional, comma-separated: gets a copy of every certificate sent (a simple record). |

Tests: `npm run test:certificates` renders every program × certificate, checks validation and the
email (Brevo stubbed). Add `-- --out <dir>` to keep the PDFs for a look.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
