-- CODEship Stripe checkout — order + policy-acceptance persistence.
-- Written by the stripe-webhook edge function (service-role key only;
-- RLS below denies all client access, matching the "server-only" flow).

create table if not exists orders (
  id text primary key,                    -- Stripe Checkout Session id
  payment_intent_id text,
  program text not null,
  location text not null,
  mode text not null,                     -- 'in_person' | 'online'
  term text not null,                     -- e.g. '2026-Sept', from CURRENT_TERM
  currency text not null,                 -- 'cad' | 'usd'
  amount_total integer,                   -- minor units (cents)
  customer_email text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  policy_version text not null,           -- REFUND_POLICY_VERSION at acceptance time
  policy_accepted_at timestamptz not null,
  status text not null default 'pending', -- 'paid' | 'expired' | 'refunded' | 'partially_refunded'
  refunded_amount integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_payment_intent_id_idx on orders (payment_intent_id);
create index if not exists orders_program_term_idx on orders (program, term);

create table if not exists payment_failures (
  id bigint generated always as identity primary key,
  payment_intent_id text not null,
  program text,
  location text,
  term text,
  failure_message text,
  created_at timestamptz not null default now()
);

alter table orders enable row level security;
alter table payment_failures enable row level security;
-- No policies are defined: with RLS enabled and zero policies, only the
-- service-role key (used exclusively by the webhook, server-side) can
-- read or write these tables.
