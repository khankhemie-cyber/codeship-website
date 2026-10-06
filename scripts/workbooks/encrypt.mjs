// Encrypts the fillable workbooks so they can sit in this public repo.
//
//   WORKBOOK_FILE_KEY=<base64, 32 bytes> node scripts/workbooks/encrypt.mjs
//
// Reads  scripts/workbooks/private/fillable/codeship-<program>-s1-workbook.pdf (gitignored)
// Writes public/workbooks/encrypted/s1/<program>.bin  = 12-byte IV + AES-256-GCM ciphertext/tag,
// with "<semester>:<program>" as additional data so files cannot be swapped between programs.
// /api/workbooks/download decrypts with the same key (a Cloudflare Pages env var) after the
// password check, so the plain PDF is never public.
import { createCipheriv, randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SEMESTER = "s1";
const PROGRAMS = ["explorers", "builders", "developers", "engineers"];

const key = Buffer.from(process.env.WORKBOOK_FILE_KEY ?? "", "base64");
if (key.length !== 32) {
  console.error("Set WORKBOOK_FILE_KEY to the same base64 32-byte key the site uses.");
  process.exit(1);
}

const outDir = join(here, "../../public/workbooks/encrypted", SEMESTER);
mkdirSync(outDir, { recursive: true });
for (const program of PROGRAMS) {
  const pdf = readFileSync(join(here, "private/fillable", `codeship-${program}-${SEMESTER}-workbook.pdf`));
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(`${SEMESTER}:${program}`));
  const body = Buffer.concat([cipher.update(pdf), cipher.final(), cipher.getAuthTag()]);
  writeFileSync(join(outDir, `${program}.bin`), Buffer.concat([iv, body]));
  console.log(`${program}: ${pdf.length} bytes encrypted`);
}
