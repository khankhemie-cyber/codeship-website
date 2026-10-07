/**
 * CODEship certificates: one branded PDF template for every program.
 *
 * Two kinds of certificate per program (Explorers, Builders, Developers, Engineers):
 *   - a semester certificate (Semester 1–4), naming that semester's project;
 *   - a program certificate, for finishing all four semesters and the capstone.
 *
 * The same `renderCertificatePdf` runs in the browser (live preview + download on
 * /admin/certificates) and on the server (/api/certificates/send builds the PDF it
 * emails), so the emailed file always matches the preview and is always built from
 * the template, never from an uploaded file.
 */
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb, type RGB } from "pdf-lib";
import { PROGRAMS, getProgram, type Program } from "@/data/programs";

export type CertificateKind = "semester-1" | "semester-2" | "semester-3" | "semester-4" | "program";

export const CERTIFICATE_KINDS: { value: CertificateKind; label: string }[] = [
  { value: "semester-1", label: "Semester 1" },
  { value: "semester-2", label: "Semester 2" },
  { value: "semester-3", label: "Semester 3" },
  { value: "semester-4", label: "Semester 4" },
  { value: "program", label: "Full program (all 4 semesters + capstone)" },
];

export interface CertificateFields {
  childName: string;
  program: string; // ProgramSlug
  kind: CertificateKind;
  /** ISO date, YYYY-MM-DD */
  completionDate: string;
  /** Printed under the signature line. Optional. */
  instructorName?: string;
}

export interface CertificateAssets {
  logoPng: Uint8Array | ArrayBuffer;
  sealPng: Uint8Array | ArrayBuffer;
}

/** Public paths of the images the template embeds. */
export const CERTIFICATE_ASSET_PATHS = {
  logo: "/certificates/logo.png",
  seal: "/certificates/seal.png",
} as const;

const NAVY = rgb(0x0d / 255, 0x1b / 255, 0x2a / 255);
const GOLD = rgb(0xf4 / 255, 0xd7 / 255, 0x34 / 255);
const INK = rgb(0x1a / 255, 0x1a / 255, 0x2e / 255);
const MUTED = rgb(0.38, 0.4, 0.46);
// White, so the logo's white background blends in.
const PAPER = rgb(1, 1, 1);

const MAX_NAME_LENGTH = 60;
const MAX_INSTRUCTOR_LENGTH = 60;

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.replace("#", ""), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

/** Collapses whitespace; the template prints names on a single line. */
function clean(value: string | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function formatCertificateDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Returns a human-readable problem with the fields, or null when they're printable. */
export function validateCertificateFields(fields: CertificateFields): string | null {
  const childName = clean(fields.childName);
  if (!childName) return "Enter the child's name.";
  if (childName.length > MAX_NAME_LENGTH) return `Keep the child's name under ${MAX_NAME_LENGTH} characters.`;
  if (!getProgram(fields.program)) return "Choose a program.";
  if (!CERTIFICATE_KINDS.some((k) => k.value === fields.kind)) return "Choose a certificate type.";
  if (!isValidIsoDate(fields.completionDate)) return "Enter the completion date.";
  if (clean(fields.instructorName).length > MAX_INSTRUCTOR_LENGTH) {
    return `Keep the instructor's name under ${MAX_INSTRUCTOR_LENGTH} characters.`;
  }
  return null;
}

/** What the certificate says it was awarded for, e.g. "Explorers · Semester 2". */
export function describeCertificate(program: Program, kind: CertificateKind): string {
  if (kind === "program") return `CODEship ${program.level} Program`;
  const n = Number(kind.slice(-1));
  return `${program.level} · Semester ${n}`;
}

/** File name for the download / email attachment. */
export function certificateFileName(fields: CertificateFields): string {
  const program = getProgram(fields.program);
  const name = clean(fields.childName)
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  const what = fields.kind === "program" ? "Program" : `Semester-${fields.kind.slice(-1)}`;
  return `CODEship-${program?.level ?? "Certificate"}-${what}-${name || "Student"}.pdf`;
}

function drawCentered(page: PDFPage, text: string, y: number, font: PDFFont, size: number, color: RGB) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (page.getWidth() - width) / 2, y, size, font, color });
}

