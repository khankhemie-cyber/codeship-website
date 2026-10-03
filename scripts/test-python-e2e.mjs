// Browser acceptance tests for /tools/python: the real page in Chromium.
//   npm run build && npm run test:python:e2e        (starts `next start` itself)
//   BASE_URL=http://localhost:3000 npm run test:python:e2e   (use a running server)
// Needs a Chromium for Playwright: `npx playwright install chromium` once, or
// set CHROMIUM_PATH to an existing Chromium/Chrome binary.

import { spawn } from "node:child_process";
import fs from "node:fs";
import { chromium } from "playwright-core";
import { ALL_RUN_CASES, checkResult, INPUT_MESSAGE, PROJECT } from "./python-cases.mjs";

const SHARE_URL_LIMIT = 2000;
const TOO_BIG_MESSAGE = "This project is too big to share as a link. Download the file instead.";

let server = null;
let base = process.env.BASE_URL;
if (!base) {
  const port = 3123;
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
const PAGE = `${base.replace(/\/$/, "")}/tools/python/`;

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let failed = 0;
let passed = 0;

async function test(name, fn) {
  const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1366, height: 768 } });
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: new URL(PAGE).origin });
  const page = await context.newPage();
  try {
    await fn(page, context);
    passed++;
    console.log(`ok    ${name}`);
  } catch (err) {
    failed++;
    console.log(`FAIL  ${name}\n      ${String(err.message || err).replace(/\n/g, "\n      ")}`);
  } finally {
    await context.close();
  }
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

// ── page helpers ──
const open = async (page, url = PAGE) => {
  await page.goto(url);
  await page.waitForFunction(() => document.querySelector("[data-testid=editor]")?.cmView);
};
const waitReady = (page) => page.getByRole("status").filter({ hasText: "Python ready" }).waitFor({ timeout: 60000 });
const getCode = (page) => page.evaluate(() => document.querySelector("[data-testid=editor]").cmView.state.doc.toString());
const setCode = (page, code) =>
  page.evaluate((c) => {
    const view = document.querySelector("[data-testid=editor]").cmView;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: c } });
  }, code);
const runButton = (page) => page.getByRole("button", { name: /^(Run|Running…)$/ });

async function runAndRead(page) {
  await runButton(page).click();
  await page.waitForFunction(() => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "Run");
    return b && !b.disabled;
  }, null, { timeout: 60000 });
  return page.evaluate(() => {
    const out = document.querySelector("[data-testid=output]");
    const stdout = [...out.querySelectorAll("pre:not([data-testid=error])")].map((p) => p.textContent).join("");
    const error = out.querySelector("[data-testid=error]")?.textContent ?? null;
    const notes = [...out.querySelectorAll("[data-testid=note]")].map((n) => n.textContent);
    return { output: stdout, error, notes };
  });
}

// ── 1–4 + input(): every lesson case, through the real UI and worker ──
await test("1–4: lesson-plan programs give the right output and errors", async (page) => {
  await open(page);
  await waitReady(page);
  const problems = [];
  for (const c of ALL_RUN_CASES) {
    await setCode(page, c.code);
    const r = await runAndRead(page);
    const error = r.error ?? (r.notes.includes(INPUT_MESSAGE) ? INPUT_MESSAGE : null);
    for (const p of checkResult(c, { output: r.output, error })) problems.push(`${c.name}: ${p}`);
  }
  assert(problems.length === 0, problems.join("\n"));
});

await test("3: errors are visually distinct from output", async (page) => {
  await open(page);
  await setCode(page, 'print("fine")\nprint(passwrd)');
  await runAndRead(page);
  const style = await page.locator("[data-testid=error]").evaluate((el) => {
    const s = getComputedStyle(el);
    return { border: s.borderLeftColor, width: s.borderLeftWidth, color: s.color };
  });
  assert(style.border === "rgb(255, 107, 107)" && parseFloat(style.width) >= 3, `error style: ${JSON.stringify(style)}`);
});

await test("output persists after editing, Clear output empties it", async (page) => {
  await open(page);
  await setCode(page, 'print("kept")');
  await runAndRead(page);
  await setCode(page, 'print("changed")');
  await page.waitForTimeout(300);
  assert((await page.getByTestId("output").textContent()).includes("kept"), "output was cleared by an edit");
  await page.getByRole("button", { name: "Clear output" }).click();
  assert(!(await page.getByTestId("output").textContent()).includes("kept"), "Clear output did not clear");
});

