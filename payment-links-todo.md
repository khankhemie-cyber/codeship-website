# Payment links — status & handover

Single source of truth for the checkout links lives in
[`src/lib/payment-links.ts`](src/lib/payment-links.ts) (coding programs) and
[`src/data/tutoring.ts`](src/data/tutoring.ts) (tutoring). This file tracks
which links are live and which are still placeholders.

Every offering is a flat **CAD $129** for an **8-week semester** (one class per
week). Each program's single Stripe link is wired to **both** its Oshawa
in-person registration **and** its online registration from any city — those
are the only two paths that sell a real seat. In-person in the other 11 cities
is waitlist-only and never uses a Stripe link.

## Live — wired in (coding programs)

| Program   | Grades | Stripe Payment Link |
|-----------|--------|---------------------|
| Explorers | K–1    | https://buy.stripe.com/cNi8wJ2s3gAd9Znei8dAk0j |
| Builders  | 2–3    | https://buy.stripe.com/4gM5kxgiT97L4F34HydAk0h |
| Developers| 4–5    | https://buy.stripe.com/cNi6oB9Uves52wVgqgdAk0i |
| Engineers | 6–8    | https://buy.stripe.com/cNidR3eaL0Bfb3r3DudAk0k |

## Pending — placeholders in code (tutoring)

These two render placeholder constants and their CTAs are disabled until real
links are provided. Replace the placeholder value in `src/data/tutoring.ts`,
nothing else, once the links exist.

| Offering                   | Placeholder constant            | Real link |
|----------------------------|---------------------------------|-----------|
| Math Tutoring              | `PAYMENT_LINK_MATH_TUTORING`    | _pending_ |
| English & Reading Tutoring | `PAYMENT_LINK_READING_TUTORING` | _pending_ |

To hand these over: paste each real `https://buy.stripe.com/...` URL in place of
the matching placeholder constant.

## Stripe custom fields — needs owner check

I can't inspect the Stripe dashboard from the codebase, so I can't confirm
whether the four live Payment Links have custom fields enabled. If scheduling
needs the **location** (which Oshawa cohort) or **format** (in-person vs online)
captured at checkout, the simplest place to capture it is a Stripe Payment Link
custom field (a dropdown/checkbox on the Stripe-hosted page) rather than an
on-site step — the online and Oshawa-in-person paths share one link per program,
so a "Format" field would let you tell the two apart. Please confirm in Stripe
and add fields there if needed.
