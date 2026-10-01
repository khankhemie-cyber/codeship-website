"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { basicSetup } from "codemirror";
import { Compartment, EditorSelection, EditorState, type Extension } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { indentWithTab, redo, undo } from "@codemirror/commands";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import type { Files, Lang } from "./lib";

export type EditorApi = {
  undo: () => void;
  redo: () => void;
  focus: () => void;
  /** Move the cursor to a 1-based line in a file once that file is showing. */
  revealLine: (lang: Lang, line: number) => void;
};

type Props = {
  files: Files;
  active: Lang;
  dark: boolean;
  fontSize: number;
  wrap: boolean;
  label: string;
  onChange: (lang: Lang, value: string) => void;
  onRun: () => void;
  onSave: () => void;
  apiRef: MutableRefObject<EditorApi | null>;
};

const LANGUAGES: Record<Lang, () => Extension> = {
  html: () => html(),
  css: () => css(),
  js: () => javascript(),
};

const darkHighlight = HighlightStyle.define([
  { tag: t.comment, color: "#7C93B5", fontStyle: "italic" },
  { tag: [t.keyword, t.modifier, t.operatorKeyword, t.controlKeyword], color: "#B79CFF" },
  { tag: [t.string, t.special(t.string), t.regexp], color: "#F4D734" },
  { tag: [t.number, t.bool, t.null, t.atom], color: "#FF9E64" },
  { tag: [t.tagName, t.angleBracket], color: "#FF7A90" },
  { tag: t.attributeName, color: "#8DDB8C" },
  { tag: [t.propertyName, t.definition(t.propertyName)], color: "#9CDCFE" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "#5FD4DE" },
  { tag: [t.className, t.typeName, t.labelName], color: "#FFCB6B" },
  { tag: [t.operator, t.punctuation, t.bracket], color: "#A9B8D0" },
  { tag: t.variableName, color: "#E6EDF7" },
  { tag: t.invalid, color: "#FF5370" },
]);

const lightHighlight = HighlightStyle.define([
  { tag: t.comment, color: "#7A8699", fontStyle: "italic" },
  { tag: [t.keyword, t.modifier, t.operatorKeyword, t.controlKeyword], color: "#6E43A8" },
  { tag: [t.string, t.special(t.string), t.regexp], color: "#0F6F7C" },
  { tag: [t.number, t.bool, t.null, t.atom], color: "#B5470B" },
  { tag: [t.tagName, t.angleBracket], color: "#A0185A" },
  { tag: t.attributeName, color: "#1750EB" },
  { tag: [t.propertyName, t.definition(t.propertyName)], color: "#871094" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "#1E4D8C" },
  { tag: [t.className, t.typeName, t.labelName], color: "#8A6100" },
  { tag: t.invalid, color: "#D0021B" },
]);

