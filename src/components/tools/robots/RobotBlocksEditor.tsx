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
  dark: boolean;
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

export default function RobotBlocksEditor({ value, dark, docKey, onChange }: Props) {
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
      zoom: { controls: false, wheel: false, startScale: 0.95, maxScale: 1.5, minScale: 0.5, pinch: true },
      grid: { spacing: 40, length: 2, colour: dark ? "#1E3A63" : "#D5DEEA", snap: false },
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
    // Rebuilt only when a different project is opened (docKey includes the theme).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docKey]);

  return (
    <>
      <style>{`
        .robot-blocks .blocklyToolboxDiv, .robot-blocks .blocklyToolbox { background: ${dark ? "#00102A" : "#F3F5F9"}; padding: 8px 4px; border-right: 1px solid ${dark ? "rgba(255,255,255,0.1)" : "#DFE3EB"}; }
        .robot-blocks .blocklyToolboxCategory, .robot-blocks .blocklyTreeRow { height: 42px; line-height: 42px; margin: 0 0 4px; padding: 0 14px 0 6px; border-radius: 10px; }
        .robot-blocks .blocklyToolboxCategory:hover { background: ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,21,50,0.06)"}; }
        .robot-blocks .blocklyToolboxCategoryLabel, .robot-blocks .blocklyTreeLabel { color: ${dark ? "#E6EDF7" : "#001532"}; font: 700 15px system-ui, sans-serif; }
        .robot-blocks .blocklyToolboxSelected .blocklyToolboxCategoryLabel, .robot-blocks .blocklyTreeSelected .blocklyTreeLabel { color: #fff; }
        .robot-blocks .blocklyToolboxCategoryIcon { width: 14px; height: 14px; border-radius: 4px; }
        .robot-blocks .blocklyMainBackground { fill: ${dark ? "#011735" : "#FFFFFF"} !important; }
        .robot-blocks .blocklyFlyoutBackground { fill: ${dark ? "#0A2648" : "#E6ECF4"}; fill-opacity: 0.97; }
        .robot-blocks .blocklyText { font-weight: 700; }
      `}</style>
      <div ref={host} className="robot-blocks h-full w-full" data-testid="robot-blocks" />
    </>
  );
}
