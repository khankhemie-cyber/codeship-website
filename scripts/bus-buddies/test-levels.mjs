// Bus Buddies Road Trip: every level can be solved with its own solution
// within its block limit, using only its own blocks; wrong programs fail
// gently with the right line and glowing block; every line ID exists in
// voice-script.json. No browser.   npm run test:bus
import "../blocks/ts-resolve.mjs";
import fs from "node:fs";
const { LEVELS, CHAPTERS } = await import("../../src/lib/games/bus/levels.ts");
const { run, nextCorrect, findChar } = await import("../../src/lib/games/bus/engine.ts");
const script = JSON.parse(fs.readFileSync(new URL("../../src/lib/games/bus/voice-script.json", import.meta.url)));
const lineIds = new Set(script.lines.map((l) => l.id));

let failed = 0, passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`ok    ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const eq = (a, b, m) => assert(JSON.stringify(a) === JSON.stringify(b), `${m}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);

test("line IDs in the voice script are unique", () => {
  assert(lineIds.size === script.lines.length, "duplicate line id");
  for (const l of script.lines) assert(script.characters[l.character], `${l.id}: unknown character ${l.character}`);
});

for (const level of LEVELS) {
  test(`${level.id} ${level.title}: solution works`, () => {
    const r = run(level, level.solution);
    assert(r.outcome.ok, `solution fails: ${JSON.stringify(r.outcome)}`);
    assert(level.solution.length <= level.maxBlocks, "solution longer than maxBlocks");
    for (const b of level.solution) assert(level.blocks.includes(b), `solution uses ${b}, not in the palette`);
  });
  test(`${level.id}: map is rectangular, has a start, every stop and line exists`, () => {
    const w = level.map[0].length;
    assert(level.map.every((r) => r.length === w), "rows differ in length");
    assert(level.map.length >= 5 && level.map.length <= 7 && w >= 5 && w <= 7, "map must be 5x5 to 7x7");
    assert(findChar(level, "S"), "no S");
    for (const p of level.passengers) assert(findChar(level, p.stop), `no stop ${p.stop}`);
    const ids = [level.prompt, level.successLine, ...level.passengers.flatMap((p) => [p.boardLine, p.waitingLine].filter(Boolean))];
    for (const id of ids) assert(lineIds.has(id), `missing line ${id}`);
  });
  test(`${level.id}: an empty program is "not there yet", never a crash`, () => {
    const r = run(level, []);
    assert(!r.outcome.ok && r.outcome.blame === null, JSON.stringify(r.outcome));
  });
  test(`${level.id}: one block too many is a gentle oops on that block`, () => {
    const r = run(level, [...level.solution, "forward"]);
    // A solution that ends at the goal facing more road may still be fine; otherwise the extra block glows.
    if (!r.outcome.ok) eq(r.outcome.blame, level.solution.length, "blamed block");
  });
  test(`${level.id}: hints walk to the solution`, () => {
    let program = [];
    for (let i = 0; i < 20; i++) {
      const next = nextCorrect(level, program);
      if (!next) break;
      program = [...program.slice(0, next.index), next.block];
    }
    eq(program, level.solution, "hint path");
  });
}

test("1-1 is solvable in 2 blocks", () => eq(LEVELS[0].solution.length, 2, "length"));
test("1-1: three forwards drives onto the grass, third block glows", () => {
  const r = run(LEVELS[0], ["forward", "forward", "forward"]);
  eq(r.outcome, { ok: false, blame: 2, line: "common.oops_grass" }, "outcome");
});
test("1-2: going straight on hits the flowers", () => {
  const r = run(LEVELS[1], ["forward", "forward"]);
  eq(r.outcome, { ok: false, blame: 1, line: "common.oops_flowers" }, "outcome");
});
test("1-3: parking by Olive without a honk: she's still asleep", () => {
  const r = run(LEVELS[2], ["forward", "right", "forward", "forward"]);
  eq(r.outcome, { ok: false, blame: null, line: "ch1.owl.sleep" }, "outcome");
});
test("1-3: driving past Olive without honking blames the block that left her", () => {
  const r = run(LEVELS[2], ["forward", "right", "forward", "forward", "forward"]);
  eq(r.outcome, { ok: false, blame: 4, line: "common.oops_cows" }, "cows first");
});
test("1-4: turning the wrong way into the cows", () => {
  const r = run(LEVELS[3], ["forward", "left", "forward", "forward", "forward"]);
  eq(r.outcome, { ok: false, blame: 4, line: "common.oops_cows" }, "outcome");
});
test("turns keep a continuous angle (no long spins)", () => {
  const r = run(LEVELS[1], ["left", "left", "right"]);
  eq(r.frames.map((f) => f.angle), [0, -90, 0], "angles");
});
test("ready chapters have intro/outro lines that exist", () => {
  for (const c of CHAPTERS.filter((c) => c.ready)) for (const id of [...c.intro, ...c.outro]) assert(lineIds.has(id), `missing ${id}`);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
