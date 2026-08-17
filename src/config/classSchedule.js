/**
 * Mode-correct class schedule per program (informational display only).
 * Each semester is 8 weekly classes (see SEMESTER_WEEKS in src/config/offering.ts).
 * In-person runs Saturdays; online runs Tuesdays (Explorers/Builders) or
 * Thursdays (Developers/Engineers). Checkout is handled by Stripe Payment
 * Links (see src/lib/payment-links.ts), not by these dates.
 */
export const CLASS_SCHEDULE = {
  explorers: {
    inperson: { days: "Saturdays", dates: "Weekly, Sep 5 – Oct 24, 2026", time: "9:00–10:00 AM EDT" },
    online: { days: "Tuesdays", dates: "Weekly, Sep 1 – Oct 20, 2026", time: "4:00–5:00 PM EDT" },
  },
  builders: {
    inperson: { days: "Saturdays", dates: "Weekly, Sep 5 – Oct 24, 2026", time: "10:10–11:05 AM EDT" },
    online: { days: "Tuesdays", dates: "Weekly, Sep 1 – Oct 20, 2026", time: "5:00–5:55 PM EDT" },
  },
  developers: {
    inperson: { days: "Saturdays", dates: "Weekly, Sep 5 – Oct 24, 2026", time: "11:40 AM–12:35 PM EDT" },
    online: { days: "Thursdays", dates: "Weekly, Sep 3 – Oct 22, 2026", time: "4:00–4:55 PM EDT" },
  },
  engineers: {
    inperson: { days: "Saturdays", dates: "Weekly, Sep 5 – Oct 24, 2026", time: "12:50–1:45 PM EDT" },
    online: { days: "Thursdays", dates: "Weekly, Sep 3 – Oct 22, 2026", time: "5:00–5:55 PM EDT" },
  },
};