// ── Editor behaviour ──
await test("editor: 4-space soft tabs, auto-indent after ':', backspace removes 4, no autocomplete", async (page) => {
  await open(page);
  await setCode(page, "");
  await page.locator(".cm-content").click();
  await page.keyboard.press("Tab");
  assert((await getCode(page)) === "    ", `Tab gave ${JSON.stringify(await getCode(page))}`);
  await page.keyboard.press("Backspace");
  assert((await getCode(page)) === "", `Backspace after Tab gave ${JSON.stringify(await getCode(page))}`);
  await page.keyboard.type("def rate(length):");
  await page.keyboard.press("Enter");
  assert((await getCode(page)) === "def rate(length):\n    ", `Enter after ':' gave ${JSON.stringify(await getCode(page))}`);
  await page.keyboard.type("if length >= 16:");
  await page.keyboard.press("Enter");
  assert((await getCode(page)).endsWith("\n        "), "second level not indented to 8");
  await page.keyboard.type('return "STRONG"');
  await page.keyboard.press("Enter");
  assert((await getCode(page)).endsWith('return "STRONG"\n        '), "Enter did not keep the indent");
  await page.keyboard.press("Backspace");
  assert((await getCode(page)).endsWith('return "STRONG"\n    '), "Backspace did not remove exactly 4 spaces");
  await page.keyboard.type("els");
  await page.waitForTimeout(400);
  assert((await page.locator(".cm-tooltip-autocomplete").count()) === 0, "an autocomplete popup appeared");
  await page.keyboard.type("e:");
  assert((await getCode(page)).endsWith("\n    else:"), "else: was moved (auto-dedent) or completed");
  await page.keyboard.press("Enter");
  await page.keyboard.type("print(");
  assert((await getCode(page)).endsWith("print("), "a closing bracket was inserted automatically");
  assert((await page.locator(".cm-lineNumbers").isVisible()), "line numbers are not visible");
});

await test("Ctrl+Enter runs; Stop ends an infinite loop and Python restarts", async (page) => {
  await open(page);
  await waitReady(page);
  await setCode(page, 'print("via shortcut")');
  await page.locator(".cm-content").click();
  await page.keyboard.press("Control+Enter");
  await page.getByTestId("output").getByText("via shortcut").waitFor();
  await setCode(page, "while True:\n    pass\n");
  await runButton(page).click();
  await page.getByRole("button", { name: "Stop" }).click();
  await page.getByText("Stopped.").waitFor();
  await waitReady(page);
  await setCode(page, 'print("again")');
  const r = await runAndRead(page);
  assert(r.output === "again\n", `after Stop got ${JSON.stringify(r)}`);
});

// ── 5. Saving and sharing ──
await test("5: share link round-trips byte-identically and fits the limit", async (page, context) => {
  await open(page);
  await setCode(page, PROJECT);
  await page.getByRole("button", { name: "Share link" }).click();
  await page.getByText("Link copied").waitFor();
  const url = await page.getByTestId("share-url").inputValue();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  assert(clip === url, "clipboard does not hold the link");
  assert(new URL(url).hash.startsWith("#c=1"), `unexpected link format ${url.slice(0, 80)}`);
  assert(url.length <= SHARE_URL_LIMIT, `link is ${url.length} chars`);
  const shareUrl = new URL(url);
  console.log(`      share URL for the ${PROJECT.length}-char Semester 1 project: ${url.length} chars (payload ${shareUrl.hash.length - 3})`);
  const fresh = await context.newPage();
  await open(fresh, url);
  assert((await getCode(fresh)) === PROJECT, "code from the link is not byte-identical");
});

await test("5: oversize project is refused, never truncated", async (page, context) => {
  await open(page);
  // ~15 KB that does not compress away (hex digests are close to random).
  const lines = [];
  for (let i = 0; lines.join("\n").length < 15000; i++) {
    const digest = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
    lines.push(`value_${i} = "${digest}"`);
  }
  const big = lines.join("\n") + "\n";
  await setCode(page, big);
  await page.getByRole("button", { name: "Share link" }).click();
  assert((await page.getByTestId("too-big").textContent()) === TOO_BIG_MESSAGE, "refusal message missing or reworded");
  assert((await page.getByTestId("share-url").count()) === 0, "a link was offered anyway");
  // The address bar still holds the whole thing (for refresh), never a cut-down copy.
  await page.getByRole("button", { name: "Close" }).click();
  await page.waitForTimeout(900);
  const fresh = await context.newPage();
  await open(fresh, page.url());
  assert((await getCode(fresh)) === big, "the address-bar copy was truncated");
});

