import { REGISTRATION_COUPON } from "@/lib/payment-links";

interface CouponCalloutProps {
  /** "card" renders the full boxed callout (registration sidebar); "inline" is a compact badge for listings. */
  variant?: "card" | "inline";
  className?: string;
}

/**
 * Advertises the launch promo code next to a price. Customers copy the code and
 * enter it at Stripe checkout to redeem the one-time 50% off registration. The
 * code and messaging come from REGISTRATION_COUPON so every pricing point stays
 * in sync.
 */
export function CouponCallout({ variant = "card", className = "" }: CouponCalloutProps) {
  if (variant === "inline") {
    return (
      <span
        className={
          "inline-flex items-center gap-1.5 rounded-full bg-[#E5A823]/15 px-2.5 py-1 text-xs font-semibold text-[#001532] " +
          className
        }
      >
        <span>{REGISTRATION_COUPON.discountLabel} with code</span>
        <span className="font-mono font-bold tracking-wide">{REGISTRATION_COUPON.code}</span>
      </span>
    );
  }

  return (
    <div
      className={
        "rounded-xl border border-dashed border-[#E5A823] bg-[#E5A823]/10 p-4 text-center " + className
      }
    >
      <p className="text-xs font-bold uppercase tracking-widest text-[#b8850f]">
        {REGISTRATION_COUPON.discountLabel} — limited time
      </p>
      <p className="mt-1 text-sm text-gray-700">
        Enter this code at checkout for {REGISTRATION_COUPON.description}:
      </p>
      <p className="mt-2 select-all font-mono text-xl font-extrabold tracking-widest text-[#001532]">
        {REGISTRATION_COUPON.code}
      </p>
    </div>
  );
}

export default CouponCallout;
