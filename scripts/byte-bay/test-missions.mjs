// Byte Bay mission tests: every mission's reference solution must pass every
// test world in JavaScript and in Python (through the real Pyodide), and the
// starter code must not pass on its own.
//   npm run test:bay
import "../blocks/ts-resolve.mjs";
import { loadPyodide } from "pyodide";
const { runJs, createPythonRunner } = await import("../../src/lib/games/bay/runner.ts");
const { MISSIONS, testWorlds, makeLitter } = await import("../../src/lib/games/bay/missions.ts");

const runPy = createPythonRunner(await loadPyodide());
let failed = 0, passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`ok    ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };

const SOLUTIONS = {
  home: {
    py: `
set_color("wood")
for layer in range(3):
    for side in range(2):
        for i in range(5):
            place()
            move(1)
        turn_right()
        for i in range(4):
            place()
            move(1)
        turn_right()
    up()
print("done")
`,
    js: `
for (let layer = 0; layer < 3; layer++) {
  for (let side = 0; side < 2; side++) {
    for (let i = 0; i < 5; i++) { place(); move(1); }
    turn_right();
    for (let i = 0; i < 4; i++) { place(); move(1); }
    turn_right();
  }
  up();
}
`,
  },
  market: {
    py: `
shelf_map = {
    "rice": [1, 1], "beans": [1, 2], "pasta": [1, 3], "flour": [1, 4],
    "milk": [2, 1], "cheese": [2, 2], "yogurt": [2, 3], "eggs": [2, 4],
    "apples": [3, 1], "bananas": [3, 2], "mangoes": [3, 3], "oranges": [3, 4],
    "bread": [4, 1], "cookies": [4, 2], "crackers": [4, 3], "cereal": [4, 4],
}
while has_customer():
    product = next_order()
    aisle, level = shelf_map[product]
    go_to_aisle(aisle)
    raise_to(level)
    pick()
    deliver()
`,
    js: `
const aisles = [["rice","beans","pasta","flour"],["milk","cheese","yogurt","eggs"],["apples","bananas","mangoes","oranges"],["bread","cookies","crackers","cereal"]];
while (has_customer()) {
  const p = next_order();
  for (let a = 0; a < 4; a++) {
    const l = aisles[a].indexOf(p);
    if (l >= 0) { go_to_aisle(a + 1); raise_to(l + 1); pick(); deliver(); }
  }
}
`,
  },
  beach: {
    py: `
bins = {"bottle": "recycling", "can": "recycling", "newspaper": "recycling",
        "apple core": "compost", "banana peel": "compost",
        "chip bag": "garbage", "straw": "garbage"}
while has_litter():
    item = scan()
    pick_up()
    drop_in(bins[item])
`,
    js: `
while (has_litter()) {
  const item = scan();
  pick_up();
  if (item === "bottle" || item === "can" || item === "newspaper") drop_in("recycling");
  else if (item === "apple core" || item === "banana peel") drop_in("compost");
  else drop_in("garbage");
}
`,
  },
};

const LIVE = {
  home: { blocks: [] },
  market: { orders: ["cereal", "flour", "mangoes"] },
  beach: { litter: makeLitter(18, 2026) },
};

for (const id of Object.keys(MISSIONS)) {
  const worlds = [LIVE[id], ...testWorlds(id)];
  for (const [lang, run] of [["js", runJs], ["py", runPy]]) {
    test(`${id} ${lang}: solution passes every world`, () => {
      worlds.forEach((w, i) => {
        const r = run(id, SOLUTIONS[id][lang], w);
        assert(!r.error && !r.stopped, `world ${i}: ${r.error || r.stopped}`);
        assert(r.check.passed, `world ${i}: ${r.check.message}`);
      });
    });
    test(`${id} ${lang}: starter code runs but does not pass yet`, () => {
      const results = worlds.map((w) => run(id, MISSIONS[id].starter[lang], w));
      assert(results.some((r) => !r.check.passed || r.error), "starter code already passes");
      assert(results[0].steps.length > 0, "starter code makes no moves");
    });
  }
}

test("python errors point at the student's line", () => {
  const r = runPy("home", "place()\nmove(99)\n", { blocks: [] });
  assert(/line 2/.test(r.error ?? "") && /BotError/.test(r.error ?? ""), r.error);
});
test("js typo gets a friendly suggestion", () => {
  const r = runJs("home", "Place();", { blocks: [] });
  assert(/Did you mean place/.test(r.error ?? ""), r.error);
});
test("infinite loops are stopped", () => {
  const r = runPy("home", "while True:\n    turn_right()\n", { blocks: [] });
  assert(r.stopped && !r.error, JSON.stringify(r.error));
  const j = runJs("beach", "while (true) { scan(); has_litter(); turn = 1; print('x') }", { litter: [] });
  assert(j.stopped, "js loop not stopped");
});
test("market: wrong product is reported", () => {
  const r = runJs("market", "next_order(); go_to_aisle(1); raise_to(1); pick(); deliver();", { orders: ["cereal"] });
  assert(!r.check.passed && /asked for cereal but got rice/.test(r.check.message), r.check.message);
});
test("market: missing map entry gives a useful python error", () => {
  const r = runPy("market", MISSIONS.market.starter.py, { orders: ["eggs"] });
  assert(/KeyError: 'eggs'/.test(r.error ?? ""), r.error);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
