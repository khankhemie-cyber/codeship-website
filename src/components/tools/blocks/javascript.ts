/**
 * The JavaScript behind a character's blocks, for the "Show JavaScript"
 * switch in Create and Levels. Read-only: children never type it, it just shows that
 * every block is a line of real code (a Repeat is a `for` loop, a Start
 * block is an event handler).
 *
 * The code always reads in English, the language JavaScript is written in.
 * Stacks without a Start block never run (see engine.ts), so they are shown
 * as comments.
 *
 * Erasable TypeScript only: the acceptance tests import this into Node.
 */

import type { BlockJson, Scripts } from "./model";

const CALLS: Record<string, string> = {
  move_right: "moveRight()",
  move_left: "moveLeft()",
  move_up: "moveUp()",
  move_down: "moveDown()",
  go_home: "goHome()",
  record: "playMyVoice()",
  pop: "pop()",
  grow: "grow()",
  shrink: "shrink()",
  hide: "hide()",
  show: "show()",
};

const HANDLERS: Record<string, string> = {
  start_flag: "whenGreenFlagClicked",
  start_tap: "whenTapped",
  start_bump: "whenBumped",
  start_message: "whenMessageReceived",
};

const LOOP_VARS = ["i", "j", "k", "m", "n"];

function statements(first: BlockJson | undefined, indent: number, depth: number, out: string[]) {
  const pad = "  ".repeat(indent);
  for (let b = first; b; b = b.next?.block) {
    const f = b.fields ?? {};
    if (CALLS[b.type]) out.push(`${pad}${CALLS[b.type]};`);
    else if (b.type === "say") out.push(`${pad}say(${JSON.stringify(String(f.TEXT ?? ""))});`);
    else if (b.type === "wait") out.push(`${pad}wait(${Number(f.N ?? 1)});`);
    else if (b.type === "go_page") out.push(`${pad}goToPage(${Number(f.PAGE ?? 1)});`);
    else if (b.type === "send_message") out.push(`${pad}sendMessage(${JSON.stringify(String(f.COLOUR ?? "red"))});`);
    else if (b.type === "repeat") {
      const v = LOOP_VARS[depth] ?? `i${depth}`;
      out.push(`${pad}for (let ${v} = 0; ${v} < ${Number(f.N ?? 1)}; ${v}++) {`);
      statements(b.inputs?.DO?.block, indent + 1, depth + 1, out);
      out.push(`${pad}}`);
    }
  }
}

/** The JavaScript for one character's blocks. */
export function toJavaScript(scripts: Scripts): string {
  const out: string[] = [];
  for (const top of scripts.blocks?.blocks ?? []) {
    if (out.length) out.push("");
    const handler = HANDLERS[top.type];
    if (handler) {
      const colour = top.type === "start_message" ? `${JSON.stringify(String(top.fields?.COLOUR ?? "red"))}, ` : "";
      out.push(`${handler}(${colour}() => {`);
      statements(top.next?.block, 1, 0, out);
      out.push("});");
    } else {
      const loose: string[] = [];
      statements(top, 0, 0, loose);
      out.push("// Not joined to a Start block, so this never runs:");
      for (const line of loose) out.push(`// ${line}`);
    }
  }
  return out.length ? out.join("\n") : "// No blocks yet.";
}
