/**
 * Server-only helpers for /api/certificates/*: the staff password check and the
 * certificate email (sent through Resend, https://resend.com).
 *
 * Environment variables (Cloudflare Pages → Settings → Environment variables):
 *   CERTIFICATES_PASSWORD   staff password for /admin/certificates (required)
 *   RESEND_API_KEY          Resend API key (required to email)
 *   CERTIFICATES_FROM_EMAIL sender, e.g. "CODEship Academy <certificates@codeshipacademy.com>";
 *                           its domain must be verified in Resend (required to email)
 *   CERTIFICATES_REPLY_TO   where family replies go (optional)
 *   CERTIFICATES_BCC        comma-separated addresses that get a copy of every certificate (optional)
 */
import { getProgram } from "@/data/programs";
import { describeCertificate, formatCertificateDate, type CertificateFields } from "./certificate";

export type CertificatesEnv = Record<string, string | undefined>;

/** Compares without bailing out at the first differing character. */
function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

/** "ok", "wrong", or "not_configured" when no password is set on the server. */
export function checkPassword(env: CertificatesEnv, password: unknown): "ok" | "wrong" | "not_configured" {
  const secret = env.CERTIFICATES_PASSWORD;
  if (!secret) return "not_configured";
  return typeof password === "string" && safeEqual(password, secret) ? "ok" : "wrong";
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@<>(),;:"]+@[^\s@<>(),;:"]+\.[^\s@<>(),;:"]{2,}$/.test(value) && value.length <= 254;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

export interface CertificateEmail {
  to: string;
  parentName?: string;
  note?: string;
  fields: CertificateFields;
  pdf: Uint8Array;
  fileName: string;
}

export function buildCertificateEmail({ parentName, note, fields }: Omit<CertificateEmail, "to" | "pdf" | "fileName">) {
  const program = getProgram(fields.program)!;
  const child = fields.childName.replace(/\s+/g, " ").trim();
  const firstName = child.split(" ")[0];
  const date = formatCertificateDate(fields.completionDate);
  const achievement =
    fields.kind === "program"
      ? `completed the full CODEship ${program.level} Program on ${date}: all four semesters plus the capstone project, ${program.capstone.title}`
      : `completed Semester ${fields.kind.slice(-1)} of CODEship ${program.level} on ${date}, finishing the project ${
          program.semesters.find((s) => s.number === Number(fields.kind.slice(-1)))!.project
        }`;
  const subject =
    fields.kind === "program"
      ? `🎓 ${child}'s CODEship ${program.level} Program Certificate`
      : `🎉 ${child}'s CODEship ${describeCertificate(program, fields.kind)} Certificate`;
  const greeting = parentName?.trim() ? `Hi ${parentName.trim()},` : "Hello,";
  const trimmedNote = note?.trim();

  const text = [
    greeting,
    "",
    `Congratulations! ${child} ${achievement}.`,
    "",
    `${firstName}'s certificate is attached as a PDF, ready to download, print and celebrate.`,
    ...(trimmedNote ? ["", trimmedNote] : []),
    "",
    "We're so proud of the work that went into this. Thank you for being part of the CODEship family!",
    "",
    "CODEship Academy",
    "Dream. Code. Achieve.",
    "https://www.codeshipacademy.com",
  ].join("\n");

  const p = (html: string) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1A1A2E">${html}</p>`;
  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f3f4f6">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;font-family:Arial,Helvetica,sans-serif">
<tr><td style="background:#0D1B2A;padding:28px 32px;text-align:center">
<div style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:0.5px">CODE<span style="font-weight:400">ship</span> Academy</div>
<div style="display:inline-block;margin-top:10px;background:#F4D734;color:#0D1B2A;font-size:11px;font-weight:800;letter-spacing:2px;padding:5px 12px;border-radius:4px">DREAM. CODE. ACHIEVE.</div>
</td></tr>
<tr><td style="padding:32px">
${p(escapeHtml(greeting))}
${p(`Congratulations! <strong>${escapeHtml(child)}</strong> ${escapeHtml(achievement)}.`)}
${p(`${escapeHtml(firstName)}'s certificate is attached as a PDF, ready to download, print and celebrate.`)}
${trimmedNote ? `<div style="margin:0 0 16px;padding:14px 16px;border-left:4px solid #F4D734;background:#FFFBEA;font-size:15px;line-height:1.6;color:#1A1A2E;white-space:pre-line">${escapeHtml(trimmedNote)}</div>` : ""}
${p("We're so proud of the work that went into this. Thank you for being part of the CODEship family!")}
<p style="margin:24px 0 0;font-size:15px;line-height:1.5;color:#1A1A2E"><strong>CODEship Academy</strong><br><a href="https://www.codeshipacademy.com" style="color:#138A9A">codeshipacademy.com</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;

  return { subject, text, html };
}

/** Sends the certificate. Returns null on success, or an error message for staff. */
export async function sendCertificateEmail(env: CertificatesEnv, email: CertificateEmail): Promise<string | null> {
  const apiKey = env.RESEND_API_KEY;
  const from = env.CERTIFICATES_FROM_EMAIL;
  if (!apiKey || !from) {
    return "Email isn't set up yet: add RESEND_API_KEY and CERTIFICATES_FROM_EMAIL to the site's environment variables.";
  }
  const { subject, text, html } = buildCertificateEmail(email);
  const bcc = (env.CERTIFICATES_BCC ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email.to],
      ...(bcc.length ? { bcc } : {}),
      ...(env.CERTIFICATES_REPLY_TO ? { reply_to: env.CERTIFICATES_REPLY_TO } : {}),
      subject,
      text,
      html,
      attachments: [{ filename: email.fileName, content: toBase64(email.pdf) }],
    }),
  });
  if (res.ok) return null;
  let detail = "";
  try {
    const body = (await res.json()) as { message?: string };
    detail = body.message ?? "";
  } catch {
    // keep the status-only message
  }
  return `The email service refused the message (${res.status}${detail ? `: ${detail}` : ""}).`;
}
