// Acceptance tests for /tools/robots: every mission can be passed, wrong
// programs fail with a helpful message, and the simulator is deterministic.
// No browser.   npm run test:robots
import "../blocks/ts-resolve.mjs";
const { runJs } = await import("../../src/components/tools/robots/run.ts");
const { MISSIONS, missionById } = await import("../../src/components/tools/robots/missions.ts");
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
