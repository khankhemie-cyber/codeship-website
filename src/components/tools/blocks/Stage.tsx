"use client";

import { useEffect, useRef, useState } from "react";
import { backgroundById, costumeUrl } from "./costumes";
import type { ActorState } from "./engine";
import { GRID_COLS, GRID_ROWS, SIZE_FACTOR, type Actor, type Character } from "./model";

/**
 * The stage: a 10 x 8 grid of squares the children count out loud. Grid
 * lines are always drawn for that reason. Tapping a character runs its
 * "Start on Tap" blocks and selects it for building. When nothing is
 * running, an adult can drag a character to set its starting square.
 *
 * There is deliberately no back/home control on the stage.
 */

type Props = {
  background: string;
  actors: Actor[];
  characters: Character[];
  states: Map<string, ActorState>;
  selectedId: string | null;
  running: boolean;
  /** Levels: nothing can be dragged to a new starting square. */
  fixed?: boolean;
  onTap: (actorId: string) => void;
  onPlace: (actorId: string, x: number, y: number) => void;
};

const DRAG_THRESHOLD = 10;

export default function Stage({ background, actors, characters, states, selectedId, running, fixed, onTap, onPlace }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [cell, setCell] = useState(40);
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number } | null>(null);
  const press = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null);

  // Fit the largest whole-pixel square that shows all 10 x 8 cells.
  useEffect(() => {
    const el = boxRef.current?.parentElement;
    if (!el) return;
    const fit = () => setCell(Math.max(16, Math.floor(Math.min(el.clientWidth / GRID_COLS, el.clientHeight / GRID_ROWS))));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const costumeOf = (actor: Actor) => characters.find((c) => c.id === actor.characterId)?.costume ?? "robot";

  const onPointerDown = (e: React.PointerEvent, id: string) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    press.current = { id, x: e.clientX, y: e.clientY, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const p = press.current;
    if (!p || running || fixed) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    if (!p.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    p.moved = true;
    setDrag({ id: p.id, dx, dy });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const p = press.current;
    press.current = null;
    if (!p) return;
    if (p.moved && drag && !running) {
      const s = states.get(p.id);
      if (s) {
        const x = Math.round(s.x + drag.dx / cell);
        const y = Math.round(s.y + drag.dy / cell);
        onPlace(p.id, Math.min(GRID_COLS - 1, Math.max(0, x)), Math.min(GRID_ROWS - 1, Math.max(0, y)));
      }
    } else if (!p.moved) {
      onTap(p.id);
    }
    setDrag(null);
    void e;
  };

  const width = cell * GRID_COLS;
  const height = cell * GRID_ROWS;

  return (
    <div
      ref={boxRef}
      data-testid="stage"
      className="relative mx-auto touch-none select-none rounded-lg shadow-lg ring-2 ring-white/20"
      style={{
        width,
        height,
        background: backgroundById(background).css,
      }}
    >
      {/* Counting grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(1,15,42,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(1,15,42,0.14) 1px, transparent 1px)",
          backgroundSize: `${cell}px ${cell}px`,
        }}
      />
      {actors.map((actor) => {
        const s = states.get(actor.id);
        if (!s) return null;
        const selected = actor.id === selectedId;
        const dragging = drag?.id === actor.id;
        const scale = Math.pow(SIZE_FACTOR, s.level);
        const tx = s.x * cell + (dragging ? drag.dx : 0);
        const ty = s.y * cell + (dragging ? drag.dy : 0);
        return (
          <div
            key={actor.id}
            data-testid={`actor-${actor.id}`}
            data-x={s.x}
            data-y={s.y}
            data-level={s.level}
            data-visible={s.visible}
            role="button"
            aria-label={costumeOf(actor)}
            onPointerDown={(e) => onPointerDown(e, actor.id)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => ((press.current = null), setDrag(null))}
            className="absolute left-0 top-0 cursor-pointer"
            style={{
              width: cell,
              height: cell,
              transform: `translate(${tx}px, ${ty}px)`,
              transition: dragging ? "none" : "transform 280ms ease-in-out",
              zIndex: dragging ? 30 : selected ? 20 : 10,
            }}
          >
            <div
              className="h-full w-full"
              style={{
                transform: `scale(${scale})`,
                transition: "transform 260ms ease-out, opacity 120ms",
                // Hidden characters are invisible but still tappable ("it is just hiding").
                opacity: s.visible ? 1 : 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={costumeUrl(costumeOf(actor))} alt="" draggable={false} className="pointer-events-none h-full w-full" />
            </div>
            {selected && !running && (
              <div aria-hidden="true" className="pointer-events-none absolute -inset-1 animate-pulse rounded-lg border-[3px] border-dashed border-[#D58401]" />
            )}
            {s.bubble !== null && s.visible && (
              // Above the character, or below it on the top row so it isn't cut off.
              <div
                data-testid={`bubble-${actor.id}`}
                className={`pointer-events-none absolute left-1/2 z-40 w-max max-w-[220px] -translate-x-1/2 rounded-2xl border-2 border-[#010F2A] bg-white px-3 py-1.5 text-center text-base font-bold leading-snug text-[#010F2A] shadow ${
                  s.y === 0 ? "top-full" : "bottom-full"
                }`}
                style={s.y === 0 ? { marginTop: 10 + (scale - 1) * cell * 0.5 } : { marginBottom: 10 + (scale - 1) * cell * 0.5 }}
              >
                {s.bubble}
                <span
                  className={`absolute left-1/2 -ml-2 h-0 w-0 border-x-8 border-x-transparent ${
                    s.y === 0 ? "bottom-full border-b-[10px] border-b-[#010F2A]" : "top-full border-t-[10px] border-t-[#010F2A]"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
