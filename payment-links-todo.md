# Payment links — status & handover

Single source of truth for the checkout links lives in
[`src/lib/payment-links.ts`](src/lib/payment-links.ts).

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

## Stripe custom fields — confirmed

The four live Payment Links capture **format / location** at checkout via Stripe
custom fields. Because the online and Oshawa-in-person paths share one link per
program, that field is what distinguishes the two for scheduling — no separate
on-site capture step is needed.

## Deferred — tutoring (not currently on the site)

Math Tutoring and English & Reading Tutoring have been **removed from the site
for now** at the owner's request. Their Stripe links were never provided. When
tutoring is reintroduced, the two links to obtain are:

| Offering                   | Real link |
|----------------------------|-----------|
| Math Tutoring              | _pending_ |
| English & Reading Tutoring | _pending_ |
