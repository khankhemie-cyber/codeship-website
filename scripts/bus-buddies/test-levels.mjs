// Bus Buddies Road Trip: every level (free and class) can be solved with its
// own answer, within its slots, using only its own blocks; wrong programs
// fail gently with the right line and glowing block; hints lead to the
// answer; Repeat levels really need a Repeat; every line ID exists.
// No browser.   npm run test:bus
import "../blocks/ts-resolve.mjs";
import fs from "node:fs";
const { FREE_LEVELS, CHAPTERS, BUS_LEVEL_IDS, BUS_FREE_LEVELS } = await import("../../src/lib/games/bus/levels.ts");
const { BUS_PAID_LEVELS } = await import("../../src/lib/games/paid/bus.ts");
const E = await import("../../src/lib/games/bus/engine.ts");
const { run, autopilot, nextCorrect, nextCone, findChar, headings, flatten, pieces, coneSpot } = E;
const script = JSON.parse(fs.readFileSync(new URL("../../src/lib/games/bus/voice-script.json", import.meta.url)));
const lineIds = new Set(script.lines.map((l) => l.id));
const LEVELS = [...FREE_LEVELS, ...BUS_PAID_LEVELS];
const byId = (id) => LEVELS.find((l) => l.id === id);

let failed = 0, passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`ok    ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const eq = (a, b, m) => assert(JSON.stringify(a) === JSON.stringify(b), `${m}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
const cones = (l) => (l.coneSolution ?? []).map(([x, y]) => ({ x, y }));
const solve = (l) => (l.mode === "cones" ? autopilot(l, cones(l)) : run(l, l.solution));

test("20 levels, in chapter order, first 10 free and the rest class levels", () => {
  eq(LEVELS.length, 20, "levels");
  eq(LEVELS.map((l) => l.id), BUS_LEVEL_IDS, "order matches the chapters");
  eq(FREE_LEVELS.length, BUS_FREE_LEVELS, "free levels");
  eq(CHAPTERS.length, 6, "chapters");
  for (const c of CHAPTERS) {
    assert(c.levelIds.length >= 3 && c.levelIds.length <= 4, `chapter ${c.n} has ${c.levelIds.length} levels`);
    eq(c.stickers, c.levelIds.map((id) => byId(id).sticker.art), `chapter ${c.n} sticker list matches its levels`);
  }
});

test("line IDs in the voice script are unique and spoken by known characters", () => {
  assert(lineIds.size === script.lines.length, "duplicate line id");
  for (const l of script.lines) assert(script.characters[l.character], `${l.id}: unknown character ${l.character}`);
});

test("every line the engine can say exists", () => {
  const src = fs.readFileSync(new URL("../../src/lib/games/bus/engine.ts", import.meta.url), "utf8");
  for (const [, id] of src.matchAll(/"((?:common|ch\d)\.[a-z0-9_.]+)"/g)) assert(lineIds.has(id), `engine says ${id}, not in the script`);
});

test("every chapter's story lines exist", () => {
  for (const c of CHAPTERS) {
    assert(c.intro.length && c.outro.length, `chapter ${c.n} has no story`);
    for (const id of [...c.intro, ...c.outro]) assert(lineIds.has(id), `missing ${id}`);
  }
});

for (const level of LEVELS) {
  test(`${level.id} ${level.title}: the answer works`, () => {
    const r = solve(level);
    assert(r.outcome.ok, `answer fails: ${JSON.stringify(r.outcome)}`);
    if (level.mode === "cones") {
      assert((level.coneSolution ?? []).length <= level.cones, "more cones than allowed");
      for (const [x, y] of level.coneSolution) assert(coneSpot(level, x, y), `cone at ${x},${y} is not on plain road`);
    } else {
      assert(pieces(level.solution) <= level.maxBlocks, `answer uses ${pieces(level.solution)} slots, max ${level.maxBlocks}`);
      for (const item of level.solution) {
        if (typeof item === "string") assert(level.blocks.includes(item), `answer uses ${item}, not on the shelf`);
        else {
          assert(level.blocks.includes("repeat"), "answer uses Repeat, not on the shelf");
          assert(item.body.length <= (level.repeatBody ?? 3), "Repeat body too long");
          for (const b of item.body) assert(level.blocks.includes(b), `answer uses ${b}, not on the shelf`);
        }
      }
    }
  });
  test(`${level.id}: map is 5x5 to 7x7, has a start, stops and lines exist`, () => {
    const w = level.map[0].length;
    assert(level.map.every((r) => r.length === w), "rows differ in length");
    assert(level.map.length >= 5 && level.map.length <= 7 && w >= 5 && w <= 7, "map must be 5x5 to 7x7");
    assert(findChar(level, "S"), "no S");
    for (const p of level.passengers) assert(findChar(level, p.stop), `no stop ${p.stop}`);
    for (const l of level.lights ?? []) assert(findChar(level, l.ch), `no light ${l.ch}`);
    assert(level.passengers.length || findChar(level, "G"), "nothing to do: no friends and no destination");
    const ids = [level.prompt, level.successLine, ...level.passengers.flatMap((p) => [p.boardLine, p.waitingLine].filter(Boolean))];
    for (const id of ids) assert(lineIds.has(id), `missing line ${id}`);
  });
  if (level.mode === "cones") {
    test(`${level.id}: with no cones, Bina doesn't know which way`, () => {
      const r = autopilot(level, []);
      assert(!r.outcome.ok, "solved with no cones");
    });
    test(`${level.id}: hints place the answer's cones one by one`, () => {
      let placed = [];
      for (let i = 0; i < 5; i++) {
        const c = nextCone(level, placed);
        if (!c) break;
        placed = [...placed, c];
      }
      assert(autopilot(level, placed).outcome.ok, "hint cones don't solve it");
    });
  } else {
    test(`${level.id}: an empty program is "not there yet", never a crash`, () => {
      const r = run(level, []);
      assert(!r.outcome.ok && r.outcome.blame === null, JSON.stringify(r.outcome));
    });
    test(`${level.id}: hints walk to the answer`, () => {
      let program = [];
      for (let i = 0; i < 20; i++) {
        const next = nextCorrect(level, program);
        if (!next) break;
        program = [...program.slice(0, next.index), next.item];
      }
      eq(program, level.solution, "hint path");
    });
    if (level.blocks.includes("repeat")) {
      test(`${level.id}: the long way doesn't fit, so a Repeat is needed`, () => {
        const unrolled = flatten(level.solution).map((s) => s.block);
        assert(unrolled.length > level.maxBlocks, `${unrolled.length} blocks fit in ${level.maxBlocks} slots`);
        assert(run(level, unrolled).outcome.ok, "the unrolled program should also drive the route");
      });
    }
  }
}

