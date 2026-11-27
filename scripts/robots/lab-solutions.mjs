// Reference solutions for the Robot Lab classes that lead up to each full
// level (labs.ts). Explorers and Builders solutions use only what the Blocks
// editor can make. Not shipped to students.
const GO_TO = (x, y, h) => `
let x = ${x}, y = ${y}, h = ${h};
function face(target) { let d = ((target - h) % 360 + 540) % 360 - 180; if (d > 0) turnLeft(d); else turnRight(-d); h = target; }
function goTo(tx, ty) { const dx = tx - x, dy = ty - y; const dist = Math.hypot(dx, dy); if (dist < 0.01) return;
  face(Math.atan2(-dy, dx) * 180 / Math.PI); forward(dist); x = tx; y = ty; }`;
const SORT = (rows, crateY) => `${GO_TO(70, 50, 180)}
const crateY = ${JSON.stringify(crateY)};
for (const row of ${JSON.stringify(rows)}) {
  goTo(41, row); face(180);
  const c = itemColour(); pickUp();
  const cy = crateY[c] ?? 50;
  goTo(70, row); goTo(70, cy); goTo(127, cy); face(0); drop(); goTo(100, cy);
}`;
const VAULT = (rule, go = "forward(90);") => `function ok(c) { return ${rule}; }
let c = nextCode();
while (c !== "") { if (ok(c)) { unlock(); ${go} break; } else { beep(); } c = nextCode(); }`;
const CHAT = `const actions = { forward: (n) => forward(n), left: (n) => turnLeft(n), right: (n) => turnRight(n) };
let m = nextMessage();
while (m !== "") {
  const [word, num] = m.split(" ");
  if (word === "stop") break;
  if (actions[word] && !isNaN(Number(num))) actions[word](Number(num));
  else display("Sorry, I can't do that");
  m = nextMessage();
}`;
const SURVEY = (n, after) => `const r = []; for (let i = 0; i < ${n}; i++) { forward(10); const t = temperature(); r.push(t); record("temp", t); } ${after}`;
const WALL_LOOP = (turnsBeforeStop) => `let turns = 0;
while (true) {
  if (obstacle()) { if (turns === ${turnsBeforeStop}) break; turnLeft(90); turns++; }
  else { forward(2); }
}`;

