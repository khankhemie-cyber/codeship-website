/**
 * Camps open for sign-up. March Break is sold by the day: the Stripe Payment
 * Links list Mon 15 to Fri 19 as separate items, and parents set any day they
 * don't need to 0 at checkout (up to 3 per day for siblings). Checkout also
 * asks for the child's name and age and updates/photo consent.
 *
 * Two links: early bird (CAD $220/day) until Dec 31, 2026, then regular
 * (CAD $240/day). The site switches by the visitor's clock (see
 * campPricing). Do not change the links or prices without the owner.
 */
export const MARCH_BREAK_CAMP = {
  slug: "march-break-camp",
  title: "March Break Camp",
  dates: "March 15 to 19, 2027",
  shortDates: "Mar 15–19",
  days: "Monday to Friday",
  hours: "9:00 AM–4:00 PM",
  ages: "Ages 6–14",
  ageRange: [6, 14] as [number, number],
  /** ISO times, Eastern (EDT starts Mar 14, 2027). */
  startISO: "2027-03-15T09:00:00-04:00",
  endISO: "2027-03-19T16:00:00-04:00",
  /** Regular price per day. */
  priceCad: 240,
  priceLabel: "CAD $240/day",
  earlyBirdCad: 220,
  earlyBirdLabel: "CAD $220/day",
  earlyBirdSaving: 20,
  /** Early bird ends at the end of Dec 31, 2026, Eastern. */
  earlyBirdEndsISO: "2027-01-01T00:00:00-05:00",
  earlyBirdEndsLabel: "December 31, 2026",
  campDays: [
    { short: "Mon", label: "Monday, March 15" },
    { short: "Tue", label: "Tuesday, March 16" },
    { short: "Wed", label: "Wednesday, March 17" },
    { short: "Thu", label: "Thursday, March 18" },
    { short: "Fri", label: "Friday, March 19" },
  ],
  spots: 30,
  /** Regular price link (CAD $240/day). */
  url: "https://buy.stripe.com/5kQcMZd6H97LfjHde4dAk0v",
  /** Early bird link (CAD $220/day), deactivated after Dec 31, 2026. */
  earlyBirdUrl: "https://buy.stripe.com/bJe6oB1nZ5Vz0oN2zqdAk0u",
  image: "/images/camp.webp",
} as const;

export type CampPricing = {
  earlyBird: boolean;
  priceCad: number;
  priceLabel: string;
  url: string;
};

/** Which price and link apply at a given moment. */
export function campPricing(now: Date = new Date()): CampPricing {
  const c = MARCH_BREAK_CAMP;
  const earlyBird = now.getTime() < new Date(c.earlyBirdEndsISO).getTime();
  return earlyBird
    ? { earlyBird, priceCad: c.earlyBirdCad, priceLabel: c.earlyBirdLabel, url: c.earlyBirdUrl }
    : { earlyBird, priceCad: c.priceCad, priceLabel: c.priceLabel, url: c.url };
}
