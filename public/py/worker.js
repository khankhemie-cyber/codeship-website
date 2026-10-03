// Module worker that owns Pyodide for /tools/python. Running Python here, not
// on the page, means a student's infinite loop can't freeze the tab: the Stop
// button terminates this worker and starts a fresh one.
//
// Messages in:  { type: "run", id, code }
// Messages out: { type: "ready", ms } | { type: "loadError", message }
//               { type: "out", text } | { type: "done", id, error, ms }
//
// The Pyodide folder comes from the ?pyodide= query so this file needs no
// edit when Pyodide is upgraded.

const params = new URL(self.location.href).searchParams;
const indexURL = new URL(params.get("pyodide"), self.location.href).href;
const runnerURL = new URL("./runner.py?v=" + (params.get("v") || ""), self.location.href).href;

// Enough to show any real Semester 1 output; stops a runaway print loop from
// eating memory while the student finds the Stop button.
const OUTPUT_LIMIT = 200000;

let runStudentCode = null;
let sent = 0;
let clipped = false;
const decoder = new TextDecoder();

function send(text) {
  if (!text || clipped) return;
  if (sent + text.length > OUTPUT_LIMIT) {
    text = text.slice(0, OUTPUT_LIMIT - sent);
    clipped = true;
  }
  sent += text.length;
  if (text) self.postMessage({ type: "out", text });
}

const started = performance.now();
const ready = (async () => {
  const [{ loadPyodide }, runnerSource] = await Promise.all([
    import(indexURL + "pyodide.mjs"),
    fetch(runnerURL).then((r) => {
      if (!r.ok) throw new Error("Could not load runner.py (" + r.status + ")");
      return r.text();
    }),
  ]);
  const pyodide = await loadPyodide({ indexURL });
  // Raw byte writers keep output exact: print(..., end="") is not turned into
  // a line, and stdout/stderr interleave in the order the program wrote them.
  const write = (bytes) => {
    send(decoder.decode(bytes, { stream: true }));
    return bytes.length;
  };
  pyodide.setStdout({ write });
  pyodide.setStderr({ write });
  pyodide.setStdin({ error: true });
  pyodide.runPython(runnerSource);
  runStudentCode = pyodide.globals.get("run_student_code");
  self.postMessage({ type: "ready", ms: Math.round(performance.now() - started) });
})().catch((err) => {
  self.postMessage({ type: "loadError", message: String((err && err.message) || err) });
  throw err;
});

self.onmessage = async (e) => {
  const msg = e.data;
  if (!msg || msg.type !== "run") return;
  await ready;
  sent = 0;
  clipped = false;
  const t0 = performance.now();
  let error = null;
  try {
    error = runStudentCode(String(msg.code)) ?? null;
  } catch (err) {
    // Only reachable if Pyodide itself fails; student errors come back as text.
    error = String((err && err.message) || err);
  }
  send(decoder.decode());
  self.postMessage({ type: "done", id: msg.id, error, clipped, ms: Math.round(performance.now() - t0) });
};