function themeFor(dark: boolean, fontSize: number): Extension {
  const c = dark
    ? { bg: "#021B38", gutter: "#001532", text: "#E6EDF7", muted: "#5C7395", line: "rgba(255,255,255,0.045)", sel: "rgba(19,138,154,0.4)", caret: "#F4D734", panel: "#0A2648", border: "rgba(255,255,255,0.1)" }
    : { bg: "#FFFFFF", gutter: "#F5F7FB", text: "#1A1A2E", muted: "#8A94A6", line: "rgba(10,35,66,0.045)", sel: "rgba(19,138,154,0.22)", caret: "#001532", panel: "#F5F7FB", border: "#E2E6EE" };
  return [
    EditorView.theme(
      {
        "&": { height: "100%", fontSize: `${fontSize}px`, color: c.text, backgroundColor: c.bg },
        ".cm-scroller": {
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
          lineHeight: "1.6",
        },
        ".cm-content": { caretColor: c.caret, padding: "10px 0" },
        ".cm-cursor, .cm-dropCursor": { borderLeftColor: c.caret, borderLeftWidth: "2px" },
        "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": { backgroundColor: c.sel },
        ".cm-gutters": { backgroundColor: c.gutter, color: c.muted, border: "none" },
        ".cm-lineNumbers .cm-gutterElement": { padding: "0 10px 0 14px" },
        ".cm-activeLine": { backgroundColor: c.line },
        ".cm-activeLineGutter": { backgroundColor: c.line, color: c.text },
        ".cm-matchingBracket": { backgroundColor: c.sel, outline: "none" },
        ".cm-foldPlaceholder": { backgroundColor: "transparent", border: "none", color: c.muted },
        ".cm-tooltip": { backgroundColor: c.panel, border: `1px solid ${c.border}`, color: c.text },
        ".cm-tooltip-autocomplete > ul > li[aria-selected]": { backgroundColor: dark ? "#0F6F7C" : "#D3EEF1", color: c.text },
        ".cm-panels": { backgroundColor: c.panel, color: c.text, borderColor: c.border },
        ".cm-textfield": { backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` },
        ".cm-button": { backgroundImage: "none", backgroundColor: c.gutter, color: c.text, border: `1px solid ${c.border}` },
      },
      { dark },
    ),
    syntaxHighlighting(dark ? darkHighlight : lightHighlight),
  ];
}

export default function CodeEditor({ files, active, dark, fontSize, wrap, label, onChange, onRun, onSave, apiRef }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const statesRef = useRef<Partial<Record<Lang, EditorState>>>({});
  const activeRef = useRef(active);
  const pendingLineRef = useRef<{ lang: Lang; line: number } | null>(null);
  const appearance = useRef(new Compartment());
  const wrapping = useRef(new Compartment());
  const settingsRef = useRef({ dark, fontSize, wrap });
  settingsRef.current = { dark, fontSize, wrap };

  // Callbacks change every render; the editor reads them through a ref.
  const handlers = useRef({ onChange, onRun, onSave });
  handlers.current = { onChange, onRun, onSave };

  const makeState = (lang: Lang, doc: string) => {
    const s = settingsRef.current;
    return EditorState.create({
      doc,
      extensions: [
        keymap.of([
          { key: "Mod-Enter", run: () => (handlers.current.onRun(), true) },
          { key: "Mod-s", run: () => (handlers.current.onSave(), true), preventDefault: true },
          indentWithTab,
        ]),
        basicSetup,
        LANGUAGES[lang](),
        appearance.current.of(themeFor(s.dark, s.fontSize)),
        wrapping.current.of(s.wrap ? EditorView.lineWrapping : []),
        EditorView.contentAttributes.of({ "aria-label": `${lang.toUpperCase()} code` }),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) handlers.current.onChange(lang, u.state.doc.toString());
        }),
      ],
    });
  };

  // Bring a state up to date with the current theme/size/wrap settings.
  const applySettings = (view: EditorView) => {
    const s = settingsRef.current;
    view.dispatch({
      effects: [
        appearance.current.reconfigure(themeFor(s.dark, s.fontSize)),
        wrapping.current.reconfigure(s.wrap ? EditorView.lineWrapping : []),
      ],
    });
  };

  const revealPending = (view: EditorView) => {
    const pending = pendingLineRef.current;
    if (!pending || pending.lang !== activeRef.current) return;
    pendingLineRef.current = null;
    const n = Math.min(Math.max(1, pending.line), view.state.doc.lines);
    const line = view.state.doc.line(n);
    view.dispatch({
      selection: EditorSelection.range(line.from, line.to),
      effects: EditorView.scrollIntoView(line.from, { y: "center" }),
    });
    view.focus();
  };

  // Create the view once.
  useEffect(() => {
    if (!hostRef.current) return;
    const lang = activeRef.current;
    const state = makeState(lang, files[lang]);
    statesRef.current[lang] = state;
    const view = new EditorView({ state, parent: hostRef.current });
    viewRef.current = view;
    apiRef.current = {
      undo: () => {
        undo(view);
        view.focus();
      },
      redo: () => {
        redo(view);
        view.focus();
      },
      focus: () => view.focus(),
      revealLine: (l, line) => {
        pendingLineRef.current = { lang: l, line };
        revealPending(view);
      },
    };
    return () => {
      view.destroy();
      viewRef.current = null;
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switch files: each tab keeps its own state, so undo history survives tab changes.
  useEffect(() => {
    const view = viewRef.current;
    if (!view || activeRef.current === active) return;
    statesRef.current[activeRef.current] = view.state;
    activeRef.current = active;
    const existing = statesRef.current[active];
    const next = existing && existing.doc.toString() === files[active] ? existing : makeState(active, files[active]);
    statesRef.current[active] = next;
    view.setState(next);
    applySettings(view);
    revealPending(view);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Code replaced from outside the editor (a template, a pasted link, start over).
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    (Object.keys(files) as Lang[]).forEach((lang) => {
      if (lang === activeRef.current) {
        if (view.state.doc.toString() !== files[lang]) {
          view.setState(makeState(lang, files[lang]));
          applySettings(view);
        }
      } else if (statesRef.current[lang] && statesRef.current[lang]!.doc.toString() !== files[lang]) {
        delete statesRef.current[lang];
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  useEffect(() => {
    if (viewRef.current) applySettings(viewRef.current);
  }, [dark, fontSize, wrap]);

  return <div ref={hostRef} aria-label={label} className="h-full min-h-0 overflow-hidden" />;
}
