"use client";

import { useEffect, useRef } from "react";
import * as Blockly from "blockly/core";
import * as BlocklyEn from "blockly/msg/en";
import { EMPTY_WORKSPACE, TOOLBOX, registerRobotBlocks } from "./robotBlocks";

/**
 * Blockly workspace for Robot Lab. Tuned like the Explorers tool: forgiving
 * snapping, no right-click menus, no keyboard delete (drag a block back to
 * the palette to remove it).
 */

type Props = {
  value: unknown;
  docKey: string;
  onChange: (workspace: unknown) => void;
};

let patched = false;
function patchOnce() {
  if (patched) return;
  patched = true;
  Blockly.config.snapRadius = 60;
  Blockly.config.connectingSnapRadius = 80;
  Blockly.WorkspaceSvg.prototype.showContextMenu = function () {};
  Blockly.BlockSvg.prototype.showContextMenu = function () {};
  for (const name of ["delete", "cut", "copy", "paste"]) {
    try {
      Blockly.ShortcutRegistry.registry.unregister(name);
    } catch {}
  }
}

export default function RobotBlocksEditor({ value, docKey, onChange }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const handler = useRef(onChange);
  handler.current = onChange;

  useEffect(() => {
    if (!host.current) return;
    patchOnce();
    Blockly.setLocale(BlocklyEn as unknown as Record<string, string>);
    registerRobotBlocks(Blockly as never);
    const ws = Blockly.inject(host.current, {
      toolbox: TOOLBOX as never,
      renderer: "zelos",
      trashcan: false,
      comments: false,
      collapse: false,
      disable: false,
      sounds: false,
      media: "/blockly-media-unused/",
      move: { scrollbars: true, drag: true, wheel: true },
      zoom: { controls: false, wheel: false, startScale: 0.8, maxScale: 1.5, minScale: 0.5, pinch: true },
      grid: { spacing: 40, length: 2, colour: "#D5DEEA", snap: false },
    });
    let loading = true;
    Blockly.Events.disable();
    try {
      Blockly.serialization.workspaces.load((value ?? EMPTY_WORKSPACE) as object, ws, { recordUndo: false });
    } catch {
      Blockly.serialization.workspaces.load(EMPTY_WORKSPACE, ws, { recordUndo: false });
    } finally {
      Blockly.Events.enable();
      loading = false;
    }
    ws.addChangeListener((e: Blockly.Events.Abstract) => {
      if (loading || e.isUiEvent) return;
      handler.current(Blockly.serialization.workspaces.save(ws));
    });
    const tip = Blockly.Tooltip.getDiv();
    if (tip && tip.parentElement !== document.body) document.body.appendChild(tip);
    const resize = new ResizeObserver(() => Blockly.svgResize(ws));
    resize.observe(host.current);
    return () => {
      resize.disconnect();
      ws.dispose();
    };
    // Rebuilt only when a different project is opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docKey]);

  return (
    <>
      <style>{`
        .robot-blocks .blocklyToolboxDiv, .robot-blocks .blocklyToolbox { background: #012C61; color: #fff; padding-top: 6px; }
        .robot-blocks .blocklyToolboxCategory, .robot-blocks .blocklyTreeRow { height: 40px; line-height: 40px; margin-bottom: 4px; padding-right: 14px; }
        .robot-blocks .blocklyToolboxCategoryLabel, .robot-blocks .blocklyTreeLabel { color: #fff; font: 700 15px system-ui, sans-serif; }
        .robot-blocks .blocklyToolboxSelected .blocklyToolboxCategoryLabel, .robot-blocks .blocklyTreeSelected .blocklyTreeLabel { color: #fff; }
        .robot-blocks .blocklyFlyoutBackground { fill: #E6ECF4; fill-opacity: 0.97; }
        .robot-blocks .blocklyText { font-weight: 700; }
      `}</style>
      <div ref={host} className="robot-blocks h-full w-full" data-testid="robot-blocks" />
    </>
  );
}
