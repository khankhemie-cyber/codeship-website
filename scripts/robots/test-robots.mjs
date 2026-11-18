// Acceptance tests for /tools/robots: every mission can be passed, wrong
// programs fail with a helpful message, and the simulator is deterministic.
// No browser.   npm run test:robots
import "../blocks/ts-resolve.mjs";
const { runJs } = await import("../../src/components/tools/robots/run.ts");
const { MISSIONS, SEMESTERS, missionById } = await import("../../src/components/tools/robots/missions.ts");
import fs from "node:fs";
const { JS, LINE_FOLLOWER } = await import("./solutions.mjs");
const { blocksToJs } = await import("../../src/components/tools/robots/robotBlocks.ts");

// Builds Blockly's saved-workspace JSON from a compact list, like a student's stack.
const chain = (list) => list.reduceRight((next, b) => ({ ...b, ...(next ? { next: { block: next } } : {}) }), null);
const ws = (...list) => ({ blocks: { languageVersion: 0, blocks: [{ type: "robot_start", x: 0, y: 0, next: { block: chain(list) } }] } });
const blk = (type, fields, inputs) => ({ type, ...(fields ? { fields } : {}), ...(inputs ? { inputs } : {}) });

let failed = 0, passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`ok    ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };

// Every program has exactly one level per semester plus the capstone, and
// the project names match the curriculum (codeship-ops curriculum/INDEX.md).
const PROJECTS = {
  Explorers: ["My Helpful Robot", "Kindness Cards", "Recycling Sorter", "My Neighbourhood Map", "Show-and-Tell App"],
  Builders: ["All About Me Page", "Weather Helper", "Class Pet Care Guide", "Save the Bees Awareness Site", "Community Helper Website"],
  Developers: ["Homework Timer & Focus Tool", "Healthy Snack Calculator", "Fact or Fake? Media-Literacy Quiz", "Budget Buddy", "Problem-Solver App"],
  Engineers: ["Password Strength Checker", "Smart Sorting AI", "Chatbot for Good", "Data Detective", "Innovation Challenge"],
};
for (const [program, projects] of Object.entries(PROJECTS)) {
  test(`${program}: one level for each of S1, S2, S3, S4 and the capstone`, () => {
    const list = MISSIONS.filter((m) => m.program === program);
    assert(list.length === 5, `${list.length} levels`);
    SEMESTERS.forEach((sem, i) => {
      const found = list.filter((m) => m.semester === sem);
      assert(found.length === 1, `${sem}: ${found.length} levels`);
      assert(found[0].fits.endsWith(projects[i]), `${sem} fits "${found[0].fits}", curriculum project is "${projects[i]}"`);
    });
  });
}
test("mission ids are unique and every mission has a solution", () => {
  const ids = MISSIONS.map((m) => m.id);
  assert(new Set(ids).size === ids.length, "duplicate id");
  for (const id of ids) assert(JS[id], `no reference solution for ${id}`);
});

for (const m of MISSIONS) {
  test(`${m.id}: reference solution passes`, () => {
    const { trace, error } = runJs(JS[m.id], m.world);
    assert(!error, `error: ${error}`);
    const r = m.check(trace, m.world);
    const f = trace.frames.at(-1);
    assert(r.ok, `${r.message} (robot at ${f.x},${f.y} h${f.heading}, dist ${f.sensors.distance}, drove ${trace.stats.distance.toFixed(1)})`);
  });
  if (m.id !== "sandbox") test(`${m.id}: starter code does not pass yet`, () => {
    const { trace, error } = runJs(m.starter.js, m.world);
    assert(!error, `starter error: ${error}`);
    assert(!m.check(trace, m.world).ok, "starter already passes the goal");
  });
}

test("blocks: Explorers toy-bin stack passes", () => {
  const code = blocksToJs(ws(blk("robot_forward", { N: 32 }), blk("robot_pick_up"), blk("robot_forward", { N: 40 }), blk("robot_drop")));
  const m = missionById("toy-bin");
  const { trace, error } = runJs(code, m.world);
  assert(!error, error);
  assert(m.check(trace, m.world).ok, code);
});
test("blocks: repeat until + sense passes Stop at the bin", () => {
  const code = blocksToJs(ws(
    blk("robot_until", null, { COND: { block: blk("robot_sense", { S: "obstacle()" }) }, DO: { block: blk("robot_forward", { N: 2 }) } }),
    blk("robot_beep"),
  ));
  const m = missionById("bin-stop");
  const { trace, error } = runJs(code, m.world);
  assert(!error, error);
  assert(m.check(trace, m.world).ok, code);
});
test("blocks: if/else on light passes Lights in the tunnel", () => {
  const code = blocksToJs(ws(blk("robot_repeat", { N: 66 }, { DO: { block: chain([
    blk("robot_forward", { N: 2 }),
    blk("robot_if_else", null, {
      COND: { block: blk("robot_sense", { S: "light() < 30" }) },
      DO: { block: blk("robot_led", { C: "yellow" }) },
      ELSE: { block: blk("robot_led", { C: "off" }) },
    }),
  ]) } })));
  const m = missionById("day-night");
  const { trace, error } = runJs(code, m.world);
  assert(!error, error);
  assert(m.check(trace, m.world).ok, code);
});
test("blocks: loose blocks without a start block do nothing", () => {
  assert(blocksToJs({ blocks: { blocks: [blk("robot_forward", { N: 10 })] } }) === "", "generated code without a start block");
});
test("blocks: generated code is readable JavaScript", () => {
  const code = blocksToJs(ws(blk("robot_repeat", { N: 2 }, { DO: { block: blk("robot_turn_left", { N: 90 }) } })));
  assert(code === "for (let i = 0; i < 2; i++) {\n  turnLeft(90);\n}\n", JSON.stringify(code));
});
// Common wrong answers get the right "not yet" message.
const WRONG = [
  ["lock-the-robot", `forward(100);`, /moved before the strong passcode|read 0 of 3/],
  ["lock-the-robot", `let c = nextCode(); while (c !== "") { if (c.length >= 4) { forward(100); break; } beep(); c = nextCode(); }`, /moved before the strong passcode/],
  ["help-desk-robot", `const a = { forward: (n) => forward(n), left: (n) => turnLeft(n) }; let m = nextMessage(); while (m !== "") { const [w, n] = m.split(" "); if (a[w]) a[w](Number(n)); else display("Sorry"); m = nextMessage(); }`, /kept going after "stop"/],
  ["help-desk-robot", `let m = nextMessage(); while (m !== "") { const [w, n] = m.split(" "); if (w === "stop") break; if (w === "forward") forward(Number(n)); if (w === "left") turnLeft(Number(n)); m = nextMessage(); }`, /polite refusal/],
  ["focus-timer", `for (const n of [5, 4, 3, 2, 1]) display(n); beep(); forward(100);`, /Wait 1 second/],
  ["snack-stand", `forward(88);`, /Print the distance/],
  ["snack-stand", `const d = 4 * 20; console.log(d); forward(d);`, /Print the distance|stopped 8 cm/],
  ["pet-routine", `forward(45); turnLeft(180); forward(90);`, /Food bowl 1 of 2, bed 1 of 2/],
  ["meet-my-robot", `display("Hi"); led("red"); beep(); beep(); turnLeft(180);`, /turned 180 degrees/],
  ["show-and-tell", `forward(95); beep(); turnLeft(180); forward(95);`, /turn your light on/],
  ["hallway-helper", `while (!obstacle()) forward(2);`, /Light on in the dark/],
  ["recycling-helper", `forward(5);`, /0 of 4 items in the right bin/],
];
for (const [id, code, expect] of WRONG) {
  test(`${id}: wrong answer is caught (${String(expect).slice(1, 30)}...)`, () => {
    const m = missionById(id);
    const { trace, error } = runJs(code, m.world);
    assert(!error, error);
    const r = m.check(trace, m.world);
    assert(!r.ok && expect.test(r.message), r.message);
  });
}

// Blocks: an Explorers or Builders child can finish their levels with blocks alone.
test("blocks: every Explorers and Builders level can be solved with blocks", () => {
  const f = (N) => blk("robot_forward", { N }), L = (N) => blk("robot_turn_left", { N }), R = (N) => blk("robot_turn_right", { N });
  const STACKS = {
    "toy-bin": [f(32), blk("robot_pick_up"), f(40), blk("robot_drop")],
    "kindness-delivery": [blk("robot_wait_clap"), f(80), blk("robot_beep")],
    "bin-stop": [blk("robot_until", null, { COND: { block: blk("robot_sense", { S: "obstacle()" }) }, DO: { block: f(2) } }), blk("robot_beep")],
    "neighbourhood": [f(50), L(90), f(55), R(90), f(45)],
    "show-and-tell": [f(95), blk("robot_led", { C: "green" }), blk("robot_beep"), L(180), f(95)],
    "meet-my-robot": [blk("robot_display", { T: "Hi I'm Bolt" }), blk("robot_led", { C: "blue" }), blk("robot_beep"), blk("robot_beep"), L(360)],
    "day-night": [blk("robot_repeat", { N: 66 }, { DO: { block: chain([f(2), blk("robot_if_else", null, { COND: { block: blk("robot_sense", { S: "light() < 30" }) }, DO: { block: blk("robot_led", { C: "yellow" }) }, ELSE: { block: blk("robot_led", { C: "off" }) } })]) } })],
    "pet-routine": [blk("robot_repeat", { N: 2 }, { DO: { block: chain([f(45), blk("robot_beep"), L(180), f(90), blk("robot_wait", { N: 1 }), L(180), f(45)]) } })],
    "pollinator": [f(25), blk("robot_wait", { N: 1 }), f(15), L(90), f(35), R(90), f(30), blk("robot_wait", { N: 1 }), f(30), R(90), f(20), blk("robot_wait", { N: 1 }), f(15), L(90), f(30), blk("robot_wait", { N: 1 })],
    "community-helper": [blk("robot_pick_up"), f(80), L(90), f(40), blk("robot_drop"), blk("robot_beep")],
  };
  for (const [id, list] of Object.entries(STACKS)) {
    const m = missionById(id);
    const { trace, error } = runJs(blocksToJs(ws(...list)), m.world);
    assert(!error, `${id}: ${error}`);
    const r = m.check(trace, m.world);
    assert(r.ok, `${id}: ${r.message}`);
  }
  const covered = MISSIONS.filter((m) => m.program === "Explorers" || m.program === "Builders").every((m) => STACKS[m.id]);
  assert(covered, "an Explorers or Builders level has no blocks solution");
});

test("time limit stops a loop that never ends", () => {
  const { trace, error } = runJs("while (true) { turnLeft(10); }", missionById("sandbox").world);
  assert(!error, error);
  assert(trace.stoppedReason && /Time's up/.test(trace.stoppedReason), "no time-up reason");
});
test("a sensor-only loop still ends (reads take time)", () => {
  const { trace } = runJs("while (true) { distance(); }", missionById("sandbox").world);
  assert(trace.stoppedReason, "did not stop");
});
test("misspelt function names get a hint", () => {
  const { error } = runJs("Forward(10);", missionById("sandbox").world);
  assert(/Did you mean forward\?/.test(error), error);
});
test("NaN distances are explained", () => {
  const { error } = runJs("forward(0 / 0);", missionById("sandbox").world);
  assert(/NaN \(not a number\)/.test(error), error);
});
test("bad LED colour explains the choices", () => {
  const { error } = runJs('led("pink");', missionById("sandbox").world);
  assert(/can be off, red/.test(error), error);
});
test("bumping a wall stops the move and counts a bump", () => {
  const { trace } = runJs("forward(500);", missionById("bin-stop").world);
  assert(trace.stats.bumps === 1, `bumps ${trace.stats.bumps}`);
});
test("runs are deterministic (noisy sensor too)", () => {
  const w = missionById("wall-stop").world;
  const a = JSON.stringify(runJs(JS["wall-stop"], w).trace);
  const b = JSON.stringify(runJs(JS["wall-stop"], w).trace);
  assert(a === b, "two runs differ");
});
test("line follower goes round the Free build oval", () => {
  const w = missionById("sandbox").world;
  const { trace } = runJs(LINE_FOLLOWER, w);
  const onLineFrames = trace.frames.filter((f) => Math.abs(Math.hypot((f.x - 80) / 55, (f.y - 55) / 32) - 1) < 0.08).length;
  const f = trace.frames.at(-1);
  assert(onLineFrames / trace.frames.length > 0.9, `stayed near line ${Math.round(100 * onLineFrames / trace.frames.length)}%`);
  assert(trace.stats.distance > 150, `only drove ${trace.stats.distance}`);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
