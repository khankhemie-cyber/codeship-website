/**
 * Mode-correct class schedule per program (informational display only).
 * In-person runs Saturdays; online runs Tuesdays (Explorers/Builders) or
 * Thursdays (Developers/Engineers). Checkout is handled by Stripe Payment
 * Links (see src/lib/payment-links.ts), not by these dates.
 */
export const CLASS_SCHEDULE = {
  explorers: {
    inperson: { days: "Saturdays", dates: "Sep 5, 12, 19, 26, 2026", time: "9:00–10:00 AM EDT" },
    online: { days: "Tuesdays", dates: "Sep 1, 8, 15, 22, 2026", time: "4:00–5:00 PM EDT" },
  },
  builders: {
    inperson: { days: "Saturdays", dates: "Sep 5, 12, 19, 26, 2026", time: "10:10–11:05 AM EDT" },
    online: { days: "Tuesdays", dates: "Sep 1, 8, 15, 22, 2026", time: "5:00–5:55 PM EDT" },
  },
  developers: {
    inperson: { days: "Saturdays", dates: "Sep 5, 12, 19, 26, 2026", time: "11:40 AM–12:35 PM EDT" },
    online: { days: "Thursdays", dates: "Sep 3, 10, 17, 24, 2026", time: "4:00–4:55 PM EDT" },
  },
  engineers: {
    inperson: { days: "Saturdays", dates: "Sep 5, 12, 19, 26, 2026", time: "12:50–1:45 PM EDT" },
    online: { days: "Thursdays", dates: "Sep 3, 10, 17, 24, 2026", time: "5:00–5:55 PM EDT" },
  },
};
