/**
 * CODEship HTML Blocks: the Builders (Grades 2 to 3) tag-card page builder.
 * Pure logic, no DOM, so the acceptance tests run it in Node
 * (scripts/htmlblocks/test-html-blocks.mjs). Erasable TypeScript only.
 *
 * Curriculum v1.2 (CEO approved, 2026-11-26). The vocabulary is exactly the
 * Builders curriculum guide (codeship-ops curriculum/text/02_Builders_Gr2-3):
 *   S1 All About Me Page:        <h1>, <p>, <img>, open and close
 *   S2 Weather Helper:           CSS color and font-size
 *   S3 Class Pet Care Guide:     <h2>, <ul>, <li>
 *   S4 Save the Bees:            <a> call-to-action link
 *   Capstone Community Helper:   several pages linked with <a>
 * Do not add tags or CSS properties without a curriculum change.
 *
 * Safety: pictures are built-in robot drawings only (no uploads, so no photos
 * of children). Links go to "#", to the learner's own pages, or to the
 * approved list below (empty until the CEO approves addresses). All typed
 * text is escaped, so nothing a learner types becomes code.
 */

export type Stage = 1 | 2 | 3 | 4 | 5;
export const STAGES: { id: Stage; label: string; project: string }[] = [
  { id: 1, label: "Semester 1", project: "All About Me Page" },
  { id: 2, label: "Semester 2", project: "Weather Helper" },
  { id: 3, label: "Semester 3", project: "Class Pet Care Guide" },
  { id: 4, label: "Semester 4", project: "Save the Bees Awareness Site" },
  { id: 5, label: "Capstone", project: "Community Helper Website" },
];

export type CardKind = "h1" | "h2" | "p" | "img" | "ul" | "li" | "a" | "style";
export type StyleTarget = "body" | "h1" | "h2" | "p" | "li" | "a";

export type Card = {
  id: string;
  kind: CardKind;
  /** Words inside the tag (h1, h2, p, li, a). */
  text?: string;
  /** img: which robot picture. */
  image?: string;
  /** a: where the link goes. */
  href?: string;
  /** ul: its list items (li cards only). */
  items?: Card[];
  /** style: which tag the CSS rule styles, and its two properties. */
  target?: StyleTarget;
  color?: string;
  fontSize?: number;
};

export type Page = { id: string; name: string; file: string; cards: Card[]; styles: Card[] };
export type Project = { kind: "codeship-html-blocks"; version: 1; title: string; stage: Stage; pages: Page[] };

/** Which tag cards each semester uses (each semester keeps the ones before). */
export const CARD_STAGE: Record<CardKind, Stage> = { h1: 1, p: 1, img: 1, style: 2, h2: 3, ul: 3, li: 3, a: 4 };
export const PALETTE_ORDER: CardKind[] = ["h1", "h2", "p", "img", "ul", "li", "a", "style"];
export const paletteFor = (stage: Stage) => PALETTE_ORDER.filter((k) => CARD_STAGE[k] <= stage);

/** Words for the adult ("Pictures and words" mode). */
export const CARD_LABELS: Record<CardKind, string> = {
  h1: "Big heading",
  h2: "Section heading",
  p: "Paragraph",
  img: "Picture",
  ul: "List",
  li: "List item",
  a: "Link",
  style: "Style (CSS)",
};
export const CARD_HELP: Record<CardKind, string> = {
  h1: "The title of the page. The biggest words.",
  h2: "A heading for one part of the page.",
  p: "Sentences. A paragraph of words.",
  img: "A picture. <img> has no closing tag.",
  ul: "A list. Put list items inside it.",
  li: "One thing in a list. It goes inside a list.",
  a: "A link. Click it to go somewhere.",
  style: "CSS: change the colour and size of the words.",
};

/** Tags that never close. */
export const VOID: CardKind[] = ["img"];

// ---------------------------------------------------------------- CSS choices

