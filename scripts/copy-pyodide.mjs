// Copies the Pyodide runtime from node_modules into public/py/pyodide-<version>/
// so /tools/python serves Python from our own origin (no third-party CDN sees
// students' requests, and a school filter that blocks CDNs can't break class).
// The folder name carries the version, so public/_headers can cache it forever.
// Runs before `dev` and `build`; the output is gitignored.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkgDir = path.dirname(require.resolve("pyodide/package.json"));
const { version } = JSON.parse(fs.readFileSync(path.join(pkgDir, "package.json"), "utf8"));
const FILES = ["pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"];

const publicPy = path.join(process.cwd(), "public", "py");
const dest = path.join(publicPy, `pyodide-${version}`);

for (const entry of fs.readdirSync(publicPy)) {
  if (entry.startsWith("pyodide-") && entry !== `pyodide-${version}`) {
    fs.rmSync(path.join(publicPy, entry), { recursive: true, force: true });
  }
}
fs.mkdirSync(dest, { recursive: true });
for (const file of FILES) fs.copyFileSync(path.join(pkgDir, file), path.join(dest, file));
console.log(`Pyodide ${version} copied to public/py/pyodide-${version}/`);
