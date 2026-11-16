/**
 * App Studio — Semester 3 (App Development): Build Your Own App.
 *
 * An app is plain data (components + variables). The studio previews it live,
 * and `generateScript` turns the same data into readable JavaScript so
 * students can see — and download — the real code behind what they built.
 */

export type VarType = "number" | "text" | "list";

export interface AppVar {
  name: string;
  type: VarType;
  /** Stored as a string; numbers are parsed, lists start empty. */
  initial: string;
}

export type Action =
  | { kind: "change"; var: string; amount: number }
  | { kind: "set"; var: string; value: string }
  | { kind: "random"; var: string; min: number; max: number }
  | { kind: "addToList"; list: string; from: string }
  | { kind: "clearList"; list: string }
  | { kind: "toast"; text: string };

export type Op = ">=" | ">" | "<" | "<=" | "==" | "!=";
export const OPS: Op[] = [">=", ">", "<", "<=", "==", "!="];

export interface Condition {
  var: string;
  op: Op;
  value: string;
}

export type CompType = "heading" | "text" | "emoji" | "button" | "input" | "list" | "progress" | "divider";

export interface Comp {
  id: string;
  type: CompType;
  text?: string;
  size?: "s" | "m" | "l";
  align?: "left" | "center";
  variant?: "solid" | "outline";
  actions?: Action[];
  /** Bound variable: input → text var, list → list var, progress → number var. */
  var?: string;
  max?: number;
  showIf?: Condition | null;
}

export interface AppProject {
  id: string;
  name: string;
  icon: string;
  theme: string;
  dark: boolean;
  vars: AppVar[];
  comps: Comp[];
  missionId?: string;
  doneGoals: string[];
  createdAt: number;
  updatedAt: number;
}

export type State = Record<string, number | string | string[]>;

export const THEMES = ["#3F51B5", "#7C3AED", "#EC4899", "#EF4444", "#F59E0B", "#10B981", "#0EA5E9", "#2E3246"];

export const EMOJIS = [
  "🐶", "🐱", "🐣", "🦄", "🐉", "🐢", "🦊", "🐼", "🍕", "🍪", "🍩", "🍓", "⚽", "🏀", "🎮", "🎲",
  "🎨", "🎵", "🚀", "🌈", "⭐", "🔥", "💎", "🌱", "🌍", "📚", "📓", "✏️", "😀", "😎", "🥳", "😴",
  "😢", "😡", "❤️", "👍", "🏆", "🎯", "⏰", "☀️", "🌙", "🤖", "👾", "🍔", "🧁", "🎁",
];

const RESERVED = new Set(
  "break case catch class const continue debugger default delete do else export extends false finally for function if import in instanceof let new null return super switch this throw true try typeof var void while with yield render screen appRoot document window app clearScreen add addTitle addText addPicture addButton addTextBox addList addMeter addDivider randomNumber showMessage focusKey".split(
    " "
  )
);

/** Turn anything a kid types into a safe, readable JS variable name. */
export function toIdentifier(raw: string) {
  const words = raw
    .replace(/[^A-Za-z0-9 _]/g, " ")
    .trim()
    .split(/[\s_]+/)
    .filter(Boolean);
  let id = words.map((w, i) => (i === 0 ? w.charAt(0).toLowerCase() + w.slice(1) : w.charAt(0).toUpperCase() + w.slice(1))).join("");
  if (!id) return "";
  if (/^\d/.test(id)) id = "n" + id;
  if (RESERVED.has(id)) id = id + "Value";
  return id.slice(0, 24);
}

export const isIdentifier = (s: string) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(s) && !RESERVED.has(s);

