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
const VAULT = (rule) => `function ok(c) { return ${rule}; }
let c = nextCode();
while (c !== "") { if (ok(c)) { unlock(); forward(90); break; } else { beep(); } c = nextCode(); }`;
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
  "farm-hello": `forward(30);`,
  "farm-first-egg": `forward(58);`,
  "farm-backward": `backward(55);`,
  "stage-warmup": `play("C"); play("D"); play("E");`,
  "stage-clap": `waitForClap(); beep();`,
  "stage-lights": `waitForClap(); led("red"); play("G"); led("blue"); play("C2");`,
  "reef-loop": `for (let i = 0; i < 4; i++) { forward(10); }`,
  "reef-rock": `while (!(obstacle())) { forward(2); }`,
  "reef-corner": `while (!(obstacle())) { forward(2); } turnLeft(90); while (!(obstacle())) { forward(2); }`,
  "snow-left": `turnLeft(90); forward(45);`,
  "snow-right": `forward(40); turnRight(90); forward(40);`,
  "snow-zigzag": `forward(30); turnLeft(90); forward(30); turnRight(90); forward(30);`,
  "paint-line": `penDown("blue"); forward(50); penUp();`,
  "paint-corner": `penDown("green"); forward(30); turnLeft(90); forward(30); penUp();`,
  "paint-three-sides": `penDown("purple"); for (let i = 0; i < 3; i++) { forward(30); turnLeft(90); } penUp();`,
  // Builders
  "disco-name": `display("Pixel");`,
  "disco-colours": `led("red"); wait(0.5); led("green"); wait(0.5); led("purple");`,
  "disco-spin": `turnLeft(360); turnRight(360); beep();`,
  "train-into": `forward(70); led("yellow");`,
  "train-if": `for (let i = 0; i < 55; i++) { forward(2); if (light() < 30) { led("yellow"); } }`,
  "train-night": `for (let i = 0; i < 66; i++) { forward(2); if (light() < 30) { led("yellow"); } else { led("off"); } }`,
  "puppy-tree": `for (let i = 0; i < 3; i++) { forward(20); }`,
  "puppy-square": `for (let i = 0; i < 4; i++) { forward(50); turnLeft(90); }`,
  "puppy-stairs": `for (let i = 0; i < 3; i++) { forward(20); turnLeft(90); forward(20); turnRight(90); }`,
  "garden-one": `forward(40); wait(1);`,
  "garden-two": `forward(35); wait(1); forward(50); wait(1);`,
  "garden-sunflower": `forward(50); wait(3); forward(50); wait(1);`,
  "fire-siren": `led("red"); beep(); led("blue"); beep();`,
  "fire-straight": `beep(); forward(75); spray();`,
  "fire-two": `beep(); forward(30); turnLeft(90); spray(); turnRight(90); forward(55); turnLeft(90); forward(40); spray();`,
  // Developers
  "rocket-crew": `let crew = 4; display(crew);`,
  "rocket-countup": `let n = 1; while (n <= 3) { display(n); wait(1); n = n + 1; }`,
  "rocket-blink": `function blink() { led("red"); wait(0.5); led("off"); wait(0.5); } blink(); blink(); blink();`,
  "rocket-three": `let time = 3; while (time > 0) { display(time); wait(1); time = time - 1; } launch();`,
  "rocket-fuel": `let fuel = 100; function burn() { fuel = fuel - 25; display(fuel); wait(1); } while (fuel > 0) { burn(); } launch();`,
  "toss-50": `toss(50);`,
  "toss-add": `const d = 30 + 25; console.log(d); toss(d);`,
  "toss-multiply": `const towels = 2; const length = 30; const d = towels * length; console.log("Distance:", d); toss(d);`,
  "toss-divide": `const mat = 140; const d = mat / 2; console.log(d); toss(d);`,
  "toss-change": `const towels = 3; const length = 25; const d = towels * length; console.log(d); toss(d);`,
  "mars-read": `for (let i = 0; i < 3; i++) { console.log(distance()); }`,
  "mars-bool": `while (!obstacle()) { forward(2); }`,
  "mars-30": `while (distance() > 30) { forward(2); }`,
  "mars-wobble": `function smallest() { let m = 999; for (let i = 0; i < 3; i++) { m = Math.min(m, distance()); } return m; }
while (smallest() > 16) { forward(2); }`,
  "mars-rock": `while (!obstacle()) { forward(2); } turnRight(90); forward(40); turnLeft(90); forward(90);`,
  "mine-array": `const route = [40, 50, 25]; for (const d of route) { forward(d); }`,
  "mine-turns": `const route = [["forward", 50], ["left", 90], ["forward", 70]];
for (const [m, a] of route) { if (m === "forward") forward(a); if (m === "left") turnLeft(a); if (m === "right") turnRight(a); }`,
  "mine-cost": `const route = [["forward", 115]]; let cost = 0;
for (const [m, a] of route) { if (m === "forward") { forward(a); cost += a; } }
console.log("Cost:", cost);`,
  "mine-budget": `const route = [["left", 90], ["forward", 60], ["right", 90], ["forward", 110]]; let cost = 0;
for (const [m, a] of route) { if (m === "forward") { forward(a); cost += a; } if (m === "left") turnLeft(a); if (m === "right") turnRight(a); }
console.log("Cost:", cost);`,
  "mine-square": `let cost = 0; for (let i = 0; i < 4; i++) { forward(50); cost += 50; turnLeft(90); } console.log("Cost:", cost);`,
  "museum-wall": `while (!obstacle()) { forward(2); }`,
  "museum-light": `while (!obstacle()) { if (light() < 30) { led("white"); } else { led("off"); } forward(2); }`,
  "museum-photo": `let taken = false; while (!obstacle()) { forward(2); if (colour() === "yellow" && !taken) { photo(); taken = true; } }`,
  "museum-corner": WALL_LOOP(1),
  "museum-u": WALL_LOOP(2),
  // Engineers
  "vault-read": `const code = nextCode(); console.log(code.length);`,
  "vault-length": VAULT(`c.length >= 12`),
  "vault-digit": VAULT(`c.length >= 12 && /[0-9]/.test(c)`),
  "vault-strong": VAULT(`c.length >= 12 && /[0-9]/.test(c) && /[A-Za-z]/.test(c) && /[^A-Za-z0-9]/.test(c)`),
  "vault-lockout": `function strong(c) { return c.length >= 12 && /[0-9]/.test(c) && /[A-Za-z]/.test(c) && /[^A-Za-z0-9]/.test(c); }
let weak = 0; let c = nextCode();
while (c !== "") {
  if (strong(c)) { unlock(); forward(90); break; }
  beep(); weak++;
  if (weak >= 3) { display("Locked"); break; }
  c = nextCode();
}`,
  "fruit-read": `console.log(itemColour());`,
  "fruit-one": SORT([50], { red: 19, orange: 50, yellow: 81 }),
  "fruit-goto": `${GO_TO(70, 50, 180)}
goTo(31, 19); goTo(131, 19); goTo(131, 81);`,
  "fruit-two": SORT([19, 81], { red: 19, orange: 50, yellow: 81 }),
  "fruit-unknown": SORT([19, 50], { red: 19 }),
  "chat-read": `let m = nextMessage(); while (m !== "") { console.log(m); m = nextMessage(); }`,
  "chat-split": CHAT,
  "chat-dict": CHAT,
  "chat-refuse": CHAT,
  "chat-stop": CHAT,
  "lava-one": `record("temp", temperature());`,
  "lava-five": SURVEY(5, ""),
  "lava-max": SURVEY(17, "console.log(Math.max(...r));"),
  "lava-mean": SURVEY(17, "console.log(r.reduce((a, b) => a + b, 0) / r.length);"),
  "lava-hotspot": `while (temperature() <= 150) { forward(2); } beep();`,
  "solar-baseline": `record("power", power());`,
  "solar-row": `forward(120);`,
  "solar-before-after": `record("power", power()); forward(60); record("power", power());`,
  "solar-all": `forward(120); turnRight(90); forward(55); turnRight(90); forward(105);`,
  "solar-efficient": `forward(100); turnRight(90); forward(30); turnRight(90); forward(70); turnLeft(90); forward(30); turnLeft(90); forward(70); console.log(300);`,
};
