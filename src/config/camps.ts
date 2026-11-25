/**
 * Camps open for sign-up. March Break is sold as a full week (Mon to Fri),
 * or as single days on a separate link (each day is its own item at checkout;
 * parents set days they don't need to 0).
 * Checkout asks for the child's name and age, the camp, and updates/photo
 * consent. Each link is capped at 20 completed sign-ups.
 *
 * Two links: early bird (CAD $400 for the week) until Dec 31, 2026, then
 * regular (CAD $450). The site switches by the visitor's clock (see
 * campPricing). Do not change the links or prices without the owner.
 */
export const MARCH_BREAK_CAMP = {
  slug: "march-break-camp",
  title: "March Break Camp",
  dates: "March 15 to 19, 2027",
  shortDates: "Mar 15–19",
  days: "Monday to Friday",
  hours: "9:00 AM–4:00 PM",
  ages: "Ages 7–12",
  ageRange: [7, 12] as [number, number],
  /** ISO times, Eastern (EDT starts Mar 14, 2027). */
  startISO: "2027-03-15T09:00:00-04:00",
  endISO: "2027-03-19T16:00:00-04:00",
  /** Regular price for the full week. */
  priceCad: 450,
  priceLabel: "CAD $450",
  earlyBirdCad: 400,
  earlyBirdLabel: "CAD $400",
  earlyBirdSaving: 50,
  /** Early bird ends at the end of Dec 31, 2026, Eastern. */
  earlyBirdEndsISO: "2027-01-01T00:00:00-05:00",
  earlyBirdEndsLabel: "December 31, 2026",
  dayPriceCad: 125,
  dayPriceLabel: "CAD $125",
  /** Single days, CAD $125 each; parents pick days at checkout. */
  dayUrl: "https://buy.stripe.com/cNifZb7MnabP1sR6PGdAk0x",
  spots: 20,
  /** Regular price link (CAD $450 for the week). */
  url: "https://buy.stripe.com/dRm00d8Qr83H0oN6PGdAk0t",
  /** Early bird link (CAD $400 for the week), to be deactivated after Dec 31, 2026. */
  earlyBirdUrl: "https://buy.stripe.com/8x2eV71nZes5b3ra1SdAk0w",
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
