/**
 * Single source of truth for CODEship program+location -> Corsizio event URL.
 * Corsizio now owns checkout, seat caps, waitlists, receipts, and refunds
 * for CAD markets. See corsizioSchedule.js for the matching class times.
 */
const E = "https://site.corsizio.com/event/";

export const CORSIZIO_EVENTS = {
  explorers: {
    toronto: E + "6a5553d66905bd52ffed2b12",
    vaughan: E + "6a55546e6905bd52ffed6960",
    oshawa: E + "6a55546d6905bd52ffed692f",
    calgary: E + "6a55546c6905bd52ffed68a2",
    vancouver: E + "6a55546b6905bd52ffed6871",
    online: E + "6a555bb26905bd52ffefe1f4",
  },
  builders: {
    toronto: E + "6a5554ef6905bd52ffed8c69",
    vaughan: E + "6a5559bc6905bd52ffef4971",
    oshawa: E + "6a5559bd6905bd52ffef49c9",
    calgary: E + "6a5559bf6905bd52ffef4a59",
    vancouver: E + "6a5559be6905bd52ffef4a28",
    online: E + "6a555be86905bd52ffeff060",
  },
  developers: {
    toronto: E + "6a555a736905bd52ffef7e0b",
    vaughan: E + "6a555a9f6905bd52ffef8a81",
    oshawa: E + "6a555aa06905bd52ffef8f45",
    calgary: E + "6a555a9d6905bd52ffef89fe",
    vancouver: E + "6a555a9e6905bd52ffef8a50",
    online: E + "6a555c696905bd52fff02c4d",
  },
  engineers: {
    toronto: E + "6a555b266905bd52ffefbe64",
    vaughan: E + "6a555b256905bd52ffefbdda",
    oshawa: E + "6a555b046905bd52ffefb055",
    calgary: E + "6a555b246905bd52ffefbd51",
    vancouver: E + "6a555b236905bd52ffefbd20",
    online: E + "6a555c906905bd52fff03923",
  },
}; // All CAD. Guyana (GYD) registrations stay on the existing HubSpot form — see buildGuyanaRegistrationUrl.ts — not Corsizio.
// For a direct-to-form flow, swap /event/ for /register/ in E.

export function getCorsizioUrl(program, location) {
  return (CORSIZIO_EVENTS[program] && CORSIZIO_EVENTS[program][location]) || null;
}
