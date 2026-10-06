import { cookies } from "next/headers";
import { getRequestContext } from "@cloudflare/next-on-pages";
import {
  cookieName,
  decryptWorkbook,
  encryptedWorkbookPath,
  hasAccess,
  isWorkbookProgram,
  workbookFileName,
} from "@/lib/workbooks";

export const runtime = "edge";

/** Reads the encrypted file from Pages' static assets (or this server under `next start`). */
async function fetchEncrypted(path: string, requestUrl: string) {
  const url = new URL(path, requestUrl);
  try {
    const assets = (getRequestContext().env as { ASSETS?: { fetch: typeof fetch } }).ASSETS;
    if (assets) return assets.fetch(url);
  } catch {
    // not running on Cloudflare
  }
  return fetch(url);
}

export async function GET(request: Request) {
  const program = new URL(request.url).searchParams.get("program");
  if (!isWorkbookProgram(program)) {
    return new Response("Not found", { status: 404 });
  }

  if (!(await hasAccess(program, cookies().get(cookieName(program))?.value))) {
    return new Response(null, {
      status: 303,
      headers: { Location: new URL(`/workbooks/${program}/`, request.url).toString() },
    });
  }

  try {
    const res = await fetchEncrypted(encryptedWorkbookPath(program), request.url);
    if (!res.ok) throw new Error(`encrypted workbook: ${res.status}`);
    const pdf = await decryptWorkbook(program, await res.arrayBuffer());
    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${workbookFileName(program)}"`,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  } catch {
    return new Response("The workbook is not available right now. Please tell your instructor.", {
      status: 500,
    });
  }
}
