// Fast acceptance tests for /tools/blocks: runs the Explorers lesson projects
// through the real engine (src/components/tools/blocks/engine.ts) on a
// virtual clock. No browser.   npm run test:blocks
import "./ts-resolve.mjs";
const { Engine, PAGE_WAIT_LIMIT } = await import("../../src/components/tools/blocks/engine.ts");
const { parseProject } = await import("../../src/components/tools/blocks/model.ts");
const F = await import("./fixtures.mjs");

let failed = 0, passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`ok    ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); }
}
const eq = (a, b, what) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${what}: got ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`); };

/** An engine on a virtual clock that logs sounds, recordings and page changes. */
function harness(project) {
  const log = [];
  const p = parseProject(JSON.parse(JSON.stringify(project)));
  const engine = new Engine(p, {
    sound: (n) => log.push(`sound:${n}@${engine.now}`),
    playRecording: (id) => (log.push(`play:${id}@page${engine.page + 1}`), p.recordings[id]?.durationMs ?? 0),
  });
  let lastPage = engine.page;
  const run = (ms, every) => {
    for (let t = 0; t < ms; t += 10) {
      engine.tick(engine.now + 10);
      if (engine.page !== lastPage) { log.push(`page:${engine.page + 1}@${engine.now}`); lastPage = engine.page; }
      every?.(engine);
    }
  };
  const st = (id) => ({ ...engine.states.get(id) });
  return { engine, log, run, st };
}
const sounds = (log) => log.filter((l) => l.startsWith("sound:")).length;

// ── 1. My Helpful Robot ──
test("1. Helpful Robot: two right, bubble, two left, bubble, pop, one size bigger", () => {
  const h = harness(F.helpfulRobot());
  const xs = new Set(), bubbles = [];
  h.engine.tap("robot1");
  h.run(8000, (e) => { const s = e.states.get("robot1"); xs.add(s.x); if (s.bubble && bubbles.at(-1) !== s.bubble) bubbles.push(s.bubble); });
  eq([...xs].sort(), [2, 3, 4], "squares visited");
  eq(bubbles, ["Got it!", "All tidy!"], "bubbles in order");
  const s = h.st("robot1");
  eq([s.x, s.y, s.level], [2, 4, 1], "ends on its start square, one size bigger");
  eq(sounds(h.log), 1, "pop count");
  eq(h.engine.page, 0, "no page change");
  eq(h.log.filter((l) => l.startsWith("play:")).length, 0, "no audio");
});

test("1. nothing runs without tapping (no implicit start)", () => {
  const h = harness(F.helpfulRobot());
  h.engine.greenFlag();
  h.run(5000);
  eq(h.st("robot1").x, 2, "robot did not move on the green flag");
});

// ── 2. Kindness Cards ──
test("2. Kindness Cards: bubble, 2 s, bubble, 2 s, page 2 plays the recording and pulses", () => {
  const h = harness(F.kindnessCards());
  const timeline = [];
  h.engine.tap("card1");
  h.run(15000, (e) => { const b = e.states.get("card1")?.bubble; if (b && timeline.at(-1)?.b !== b) timeline.push({ b, t: e.now }); });
  eq(timeline.map((x) => x.b), ["Happy birthday Grandma!", "I made this for you"], "bubbles");
  const gap = timeline[1].t - timeline[0].t;
  if (gap < 3000 || gap > 4000) throw new Error(`second bubble came ${gap} ms after the first (Say holds 1.5 s, then Wait 2)`);
  const pageAt = Number(h.log.find((l) => l.startsWith("page:2")).split("@")[1]);
  if (pageAt - timeline[1].t < 3000) throw new Error("switched page before the second bubble's Wait 2 finished");
  if (!h.log.includes("play:voice1@page2")) throw new Error(`recording did not play on page 2: ${h.log}`);
  eq(h.st("card2").level, 0, "grew then shrank back");
  eq(sounds(h.log), 1, "pop");
});

test("2. the same card character appears on both pages", () => {
  const p = F.kindnessCards();
  eq(p.pages.map((pg) => pg.actors[0].characterId), ["card", "card"], "character ids");
});

// ── 3. Recycling Sorter ──
test("3. Sorter: can reappears, travels 5, bumps the bin, speaks, pops, waits, hides", () => {
  const h = harness(F.recyclingSorter());
  let said = null;
  h.engine.tap("can1");
  h.run(8000, (e) => { said = e.states.get("can1").bubble ?? said; });
  const can = h.st("can1");
  eq([can.x, can.visible], [6, false], "can at the bin, hidden");
  eq(said, "Yes! That one recycles", "speech");
  eq(sounds(h.log), 1, "pop");
});

test("3. Sorter: after the green flag puts things back, tapping repeats identically", () => {
  const h = harness(F.recyclingSorter());
  h.engine.tap("can1"); h.run(8000);
  h.engine.greenFlag(); h.run(100);
  eq([h.st("can1").x, h.st("can1").visible], [1, true], "green flag reset");
  h.engine.tap("can1"); h.run(8000);
  eq([h.st("can1").x, h.st("can1").visible, sounds(h.log)], [6, false, 2], "second run identical");
});

