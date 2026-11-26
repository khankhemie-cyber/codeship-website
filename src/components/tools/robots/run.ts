/**
 * Runs a student program against the simulator and returns the trace.
 * runJs is used by the worker (for Blocks and JavaScript) and by the tests.
 * Python runs in the same worker through Pyodide (see robot.worker.ts).
 */

import { JS_NAMES, RobotError, Sim, TimeUp, robotApi, type Trace, type World } from "./sim";

export type RunOutcome = {
  trace: Trace;
  /** A student error to show (with a line number when we have one), or null. */
  error: string | null;
};

/** Friendly wording for the JavaScript errors students hit most. */
function explainJs(err: unknown): string {
  if (err instanceof RobotError) return err.message;
  const e = err as Error;
  const name = e?.name || "Error";
  let message = e?.message || String(err);
  const missing = /^(\w+) is not defined$/.exec(message);
  if (name === "ReferenceError" && missing) {
    const close = JS_NAMES.find((n) => n.toLowerCase() === missing[1].toLowerCase());
    // Curriculum v1.2: the clap became a hand wave.
    const wave = /clap/i.test(missing[1]) ? missing[1].replace(/clapped/i, "waved").replace(/Clap/, "Wave") : null;
    message = wave && JS_NAMES.includes(wave as never) ? `${missing[1]} is not defined. The clap is now a hand wave: use ${wave}.` : close ? `${missing[1]} is not defined. Did you mean ${close}? Capital letters matter.` : `${missing[1]} is not defined. Check the spelling.`;
  }
  const line = lineOf(e);
  return `${name}${line ? ` on line ${line}` : ""}: ${message}`;
}

/** new Function adds two lines before the student's code. */
const WRAPPER_LINES = 2;
function lineOf(e: Error): number | null {
  const m = /<anonymous>:(\d+):\d+/.exec(e?.stack ?? "") ?? /eval.*?:(\d+):\d+/.exec(e?.stack ?? "");
  if (!m) return null;
  const n = Number(m[1]) - WRAPPER_LINES;
  return n > 0 ? n : null;
}

export function runJs(code: string, world: World): RunOutcome {
  const sim = new Sim(world);
  const api = robotApi(sim) as Record<string, (...args: never[]) => unknown>;
  const names = Object.keys(api);
  const consoleShim = { log: api.print, info: api.print, warn: api.print, error: api.print };
  let error: string | null = null;
  let stopped: string | null = null;
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(...names, "console", code);
    fn(...names.map((n) => api[n]), consoleShim);
  } catch (err) {
    if (err instanceof TimeUp) stopped = err.message;
    else if (err instanceof SyntaxError) error = `SyntaxError: ${err.message}. Check brackets, quotes and semicolons.`;
    else error = explainJs(err);
  }
  return { trace: sim.trace(stopped), error };
}
