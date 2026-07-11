/** Web Crypto (edge-safe) SHA-256 hex digest — used to hash student join PINs. */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** A short, kid-friendly PIN a teacher can read aloud — no ambiguous characters (0/O, 1/I). */
export function generatePin(length = 4): string {
  const alphabet = "23456789";
  let pin = "";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  for (let i = 0; i < length; i++) {
    pin += alphabet[bytes[i] % alphabet.length];
  }
  return pin;
}
