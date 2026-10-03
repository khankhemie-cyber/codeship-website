/**
 * Share links for the Python console. This is the ONLY module that knows how
 * a project gets into, and back out of, a link; the editor just calls
 * createShareLink() and readSharedCode().
 *
 * Today the whole file travels in the URL fragment (`#c=...`), which browsers
 * never send to the server, so nothing a student writes is stored by us.
 * If stored projects are ever added (they will be needed for multi-file
 * projects), a short-code link such as `#p=<id>` can be resolved here, behind
 * the same two functions, without touching the editor. Both are async for
 * that reason.
 *
 * Format of `c`: a version character, then the payload.
 *   "1" + base64url(raw deflate(UTF-8 source))
 * Never change what "1" means: instructors keep a sheet of these links.
 */

import { deflateRaw, fromBase64Url, inflateRaw, toBase64Url } from "../shared/linkCodec";

export const SHARE_KEY = "c=";

/**
 * Longest full URL we will hand out. Some mail clients and messaging apps
 * mangle or cut links much past this. The finished Semester 1 project comes
 * to about 1,000 characters, so this is roughly 2x headroom.
 */
export const SHARE_URL_LIMIT = 2000;

export const TOO_BIG_MESSAGE = "This project is too big to share as a link. Download the file instead.";

export type ShareResult = { ok: true; url: string } | { ok: false; length: number; message: string };

export async function encodeCode(code: string): Promise<string> {
  return "1" + toBase64Url(await deflateRaw(new TextEncoder().encode(code)));
}

export async function decodeCode(payload: string): Promise<string> {
  if (payload[0] !== "1") throw new Error("Unknown link format");
  const bytes = await inflateRaw(fromBase64Url(payload.slice(1)));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

/** The URL of `base` (origin + path) with `code` in the fragment. Never truncated. */
export async function buildShareUrl(code: string, base: string): Promise<string> {
  return `${base}#${SHARE_KEY}${await encodeCode(code)}`;
}

/** A link to share, or a refusal if it would exceed SHARE_URL_LIMIT. */
export async function createShareLink(code: string, base: string): Promise<ShareResult> {
  const url = await buildShareUrl(code, base);
  if (url.length > SHARE_URL_LIMIT) return { ok: false, length: url.length, message: TOO_BIG_MESSAGE };
  return { ok: true, url };
}

/**
 * The code a link carries: a string when the fragment holds a project, null
 * when it holds none. Throws when the link is damaged (e.g. cut short by a
 * mail client), so the caller can say so rather than open an empty file.
 */
export async function readSharedCode(hash: string): Promise<string | null> {
  const fragment = hash.replace(/^#/, "");
  if (!fragment.startsWith(SHARE_KEY)) return null;
  return decodeCode(fragment.slice(SHARE_KEY.length));
}
