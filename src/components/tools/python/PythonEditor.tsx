"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { EditorSelection, EditorState, type StateCommand } from "@codemirror/state";
import {
  drawSelection,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentLess, indentMore } from "@codemirror/commands";
import { bracketMatching, HighlightStyle, indentUnit, syntaxHighlighting } from "@codemirror/language";
import { python } from "@codemirror/lang-python";
import { tags as t } from "@lezer/highlight";

/**
 * The checker.py editor. Deliberately NOT CodeMirror's basicSetup: that
 * bundle brings autocomplete, bracket auto-closing and auto-dedent of
 * `else:`, and the curriculum needs students to write every keyword,
 * bracket and indent themselves. The Python language support is used for
 * colouring only; its completion sources stay inert because no
 * autocompletion() extension is installed.
 *
 * Indentation is soft tabs of 4 spaces:
 *  - Tab inserts spaces to the next multiple of 4 (indents a multi-line selection).
 *  - Shift+Tab removes one level.
 *  - Enter keeps the current indent, plus one level after a line ending in ":".
 *  - Backspace in leading spaces removes back to the previous multiple of 4
 *    (CodeMirror's deleteCharBackward does this once indentUnit is 4 spaces).
 * Escape then Tab moves focus out of the editor (CodeMirror built-in), so
 * keyboard users are never trapped.
 */

export const INDENT = "    ";

export type EditorApi = {
  /** Replace the whole file as one undoable change. */
  replace: (code: string) => void;
  focus: () => void;
};

const insertSoftTab: StateCommand = ({ state, dispatch }) => {
  if (state.selection.ranges.some((r) => state.doc.lineAt(r.from).number !== state.doc.lineAt(r.to).number)) {
    return indentMore({ state, dispatch });
  }
  dispatch(
    state.update(
      state.changeByRange((range) => {
        const line = state.doc.lineAt(range.from);
        const col = range.from - line.from;
        const spaces = " ".repeat(INDENT.length - (col % INDENT.length));
        return {
          changes: { from: range.from, to: range.to, insert: spaces },
          range: EditorSelection.cursor(range.from + spaces.length),
        };
      }),
      { scrollIntoView: true, userEvent: "input" },
    ),
  );
  return true;
};

const newlineKeepIndent: StateCommand = ({ state, dispatch }) => {
  dispatch(
    state.update(
      state.changeByRange((range) => {
        const line = state.doc.lineAt(range.from);
        const before = line.text.slice(0, range.from - line.from);
        const indent = /^[ \t]*/.exec(before)![0];
        const insert = "\n" + indent + (before.trimEnd().endsWith(":") ? INDENT : "");
        return {
          changes: { from: range.from, to: range.to, insert },
          range: EditorSelection.cursor(range.from + insert.length),
        };
      }),
      { scrollIntoView: true, userEvent: "input" },
    ),
  );
  return true;
};

// Light tints of the brand palette, so every colour clears 4.5:1 on the navy editor.
const highlight = HighlightStyle.define([
  { tag: t.comment, color: "#93A0B5", fontStyle: "italic" },
  { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword, t.operatorKeyword], color: "#C9A7F0" },
  { tag: [t.string, t.special(t.string)], color: "#F2B347" },
  { tag: [t.number, t.bool, t.null], color: "#FF9E7A" },
  { tag: [t.function(t.variableName), t.function(t.definition(t.variableName))], color: "#6FD6E0" },
  { tag: [t.className, t.definition(t.className)], color: "#FFD27A" },
  { tag: [t.operator, t.punctuation, t.bracket], color: "#B6C2D6" },
  { tag: [t.variableName, t.propertyName], color: "#E8EEF7" },
  { tag: t.invalid, color: "#FF8A80" },
]);

const theme = EditorView.theme(
  {
    "&": { height: "100%", fontSize: "16px", color: "#E8EEF7", backgroundColor: "#011735" },
    ".cm-scroller": {
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
      lineHeight: "1.6",
    },
    ".cm-content": { caretColor: "#D58401", padding: "10px 0" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#D58401", borderLeftWidth: "2px" },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": { backgroundColor: "rgba(3,87,98,0.75)" },
    // Line numbers are part of the lesson ("go to the line in the error"), so
    // they are full size, high contrast and never hidden.
    ".cm-gutters": { backgroundColor: "#010F2A", color: "#A3ADBF", border: "none", borderRight: "1px solid rgba(255,255,255,0.08)" },
    ".cm-lineNumbers .cm-gutterElement": { padding: "0 12px 0 14px", minWidth: "3.2em" },
    ".cm-activeLine": { backgroundColor: "rgba(255,255,255,0.045)" },
    ".cm-activeLineGutter": { backgroundColor: "rgba(213,132,1,0.16)", color: "#FFFFFF" },
    ".cm-matchingBracket": { backgroundColor: "rgba(3,87,98,0.75)", outline: "none" },
  },
  { dark: true },
);

type Props = {
  initialCode: string;
  onChange: (code: string) => void;
  onRun: () => void;
  apiRef: MutableRefObject<EditorApi | null>;
};

export default function PythonEditor({ initialCode, onChange, onRun, apiRef }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const handlers = useRef({ onChange, onRun });
  handlers.current = { onChange, onRun };

  useEffect(() => {
    if (!hostRef.current) return;
    const view = new EditorView({
      parent: hostRef.current,
      state: EditorState.create({
        doc: initialCode,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightSpecialChars(),
          history(),
          drawSelection(),
          highlightActiveLine(),
          bracketMatching(),
          EditorState.tabSize.of(4),
          indentUnit.of(INDENT),
          python(),
          syntaxHighlighting(highlight),
          theme,
          keymap.of([
            { key: "Mod-Enter", run: () => (handlers.current.onRun(), true) },
            { key: "Tab", run: insertSoftTab, shift: indentLess },
            { key: "Enter", run: newlineKeepIndent },
            ...historyKeymap,
            ...defaultKeymap,
          ]),
          EditorView.contentAttributes.of({
            "aria-label": "checker.py",
            autocorrect: "off",
            autocapitalize: "off",
            spellcheck: "false",
          }),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) handlers.current.onChange(u.state.doc.toString());
          }),
        ],
      }),
    });
    apiRef.current = {
      replace: (code) => {
        view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: code }, selection: { anchor: 0 } });
        view.focus();
      },
      focus: () => view.focus(),
    };
    // Exposed for the acceptance tests (scripts/test-python-e2e.mjs) to read the
    // document exactly, without scraping the rendered lines.
    (hostRef.current as HTMLDivElement & { cmView?: EditorView }).cmView = view;
    return () => {
      view.destroy();
      apiRef.current = null;
    };
    // The editor is created once; later content changes go through apiRef.replace.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={hostRef} data-testid="editor" className="h-full min-h-0 overflow-hidden" />;
}
