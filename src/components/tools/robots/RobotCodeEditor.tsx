"use client";

import { useEffect, useRef } from "react";
import { basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { HighlightStyle, indentUnit, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";

/** A plain CodeMirror editor for robot programs (JavaScript or Python), in the tools' navy theme. */

const darkHighlight = HighlightStyle.define([
  { tag: t.comment, color: "#7C93B5", fontStyle: "italic" },
  { tag: [t.keyword, t.modifier, t.operatorKeyword, t.controlKeyword], color: "#B79CFF" },
  { tag: [t.string, t.special(t.string)], color: "#F4D734" },
  { tag: [t.number, t.bool, t.null, t.atom], color: "#FF9E64" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "#5FD4DE" },
  { tag: [t.propertyName, t.definition(t.propertyName)], color: "#9CDCFE" },
  { tag: [t.operator, t.punctuation, t.bracket], color: "#A9B8D0" },
  { tag: t.variableName, color: "#E6EDF7" },
]);

const lightHighlight = HighlightStyle.define([
  { tag: t.comment, color: "#7A8699", fontStyle: "italic" },
  { tag: [t.keyword, t.modifier, t.operatorKeyword, t.controlKeyword], color: "#6E43A8" },
  { tag: [t.string, t.special(t.string)], color: "#0F6F7C" },
  { tag: [t.number, t.bool, t.null, t.atom], color: "#C25E00" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "#1F5FBF" },
  { tag: [t.propertyName, t.definition(t.propertyName)], color: "#1F5FBF" },
  { tag: [t.operator, t.punctuation, t.bracket], color: "#5A6478" },
  { tag: t.variableName, color: "#001532" },
]);

const lightTheme = EditorView.theme({
  "&": { height: "100%", backgroundColor: "#FFFFFF", color: "#001532", fontSize: "15px" },
  ".cm-scroller": { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", lineHeight: "1.55" },
  ".cm-gutters": { backgroundColor: "#F3F5F9", color: "#8A93A6", border: "none" },
  ".cm-activeLine": { backgroundColor: "#F4F7FC" },
  ".cm-activeLineGutter": { backgroundColor: "#E8EDF6", color: "#001532" },
  "&.cm-focused .cm-cursor": { borderLeftColor: "#D58401" },
  "&.cm-focused .cm-selectionBackground, ::selection": { backgroundColor: "#CFE0FA" },
});

const darkTheme = EditorView.theme(
  {
    "&": { height: "100%", backgroundColor: "#011735", color: "#E6EDF7", fontSize: "15px" },
    ".cm-scroller": { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", lineHeight: "1.55" },
    ".cm-gutters": { backgroundColor: "#010F2A", color: "#5C6F8C", border: "none" },
    ".cm-activeLine": { backgroundColor: "#0B2550" },
    ".cm-activeLineGutter": { backgroundColor: "#0B2550", color: "#C3CBD8" },
    "&.cm-focused .cm-cursor": { borderLeftColor: "#F0D030" },
    "&.cm-focused .cm-selectionBackground, ::selection": { backgroundColor: "#24467C" },
    ".cm-selectionBackground": { backgroundColor: "#1C3A69" },
  },
  { dark: true },
);

type Props = {
  lang: "js" | "py";
  dark: boolean;
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  /** Changes when a different file is loaded (mission or language switch). */
  docKey: string;
};

export default function RobotCodeEditor({ lang, dark, value, onChange, onRun, docKey }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const handlers = useRef({ onChange, onRun });
  handlers.current = { onChange, onRun };

  useEffect(() => {
    if (!host.current) return;
    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        keymap.of([
          { key: "Mod-Enter", run: () => (handlers.current.onRun(), true) },
          indentWithTab,
        ]),
        lang === "py" ? python() : javascript(),
        indentUnit.of(lang === "py" ? "    " : "  "),
        dark ? darkTheme : lightTheme,
        syntaxHighlighting(dark ? darkHighlight : lightHighlight),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) handlers.current.onChange(u.state.doc.toString());
        }),
        EditorView.contentAttributes.of({ "aria-label": lang === "py" ? "Python code" : "JavaScript code", spellcheck: "false", autocapitalize: "off" }),
      ],
    });
    const v = new EditorView({ state, parent: host.current });
    view.current = v;
    return () => {
      v.destroy();
      view.current = null;
    };
    // Rebuilt only when a different file is opened or the theme changes; typing never rebuilds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docKey, lang, dark]);

  return <div ref={host} className="h-full min-h-0 overflow-hidden" />;
}
