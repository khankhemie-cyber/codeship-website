// Python acceptance tests for /tools/robots, through the real Pyodide (from
// node_modules) and the same python.ts the browser worker uses.
//   npm run test:robots:python
import "../blocks/ts-resolve.mjs";
import { loadPyodide } from "pyodide";
const { createPythonRunner } = await import("../../src/components/tools/robots/python.ts");
const { MISSIONS, missionById } = await import("../../src/components/tools/robots/missions.ts");

const run = createPythonRunner(await loadPyodide());
let failed = 0, passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`ok    ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };

const SOLUTIONS = {
  "colour-sort": `
import math
x, y, h = 70, 50, 180

def face(target):
    global h
    d = (target - h + 540) % 360 - 180
    if d > 0:
        turn_left(d)
    else:
        turn_right(-d)
    h = target

def go_to(tx, ty):
    global x, y
    dx, dy = tx - x, ty - y
    dist = math.hypot(dx, dy)
    if dist < 0.01:
        return
    face(math.degrees(math.atan2(-dy, dx)))
    forward(dist)
    x, y = tx, ty

zone_y = {"red": 19, "blue": 50, "yellow": 81}
for row in [19, 50, 81]:
    go_to(41, row)
    face(180)
    c = item_colour()
    print("Found", c)
    pick_up()
    go_to(70, row)
    go_to(70, zone_y[c])
    go_to(127, zone_y[c])
    face(0)
    drop()
    go_to(100, zone_y[c])
`,
  "survey": `
for i in range(18):
    forward(10)
    record("light", light())
`,
  "bin-stop": `
while not obstacle():
    forward(2)
beep()
`,
};

for (const [id, code] of Object.entries(SOLUTIONS)) {
  test(`python ${id}: solution passes`, () => {
    const m = missionById(id);
    const { trace, error } = run(code, m.world);
    assert(!error, error);
    const r = m.check(trace, m.world);
    assert(r.ok, r.message);
  });
}
test("python print goes to the robot log with a time", () => {
  const { trace } = run('forward(10)\nprint("hello", 3)', missionById("sandbox").world);
  assert(trace.log.length === 1 && trace.log[0].text === "hello 3" && trace.log[0].t > 0.5, JSON.stringify(trace.log));
});
test("python while True is stopped by the time limit, not an error", () => {
  const { trace, error } = run("while True:\n    turn_left(10)", missionById("sandbox").world);
  assert(!error, error);
  assert(/Time's up/.test(trace.stoppedReason || ""), "no time-up");
});
test("python NameError points at the student's line", () => {
  const { error } = run("forward(10)\nturnleft(90)", missionById("sandbox").world);
  assert(/line 2/.test(error) && /NameError/.test(error), error);
});
test("python RobotError is readable", () => {
  const { error } = run('led("pink")', missionById("sandbox").world);
  assert(/RobotError: The light can be/.test(error), error);
});
test("python IndentationError is shown as Python reports it", () => {
  const { error } = run("for i in range(3):\nforward(1)", missionById("sandbox").world);
  assert(/IndentationError/.test(error), error);
});
test("runner is reusable across runs (state resets)", () => {
  const a = run("forward(10)", missionById("sandbox").world);
  const b = run("forward(10)", missionById("sandbox").world);
  assert(JSON.stringify(a.trace) === JSON.stringify(b.trace), "runs differ");
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
