// Fast tests for /tools/playground: every Star Path level has a reference
// solution that wins within its block budget, and every "fix the bug" level
// opens with a program that does NOT already win.   npm run test:playground
import "../blocks/ts-resolve.mjs";
const SP = await import("../../src/components/tools/playground/starPath.ts");

// One reference solution per level, in order (U D L R, n(...) = Repeat n).
const SOLUTIONS = [
  "R R R",
  "U U",
  "D D D R R",
  "R R R U U L L",
  "U R R R R D",
  "D D L L L U U",
  "5(R)",
  "4(U)",
  "3(U R)",
  "4(R) 4(D)",
  "3(R R U)",
  "R R",
  "R R D D",
  "5(R)",
  "3(U R)",
];

let failed = 0, passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`ok    ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); }
}
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

test("one reference solution per level", () => assert(SOLUTIONS.length === SP.LEVELS.length, `${SOLUTIONS.length} solutions for ${SP.LEVELS.length} levels`));

SP.LEVELS.forEach((level, i) => {
  const n = i + 1;
  test(`level ${n} (${level.kind}): map is ${SP.COLS}x${SP.ROWS} with one robot and a star`, () => {
    assert(level.map.length === SP.ROWS && level.map.every((r) => r.length === SP.COLS), "bad map size");
    assert(SP.find(level, "R").length === 1, "needs exactly one robot");
    assert(SP.find(level, "*").length >= 1, "needs a star");
  });
  test(`level ${n}: reference solution wins within budget`, () => {
    const p = SP.parseProgram(SOLUTIONS[i]);
    assert(level.allowRepeat || p.every((c) => c.t === "move"), "uses Repeat on a level without it");
    p.forEach((c) => assert(c.t === "move" || SP.REPEAT_COUNTS.includes(c.n), `repeat count ${c.n} not offered`));
    const r = SP.run(level, p);
    assert(r.outcome === "win", `outcome ${r.outcome}`);
  });
  if (level.maxBlocks) test(`level ${n}: plain arrows alone are over budget (Repeat is needed)`, () => {
    const arrows = SP.flatten(SP.parseProgram(SOLUTIONS[i])).length;
    assert(arrows > level.maxBlocks, `${arrows} arrows fit in a budget of ${level.maxBlocks}`);
  });
  if (level.kind === "debug") test(`level ${n}: the starter program has a bug`, () => {
    assert(level.starter?.length, "no starter");
    assert(SP.run(level, level.starter).outcome !== "win", "starter already wins");
    assert(!level.maxBlocks || SP.blockCount(level.starter) <= level.maxBlocks, "starter is over budget");
  });
});

test("bumping a rock stops the robot where it is", () => {
  const r = SP.run(SP.LEVELS[4], SP.parseProgram("R R R"));
  assert(r.outcome === "bump" && r.steps.at(-1).x === 2, JSON.stringify(r));
});
test("walking off the edge is a bump", () => {
  assert(SP.run(SP.LEVELS[0], SP.parseProgram("L L L")).outcome === "bump", "expected bump");
});
test("over budget is refused before moving", () => {
  const r = SP.run(SP.LEVELS[6], SP.parseProgram("R R R R R"));
  assert(r.outcome === "tooMany" && r.steps.length === 1, r.outcome);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
