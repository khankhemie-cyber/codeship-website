import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { getEnv } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "edge";

/**
 * Signature verification requires the exact raw request body — parsing it
 * as JSON first (even to re-stringify) can change byte-for-byte formatting
 * and break `constructEventAsync`, so we read it as text and verify before
 * doing anything else with it.
 */
export async function POST(request: Request) {
  const env = getEnv();
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return Response.json({ error: "not_configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "missing_signature" }, { status: 400 });
  }

  const payload = await request.text();

  let stripe: Stripe;
  try {
    stripe = getStripeClient();
  } catch {
    return Response.json({ error: "not_configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, webhookSecret);
  } catch (err) {
    return Response.json({ error: `invalid_signature: ${(err as Error).message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "checkout.session.expired":
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
        break;
      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        break;
    }
  } catch (err) {
    // Non-2xx tells Stripe to retry with backoff — the payment already
    // succeeded (or failed) on Stripe's side regardless, so retrying is
    // safe and is how we recover from a transient Supabase outage.
    // eslint-disable-next-line no-console
    console.error(`[stripe-webhook] failed to process ${event.type}`, err);
    return Response.json({ error: "processing_failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = getSupabaseAdmin();
  const metadata = session.metadata ?? {};

  const { error } = await supabase.from("orders").upsert({
    id: session.id,
    payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
    program: metadata.program,
    location: metadata.location,
    mode: metadata.mode,
    term: metadata.term,
    currency: session.currency,
    amount_total: session.amount_total,
    customer_email: session.customer_details?.email,
    utm_source: metadata.utm_source,
    utm_medium: metadata.utm_medium,
    utm_campaign: metadata.utm_campaign,
    utm_content: metadata.utm_content,
    utm_term: metadata.utm_term,
    policy_version: metadata.policy_version,
    policy_accepted_at: metadata.policy_accepted_at,
    status: "paid",
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("orders")
    .upsert({ id: session.id, status: "expired", updated_at: new Date().toISOString() });
  if (error) throw error;
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const supabase = getSupabaseAdmin();
  const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!paymentIntentId) return;

  const { error } = await supabase
    .from("orders")
    .update({
      status: charge.refunded ? "refunded" : "partially_refunded",
      refunded_amount: charge.amount_refunded,
      updated_at: new Date().toISOString(),
    })
    .eq("payment_intent_id", paymentIntentId);
  if (error) throw error;
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const supabase = getSupabaseAdmin();
  const metadata = paymentIntent.metadata ?? {};
  const { error } = await supabase.from("payment_failures").insert({
    payment_intent_id: paymentIntent.id,
    program: metadata.program,
    location: metadata.location,
    term: metadata.term,
    failure_message: paymentIntent.last_payment_error?.message,
    created_at: new Date().toISOString(),
  });
  if (error) throw error;
}