test("1-1 is solvable in 2 blocks", () => eq(byId("1-1").solution.length, 2, "length"));
test("1-1: three forwards drives onto the grass, third block glows", () => {
  eq(run(byId("1-1"), ["forward", "forward", "forward"]).outcome, { ok: false, blame: "2", line: "common.oops_grass" }, "outcome");
});
test("1-2: going straight on hits the flowers", () => {
  eq(run(byId("1-2"), ["forward", "forward"]).outcome, { ok: false, blame: "1", line: "common.oops_flowers" }, "outcome");
});
test("1-3: parking by Olive without a honk: she's still asleep", () => {
  eq(run(byId("1-3"), ["forward", "right", "forward", "forward"]).outcome, { ok: false, blame: null, line: "ch1.owl.sleep" }, "outcome");
});
test("2-1: no bridge is a splash", () => {
  eq(run(byId("2-1"), ["forward", "forward"]).outcome, { ok: false, blame: "1", line: "common.oops_water" }, "outcome");
});
test("2-2: the lake is too wide for a bridge", () => {
  eq(run(byId("2-2"), ["forward", "forward", "bridge"]).outcome, { ok: false, blame: "2", line: "common.bridge_too_long" }, "outcome");
});
test("2-2: the ferry only comes to the dock", () => {
  eq(run(byId("2-2"), ["forward", "ferry"]).outcome, { ok: false, blame: "1", line: "common.ferry_dock" }, "outcome");
});
test("2-2: the ferry carries Bina across the lake to the other dock", () => {
  const f = run(byId("2-2"), ["forward", "forward", "ferry"]).frames[2];
  eq([f.ferry.from, f.x, f.y], [{ x: 2, y: 2 }, 5, 2], "ferry trip");
});
test("2-4: driving to the basket without Pick Up gets the Pick Up hint", () => {
  eq(run(byId("2-4"), ["bridge", "forward", "forward", "left", "forward", "forward"]).outcome, { ok: false, blame: null, line: "common.pickup_hint" }, "outcome");
});
test("3-1: a cone on the wrong road works; on the right road it's a dead end", () => {
  assert(autopilot(byId("3-1"), [{ x: 3, y: 2 }]).outcome.ok, "right cone");
  eq(autopilot(byId("3-1"), [{ x: 2, y: 1 }]).outcome, { ok: false, blame: null, line: "common.dead_end" }, "wrong cone");
});
test("3-3: driving into the road work", () => {
  eq(run(byId("3-3"), ["forward", "forward"]).outcome, { ok: false, blame: "1", line: "common.oops_roadwork" }, "outcome");
});
test("4-1: no Wait runs the red light; the light is green after 2 blocks", () => {
  eq(run(byId("4-1"), ["forward", "forward"]).outcome, { ok: false, blame: "1", line: "common.oops_red" }, "red");
  assert(run(byId("4-1"), ["forward", "wait", "forward", "forward", "forward"]).outcome.ok, "green");
});
test("4-3: the duckling crossing has its own line", () => {
  eq(run(byId("4-3"), ["forward", "forward"]).outcome.line, "common.oops_ducks", "line");
});
test("5-2: a Repeat's blocks glow by their place inside it", () => {
  const r = run(byId("5-2"), [{ repeat: 3, body: ["forward", "right", "forward", "forward"] }]);
  eq(r.outcome, { ok: false, blame: "0.3", line: "common.oops_rocks" }, "outcome");
});
test("Repeat x2 / x3 unrolls in order", () => {
  eq(flatten(["left", { repeat: 2, body: ["forward", "honk"] }]).map((s) => `${s.block}@${s.path}`), ["left@0", "forward@1.0", "honk@1.1", "forward@1.0", "honk@1.1"], "steps");
  eq(pieces(["left", { repeat: 2, body: ["forward", "honk"] }]), 4, "slots");
});
test("block pictures point where Bina drives: 1-1 Forward points right", () => {
  eq(headings(byId("1-1"), []).end, 1, "empty program: arrow faces right");
  eq(headings(byId("1-2"), ["forward", "left", "forward"]), { byPath: { 0: 1, 1: 1, 2: 0 }, end: 0 }, "after a left turn the arrows point up");
  eq(headings(byId("1-3"), ["right", "right", "right", "right"]).end, 5, "no wrap-around spin");
});
test("turns keep a continuous angle (no long spins)", () => {
  eq(run(byId("1-2"), ["left", "left", "right"]).frames.map((f) => f.angle), [0, -90, 0], "angles");
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
