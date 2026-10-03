// Fast acceptance tests for /tools/python (no browser): runs every lesson-plan
// case through public/py/runner.py on the same Pyodide build the page serves.
//   npm run test:python
// The browser half (share links, autosave, files, editor keys) is
// scripts/test-python-e2e.mjs.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadPyodide } from "pyodide";
import { ALL_RUN_CASES, checkResult } from "./python-cases.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let output = "";
const decoder = new TextDecoder();
const write = (bytes) => {
  output += decoder.decode(bytes, { stream: true });
  return bytes.length;
};

const pyodide = await loadPyodide();
pyodide.setStdout({ write });
pyodide.setStderr({ write });
pyodide.setStdin({ error: true });
pyodide.runPython(fs.readFileSync(path.join(root, "public/py/runner.py"), "utf8"));
const runStudentCode = pyodide.globals.get("run_student_code");
console.log(`Pyodide ${pyodide.version}, Python ${pyodide.runPython("import sys; sys.version.split()[0]")}\n`);

let failed = 0;
for (const c of ALL_RUN_CASES) {
  output = "";
  const error = runStudentCode(c.code) ?? null;
  output += decoder.decode();
  const problems = checkResult(c, { output, error });
  if (problems.length) {
    failed++;
    console.log(`FAIL  ${c.name}\n      ${problems.join("\n      ")}`);
  } else {
    console.log(`ok    ${c.name}`);
  }
  // Show the real error text, so wording changes in a Python upgrade are visible.
  if (c.error && error) console.log(error.replace(/^/gm, "        | "));
}

console.log(failed ? `\n${failed} failed` : `\nAll ${ALL_RUN_CASES.length} passed`);
process.exit(failed ? 1 : 0);
