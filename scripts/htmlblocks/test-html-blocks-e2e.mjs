// Browser acceptance tests for /tools/html-blocks in Chromium.
//   npm run build && npm run test:html-blocks:e2e        (starts `next start` itself)
//   BASE_URL=http://localhost:3000 npm run test:html-blocks:e2e
// Needs Chromium for Playwright (`npx playwright-core install chromium`, or CHROMIUM_PATH).
// The class-password check (/api/workbooks/session) is answered by the test, so no password is needed.
import { spawn } from "node:child_process";
import fs from "node:fs";
import { chromium } from "playwright-core";

let server = null;
let base = process.env.BASE_URL;
if (!base) {
  const port = 3125;
  base = `http://localhost:${port}`;
  server = spawn("npx", ["next", "start", "-p", String(port)], { stdio: "ignore", detached: true });
  for (let i = 0; ; i++) {
    try { if ((await fetch(base)).status < 500) break; } catch {}
    if (i > 120) throw new Error("next start did not come up; run `npm run build` first");
    await new Promise((r) => setTimeout(r, 500));
  }
}
const PAGE = `${base.replace(/\/$/, "")}/tools/html-blocks/`;
const SHOTS = process.env.SHOTS_DIR;
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

let failed = 0, passed = 0;
async function test(name, fn, { unlocked = true } = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await context.route("**/api/workbooks/session/**", (r) => r.fulfill({ json: { ok: unlocked } }));
  const page = await context.newPage();
  page.on("dialog", (d) => d.accept());
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  try {
    await page.goto(PAGE);
    await fn(page);
    if (errors.length) throw new Error(`page errors: ${errors.join("; ")}`);
    passed++; console.log(`ok    ${name}`);
  } catch (e) {
    failed++; console.log(`FAIL  ${name}\n      ${e.message.split("\n")[0]}`);
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/FAIL-${name.replace(/\W+/g, "-")}.png` }).catch(() => {});
  }
  await context.close();
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const code = (page) => page.getByTestId("code").innerText();
const preview = (page) => page.frameLocator('[data-testid="preview"]');
const shot = (page, name) => SHOTS && page.screenshot({ path: `${SHOTS}/${name}.png` });

await test("locked without the Builders class password", async (page) => {
  await page.getByText("Enter the Builders class password").waitFor();
  assert(!(await page.getByTestId("palette").count()), "tool showed without a password");
}, { unlocked: false });

await test("S1: tap cards to add them; the code and the live page update", async (page) => {
  await page.getByTestId("palette-p").click();
  await page.getByTestId("palette-img").click();
  await page.getByTestId("text-p").fill("I like robots.");
  await page.getByRole("radio", { name: "A teal robot" }).click();
  const c = await code(page);
  assert(c.includes("<p>I like robots.</p>") && c.includes('<img src="robot-teal.svg" alt="A teal robot">'), c);
  await preview(page).locator("p", { hasText: "I like robots." }).waitFor();
  assert(await preview(page).locator("img[alt='A teal robot']").count(), "no picture in the preview");
  await shot(page, "html-blocks-s1-words");
});

await test("drag a card from the palette onto the page, and back to remove it", async (page) => {
  await page.getByTestId("palette-p").dragTo(page.getByTestId("body-zone"));
  assert((await page.getByTestId("card-p").count()) === 1, "drag did not add");
  await page.getByTestId("card-p").dragTo(page.getByTestId("palette"));
  assert((await page.getByTestId("card-p").count()) === 0, "drag back did not remove");
});

await test("pictures only: palette and cards lose their word labels, tags stay", async (page) => {
  await page.getByTestId("set-labels").selectOption("icons");
  assert(!(await page.getByTestId("palette").innerText()).includes("Big heading"), "words still shown");
  assert((await page.getByTestId("palette").innerText()).includes("<h1>"), "tags gone");
  await shot(page, "html-blocks-s1-pictures");
});

await test("S2: a style card adds CSS color and font-size, and the preview uses it", async (page) => {
  await page.getByTestId("set-stage").selectOption("2");
  await page.getByTestId("palette-style").click();
  await page.getByRole("radio", { name: "red", exact: true }).click();
  await page.getByTestId("style-size").selectOption("48");
  const c = await code(page);
  assert(/h1 \{\s+color: red;\s+font-size: 48px;\s+\}/.test(c), c);
  const colour = await preview(page).locator("h1").evaluate((e) => getComputedStyle(e).color);
  assert(colour === "rgb(255, 0, 0)", colour);
  await shot(page, "html-blocks-s2");
});

await test("S3: list items go inside a list (dragged in)", async (page) => {
  await page.getByTestId("set-stage").selectOption("3");
  await page.getByTestId("palette-li").click();
  await page.getByRole("status").getByText("inside a list").waitFor();
  await page.getByTestId("palette-ul").click();
  await page.getByTestId("palette-li").dragTo(page.getByTestId("list-zone"));
  await page.getByTestId("palette-li").click();
  const c = await code(page);
  assert(/<ul>\n\s+<li>A list item<\/li>\n\s+<li>A list item<\/li>\n\s+<\/ul>/.test(c), c);
  await shot(page, "html-blocks-s3");
});

await test("touch and keyboard: every card control is at least 44 px, and list items move by tapping", async (page) => {
  await page.getByTestId("set-stage").selectOption("3");
  await page.getByTestId("palette-ul").click();
  await page.getByTestId("add-li").click();
  await page.getByTestId("palette-ul").click();
  const small = await page.evaluate(() => [...document.querySelectorAll('[data-testid="body-zone"] button, [data-testid="style-zone"] button')].map((b) => b.getBoundingClientRect()).filter((r) => r.width < 44 || r.height < 44).length);
  assert(small === 0, `${small} buttons under 44 px`);
  // keyboard: focus the list item's Move down and press Enter: it goes into the second list
  await page.getByTestId("list-zone").first().getByTestId("move-down").focus();
  await page.keyboard.press("Enter");
  const lists = await page.evaluate(() => window.__htmlBlocks.project().pages[0].cards.filter((c) => c.kind === "ul").map((l) => l.items.length));
  assert(JSON.stringify(lists) === "[0,1]", JSON.stringify(lists));
  await page.getByTestId("set-labels").selectOption("icons");
  await page.getByTestId("open-word-bank").first().click();
  const smallIcons = await page.evaluate(() => [...document.querySelectorAll('[data-testid="body-zone"] button, [data-testid="style-zone"] button')].map((b) => b.getBoundingClientRect()).filter((r) => r.width < 44 || r.height < 44).length);
  assert(smallIcons === 0, `pictures only: ${smallIcons} buttons under 44 px`);
  await shot(page, "html-blocks-s3-pictures");
});

await test("S2: hard-to-read colour shows a gentle warning", async (page) => {
  await page.getByTestId("set-stage").selectOption("2");
  await page.getByTestId("palette-style").click();
  await page.getByRole("radio", { name: "gold", exact: true }).click();
  await page.getByTestId("contrast-warning").waitFor();
  await page.getByRole("radio", { name: "navy", exact: true }).click();
  assert(!(await page.getByTestId("contrast-warning").count()), "warning stayed for navy");
});

await test("no typing: build a page by tapping words and pictures, in pictures-only mode", async (page) => {
  await page.getByTestId("set-stage").selectOption("3");
  await page.getByTestId("set-labels").selectOption("icons");
  await page.getByTestId("open-word-bank").first().click();
  await page.getByTestId("topic-animals").click();
  await page.getByTestId("word-bank").getByRole("button", { name: "Animals I Love" }).click();
  await page.getByTestId("palette-p").click();
  await page.getByTestId("card-p").getByTestId("open-word-bank").click();
  await page.getByTestId("topic-animals").click();
  await page.getByTestId("word-bank").getByRole("button", { name: "Pets need food and water every day." }).click();
  await page.getByTestId("word-bank").getByRole("button", { name: "Be gentle with animals." }).click();
  await shot(page, "html-blocks-word-bank-pictures");
  await page.getByTestId("palette-ul").click();
  await page.getByTestId("add-li").click();
  await page.getByTestId("card-li").getByTestId("open-word-bank").click();
  await page.getByTestId("topic-animals").click();
  await page.getByTestId("word-bank").getByRole("button", { name: "Give fresh water" }).click();
  await page.getByTestId("palette-img").click();
  await page.getByRole("radio", { name: "A purple robot" }).click();
  const c = await code(page);
  for (const want of ["<h1>Animals I Love</h1>", "<p>Pets need food and water every day. Be gentle with animals.</p>", "<li>Give fresh water</li>", 'alt="A purple robot"']) assert(c.includes(want), `${want} missing`);
  await shot(page, "html-blocks-no-typing");
});

await test("Capstone: a link to the About page opens that page from the preview; work is kept after reload", async (page) => {
  await page.getByTestId("set-stage").selectOption("5");
  await page.getByTestId("palette-a").click();
  await page.getByTestId("link-href").selectOption("about.html");
  assert((await code(page)).includes('<a href="about.html">Learn more</a>'), await code(page));
  await preview(page).locator("a").click();
  await page.waitForFunction(() => document.querySelector('[data-testid="page-tab-1"]')?.getAttribute("aria-selected") === "true");
  await shot(page, "html-blocks-capstone");
  await page.reload();
  await page.getByTestId("page-tab-0").click();
  assert((await code(page)).includes('href="about.html"'), "not saved");
});

await browser.close();
if (server) process.kill(-server.pid);
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
