// Browser acceptance tests for /tools/blocks: the real page in Chromium with
// a fake microphone. Lesson projects are loaded through the real Open button.
//   npm run build && npm run test:blocks:e2e          (starts `next start` itself)
//   BASE_URL=http://localhost:3000 npm run test:blocks:e2e
// Needs Chromium for Playwright (`npx playwright-core install chromium`, or CHROMIUM_PATH).

import { spawn } from "node:child_process";
import fs from "node:fs";
import { chromium } from "playwright-core";
import * as F from "./fixtures.mjs";

let server = null;
let base = process.env.BASE_URL;
if (!base) {
  const port = 3124;
  base = `http://localhost:${port}`;
  server = spawn("npx", ["next", "start", "-p", String(port)], { stdio: "ignore", detached: true });
  for (let i = 0; ; i++) {
    try {
      if ((await fetch(base)).status < 500) break;
    } catch {}
    if (i > 120) throw new Error("next start did not come up; run `npm run build` first");
    await new Promise((r) => setTimeout(r, 500));
  }
}
const PAGE = `${base.replace(/\/$/, "")}/tools/blocks/`;

const browser = await chromium.launch({
  args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream", "--autoplay-policy=no-user-gesture-required"],
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
});

// Counts recordings actually started (Pop is an oscillator, so it isn't counted).
const SPY = `
  const start = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (...a) { window.__played = (window.__played || 0) + 1; return start.apply(this, a); };
`;

let failed = 0;
let passed = 0;
async function test(name, fn, contextOptions = {}) {
  const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1366, height: 768 }, ...contextOptions });
  await context.grantPermissions(["microphone", "clipboard-read", "clipboard-write"], { origin: new URL(PAGE).origin });
  await context.addInitScript(SPY);
  const dialogs = [];
  context.on("page", (p) => p.on("dialog", (d) => (dialogs.push(d.message()), d.accept())));
  const page = await context.newPage();
  try {
    await fn(page, context, dialogs);
    passed++;
    console.log(`ok    ${name}`);
  } catch (err) {
    failed++;
    console.log(`FAIL  ${name}\n      ${String(err.message || err).split("\n").slice(0, 6).join("\n      ")}`);
    await page.screenshot({ path: `blocks-e2e-failure-${passed + failed}.png` }).catch(() => {});
  } finally {
    await context.close();
  }
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

// ── helpers ──
async function open(page, url = PAGE) {
  await page.goto(url);
  await page.waitForFunction(() => window.__codeshipBlocks?.project());
  await page.getByRole("button", { name: "Essential only" }).click({ timeout: 1500 }).catch(() => {});
  await page.locator(".blocklySvg").first().waitFor().catch(() => {});
}
async function openProject(page, project) {
  await page.getByTestId("file-input").setInputFiles({ name: `${project.name}.codeship`, mimeType: "application/json", buffer: Buffer.from(JSON.stringify(project)) });
  await page.waitForFunction((n) => window.__codeshipBlocks.project().name === n, project.name);
  await page.waitForTimeout(300);
}
const actor = (page, id) =>
  page.getByTestId(`actor-${id}`).evaluate((el) => ({ x: +el.dataset.x, y: +el.dataset.y, level: +el.dataset.level, visible: el.dataset.visible === "true" }));
const currentPage = (page) => page.evaluate(() => window.__codeshipBlocks.engine().page + 1);
const played = (page) => page.evaluate(() => window.__played || 0);
async function until(page, fn, what, timeout = 20000) {
  const t0 = Date.now();
  for (;;) {
    if (await fn()) return;
    if (Date.now() - t0 > timeout) throw new Error(`timed out waiting for ${what}`);
    await page.waitForTimeout(100);
  }
}
async function saveFile(page) {
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByTestId("save").click()]);
  return { name: download.suggestedFilename(), text: fs.readFileSync(await download.path(), "utf8") };
}

