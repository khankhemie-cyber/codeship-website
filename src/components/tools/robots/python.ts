/**
 * Python for Robot Lab: wires a loaded Pyodide to the simulator. Shared by
 * the worker (browser) and the acceptance tests (Node), so the tests run
 * exactly what students run. Students write plain calls (forward(10)); the
 * robot functions are put in their file's namespace for them.
 */

import { PYTHON_NAMES, RobotError, Sim, TimeUp, robotApi, type World } from "./sim";
import type { RunOutcome } from "./run";

export type PyodideLike = {
  runPython: (code: string) => unknown;
  registerJsModule: (name: string, module: object) => void;
  setStdout: (opts: { batched: (s: string) => void }) => void;
  setStderr: (opts: { batched: (s: string) => void }) => void;
  globals: { get: (name: string) => unknown };
};

export type PythonRunner = (code: string, world: World) => RunOutcome;

const RUNNER = `
import builtins, linecache, sys, traceback
FILENAME = "robot.py"
_NAMES = ${JSON.stringify(Object.keys(PYTHON_NAMES))}

def _student_frames_only(tb):
    while tb is not None and tb.tb_frame.f_code.co_filename != FILENAME:
        tb = tb.tb_next
    return tb

def run_robot_code(source):
    import robot
    ns = {"__name__": "__main__", "__file__": FILENAME, "__builtins__": builtins}
    for name in _NAMES:
        ns[name] = getattr(robot, name)
    linecache.cache[FILENAME] = (len(source), None, source.splitlines(True), FILENAME)
    try:
        code = compile(source, FILENAME, "exec", dont_inherit=True)
        exec(code, ns)
    except SyntaxError as e:
        return "".join(traceback.format_exception(type(e), e, None))
    except BaseException as e:
        if isinstance(e, SystemExit) and e.code in (None, 0):
            return None
        if robot._stopped():
            return None
        tb = _student_frames_only(e.__traceback__)
        lines = "".join(traceback.format_exception(type(e), e, tb)).rstrip().splitlines()
        msg = robot._robot_error()
        if msg:
            lines = lines[:-1] + ["RobotError: " + msg]
        return "\\n".join(lines)
    finally:
        sys.stdout.flush()
    return None
`;

export function createPythonRunner(py: PyodideLike): PythonRunner {
  let sim: Sim | null = null;
  let api: Record<string, (...a: unknown[]) => unknown> | null = null;
  let stopped: string | null = null;
  let robotError = "";

  const out = (s: string) => sim?.print(s);
  py.setStdout({ batched: out });
  py.setStderr({ batched: out });

  const robotModule: Record<string, unknown> = {
    _stopped: () => stopped !== null,
    _robot_error: () => robotError,
  };
  for (const [pyName, jsName] of Object.entries(PYTHON_NAMES)) {
    robotModule[pyName] = (...args: unknown[]) => {
      if (!api) throw new Error("No run in progress.");
      try {
        return api[jsName](...args);
      } catch (err) {
        if (err instanceof TimeUp) stopped = err.message;
        else if (err instanceof RobotError) robotError = err.message;
        throw err;
      }
    };
  }
  py.registerJsModule("robot", robotModule);
  py.runPython(RUNNER);
  const run = py.globals.get("run_robot_code") as (src: string) => string | null | undefined;

  return (code, world) => {
    sim = new Sim(world);
    api = robotApi(sim) as unknown as Record<string, (...a: unknown[]) => unknown>;
    stopped = null;
    robotError = "";
    let error: string | null = null;
    try {
      error = run(code) ?? null;
    } catch (err) {
      error = String((err as Error)?.message || err);
    }
    const trace = sim.trace(stopped);
    const result = { trace, error: stopped ? null : error };
    sim = null;
    api = null;
    return result;
  };
}
