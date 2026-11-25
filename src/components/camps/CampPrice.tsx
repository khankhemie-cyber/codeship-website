"use client";

import SplitButton from "@/components/ui/SplitButton";
import { MARCH_BREAK_CAMP as CAMP } from "@/config/camps";
import { trackEvent } from "@/lib/analytics";
import { useCampPricing } from "./useCampPricing";

/** "CAD $400 for the week, early bird" or "CAD $450 for the week". */
export function CampPriceText({ suffix = true }: { suffix?: boolean }) {
  const p = useCampPricing();
  return (
    <>
      {p.priceLabel} for the week
      {suffix && p.earlyBird ? ` (early bird to Dec 31; then ${CAMP.priceLabel})` : ""}
    </>
  );
}

/** One line on the early-bird offer, or nothing once it has ended. */
export function EarlyBirdNote({ className = "" }: { className?: string }) {
  const p = useCampPricing();
  if (!p.earlyBird) return null;
  return (
    <p className={className}>
      Early bird: save ${CAMP.earlyBirdSaving} when you sign up by {CAMP.earlyBirdEndsLabel}. Then {CAMP.priceLabel}.
    </p>
  );
}

function track(source: string, earlyBird: boolean) {
  trackEvent("camp_signup_click", { camp: CAMP.slug, source, early_bird: earlyBird ? "yes" : "no" });
}

/** Plain styled anchor to the right Stripe link. */
export function CampSignupLink({ source, className, children }: { source: string; className?: string; children: React.ReactNode }) {
  const p = useCampPricing();
  return (
    <a href={p.url} className={className} onClick={() => track(source, p.earlyBird)}>
      {children}
    </a>
  );
}

/** SplitButton to the right Stripe link. */
export function CampSignupButton({
  source,
  tone = "light",
  children,
}: {
  source: string;
  tone?: "light" | "dark" | "purple" | "yellow";
  children: React.ReactNode;
}) {
  const p = useCampPricing();
  return (
    <SplitButton href={p.url} external tone={tone} onClick={() => track(source, p.earlyBird)}>
      {children}
    </SplitButton>
  );
}

/** Link to the single-day checkout. */
export function CampDayLink({ source, className, children }: { source: string; className?: string; children: React.ReactNode }) {
  return (
    <a
      href={CAMP.dayUrl}
      className={className}
      onClick={() => trackEvent("camp_signup_click", { camp: CAMP.slug, source, pricing: "single_day" })}
    >
      {children}
    </a>
  );
}
