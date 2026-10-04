"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import * as Blockly from "blockly/core";
import * as BlocklyEn from "blockly/msg/en";
import * as BlocklyFr from "blockly/msg/fr";
import { blockTheme, DARK_TEXT_TYPES, recordIcon, registerBlocks, setPageCount, toolboxFor, type LabelMode } from "./blockDefs";
import type { UiLang } from "./i18n";
import type { Scripts } from "./model";

/**
 * The block-building area for the selected character. One Blockly workspace
 * is reused: selecting another character saves this one's blocks and loads
 * the other's (undo history is per character visit).
 *
 * Tuned for five-year-olds: generous snapping, no right-click menu, no
 * keyboard delete (deleting is dragging back to the palette), no trash can,
 * no comments, no autocomplete of any kind.
 */

export type EditorApi = {
  zoom: (direction: 1 | -1) => void;
  undo: () => void;
  redo: () => void;
  setClip: (blockId: string, clipId: string) => void;
};

type Props = {
  lang: UiLang;
  mode: LabelMode;
  semester: number;
  pageCount: number;
  /** Changes whenever a different character is selected. */
  actorKey: string;
  scripts: Scripts;
  clipIds: Set<string>;
  onChange: (scripts: Scripts) => void;
  onRecordBlock: (blockId: string, clipId: string | null) => void;
  apiRef: MutableRefObject<EditorApi | null>;
};

let patched = false;
function patchBlocklyOnce() {
  if (patched) return;
  patched = true;
  // Forgiving snapping: "bring it right up until it bumps".
  Blockly.config.snapRadius = 72;
  Blockly.config.connectingSnapRadius = 96;
  Blockly.config.currentConnectionPreference = 20;
  // No right-click / long-press menus anywhere.
  Blockly.WorkspaceSvg.prototype.showContextMenu = function () {};
  Blockly.BlockSvg.prototype.showContextMenu = function () {};
  // No keyboard deleting, cutting or pasting: a child leaning on the keyboard can't lose work.
  for (const name of ["delete", "cut", "copy", "paste"]) {
    try {
      Blockly.ShortcutRegistry.registry.unregister(name);
    } catch {}
  }
  // Gold and pale blocks get navy text (see blockDefs DARK_ON).
  const initSvg = Blockly.BlockSvg.prototype.initSvg;
  Blockly.BlockSvg.prototype.initSvg = function (this: Blockly.BlockSvg) {
    initSvg.call(this);
    // Tag this block's own fields, not its svg group: blocks stacked underneath
    // are children of that group and must keep their white text.
    if (!DARK_TEXT_TYPES.has(this.type as never)) return;
    for (const input of this.inputList) for (const field of input.fieldRow) field.getSvgRoot()?.classList.add("cb-dark-text");
  };
}

export default function BlocksEditor(props: Props) {
  const { lang, mode, semester, pageCount, actorKey, scripts, clipIds, onChange, onRecordBlock, apiRef } = props;
  const hostRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const loading = useRef(false);
  const handlers = useRef({ onChange, onRecordBlock });
  handlers.current = { onChange, onRecordBlock };
  const latest = useRef({ scripts, clipIds, semester });
  latest.current = { scripts, clipIds, semester };

  setPageCount(pageCount);

  const syncRecordIcons = (ws: Blockly.WorkspaceSvg) => {
    for (const b of ws.getBlocksByType("record", false)) {
      b.getField("ICON")?.setValue(recordIcon(Boolean(b.data && latest.current.clipIds.has(b.data))));
    }
  };

  const load = (ws: Blockly.WorkspaceSvg, s: Scripts) => {
    loading.current = true;
    Blockly.Events.disable();
    try {
      Blockly.serialization.workspaces.load(s as object, ws, { recordUndo: false });
    } catch {
      ws.clear();
    } finally {
      Blockly.Events.enable();
      loading.current = false;
    }
    ws.clearUndo();
    syncRecordIcons(ws);
    ws.scroll(0, 0);
  };

  // (Re)create the workspace when the language or label mode changes.
  useEffect(() => {
    if (!hostRef.current) return;
    patchBlocklyOnce();
    // Blockly's own strings (zoom buttons, screen-reader labels) in the same language.
    Blockly.setLocale((lang === "fr" ? BlocklyFr : BlocklyEn) as unknown as Record<string, string>);
    registerBlocks(lang, mode);
    const ws = Blockly.inject(hostRef.current, {
      toolbox: toolboxFor(latest.current.semester),
      theme: blockTheme(),
      renderer: "zelos",
      trashcan: false,
      comments: false,
      disable: false,
      collapse: false,
      sounds: false,
      readOnly: false,
      move: { scrollbars: true, drag: true, wheel: true },
      // Blockly's own zoom buttons load images from a CDN; the page has its own.
      media: "/blockly-media-unused/",
      zoom: { controls: false, wheel: false, startScale: 0.85, maxScale: 1.6, minScale: 0.5, scaleSpeed: 1.15, pinch: true },
      grid: { spacing: 40, length: 2, colour: "#D5DEEA", snap: false },
    });
    wsRef.current = ws;
    load(ws, latest.current.scripts);

    ws.addChangeListener((e: Blockly.Events.Abstract) => {
      if (loading.current) return;
      if (e.type === Blockly.Events.CLICK) {
        const click = e as Blockly.Events.Click;
        const block = click.blockId ? ws.getBlockById(click.blockId) : null;
        if (block?.type === "record" && !block.isInFlyout) handlers.current.onRecordBlock(block.id, block.data || null);
        return;
      }
      if (e.isUiEvent) return;
      if (e.type === Blockly.Events.BLOCK_CREATE) syncRecordIcons(ws);
      handlers.current.onChange(Blockly.serialization.workspaces.save(ws) as Scripts);
    });

    apiRef.current = {
      zoom: (d) => ws.zoomCenter(d),
      undo: () => ws.undo(false),
      redo: () => ws.undo(true),
      setClip: (blockId, clipId) => {
        const block = ws.getBlockById(blockId);
        if (!block) return;
        block.data = clipId;
        block.getField("ICON")?.setValue(recordIcon(true));
        handlers.current.onChange(Blockly.serialization.workspaces.save(ws) as Scripts);
      },
    };
    const resize = new ResizeObserver(() => Blockly.svgResize(ws));
    resize.observe(hostRef.current);
    return () => {
      resize.disconnect();
      apiRef.current = null;
      ws.dispose();
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, mode]);

  // Another character selected: show its blocks.
  useEffect(() => {
    if (wsRef.current) load(wsRef.current, latest.current.scripts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actorKey]);

  useEffect(() => {
    wsRef.current?.updateToolbox(toolboxFor(semester));
  }, [semester]);

  useEffect(() => {
    if (wsRef.current) syncRecordIcons(wsRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clipIds]);

  return <div ref={hostRef} data-testid="blocks-workspace" className="h-full w-full" />;
}