await test("5: autosave restores after a refresh; a link is never overwritten by it", async (page, context) => {
  await open(page);
  const saved = 'print("autosaved")\n';
  await setCode(page, saved);
  await page.waitForTimeout(3000);
  const status = await page.getByTestId("save-status").textContent();
  assert(/^Saved on this computer · \d\d:\d\d$/.test(status), `save status was ${JSON.stringify(status)}`);
  await open(page, PAGE); // no fragment
  assert((await getCode(page)) === saved, "autosave was not restored");
  // Now open a link with different code.
  const linked = 'print("from the link")\n';
  const other = await context.newPage();
  await open(other);
  await setCode(other, linked);
  await other.getByRole("button", { name: "Share link" }).click();
  const url = await other.getByTestId("share-url").inputValue();
  await other.close();
  // That helper tab autosaved its own code as it closed; put ours back.
  await page.evaluate((c) => localStorage.setItem("codeship-python-autosave", JSON.stringify({ code: c, savedAt: Date.now() })), saved);
  const storedCode = () => page.evaluate(() => JSON.parse(localStorage.getItem("codeship-python-autosave")).code);
  // A fresh tab opened from the link...
  const tab = await context.newPage();
  await open(tab, url);
  assert((await getCode(tab)) === linked, "the link's code was replaced by the autosave");
  await tab.waitForTimeout(2500);
  assert((await storedCode()) === saved, "opening a link in a new tab overwrote this computer's autosave");
  // ...and the same link pasted into an already-open tab.
  await open(page, url);
  assert((await getCode(page)) === linked, "pasting the link into an open tab did not load it");
  await page.waitForTimeout(2500);
  assert((await storedCode()) === saved, "pasting a link into an open tab overwrote this computer's autosave");
});

await test("5: download checker.py and open it again (picker and drag-and-drop)", async (page) => {
  await open(page);
  await setCode(page, PROJECT);
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download checker.py" }).click()]);
  assert(download.suggestedFilename() === "checker.py", `downloaded as ${download.suggestedFilename()}`);
  const file = await download.path();
  const bytes = fs.readFileSync(file);
  assert(bytes.equals(Buffer.from(PROJECT, "utf8")), "downloaded file is not byte-identical");

  await setCode(page, "");
  await page.getByTestId("file-input").setInputFiles({ name: "checker.py", mimeType: "text/x-python", buffer: bytes });
  await page.waitForFunction((len) => document.querySelector("[data-testid=editor]").cmView.state.doc.length === len, PROJECT.length);
  assert((await getCode(page)) === PROJECT, "file picker did not restore the file byte-identically");

  page.on("dialog", (d) => d.accept()); // the "replace your code?" confirm
  await setCode(page, 'print("something else")');
  await page.evaluate((text) => {
    const dt = new DataTransfer();
    dt.items.add(new File([text], "checker.py", { type: "text/x-python" }));
    const target = document.querySelector("main");
    for (const type of ["dragenter", "dragover", "drop"]) {
      target.dispatchEvent(new DragEvent(type, { dataTransfer: dt, bubbles: true, cancelable: true }));
    }
  }, bytes.toString("utf8"));
  await page.waitForFunction((len) => document.querySelector("[data-testid=editor]").cmView.state.doc.length === len, PROJECT.length);
  assert((await getCode(page)) === PROJECT, "drag-and-drop did not restore the file byte-identically");
});

await test("layout survives 150% zoom on a Chromebook screen (no sideways scroll)", async (page) => {
  await page.setViewportSize({ width: Math.round(1366 / 1.5), height: Math.round(768 / 1.5) });
  await open(page);
  const { scroll, client } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  assert(scroll <= client, `page scrolls sideways (${scroll} > ${client})`);
  for (const name of ["Run", "Share link", "Clear output"]) {
    assert(await page.getByRole("button", { name }).first().isVisible(), `${name} is not visible`);
  }
  const fontSize = await page.locator(".cm-content").evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  assert(fontSize >= 15, `editor font is ${fontSize}px`);
});

await browser.close();
if (server) process.kill(-server.pid);
console.log(failed ? `\n${failed} failed, ${passed} passed` : `\nAll ${passed} passed`);
process.exit(failed ? 1 : 0);