test("3. Repeat 2: stops short of the bin, nothing fires, no warning", () => {
  const h = harness(F.recyclingSorter({ travel: F.sorterTravel(2) }));
  h.engine.tap("can1"); h.run(8000);
  const can = h.st("can1");
  eq([can.x, can.visible, can.bubble, sounds(h.log)], [3, true, null, 0], "stopped short, silent");
});

test("3. empty Repeat: nothing happens at all", () => {
  const h = harness(F.recyclingSorter({ travel: F.sorterTravel(5, []) }));
  h.engine.tap("can1"); h.run(8000);
  const can = h.st("can1");
  eq([can.x, can.visible, can.bubble, sounds(h.log)], [1, true, null, 0], "nothing");
});

test("3. Show removed: the second play does nothing visible", () => {
  const h = harness(F.recyclingSorter({ travel: F.sorterTravel(5, ["move_right"], false) }));
  h.engine.tap("can1"); h.run(8000);
  eq([h.st("can1").visible, sounds(h.log)], [false, 1], "first play hides the can");
  h.engine.tap("can1"); h.run(8000); // tapping where the hidden can is
  eq([h.st("can1").visible, sounds(h.log)], [false, 1], "still hidden, nothing fired");
});

test("3. blocks on the bin move the bin, not the can", () => {
  const h = harness(F.recyclingSorter({ onBin: true }));
  h.engine.tap("can1"); h.run(3000);
  eq(h.st("can1").x, 1, "can did not move");
  h.engine.tap("bin1"); h.run(8000);
  if (h.st("bin1").x === 6) throw new Error("bin did not move");
  eq(h.st("can1").x, 1, "can still did not move");
});

test("3. Hide does not delete: the character is still there and codeable", () => {
  const h = harness(F.recyclingSorter());
  h.engine.tap("can1"); h.run(8000);
  eq(h.engine.actors().map((a) => a.id), ["can1", "bin1"], "both characters still on the page");
});

// ── 4. My Neighbourhood Map ──
test("4. Map: tapping the park grows and pops the library, page 2 plays the recording, Go Home resets", () => {
  const h = harness(F.neighbourhoodMap());
  let libMax = 0, lastLib = null, libBeforeTurn = null, prevPage = 0;
  h.engine.tap("park1");
  h.run(20000, (e) => {
    if (e.page === 0) { lastLib = e.states.get("library1").level; libMax = Math.max(libMax, lastLib); }
    if (prevPage === 0 && e.page === 1 && libBeforeTurn === null) libBeforeTurn = lastLib;
    prevPage = e.page;
  });
  eq(libMax, 1, "library grew");
  eq(libBeforeTurn, 0, "library shrank back before the page turned (the page waits for it)");
  if (sounds(h.log) !== 1) throw new Error("library should pop once");
  if (!h.log.includes("play:voice-park@page2")) throw new Error(`park recording did not play on page 2: ${h.log}`);
  eq(h.engine.page, 0, "back on page 1");
  eq([h.st("park1").bubble, h.st("library1").level], [null, 0], "everything reset");
});

test("4. listener changed to red: breaks silently", () => {
  const h = harness(F.neighbourhoodMap({ listen: "red" }));
  let libMax = 0;
  h.engine.tap("park1");
  h.run(20000, (e) => { if (e.page === 0) libMax = Math.max(libMax, e.states.get("library1")?.level ?? 0); });
  eq([libMax, sounds(h.log)], [0, 0], "library never reacted");
});

test("4. Go Home removed: stuck on page 2", () => {
  const h = harness(F.neighbourhoodMap({ goHome: false }));
  h.engine.tap("park1");
  h.run(30000);
  eq(h.engine.page, 1, "still on page 2");
  h.engine.greenFlag(); h.run(5000);
  eq(h.engine.page, 1, "the green flag does not take you back either");
});

test("4. every recording plays on its own page", () => {
  const h = harness(F.neighbourhoodMap({ goHome: false }));
  h.engine.tap("library1"); h.run(PAGE_WAIT_LIMIT + 5000);
  if (!h.log.includes("play:voice-library@page3")) throw new Error(`library page: ${h.log}`);
  h.engine.showPage(0); h.engine.tap("school1"); h.run(5000);
  if (!h.log.includes("play:voice-school@page4")) throw new Error(`school page: ${h.log}`);
});

test("4. Send Message with no listener does nothing", () => {
  const p = F.neighbourhoodMap();
  p.pages[0].actors[1].scripts.blocks.blocks = [];
  const h = harness(p);
  h.engine.tap("park1"); h.run(6000);
  eq(sounds(h.log), 0, "no reaction");
});

// ── Format ──
test("project files round-trip through parseProject unchanged", () => {
  for (const p of [F.helpfulRobot(), F.kindnessCards(), F.recyclingSorter(), F.neighbourhoodMap()]) {
    eq(parseProject(JSON.parse(JSON.stringify(p))), p, p.name);
  }
});

console.log(failed ? `\n${failed} failed, ${passed} passed` : `\nAll ${passed} passed`);
process.exit(failed ? 1 : 0);
