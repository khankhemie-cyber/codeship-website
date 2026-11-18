/// <reference lib="webworker" />
/**
 * Runs Robot Lab programs off the page's main thread, so a loop that never
 * ends can't freeze the tab: the page terminates this worker if a run takes
 * too long in real time and starts a new one.
 *
 * In:  { type: "run", id, lang: "js" | "py", code, world }
 * Out: { type: "done", id, trace, error } | { type: "status", text }
 *
 * Python comes from the same self-hosted Pyodide as /tools/python
 * (public/py/pyodide-<version>/), loaded the first time a Python run arrives.
 */

import pyodidePackage from "pyodide/package.json";
import type { World } from "./sim";
import { runJs } from "./run";
import { createPythonRunner, type PyodideLike, type PythonRunner } from "./python";

const ctx = self as unknown as DedicatedWorkerGlobalScope;
const PYODIDE_DIR = `/py/pyodide-${pyodidePackage.version}/`;

let pyodidePromise: Promise<PythonRunner> | null = null;

function loadPython(): Promise<PythonRunner> {
  if (!pyodidePromise) {
    ctx.postMessage({ type: "status", text: "Loading Python (first run only)…" });
    pyodidePromise = (async () => {
      // Next bundles this file as a classic worker. Pyodide refuses classic
      // workers (it would load its files with importScripts); it detects one
      // by calling importScripts, so hide that while Pyodide starts. Pyodide
      // then loads everything with import(), which classic workers support.
      const g = globalThis as unknown as { importScripts?: unknown };
      const original = g.importScripts;
      g.importScripts = () => {
        throw new TypeError("importScripts is not available");
      };
      try {
        const mod = await import(/* webpackIgnore: true */ new URL(PYODIDE_DIR + "pyodide.mjs", ctx.location.origin).href);
        const py = (await mod.loadPyodide({ indexURL: new URL(PYODIDE_DIR, ctx.location.origin).href })) as PyodideLike;
        return createPythonRunner(py);
      } finally {
        g.importScripts = original;
      }
    })();
    pyodidePromise.catch(() => {
      pyodidePromise = null;
    });
  }
  return pyodidePromise;
}

ctx.onmessage = async (e: MessageEvent) => {
  const msg = e.data as { type: string; id: number; lang: "js" | "py"; code: string; world: World };
  if (msg?.type === "warm") {
    loadPython().then(
      () => ctx.postMessage({ type: "status", text: "" }),
      (err) => ctx.postMessage({ type: "status", text: "Python could not load: " + String(err?.message || err) })
    );
    return;
  }
  if (msg?.type !== "run") return;
  try {
    const result = msg.lang === "py" ? (await loadPython())(msg.code, msg.world) : runJs(msg.code, msg.world);
    ctx.postMessage({ type: "done", id: msg.id, ...result });
  } catch (err) {
    ctx.postMessage({ type: "failed", id: msg.id, message: String((err as Error)?.message || err) });
  }
};
