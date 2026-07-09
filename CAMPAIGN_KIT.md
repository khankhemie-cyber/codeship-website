# CODEship Campaign Kit

The machine-readable version of everything below lives in `src/data/campaign_kit.ts`
(consumed by the ad-copy tooling and, where relevant, the `/lp/:slug` landing pages)
and `src/data/campaigns.ts` (the landing pages' own content). This doc is the
human-readable companion — update both together.

This kit sells what now exists: the complete K–8 curriculum (four levels, each 4
semesters + capstone), teacher guides, assessments, provincial crosswalks, and a
French Explorers kit, running in 5 Canadian cities (Toronto, Vaughan, Oshawa,
Calgary, Vancouver) plus online (Tue: Explorers/Builders · Thu: Developers/Engineers,
4–6 PM ET, 1 hr).

## 1. Messaging pillars

1. **A real K–8 progression** — Blocks → HTML/CSS → JavaScript → Python + AI, each
   level capstone-gated before advancing.
2. **Project-based & tangible** — every level ends with something real: a robot, a
   website, an app, an AI model — never a worksheet.
3. **Future-ready & responsible** — real Python, hands-on AI with bias & ethics built
   into the curriculum, and practical cybersecurity.
4. **Inclusive by design** — accommodations are built into every level from the start.
5. **Province-aligned, including French for Québec** — aligned to / maps to / supports
   Ontario's baseline, BC's ADST, Alberta's CS/CTF, and Québec's Cadre de référence de
   la compétence numérique, with a full French Explorers kit. Always "aligned to / maps
   to / supports" — never "endorsed" or "approved by" a ministry.

## 2. Per-level one-liners & outcomes

| Level | Grade band | One-liner (ad headline) | Outcome |
|---|---|---|---|
| Explorers | K–1 | Your 5–7 year old's first real coding class. | Gives a computer clear instructions and builds a simple interactive app. |
| Builders | 2–3 | Your child builds their first real website. | Builds and styles a real multi-page website. |
| Developers | 4–5 | Real code that solves real problems. | Builds interactive tools that solve real problems. |
| Engineers | 6–8 | Your teen can build AI — responsibly. | Codes in Python, trains an AI responsibly, and pitches a real tech solution. |

## 3. Ad copy sets

Generated per level × location (5 cities + online) in `AD_COPY_SETS` (`campaign_kit.ts`),
each with: 3 headlines, 2 primary texts, 3 descriptions, Google sitelinks/callouts, and
2 Meta primary-text variants. Location-specific variants are generated from the same
facts (e.g. "Explorers Coding, Calgary" / "Online, Tuesdays 4:00–6:00 PM ET") so copy
never drifts from the real schedule. `QUEBEC_FR_AD_COPY` is hand-authored in French,
not generated from the English template.

Pull a specific set with `getAdCopySet(program, location)`.

## 4. Audience, location & angle map

See `AUDIENCE_MAP` in `campaign_kit.ts`. Summary:

| Level | Parent audience | Top angle | Online day |
|---|---|---|---|
| Explorers | Parents of K–1 kids wanting a first screen-time-positive activity | "Your 5–7 year old's first real coding class." | Tuesday |
| Builders | Parents of Gr 2–3 kids who like building/making | "Your child builds their first real website." | Tuesday |
| Developers | Parents of Gr 4–5 kids interested in problem-solving, money, media | "Real code that solves real problems." | Thursday |
| Engineers | Parents of Gr 6–8 teens interested in AI/tech/cybersecurity | "Your teen can build AI — responsibly." | Thursday |

All four are eligible in all 5 in-person cities plus their online day.

## 5. Landing page → registration routing

| Campaign | Landing page | Registers via |
|---|---|---|
| explorers | `/lp/explorers` | `/register` (existing form) |
| builders | `/lp/builders` | `/register` (existing form) |
| developers | `/lp/developers` | `/register` (existing form) |
| engineers | `/lp/engineers` | `/register` (existing form) |
| quebec-fr | `/lp/quebec-fr` | `/register` (existing form) |

**No new registration form was built** for either the main site or these paid LPs.
Every CTA calls `buildRegistrationUrl()` (`src/lib/registration.ts`), which appends UTMs
to `/register` and lets the existing HubSpot-backed form's own tracking pick them up.

### UTM plan

| Param | Value |
|---|---|
| `utm_source` | `meta` \| `google` (the ad platform — read from the incoming URL when present, else the campaign's default) |
| `utm_medium` | `cpc` \| `paid_social` |
| `utm_campaign` | program slug (`explorers` \| `builders` \| `developers` \| `engineers`) |
| `utm_content` | location slug (`toronto` \| `vaughan` \| `oshawa` \| `calgary` \| `vancouver` \| `online`) |
| `utm_term` | `in-person` \| `online-{day}-1600` |

Every registration is attributable by **program × location** end-to-end, with no new
backend — see `UTM_PLAN` in `campaign_kit.ts`.

## 6. Compliance pass

See `COMPLIANCE_CHECKLIST` in `campaign_kit.ts`. In short:

- Provincial alignment is mapped at the **framework level** and is **validation-ready,
  not yet verified** against official outcome codes. Check each claim against the
  current provincial document before it runs in a live ad or LP.
- Always use **"aligned to" / "maps to" / "supports"** — never "endorsed" or "approved
  by" a ministry.
- No earnings, outcome-guarantee, or unverifiable superlative claims.
- French copy on `/lp/quebec-fr` needs a native-speaker review before launch.

## 7. Tracking plan

Events (fired by the LPs, mirroring the UTM attribution — see `TRACKING_EVENTS` in
`campaign_kit.ts` and `src/lib/analytics.ts`):

| Event | Fires when | Payload |
|---|---|---|
| `program_view` | LP mounts | `{ program, location? }` |
| `select_location` | visitor changes the location/schedule selector | `{ program, location }` |
| `register_click` | visitor clicks any Register/Book-a-trial CTA | `{ program, location }` |

Build the funnel report by joining these events (or the `utm_campaign`/`utm_content` on
the resulting HubSpot contact) — grouped by **program** and **location/province** —
once GA4/Meta Pixel are wired (see README.md).
