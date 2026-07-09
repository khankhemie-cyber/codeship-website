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
`trackLeadSubmit` stubs, each called with `{ program, location? }` (plus whatever UTMs/email domain
are relevant). They currently `console.debug` in development. To wire up real analytics, uncomment
and fill in the `gtag`/`fbq` calls inside `dispatch()` in `src/lib/analytics.ts`.

## Paid-ad landing pages (`/lp/:slug`)

Five standalone, conversion-focused landing pages for paid campaigns live at `/lp/explorers`,
`/lp/builders`, `/lp/developers`, `/lp/engineers`, and `/lp/quebec-fr` (fully French). Each matches
one ad's message, presents one program, and drives one action — register via the existing form, or
grab a free sample kit. See `CAMPAIGN_KIT.md` for the full messaging/ad-copy/compliance kit.

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
  per-level × per-location ad copy sets, audience map, lead-magnet map, UTM plan, compliance
  checklist) that the marketing team and ad platforms read from.

### Location targeting

Each LP reads `utm_content` (falling back to `?loc=`) from the incoming URL to default the location
bar. If neither is present, the full 5-city + online selector shows expanded instead of collapsed.
Whatever the visitor lands on or picks flows straight into the registration URL's `utm_content` —
`src/components/lp/LPView.tsx` is the orchestrator; `LocationBar` is the selector itself.

### Sample-kit lead capture

The secondary CTA ("Get a free sample kit") is a single email field — the *only* form on an LP, and
it is a lead magnet, not a registration. It calls `leadCapture()` (`src/lib/leadCapture.ts`), which is
currently a stub that just logs in development. Wire it to your real ESP/CRM endpoint, and see
`LEAD_MAGNETS` in `campaign_kit.ts` for which PDF (placeholder paths under `/downloads/`) maps to
which campaign — swap in the real files before launch.

### Swapping in real assets before launch

- **Testimonials**: `LPView`'s proof section renders an explicit "add a real testimonial here" slot —
  no quotes or names were fabricated. Replace it with real, permissioned parent testimonials.
- **Hero/OG images**: `variants.ts` (`heroImage`) and `campaigns.ts` (`ogImage`) currently point at the
  same stock photography already used on the main site. Swap in campaign-specific assets per LP.
- **French copy**: `/lp/quebec-fr`'s copy was drafted by direct translation of the authoritative
  English curriculum facts and needs a native French-speaker pass before it runs as a live ad
  destination (see the compliance checklist in `CAMPAIGN_KIT.md`).

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
