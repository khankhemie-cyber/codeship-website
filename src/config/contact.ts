/**
 * Single source of truth for CODEship's public contact details.
 */

/** Phone number as shown to visitors. */
export const PHONE_DISPLAY = "(289) 314-3401";

/** E.164 form, for tel: links and structured data. */
export const PHONE_E164 = "+12893143401";

/** e.g. href={PHONE_HREF} on a click-to-call link. */
export const PHONE_HREF = `tel:${PHONE_E164}`;
