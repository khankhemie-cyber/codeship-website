/**
 * Password-gated student workbooks (/workbooks).
 *
 * Each program has its own password, set as a Cloudflare Pages environment
 * variable: WORKBOOK_PASSWORD_EXPLORERS, _BUILDERS, _DEVELOPERS, _ENGINEERS.
 * A correct password sets an HttpOnly cookie holding an HMAC of the program
 * name keyed by that password, so the cookie never contains the password and
 * every cookie stops working the moment the password is changed.
 *
 * This repository is public, so the PDFs are only committed encrypted
 * (public/workbooks/encrypted/, see scripts/workbooks/encrypt.mjs).
 * /api/workbooks/download checks the cookie, then decrypts with
 * WORKBOOK_FILE_KEY (another Pages environment variable) and streams the PDF.
 */

import type { ProgramSlug } from "@/data/programs";

export const WORKBOOK_PROGRAMS: ProgramSlug[] = ["explorers", "builders", "developers", "engineers"];

export const WORKBOOK_SEMESTER = "s1";

/** Where students download the workbook (checks the cookie, then decrypts). */
export function workbookDownloadPath(program: ProgramSlug) {
  return `/api/workbooks/download/?program=${program}`;
}

/** Public path of the encrypted workbook; useless without WORKBOOK_FILE_KEY. */
export function encryptedWorkbookPath(program: ProgramSlug) {
  return `/workbooks/encrypted/${WORKBOOK_SEMESTER}/${program}.bin`;
}

export function workbookFileName(program: ProgramSlug) {
  return `CODEship-${program[0].toUpperCase()}${program.slice(1)}-Semester-1-Workbook.pdf`;
}

export function isWorkbookProgram(value: string | undefined | null): value is ProgramSlug {
  return !!value && (WORKBOOK_PROGRAMS as string[]).includes(value);
}

export function cookieName(program: ProgramSlug) {
  return `cs_workbook_${program}`;
}

export const COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // a semester and then some

function passwordEnvKey(program: ProgramSlug) {
  return `WORKBOOK_PASSWORD_${program.toUpperCase()}`;
}

/**
 * Reads the program's password. On Cloudflare Pages, next-on-pages exposes the
 * project's environment variables on process.env for each request (edge routes
 * included); under `next dev` it comes from .env.local.
 */
export async function getWorkbookPassword(program: ProgramSlug): Promise<string | undefined> {
  return process.env[passwordEnvKey(program)] || undefined;
}

/**
 * Decrypts a file written by scripts/workbooks/encrypt.mjs:
 * 12-byte IV, then AES-256-GCM ciphertext with the tag appended.
 */
export async function decryptWorkbook(program: ProgramSlug, data: ArrayBuffer) {
  const keyB64 = process.env.WORKBOOK_FILE_KEY;
  if (!keyB64) throw new Error("WORKBOOK_FILE_KEY is not set");
  const raw = Uint8Array.from(atob(keyB64), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["decrypt"]);
  const bytes = new Uint8Array(data);
  return crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: bytes.slice(0, 12),
      additionalData: new TextEncoder().encode(`${WORKBOOK_SEMESTER}:${program}`),
    },
    key,
    bytes.slice(12),
  );
}

async function hmacHex(key: string, message: string) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message)));
  return Array.from(sig, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function accessToken(program: ProgramSlug, password: string) {
  return hmacHex(password, `codeship-workbook:${WORKBOOK_SEMESTER}:${program}`);
}

/** True when `token` (the cookie value) was issued for the current password. */
export async function hasAccess(program: ProgramSlug, token: string | undefined) {
  if (!token) return false;
  const password = await getWorkbookPassword(program);
  if (!password) return false;
  return safeEqual(token, await accessToken(program, password));
}
