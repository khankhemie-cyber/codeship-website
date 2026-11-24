// Port CODEship mission tests: every mission's reference solution must pass every
// test world in JavaScript and in Python (through the real Pyodide), and the
// starter code must not pass on its own.
//   npm run test:port
import "../blocks/ts-resolve.mjs";
import { loadPyodide } from "pyodide";
const { runJs, createPythonRunner } = await import("../../src/lib/games/port/runner.ts");
const { MISSIONS, testWorlds, makeLitter, AISLES } = await import("../../src/lib/games/port/missions.ts");
const { STARTER_BLOCKS, blocksToJs, blocksToPy, build } = await import("../../src/lib/games/port/blocks.ts");

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

// Blocks: full solutions built from blocks must pass, as JavaScript and as the Python we show.
const { chain, blk, ws } = build;
const repeat = (n, ...body) => blk("port_repeat", { N: n }, { DO: chain(...body) });
const BLOCK_SOLUTIONS = {
  home: ws(chain(blk("port_start"), blk("port_color", { C: "stone" }), repeat(3, repeat(2, repeat(5, blk("port_place"), blk("port_move", { N: 1 })), blk("port_turn", { D: "right" }), repeat(4, blk("port_place"), blk("port_move", { N: 1 })), blk("port_turn", { D: "right" })), blk("port_layer", { D: "up" })))),
  market: ws(chain(
    blk("port_start"),
    blk("port_map", undefined, { DO: chain(...AISLES.flatMap((row, a) => row.map((p, l) => blk("port_map_entry", { P: p, A: a + 1, L: l + 1 })))) }),
    blk("port_while", undefined, { COND: blk("port_customer"), DO: chain(blk("port_next_order"), blk("port_go_order"), blk("port_pick"), blk("port_deliver")) }),
  )),
  beach: ws(chain(
    blk("port_start"),
    blk("port_while", undefined, { COND: blk("port_litter"), DO: chain(
      blk("port_scan"), blk("port_pick_up"),
      blk("port_if_else", undefined, { COND: blk("port_item_is", { K: "apple core" }), DO: blk("port_drop_in", { B: "compost" }), ELSE:
        blk("port_if_else", undefined, { COND: blk("port_item_is", { K: "banana peel" }), DO: blk("port_drop_in", { B: "compost" }), ELSE:
          blk("port_if_else", undefined, { COND: blk("port_item_is", { K: "chip bag" }), DO: blk("port_drop_in", { B: "garbage" }), ELSE:
            blk("port_if_else", undefined, { COND: blk("port_item_is", { K: "straw" }), DO: blk("port_drop_in", { B: "garbage" }), ELSE: blk("port_drop_in", { B: "recycling" }) }) }) }) }),
    ) }),
  )),
};
for (const id of Object.keys(MISSIONS)) {
  const worlds = [LIVE[id], ...testWorlds(id)];
  test(`${id} blocks: solution passes as JavaScript and as Python`, () => {
    for (const [lang, code, run] of [["js", blocksToJs(BLOCK_SOLUTIONS[id]), runJs], ["py", blocksToPy(BLOCK_SOLUTIONS[id]), runPy]]) {
      worlds.forEach((w, i) => {
        const r = run(id, code, w);
        assert(!r.error && !r.stopped, `${lang} world ${i}: ${r.error || r.stopped}\n${code}`);
        assert(r.check.passed, `${lang} world ${i}: ${r.check.message}`);
      });
    }
  });
  test(`${id} blocks: starter runs in both languages but does not pass yet`, () => {
    for (const [code, run] of [[blocksToJs(STARTER_BLOCKS[id]), runJs], [blocksToPy(STARTER_BLOCKS[id]), runPy]]) {
      const results = worlds.map((w) => run(id, code, w));
      assert(results[0].steps.length > 0, "starter makes no moves:\n" + code);
      assert(results.some((r) => !r.check.passed || r.error), "starter already passes");
    }
  });
}
test("blocks: a product missing from the shelf map gets a clear message", () => {
  const r = runJs("market", blocksToJs(STARTER_BLOCKS.market), { orders: ["eggs"] });
  assert(/eggs is not in your shelf map/.test(r.error ?? ""), r.error);
});

// Parent sign-up form checks (the gate after the first challenge or 15 minutes).
const { validateSignup } = await import("../../src/lib/arcadeSignupForm.ts");
test("sign-up: a complete form passes and is cleaned up", () => {
  const r = validateSignup({ parentName: "  Sam ", email: "Parent@Example.com", grade: "Grade 4", consent: true, game: "port-codeship" });
  assert(r.ok && r.value.email === "parent@example.com" && r.value.parentName === "Sam", JSON.stringify(r));
});
test("sign-up: missing consent, bad email or grade are refused", () => {
  const base = { parentName: "Sam", email: "a@b.co", grade: "Grade 4", consent: true };
  assert(!validateSignup({ ...base, consent: false }).ok, "consent");
  assert(!validateSignup({ ...base, email: "nope" }).ok, "email");
  assert(!validateSignup({ ...base, grade: "Grade 99" }).ok, "grade");
  assert(!validateSignup({ ...base, parentName: " " }).ok, "name");
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
