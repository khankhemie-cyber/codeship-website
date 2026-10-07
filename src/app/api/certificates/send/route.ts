import { getRequestContext } from "@cloudflare/next-on-pages";
import {
  CERTIFICATE_ASSET_PATHS,
  certificateFileName,
  renderCertificatePdf,
  validateCertificateFields,
  type CertificateFields,
} from "@/lib/certificates/certificate";
import { checkPassword, isValidEmail, sendCertificateEmail, type CertificatesEnv } from "@/lib/certificates/server";

export const runtime = "edge";

interface SendBody {
  password?: string;
  email?: string;
  parentName?: string;
  note?: string;
  fields?: CertificateFields;
}

const fail = (error: string, status: number) => Response.json({ ok: false, error }, { status });

async function fetchAsset(request: Request, path: string): Promise<ArrayBuffer> {
  const res = await fetch(new URL(path, request.url));
  if (!res.ok) throw new Error(`Could not load ${path} (${res.status})`);
  return res.arrayBuffer();
}

/**
 * Builds the certificate from the submitted details (never from an uploaded file)
 * and emails it to the family as a PDF attachment.
 */
export async function POST(request: Request) {
  let body: SendBody;
  try {
    body = (await request.json()) as SendBody;
  } catch {
    return fail("Bad request.", 400);
  }

  const env = getRequestContext().env as CertificatesEnv;
  const auth = checkPassword(env, body.password);
  if (auth === "not_configured") return fail("CERTIFICATES_PASSWORD isn't set on the server.", 500);
  if (auth === "wrong") return fail("Your session has expired. Reload the page and sign in again.", 401);

  const to = (body.email ?? "").trim();
  if (!isValidEmail(to)) return fail("Enter a valid parent/guardian email address.", 400);
  const parentName = (body.parentName ?? "").slice(0, 80);
  const note = (body.note ?? "").slice(0, 1000);

  const fields = body.fields;
  const problem = fields ? validateCertificateFields(fields) : "Missing certificate details.";
  if (problem || !fields) return fail(problem ?? "Missing certificate details.", 400);

  let pdf: Uint8Array;
  try {
    const [logoPng, sealPng] = await Promise.all([
      fetchAsset(request, CERTIFICATE_ASSET_PATHS.logo),
      fetchAsset(request, CERTIFICATE_ASSET_PATHS.seal),
    ]);
    pdf = await renderCertificatePdf(fields, { logoPng, sealPng });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Could not build the certificate.", 400);
  }

  try {
    const error = await sendCertificateEmail(env, { to, parentName, note, fields, pdf, fileName: certificateFileName(fields) });
    if (error) return fail(error, 502);
  } catch {
    return fail("Could not reach the email service. Please try again.", 502);
  }
  return Response.json({ ok: true });
}