let idCounter = 0;
export function uid(prefix = "c") {
  idCounter++;
  return `${prefix}${Date.now().toString(36)}${idCounter.toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

export function newComp(type: CompType, app: AppProject): Comp {
  const firstVar = (t: VarType) => app.vars.find((v) => v.type === t)?.name;
  switch (type) {
    case "heading":
      return { id: uid(), type, text: "My Awesome App", size: "l", align: "center" };
    case "text":
      return { id: uid(), type, text: "Say something here", size: "m", align: "center" };
    case "emoji":
      return { id: uid(), type, text: "🐶", size: "l", align: "center" };
    case "button":
      return { id: uid(), type, text: "Tap me!", variant: "solid", actions: [] };
    case "input":
      return { id: uid(), type, text: "Type here…", var: firstVar("text") };
    case "list":
      return { id: uid(), type, text: "Nothing here yet", var: firstVar("list") };
    case "progress":
      return { id: uid(), type, var: firstVar("number"), max: 100 };
    case "divider":
      return { id: uid(), type };
  }
}

export const PALETTE: { type: CompType; label: string; emoji: string; group: "Show" | "Interact" | "Data"; tip: string }[] = [
  { type: "heading", label: "Title", emoji: "🔤", group: "Show", tip: "Big title text" },
  { type: "text", label: "Text", emoji: "💬", group: "Show", tip: "Words — can show variables with {name}" },
  { type: "emoji", label: "Picture", emoji: "🖼️", group: "Show", tip: "A big emoji picture" },
  { type: "divider", label: "Divider", emoji: "➖", group: "Show", tip: "A line to separate things" },
  { type: "button", label: "Button", emoji: "👆", group: "Interact", tip: "Does actions when tapped" },
  { type: "input", label: "Text box", emoji: "⌨️", group: "Interact", tip: "Lets users type into a variable" },
  { type: "list", label: "List", emoji: "📋", group: "Data", tip: "Shows every item in a list variable" },
  { type: "progress", label: "Meter", emoji: "📊", group: "Data", tip: "A bar that fills up with a number" },
];

/* ------------------------------------------------------------------ */
/* Runtime                                                              */
/* ------------------------------------------------------------------ */

export function initialState(app: AppProject): State {
  const s: State = {};
  for (const v of app.vars) {
    if (v.type === "number") s[v.name] = Number(v.initial) || 0;
    else if (v.type === "text") s[v.name] = v.initial ?? "";
    else s[v.name] = [];
  }
  return s;
}

export function display(value: State[string] | undefined) {
  if (Array.isArray(value)) return String(value.length);
  if (value === undefined) return "";
  return String(value);
}

export function interpolate(text: string, state: State) {
  return text.replace(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (m, name: string) => (name in state ? display(state[name]) : m));
}

export function evalCondition(c: Condition, state: State) {
  const raw = state[c.var];
  const left = Array.isArray(raw) ? raw.length : raw;
  if (left === undefined) return false;
  const bothNumeric = typeof left === "number" || (c.value.trim() !== "" && !isNaN(Number(c.value)) && !isNaN(Number(left)));
  const a = bothNumeric ? Number(left) : String(left);
  const b = bothNumeric ? Number(c.value) : c.value;
  switch (c.op) {
    case ">=":
      return a >= b;
    case ">":
      return a > b;
    case "<":
      return a < b;
    case "<=":
      return a <= b;
    case "==":
      return a === b;
    case "!=":
      return a !== b;
  }
}

export function applyActions(actions: Action[], state: State): { state: State; toasts: string[] } {
  const s: State = { ...state };
  const toasts: string[] = [];
  for (const a of actions) {
    switch (a.kind) {
      case "change":
        s[a.var] = (Number(s[a.var]) || 0) + a.amount;
        break;
      case "set":
        s[a.var] = typeof s[a.var] === "number" ? Number(a.value) || 0 : a.value;
        break;
      case "random": {
        const lo = Math.min(a.min, a.max);
        const hi = Math.max(a.min, a.max);
        s[a.var] = lo + Math.floor(Math.random() * (hi - lo + 1));
        break;
      }
      case "addToList": {
        const value = String(s[a.from] ?? "").trim();
        if (value) {
          s[a.list] = [...((s[a.list] as string[]) ?? []), value];
          s[a.from] = "";
        }
        break;
      }
      case "clearList":
        s[a.list] = [];
        break;
      case "toast":
        toasts.push(interpolate(a.text, s));
        break;
    }
  }
  return { state: s, toasts };
}

/* ------------------------------------------------------------------ */
/* Code generation                                                      */
/* ------------------------------------------------------------------ */

const q = (s: string) => JSON.stringify(s);

function textExpr(text: string, app: AppProject) {
  const vars = new Map(app.vars.map((v) => [v.name, v]));
  const parts: string[] = [];
  let last = 0;
  const re = /\{([A-Za-z_][A-Za-z0-9_]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const v = vars.get(m[1]);
    if (!v) continue;
    if (m.index > last) parts.push(q(text.slice(last, m.index)));
    parts.push(v.type === "list" ? `${v.name}.length` : v.name);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(q(text.slice(last)));
  return parts.length ? parts.join(" + ") : '""';
}

function condExpr(c: Condition, app: AppProject) {
  const v = app.vars.find((x) => x.name === c.var);
  if (!v) return "false";
  const op = c.op === "==" ? "===" : c.op === "!=" ? "!==" : c.op;
  if (v.type === "text") return `${v.name} ${op} ${q(c.value)}`;
  const left = v.type === "list" ? `${v.name}.length` : v.name;
  return `${left} ${op} ${Number(c.value) || 0}`;
}

export function handlerName(comp: Comp, taken: Set<string>) {
  const base = toIdentifier(comp.text || "button") || "button";
  let name = "when" + base.charAt(0).toUpperCase() + base.slice(1) + "Tapped";
  let n = 2;
  while (taken.has(name)) name = `when${base.charAt(0).toUpperCase() + base.slice(1)}Tapped${n++}`;
  taken.add(name);
  return name;
}

function actionLines(a: Action, app: AppProject): string[] {
  const has = (name: string) => app.vars.some((v) => v.name === name);
  switch (a.kind) {
    case "change":
      if (!has(a.var)) return [];
      return [`${a.var} = ${a.var} ${a.amount < 0 ? "-" : "+"} ${Math.abs(a.amount)};`];
    case "set": {
      const v = app.vars.find((x) => x.name === a.var);
      if (!v) return [];
      return [`${v.name} = ${v.type === "number" ? Number(a.value) || 0 : q(a.value)};`];
    }
    case "random":
      if (!has(a.var)) return [];
      return [`${a.var} = randomNumber(${Math.min(a.min, a.max)}, ${Math.max(a.min, a.max)});`];
    case "addToList":
      if (!has(a.list) || !has(a.from)) return [];
      return [`if (${a.from}.trim() !== "") {`, `  ${a.list}.push(${a.from}.trim());`, `  ${a.from} = "";`, `}`];
    case "clearList":
      if (!has(a.list)) return [];
      return [`${a.list} = [];`];
    case "toast":
      return [`showMessage(${textExpr(a.text, app)});`];
  }
}

/** The student-facing program: data → events → screen. */
export function generateScript(app: AppProject) {
  const out: string[] = [];
  out.push(`// ${app.icon} ${app.name}`);
  out.push(`// Built with CODEship App Studio`);
  out.push("");
  out.push("// ===== 📦 DATA — variables remember things =====");
  if (!app.vars.length) out.push("// (no variables yet — add some in the Data tab)");
  for (const v of app.vars) {
    const init = v.type === "number" ? String(Number(v.initial) || 0) : v.type === "text" ? q(v.initial ?? "") : "[]";
    out.push(`let ${v.name} = ${init};`);
  }
  out.push("");
  out.push("// ===== 👆 EVENTS — what happens when you tap =====");
  const taken = new Set<string>();
  const handlers = new Map<string, string>();
  for (const c of app.comps) {
    if (c.type !== "button") continue;
    const name = handlerName(c, taken);
    handlers.set(c.id, name);
    out.push(`function ${name}() {`);
    const body = (c.actions ?? []).flatMap((a) => actionLines(a, app));
    if (!body.length) out.push("  // nothing yet — add actions to this button!");
    body.forEach((l) => out.push("  " + l));
    out.push("  render();");
    out.push("}");
    out.push("");
  }
  out.push("// ===== 🖼️ SCREEN — draws the app using the data =====");
  out.push("function render() {");
  out.push("  clearScreen();");
  for (const c of app.comps) {
    const lines: string[] = [];
    switch (c.type) {
      case "heading":
        lines.push(`addTitle(${textExpr(c.text ?? "", app)}, ${q(c.size ?? "l")}, ${q(c.align ?? "center")});`);
        break;
      case "text":
        lines.push(`addText(${textExpr(c.text ?? "", app)}, ${q(c.size ?? "m")}, ${q(c.align ?? "center")});`);
        break;
      case "emoji":
        lines.push(`addPicture(${q(c.text ?? "🙂")}, ${q(c.size ?? "l")});`);
        break;
      case "button":
        lines.push(`addButton(${q(c.text ?? "Button")}, ${handlers.get(c.id)}, ${q(c.variant ?? "solid")});`);
        break;
      case "input": {
        const v = app.vars.find((x) => x.name === c.var && x.type === "text");
        if (v) lines.push(`addTextBox(${q(c.text ?? "")}, ${v.name}, (typed) => { ${v.name} = typed; });`);
        else lines.push("// text box: pick a text variable to save into");
        break;
      }
      case "list": {
        const v = app.vars.find((x) => x.name === c.var && x.type === "list");
        if (v) lines.push(`addList(${v.name}, ${q(c.text ?? "")});`);
        else lines.push("// list: pick a list variable to show");
        break;
      }
      case "progress": {
        const v = app.vars.find((x) => x.name === c.var && x.type === "number");
        if (v) lines.push(`addMeter(${v.name}, ${Number(c.max) || 100});`);
        else lines.push("// meter: pick a number variable to show");
        break;
      }
      case "divider":
        lines.push("addDivider();");
        break;
    }
    if (c.showIf && app.vars.some((v) => v.name === c.showIf?.var)) {
      out.push(`  if (${condExpr(c.showIf, app)}) {`);
      lines.forEach((l) => out.push("    " + l));
      out.push("  }");
    } else {
      lines.forEach((l) => out.push("  " + l));
    }
  }
  out.push("}");
  out.push("");
  out.push("render(); // draw the app for the first time 🚀");
  return out.join("\n");
}

