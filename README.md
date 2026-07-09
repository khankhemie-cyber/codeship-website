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

`buildRegistrationUrl({ program, location })` appends UTM parameters to `REG_FORM_URL`:

| Param | Value | Purpose |
|---|---|---|
| `utm_source` | `website` | constant |
| `utm_medium` | `registration` | constant |
| `utm_campaign` | the program slug (`explorers`, `builders`, `developers`, `engineers`) | **program** attribution |
| `utm_content` | the location slug (`toronto`, `vaughan`, `oshawa`, `calgary`, `vancouver`, `online`) | **location** attribution |
| `utm_term` | `in-person` or `online-{day}-1600` | schedule slot |

The HubSpot forms embed script executes on `/register`, so it reads the page's own URL — the UTM
parameters above are picked up and attributed automatically with no backend changes. `program` and
`location` are also passed as plain query params; if the HubSpot form is later given hidden fields
named `program` / `location` (Form settings → "prefill fields using URL parameters" in HubSpot),
those values will prefill too. UTM parameters remain the durable source of truth either way.

### Analytics

`src/lib/analytics.ts` exports `trackView`, `trackSelectLocation`, and `trackRegisterClick` stubs,
each called with `{ program, location? }`. They currently `console.debug` in development. To wire up
real analytics, uncomment and fill in the `gtag`/`fbq` calls inside `dispatch()`.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