export const LAB_JS = {
  // Explorers
  "farm-rooster": `forward(30); beep();`,
  "farm-backward": `forward(10); pickUp(); backward(55); drop();`,
  "farm-piglets": `beep(); beep(); beep(); beep(); beep();`,
  "music-hello": `play("C"); play("D"); play("E");`,
  "gym-steps": `forward(20); play("C"); forward(20); play("E"); forward(20); play("G");`,
  "party-surprise": `waitForWave(); led("red"); led("green"); beep();`,
  "lagoon-pearls": `for (let i = 0; i < 4; i++) { forward(10); }`,
  "kelp-bottle": `while (!(obstacle())) { forward(2); } pickUp();`,
  "deep-corner": `while (!(obstacle())) { forward(2); } turnLeft(90); while (!(obstacle())) { forward(2); }`,
  "snow-left": `turnLeft(90); forward(35);`,
  "ice-rink": `forward(40); turnRight(90); forward(40);`,
  "village-mitten": `turnLeft(180); forward(30); pickUp(); turnLeft(180); forward(30); drop();`,
  "chalk-line": `penDown("orange"); forward(50); penUp();`,
  "paper-stripes": `penDown("red"); forward(40); penUp(); turnLeft(90); forward(15); penDown("blue"); turnLeft(90); forward(40); penUp();`,
  "canvas-three-sides": `for (let i = 0; i < 4; i++) { penDown("purple"); forward(10); penUp(); forward(10); }`,
  "dressing-name": `display("Pixel");`,
  "rooftop-colours": `led("red"); wait(1); led("green"); wait(1); led("purple"); wait(1);`,
  "classroom-intro": `display("Pizza"); wait(1); play("G"); led("blue"); wait(1);`,
  "meadow-shade": `while (!(light() < 30)) { forward(2); } led("yellow");`,
  "firefly-forest": `for (let i = 0; i < 22; i++) { forward(5); if (light() < 30) { play("C"); } }`,
  "owl-watch": `for (let i = 0; i < 66; i++) { forward(2); if (light() < 30) { penDown("purple"); } else { penUp(); } }`,
  "dogpark-tree": `for (let i = 0; i < 3; i++) { forward(20); }`,
  "snowpark-lap": `for (let i = 0; i < 3; i++) { forward(50); turnLeft(120); }`,
  "hill-stairs": `for (let i = 0; i < 3; i++) { forward(20); turnLeft(90); forward(20); turnRight(90); }`,
  "greenhouse-bloom": `forward(40); wait(1);`,
  "window-sprinkler": `forward(30); turnLeft(90); spray(); turnRight(90); forward(50); turnLeft(90); spray();`,
  "sunflower-wait": `turnRight(45); wait(2); turnRight(45); wait(2); turnRight(45); wait(2);`,
  "firehall-siren": `for (let i = 0; i < 3; i++) { led("red"); beep(); led("blue"); beep(); } forward(55);`,
  "street-kitten": `forward(64); pickUp(); backward(72); drop();`,
  "crosswalk-wait": `while (!(onLine())) { forward(1); } wait(3); forward(60);`,
  // Developers
  "control-crew": `let crew = 4; display(crew);`,
  "hangar-trip": `const trip = 50; forward(trip); wait(1); backward(trip);`,
  "lab-beacon": `function blink() { led("red"); wait(0.5); led("off"); wait(0.5); } blink(); blink(); blink();`,
  "bridge-signal": `function flash(colour) { led(colour); wait(0.5); led("off"); wait(0.2); } flash("red"); flash("green"); flash("blue");`,
  "depot-fuel": `function fuelFor(cm) { return cm * 2; } display(fuelFor(40)); forward(40);`,
  "boardwalk-toss": `toss(50);`,
  "pier-add": `const dry = 90 - 25; console.log(dry); forward(dry);`,
  "snackbar-total": `const total = 3 * 4; display(total); console.log(total);`,
  "cove-halfway": `const tower = 120; forward(tower / 2);`,
  "picnic-share": `display(17 % 5); console.log(Math.floor(17 / 5));`,
  "dunes-read": `for (let i = 0; i < 3; i++) { console.log(distance()); }`,
  "craters-bool": `while (!obstacle()) { forward(2); }`,
  "volcano-30": `while (distance() < 30) { backward(2); }`,
  "ash-rock": `while (!obstacle()) { forward(2); } turnRight(90); forward(40); turnLeft(90); forward(90);`,
  "polar-samples": `for (let i = 0; i < 33; i++) { forward(5); if (colour() === "red") beep(); }`,
  "tunnel-array": `const route = [40, 50, 25]; for (const d of route) { forward(d); }`,
  "vault-turns": `const route = [["forward", 50], ["left", 90], ["forward", 70]];
for (const [m, a] of route) { if (m === "forward") forward(a); if (m === "left") turnLeft(a); if (m === "right") turnRight(a); }`,
  "cave-cost": `const route = [["forward", 115]]; let cost = 0;
for (const [m, a] of route) { if (m === "forward") { forward(a); cost += a; } }
console.log("Cost:", cost);`,
  "lava-budget": `const A = [["left", 90], ["forward", 60], ["right", 90], ["forward", 110]];
const B = [["left", 90], ["forward", 75], ["right", 90], ["forward", 110], ["right", 90], ["forward", 15]];
function cost(r) { let c = 0; for (const [m, a] of r) if (m === "forward") c += a; return c; }
console.log("A:", cost(A), "B:", cost(B));
const best = cost(A) <= cost(B) ? A : B;
for (const [m, a] of best) { if (m === "forward") forward(a); if (m === "left") turnLeft(a); if (m === "right") turnRight(a); }`,
  "cavern-square": `let cost = 0; for (let i = 0; i < 4; i++) { forward(50); cost += 50; turnLeft(90); } console.log("Cost:", cost);`,
  "hall-wall": `let steps = 0; while (!obstacle()) { forward(2); steps++; } beep(); backward(steps * 2);`,
  "dino-light": `while (!obstacle()) { if (light() < 30) { led("white"); } else { led("off"); } forward(2); }`,
  "sculpture-photo": `let taken = false; while (!obstacle()) { forward(2); if (colour() === "yellow" && !taken) { photo(); taken = true; } }`,
  "school-corner": WALL_LOOP(1),
  "glasshouse-u": WALL_LOOP(3),
  "deck-read": `const code = nextCode(); console.log(code.length);`,
  "cave-length": VAULT(`c.length >= 12`, "forward(148);"),
  "dock-digit": `let c = nextCode();
while (c !== "") { if (c.length < 12) display("weak"); else if (!/[0-9]/.test(c)) display("ok"); else display("strong"); wait(1); c = nextCode(); }`,
  "beach-strong": VAULT(`c.length >= 12 && /[0-9]/.test(c) && /[A-Za-z]/.test(c) && /[^A-Za-z0-9]/.test(c)`, "forward(92); turnRight(90); forward(48);"),
  "wave-code-lock": `for (let round = 0; round < 3; round++) {
  wait(3);
  let waves = 0;
  while (waved()) waves++;
  if (waves === 3) { unlock(); forward(98); break; }
  else if (waves < 3) { display("Too few"); beep(); }
  else { display("Too many"); beep(); }
}`,
  "fort-lockout": `function strong(c) { return c.length >= 12 && /[0-9]/.test(c) && /[A-Za-z]/.test(c) && /[^A-Za-z0-9]/.test(c); }
let weak = 0; let c = nextCode();
while (c !== "") {
  if (strong(c)) { unlock(); forward(90); break; }
  beep(); weak++;
  if (weak >= 3) { display("Locked"); break; }
  c = nextCode();
}`,
  "qa-colour": `console.log(itemColour());`,
  "warehouse-lookup": SORT([50], { red: 19, orange: 50, yellow: 81 }),
  "loading-goto": `${GO_TO(70, 50, 180)}
goTo(31, 19); goTo(131, 19); goTo(131, 81);`,
  "market-two": `${GO_TO(70, 50, 180)}
const counts = {};
for (const row of [19, 50, 81]) { goTo(41, row); face(180); const c = itemColour(); counts[c] = (counts[c] || 0) + 1; }
console.log(JSON.stringify(counts));`,
  "greenhouse-unknown": SORT([19, 50], { red: 19 }),
  "control-read": `let m = nextMessage(); while (m !== "") { console.log(m); m = nextMessage(); }`,
  "bridge-split": CHAT,
  "lab-intents": CHAT,
  "observatory-refuse": CHAT,
  "airlock-stop": CHAT,
  "ash-one": `record("temp", temperature());`,
  "lake-five": SURVEY(5, ""),
  "dunes-max": `const r = []; for (let row = 0; row < 2; row++) { for (let i = 0; i < 8; i++) { forward(15); const t = temperature(); r.push(t); record("temp", t); } if (row === 0) { turnRight(90); forward(40); turnRight(90); } } console.log(Math.max(...r));`,
  "craters-mean": `const r = []; for (let side = 0; side < 4; side++) { for (let i = 0; i < 3; i++) { forward(30); const t = temperature(); r.push(t); record("temp", t); } turnLeft(90); } console.log(r.reduce((a, b) => a + b, 0) / r.length);`,
  "cavern-hotspot": `while (!obstacle()) { forward(2); } turnLeft(90); while (temperature() <= 150) { forward(2); } beep();`,
  "roof-baseline": `record("power", power());`,
  "windfarm-row": `forward(120);`,
  "meadow-before-after": `record("power", power()); forward(60); record("power", power());`,
  "hill-all": `record("power", power()); forward(30); record("power", power()); forward(40); record("power", power()); forward(40); record("power", power()); turnRight(90); forward(30); record("power", power()); forward(30); record("power", power());`,
  "sunflower-efficient": `forward(95); turnRight(90); forward(30); turnRight(90); forward(60); turnLeft(90); forward(30); turnLeft(90); forward(60); console.log(275);`,
};
