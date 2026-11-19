// Reference solutions for every Robot Lab mission (JavaScript, as the Blocks
// and JavaScript modes run it). The acceptance tests prove each mission can be
// passed. Not shipped to students.
export const JS = {
  "egg-hunt": `forward(95); beep();`,
  "clap-concert": `waitForClap(); forward(55); play("C"); play("E"); play("G");`,
  "coral-reef": `while (!obstacle()) { forward(2); } led("blue");`,
  "snowy-igloo": `forward(50); turnLeft(90); forward(55); turnRight(90); forward(45);`,
  "paint-a-square": `penDown("red"); for (let i = 0; i < 4; i++) { forward(30); turnLeft(90); } penUp(); beep();`,
  "dance-party": `display("Hi, I'm Bolt"); led("blue"); beep(); led("purple"); turnLeft(360);`,
  "night-train": `for (let i = 0; i < 72; i++) { forward(2); if (light() < 30) { led("yellow"); } else { led("off"); } }`,
  "puppy-walk": `for (let lap = 0; lap < 2; lap++) { for (let i = 0; i < 4; i++) { forward(70); turnLeft(90); } }`,
  "bloom-garden": `forward(30); wait(1); turnLeft(90); forward(35); wait(1); turnRight(90); forward(50); wait(1);
turnRight(90); forward(35); turnLeft(90); forward(50); wait(1);`,
  "fire-rescue": `beep(); forward(85); turnLeft(90); forward(40); spray();`,
  "rocket-countdown": `let time = 5;
function tick() { display(time); wait(1); time = time - 1; }
while (time > 0) { tick(); }
launch(); backward(35);`,
  "beach-toss": `const towels = 4; const length = 22; const d = towels * length; console.log("Distance:", d); toss(d);`,
  "mars-flag": `function smallest() { let m = 999; for (let i = 0; i < 3; i++) { m = Math.min(m, distance()); } return m; }
while (smallest() > 14) { forward(2); }
drop();`,
  "crystal-mine": `const route = [["forward", 40], ["left", 90], ["forward", 50], ["right", 90], ["forward", 83]]; let cost = 0;
for (const [m, a] of route) { if (m === "forward") { forward(a); cost += a; } if (m === "left") turnLeft(a); if (m === "right") turnRight(a); }
console.log("Cost:", cost);`,
  "museum-night": `let turns = 0;
while (true) {
  if (light() < 30) { led("white"); } else { led("off"); }
  if (obstacle()) { if (turns === 1) break; turnLeft(90); turns++; }
  else { forward(2); }
}
photo();`,
  "treasure-vault": `function strong(c) { return c.length >= 12 && /[0-9]/.test(c) && /[A-Za-z]/.test(c) && /[^A-Za-z0-9]/.test(c); }
let c = nextCode();
while (c !== "") { if (strong(c)) { unlock(); forward(90); break; } else { beep(); } c = nextCode(); }`,
  "fruit-factory": `
let x = 70, y = 50, h = 180;
function face(target) { let d = ((target - h) % 360 + 540) % 360 - 180; if (d > 0) turnLeft(d); else turnRight(-d); h = target; }
function goTo(tx, ty) { const dx = tx - x, dy = ty - y; const dist = Math.hypot(dx, dy); if (dist < 0.01) return;
  face(Math.atan2(-dy, dx) * 180 / Math.PI); forward(dist); x = tx; y = ty; }
const crateY = { red: 19, orange: 50, yellow: 81 };
for (const row of [19, 50, 81]) {
  goTo(41, row); face(180);
  const c = itemColour(); pickUp();
  goTo(70, row); goTo(70, crateY[c]); goTo(127, crateY[c]); face(0); drop(); goTo(100, crateY[c]);
}`,
  "space-station": `const actions = { forward: (n) => forward(n), left: (n) => turnLeft(n), right: (n) => turnRight(n), photo: () => photo() };
let m = nextMessage();
while (m !== "") {
  const [word, num] = m.split(" ");
  if (word === "stop") break;
  if (word === "photo") actions.photo();
  else if (actions[word] && !isNaN(Number(num))) actions[word](Number(num));
  else display("Sorry, I can't help");
  m = nextMessage();
}`,
  "volcano-survey": `for (let i = 0; i < 17; i++) { forward(10); record("temp", temperature()); }`,
  "solar-farm": `record("power", power()); forward(120); turnRight(90); forward(55); turnRight(90); forward(105); record("power", power());`,
  "sandbox": `forward(5);`,
};

// A two-sensor line follower for the Free build oval.
export const LINE_FOLLOWER = `for (let i = 0; i < 400; i++) {
  if (lineLeft()) { turnLeft(5); forward(0.5); }
  else if (lineRight()) { turnRight(5); forward(0.5); }
  else forward(1);
}`;
