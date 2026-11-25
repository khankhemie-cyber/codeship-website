// © 2026 CODEship Academy. All rights reserved. Proprietary and confidential: see LICENSE.
/**
 * Domain lock: Port CODEship only runs on CODEship Academy's own site (plus
 * its preview builds and local development). A copy hosted anywhere else
 * shows a notice instead of the game.
 *
 * © CODEship Academy. All rights reserved.
 */

const EXACT = ["codeshipacademy.com", "www.codeshipacademy.com", "codeship-website.pages.dev", "localhost", "127.0.0.1"];
const SUFFIXES = [".codeshipacademy.com", ".codeship-website.pages.dev"];

export function allowedHost(host: string = typeof location !== "undefined" ? location.hostname : ""): boolean {
  const h = host.toLowerCase();
  return EXACT.includes(h) || SUFFIXES.some((s) => h.endsWith(s));
}