/** Building blocks used by the generated program (kept separate so the main code stays readable). */
export const HELPERS = `
// ===== 🧱 BUILDING BLOCKS — helper functions used above =====
const appRoot = document.getElementById("app");
let focusKey = null;

function clearScreen() {
  const active = document.activeElement;
  focusKey = active && active.dataset ? active.dataset.key : null;
  appRoot.innerHTML = "";
}
function add(el) {
  appRoot.appendChild(el);
  return el;
}
function addTitle(words, size, align) {
  const h = add(document.createElement("h1"));
  h.textContent = words;
  h.className = "title " + size + " " + align;
}
function addText(words, size, align) {
  const p = add(document.createElement("p"));
  p.textContent = words;
  p.className = "text " + size + " " + align;
}
function addPicture(emoji, size) {
  const d = add(document.createElement("div"));
  d.textContent = emoji;
  d.className = "picture " + size;
}
function addButton(label, onTap, style) {
  const b = add(document.createElement("button"));
  b.textContent = label;
  b.className = "btn " + style;
  b.onclick = onTap;
}
function addTextBox(hint, value, onType) {
  const key = "box-" + appRoot.children.length;
  const input = add(document.createElement("input"));
  input.placeholder = hint;
  input.value = value;
  input.dataset.key = key;
  input.oninput = () => { onType(input.value); render(); };
  if (focusKey === key) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
}
function addList(items, emptyMessage) {
  const ul = add(document.createElement("ul"));
  ul.className = "list";
  if (items.length === 0) {
    const li = ul.appendChild(document.createElement("li"));
    li.textContent = emptyMessage;
    li.className = "empty";
  }
  items.forEach((item) => { ul.appendChild(document.createElement("li")).textContent = item; });
}
function addMeter(value, max) {
  const outer = add(document.createElement("div"));
  outer.className = "meter";
  const inner = outer.appendChild(document.createElement("div"));
  inner.style.width = Math.max(0, Math.min(100, (value / max) * 100)) + "%";
}
function addDivider() {
  add(document.createElement("hr"));
}
function randomNumber(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}
function showMessage(words) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = words;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}
`;

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** A complete, standalone web app the student can open on any device. */
export function exportHtml(app: AppProject) {
  const bg = app.dark ? "#14162a" : "#f7f7fb";
  const fg = app.dark ? "#f4f5fa" : "#1f2336";
  const script = (HELPERS + "\n" + generateScript(app)).replace(/<\/script/gi, "<\\/script");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(app.name)}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; background: ${bg}; color: ${fg}; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
  header { background: ${app.theme}; color: #fff; padding: 18px 20px; font-weight: 800; font-size: 20px; display: flex; gap: 10px; align-items: center; }
  #app { max-width: 480px; margin: 0 auto; padding: 20px; display: flex; flex-direction: column; gap: 14px; }
  .title { margin: 0; line-height: 1.1; } .title.s { font-size: 22px; } .title.m { font-size: 28px; } .title.l { font-size: 36px; }
  .text { margin: 0; line-height: 1.5; } .text.s { font-size: 14px; } .text.m { font-size: 17px; } .text.l { font-size: 22px; font-weight: 700; }
  .center { text-align: center; } .left { text-align: left; }
  .picture { text-align: center; line-height: 1; } .picture.s { font-size: 40px; } .picture.m { font-size: 64px; } .picture.l { font-size: 110px; }
  .btn { font: inherit; font-weight: 800; font-size: 17px; padding: 14px 18px; border-radius: 16px; cursor: pointer; border: 2px solid ${app.theme}; }
  .btn.solid { background: ${app.theme}; color: #fff; } .btn.outline { background: transparent; color: ${app.theme}; }
  .btn:active { transform: scale(0.97); }
  input { font: inherit; padding: 13px 14px; border-radius: 14px; border: 2px solid ${app.dark ? "#3a3d5c" : "#d9dbe7"}; background: ${app.dark ? "#1f2238" : "#fff"}; color: inherit; }
  .list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
  .list li { padding: 12px 14px; border-radius: 14px; background: ${app.dark ? "#1f2238" : "#fff"}; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
  .list li.empty { opacity: .55; text-align: center; box-shadow: none; background: transparent; }
  .meter { height: 18px; border-radius: 999px; background: ${app.dark ? "#2a2d48" : "#e6e7f0"}; overflow: hidden; }
  .meter div { height: 100%; background: ${app.theme}; border-radius: 999px; transition: width .3s; }
  hr { border: 0; border-top: 2px dashed ${app.dark ? "#3a3d5c" : "#d9dbe7"}; width: 100%; }
  .toast { position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); background: #1f2336; color: #fff; padding: 12px 18px; border-radius: 14px; font-weight: 700; box-shadow: 0 10px 30px rgba(0,0,0,.3); }
</style>
</head>
<body>
<header><span>${escapeHtml(app.icon)}</span><span>${escapeHtml(app.name)}</span></header>
<main id="app"></main>
<script>
${script}
</script>
</body>
</html>
`;
}

/* ------------------------------------------------------------------ */
/* Missions                                                             */
/* ------------------------------------------------------------------ */

export interface Goal {
  id: string;
  label: string;
  tip: string;
  check: (app: AppProject) => boolean;
}

export interface Mission {
  id: string;
  title: string;
  emoji: string;
  theme: string;
  concepts: string[];
  pitch: string;
  goals: Goal[];
  starter: () => Pick<AppProject, "name" | "icon" | "vars" | "comps">;
}

const varsOf = (app: AppProject, t: VarType) => app.vars.filter((v) => v.type === t).map((v) => v.name);
const buttons = (app: AppProject) => app.comps.filter((c) => c.type === "button");
const allActions = (app: AppProject) => buttons(app).flatMap((b) => b.actions ?? []);
const showsVar = (app: AppProject, names: string[]) =>
  app.comps.some((c) => (c.type === "text" || c.type === "heading") && names.some((n) => (c.text ?? "").includes(`{${n}}`)));

export const MISSIONS: Mission[] = [
  {
    id: "clicker",
    title: "Clicker Champ",
    emoji: "🍪",
    theme: "#F59E0B",
    concepts: ["Events", "Variables", "Conditions"],
    pitch: "Build a cookie clicker game: tap to score, and win at 10!",
    starter: () => ({
      name: "Cookie Clicker",
      icon: "🍪",
      vars: [],
      comps: [
        { id: uid(), type: "heading", text: "Cookie Clicker", size: "l", align: "center" },
        { id: uid(), type: "emoji", text: "🍪", size: "l", align: "center" },
      ],
    }),
    goals: [
      { id: "var", label: "Create a number variable called score", tip: "Open the Data tab → name it score → type Number → Add.", check: (a) => varsOf(a, "number").length > 0 },
      { id: "btn", label: "Add a Button", tip: "Click 👆 Button in the blocks panel.", check: (a) => buttons(a).length > 0 },
      { id: "event", label: "Make the button add 1 to score", tip: "Select the button → When tapped → + Add action → Change a number.", check: (a) => allActions(a).some((x) => x.kind === "change" && x.amount > 0) },
      { id: "show", label: "Show the score using {score} in a Text", tip: "Add a 💬 Text and type: Score: {score}", check: (a) => showsVar(a, varsOf(a, "number")) },
      {
        id: "win",
        label: "Show “You win!” only when score ≥ 10",
        tip: "Add a Text, then turn on “Only show when…” → score >= 10.",
        check: (a) => a.comps.some((c) => c.showIf && varsOf(a, "number").includes(c.showIf.var) && (c.showIf.op === ">=" || c.showIf.op === ">")),
      },
    ],
  },
  {
    id: "dice",
    title: "Dice Roller",
    emoji: "🎲",
    theme: "#7C3AED",
    concepts: ["Random numbers", "State", "=="],
    pitch: "Make a dice app for board-game night — with a jackpot surprise.",
    starter: () => ({ name: "Dice Roller", icon: "🎲", vars: [], comps: [{ id: uid(), type: "heading", text: "Dice Roller", size: "l", align: "center" }] }),
    goals: [
      { id: "pic", label: "Add a Picture (an emoji)", tip: "Click 🖼️ Picture and choose 🎲.", check: (a) => a.comps.some((c) => c.type === "emoji") },
      { id: "var", label: "Create a number variable called roll", tip: "Data tab → roll → Number → Add.", check: (a) => varsOf(a, "number").length > 0 },
      { id: "random", label: "Make a button set roll to a random number 1–6", tip: "Button → + Add action → Random number → 1 to 6.", check: (a) => allActions(a).some((x) => x.kind === "random") },
      { id: "show", label: "Show the result with {roll}", tip: "Add a Text: You rolled {roll}!", check: (a) => showsVar(a, varsOf(a, "number")) },
      { id: "six", label: "Show a jackpot message only when roll == 6", tip: "Add a Text → Only show when → roll == 6.", check: (a) => a.comps.some((c) => c.showIf?.op === "==" && varsOf(a, "number").includes(c.showIf.var)) },
    ],
  },
  {
    id: "journal",
    title: "Mood Journal",
    emoji: "📓",
    theme: "#EC4899",
    concepts: ["Input", "Lists", "Arrays"],
    pitch: "A journal app that saves how you feel each day into a list.",
    starter: () => ({
      name: "Mood Journal",
      icon: "📓",
      vars: [],
      comps: [
        { id: uid(), type: "heading", text: "Mood Journal", size: "l", align: "center" },
        { id: uid(), type: "text", text: "How are you feeling today?", size: "m", align: "center" },
      ],
    }),
    goals: [
      { id: "vars", label: "Create a text variable (mood) and a list variable (moods)", tip: "Data tab: add mood as Text, then moods as List.", check: (a) => varsOf(a, "text").length > 0 && varsOf(a, "list").length > 0 },
      { id: "input", label: "Add a Text box that saves into mood", tip: "Click ⌨️ Text box, then pick mood under “Saves into”.", check: (a) => a.comps.some((c) => c.type === "input" && varsOf(a, "text").includes(c.var ?? "")) },
      { id: "add", label: "Add a button that adds mood to the moods list", tip: "Button → + Add action → Add to a list.", check: (a) => allActions(a).some((x) => x.kind === "addToList") },
      { id: "list", label: "Show the list with a List block", tip: "Click 📋 List and choose moods.", check: (a) => a.comps.some((c) => c.type === "list" && varsOf(a, "list").includes(c.var ?? "")) },
      { id: "clear", label: "Add a “Clear all” button", tip: "Another button → + Add action → Clear a list.", check: (a) => allActions(a).some((x) => x.kind === "clearList") },
    ],
  },
  {
    id: "pet",
    title: "Virtual Pet",
    emoji: "🐣",
    theme: "#10B981",
    concepts: ["State", "Meters", "if / else logic"],
    pitch: "Raise a digital pet. Keep it happy — or it gets grumpy!",
    starter: () => ({
      name: "My Pet",
      icon: "🐣",
      vars: [],
      comps: [{ id: uid(), type: "heading", text: "My Pet", size: "l", align: "center" }],
    }),
    goals: [
      { id: "pic", label: "Add your pet (a Picture)", tip: "Click 🖼️ Picture and choose an animal.", check: (a) => a.comps.some((c) => c.type === "emoji") },
      { id: "meter", label: "Make a happiness number and show it in a Meter", tip: "Data: happiness (Number, start 50). Then add a 📊 Meter.", check: (a) => a.comps.some((c) => c.type === "progress" && varsOf(a, "number").includes(c.var ?? "")) },
      { id: "up", label: "A button that raises happiness", tip: "e.g. “Feed” → Change happiness by +10.", check: (a) => allActions(a).some((x) => x.kind === "change" && x.amount > 0) },
      { id: "down", label: "A button that lowers happiness", tip: "e.g. “Homework time” → Change happiness by -10.", check: (a) => allActions(a).some((x) => x.kind === "change" && x.amount < 0) },
      {
        id: "mood",
        label: "Show a sad message only when happiness < 30",
        tip: "Add a Text “😢 I'm sad!” → Only show when → happiness < 30.",
        check: (a) => a.comps.some((c) => c.showIf && (c.showIf.op === "<" || c.showIf.op === "<=") && varsOf(a, "number").includes(c.showIf.var)),
      },
    ],
  },
];

export function createProject(mission?: Mission): AppProject {
  const now = Date.now();
  const base = mission
    ? mission.starter()
    : {
        name: "My App",
        icon: "🚀",
        vars: [] as AppVar[],
        comps: [{ id: uid(), type: "heading", text: "My App", size: "l", align: "center" } as Comp],
      };
  return {
    id: uid("app"),
    theme: mission?.theme ?? THEMES[0],
    dark: false,
    missionId: mission?.id,
    doneGoals: [],
    createdAt: now,
    updatedAt: now,
    ...base,
  };
}
