"use client";

import { useMemo, useState } from "react";
import type { BlockPuzzle } from "@/data/academy/curriculum";
import { type BlockInstance, verify } from "@/lib/academy/blocks/interpreter";

const BLOCK_LABEL: Record<string, string> = {
  start_green_flag: "Start on Green Flag",
  start_tap: "Start on Tap",
  start_bump: "Start on Bump",
  start_message: "Start on Message",
  move_right: "Move Right",
  move_left: "Move Left",
  move_up: "Move Up",
  move_down: "Move Down",
  hop: "Hop",
  turn: "Turn",
  say: "Say",
  grow: "Grow",
  shrink: "Shrink",
  hide: "Hide",
  show: "Show",
  pop: "Pop",
  record: "Record",
  go_to_page: "Go to Page",
  wait: "Wait",
  repeat: "Repeat",
};

function labelFor(instance: BlockInstance): string {
  const base = BLOCK_LABEL[instance.block] ?? instance.block;
  return instance.arg ? `${base}: "${instance.arg}"` : base;
}

export default function BlockCanvas({
  puzzle,
  onSolved,
  onAttempt,
}: {
  puzzle: BlockPuzzle;
  onSolved?: () => void;
  /** Fired on every "Run it" click — lets the parent track lesson-scoped attempt history for the tutor. */
  onAttempt?: (programText: string, passed: boolean) => void;
}) {
  const [program, setProgram] = useState<BlockInstance[]>(puzzle.starter ?? []);
  const [result, setResult] = useState<{ passed: boolean; reason?: string } | null>(null);

  // De-duplicate the palette by (block, arg) so repeated blockSet entries used only for
  // solver search (e.g. two "say" options) each show once as a clickable choice.
  const palette = useMemo(() => {
    const seen = new Set<string>();
    return puzzle.blockSet.filter((instance) => {
      const key = `${instance.block}:${instance.arg ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [puzzle.blockSet]);

  function addBlock(instance: BlockInstance) {
    setProgram((prev) => [...prev, instance]);
    setResult(null);
  }

  function removeAt(index: number) {
    setProgram((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  }

  function check() {
    const outcome = verify(program, puzzle.goal);
    setResult(outcome);
    onAttempt?.(program.map(labelFor).join(" → ") || "(empty program)", outcome.passed);
    if (outcome.passed) onSolved?.();
  }

  return (
    <div className="rounded-lg border border-[#138A9A]/30 bg-white p-4">
      <p className="font-medium text-[#001532]">{puzzle.goal.description}</p>
      <p className="mt-1 text-xs text-[#2E3440]">Best possible: {puzzle.par} block{puzzle.par === 1 ? "" : "s"}.</p>

      <h3 className="mt-4 text-sm font-semibold text-[#001532]">Blocks</h3>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Available blocks">
        {palette.map((instance, i) => (
          <button
            key={`${instance.block}-${instance.arg ?? ""}-${i}`}
            type="button"
            onClick={() => addBlock(instance)}
            className="rounded-md border border-[#E5A823] bg-[#FFF8E7] px-3 py-1.5 text-sm font-medium text-[#001532] hover:bg-[#E5A823]/30"
          >
            {labelFor(instance)}
          </button>
        ))}
      </div>

      <h3 className="mt-4 text-sm font-semibold text-[#001532]">Your program</h3>
      <ol className="mt-2 min-h-[3rem] space-y-1" aria-label="Your program, in order">
        {program.length === 0 && <li className="text-sm italic text-[#2E3440]">Click blocks above to add them here.</li>}
        {program.map((instance, i) => (
          <li key={i} className="flex items-center justify-between rounded-md bg-[#F1EEE7] px-3 py-1.5 text-sm">
            <span>
              {i + 1}. {labelFor(instance)}
            </span>
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label={`Remove block ${i + 1}: ${labelFor(instance)}`}
              className="text-[#2E3440] hover:text-red-700"
            >
              ✕
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={check}
          disabled={program.length === 0}
          className="rounded-md bg-[#001532] px-4 py-2 text-sm font-medium text-white hover:bg-[#0D1B2A] disabled:opacity-60"
        >
          Run it
        </button>
        {result && (
          <p role="status" className={result.passed ? "text-sm font-medium text-green-700" : "text-sm text-[#2E3440]"}>
            {result.passed
              ? `Great job! Solved in ${program.length} block${program.length === 1 ? "" : "s"}.`
              : result.reason}
          </p>
        )}
      </div>
    </div>
  );
}