// ── 1. Helpful Robot ──
await test("1. Helpful Robot: tap → right 2, bubble, left 2, bubble, ends one size bigger", async (page) => {
  await open(page);
  await openProject(page, F.helpfulRobot());
  const bubbles = [];
  const seen = new Set();
  await page.getByTestId("actor-robot1").click();
  await until(
    page,
    async () => {
      const b = await page.getByTestId("bubble-robot1").textContent({ timeout: 50 }).catch(() => null);
      if (b && bubbles.at(-1) !== b) bubbles.push(b);
      const a = await actor(page, "robot1");
      seen.add(a.x);
      return a.level === 1;
    },
    "the robot to grow",
  );
  assert(JSON.stringify(bubbles) === JSON.stringify(["Got it!", "All tidy!"]), `bubbles: ${JSON.stringify(bubbles)}`);
  assert(seen.has(4), "never reached two squares right");
  const a = await actor(page, "robot1");
  assert(a.x === 2 && a.y === 4, `ended at ${a.x},${a.y}`);
});

// ── 2. Kindness Cards + the recording round trip ──
await test("2. Kindness Cards: front page bubbles, then page 2 plays the recording", async (page) => {
  await open(page);
  await openProject(page, F.kindnessCards());
  await page.getByTestId("actor-card1").click();
  await page.getByTestId("bubble-card1").getByText("Happy birthday Grandma!").waitFor();
  await page.getByTestId("bubble-card1").getByText("I made this for you").waitFor({ timeout: 6000 });
  await until(page, async () => (await currentPage(page)) === 2, "page 2", 10000);
  await until(page, async () => (await played(page)) >= 1, "the recording to play", 4000);
});

await test("2. Record: record, stop, play, re-record with no warning; Save → Open in a fresh browser still plays", async (page, context, dialogs) => {
  await open(page);
  const p = F.kindnessCards();
  p.recordings = {};
  p.pages[1].actors[0].scripts.blocks.blocks[0].next.block.data = undefined; // Record block with no clip yet
  await openProject(page, p);
  await page.getByTestId("page-tab-2").click();
  await page.locator(".blocklySvg .blocklyBlockCanvas").getByText("Record", { exact: true }).click();
  await page.getByTestId("rec-record").click();
  let level = 0;
  for (let i = 0; i < 20; i++) {
    level = Math.max(level, await page.getByTestId("rec-level").evaluate((el) => parseFloat(el.style.width)));
    await page.waitForTimeout(100);
  }
  assert(level > 0, "level meter showed nothing in 2 s of recording");
  await page.getByTestId("rec-stop").click();
  await page.getByTestId("rec-status").getByText(/Recorded/).waitFor();
  await page.getByTestId("rec-play").click();
  await until(page, async () => (await played(page)) >= 1, "playback in the recorder", 3000);
  // Again, as many times as you like: no dialog.
  await page.getByTestId("rec-record").click();
  await page.waitForTimeout(800);
  await page.getByTestId("rec-stop").click();
  await page.getByTestId("rec-status").getByText(/Recorded/).waitFor();
  assert(dialogs.length === 0, `a dialog appeared: ${dialogs}`);
  await page.getByRole("button", { name: "Done" }).click();

  const file = await saveFile(page);
  const saved = JSON.parse(file.text);
  const clips = Object.values(saved.recordings);
  assert(clips.length === 1, `file holds ${clips.length} recordings (re-recording should replace)`);
  assert(clips[0].data.startsWith("data:audio/wav;base64,") && clips[0].durationMs > 500, "recording is not a WAV");

  // The weekly check: open it somewhere else and listen.
  const fresh = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  await fresh.addInitScript(SPY);
  const other = await fresh.newPage();
  await open(other);
  await other.getByTestId("file-input").setInputFiles({ name: file.name, mimeType: "application/json", buffer: Buffer.from(file.text) });
  await other.waitForFunction(() => window.__codeshipBlocks.project().name === "Kindness Cards");
  await other.getByTestId("page-tab-2").click();
  await other.getByTestId("green-flag").click();
  await until(other, async () => (await played(other)) >= 1, "the reopened recording to play", 5000);
  await fresh.close();
});

