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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
