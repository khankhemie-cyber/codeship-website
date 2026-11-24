/**
 * Byte Bay: runs a student's JavaScript or Python against a mission simulator.
 * Shared by the game's worker and the Node tests, so the tests run exactly
 * what students run.
 */

import { API_NAMES, BayError, TimeUp, makeSim, type MissionId, type SimResult } from "./missions";

export type RunOutcome = SimResult & { error: string | null };

const WRAPPER_LINES = 2;

function friendlyJs(err: unknown, names: string[]): string {
  if (err instanceof BayError) return `BotError: ${err.message}`;
  const e = err as Error;
  const name = e?.name || "Error";
  let message = e?.message || String(err);
  const missing = /^(\w+) is not defined$/.exec(message);
  if (name === "ReferenceError" && missing) {
    const close = names.find((n) => n.toLowerCase() === missing[1].toLowerCase());
    message = close ? `${missing[1]} is not defined. Did you mean ${close}?` : `${missing[1]} is not defined. Check the spelling.`;
  }
  if (name === "TypeError" && /undefined is not iterable|Cannot read properties of undefined/.test(message))
    message += ". A name might be missing from your map or list.";
  const m = /<anonymous>:(\d+):\d+/.exec(e?.stack ?? "");
  const line = m ? Number(m[1]) - WRAPPER_LINES : 0;
  return `${name}${line > 0 ? ` on line ${line}` : ""}: ${message}`;
}

export function runJs(mission: MissionId, code: string, world: unknown): RunOutcome {
  const sim = makeSim(mission, world);
  const names = API_NAMES[mission];
  const fns = names.map((n) => sim.api[n]);
  const consoleShim = { log: sim.api.print, info: sim.api.print, warn: sim.api.print, error: sim.api.print };
  let error: string | null = null;
  let stopped: string | null = null;
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(...names, "console", code);
    fn(...fns, consoleShim);
  } catch (err) {
    if (err instanceof TimeUp) stopped = err.message;
    else if (err instanceof SyntaxError) error = `SyntaxError: ${err.message}. Check brackets, quotes and semicolons.`;
    else error = friendlyJs(err, names);
  }
  return { steps: sim.steps, output: sim.output, check: sim.check(), stopped, error };
}

export type PyodideLike = {
  runPython: (code: string) => unknown;
  registerJsModule: (name: string, module: object) => void;
  setStdout: (opts: { batched: (s: string) => void }) => void;
  setStderr: (opts: { batched: (s: string) => void }) => void;
  globals: { get: (name: string) => unknown };
};

const ALL_NAMES = Array.from(new Set(Object.values(API_NAMES).flat())).filter((n) => n !== "print");

const RUNNER = `
import builtins, linecache, sys, traceback
FILENAME = "bot.py"

def _student_frames_only(tb):
    while tb is not None and tb.tb_frame.f_code.co_filename != FILENAME:
        tb = tb.tb_next
    return tb

def run_bay_code(source, names):
    import baybot
    ns = {"__name__": "__main__", "__file__": FILENAME, "__builtins__": builtins}
    for name in names:
        if name != "print":
            ns[name] = getattr(baybot, name)
    linecache.cache[FILENAME] = (len(source), None, source.splitlines(True), FILENAME)
    try:
        code = compile(source, FILENAME, "exec", dont_inherit=True)
        exec(code, ns)
    except SyntaxError as e:
        return "".join(traceback.format_exception(type(e), e, None))
    except BaseException as e:
        if isinstance(e, SystemExit) and e.code in (None, 0):
            return None
        if baybot._stopped():
            return None
        tb = _student_frames_only(e.__traceback__)
        lines = "".join(traceback.format_exception(type(e), e, tb)).rstrip().splitlines()
        msg = baybot._bot_error()
        if msg:
            lines = lines[:-1] + ["BotError: " + msg]
        return "\\n".join(lines)
    finally:
        sys.stdout.flush()
    return None
`;

export type PythonRunner = (mission: MissionId, code: string, world: unknown) => RunOutcome;

export function createPythonRunner(py: PyodideLike): PythonRunner {
  let api: Record<string, (...a: unknown[]) => unknown> | null = null;
  let print: ((s: string) => void) | null = null;
  let stopped: string | null = null;
  let botError = "";

  const out = (s: string) => print?.(s);
  py.setStdout({ batched: out });
  py.setStderr({ batched: out });

  const mod: Record<string, unknown> = {
    _stopped: () => stopped !== null,
    _bot_error: () => botError,
  };
  for (const name of ALL_NAMES) {
    mod[name] = (...args: unknown[]) => {
      const fn = api?.[name];
      if (!fn) throw new Error(`${name}() is not part of this mission.`);
      try {
        const r = fn(...args);
        return r === undefined ? null : r;
      } catch (err) {
        if (err instanceof TimeUp) stopped = err.message;
        else if (err instanceof BayError) botError = err.message;
        throw err;
      }
    };
  }
  py.registerJsModule("baybot", mod);
  py.runPython(RUNNER);
  const run = py.globals.get("run_bay_code") as (src: string, names: string[]) => string | null | undefined;

  return (mission, code, world) => {
    const sim = makeSim(mission, world);
    api = sim.api as unknown as Record<string, (...a: unknown[]) => unknown>;
    print = (s: string) => {
      for (const line of s.split("\n")) sim.api.print(line as never);
    };
    stopped = null;
    botError = "";
    let error: string | null = null;
    try {
      error = run(code, API_NAMES[mission]) ?? null;
    } catch (err) {
      if (err instanceof TimeUp) stopped = err.message;
      else error = String((err as Error)?.message || err);
    }
    api = null;
    print = null;
    return { steps: sim.steps, output: sim.output, check: sim.check(), stopped, error: stopped ? null : error };
  };
}
