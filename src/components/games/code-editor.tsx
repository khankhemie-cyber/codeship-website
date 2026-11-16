"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

const KEYWORDS = new Set([
  "for", "let", "const", "var", "if", "else", "while", "function", "return", "true", "false",
  "def", "elif", "in", "and", "or", "not", "print", "range", "None", "True", "False",
]);

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Tiny, dependency-free syntax highlighter for kid-sized JS / Python. */
export function highlight(code: string, commands: string[] = []) {
  const cmd = new Set(commands);
  const re = /(\/\/.*|#.*)|("(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?|`[^`]*`?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|([{}()[\]])|([^\w\s])/g;
  let out = "";
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    out += escapeHtml(code.slice(last, m.index));
    const [tok, comment, str, num, ident, bracket] = m;
    const t = escapeHtml(tok);
    if (comment) out += `<span class="text-slate-500 italic">${t}</span>`;
    else if (str) out += `<span class="text-emerald-300">${t}</span>`;
    else if (num) out += `<span class="text-orange-300">${t}</span>`;
    else if (ident) {
      if (KEYWORDS.has(ident)) out += `<span class="text-pink-400 font-semibold">${t}</span>`;
      else if (cmd.has(ident)) out += `<span class="text-amber">${t}</span>`;
      else out += `<span class="text-sky-200">${t}</span>`;
    } else if (bracket) out += `<span class="text-violet-300">${t}</span>`;
    else out += `<span class="text-slate-300">${t}</span>`;
    last = m.index + tok.length;
  }
  out += escapeHtml(code.slice(last));
  return out;
}

export interface CodeEditorHandle {
  insert: (snippet: string) => void;
  focus: () => void;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  commands?: string[];
  label: string;
  minLines?: number;
  readOnly?: boolean;
}

/**
 * A textarea with a highlighted <pre> underneath. It grows with its content so
 * only horizontal scroll needs syncing. Tab indents; press Esc first to Tab
 * out of the editor (keyboard-accessible, no focus trap).
 */
export const CodeEditor = forwardRef<CodeEditorHandle, Props>(function CodeEditor(
  { value, onChange, commands = [], label, minLines = 12, readOnly = false },
  ref
) {
  const ta = useRef<HTMLTextAreaElement>(null);
  const pre = useRef<HTMLPreElement>(null);
  const escaped = useRef(false);

  const lines = Math.max(minLines, value.split("\n").length + 1);

  const replaceRange = (start: number, end: number, text: string, caret?: number) => {
    const next = value.slice(0, start) + text + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      const el = ta.current;
      if (!el) return;
      el.focus();
      const pos = caret ?? start + text.length;
      el.setSelectionRange(pos, pos);
    });
  };

  useImperativeHandle(ref, () => ({
    focus: () => ta.current?.focus(),
    insert: (snippet: string) => {
      const el = ta.current;
      const start = el ? el.selectionStart : value.length;
      const end = el ? el.selectionEnd : value.length;
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const currentLine = value.slice(lineStart, start);
      const indent = (currentLine.match(/^\s*/) ?? [""])[0];
      const onEmptyLine = currentLine.trim() === "";
      let text = snippet
        .replace(/\n$/, "")
        .split("\n")
        .map((l, i) => (i === 0 ? l : indent + l))
        .join("\n");
      if (!onEmptyLine) text = "\n" + indent + text;
      const after = value.slice(end);
      if (!after.startsWith("\n")) text += "\n";
      replaceRange(start, end, text);
    },
  }));

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    if (e.key === "Escape") {
      escaped.current = true;
      return;
    }
    if (e.key === "Tab" && !escaped.current && !e.shiftKey) {
      e.preventDefault();
      replaceRange(el.selectionStart, el.selectionEnd, "  ");
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const start = el.selectionStart;
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const line = value.slice(lineStart, start);
      let indent = (line.match(/^\s*/) ?? [""])[0];
      if (/[{:]\s*$/.test(line)) indent += "  ";
      replaceRange(start, el.selectionEnd, "\n" + indent);
      return;
    }
    if (e.key === "}") {
      // Auto-dedent a closing bracket typed on an indentation-only line.
      const start = el.selectionStart;
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const line = value.slice(lineStart, start);
      if (/^\s{2,}$/.test(line)) {
        e.preventDefault();
        replaceRange(lineStart, el.selectionEnd, line.slice(2) + "}");
        return;
      }
    }
    escaped.current = false;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f1120] font-mono text-[13px] leading-6 md:text-sm md:leading-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-10 select-none border-r border-white/5 bg-black/20 py-4 pr-2 text-right text-white/25"
      >
        {Array.from({ length: lines }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <pre
        ref={pre}
        aria-hidden
        className="pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre py-4 pl-14 pr-4 text-white"
        dangerouslySetInnerHTML={{ __html: highlight(value, commands) + "\n" }}
      />
      <textarea
        ref={ta}
        aria-label={label}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onScroll={(e) => {
          if (pre.current) pre.current.scrollLeft = e.currentTarget.scrollLeft;
        }}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        wrap="off"
        rows={lines}
        className="relative block w-full resize-none overflow-x-auto overflow-y-hidden whitespace-pre bg-transparent py-4 pl-14 pr-4 text-transparent caret-amber outline-none selection:bg-amber/30 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber/60"
        style={{ height: `${lines * 1.5 + 2}rem` }}
      />
    </div>
  );
});
