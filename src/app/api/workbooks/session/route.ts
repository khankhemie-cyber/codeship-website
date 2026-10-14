import { cookies } from "next/headers";
import { cookieName, hasAccess, isWorkbookProgram } from "@/lib/workbooks";

export const runtime = "edge";

/** Lets the workbook page know whether this browser already entered the password. */
export async function GET(request: Request) {
  const program = new URL(request.url).searchParams.get("program");
  if (!isWorkbookProgram(program)) {
    return Response.json({ ok: false }, { status: 400 });
  }
  const ok = await hasAccess(program, cookies().get(cookieName(program))?.value);
  return Response.json({ ok }, { headers: { "Cache-Control": "no-store" } });
}
