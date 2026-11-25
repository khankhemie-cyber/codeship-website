// © 2026 CODEship Academy. All rights reserved. Proprietary and confidential: see LICENSE.
"use client";

import { useEffect, useRef } from "react";
import * as Blockly from "blockly/core";
import * as BlocklyEn from "blockly/msg/en";
import { TOOLBOXES, registerPortBlocks } from "@/lib/games/port/blocks";
import type { MissionId } from "@/lib/games/port/missions";

/**
 * Blockly workspace for Port CODEship. Tuned like the Explorers tool: forgiving
 * snapping, no right-click menus, no keyboard delete (drag a block back to
 * the palette to remove it).
 */

type Props = {
  mission: MissionId;
  value: unknown;
  /** The challenge's starter blocks (sent by the server to students). */
  starter: unknown;
  /** Changing it rebuilds the workspace (e.g. after "Reset"). */
  version: number;
  onChange: (workspace: unknown) => void;
};
const dark = true;

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

export default function PortBlocksEditor({ mission, value, starter, version, onChange }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const handler = useRef(onChange);
  handler.current = onChange;

  useEffect(() => {
    if (!host.current) return;
    patchOnce();
    Blockly.setLocale(BlocklyEn as unknown as Record<string, string>);
    registerPortBlocks(Blockly as never);
    const ws = Blockly.inject(host.current, {
      toolbox: TOOLBOXES[mission] as never,
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
      Blockly.serialization.workspaces.load((value ?? starter) as object, ws, { recordUndo: false });
    } catch {
      Blockly.serialization.workspaces.load(starter as object, ws, { recordUndo: false });
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
    // Rebuilt only for another mission or after a reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mission, version]);

  return (
    <>
      <style>{`
        .port-blocks .blocklyToolboxDiv, .port-blocks .blocklyToolbox { background: ${dark ? "#00102A" : "#F3F5F9"}; padding: 8px 4px; border-right: 1px solid ${dark ? "rgba(255,255,255,0.1)" : "#DFE3EB"}; }
        .port-blocks .blocklyToolboxCategory, .port-blocks .blocklyTreeRow { height: 42px; line-height: 42px; margin: 0 0 4px; padding: 0 14px 0 6px; border-radius: 10px; }
        .port-blocks .blocklyToolboxCategory:hover { background: ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,21,50,0.06)"}; }
        .port-blocks .blocklyToolboxCategoryLabel, .port-blocks .blocklyTreeLabel { color: ${dark ? "#E6EDF7" : "#001532"}; font: 700 15px system-ui, sans-serif; }
        .port-blocks .blocklyToolboxSelected .blocklyToolboxCategoryLabel, .port-blocks .blocklyTreeSelected .blocklyTreeLabel { color: #fff; }
        .port-blocks .blocklyToolboxCategoryIcon { width: 14px; height: 14px; border-radius: 4px; }
        .port-blocks .blocklyMainBackground { fill: ${dark ? "#011735" : "#FFFFFF"} !important; }
        .port-blocks .blocklyFlyoutBackground { fill: ${dark ? "#0A2648" : "#E6ECF4"}; fill-opacity: 0.97; }
        .port-blocks .blocklyText { font-weight: 700; }
      `}</style>
      <div ref={host} className="port-blocks h-full w-full" data-testid="port-blocks" />
    </>
  );
}