// ── 3. Recycling Sorter ──
await test("3. Sorter: travels, bumps, hides, and the hidden can stays in the character list", async (page) => {
  await open(page);
  await openProject(page, F.recyclingSorter());
  await page.getByTestId("actor-can1").click();
  await page.getByTestId("bubble-can1").getByText("Yes! That one recycles").waitFor({ timeout: 6000 });
  await until(page, async () => !(await actor(page, "can1")).visible, "the can to hide", 6000);
  const a = await actor(page, "can1");
  assert(a.x === 6, `can stopped at ${a.x}`);
  assert(await page.getByTestId("pick-can1").isVisible(), "hidden can vanished from the character list");
});

await test("3. selecting a character changes the building area loudly", async (page) => {
  await open(page);
  await openProject(page, F.recyclingSorter());
  await page.getByTestId("pick-bin1").click();
  assert((await page.getByTestId("blocks-for").locator("img").getAttribute("alt")) === "bin", "Blocks-for badge did not switch to the bin");
  assert((await page.getByTestId("pick-bin1").getAttribute("aria-pressed")) === "true", "bin not highlighted");
  const blocks = await page.locator(".blocklySvg .blocklyBlockCanvas .blocklyDraggable").count();
  assert(blocks === 0, "the bin's (empty) blocks are not showing");
});

// ── 4. Neighbourhood Map ──
await test("4. Map: park tap grows the library, page 2 plays, Go Home returns with everything reset", async (page) => {
  await open(page);
  await openProject(page, F.neighbourhoodMap());
  await page.getByTestId("actor-park1").click();
  await until(page, async () => (await actor(page, "library1")).level === 1, "the library to grow", 5000);
  await until(page, async () => (await currentPage(page)) === 2, "page 2", 10000);
  await until(page, async () => (await played(page)) >= 1, "the park recording", 4000);
  await until(page, async () => (await currentPage(page)) === 1, "Go Home", 10000);
  const lib = await actor(page, "library1");
  assert(lib.level === 0, "library not reset");
});

await test("5. Save a Semester 4 project, open it in a fresh browser: every page, character, block and recording survives", async (page) => {
  await open(page);
  const original = F.neighbourhoodMap();
  await openProject(page, original);
  const file = await saveFile(page);
  assert(file.name === "My-Neighbourhood-Map.codeship", `file name ${file.name}`);
  const fresh = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  await fresh.addInitScript(SPY);
  const other = await fresh.newPage();
  await open(other);
  await other.getByTestId("file-input").setInputFiles({ name: file.name, mimeType: "application/json", buffer: Buffer.from(file.text) });
  await other.waitForFunction(() => window.__codeshipBlocks.project().name === "My Neighbourhood Map");
  const reopened = await other.evaluate(() => JSON.parse(JSON.stringify(window.__codeshipBlocks.project())));
  for (const key of ["characters", "pages", "recordings"]) {
    assert(JSON.stringify(reopened[key]) === JSON.stringify(original[key]), `${key} changed in the round trip`);
  }
  // Click through every page, as the books tell instructors to.
  for (let i = 1; i <= original.pages.length; i++) {
    await other.getByTestId(`page-tab-${i}`).click();
    for (const a of original.pages[i - 1].actors) assert(await other.getByTestId(`actor-${a.id}`).isVisible(), `page ${i}: ${a.id} missing`);
  }
  // Every recording plays on its own page.
  for (const i of [2, 3, 4]) {
    await other.getByTestId(`page-tab-${i}`).click();
    const before = await played(other);
    await other.getByTestId("green-flag").click();
    await until(other, async () => (await played(other)) > before, `page ${i} recording`, 4000);
    await other.getByTestId("stop").click();
  }
  await fresh.close();
});

