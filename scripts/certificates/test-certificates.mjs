// Fast checks for the certificate template (src/lib/certificates/certificate.ts):
// renders every program × certificate type and checks validation. No browser.
//   npm run test:certificates            (add --out <dir> to keep the PDFs)
import { register } from "node:module";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
// Resolve the app's "@/..." alias and extensionless TypeScript imports.
register("data:text/javascript," + encodeURIComponent(`
const SRC = ${JSON.stringify(pathToFileURL(path.join(root, "src")).href + "/")};
export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) specifier = SRC + specifier.slice(2);
  try { return await next(specifier, context); }
  catch (err) {
    if ((specifier.startsWith(".") || specifier.startsWith("file:")) && !/\\.[cm]?[jt]s$/.test(specifier)) return next(specifier + ".ts", context);
    throw err;
  }
}`));

const C = await import("../../src/lib/certificates/certificate.ts");
const { PDFDocument } = await import("pdf-lib");

const outIdx = process.argv.indexOf("--out");
const outDir = outIdx > -1 ? path.resolve(process.argv[outIdx + 1]) : null;
if (outDir) await mkdir(outDir, { recursive: true });

const assets = {
  logoPng: await readFile(path.join(root, "public", C.CERTIFICATE_ASSET_PATHS.logo)),
  sealPng: await readFile(path.join(root, "public", C.CERTIFICATE_ASSET_PATHS.seal)),
};

let failed = 0, passed = 0;
async function test(name, fn) {
  try { await fn(); passed++; console.log(`ok    ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); }
}
const base = { childName: "Amélie O'Connor-Nguyen", program: "explorers", kind: "semester-1", completionDate: "2026-06-20", instructorName: "Ms. Khan" };

for (const program of C.CERTIFICATE_PROGRAMS) {
  for (const { value: kind } of C.CERTIFICATE_KINDS) {
    await test(`renders ${program.slug} ${kind}`, async () => {
      const fields = { ...base, program: program.slug, kind };
      const bytes = await C.renderCertificatePdf(fields, assets);
      const doc = await PDFDocument.load(bytes);
      if (doc.getPageCount() !== 1) throw new Error("expected one page");
      if (!doc.getTitle()?.includes(program.level)) throw new Error(`title: ${doc.getTitle()}`);
      if (outDir) await writeFile(path.join(outDir, C.certificateFileName(fields)), bytes);
    });
  }
}

await test("very long names shrink to fit instead of failing", async () => {
  await C.renderCertificatePdf({ ...base, childName: "Maximiliana Alexandrina Wolfeschlegelsteinhausen", instructorName: "Mr. Bartholomew Featherstonehaugh-Smythe" }, assets);
});
await test("no instructor is fine", async () => {
  await C.renderCertificatePdf({ ...base, instructorName: "" }, assets);
});

const rejects = async (name, fields, match) => test(`rejects ${name}`, async () => {
  let msg = null;
  try { await C.renderCertificatePdf({ ...base, ...fields }, assets); } catch (e) { msg = e.message; }
  if (!msg || !match.test(msg)) throw new Error(`got ${JSON.stringify(msg)}`);
});
await rejects("an empty name", { childName: "   " }, /child's name/);
await rejects("an unknown program", { program: "wizards" }, /program/);
await rejects("an unknown type", { kind: "semester-9" }, /certificate type/);
await rejects("an impossible date", { completionDate: "2026-02-30" }, /date/);
await rejects("unprintable characters", { childName: "李小龙" }, /can't print/);

await test("file name is tidy", async () => {
  const n = C.certificateFileName({ ...base, program: "builders", kind: "program" });
  if (n !== "CODEship-Builders-Program-Amelie-OConnor-Nguyen.pdf") throw new Error(n);
});

// Email (src/lib/certificates/server.ts), with the Brevo API stubbed out.
const S = await import("../../src/lib/certificates/server.ts");
await test("password check", async () => {
  if (S.checkPassword({}, "x") !== "not_configured") throw new Error("unset should be not_configured");
  if (S.checkPassword({ CERTIFICATES_PASSWORD: "abc" }, "abd") !== "wrong") throw new Error("wrong accepted");
  if (S.checkPassword({ CERTIFICATES_PASSWORD: "abc" }, "abc") !== "ok") throw new Error("right rejected");
});
await test("email escapes the note and names the achievement", async () => {
  const { subject, html, text } = S.buildCertificateEmail({ parentName: "Sam", note: "<b>Great</b> job", fields: { ...base, kind: "semester-2" } });
  if (!subject.includes("Explorers · Semester 2")) throw new Error(subject);
  if (html.includes("<b>Great</b>") || !html.includes("&lt;b&gt;Great")) throw new Error("note not escaped");
  if (!text.includes("Kindness Cards") || !text.startsWith("Hi Sam,")) throw new Error(text);
});
await test("sends the PDF as an attachment through Brevo", async () => {
  const realFetch = globalThis.fetch;
  let sentReq = null;
  globalThis.fetch = async (url, init) => { sentReq = { url, init }; return new Response("{}", { status: 200 }); };
  try {
    const env = { BREVO_API_KEY: "k", CERTIFICATES_REPLY_TO: "office@x.com", CERTIFICATES_FROM_EMAIL: "CODEship <c@example.com>", CERTIFICATES_BCC: "a@x.com, b@x.com" };
    const pdf = await C.renderCertificatePdf(base, assets);
    const err = await S.sendCertificateEmail(env, { to: "p@example.com", parentName: "Sam", fields: base, pdf, fileName: "c.pdf" });
    if (err) throw new Error(err);
    const body = JSON.parse(sentReq.init.body);
    if (sentReq.url !== "https://api.brevo.com/v3/smtp/email") throw new Error(sentReq.url);
    if (sentReq.init.headers["api-key"] !== "k") throw new Error("api key header");
    const eq = (a, b, what) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${what}: ${JSON.stringify(a)}`); };
    eq(body.sender, { name: "CODEship", email: "c@example.com" }, "sender");
    eq(body.to, [{ email: "p@example.com", name: "Sam" }], "to");
    eq(body.bcc, [{ email: "a@x.com" }, { email: "b@x.com" }], "bcc");
    eq(body.replyTo, { email: "office@x.com" }, "replyTo");
    if (!body.htmlContent || !body.textContent || !body.subject) throw new Error("missing content");
    eq(body.attachment[0].name, "c.pdf", "attachment name");
    if (Buffer.from(body.attachment[0].content, "base64").compare(Buffer.from(pdf)) !== 0) throw new Error("attachment differs");
  } finally { globalThis.fetch = realFetch; }
});
await test("parses sender formats", async () => {
  const a = S.parseSender("CODEship Academy <certificates@codeshipacademy.com>");
  const b = S.parseSender("certificates@codeshipacademy.com");
  if (a.name !== "CODEship Academy" || a.email !== "certificates@codeshipacademy.com" || b.name || b.email !== "certificates@codeshipacademy.com") throw new Error(JSON.stringify([a, b]));
});
await test("explains missing email settings", async () => {
  const err = await S.sendCertificateEmail({}, { to: "p@example.com", fields: base, pdf: new Uint8Array(), fileName: "c.pdf" });
  if (!/BREVO_API_KEY/.test(err ?? "")) throw new Error(String(err));
});

console.log(`\n${passed} passed, ${failed} failed${outDir ? ` (PDFs in ${outDir})` : ""}`);
process.exit(failed ? 1 : 0);
