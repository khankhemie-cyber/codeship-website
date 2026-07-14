# Corsizio → Zapier → Supabase enrollment sync (documented contract only)

This describes the intended shape of an optional sync that mirrors new
Corsizio registrations into the learning-platform's Supabase `enrollments`
table. **Nothing here is implemented** — no Zap exists yet, and this
marketing/registration site has no backend that writes to Supabase. This is
a contract for whoever builds the sync later, so the shape is agreed up
front.

## Why

Corsizio now owns checkout, seat caps, waitlists, receipts, and refunds —
this website only sends families to the correct Corsizio event (see
`src/config/corsizioEvents.js`). The learning-platform app (lessons,
dashboards, Supabase auth — a separate codebase, out of scope for this
site) still needs to know who's enrolled in what, so student accounts can
be provisioned/matched. That's the only reason a sync is needed; nothing
in this repo depends on it.

## Proposed flow

```
Corsizio (new registration)
   -> Zapier trigger: "New Registration" (Corsizio's native Zapier integration)
   -> Zapier action: insert row into Supabase `enrollments` table
```

Corsizio is the source of truth for payment/seat state. Zapier is a
thin, no-code bridge — no custom server needed. Supabase is the
learning-platform's existing database (its own project, not this
repo's).

## Trigger

Corsizio's Zapier app fires on **new paid registration** (per event, i.e.
per program+location combination configured in
`src/config/corsizioEvents.js`). Waitlist joins and cancellations are out
of scope for v1 — only confirmed registrations sync.

## Target: `enrollments` table (Supabase)

One row per registration:

| Field | Type | Source | Notes |
|---|---|---|---|
| `studentName` | text | Corsizio registration form field | Corsizio's registrant/attendee name field |
| `grade` | text | Corsizio registration form field | Requires a custom question on each Corsizio event asking grade/grade band |
| `program` | text | Derived from which Corsizio event fired | One of `explorers` \| `builders` \| `developers` \| `engineers` — map 1:1 from the Corsizio event ID using `CORSIZIO_EVENTS` in `src/config/corsizioEvents.js` as the lookup |
| `location` | text | Derived from which Corsizio event fired | One of `toronto` \| `vaughan` \| `oshawa` \| `calgary` \| `vancouver` \| `online` — same lookup as `program` |
| `mode` | text | Derived from `location` | `"inperson"` if `location !== "online"`, else `"online"` |
| `parentEmail` | text | Corsizio registration form field | Corsizio's registrant/payer email field |
| `status` | text | Fixed value on insert | `"registered"` for v1 (all synced rows are confirmed, paid registrations) |

## Notes for implementation

- Each Corsizio event ID is program+location specific (see
  `CORSIZIO_EVENTS`), so the Zap needs one trigger step per event, or a
  lookup table mapping Corsizio event ID → `{ program, location, mode }`
  mirroring that config — keep the two in sync by hand until/unless this
  becomes code.
- Guyana (`/gy/:slug`) registrations stay on the existing HubSpot
  lead-capture form (not Corsizio) and are out of scope for this sync —
  they'd need a separate HubSpot → Supabase path if that's ever wanted.
- No PII beyond what's listed above should be synced without a separate
  privacy review.
