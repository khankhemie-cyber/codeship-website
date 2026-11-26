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
  "fruit-factory": `
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

crate_y = {"red": 19, "orange": 50, "yellow": 81}
for row in [19, 50, 81, 112]:
    go_to(41, row)
    face(180)
    c = item_colour()
    print("Found", c)
    pick_up()
    cy = crate_y.get(c, 112)
    go_to(70, row)
    go_to(70, cy)
    go_to(127, cy)
    face(0)
    drop()
    go_to(100, cy)
`,
  "volcano-survey": `
readings = []
for i in range(18):
    forward(10)
    t = temperature()
    readings.append(t)
    record("temp", t)
print("Hottest:", max(readings))
print("Mean:", sum(readings) / len(readings))
`,
  "treasure-vault": `
def is_strong(code):
    has_letter = any(ch.isalpha() for ch in code)
    has_digit = any(ch.isdigit() for ch in code)
    has_symbol = any(not ch.isalnum() for ch in code)
    return len(code) >= 12 and has_letter and has_digit and has_symbol

code = next_code()
while code != "":
    if is_strong(code):
        print("Accepted")
        unlock()
        forward(90)
        break
    else:
        print("Rejected:", code)
        beep()
    code = next_code()
`,
  "space-station": `
actions = {"forward": forward, "left": turn_left, "right": turn_right}
message = next_message()
while message != "":
    parts = message.split()
    word = parts[0]
    if word == "stop":
        break
    if word == "photo":
        photo()
    elif word in actions and len(parts) == 2 and parts[1].isdigit():
        actions[word](int(parts[1]))
    else:
        display("Sorry, I can't help")
    message = next_message()
`,
  "solar-farm": `
record("power", power())
forward(120)
turn_right(90)
forward(55)
turn_right(90)
forward(105)
record("power", power())
`,
  "beach-toss": `
towels = 4
length = 22
distance_cm = towels * length
print("Distance:", distance_cm)
toss(distance_cm)
`,
  "rocket-countdown": `
time_left = 5
def tick():
    global time_left
    display(time_left)
    wait(1)
    time_left -= 1
while time_left > 0:
    tick()
launch()
backward(35)
`,
  "coral-reef": `
while not obstacle():
    forward(2)
drop()
led("green")
`,
  "paint-a-square": `
pen_down("purple")
for i in range(4):
    forward(30)
    turn_left(90)
pen_up()
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


test("python: wait_for_wave() and waved() (curriculum v1.2 hand wave)", () => {
  const world = { ...missionById("sandbox").world, waves: [1, 1.5, 2] };
  const { trace, error } = run(`wait_for_wave()\nwait(2)\nn = 1\nwhile waved():\n    n += 1\nif n == 3:\n    unlock()\nelif n == 2:\n    beep()\nelse:\n    display("Locked")\nprint(n)\n`, world);
  assert(!error, error);
  assert(trace.log.some((l) => l.text.trim() === "3") && trace.stats.unlocks.length === 1, JSON.stringify(trace.log));
});
test("python: an old wait_for_clap() program is pointed at wait_for_wave()", () => {
  const { error } = run("wait_for_clap()\n", missionById("wave-concert").world);
  assert(/Did you mean wait_for_wave\(\)\?/.test(error ?? ""), error);
});
test("python: Wave-start concert passes with wait_for_wave()", () => {
  const m = missionById("wave-concert");
  const { trace, error } = run(`wait_for_wave()\nforward(55)\nplay("C")\nplay("E")\nplay("G")\n`, m.world);
  assert(!error, error);
  assert(m.check(trace, m.world).ok, m.check(trace, m.world).message);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