/** Shrinks `size` until `text` fits in `maxWidth`. */
function fitSize(text: string, font: PDFFont, size: number, maxWidth: number, minSize: number): number {
  let s = size;
  while (s > minSize && font.widthOfTextAtSize(text, s) > maxWidth) s -= 1;
  return s;
}

/** Letter-spaced uppercase label, drawn centered. */
function drawSpacedCentered(page: PDFPage, text: string, y: number, font: PDFFont, size: number, color: RGB, spacing: number) {
  const chars = [...text];
  const width = chars.reduce((w, c) => w + font.widthOfTextAtSize(c, size), 0) + spacing * (chars.length - 1);
  let x = (page.getWidth() - width) / 2;
  for (const c of chars) {
    page.drawText(c, { x, y, size, font, color });
    x += font.widthOfTextAtSize(c, size) + spacing;
  }
}

/**
 * Builds the certificate PDF (US Letter, landscape). Throws an Error with a
 * readable message when the fields are invalid or contain characters the
 * certificate font can't print.
 */
export async function renderCertificatePdf(fields: CertificateFields, assets: CertificateAssets): Promise<Uint8Array> {
  const problem = validateCertificateFields(fields);
  if (problem) throw new Error(problem);

  const program = getProgram(fields.program)!;
  const childName = clean(fields.childName);
  const instructorName = clean(fields.instructorName);
  const accent = hexToRgb(program.accentColour);
  // Engineers' identity colour is the brand navy; give its ribbon the gold instead.
  const ribbon = program.accentColour.toLowerCase() === "#0d1b2a" ? GOLD : accent;

  const doc = await PDFDocument.create();
  const title =
    fields.kind === "program"
      ? `${childName}: CODEship ${program.level} Program Certificate`
      : `${childName}: CODEship ${describeCertificate(program, fields.kind)} Certificate`;
  doc.setTitle(title);
  doc.setAuthor("CODEship Academy");
  doc.setCreator("CODEship Academy");
  doc.setProducer("CODEship Academy");
  doc.setSubject(describeCertificate(program, fields.kind));

  const page = doc.addPage([792, 612]);
  const W = page.getWidth();
  const H = page.getHeight();

  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const sansBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const serifItalic = await doc.embedFont(StandardFonts.TimesRomanBoldItalic);
  const serif = await doc.embedFont(StandardFonts.TimesRomanItalic);

  // The standard PDF fonts cover Latin (incl. accents like é, ñ, ü) but not every script.
  for (const [label, text, font] of [
    ["child's name", childName, serifItalic],
    ["instructor's name", instructorName, sans],
  ] as const) {
    try {
      font.encodeText(text);
    } catch {
      throw new Error(`The ${label} contains a character the certificate can't print. Use Latin letters only.`);
    }
  }

  const logo = await doc.embedPng(assets.logoPng);
  const seal = await doc.embedPng(assets.sealPng);

  // Paper + frame
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: PAPER });
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, borderColor: NAVY, borderWidth: 36 });
  page.drawRectangle({ x: 26, y: 26, width: W - 52, height: H - 52, borderColor: GOLD, borderWidth: 3 });
  page.drawRectangle({ x: 34, y: 34, width: W - 68, height: H - 68, borderColor: ribbon, borderWidth: 1 });

  // Corner accents
  for (const [cx, cy] of [
    [34, 34],
    [W - 34, 34],
    [34, H - 34],
    [W - 34, H - 34],
  ]) {
    page.drawRectangle({ x: cx - 7, y: cy - 7, width: 14, height: 14, color: ribbon, borderColor: NAVY, borderWidth: 1.5 });
  }

  // Logo
  const logoW = 190;
  const logoH = (logo.height / logo.width) * logoW;
  page.drawImage(logo, { x: (W - logoW) / 2, y: H - 58 - logoH, width: logoW, height: logoH });

  let y = H - 58 - logoH - 48;

  // Heading
  const heading = fields.kind === "program" ? "CERTIFICATE OF COMPLETION" : "CERTIFICATE OF ACHIEVEMENT";
  drawSpacedCentered(page, heading, y, sansBold, 24, NAVY, 2.2);
  y -= 16;
  page.drawRectangle({ x: W / 2 - 60, y, width: 120, height: 3, color: ribbon });
  y -= 34;

  drawCentered(page, "This certificate is proudly presented to", y, serif, 15, MUTED);
  y -= 56;

  // Child's name
  const nameSize = fitSize(childName, serifItalic, 46, W - 200, 24);
  drawCentered(page, childName, y, serifItalic, nameSize, NAVY);
  y -= 14;
  page.drawLine({ start: { x: W / 2 - 220, y }, end: { x: W / 2 + 220, y }, thickness: 0.75, color: MUTED });
  y -= 36;

  // What it's for
  if (fields.kind === "program") {
    drawCentered(page, "for successfully completing all four semesters and the capstone project of the", y, sans, 12.5, INK);
    y -= 28;
    drawCentered(page, `CODEship ${program.level} Program`, y, sansBold, 22, NAVY);
    y -= 22;
    const detail = `${program.codingSpace}  ·  Capstone: ${program.capstone.title}`;
    drawCentered(page, detail, y, sans, fitSize(detail, sans, 12, W - 200, 9), MUTED);
  } else {
    const n = Number(fields.kind.slice(-1));
    const semester = program.semesters.find((s) => s.number === n)!;
    drawCentered(page, "for successfully completing", y, sans, 12.5, INK);
    y -= 28;
    drawCentered(page, `${program.level}  ·  Semester ${n}`, y, sansBold, 22, NAVY);
    y -= 22;
    const detail = `Project: ${semester.project}  ·  ${semester.learn.join(", ")}`;
    drawCentered(page, detail, y, sans, fitSize(detail, sans, 12, W - 200, 9), MUTED);
  }

  // Footer: date (left), seal (centre), signature (right)
  const footY = 92;
  const colW = 200;
  const leftX = 110;
  const rightX = W - 110 - colW;

  const dateText = formatCertificateDate(fields.completionDate);
  page.drawText(dateText, {
    x: leftX + (colW - sans.widthOfTextAtSize(dateText, 13)) / 2,
    y: footY + 8,
    size: 13,
    font: sans,
    color: INK,
  });
  page.drawLine({ start: { x: leftX, y: footY }, end: { x: leftX + colW, y: footY }, thickness: 0.75, color: NAVY });
  const dateLabel = "DATE";
  page.drawText(dateLabel, {
    x: leftX + (colW - sansBold.widthOfTextAtSize(dateLabel, 9)) / 2,
    y: footY - 15,
    size: 9,
    font: sansBold,
    color: MUTED,
  });

  if (instructorName) {
    const sigSize = fitSize(instructorName, serifItalic, 20, colW, 12);
    page.drawText(instructorName, {
      x: rightX + (colW - serifItalic.widthOfTextAtSize(instructorName, sigSize)) / 2,
      y: footY + 8,
      size: sigSize,
      font: serifItalic,
      color: NAVY,
    });
  }
  page.drawLine({ start: { x: rightX, y: footY }, end: { x: rightX + colW, y: footY }, thickness: 0.75, color: NAVY });
  const sigLabel = "INSTRUCTOR, CODESHIP ACADEMY";
  page.drawText(sigLabel, {
    x: rightX + (colW - sansBold.widthOfTextAtSize(sigLabel, 9)) / 2,
    y: footY - 15,
    size: 9,
    font: sansBold,
    color: MUTED,
  });

  const sealSize = 104;
  page.drawImage(seal, { x: (W - sealSize) / 2, y: footY - 46, width: sealSize, height: sealSize });

  drawCentered(page, "codeshipacademy.com", 46, sans, 8.5, MUTED);

  return doc.save();
}

/** The programs a certificate can be issued for, in curriculum order. */
export const CERTIFICATE_PROGRAMS = PROGRAMS;
