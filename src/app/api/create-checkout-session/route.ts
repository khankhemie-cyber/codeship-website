import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { getEnv } from "@/lib/env";
import { PRICE_LOOKUP_KEYS, REFUND_POLICY_VERSION, type CheckoutCurrency, type CheckoutMode } from "@/data/catalog";
import type { ProgramSlug } from "@/data/locations";
import type { LocationSlug } from "@/lib/registration";

export const runtime = "edge";

const PROGRAM_SLUGS: ProgramSlug[] = ["explorers", "builders", "developers", "engineers"];
const LOCATION_SLUGS: LocationSlug[] = ["toronto", "vaughan", "oshawa", "calgary", "vancouver", "online"];
const CURRENCIES: CheckoutCurrency[] = ["cad", "usd"];

interface CheckoutRequestBody {
  program?: string;
  location?: string;
  currency?: string;
  /** Client-captured moment the required policy checkbox was checked. */
  policyAcceptedAt?: string;
  /** Path to return to if the shopper cancels — defaults to /programs/:program. */
  returnPath?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
}

/** Strips undefined/empty values — Stripe metadata should only carry facts we actually have. */
function cleanMetadata(fields: Record<string, string | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value) out[key] = value;
  }
  return out;
}

export async function POST(request: Request) {
  let body: CheckoutRequestBody;
  try {
    body = (await request.json()) as CheckoutRequestBody;
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const program = body.program as ProgramSlug | undefined;
  const location = body.location as LocationSlug | undefined;
  const currency = body.currency as CheckoutCurrency | undefined;

  if (!program || !PROGRAM_SLUGS.includes(program)) {
    return Response.json({ error: "invalid_program" }, { status: 400 });
  }
  if (!location || !LOCATION_SLUGS.includes(location)) {
    return Response.json({ error: "invalid_location" }, { status: 400 });
  }
  if (!currency || !CURRENCIES.includes(currency)) {
    return Response.json({ error: "invalid_currency" }, { status: 400 });
  }
  if (!body.policyAcceptedAt) {
    return Response.json({ error: "policy_not_accepted" }, { status: 400 });
  }

  const env = getEnv();
  const term = env.CURRENT_TERM;
  if (!term) {
    return Response.json({ error: "not_configured" }, { status: 500 });
  }

  let stripe: Stripe;
  try {
    stripe = getStripeClient();
  } catch {
    return Response.json({ error: "not_configured" }, { status: 500 });
  }

  const lookupKey = PRICE_LOOKUP_KEYS[program];
  const prices = await stripe.prices.list({
    lookup_keys: [lookupKey],
    active: true,
    expand: ["data.product", "data.currency_options"],
  });
  const price = prices.data[0];
  if (!price) {
    return Response.json({ error: "price_not_configured" }, { status: 500 });
  }

  // Checkout Sessions don't take a top-level `currency` override for an
  // existing Price — to force USD presentment on a CAD-default multi-
  // currency Price, rebuild the line item from that Price's own
  // `currency_options`, which carry the same tax-inclusive USD amount.
  let lineItem: Stripe.Checkout.SessionCreateParams.LineItem;
  if (currency === price.currency) {
    lineItem = { price: price.id, quantity: 1 };
  } else {
    const option = price.currency_options?.[currency];
    if (!option?.unit_amount) {
      return Response.json({ error: "currency_not_configured" }, { status: 500 });
    }
    const productId = typeof price.product === "string" ? price.product : price.product?.id;
    lineItem = {
      price_data: {
        currency,
        product: productId,
        unit_amount: option.unit_amount,
        tax_behavior: "inclusive",
      },
      quantity: 1,
    };
  }

  const mode: CheckoutMode = location === "online" ? "online" : "in_person";
  const origin = new URL(request.url).origin;
  const cancelPath = body.returnPath && body.returnPath.startsWith("/") ? body.returnPath : `/programs/${program}`;

  const metadata = cleanMetadata({
    program,
    location,
    mode,
    term,
    utm_source: body.utm?.source,
    utm_medium: body.utm?.medium,
    utm_campaign: body.utm?.campaign ?? program,
    utm_content: body.utm?.content ?? location,
    utm_term: body.utm?.term,
    policy_version: REFUND_POLICY_VERSION,
    policy_accepted_at: body.policyAcceptedAt,
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [lineItem],
    metadata,
    payment_intent_data: { metadata },
    success_url: `${origin}/register/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${cancelPath}?checkout=cancelled`,
  });

  if (!session.url) {
    return Response.json({ error: "session_creation_failed" }, { status: 502 });
  }

  return Response.json({ url: session.url });
}