// ── 5. Autosave and links ──
await test("5. autosave restores after a refresh; opening a link doesn't overwrite it", async (page, context) => {
  await open(page);
  await openProject(page, F.helpfulRobot());
  // An edit: move the robot's starting square by dragging it on the stage.
  const box = await page.getByTestId("actor-robot1").boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 3.5, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(3000);
  const status = await page.getByTestId("save-status").textContent();
  assert(/^Saved on this computer · \d\d:\d\d$/.test(status), `status: ${status}`);
  const movedX = (await actor(page, "robot1")).x;
  assert(movedX === 5, `robot dragged to ${movedX}`);

  await open(page, PAGE);
  assert((await actor(page, "robot1")).x === 5, "autosave not restored after refresh");

  // A link to a different (recording-free) project.
  const linkPage = await context.newPage();
  await open(linkPage);
  await openProject(linkPage, F.recyclingSorter());
  await linkPage.getByTestId("copy-link").click();
  const url = await linkPage.getByTestId("link-url").inputValue();
  assert(url.length <= 2000, `link is ${url.length} chars`);
  console.log(`      Semester 3 Sorter link: ${url.length} chars`);
  await linkPage.close();

  const tab = await context.newPage();
  await open(tab, url);
  assert((await tab.evaluate(() => window.__codeshipBlocks.project().name)) === "Recycling Sorter", "link did not open");
  await tab.waitForTimeout(2500);
  await tab.close();
  await open(page, PAGE);
  assert((await actor(page, "robot1")).x === 5, "opening the link overwrote this computer's autosave");
});

await test("5. Copy link refuses a project with recordings and says why", async (page) => {
  await open(page);
  await openProject(page, F.kindnessCards());
  await page.getByTestId("copy-link").click();
  assert((await page.getByTestId("link-error").textContent()).includes("voice recordings"), "no clear refusal");
});

// ── 6. Devices ──
await test("6. a finger can drag a block from the palette into a stack", async (page, context) => {
  await open(page);
  await openProject(page, F.helpfulRobot(["start_tap"]));
  const cdp = await context.newCDPSession(page);
  const touch = (type, x, y) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y }] });
  const src = await page.locator(".blocklyFlyout .blocklyDraggable").filter({ hasText: "Move Right" }).first().boundingBox();
  const hat = await page.locator(".blocklySvg .blocklyBlockCanvas .blocklyDraggable").first().boundingBox();
  const from = { x: src.x + 25, y: src.y + src.height / 2 };
  const to = { x: hat.x + 45, y: hat.y + hat.height + 25 }; // a little off: snapping is forgiving
  await touch("touchStart", from.x, from.y);
  for (let i = 1; i <= 20; i++) {
    await touch("touchMove", from.x + ((to.x - from.x) * i) / 20, from.y + ((to.y - from.y) * i) / 20);
    await page.waitForTimeout(16);
  }
  await touch("touchEnd");
  await page.waitForTimeout(400);
  const top = await page.evaluate(() => window.__codeshipBlocks.project().pages[0].actors[0].scripts.blocks.blocks);
  assert(top.length === 1 && top[0].next?.block?.type === "move_right", `blocks after the drag: ${JSON.stringify(top.map((b) => b.type))}, next=${top[0]?.next?.block?.type}`);
});

await test("6. 150% zoom on a 1366×768 Chromebook: no sideways scroll, stage and controls visible", async (page) => {
  await open(page);
  const { scroll, client } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  assert(scroll <= client, `page scrolls sideways (${scroll} > ${client})`);
  for (const id of ["green-flag", "stop", "save", "stage", "add-character"]) assert(await page.getByTestId(id).isVisible(), `${id} not visible`);
  const stage = await page.getByTestId("stage").boundingBox();
  assert(stage.width >= 300, `stage only ${stage.width}px wide`);
}, { viewport: { width: 911, height: 512 } });

await test("labels: pictures-only mode drops words; French labels; semester 1 shows nine blocks", async (page) => {
  await open(page);
  // Blockly draws spaces in block text as non-breaking spaces.
  const flyoutText = async () => (await page.locator(".blocklyFlyout").textContent()).replace(/\u00a0/g, " ");
  assert((await flyoutText()).includes("Move Right"), "English labels missing");
  await page.getByTestId("settings").click();
  await page.getByTestId("set-lang").selectOption("fr");
  await page.waitForTimeout(400);
  assert((await flyoutText()).includes("Aller à droite"), "French labels missing");
  await page.getByTestId("set-mode").selectOption("icons");
  await page.waitForTimeout(400);
  assert(!(await flyoutText()).includes("Aller à droite"), "pictures-only mode still shows words");
  await page.getByTestId("set-semester").selectOption("1");
  await page.waitForTimeout(400);
  const count = await page.locator(".blocklyFlyout .blocklyDraggable").evaluateAll((els) => els.filter((e) => e.parentElement?.classList.contains("blocklyBlockCanvas")).length);
  assert(count === 9, `semester 1 palette has ${count} blocks`);
});

