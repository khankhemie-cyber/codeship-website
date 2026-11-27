// The cookie banner is hidden on the children's pages (/tools, /quizzes,
// /workbooks: no analytics run there) and works as before everywhere else.
//   npm run build && npm run test:cookies:e2e        (starts `next start` itself)
//   BASE_URL=http://localhost:3000 npm run test:cookies:e2e
// Needs Chromium for Playwright (`npx playwright-core install chromium`, or CHROMIUM_PATH).
import "./blocks/ts-resolve.mjs";
import { spawn } from "node:child_process";
import { chromium } from "playwright-core";
const { hidesCookieBanner, isChildPath } = await import("../src/lib/childPages.ts");

let failed = 0, passed = 0;
async function test(name, fn) {
  try { await fn(); passed++; console.log(`ok    ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message.split("\n")[0]}`); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };

await test("hidesCookieBanner: tools, quizzes and workbooks only", () => {
  for (const p of ["/tools", "/tools/", "/tools/html-blocks/", "/tools/robots", "/quizzes/", "/quizzes/explorers/", "/workbooks/builders/"]) assert(hidesCookieBanner(p), `${p} should hide`);
  for (const p of ["/", "/programs/", "/privacy-policy", "/ship-it/", "/ship-it/bus-buddies/", "/toolsx", "/schools/", null]) assert(!hidesCookieBanner(p), `${p} should show`);
  assert(isChildPath("/ship-it/bus-buddies/"), "analytics rule for games unchanged");
});

let server = null;
let base = process.env.BASE_URL;
if (!base) {
  const port = 3128;
  base = `http://localhost:${port}`;
  server = spawn("npx", ["next", "start", "-p", String(port)], { stdio: "ignore", detached: true });
  for (let i = 0; ; i++) {
    try { if ((await fetch(base)).status < 500) break; } catch {}
    if (i > 120) throw new Error("next start did not come up; run `npm run build` first");
    await new Promise((r) => setTimeout(r, 500));
  }
}
base = base.replace(/\/$/, "");
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const banner = (page) => page.getByRole("region", { name: "Cookie choices" });
const open = async (path) => {
  const context = await browser.newContext();
  await context.route("**/api/workbooks/session/**", (r) => r.fulfill({ json: { ok: true } }));
  const page = await context.newPage();
  await page.goto(base + path);
  await page.waitForTimeout(1500);
  return { context, page };
};

for (const path of ["/tools/html-blocks/", "/tools/robots/", "/tools/blocks/", "/quizzes/", "/workbooks/builders/"]) {
  await test(`no banner on ${path}`, async () => {
    const { context, page } = await open(path);
    assert(!(await banner(page).count()), "banner shown");
    assert((await page.evaluate(() => localStorage.getItem("codeship-cookie-consent"))) === null, "consent was set");
    await context.close();
  });
}
for (const path of ["/", "/programs/", "/ship-it/"]) {
  await test(`banner still shows on ${path}`, async () => {
    const { context, page } = await open(path);
    await banner(page).waitFor({ timeout: 5000 });
    await context.close();
  });
}
for (const path of ["/quizzes/", "/workbooks/"]) {
  await test(`Cookie settings still opens the banner on ${path}, and the choice saves`, async () => {
    const { context, page } = await open(path);
    assert(!(await banner(page).count()), "banner shown before asking");
    await page.getByRole("button", { name: /cookie settings/i }).first().click();
    await banner(page).waitFor({ timeout: 5000 });
    await banner(page).getByRole("button", { name: "Essential only" }).click();
    assert((await page.evaluate(() => localStorage.getItem("codeship-cookie-consent"))) === "essential", "choice not saved");
    assert(!(await banner(page).count()), "banner stayed open");
    await context.close();
  });
}
await test("consent unchanged elsewhere: Accept all saves the choice and the banner stays closed after reload; Cookie settings reopens it", async () => {
  const { context, page } = await open("/");
  await banner(page).getByRole("button", { name: "Accept all" }).click();
  assert((await page.evaluate(() => localStorage.getItem("codeship-cookie-consent"))) === "all", "choice not saved");
  await page.reload();
  await page.waitForTimeout(1000);
  assert(!(await banner(page).count()), "banner back after choosing");
  await page.getByRole("button", { name: /cookie settings/i }).first().click();
  await banner(page).waitFor({ timeout: 5000 });
  await context.close();
});

await browser.close();
if (server) process.kill(-server.pid);
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
