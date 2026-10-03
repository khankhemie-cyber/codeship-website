/**
 * Byte <-> link-text helpers shared by the student tools' share links
 * (Launchpad's `#code=` and the Python console's `#c=`). Raw deflate plus
 * base64url: no padding and no `+` or `/`, so the text survives being pasted
 * into mail clients, chat apps and spreadsheets unescaped.
 */

export function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...Array.from(bytes.subarray(i, i + 0x8000)));
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromBase64Url(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function pipe(bytes: Uint8Array, stream: TransformStream): Promise<Uint8Array> {
  const piped = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(piped).arrayBuffer());
}

export const deflateRaw = (bytes: Uint8Array) => pipe(bytes, new CompressionStream("deflate-raw"));
export const inflateRaw = (bytes: Uint8Array) => pipe(bytes, new DecompressionStream("deflate-raw"));
