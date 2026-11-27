// Acceptance tests for /tools/html-blocks (the Builders tag-card page builder):
// the vocabulary matches the Builders curriculum guide, the HTML is right and
// safe, and saved files are cleaned on the way in. No browser.
//   npm run test:html-blocks
import "../blocks/ts-resolve.mjs";
const M = await import("../../src/components/tools/htmlblocks/model.ts");

let failed = 0, passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`ok    ${name}`); }
  catch (e) { failed++; console.log(`FAIL  ${name}\n      ${e.message}`); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const eq = (a, b, what) => assert(JSON.stringify(a) === JSON.stringify(b), `${what}: got ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`);
const card = (kind, patch = {}) => ({ ...M.newCard(kind), ...patch });

test("palette per semester matches the Builders curriculum guide (S1 h1/p/img, S2 CSS, S3 h2/ul/li, S4 a)", () => {
  eq(M.paletteFor(1), ["h1", "p", "img"], "S1");
  eq(M.paletteFor(2), ["h1", "p", "img", "style"], "S2");
  eq(M.paletteFor(3), ["h1", "h2", "p", "img", "ul", "li", "style"], "S3");
  eq(M.paletteFor(4), ["h1", "h2", "p", "img", "ul", "li", "a", "style"], "S4");
  eq(M.paletteFor(5), M.paletteFor(4), "Capstone uses everything");
  eq(M.STAGES.map((s) => s.project), ["All About Me Page", "Weather Helper", "Class Pet Care Guide", "Save the Bees Awareness Site", "Community Helper Website"], "project names");
});

test("S1 All About Me page: heading, paragraph and robot picture make the right HTML", () => {
  let p = M.starterProject(1);
  let page = p.pages[0];
  page = M.placeCard(page, card("p", { text: "I like robots and soccer." })).page;
  page = M.placeCard(page, card("img", { image: "gold" })).page;
  const html = M.pageHtml(p, page);
  assert(html.includes("<h1>All About Me Page</h1>"), html);
  assert(html.includes("  <p>I like robots and soccer.</p>"), html);
  assert(html.includes('<img src="robot-gold.svg" alt="A gold robot">'), html);
  assert(!/<\/img>/.test(html), "img must not close");
  assert(html.startsWith("<!DOCTYPE html>\n<html>\n<head>") && html.endsWith("</body>\n</html>"), "document shape");
  assert(!html.includes("<style>"), "no empty style");
});

test("S2 CSS: style cards become color and font-size rules in <style>", () => {
  const p = M.starterProject(2);
  const page = M.placeCard(p.pages[0], card("style", { target: "h1", color: "blue", fontSize: 40 })).page;
  const html = M.pageHtml(p, page);
  assert(html.includes("  <style>\n    h1 {\n      color: blue;\n      font-size: 40px;\n    }\n  </style>"), html);
});

test("S3 lists: list items go inside a list; a list item with no list is refused with a message", () => {
  const p = M.starterProject(3);
  const lonely = M.placeCard(p.pages[0], card("li"));
  assert(!lonely.ok && /inside a list/.test(lonely.message), "lonely li allowed");
  let page = M.placeCard(p.pages[0], card("h2", { text: "Food" })).page;
  page = M.placeCard(page, card("ul")).page;
  page = M.placeCard(page, card("li", { text: "Pellets" })).page;
  page = M.placeCard(page, card("li", { text: "Fresh hay" })).page;
  const html = M.pageHtml(p, page);
  assert(html.includes("  <h2>Food</h2>\n  <ul>\n    <li>Pellets</li>\n    <li>Fresh hay</li>\n  </ul>"), html);
});

test("S4 links: only # unless the CEO approves addresses; outside addresses are replaced by #", () => {
  eq(M.ALLOWED_LINKS, [], "approved outside links (none until approved)");
  const p = M.starterProject(4);
  eq(M.linkTargets(p).map((t) => t.href), ["#"], "S4 link targets");
  const page = M.placeCard(p.pages[0], card("a", { text: "Help the bees", href: "https://example.com" })).page;
  assert(M.pageHtml(p, page).includes('<a href="#">Help the bees</a>'), "outside link not blocked");
});

test("Capstone: Home, About and How to Help pages link to each other", () => {
  const p = M.starterProject(5);
  eq(p.pages.map((x) => x.file), ["index.html", "about.html", "help.html"], "pages");
  eq(M.linkTargets(p).map((t) => t.href), ["#", "index.html", "about.html", "help.html"], "link targets");
  const page = M.placeCard(p.pages[0], card("a", { text: "About us", href: "about.html" })).page;
  assert(M.pageHtml(p, page).includes('<a href="about.html">About us</a>'), "page link");
  const four = M.addPage(p);
  assert(four.pages.length === 4 && four.pages[3].file === "thank-you.html" && four.pages[3].name === "Thank You", "the fourth page is a Thank You page");
  const five = M.addPage(four);
  assert(five.pages.length === 5 && five.pages[4].file === "page5.html", "a fifth page");
  assert(M.addPage(M.starterProject(4)).pages.length === 1, "only the capstone has several pages");
});

test("typed text is escaped: nothing a learner types becomes code", () => {
  const p = M.starterProject(1);
  const page = M.placeCard(p.pages[0], card("p", { text: '<script>alert(1)</script> & "hi"' })).page;
  const html = M.pageHtml(p, page);
  assert(!html.includes("<script>") && html.includes("&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;hi&quot;"), html);
  const long = M.placeCard(p.pages[0], card("p", { text: "x".repeat(500) })).page;
  assert(!M.pageHtml(p, long).includes("x".repeat(M.MAX_TEXT + 1)), "text not capped");
});

test("pictures are built-in robots only: an unknown picture or an uploaded address becomes a robot", () => {
  const p = M.starterProject(1);
  const page = M.placeCard(p.pages[0], card("img", { image: "data:image/png;base64,AAAA" })).page;
  const html = M.pageHtml(p, page, { images: "preview" });
  assert(/<img src="data:image\/svg\+xml;utf8,/.test(html) && !html.includes("base64"), "non-robot image got through");
  assert(M.ROBOTS.every((r) => r.file.startsWith("robot-") && r.svg.startsWith("<svg")), "robot files");
});

test("moving cards: up/down and take/put keep every card", () => {
  const p = M.starterProject(1);
  let page = M.placeCard(p.pages[0], card("p", { text: "one" })).page;
  page = M.placeCard(page, card("p", { text: "two" })).page;
  const [h1, a, b] = page.cards.map((c) => c.id);
  page = M.nudgeCard(page, b, -1);
  eq(page.cards.map((c) => c.id), [h1, b, a], "nudge up");
  const t = M.takeCard(page, h1);
  page = M.placeCard(t.page, t.card).page;
  eq(page.cards.map((c) => c.id), [b, a, h1], "take and put at the end");
  page = M.updateCard(page, a, { text: "ONE" });
  assert(page.cards.find((c) => c.id === a).text === "ONE", "update");
});

test("saved files are cleaned: unknown tags, bad colours, sizes and file names are dropped", () => {
  const bad = {
    kind: "codeship-html-blocks", version: 1, title: "T", stage: 9,
    pages: [{ id: "x", name: "Home", file: "../../etc.html", cards: [{ id: "1", kind: "script", text: "x" }, { id: "2", kind: "ul", items: [{ id: "3", kind: "p" }, { id: "4", kind: "li", text: "ok" }] }], styles: [{ id: "5", kind: "style", target: "div", color: "url(x)", fontSize: 999 }] }],
  };
  const p = M.parseProject(bad);
  eq(p.stage, 1, "stage");
  eq(p.pages[0].file, "index.html", "file name");
  eq(p.pages[0].cards.map((c) => c.kind), ["ul"], "cards");
  eq(p.pages[0].cards[0].items.map((c) => c.kind), ["li"], "list items");
  eq(p.pages[0].styles[0], { id: "5", kind: "style", target: "body" }, "style");
  assert(M.parseProject({ kind: "something-else", pages: [] }) === null, "accepted a non-project");
  const round = M.starterProject(5);
  eq(M.parseProject(JSON.parse(JSON.stringify(round))), round, "round trip");
});

test("list items move between lists with up/down (tap and keyboard), and never leave a list", () => {
  const p = M.starterProject(3);
  let page = M.placeCard(p.pages[0], card("ul")).page;
  page = M.placeCard(page, card("li", { text: "a" })).page;
  page = M.placeCard(page, card("ul")).page;
  page = M.placeCard(page, card("li", { text: "b" })).page;
  const [l1, l2] = page.cards.filter((c) => c.kind === "ul");
  const a = l1.items[0].id;
  let r = M.moveCard(page, a, 1);
  assert(r.ok, r.message);
  eq(r.page.cards.filter((c) => c.kind === "ul").map((l) => l.items.map((x) => x.text)), [[], ["a", "b"]], "moved down into the next list");
  r = M.moveCard(r.page, a, -1);
  eq(r.page.cards.filter((c) => c.kind === "ul").map((l) => l.items.map((x) => x.text)), [["a"], ["b"]], "moved back up");
  const stuck = M.moveCard(r.page, a, -1);
  assert(!stuck.ok && /stays inside a list/.test(stuck.message), "left the list");
  assert(l2.id, "second list");
});

test("readability: a gentle warning for colours that are hard to read on the white page", () => {
  assert(M.readabilityWarning(card("style", { target: "p", color: "gold", fontSize: 16 })), "gold paragraph not warned");
  assert(M.readabilityWarning(card("style", { target: "h1", color: "pink", fontSize: 40 })), "pink heading not warned");
  assert(!M.readabilityWarning(card("style", { target: "p", color: "navy", fontSize: 16 })), "navy warned");
  assert(!M.readabilityWarning(card("style", { target: "h1", color: "red", fontSize: 40 })), "big red heading warned (3:1 is enough for big text)");
  assert(M.readabilityWarning(card("style", { target: "p", color: "red", fontSize: 16 })), "small red text not warned (4.5:1)");
  assert(Math.abs(M.contrastRatio("#000000", "#FFFFFF") - 21) < 0.01, "contrast maths");
});

// ── Non-typing path (CEO, 2026-11-27): word bank and picture bank ──
const fs = await import("node:fs");
// Pictures that must never be used as cues or page pictures: people, faces, hands.
const NOT_ALLOWED_ART = new Set(["1f466", "1f467", "1f476", "1f9d2", "1f9d1-200d-1f680", "1f9d1-200d-2708", "1f575", "1f937", "1f600", "1f604", "1f60e", "1f621", "1f622", "1f634", "1f635-200d-1f4ab", "1f642", "1f914", "1f973", "1f9d0", "1f648", "1f44b", "1f44d", "1f44e", "1f446"]);
const artExists = (code) => fs.existsSync(new URL(`../../public/art/${code}.webp`, import.meta.url));

test("word bank: at least 12 topics (the first 6 kept), each with 5+ headings, 10+ sentences, 15+ list items and link words", () => {
  assert(M.WORD_BANK.length >= 12, `${M.WORD_BANK.length} topics`);
  eq(M.WORD_BANK.slice(0, 6).map((t) => t.name), ["About me", "Favourite things", "Animals", "Space", "Robots", "Helping"], "first six topics");
  for (const t of M.WORD_BANK) {
    const n = (k) => t.words.filter((x) => x.kinds.includes(k)).length;
    assert(n("heading") >= 5 && n("sentence") >= 10 && n("item") >= 15 && n("link") >= 2, `${t.name}: ${n("heading")} headings, ${n("sentence")} sentences, ${n("item")} items, ${n("link")} links`);
  }
});
test("word bank: every picture exists in public/art and none shows a person, face or hand", () => {
  for (const t of M.WORD_BANK) for (const art of [t.art, ...t.words.map((x) => x.art)]) {
    assert(artExists(art), `${t.id}: no picture ${art}`);
    assert(!NOT_ALLOWED_ART.has(art), `${t.id}: picture ${art} shows a person, face or hand`);
  }
});
test("word bank: Grade 2-3 text, Canadian spelling, nothing personal, short sentences", () => {
  for (const t of M.WORD_BANK) for (const x of t.words) {
    assert(x.kinds.length === 1 && x.text.length <= 60, `${x.text}: bad entry`);
    assert(!/\b(color|favorite|neighbor|center|theater|gray)\b/i.test(x.text), `${x.text}: not Canadian spelling`);
    assert(!/\d|@|\bstreet\b|\broad\b|my name|years old|\bgrade\b/i.test(x.text), `${x.text}: looks personal`);
    assert(!/clap/i.test(x.text), `${x.text}: clap`);
    if (x.kinds[0] === "sentence") assert(x.text.split(/\s+/).length <= 10, `${x.text}: sentence too long`);
  }
  for (const kind of ["h1", "h2", "p", "li", "a"]) assert(M.wordsFor(kind).reduce((n, t) => n + t.words.length, 0) >= 30, `${kind}: too few words`);
  eq(M.wordsFor("img"), [], "no words for pictures");
  eq(M.wordsFor("style"), [], "no words for style");
});
test("word bank: the capstone page words are there (Home, About, How to Help, Thank you)", () => {
  const site = M.WORD_BANK.find((t) => t.id === "website");
  const has = (kind, text) => site.words.some((x) => x.kinds[0] === kind && x.text === text);
  for (const h of ["Home", "About", "How to Help", "Thank You!"]) assert(has("heading", h), `heading ${h}`);
  for (const l of ["Home", "About", "How to Help", "Thank you"]) assert(has("link", l), `link ${l}`);
  assert(!site.words.some((x) => /contact|email|phone/i.test(x.text)), "contact words");
});
test("word bank: every topic tab has its own picture", () => {
  const arts = M.WORD_BANK.map((t) => t.art);
  eq(new Set(arts).size, arts.length, "topic pictures");
});
test("word bank: no two words of the same kind in one topic share a picture", () => {
  for (const t of M.WORD_BANK) for (const kind of ["heading", "sentence", "item", "link"]) {
    const arts = t.words.filter((x) => x.kinds.includes(kind)).map((x) => x.art);
    const dup = arts.find((a, i) => arts.indexOf(a) !== i);
    assert(!dup, `${t.name} ${kind}s share picture ${dup}`);
  }
});
test("word bank: tapping fills a card; paragraph sentences add up (two facts), within the length limit", () => {
  eq(M.applyWord(card("h1", { text: "My page" }), "All About Me"), "All About Me", "heading replaced");
  const p = card("p");
  const one = M.applyWord(p, "I love to read books.");
  eq(one, "I love to read books.", "starter text replaced");
  eq(M.applyWord({ ...p, text: one }, "I am kind and helpful."), "I love to read books. I am kind and helpful.", "second fact added");
  const full = "x".repeat(M.MAX_TEXT - 3);
  eq(M.applyWord({ ...p, text: full }, "I like to draw and paint."), full, "never over the limit");
});
test("a whole S4 page can be built from the banks alone, with no typing", () => {
  const p = M.starterProject(4);
  let page = p.pages[0];
  const pick = (kind, topic, i = 0) => M.wordsFor(kind).find((t) => t.id === topic).words[i].text;
  page = M.updateCard(page, page.cards[0].id, { text: M.applyWord(page.cards[0], pick("h1", "helping", 1)) });
  const para = card("p");
  page = M.placeCard(page, { ...para, text: M.applyWord(para, pick("p", "helping", 1)) }).page;
  page = M.placeCard(page, card("img", { image: M.PICTURE_BANK[1].id })).page;
  page = M.placeCard(page, card("ul")).page;
  page = M.placeCard(page, { ...card("li"), text: pick("li", "helping", 1) }).page;
  page = M.placeCard(page, { ...card("a"), text: pick("a", "helping", 0) }).page;
  const html = M.pageHtml(p, page);
  for (const want of ["<h1>Plant Flowers for Bees</h1>", "<p>Flowers help bees.</p>", "<img src=", "<li>Plant flowers</li>", '<a href="#">How to help</a>']) assert(html.includes(want), `${want} missing:\n${html}`);
});
test("picture bank: 100+ built-in pictures in five categories, robots kept, every file exists, no repeats", () => {
  assert(M.PICTURE_BANK.length >= 100, `${M.PICTURE_BANK.length} pictures`);
  eq(M.PICTURE_GROUPS, ["Objects", "Animals", "Toys", "Structures", "Places"], "categories");
  for (const g of M.PICTURE_GROUPS) assert(M.PICTURE_BANK.filter((x) => x.group === g).length >= 10, `${g}: too few pictures`);
  assert(M.PICTURE_BANK.every((x) => M.PICTURE_GROUPS.includes(x.group)), "a picture outside the five categories");
  eq(M.ROBOTS.map((x) => x.id), ["silver", "gold", "teal", "purple"], "the four robots are kept");
  eq(new Set(M.PICTURE_BANK.map((x) => x.id)).size, M.PICTURE_BANK.length, "unique ids");
  const arts = M.PICTURE_BANK.filter((x) => x.art).map((x) => x.art);
  eq(new Set(arts).size, arts.length, "each artwork file used once");
  for (const x of M.PICTURE_BANK) {
    assert(/^[a-z0-9-]+\.(svg|webp)$/.test(x.file) && x.alt.length > 2, `${x.id}: bad file name or alt text`);
    if (x.svg) assert(x.svg.startsWith("<svg") && !/https?:|href=/.test(x.svg.replace('xmlns="http://www.w3.org/2000/svg"', "")), `${x.id}: not a built-in picture`);
    else assert(artExists(x.art) && !NOT_ALLOWED_ART.has(x.art), `${x.id}: missing or not allowed (${x.art})`);
    assert(/^(data:image\/svg\+xml|\/art\/)/.test(M.pictureSrc(x.id)), `${x.id}: loads from outside`);
  }
  for (const g of M.PICTURE_GROUPS) assert(M.PICTURE_BANK.some((x) => x.id === M.PICTURE_GROUP_ICON[g]), `${g}: no tab picture`);
  const notice = fs.readFileSync(new URL("../../THIRD_PARTY_NOTICES.md", import.meta.url), "utf8");
  assert(/fluentui-emoji/.test(notice) && /MIT License/.test(notice), "licence and source not recorded");
});
test("picture bank: an artwork picture makes the right HTML, and saved files keep it", () => {
  const p = M.starterProject(1);
  const page = M.placeCard(p.pages[0], card("img", { image: "dog" })).page;
  assert(M.pageHtml(p, page).includes('<img src="dog.webp" alt="A dog">'), M.pageHtml(p, page));
  assert(M.pageHtml(p, page, { images: "preview" }).includes('<img src="/art/1f415.webp" alt="A dog">'), "preview src");
  eq(M.parseProject(JSON.parse(JSON.stringify({ ...p, pages: [page] }))).pages[0].cards[1].image, "dog", "saved picture");
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
