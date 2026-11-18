// Reference solutions for every Robot Lab mission (JavaScript, as the Blocks
// and JavaScript modes run it). The acceptance tests prove each mission can be
// passed. Not shipped to students.
export const JS = {
  "toy-bin": `forward(32); pickUp(); forward(40); drop();`,
  "kindness-delivery": `waitForClap(); forward(80); beep();`,
  "bin-stop": `while (!obstacle()) { forward(2); } beep();`,
  "neighbourhood": `forward(50); turnLeft(90); forward(55); turnRight(90); forward(45);`,
  "day-night": `for (let i = 0; i < 66; i++) { forward(2); if (light() < 30) { led("yellow"); } else { led("off"); } }`,
  "pollinator": `forward(25); wait(1); forward(15); turnLeft(90); forward(35); turnRight(90); forward(30); wait(1);
forward(30); turnRight(90); forward(20); wait(1); forward(15); turnLeft(90); forward(30); wait(1);`,
  "wall-stop": `function smallest() { let m = 999; for (let i = 0; i < 3; i++) { m = Math.min(m, distance()); } return m; }
while (smallest() > 14) { forward(2); }`,
  "delivery": `pickUp(); const route = [["forward", 100], ["left", 90], ["forward", 50]]; let cost = 0;
for (const [m, a] of route) { if (m === "forward") { forward(a); cost += a; } if (m === "left") turnLeft(a); }
drop(); console.log("Cost:", cost);`,
  "colour-sort": `
let x = 70, y = 50, h = 180;
function face(target) { let d = ((target - h) % 360 + 540) % 360 - 180; if (d > 0) turnLeft(d); else turnRight(-d); h = target; }
function goTo(tx, ty) { const dx = tx - x, dy = ty - y; const dist = Math.hypot(dx, dy); if (dist < 0.01) return;
  face(Math.atan2(-dy, dx) * 180 / Math.PI); forward(dist); x = tx; y = ty; }
const zoneY = { red: 19, blue: 50, yellow: 81 };
for (const row of [19, 50, 81]) {
  goTo(41, row); face(180);
  const c = itemColour(); pickUp();
  goTo(70, row); goTo(70, zoneY[c]); goTo(127, zoneY[c]); face(0); drop(); goTo(100, zoneY[c]);
}`,
  "survey": `for (let i = 0; i < 17; i++) { forward(10); record("light", light()); }`,
  "sandbox": `forward(5);`,
  "show-and-tell": `forward(95); led("green"); beep(); turnLeft(180); forward(95);`,
  "meet-my-robot": `display("Hi, I'm Bolt"); led("blue"); beep(); beep(); turnLeft(360);`,
  "pet-routine": `for (let i = 0; i < 2; i++) { forward(45); beep(); turnLeft(180); forward(90); wait(1); turnLeft(180); forward(45); }`,
  "community-helper": `pickUp(); forward(80); turnLeft(90); forward(40); drop(); beep();`,
  "focus-timer": `let time = 5;
function tick() { display(time); wait(1); time = time - 1; }
while (time > 0) { tick(); }
beep(); forward(100);`,
  "snack-stand": `const stones = 4; const size = 22; const d = stones * size; console.log("Distance:", d); forward(d);`,
  "hallway-helper": `while (!obstacle()) { forward(2); if (light() < 30) { led("white"); } else { led("off"); } }`,
  "lock-the-robot": `function strong(c) { return c.length >= 12 && /[0-9]/.test(c) && /[A-Za-z]/.test(c) && /[^A-Za-z0-9]/.test(c); }
let c = nextCode();
while (c !== "") { if (strong(c)) { forward(100); break; } else { beep(); } c = nextCode(); }`,
  "help-desk-robot": `const actions = { forward: (n) => forward(n), left: (n) => turnLeft(n), right: (n) => turnRight(n) };
let m = nextMessage();
while (m !== "") {
  const [word, num] = m.split(" ");
  if (word === "stop") break;
  if (actions[word] && !isNaN(Number(num))) actions[word](Number(num));
  else display("Sorry, I can't help");
  m = nextMessage();
}`,
  "recycling-helper": `
let x = 70, y = 55, h = 180;
function face(t) { let d = ((t - h) % 360 + 540) % 360 - 180; if (d > 0) turnLeft(d); else turnRight(-d); h = t; }
function goTo(tx, ty) { const dx = tx - x, dy = ty - y, dist = Math.hypot(dx, dy); if (dist < 0.01) return; face(Math.atan2(-dy, dx) * 180 / Math.PI); forward(dist); x = tx; y = ty; }
const binY = { blue: 20.5, green: 54.5, grey: 88.5 };
const binName = { blue: "recycling", green: "compost", grey: "garbage" };
const counts = { recycling: 0, compost: 0, garbage: 0 };
for (const row of [18, 42, 66, 90]) {
  goTo(41, row); face(180);
  const c = itemColour(); pickUp();
  goTo(70, row); goTo(70, binY[c]); goTo(132, binY[c]); face(0); drop(); counts[binName[c]]++; goTo(100, binY[c]);
}
for (const k in counts) record(k, counts[k]);`,
};

// A two-sensor line follower for the Free build oval.
export const LINE_FOLLOWER = `for (let i = 0; i < 400; i++) {
  if (lineLeft()) { turnLeft(5); forward(0.5); }
  else if (lineRight()) { turnRight(5); forward(0.5); }
  else forward(1);
}`;