/** Named CSS colours, with a swatch for "pictures only" mode. */
export const COLOURS: { name: string; hex: string }[] = [
  { name: "black", hex: "#000000" },
  { name: "navy", hex: "#000080" },
  { name: "blue", hex: "#0000FF" },
  { name: "teal", hex: "#008080" },
  { name: "green", hex: "#008000" },
  { name: "purple", hex: "#800080" },
  { name: "red", hex: "#FF0000" },
  { name: "orange", hex: "#FFA500" },
  { name: "gold", hex: "#FFD700" },
  { name: "pink", hex: "#FFC0CB" },
  { name: "white", hex: "#FFFFFF" },
];
export const FONT_SIZES = [16, 20, 24, 32, 40, 48];
export const STYLE_TARGETS: StyleTarget[] = ["body", "h1", "h2", "p", "li", "a"];
/** Style targets taught by a semester (a style card can only style tags the learner has). */
export const targetsFor = (stage: Stage): StyleTarget[] => STYLE_TARGETS.filter((t) => t === "body" || CARD_STAGE[t] <= stage);

// ---------------------------------------------------------------- pictures

const robotSvg = (body: string, head: string, accent: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
  `<rect width="100" height="100" rx="12" fill="#F4F7FB"/>` +
  `<line x1="50" y1="8" x2="50" y2="20" stroke="#586173" stroke-width="4"/><circle cx="50" cy="7" r="5" fill="${accent}"/>` +
  `<rect x="26" y="20" width="48" height="34" rx="10" fill="${head}" stroke="#586173" stroke-width="3"/>` +
  `<circle cx="40" cy="36" r="6" fill="#010F2A"/><circle cx="60" cy="36" r="6" fill="#010F2A"/><circle cx="42" cy="34" r="2" fill="#fff"/><circle cx="62" cy="34" r="2" fill="#fff"/>` +
  `<rect x="40" y="46" width="20" height="4" rx="2" fill="#035762"/>` +
  `<rect x="22" y="57" width="56" height="32" rx="8" fill="${body}" stroke="#586173" stroke-width="3"/><circle cx="50" cy="72" r="7" fill="${accent}"/>` +
  `<rect x="10" y="60" width="10" height="22" rx="5" fill="${head}" stroke="#586173" stroke-width="3"/><rect x="80" y="60" width="10" height="22" rx="5" fill="${head}" stroke="#586173" stroke-width="3"/>` +
  `<rect x="32" y="89" width="12" height="9" rx="3" fill="#586173"/><rect x="56" y="89" width="12" height="9" rx="3" fill="#586173"/>` +
  `</svg>`;

export type Picture = { id: string; file: string; alt: string; svg: string; group: string };

/**
 * The picture bank: the only pictures a page can show. File names are what
 * the HTML text shows. Today it holds the built-in robots only. To add a
 * built-in picture later, add it to this one list (inline SVG, no uploads,
 * no outside links, never photos of children): every card, the saved-file
 * check and the tests read from here.
 */
export const PICTURE_BANK: Picture[] = [
  { group: "Robots", id: "silver", file: "robot-silver.svg", alt: "A silver robot", svg: robotSvg("#9FB0C8", "#B8C4D6", "#D58401") },
  { group: "Robots", id: "gold", file: "robot-gold.svg", alt: "A gold robot", svg: robotSvg("#F0D030", "#F7E37A", "#001432") },
  { group: "Robots", id: "teal", file: "robot-teal.svg", alt: "A teal robot", svg: robotSvg("#0F8C9A", "#5CC3CE", "#F0D030") },
  { group: "Robots", id: "purple", file: "robot-purple.svg", alt: "A purple robot", svg: robotSvg("#7E57C2", "#B39DDB", "#F0D030") },
];
/** The robots (kept for older code and saved files). */
export const ROBOTS = PICTURE_BANK.filter((p) => p.group === "Robots");
export const PICTURE_GROUPS = Array.from(new Set(PICTURE_BANK.map((p) => p.group)));
export const robotById = (id: string | undefined) => PICTURE_BANK.find((r) => r.id === id) ?? PICTURE_BANK[0];

// ---------------------------------------------------------------- word bank

/**
 * The word bank: a way to build a whole page without typing (CEO, 2026-11-27).
 * Short words and sentences for Grades 2 to 3, grouped by topic. Each has a
 * picture from the site's existing artwork (public/art, Fluent Emoji, MIT),
 * so learners who don't read yet can choose by picture. Kinds say which
 * cards a word fits: headings (h1, h2), sentences (p), list items (li) and
 * link words (a). Nothing here is personal: no names, ages, schools or places.
 */
export type WordKind = "heading" | "sentence" | "item" | "link";
export type Word = { text: string; art: string; kinds: WordKind[] };
export type WordTopic = { id: string; name: string; art: string; words: Word[] };

const w = (text: string, art: string, ...kinds: WordKind[]): Word => ({ text, art, kinds });

export const WORD_BANK: WordTopic[] = [
  {
    id: "me",
    name: "About me",
    art: "1f642",
    words: [
      w("All About Me", "1f642", "heading"),
      w("Hello!", "1f44b", "heading", "sentence"),
      w("Things I Like", "2764", "heading"),
      w("I like to learn new things.", "1f4a1", "sentence"),
      w("I am kind and helpful.", "1f44d", "sentence"),
      w("I love to read books.", "1f4da", "sentence"),
      w("I like to draw and paint.", "1f3a8", "sentence"),
      w("Reading", "1f4da", "item"),
      w("Drawing", "1f58d", "item"),
      w("Soccer", "26bd", "item"),
      w("Music", "1f3b5", "item"),
      w("About me", "1f642", "link"),
    ],
  },
  {
    id: "favourites",
    name: "Favourite things",
    art: "2b50",
    words: [
      w("My Favourite Things", "2b50", "heading"),
      w("My favourite food is pizza.", "1f355", "sentence"),
      w("I like to play games with my friends.", "1f3ae", "sentence"),
      w("Rainbows make me happy.", "1f308", "sentence"),
      w("Pizza", "1f355", "item"),
      w("Apples", "1f34e", "item"),
      w("Strawberries", "1f353", "item"),
      w("Cookies", "1f36a", "item"),
      w("Games", "1f3ae", "item"),
      w("Basketball", "1f3c0", "item"),
    ],
  },
  {
    id: "animals",
    name: "Animals",
    art: "1f436",
    words: [
      w("Animals I Love", "1f436", "heading"),
      w("Pet Care", "2764", "heading"),
      w("Food", "1f955", "heading", "item"),
      w("Water", "1f4a6", "heading", "item"),
      w("Pets need food and water every day.", "1f4a6", "sentence"),
      w("Be gentle with animals.", "2764", "sentence"),
      w("Dog", "1f436", "item"),
      w("Cat", "1f431", "item"),
      w("Hamster", "1f439", "item"),
      w("Turtle", "1f422", "item"),
      w("Give fresh water", "1f4a6", "item"),
      w("Clean the cage", "1f9f9", "item"),
      w("Play together", "26bd", "item"),
    ],
  },
  {
    id: "space",
    name: "Space",
    art: "1f680",
    words: [
      w("Space Explorer", "1f680", "heading"),
      w("The Night Sky", "1f319", "heading"),
      w("Rockets fly into space.", "1f680", "sentence"),
      w("The Moon goes around the Earth.", "1f319", "sentence"),
      w("Moon", "1f319", "item"),
      w("Stars", "1f31f", "item"),
      w("Earth", "1f30d", "item"),
      w("Sun", "2600", "item"),
      w("Rocket", "1f680", "item"),
    ],
  },
  {
    id: "robots",
    name: "Robots",
    art: "1f916",
    words: [
      w("My Robot", "1f916", "heading"),
      w("How Robots Help", "1f4a1", "heading"),
      w("Robots follow the code we write.", "2328", "sentence"),
      w("My robot can beep and move.", "1f50a", "sentence"),
      w("Sensors", "1f50d", "item"),
      w("Wheels", "1f699", "item"),
      w("Battery", "1f50b", "item"),
      w("Code", "2328", "item"),
    ],
  },
  {
    id: "helping",
    name: "Helping",
    art: "1f44d",
    words: [
      w("How to Help", "1f44d", "heading"),
      w("Save the Bees", "1f33f", "heading"),
      w("We can all help our community.", "1f44d", "sentence"),
      w("Bees help flowers grow.", "1f33f", "sentence"),
      w("Recycling keeps the Earth clean.", "267b", "sentence"),
      w("Recycle", "267b", "item"),
      w("Plant flowers", "1f331", "item"),
      w("Save water", "1f4a6", "item"),
      w("Be kind", "2764", "item"),
      w("Learn more", "1f50e", "link"),
      w("How to help", "1f44d", "link"),
      w("Read more", "1f4da", "link"),
    ],
  },
];

/** Which kind of word fits a card. */
export const wordKindFor = (kind: CardKind): WordKind | null =>
  kind === "h1" || kind === "h2" ? "heading" : kind === "p" ? "sentence" : kind === "li" ? "item" : kind === "a" ? "link" : null;

/** The topics, each with only the words that fit this card. */
export function wordsFor(kind: CardKind): WordTopic[] {
  const k = wordKindFor(kind);
  if (!k) return [];
  return WORD_BANK.map((t) => ({ ...t, words: t.words.filter((x) => x.kinds.includes(k)) })).filter((t) => t.words.length);
}

/**
 * Put a tapped word on a card. Paragraphs add the sentence to the end (so a
 * learner can build two facts); everything else is replaced. The starter text
 * is always replaced. Never longer than MAX_TEXT.
 */
export function applyWord(card: Card, word: string): string {
  const starter = card.kind === "p" ? newCard("p").text : null;
  const current = (card.text ?? "").trim();
  if (card.kind !== "p" || !current || current === starter) return word.slice(0, MAX_TEXT);
  const joined = `${current} ${word}`;
  return joined.length <= MAX_TEXT ? joined : current;
}
export const robotDataUrl = (id: string | undefined) => `data:image/svg+xml;utf8,${encodeURIComponent(robotById(id).svg)}`;

// ---------------------------------------------------------------- links

/**
 * Outside web addresses a link may use. Empty on purpose: add an address
 * here only after the CEO approves it.
 */
export const ALLOWED_LINKS: { href: string; label: string }[] = [];

/** Where a link on this page may point: "#", the project's own pages, or an approved address. */
export function linkTargets(project: Project): { href: string; label: string }[] {
  const own = project.stage === 5 ? project.pages.map((p) => ({ href: p.file, label: `${p.name} page` })) : [];
  return [{ href: "#", label: "Nowhere yet (#)" }, ...own, ...ALLOWED_LINKS];
}

// ---------------------------------------------------------------- making cards and projects

let counter = 0;
export const newId = () => `c${Date.now().toString(36)}${(counter++).toString(36)}`;

export const MAX_TEXT = 120;

export function newCard(kind: CardKind, stage: Stage = 5): Card {
  const id = newId();
  switch (kind) {
    case "h1":
      return { id, kind, text: "My page" };
    case "h2":
      return { id, kind, text: "A new section" };
    case "p":
      return { id, kind, text: "Write a sentence here." };
    case "img":
      return { id, kind, image: ROBOTS[0].id };
    case "ul":
      return { id, kind, items: [] };
    case "li":
      return { id, kind, text: "A list item" };
    case "a":
      return { id, kind, text: "Learn more", href: "#" };
    case "style":
      return { id, kind, target: targetsFor(stage).includes("h1") ? "h1" : "body", color: "blue", fontSize: 32 };
  }
}

const CAPSTONE_PAGES = [
  { name: "Home", file: "index.html" },
  { name: "About", file: "about.html" },
  { name: "How to Help", file: "help.html" },
];

export function newPage(name: string, file: string, cards: Card[] = []): Page {
  return { id: newId(), name, file, cards, styles: [] };
}

/** A fresh project for a semester: a heading to start from (capstone: three pages). */
export function starterProject(stage: Stage = 1): Project {
  const title = STAGES.find((s) => s.id === stage)!.project;
  const pages =
    stage === 5
      ? CAPSTONE_PAGES.map((p) => newPage(p.name, p.file, [{ ...newCard("h1"), text: p.name }]))
      : [newPage("Home", "index.html", [{ ...newCard("h1"), text: title }])];
  return { kind: "codeship-html-blocks", version: 1, title, stage, pages };
}

export const MAX_PAGES = 5;
/** Capstone extension: "add a fourth page". */
export function addPage(project: Project): Project {
  if (project.stage !== 5 || project.pages.length >= MAX_PAGES) return project;
  const n = project.pages.length + 1;
  let file = `page${n}.html`;
  while (project.pages.some((p) => p.file === file)) file = `page${n}-${newId()}.html`;
  return { ...project, pages: [...project.pages, newPage(`Page ${n}`, file, [{ ...newCard("h1"), text: `Page ${n}` }])] };
}

// ---------------------------------------------------------------- placing cards

export type Drop = { ok: true; page: Page } | { ok: false; page: Page; message: string };

/**
 * Put a card on the page at `index` (end if omitted). A list item goes into
 * the list `intoList` (or the last list on the page); a style card goes into
 * the page's <style>. Returns a message instead when the card can't go there.
 */
export function placeCard(page: Page, card: Card, index?: number, intoList?: string): Drop {
  if (card.kind === "style") {
    const styles = [...page.styles];
    styles.splice(index ?? styles.length, 0, card);
    return { ok: true, page: { ...page, styles } };
  }
  if (card.kind === "li") {
    const lists = page.cards.filter((c) => c.kind === "ul");
    const list = (intoList && lists.find((c) => c.id === intoList)) || lists[lists.length - 1];
    if (!list) return { ok: false, page, message: "A list item lives inside a list. Add a List card first, then put the item inside it." };
    const items = [...(list.items ?? [])];
    items.splice(intoList === list.id && index !== undefined ? index : items.length, 0, card);
    return { ok: true, page: { ...page, cards: page.cards.map((c) => (c.id === list.id ? { ...c, items } : c)) } };
  }
  const cards = [...page.cards];
  cards.splice(Math.max(0, Math.min(index ?? cards.length, cards.length)), 0, card);
  return { ok: true, page: { ...page, cards } };
}

/** Take a card (anywhere on the page) off it. Returns the page and the card, or null. */
export function takeCard(page: Page, id: string): { page: Page; card: Card } | null {
  const s = page.styles.find((c) => c.id === id);
  if (s) return { page: { ...page, styles: page.styles.filter((c) => c.id !== id) }, card: s };
  const top = page.cards.find((c) => c.id === id);
  if (top) return { page: { ...page, cards: page.cards.filter((c) => c.id !== id) }, card: top };
  for (const list of page.cards) {
    const item = list.items?.find((c) => c.id === id);
    if (item) return { page: { ...page, cards: page.cards.map((c) => (c.id === list.id ? { ...c, items: c.items!.filter((x) => x.id !== id) } : c)) }, card: item };
  }
  return null;
}

/**
 * Move a card one place up (-1) or down (+1). A list item at the top or
 * bottom of its list moves into the list before or after it, so items can
 * change lists by tapping or with the keyboard, not only by dragging. A list
 * item never leaves a list (that would not be HTML); the message says so.
 */
export function moveCard(page: Page, id: string, by: -1 | 1): Drop {
  const lists = page.cards.filter((c) => c.kind === "ul");
  const li = lists.findIndex((l) => l.items?.some((x) => x.id === id));
  if (li >= 0) {
    const items = lists[li].items!;
    const i = items.findIndex((x) => x.id === id);
    const atEdge = by < 0 ? i === 0 : i === items.length - 1;
    if (atEdge) {
      const other = lists[li + by];
      if (!other) return { ok: false, page, message: "A list item stays inside a list. To take it off the page, press its x." };
      const taken = takeCard(page, id)!;
      const r = placeCard(taken.page, taken.card, by < 0 ? other.items?.length ?? 0 : 0, other.id);
      return r;
    }
  }
  return { ok: true, page: nudgeCard(page, id, by) };
}

/** Move a card one place up (-1) or down (+1) within its own list. */
export function nudgeCard(page: Page, id: string, by: -1 | 1): Page {
  const move = (arr: Card[]) => {
    const i = arr.findIndex((c) => c.id === id);
    if (i < 0) return null;
    const j = i + by;
    if (j < 0 || j >= arr.length) return arr;
    const next = [...arr];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  };
  const styles = move(page.styles);
  if (styles) return { ...page, styles };
  const cards = move(page.cards);
  if (cards) return { ...page, cards };
  return { ...page, cards: page.cards.map((c) => (c.items ? { ...c, items: move(c.items) ?? c.items } : c)) };
}

export function updateCard(page: Page, id: string, patch: Partial<Card>): Page {
  const fix = (c: Card): Card => (c.id === id ? clean({ ...c, ...patch, id: c.id, kind: c.kind }) : c.items ? { ...c, items: c.items.map(fix) } : c);
  return { ...page, cards: page.cards.map(fix), styles: page.styles.map(fix) };
}

// ---------------------------------------------------------------- readability

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
/** WCAG contrast ratio between two #RRGGBB colours (1 to 21). */
export function contrastRatio(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
/** The page background: Builders pages never change it, so it is always white. */
export const PAGE_BACKGROUND = "#FFFFFF";

/**
 * A gentle note when a style card's text colour is hard to read on the page
 * (WCAG: 4.5 to 1 for normal text, 3 to 1 for big text). Null when it reads well.
 */
export function readabilityWarning(card: Card): string | null {
  const col = COLOURS.find((c) => c.name === card.color);
  if (card.kind !== "style" || !col) return null;
  const big = card.target === "h1" || card.target === "h2" || (card.fontSize ?? 16) >= 24;
  if (contrastRatio(col.hex, PAGE_BACKGROUND) >= (big ? 3 : 4.5)) return null;
  return `${col.name[0].toUpperCase()}${col.name.slice(1)} words on a white page are hard to read. Try a darker colour${big ? "" : " or bigger words"}.`;
}

// ---------------------------------------------------------------- HTML out

export const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const safeText = (s: string | undefined) => escapeHtml(String(s ?? "").slice(0, MAX_TEXT));

/** Only "#", the project's own page files and approved addresses survive. */
export function safeHref(project: Project, href: string | undefined): string {
  return linkTargets(project).some((t) => t.href === href) ? String(href) : "#";
}

export type HtmlOptions = {
  /** "preview": pictures as data URLs, for the live preview and downloads. "text": file names, for reading. */
  images: "text" | "preview";
};

/** The page as a complete HTML document, two-space indented. */
export function pageHtml(project: Project, page: Page, opts: HtmlOptions = { images: "text" }): string {
  const lines: string[] = ["<!DOCTYPE html>", "<html>", "<head>", `  <title>${safeText(page.name === "Home" ? project.title : `${project.title}: ${page.name}`)}</title>`];
  const rules = page.styles.filter((s) => s.target && (s.color || s.fontSize));
  if (rules.length) {
    lines.push("  <style>");
    for (const r of rules) {
      lines.push(`    ${r.target} {`);
      if (r.color && COLOURS.some((c) => c.name === r.color)) lines.push(`      color: ${r.color};`);
      if (r.fontSize && FONT_SIZES.includes(r.fontSize)) lines.push(`      font-size: ${r.fontSize}px;`);
      lines.push("    }");
    }
    lines.push("  </style>");
  }
  lines.push("</head>", "<body>");
  for (const c of page.cards) {
    switch (c.kind) {
      case "h1":
      case "h2":
      case "p":
        lines.push(`  <${c.kind}>${safeText(c.text)}</${c.kind}>`);
        break;
      case "img": {
        const r = robotById(c.image);
        lines.push(`  <img src="${opts.images === "preview" ? robotDataUrl(r.id) : r.file}" alt="${escapeHtml(r.alt)}">`);
        break;
      }
      case "a":
        lines.push(`  <a href="${escapeHtml(safeHref(project, c.href))}">${safeText(c.text)}</a>`);
        break;
      case "ul":
        lines.push("  <ul>");
        for (const li of c.items ?? []) lines.push(`    <li>${safeText(li.text)}</li>`);
        lines.push("  </ul>");
        break;
    }
  }
  lines.push("</body>", "</html>");
  return lines.join("\n");
}

/** Extra CSS for the live preview only (so robots are a sensible size); never shown in the code. */
export const PREVIEW_CSS = "img{width:140px;height:140px}body{font-family:system-ui,sans-serif;margin:16px;line-height:1.35}";

// ---------------------------------------------------------------- saved files

const KINDS = new Set<CardKind>(["h1", "h2", "p", "img", "ul", "li", "a", "style"]);

function clean(c: Card): Card {
  const out: Card = { id: String(c.id || newId()), kind: c.kind };
  if (["h1", "h2", "p", "li", "a"].includes(c.kind)) out.text = String(c.text ?? "").slice(0, MAX_TEXT);
  if (c.kind === "img") out.image = robotById(c.image).id;
  if (c.kind === "a") out.href = String(c.href ?? "#");
  if (c.kind === "ul") out.items = (Array.isArray(c.items) ? c.items : []).filter((x) => x && x.kind === "li").map(clean);
  if (c.kind === "style") {
    out.target = STYLE_TARGETS.includes(c.target as StyleTarget) ? c.target : "body";
    if (COLOURS.some((x) => x.name === c.color)) out.color = c.color;
    if (FONT_SIZES.includes(Number(c.fontSize))) out.fontSize = Number(c.fontSize);
  }
  return out;
}

/** Reads a saved project (autosave or file). Anything unexpected is dropped; returns null if it isn't one. */
export function parseProject(raw: unknown): Project | null {
  const p = raw as Partial<Project> | null;
  if (!p || p.kind !== "codeship-html-blocks" || !Array.isArray(p.pages) || !p.pages.length) return null;
  const stage = ([1, 2, 3, 4, 5] as Stage[]).includes(p.stage as Stage) ? (p.stage as Stage) : 1;
  const pages = p.pages.slice(0, MAX_PAGES).map((pg, i) => {
    const cards = (Array.isArray(pg?.cards) ? pg.cards : []).filter((c) => c && KINDS.has(c.kind) && c.kind !== "li" && c.kind !== "style").map(clean);
    const styles = (Array.isArray(pg?.styles) ? pg.styles : []).filter((c) => c && c.kind === "style").map(clean);
    const file = /^[a-z0-9-]+\.html$/.test(String(pg?.file)) ? String(pg.file) : i === 0 ? "index.html" : `page${i + 1}.html`;
    return { id: String(pg?.id || newId()), name: String(pg?.name || `Page ${i + 1}`).slice(0, 30), file, cards, styles };
  });
  return { kind: "codeship-html-blocks", version: 1, title: String(p.title || "My website").slice(0, 60), stage, pages };
}
