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

## Stripe checkout & refund policy

One-time (per-term) payment via **Stripe Checkout (hosted)**, created by a server-only edge route —
no Stripe secret ever reaches the client bundle. The client only ever receives a Checkout Session
`url` and redirects to it (`window.location.href = url`); no `stripe-js` / Elements is loaded.

### Env vars

Set these as **Cloudflare Pages environment variables/secrets** in production/preview (read via
`getRequestContext().env` in `src/lib/env.ts`, same pattern as the existing
`FRANCHISE_PASSWORD_*` vars in `verify-franchise-auth`). For local `next dev`, put them in
`.env.local` instead (see `.env.example`) — `getEnv()` falls back to `process.env` when there's no
Cloudflare request context.

| Var | Used by | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | `create-checkout-session`, `stripe-webhook` | `sk_test_…` → `sk_live_…` at launch. Server-only. |
| `STRIPE_WEBHOOK_SECRET` | `stripe-webhook` | `whsec_…`, created per-endpoint (Test and Live get different values) — see go-live checklist. |
| `STRIPE_PUBLISHABLE_KEY` | *(reserved, unused today)* | `pk_test_…` → `pk_live_…`. The current flow is a pure server-redirect, so no client code reads this yet — kept here so a future Stripe.js/Elements embed doesn't need a new env var. |
| `CURRENT_TERM` | `create-checkout-session` | e.g. `2026-Sept`. Single source of truth for the term stamped on every session/order — change this one value each term, no price or code edits. |
| `SUPABASE_URL` | `stripe-webhook` | Project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | `stripe-webhook` | Service-role key — server-only, never exposed client-side. Used to upsert `orders` / insert `payment_failures` (see `supabase/schema.sql`). |

### Catalog — reference by lookup key only

`src/data/catalog.ts` holds `PRICE_LOOKUP_KEYS` (one multi-currency Price per program, CAD default +
USD via `currency_options`) and `PROGRAM_PRICING` (display-only mirror of the CAD/USD amounts, never
sent to Stripe). No `price_...` ID is ever hardcoded — `create-checkout-session` resolves the Price
at request time via `stripe.prices.list({ lookup_keys: [...] })`.

| Program | Lookup key | CAD | USD |
|---|---|---|---|
| Explorers | `explorers_term_cad` | 175 | 135 |
| Builders | `builders_term_cad` | 175 | 135 |
| Developers | `developers_term_cad` | 199 | 156 |
| Engineers | `engineers_term_cad` | 199 | 156 |

**Currency:** `/programs/*` and `/lp/*` charge CAD; `/gy/*` would charge USD if/when it gets checkout
(see "Known gaps" below). Checkout Sessions don't accept a top-level currency override for an
existing Price, so when the requested currency isn't the Price's default, `create-checkout-session`
reconstructs the line item from that Price's own `currency_options[currency]` (still resolved from
the same lookup key — never a second hardcoded price).

### Checkout flow

`<CheckoutButton>` (`src/components/CheckoutButton.tsx`) renders a "Class minimum & refunds" summary,
a **required** checkbox ("I have read and agree to the Class Minimum & Refund Policy and the Terms of
Service") that gates the pay button, and posts `{ program, location, currency, policyAcceptedAt,
returnPath, utm }` to `POST /api/create-checkout-session`. That route resolves the price by lookup
key, sets `mode: 'payment'`, stamps `metadata` (`program, location, mode, term, utm_*,
policy_version, policy_accepted_at`) on both the session and `payment_intent_data`, and returns the
Checkout `url`. It's wired into `ProgramLocationSelector` (`/programs/:slug`, primary CTA) and
`LPView` (`/lp/:slug`, inside the Offer panel) — both CAD. The existing HubSpot `/register` flow is
left in place as a secondary "talk to us first" link everywhere `<CheckoutButton>` was added, so no
existing lead-capture path was removed.

### Webhook (`/api/stripe-webhook`)

Verifies `stripe-signature` with `STRIPE_WEBHOOK_SECRET` via `stripe.webhooks.constructEventAsync`
(the async/Web-Crypto verifier — required on the edge runtime, where Node's `crypto` isn't
available) against the **raw** request body. Handles:

- `checkout.session.completed` → upsert into `orders` (Supabase), status `paid`.
- `checkout.session.expired` → upsert status `expired`.
- `charge.refunded` → update the matching order (`payment_intent_id`) to `refunded` /
  `partially_refunded`, recording `refunded_amount`.
- `payment_intent.payment_failed` → insert into `payment_failures` for follow-up.

A processing error (e.g. Supabase is briefly down) returns 5xx so Stripe retries with backoff —
the payment itself already succeeded or failed on Stripe's side regardless of whether our DB write
lands the first time.

### Refund policy pages

`/policies/refund` (EN) and `/politiques/remboursement` (FR, required for Québec/Bill 96) — both
footer-linked next to Terms of Service and Privacy Policy. `REFUND_POLICY_VERSION`
(`src/data/catalog.ts`) is stamped into session metadata and the `orders` row at checkout time —
bump it whenever the policy copy changes so past acceptances stay attributable to the wording the
customer actually agreed to.

### Known gaps / deliberately deferred

- **`/gy/*` (Guyana) checkout was intentionally not wired up.** Those 5 pages advertise a flat
  **GYD $20,000/semester** generic "online semester" (not tied to a specific
  Explorers/Builders/Developers/Engineers grade band — see `guyanaCampaigns.ts`), while the Stripe
  catalog only has USD prices *per program* (`$135`/`$156`). Charging one of those USD amounts on a
  page advertising a GYD price would silently change what the visitor pays. Wiring this up needs a
  product decision first — most likely adding a lightweight program/grade picker to the GY pages
  (mirroring `ProgramLocationSelector`) so the right USD price can be resolved. See the comment atop
  `src/components/gy/GYView.tsx`.
- No confirmation-email content is defined in this repo — Stripe's own receipt email covers payment
  confirmation today. If a branded confirmation email (with the policy version + a receipt link) is
  needed, that's a Stripe Customer Email / Resend-or-similar integration on top of the
  `checkout.session.completed` handler.

### Go-live checklist

1. **Rebuild the same catalog in Live mode** — 4 products, 4 multi-currency prices, **identical
   lookup keys** (`*_term_cad`), CAD 175/175/199/199 + USD 135/135/156/156, tax-inclusive, `program`
   metadata. Identical lookup keys mean go-live is a key swap, not a code change.
2. **Swap env to Live:** `STRIPE_SECRET_KEY` → `sk_live_…` (and `STRIPE_PUBLISHABLE_KEY` →
   `pk_live_…` if it's ever wired up client-side).
3. **Create the Live webhook:** Stripe Dashboard → Developers → Webhooks → Add endpoint → your
   deployed `/api/stripe-webhook` URL → select `checkout.session.completed`,
   `checkout.session.expired`, `charge.refunded`, `payment_intent.payment_failed` → copy the new
   `whsec_…` into `STRIPE_WEBHOOK_SECRET` (Live and Test have separate signing secrets).
4. Confirm `/policies/refund`, `/politiques/remboursement`, `/terms`, and `/privacy-policy` are live
   and footer-linked.
5. **Validate on real rails cheaply:** create a temporary $1 Live price on any product, buy it with a
   real card, confirm success + webhook + `orders` row + email, then refund it and confirm the
   refund path updates the order. Archive the $1 price afterward.
6. Go live — accept real registrations.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
