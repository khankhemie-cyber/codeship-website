import type { ReadonlyURLSearchParams } from "next/navigation";

/**
 * Appends any utm_* params found on the current page's URL onto a Corsizio
 * event link, so ad/campaign attribution survives the hand-off to Corsizio.
 */
export function withUtmParams(baseUrl: string, searchParams: ReadonlyURLSearchParams | URLSearchParams): string {
  const url = new URL(baseUrl);
  searchParams.forEach((value, key) => {
    if (key.startsWith("utm_")) url.searchParams.set(key, value);
  });
  return url.toString();
}
