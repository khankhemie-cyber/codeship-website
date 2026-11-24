/**
 * Camps open for sign-up. The Stripe Payment Link is the live product
 * ("CODEship March Break Camp | March 15-19, 2027" in Stripe). Its checkout asks
 * the same questions as the class links: child's name and age, the camp, and
 * updates/photo consent. Do not change the link or price without the owner.
 */
export const MARCH_BREAK_CAMP = {
  slug: "march-break-camp",
  title: "March Break Camp",
  dates: "March 15 to 19, 2027",
  shortDates: "Mar 15–19",
  days: "Monday to Friday",
  hours: "9:00 AM–4:00 PM",
  ages: "Ages 6–14",
  priceCad: 450,
  priceLabel: "CAD $450",
  spots: 30,
  url: "https://buy.stripe.com/dRm00d8Qr83H0oN6PGdAk0t",
  image: "/images/camp.jpg",
} as const;
