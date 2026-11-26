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
const LABS = { Explorers: 4, Builders: 4, Developers: 6, Engineers: 6 };
for (const [program, projects] of Object.entries(PROJECTS)) {
  test(`${program}: ${LABS[program]} Robot Lab missions in each of S1 to S4 and the capstone`, () => {
    const list = MISSIONS.filter((m) => m.program === program);
    assert(list.length === LABS[program] * 5, `${list.length} missions`);
    SEMESTERS.forEach((sem, i) => {
      const found = list.filter((m) => m.semester === sem);
      assert(found.length === LABS[program], `${sem}: ${found.length} missions`);
      assert(found.map((m) => m.lab).join(",") === Array.from({ length: LABS[program] }, (_, k) => k + 1).join(","), `${sem}: labs ${found.map((m) => m.lab)}`);
      for (const m of found) assert(m.fits.endsWith(projects[i]), `${m.id} fits "${m.fits}", curriculum project is "${projects[i]}"`);
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

test("blocks: Explorers egg-hunt stack passes", () => {
  const code = blocksToJs(ws(blk("robot_forward", { N: 20 }), blk("robot_beep"), blk("robot_forward", { N: 20 }), blk("robot_beep"), blk("robot_forward", { N: 20 }), blk("robot_beep"), blk("robot_forward", { N: 35 })));
  const m = missionById("egg-hunt");
  const { trace, error } = runJs(code, m.world);
  assert(!error, error);
  assert(m.check(trace, m.world).ok, code);
});
test("blocks: repeat until + sense passes the Recycling run", () => {
  const code = blocksToJs(ws(
    blk("robot_until", null, { COND: { block: blk("robot_sense", { S: "obstacle()" }) }, DO: { block: blk("robot_forward", { N: 2 }) } }),
    blk("robot_drop"),
    blk("robot_led", { C: "green" }),
  ));
  const m = missionById("coral-reef");
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
  ["treasure-vault", `unlock(); forward(90);`, /opened for a weak passcode/],
  ["treasure-vault", `let c = nextCode(); while (c !== "") { if (c.length >= 4) { unlock(); forward(90); break; } beep(); c = nextCode(); }`, /opened for a weak passcode/],
  ["space-station", `const a = { forward: (n) => forward(n), left: (n) => turnLeft(n) }; let m = nextMessage(); while (m !== "") { const [w, n] = m.split(" "); if (w === "photo") photo(); else if (a[w]) a[w](Number(n)); else display("Sorry"); m = nextMessage(); }`, /kept going after "stop"/],
  ["space-station", `let m = nextMessage(); while (m !== "") { const [w, n] = m.split(" "); if (w === "stop") break; if (w === "forward") forward(Number(n)); if (w === "left") turnLeft(Number(n)); if (w === "photo") photo(); m = nextMessage(); }`, /polite refusal/],
  ["rocket-countdown", `for (const n of [5, 4, 3, 2, 1]) display(n); launch(); backward(35);`, /Wait 1 second/],
  ["rocket-countdown", `let t = 5; while (t > 0) { display(t); wait(1); t--; } backward(35);`, /launch\(\)/],
  ["beach-toss", `toss(88);`, /Print the distance/],
  ["beach-toss", `const d = 4 * 20; console.log(d); toss(d);`, /Print the distance|short/],
  ["beach-toss", `console.log(88); toss(70);`, /18 cm short/],
  ["puppy-walk", `for (let i = 0; i < 4; i++) { forward(70); turnLeft(90); }`, /1 of 2 laps/],
  ["puppy-walk", `forward(40); turnLeft(90); forward(60);`, /Splash/],
  ["dance-party", `display("Hi"); led("red"); beep(); turnLeft(360);`, /2 different light colours/],
  ["paint-a-square", `for (let i = 0; i < 4; i++) { forward(30); turnLeft(90); } beep();`, /pen down first/],
  ["paint-a-square", `penDown("red"); for (let i = 0; i < 4; i++) { forward(30); turnLeft(90); }`, /Beep to show it/],
  ["wave-concert", `forward(55); play("C"); play("E"); play("G");`, /before the wave/],
  ["egg-hunt", `forward(95); beep();`, /counted 0 of 3 eggs/],
  ["fire-rescue", `beep(); forward(85); turnLeft(90); forward(40);`, /spray/],
  ["fire-rescue", `beep(); forward(85); turnLeft(90); forward(80);`, /bumped the building/],
  ["museum-night", `while (!obstacle()) forward(2);`, /turn left/],
  ["museum-night", `let t = 0; while (true) { if (obstacle()) { if (t === 1) break; turnLeft(90); t++; } else forward(2); } photo();`, /Light on in the dark/],
  ["museum-night", `let t = 0; while (true) { if (light() < 30) led("white"); else led("off"); if (obstacle()) { if (t === 1) break; turnLeft(90); t++; } else forward(2); }`, /photo\(\)/],
  ["crystal-mine", `forward(40); turnLeft(90); forward(50); turnRight(90); forward(83);`, /print the total cost/],
  ["solar-farm", `forward(120); turnRight(90); forward(55); turnRight(90); forward(105); record("power", power());`, /before and after|once before/],
  ["mars-flag", `while (distance() > 14) { forward(2); }`, /drop\(\) the flag|Aim for 5 to 20/],
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
    "egg-hunt": [f(20), blk("robot_beep"), f(20), blk("robot_beep"), f(20), blk("robot_beep"), f(35)],
    "wave-concert": [blk("robot_wait_wave"), f(55), blk("robot_play", { N: "C" }), blk("robot_play", { N: "E" }), blk("robot_play", { N: "G" })],
    "coral-reef": [blk("robot_until", null, { COND: { block: blk("robot_sense", { S: "obstacle()" }) }, DO: { block: f(2) } }), blk("robot_drop"), blk("robot_led", { C: "green" })],
    "snowy-igloo": [f(50), L(90), f(55), R(90), f(45)],
    "paint-a-square": [blk("robot_pen_down", { C: "red" }), blk("robot_repeat", { N: 4 }, { DO: { block: chain([f(30), L(90)]) } }), blk("robot_pen_up"), blk("robot_beep")],
    "dance-party": [blk("robot_display", { T: "Hi I'm Bolt" }), blk("robot_led", { C: "blue" }), blk("robot_beep"), blk("robot_led", { C: "purple" }), L(360)],
    "night-train": [blk("robot_repeat", { N: 72 }, { DO: { block: chain([f(2), blk("robot_if_else", null, { COND: { block: blk("robot_sense", { S: "light() < 30" }) }, DO: { block: blk("robot_led", { C: "yellow" }) }, ELSE: { block: blk("robot_led", { C: "off" }) } })]) } })],
    "puppy-walk": [blk("robot_repeat", { N: 8 }, { DO: { block: chain([f(70), L(90)]) } })],
    "bloom-garden": [f(30), blk("robot_wait", { N: 1 }), L(90), f(35), blk("robot_wait", { N: 1 }), R(90), f(50), blk("robot_wait", { N: 1 }), R(90), f(35), L(90), f(50), blk("robot_wait", { N: 1 })],
    "fire-rescue": [blk("robot_beep"), f(85), L(90), f(40), blk("robot_spray")],
  };
  for (const [id, list] of Object.entries(STACKS)) {
    const m = missionById(id);
    const { trace, error } = runJs(blocksToJs(ws(...list)), m.world);
    assert(!error, `${id}: ${error}`);
    const r = m.check(trace, m.world);
    assert(r.ok, `${id}: ${r.message}`);
  }
  // The other Explorers and Builders missions: their reference solution only uses what blocks can make.
  const BLOCK_CALLS = new Set(["forward", "backward", "turnLeft", "turnRight", "setSpeed", "pickUp", "drop", "beep", "play", "led", "display", "penDown", "penUp", "spray", "record", "wait", "waitForWave", "obstacle", "lineLeft", "lineRight", "onLine", "light", "waved", "distance", "colour", "itemColour", "temperature", "power"]);
  for (const m of MISSIONS.filter((x) => (x.program === "Explorers" || x.program === "Builders") && !STACKS[x.id])) {
    const calls = [...JS[m.id].matchAll(/([A-Za-z_]\w*)\s*\(/g)].map((x) => x[1]).filter((n) => n !== "for" && n !== "while" && n !== "if");
    const bad = calls.filter((n) => !BLOCK_CALLS.has(n));
    assert(!bad.length, `${m.id}: not possible in blocks: ${bad.join(", ")}`);
    assert(!/function|=>|const |\[/.test(JS[m.id]), `${m.id}: solution uses code that blocks can't make`);
  }
});

// Pick-up reach (CEO report 2026-11-18): a toy 4 squares away, on a plain mat.
const toyWorld = () => ({ ...missionById("sandbox").world, lines: [], walls: [], zones: [], start: { x: 15, y: 30, heading: 0 }, robot: "scout", items: [{ id: "toy", x: 55, y: 30, colour: "yellow" }] });
test("pick-up: counting 4 squares onto the toy still picks it up", () => {
  for (const first of [25, 30, 32, 35, 40, 42]) {
    const { trace } = runJs(`forward(${first}); pickUp();`, toyWorld());
    assert(trace.stats.pickUps === 1, `forward(${first}) then pickUp() missed`);
  }
});
test("pick-up: a miss is counted", () => {
  const { trace } = runJs("forward(10); pickUp();", toyWorld());
  assert(trace.stats.missedPickUps === 1, "miss not counted");
});
test("pick-up never grabs an object behind the robot", () => {
  const { trace } = runJs("forward(60); pickUp();", toyWorld());
  assert(trace.stats.pickUps === 0, "grabbed the toy from behind");
});
test("new actions: pen, notes, toss, spray, launch, unlock, photo, temperature, power", () => {
  const w = toyWorld();
  const { trace, error } = runJs('penDown("blue"); forward(10); penUp(); play("G"); toss(50); spray(); launch(); unlock(); photo(); console.log(temperature(), power());', w);
  assert(!error, error);
  const st = trace.stats;
  assert(Math.round(st.inked) === 10 && st.notes.length === 1 && st.tosses.length === 1 && st.launches.length === 1 && st.unlocks.length === 1 && st.photos.length === 1, JSON.stringify(st));
  assert(trace.log[0].text === "20 0", trace.log[0].text);
  assert(/notes C, D/.test(runJs('play("H");', w).error), "bad note not explained");
  assert(/pen can be/.test(runJs('penDown("pink");', w).error), "bad pen colour not explained");
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
  const { trace } = runJs("forward(500);", missionById("coral-reef").world);
  assert(trace.stats.bumps === 1, `bumps ${trace.stats.bumps}`);
});
test("runs are deterministic (noisy sensor too)", () => {
  const w = missionById("mars-flag").world;
  const a = JSON.stringify(runJs(JS["mars-flag"], w).trace);
  const b = JSON.stringify(runJs(JS["mars-flag"], w).trace);
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


// Curriculum v1.2 (CEO, 2026-11-26): the clap is replaced by a hand wave (Edison obstacle sensor).
const { BLOCK_DEFS, withIcons, migrateWorkspace, migrateCode } = await import("../../src/components/tools/robots/robotBlocks.ts");
const { REFERENCE } = await import("../../src/components/tools/robots/reference.ts");
const { PYTHON_NAMES } = await import("../../src/components/tools/robots/sim.ts");
const waveWorld = (waves) => ({ ...missionById("sandbox").world, waves });
test("wave: waitForWave() waits for the wave, then the program carries on", () => {
  const { trace, error } = runJs("waitForWave(); beep();", waveWorld([2]));
  assert(!error, error);
  const beep = trace.sounds.find((x) => x.kind === "beep");
  assert(beep && beep.t >= 1.999, `beeped at ${beep?.t}`);
  assert(trace.sounds.some((x) => x.kind === "wave" && x.t === 2), "wave event not on the timeline");
});
test("wave: waitForWave() with nobody waving gives false and does not hang", () => {
  const { trace, error } = runJs("console.log(waitForWave());", waveWorld([]));
  assert(!error && trace.log[0].text === "false", error ?? trace.log[0]?.text);
});
test("wave: waved() counts waves, so if / elif / else can act on the count (wave-count code)", () => {
  const code = `wait(3); let n = 0; while (waved()) n++; if (n === 3) { unlock(); } else if (n === 2) { beep(); } else { display("Locked"); }`;
  const open = runJs(code, waveWorld([0.5, 1, 1.5])).trace;
  assert(open.stats.unlocks.length === 1, "3 waves should unlock");
  const two = runJs(code, waveWorld([0.5, 1])).trace;
  assert(!two.stats.unlocks.length && two.stats.beeps === 1, "2 waves should beep");
  const one = runJs(code, waveWorld([1])).trace;
  assert(!one.stats.unlocks.length && one.frames.some((f) => f.display === "Locked"), "1 wave should stay locked");
});
test("wave: JS and Python names match (waitForWave / wait_for_wave, waved / waved)", () => {
  assert(PYTHON_NAMES.wait_for_wave === "waitForWave" && PYTHON_NAMES.waved === "waved", JSON.stringify(PYTHON_NAMES));
  assert(!Object.keys(PYTHON_NAMES).some((k) => /clap/i.test(k)), "a clap name is still in the Python API");
});
test("wave: no clap left in student-facing text (missions, reference, blocks)", () => {
  const text = JSON.stringify([MISSIONS.map((m) => [m.id, m.title, m.goal, m.hint, m.story, m.starter]), REFERENCE, BLOCK_DEFS]);
  assert(!/clap/i.test(text), `found: ${text.match(/.{30}clap.{30}/i)?.[0]}`);
  assert(missionById("wave-concert").title === "Wave-start concert", "Explorers S2 challenge not renamed");
});
test("wave: an old clap program still opens and runs (blocks and code are migrated)", () => {
  const old = ws(blk("robot_wait_clap"), blk("robot_if", null, { COND: { block: blk("robot_sense", { S: "clapped()" }) }, DO: { block: blk("robot_beep") } }));
  const js = blocksToJs(old);
  assert(/waitForWave\(\);/.test(js) && /if \(waved\(\)\)/.test(js), js);
  assert(!/clap/.test(JSON.stringify(migrateWorkspace(old))), "workspace not migrated");
  assert(migrateCode("waitForClap();\nwait_for_clap()\nif clapped(): beep()") === "waitForWave();\nwait_for_wave()\nif waved(): beep()", "code not migrated");
  const hint = runJs("waitForClap();", waveWorld([1])).error;
  assert(/Did you mean waitForWave\(\)\?/.test(hint) && !/clap/i.test(hint.replace("waitForClap", "")), hint);
});

// Pictures-only labels, like CODEship Blocks.
test("pictures only: every block with a picture loses its words but keeps every field", () => {
  const words = withIcons(BLOCK_DEFS, "words"), icons = withIcons(BLOCK_DEFS, "icons");
  for (let i = 0; i < words.length; i++) {
    const w = words[i], p = icons[i];
    const argCount = (d) => (String(d.message0).match(/%\d+/g) ?? []).length;
    assert(argCount(w) === argCount(p) && argCount(p) === (p.args0 ?? []).length, `${p.type}: fields changed`);
    const fieldNames = (d) => (d.args0 ?? []).map((a) => a.name ?? a.type).join(",");
    assert(fieldNames(w) === fieldNames(p), `${p.type}: field names differ`);
    const firstIsPicture = p.args0?.[0]?.type === "field_image";
    if (firstIsPicture) assert(!/[A-Za-z]/.test(String(p.message0)), `${p.type}: words left: ${p.message0}`);
    assert(p.tooltip, `${p.type}: no tooltip for the adult`);
    // Dropdown values never change, so saved work opens in either mode.
    for (let k = 0; k < (w.args0 ?? []).length; k++) {
      if (w.args0[k].type !== "field_dropdown") continue;
      assert(JSON.stringify(w.args0[k].options.map((o) => o[1])) === JSON.stringify(p.args0[k].options.map((o) => o[1])), `${p.type}: dropdown values changed`);
    }
  }
  const sense = icons.find((d) => d.type === "robot_sense").args0[1];
  assert(sense.options.every((o) => typeof o[0] === "object" && o[0].src.startsWith("data:image/svg+xml")), "sense options are not pictures");
  const led = icons.find((d) => d.type === "robot_led").args0[1];
  assert(led.options.every((o) => typeof o[0] === "object"), "light colours are not swatches");
  assert(icons.find((d) => d.type === "robot_if_else").message2 === "else", "else arm label lost");
});

const RB = await import("../../src/components/tools/robots/robotBlocks.ts");
test("pictures: wave, pick up, object colour and repeat-until each have a different picture", () => {
  const icons = RB.withIcons(RB.BLOCK_DEFS, "icons");
  const pic = (type) => icons.find((d) => d.type === type).args0[0].src;
  const pics = ["robot_wait_wave", "robot_pick_up", "robot_until", "robot_repeat"].map(pic);
  assert(new Set(pics).size === pics.length, "two blocks share a picture");
  const sense = icons.find((d) => d.type === "robot_colour_is").args0[0].options.map((o) => o[0].src);
  assert(!pics.includes(sense[1]) && sense[0] !== sense[1], "object colour reuses a picture");
  const tb = RB.toolboxFor("icons");
  assert(tb.contents.every((c) => /rl-cat-icon/.test(c.cssconfig?.icon ?? "")), "category tabs are not pictures");
  assert(!RB.toolboxFor("words").contents.some((c) => c.cssconfig), "words mode changed");
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
