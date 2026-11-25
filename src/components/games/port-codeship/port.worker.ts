// © 2026 CODEship Academy. All rights reserved. Proprietary and confidential: see LICENSE.
/// <reference lib="webworker" />
/**
 * Runs Port CODEship programs off the main thread, so a loop that never ends can't
 * freeze the 3D world: the page terminates this worker if a run takes too long
 * and starts a new one.
 *
 * In:  { type: "run", id, mission, lang, code, worlds }
 * Out: { type: "done", id, results } | { type: "failed", id, message } | { type: "status", text }
 */

import pyodidePackage from "pyodide/package.json";
import type { Lang, MissionId } from "@/lib/games/port/missions";
import { createPythonRunner, runJs, type PyodideLike, type PythonRunner } from "@/lib/games/port/runner";

const ctx = self as unknown as DedicatedWorkerGlobalScope;
const PYODIDE_DIR = `/py/pyodide-${pyodidePackage.version}/`;

let pyodidePromise: Promise<PythonRunner> | null = null;

function loadPython(): Promise<PythonRunner> {
  if (!pyodidePromise) {
    ctx.postMessage({ type: "status", text: "Loading Python (first run only)…" });
    pyodidePromise = (async () => {
      // Pyodide refuses classic workers; hide importScripts while it starts
      // (same approach as Robot Lab's worker).
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
  const msg = e.data as { type: string; id: number; mission: MissionId; lang: Lang; code: string; worlds: unknown[] };
  if (msg?.type === "warm") {
    loadPython().then(
      () => ctx.postMessage({ type: "status", text: "" }),
      (err) => ctx.postMessage({ type: "status", text: "Python could not load: " + String(err?.message || err) })
    );
    return;
  }
  if (msg?.type !== "run") return;
  try {
    const run = msg.lang === "py" ? await loadPython() : runJs;
    const results = msg.worlds.map((w) => run(msg.mission, msg.code, w));
    ctx.postMessage({ type: "status", text: "" });
    ctx.postMessage({ type: "done", id: msg.id, results });
  } catch (err) {
    ctx.postMessage({ type: "failed", id: msg.id, message: String((err as Error)?.message || err) });
  }
};