// ── Levels ──
async function dragFromPalette(page, label, below) {
  const src = await page.locator(".blocklyFlyout .blocklyDraggable").filter({ hasText: label }).first().boundingBox();
  const placed = page.locator(".blocklySvg .blocklyBlockCanvas .blocklyDraggable");
  // Under the last block, or into empty space on a blank workspace.
  const target = (await placed.count()) ? await placed.last().boundingBox() : null;
  const ws = await page.getByTestId("blocks-workspace").boundingBox();
  const to = target ? { x: target.x + 40, y: (below ? target.y + target.height : target.y) + 22 } : { x: ws.x + ws.width * 0.6, y: ws.y + 80 };
  await page.mouse.move(src.x + 20, src.y + src.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(300);
}
const levelHero = (page) => page.evaluate(() => ({ ...window.__codeshipLevels.engine().states.get("hero") }));

await test("levels: Semester 1 Level 1 is finished by building Move Right, Move Right and tapping the robot", async (page) => {
  await open(page);
  await page.getByTestId("view-levels").click();
  await page.getByTestId("level-s1-1").click();
  await page.locator(".blocklyFlyout").waitFor();
  await dragFromPalette(page, "Move Right", true);
  await dragFromPalette(page, "Move Right", true);
  const blocks = await page.evaluate(() => window.__codeshipLevels.project().pages[0].actors.find((a) => a.id === "hero").scripts.blocks.blocks);
  assert(blocks.length === 1 && blocks[0].next?.block?.next?.block?.type === "move_right", `blocks: ${JSON.stringify(blocks).slice(0, 200)}`);
  await page.getByTestId("actor-hero").click();
  await page.getByTestId("level-won").waitFor({ timeout: 5000 });
  await page.getByTestId("next-level").click();
  assert((await page.getByTestId("level-label").textContent()).includes("Level 2"), "Next level did not open level 2");
  await page.getByTestId("all-levels").click();
  assert((await page.getByTestId("level-s1-1").getAttribute("aria-label")).includes("Finished"), "level 1 not marked finished");
  await open(page, PAGE);
  assert((await page.getByTestId("level-s1-1").getAttribute("aria-label")).includes("Finished"), "progress not remembered after a refresh");
});

await test("levels: a near miss just stops — no win, no hint (door without Shrink)", async (page) => {
  await open(page);
  await page.getByTestId("view-levels").click();
  await page.getByTestId("level-s2-1").click();
  await page.locator(".blocklyFlyout").waitFor();
  await dragFromPalette(page, "Start on Tap", false);
  for (let i = 0; i < 4; i++) await dragFromPalette(page, "Move Right", true);
  await page.getByTestId("actor-hero").click();
  await page.waitForTimeout(3000);
  const hero = await levelHero(page);
  assert(hero.x === 3 && hero.y === 4, `cat ended at ${hero.x},${hero.y} (should stop in front of the door)`);
  assert((await page.getByTestId("level-won").count()) === 0, "won without shrinking");
  // Blockly's screen-reader announcements are visually hidden (.hiddenForAria); only visible text counts.
  const messages = await page
    .locator("[role=status], [role=alert]")
    .evaluateAll((els) => els.filter((e) => !e.closest(".hiddenForAria") && e.getBoundingClientRect().width > 2).map((e) => e.textContent.trim()).filter(Boolean));
  assert(messages.length === 0, `a message appeared: ${messages}`);
});

await browser.close();
if (server) process.kill(-server.pid);
console.log(failed ? `\n${failed} failed, ${passed} passed` : `\nAll ${passed} passed`);
process.exit(failed ? 1 : 0);
