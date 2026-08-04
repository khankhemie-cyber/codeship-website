import { headers } from "next/headers";

export interface VisitorGeo {
  city: string | null;
  region: string | null;
  inCanada: boolean;
}

function clean(v: string | null): string | null {
  if (!v) return null;
  let s = v.trim();
  try {
    s = decodeURIComponent(s);
  } catch {
    // Leave s as-is if it isn't valid percent-encoding.
  }
  return s.length ? s : null;
}

/**
 * Reads Cloudflare's visitor-location headers (cf-ipcountry, cf-ipcity,
 * cf-region) to localize online-class messaging to the visitor's own city,
 * Canada only. cf-ipcity/cf-region require the Cloudflare "Add visitor
 * location headers" managed transform to be enabled on the zone; without it,
 * city/region come back null and the Canada-wide default copy shows.
 *
 * Reading headers() opts the calling route into dynamic rendering.
 */
export async function getVisitorGeo(): Promise<VisitorGeo> {
  const h = await headers();
  const country = (h.get("cf-ipcountry") || "").toUpperCase();
  const inCanada = country === "CA";
  return {
    city: inCanada ? clean(h.get("cf-ipcity")) : null,
    region: inCanada ? clean(h.get("cf-region")) : null,
    inCanada,
  };
}
