// Fast tests for /tools/playground: every Star Path level has a reference
// solution that wins within its block budget, and every "fix the bug" level
// opens with a program that does NOT already win.   npm run test:playground
import "../blocks/ts-resolve.mjs";
const SP = await import("../../src/components/tools/playground/starPath.ts");
const RR = await import("../../src/components/tools/playground/adventure/roverRoads.ts");
const SS = await import("../../src/components/tools/playground/adventure/starStitch.ts");

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

// ── Rover Roads: reference road for each level, as "x,y:piece" (added or changed pieces only) ──
const ROADS = [
  "2,2:- 3,2:-",
  "3,3:| 3,2:|",
  "2,3:- 3,3:- 4,3:J 4,2:|",
  "1,1:- 2,1:- 3,1:7 3,2:| 3,3:L 4,3:- 5,3:-",
  "1,2:J 1,1:| 1,0:F 2,0:- 3,0:- 4,0:7 4,1:| 4,2:L 5,2:-",
  "1,3:F 2,3:- 3,3:- 4,3:- 5,3:J 5,2:| 5,1:|",
  "1,0:- 2,0:- 3,0:7 3,1:| 3,2:L 4,2:- 5,2:7 5,3:| 5,4:L",
  "3,1:7",
  "1,3:F 5,3:J",
  "0,1:| 0,2:L 1,2:- 2,2:7 2,3:| 2,4:L 3,4:- 4,4:J 4,3:| 4,2:F 5,2:- 6,2:J 6,1:|",
];
test("rover: one reference road per level", () => assert(ROADS.length === RR.LEVELS.length, `${ROADS.length} for ${RR.LEVELS.length}`));
RR.LEVELS.forEach((level, i) => {
  const n = i + 1;
  test(`rover ${n}: map is ${RR.COLS}x${RR.ROWS} with one pad and one base`, () => {
    assert(level.map.length === RR.ROWS && level.map.every((r) => r.length === RR.COLS), "bad map size");
    assert(RR.find(level, "S").length === 1 && RR.find(level, "B").length === 1, "needs one S and one B");
  });
  test(`rover ${n}: reference road wins within budget`, () => {
    const road = RR.givenRoad(level);
    for (const t of ROADS[i].split(" ")) {
      const [xy, piece] = t.split(":");
      const [x, y] = xy.split(",").map(Number);
      assert(RR.buildable(level, x, y), `can't build on ${xy}`);
      road[RR.key(x, y)] = piece;
    }
    const r = RR.drive(level, road);
    assert(r.outcome === "win", `outcome ${r.outcome} at ${JSON.stringify(r.path.at(-1))}`);
    assert(!level.budget || RR.piecesUsed(level, road) <= level.budget, `used ${RR.piecesUsed(level, road)} of ${level.budget}`);
  });
  test(`rover ${n}: the level doesn't already win as given`, () => {
    assert(RR.drive(level, RR.givenRoad(level)).outcome !== "win", "already wins");
  });
});
test("rover: driving onto a rock is a crash", () => {
  const r = RR.drive(RR.LEVELS[5], { "1,3": "|" });
  assert(r.outcome === "crash", r.outcome);
});
test("rover: skipping a crystal is 'missed'", () => {
  assert(RR.drive(RR.LEVELS[4], { "1,2": "-", "2,2": "-", "3,2": "-", "4,2": "-", "5,2": "-" }).outcome === "missed", "expected missed");
});

// ── Star Stitch: every trace picture can be drawn in one stroke; every code card draws its picture exactly ──
function oneStroke(level) {
  // Depth-first search over orders, from every start star.
  const go = (s) => {
    if (s.drawn.length === level.edges.length) return true;
    for (let p = 0; p < level.pegs.length; p++) {
      const r = SS.step(level, s, p);
      if (r.ok && go(r.state)) return true;
    }
    return false;
  };
  return level.pegs.some((_, p) => { const r = SS.step(level, SS.emptyState(), p); return r.ok && go(r.state); });
}
SS.LEVELS.forEach((level, i) => {
  const n = i + 1;
  test(`stitch ${n} (${level.name.en}): stars on the board, lines join real stars, no duplicates`, () => {
    assert(level.pegs.length <= SS.BADGES.length, "more stars than badges");
    level.pegs.forEach(([x, y]) => assert(x >= 0 && x <= 5 && y >= 0 && y <= 4, `star off board ${x},${y}`));
    const keys = level.edges.map(([a, b]) => { assert(a !== b && level.pegs[a] && level.pegs[b], `bad line ${a}-${b}`); return SS.edgeKey(a, b); });
    assert(new Set(keys).size === keys.length, "duplicate line");
  });
  if (level.mode === "trace") test(`stitch ${n}: can be drawn in one stroke`, () => assert(oneStroke(level), "no one-stroke order exists"));
  else test(`stitch ${n}: following the code card draws the whole picture`, () => {
    let s = SS.emptyState(), done = false;
    for (const p of level.code) { const r = SS.step(level, s, p); assert(r.ok, `code step to ${p}: ${r.reason}`); s = r.state; done = r.done; }
    assert(done, `drew ${s.drawn.length} of ${level.edges.length}`);
  });
});
test("stitch 4: starting at the top gets you stuck (start matters)", () => {
  const L = SS.LEVELS[3];
  const go = (s) => { if (s.drawn.length === L.edges.length) return true; for (let p = 0; p < L.pegs.length; p++) { const r = SS.step(L, s, p); if (r.ok && go(r.state)) return true; } return false; };
  assert(!go(SS.step(L, SS.emptyState(), 4).state), "the roof star should not work as a start");
  assert(go(SS.step(L, SS.emptyState(), 0).state), "a bottom corner should work");
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
