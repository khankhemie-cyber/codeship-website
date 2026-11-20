/**
 * Bus Buddies Road Trip: map tiles, map pieces (bridges, the ferry, lights,
 * cones), block icons and stickers, drawn in SVG. All original. The
 * characters live in characters.tsx. Animation is CSS (bus-buddies.css) and
 * stops under prefers-reduced-motion.
 */
import type { Block, GoalArt, Level, PaletteBlock, PassengerId } from "@/lib/games/bus/levels";
import { useId } from "react";
import { BinaSide, C, PassengerArt, ThingArt } from "./characters";

export { C, BinaFace, BinaSide, BinaTop, Codey, Duck, Owl, PassengerArt, ThingArt, Turtle } from "./characters";

/* ------------------------------------------------------------------ */
/* Map tiles (100 x 100 units each)                                     */
/* ------------------------------------------------------------------ */

const WATER = "#4FC3F7";

/** Road for drawing: the level's road plus any bridges built so far. */
export function roadAt(level: Level, x: number, y: number, bridges: Set<string>) {
  const ch = level.map[y]?.[x];
  if (ch === undefined) return false;
  if (bridges.has(`${x},${y}`)) return true;
  return "#SGk".includes(ch) || level.passengers.some((p) => p.stop === ch) || !!level.lights?.some((l) => l.ch === ch);
}

export function Tile({ level, x, y, waving, bridges }: { level: Level; x: number; y: number; waving?: boolean; bridges: Set<string> }) {
  const map = level.map;
  const ch = map[y][x];
  const ox = x * 100;
  const oy = y * 100;
  const grass = <rect x={ox} y={oy} width="100" height="100" fill={(x + y) % 2 ? C.grass : "#97D774"} />;
  const road = (nx: number, ny: number) => roadAt(level, nx, ny, bridges);
  if (ch === "w") return <Water ox={ox} oy={oy} x={x} y={y} />;
  if (road(x, y)) {
    const n = road(x, y - 1);
    const s = road(x, y + 1);
    const w = road(x - 1, y);
    const e = road(x + 1, y);
    const light = level.lights?.find((l) => l.ch === ch);
    const isStop = level.passengers.some((p) => p.stop === ch);
    return (
      <g>
        {grass}
        {ch === "k" ? <Dock ox={ox} oy={oy} map={map} x={x} y={y} /> : null}
        <rect x={ox + 14} y={oy + 14} width="72" height="72" rx="22" fill={C.road} />
        {n ? <rect x={ox + 14} y={oy} width="72" height="50" fill={C.road} /> : null}
        {s ? <rect x={ox + 14} y={oy + 50} width="72" height="50" fill={C.road} /> : null}
        {w ? <rect x={ox} y={oy + 14} width="50" height="72" fill={C.road} /> : null}
        {e ? <rect x={ox + 50} y={oy + 14} width="50" height="72" fill={C.road} /> : null}
        {light?.kind === "ducks" ? (
          <g fill="#fff" opacity=".85">
            {(n || s ? [22, 38, 54, 70] : [22, 38, 54, 70]).map((v) =>
              n || s ? <rect key={v} x={ox + 14} y={oy + v} width="72" height="8" /> : <rect key={v} x={ox + v} y={oy + 14} width="8" height="72" />,
            )}
          </g>
        ) : (
          <g stroke="#fff" strokeWidth="4" strokeDasharray="10 10" opacity=".75">
            {n ? <line x1={ox + 50} y1={oy} x2={ox + 50} y2={oy + 50} /> : null}
            {s ? <line x1={ox + 50} y1={oy + 50} x2={ox + 50} y2={oy + 100} /> : null}
            {w ? <line x1={ox} y1={oy + 50} x2={ox + 50} y2={oy + 50} /> : null}
            {e ? <line x1={ox + 50} y1={oy + 50} x2={ox + 100} y2={oy + 50} /> : null}
          </g>
        )}
        {ch === "G" ? <Goal ox={ox} oy={oy} art={level.goal ?? "gate"} /> : null}
        {isStop ? <BusStopSign ox={ox} oy={oy} /> : null}
      </g>
    );
  }
  return (
    <g>
      {grass}
      <path d={`M${ox + 20} ${oy + 80} l4 -8 l4 8 M${ox + 70} ${oy + 30} l4 -8 l4 8`} stroke={C.grassDark} strokeWidth="3" fill="none" />
      {ch === "t" ? <Tree ox={ox} oy={oy} /> : null}
      {ch === "h" ? <House ox={ox} oy={oy} hue={(x * 3 + y) % 3} /> : null}
      {ch === "f" ? <Flowers ox={ox} oy={oy} /> : null}
      {ch === "c" ? <Cows ox={ox} oy={oy} waving={waving} /> : null}
      {ch === "x" ? <RoadWork ox={ox} oy={oy} /> : null}
      {ch === "m" ? <Mountain ox={ox} oy={oy} big={(x + y) % 2 === 0} /> : null}
    </g>
  );
}

function Water({ ox, oy, x, y }: { ox: number; oy: number; x: number; y: number }) {
  const n = (x * 7 + y * 3) % 6;
  return (
    <g>
      <rect x={ox} y={oy} width="100" height="100" fill={WATER} />
      <g className="bb-ripple" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".55" style={{ animationDelay: `${-n * 0.5}s` }}>
        <path d={`M${ox + 14} ${oy + 30} q8 -6 16 0 q8 6 16 0`} />
        <path d={`M${ox + 54} ${oy + 72} q8 -6 16 0 q8 6 16 0`} />
      </g>
      {n === 0 ? (
        // A little lake duck, bobbing.
        <g className="bb-bob-water" style={{ transformOrigin: `${ox + 50}px ${oy + 56}px` }}>
          <ellipse cx={ox + 50} cy={oy + 58} rx="16" ry="6" fill="#ffffff55" />
          <ellipse cx={ox + 50} cy={oy + 52} rx="14" ry="9" fill="#FFF6C8" />
          <circle cx={ox + 60} cy={oy + 42} r="7" fill="#FFF6C8" />
          <path d={`M${ox + 66} ${oy + 42} l7 1 -7 3 Z`} fill={C.orange} />
          <circle cx={ox + 61} cy={oy + 40} r="1.6" fill={C.navy} />
        </g>
      ) : n === 3 ? (
        <g>
          <ellipse cx={ox + 34} cy={oy + 56} rx="13" ry="9" fill="#66BB6A" />
          <path d={`M${ox + 34} ${oy + 56} l12 -6 v8 Z`} fill={WATER} />
          <circle cx={ox + 30} cy={oy + 52} r="3.5" fill={C.pink} />
        </g>
      ) : null}
    </g>
  );
}

function Dock({ ox, oy, map, x, y }: { ox: number; oy: number; map: string[]; x: number; y: number }) {
  // Wooden planks reaching toward the water.
  const sides = [
    { w: map[y - 1]?.[x] === "w", r: { x: ox + 22, y: oy - 6, w: 56, h: 30 } },
    { w: map[y + 1]?.[x] === "w", r: { x: ox + 22, y: oy + 76, w: 56, h: 30 } },
    { w: map[y]?.[x - 1] === "w", r: { x: ox - 6, y: oy + 22, w: 30, h: 56 } },
    { w: map[y]?.[x + 1] === "w", r: { x: ox + 76, y: oy + 22, w: 30, h: 56 } },
  ];
  return (
    <g>
      {sides
        .filter((s) => s.w)
        .map((s, i) => (
          <g key={i}>
            <rect x={s.r.x} y={s.r.y} width={s.r.w} height={s.r.h} rx="4" fill="#B98552" />
            <path
              d={s.r.w > s.r.h ? `M${s.r.x} ${s.r.y + 10} h${s.r.w} M${s.r.x} ${s.r.y + 20} h${s.r.w}` : `M${s.r.x + 10} ${s.r.y} v${s.r.h} M${s.r.x + 20} ${s.r.y} v${s.r.h}`}
              stroke="#8D5F35"
              strokeWidth="2"
            />
          </g>
        ))}
      <rect x={ox + 4} y={oy + 4} width="14" height="14" rx="4" fill="#8D5F35" />
      <rect x={ox + 82} y={oy + 82} width="14" height="14" rx="4" fill="#8D5F35" />
    </g>
  );
}

function RoadWork({ ox, oy }: { ox: number; oy: number }) {
  return (
    <g>
      <rect x={ox + 6} y={oy + 6} width="88" height="88" rx="14" fill="#C8A27A" />
      <path d={`M${ox + 20} ${oy + 30} q6 -4 12 0 M${ox + 60} ${oy + 76} q6 -4 12 0`} stroke="#A57E57" strokeWidth="4" fill="none" strokeLinecap="round" />
      <Digger ox={ox + 16} oy={oy + 26} s={0.68} />
      <g>
        <rect x={ox + 8} y={oy + 8} width="84" height="12" rx="4" fill="#fff" />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${ox + 12 + i * 22} ${oy + 20} l10 -12 h10 l-10 12 Z`} fill={C.orange} />
        ))}
      </g>
    </g>
  );
}

export function Digger({ ox, oy, s = 1 }: { ox: number; oy: number; s?: number }) {
  return (
    <g transform={`translate(${ox} ${oy}) scale(${s})`}>
      <rect x="6" y="56" width="74" height="16" rx="8" fill="#455A64" />
      {[18, 42, 66].map((cx) => (
        <circle key={cx} cx={cx} cy="64" r="6" fill="#90A4AE" />
      ))}
      <rect x="12" y="30" width="46" height="28" rx="6" fill={C.gold} />
      <rect x="18" y="14" width="24" height="20" rx="4" fill={C.gold} />
      <rect x="22" y="18" width="16" height="12" rx="3" fill={C.tealLight} />
      <g className="bb-digger-arm" style={{ transformOrigin: "56px 36px" }}>
        <path d="M56 36 L84 14 L96 34" stroke="#E0A800" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M90 32 h14 l-4 14 h-10 Z" fill="#E0A800" />
      </g>
    </g>
  );
}

function Mountain({ ox, oy, big }: { ox: number; oy: number; big: boolean }) {
  return big ? (
    <g>
      <path d={`M${ox + 4} ${oy + 92} L${ox + 50} ${oy + 10} L${ox + 96} ${oy + 92} Z`} fill="#8E9AAF" />
      <path d={`M${ox + 50} ${oy + 10} L${ox + 96} ${oy + 92} H${ox + 60} Z`} fill="#77839A" />
      <path d={`M${ox + 36} ${oy + 36} L${ox + 50} ${oy + 10} L${ox + 64} ${oy + 36} L${ox + 56} ${oy + 30} L${ox + 50} ${oy + 38} L${ox + 44} ${oy + 30} Z`} fill="#fff" />
    </g>
  ) : (
    <g>
      <ellipse cx={ox + 40} cy={oy + 70} rx="28" ry="20" fill="#9AA5B8" />
      <ellipse cx={ox + 66} cy={oy + 76} rx="20" ry="14" fill="#8693A8" />
      <ellipse cx={ox + 34} cy={oy + 62} rx="10" ry="5" fill="#fff" opacity=".35" />
    </g>
  );
}

function Goal({ ox, oy, art }: { ox: number; oy: number; art: GoalArt }) {
  if (art === "gate") return <ParkGate ox={ox} oy={oy} />;
  if (art === "picnic")
    return (
      <g>
        <path d={`M${ox + 18} ${oy + 30} L${ox + 82} ${oy + 22} L${ox + 86} ${oy + 78} L${ox + 14} ${oy + 82} Z`} fill={C.red} opacity=".85" />
        <path d={`M${ox + 34} ${oy + 28} L${ox + 30} ${oy + 81} M${ox + 50} ${oy + 26} L${ox + 50} ${oy + 80} M${ox + 66} ${oy + 24} L${ox + 70} ${oy + 79} M${ox + 16} ${oy + 48} L${ox + 84} ${oy + 42} M${ox + 15} ${oy + 64} L${ox + 85} ${oy + 60}`} stroke="#fff" strokeWidth="6" opacity=".7" />
        <Star ox={ox} oy={oy} />
      </g>
    );
  if (art === "flag" || art === "peak")
    return (
      <g>
        {art === "peak" ? <path d={`M${ox + 10} ${oy + 92} L${ox + 30} ${oy + 62} L${ox + 44} ${oy + 76} L${ox + 60} ${oy + 52} L${ox + 90} ${oy + 92} Z`} fill="#8E9AAF" opacity=".6" /> : null}
        <rect x={ox + 74} y={oy + 8} width="5" height="56" rx="2" fill="#546E7A" />
        <g className="bb-flag">
          <path d={`M${ox + 79} ${oy + 10} h-40 v24 h40 Z`} fill="#fff" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={ox + 39 + i * 10} y={oy + 10 + (i % 2) * 12} width="10" height="12" fill={C.navy} />
          ))}
        </g>
        <Star ox={ox} oy={oy} />
      </g>
    );
  if (art === "fountain")
    return (
      <g>
        <circle cx={ox + 50} cy={oy + 50} r="30" fill="#B0BEC5" />
        <circle cx={ox + 50} cy={oy + 50} r="23" fill={WATER} />
        <g className="bb-fountain">
          <path d={`M${ox + 50} ${oy + 50} q-10 -24 -18 -6 M${ox + 50} ${oy + 50} q10 -24 18 -6 M${ox + 50} ${oy + 50} v-26`} stroke="#E1F5FE" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      </g>
    );
  // party: the barn with balloons
  return (
    <g>
      <rect x={ox + 14} y={oy + 34} width="72" height="52" rx="6" fill="#E57373" />
      <path d={`M${ox + 8} ${oy + 40} L${ox + 50} ${oy + 6} L${ox + 92} ${oy + 40} Z`} fill="#C62828" />
      <rect x={ox + 38} y={oy + 54} width="24" height="32" rx="4" fill="#FFE0B2" />
      <path d={`M${ox + 38} ${oy + 54} l24 32 M${ox + 62} ${oy + 54} l-24 32`} stroke="#E57373" strokeWidth="3" />
      <path d={`M${ox + 16} ${oy + 44} q34 14 68 0`} stroke={C.gold} strokeWidth="3" fill="none" />
      {[
        [10, 20, C.teal],
        [90, 18, C.purple],
        [94, 40, C.gold],
      ].map(([x, y, c]) => (
        <g key={String(x)} className="bb-balloon">
          <path d={`M${ox + (x as number)} ${oy + (y as number) + 12} v22`} stroke="#90A4AE" strokeWidth="1.5" />
          <ellipse cx={ox + (x as number)} cy={oy + (y as number)} rx="8" ry="10" fill={c as string} />
        </g>
      ))}
    </g>
  );
}

function Star({ ox, oy }: { ox: number; oy: number }) {
  return (
    <g className="bb-star-spin" style={{ transformOrigin: `${ox + 50}px ${oy + 52}px` }}>
      <circle cx={ox + 50} cy={oy + 52} r="15" fill="#fff9" />
      <path d={`M${ox + 50} ${oy + 42} l3 7 h7 l-6 4 l2 7 l-6 -4 l-6 4 l2 -7 l-6 -4 h7 Z`} fill={C.gold} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Map pieces that change while playing                                 */
/* ------------------------------------------------------------------ */

/** Wooden bridge planks over one square of water, running along `horizontal`. */
export function BridgePlanks({ x, y, horizontal }: { x: number; y: number; horizontal: boolean }) {
  const ox = x * 100;
  const oy = y * 100;
  return (
    <g className="bb-pop-in-svg" style={{ transformOrigin: `${ox + 50}px ${oy + 50}px` }}>
      {horizontal ? (
        <>
          <rect x={ox - 4} y={oy + 12} width="108" height="76" rx="8" fill="#A9743F" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={ox + 2 + i * 17} y={oy + 14} width="13" height="72" rx="3" fill="#C98E52" />
          ))}
          <rect x={ox - 4} y={oy + 8} width="108" height="7" rx="3" fill="#7A4E26" />
          <rect x={ox - 4} y={oy + 85} width="108" height="7" rx="3" fill="#7A4E26" />
        </>
      ) : (
        <>
          <rect x={ox + 12} y={oy - 4} width="76" height="108" rx="8" fill="#A9743F" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={ox + 14} y={oy + 2 + i * 17} width="72" height="13" rx="3" fill="#C98E52" />
          ))}
          <rect x={ox + 8} y={oy - 4} width="7" height="108" rx="3" fill="#7A4E26" />
          <rect x={ox + 85} y={oy - 4} width="7" height="108" rx="3" fill="#7A4E26" />
        </>
      )}
    </g>
  );
}

/** The ferry boat, centred on (cx, cy) in map units. */
export function FerryBoat({ cx, cy, moving }: { cx: number; cy: number; moving?: boolean }) {
  return (
    <g className="bb-ferry" style={{ transform: `translate(${cx}px, ${cy}px)`, transition: moving ? "transform 1.1s ease-in-out" : "transform 0.9s ease-in-out" }}>
      <g className="bb-bob-boat">
        <ellipse cx="0" cy="6" rx="52" ry="40" fill="#ffffff55" />
        <rect x="-46" y="-38" width="92" height="80" rx="26" fill="#E53935" />
        <rect x="-38" y="-30" width="76" height="64" rx="18" fill="#ECEFF1" />
        <rect x="-38" y="22" width="76" height="12" rx="6" fill={C.navy} opacity=".25" />
        <circle cx="34" cy="-30" r="8" fill={C.navy} />
        <circle cx="34" cy="-30" r="4" fill={C.gold} />
      </g>
    </g>
  );
}

export function Cone({ x, y, ghost }: { x: number; y: number; ghost?: boolean }) {
  const ox = x * 100;
  const oy = y * 100;
  return (
    <g className={ghost ? "bb-ghost" : "bb-pop-in-svg"} style={{ transformOrigin: `${ox + 50}px ${oy + 80}px` }} opacity={ghost ? 0.55 : 1}>
      <ellipse cx={ox + 52} cy={oy + 82} rx="26" ry="7" fill="#0003" />
      <rect x={ox + 24} y={oy + 72} width="52" height="10" rx="4" fill="#E65100" />
      <path d={`M${ox + 36} ${oy + 74} L${ox + 46} ${oy + 18} h8 L${ox + 64} ${oy + 74} Z`} fill={C.orange} />
      <path d={`M${ox + 41} ${oy + 48} h18 l2 10 h-22 Z M${ox + 44} ${oy + 32} h12 l1.5 7 h-15 Z`} fill="#fff" />
    </g>
  );
}

/** A traffic light (or duckling crossing) for the square at (x, y), red until it turns. */
export function LightPiece({ x, y, kind, red, left }: { x: number; y: number; kind: "light" | "ducks"; red: boolean; left: number }) {
  const ox = x * 100;
  const oy = y * 100;
  if (kind === "ducks") {
    return (
      <g>
        {red ? (
          <g className="bb-ducklings">
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${ox + 26 + i * 22} ${oy + 52})`}>
                <g className="bb-waddle" style={{ animationDelay: `${-i * 0.15}s` }}>
                  <ellipse cx="0" cy="4" rx="10" ry="8" fill="#FFE66D" />
                  <circle cx="5" cy="-6" r="6" fill="#FFE66D" />
                  <path d="M10 -6 l5 1 -5 2 Z" fill={C.orange} />
                  <circle cx="6" cy="-7" r="1.3" fill={C.navy} />
                </g>
              </g>
            ))}
          </g>
        ) : null}
        <Dots ox={ox} oy={oy} left={left} red={red} />
      </g>
    );
  }
  return (
    <g>
      <rect x={ox + 84} y={oy + 2} width="5" height="38" fill="#546E7A" />
      <rect x={ox + 74} y={oy - 26} width="24" height="44" rx="8" fill={C.navy} />
      <circle cx={ox + 86} cy={oy - 14} r="8" fill={red ? "#FF5252" : "#4A2020"} className={red ? "bb-light-on" : ""} />
      <circle cx={ox + 86} cy={oy + 6} r="8" fill={red ? "#1E3A1E" : "#69F0AE"} className={red ? "" : "bb-light-on"} />
      <Dots ox={ox} oy={oy} left={left} red={red} />
    </g>
  );
}

/** Little dots counting down the blocks until green. */
function Dots({ ox, oy, left, red }: { ox: number; oy: number; left: number; red: boolean }) {
  if (!red) return null;
  return (
    <g>
      {Array.from({ length: left }, (_, i) => (
        <circle key={i} cx={ox + 16 + i * 14} cy={oy + 92} r="5.5" fill="#FF5252" stroke="#fff" strokeWidth="2" />
      ))}
    </g>
  );
}

function Tree({ ox, oy }: { ox: number; oy: number }) {
  return (
    <g className="bb-sway" style={{ transformOrigin: `${ox + 50}px ${oy + 86}px` }}>
      <ellipse cx={ox + 54} cy={oy + 84} rx="26" ry="8" fill="#0002" />
      <rect x={ox + 44} y={oy + 56} width="12" height="28" rx="4" fill="#8D6E63" />
      <circle cx={ox + 50} cy={oy + 42} r="28" fill="#43A047" />
      <circle cx={ox + 36} cy={oy + 50} r="16" fill="#4CAF50" />
      <circle cx={ox + 62} cy={oy + 34} r="12" fill="#66BB6A" />
      <circle cx={ox + 40} cy={oy + 32} r="5" fill={C.red} />
      <circle cx={ox + 62} cy={oy + 52} r="5" fill={C.red} />
    </g>
  );
}

const HOUSE_COLORS = [
  ["#FFCCBC", C.purple],
  ["#B3E5FC", C.red],
  ["#FFF9C4", C.teal],
];

function House({ ox, oy, hue }: { ox: number; oy: number; hue: number }) {
  const [wall, roof] = HOUSE_COLORS[hue];
  return (
    <g>
      <ellipse cx={ox + 52} cy={oy + 88} rx="34" ry="6" fill="#0002" />
      <rect x={ox + 20} y={oy + 44} width="60" height="44" rx="6" fill={wall} stroke="#0003" strokeWidth="2" />
      <path d={`M${ox + 12} ${oy + 48} L${ox + 50} ${oy + 14} L${ox + 88} ${oy + 48} Z`} fill={roof} />
      <rect x={ox + 42} y={oy + 62} width="16" height="26" rx="6" fill="#8D6E63" />
      <rect x={ox + 26} y={oy + 54} width="12" height="12" rx="3" fill={C.tealLight} />
      <rect x={ox + 62} y={oy + 54} width="12" height="12" rx="3" fill={C.tealLight} />
    </g>
  );
}

function Flowers({ ox, oy }: { ox: number; oy: number }) {
  const spots: [number, number, string][] = [
    [24, 28, C.pink],
    [56, 22, C.gold],
    [78, 40, C.purple],
    [34, 58, C.red],
    [66, 66, C.pink],
    [22, 80, C.gold],
    [50, 84, C.purple],
    [82, 82, C.red],
  ];
  return (
    <g>
      <rect x={ox + 8} y={oy + 8} width="84" height="84" rx="26" fill="#6FBF55" />
      {spots.map(([x, y, col], i) => (
        <g key={i} className="bb-sway" style={{ transformOrigin: `${ox + x}px ${oy + y + 6}px`, animationDelay: `${i * -0.4}s` }}>
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={ox + x + 6 * Math.cos((a * Math.PI) / 180)} cy={oy + y + 6 * Math.sin((a * Math.PI) / 180)} r="5" fill={col} />
          ))}
          <circle cx={ox + x} cy={oy + y} r="4" fill="#FFF59D" />
        </g>
      ))}
    </g>
  );
}

function Cows({ ox, oy, waving }: { ox: number; oy: number; waving?: boolean }) {
  return (
    <g>
      <rect x={ox + 6} y={oy + 6} width="88" height="88" rx="10" fill="none" stroke="#A1887F" strokeWidth="4" strokeDasharray="14 6" />
      <g className={waving ? "bb-hop" : "bb-bob"} style={{ transformOrigin: `${ox + 50}px ${oy + 80}px` }}>
        <ellipse cx={ox + 50} cy={oy + 80} rx="28" ry="5" fill="#0002" />
        <rect x={ox + 26} y={oy + 66} width="6" height="14" fill="#5D4037" />
        <rect x={ox + 62} y={oy + 66} width="6" height="14" fill="#5D4037" />
        <ellipse cx={ox + 48} cy={oy + 58} rx="28" ry="17" fill="#fff" stroke="#5D4037" strokeWidth="2.5" />
        <path d={`M${ox + 34} ${oy + 50} q8 -6 12 4 q-6 8 -12 -4 Z M${ox + 56} ${oy + 62} q10 -4 10 6 q-8 4 -10 -6 Z`} fill="#3E2723" />
        <circle cx={ox + 76} cy={oy + 44} r="13" fill="#fff" stroke="#5D4037" strokeWidth="2.5" />
        <ellipse cx={ox + 80} cy={oy + 52} rx="8" ry="5" fill="#FFAB91" />
        <circle cx={ox + 74} cy={oy + 40} r="2.5" fill={C.navy} />
        <circle cx={ox + 82} cy={oy + 40} r="2.5" fill={C.navy} />
        <path d={`M${ox + 68} ${oy + 32} l-6 -6 M${ox + 84} ${oy + 32} l6 -6`} stroke="#BCAAA4" strokeWidth="4" strokeLinecap="round" />
      </g>
    </g>
  );
}

function BusStopSign({ ox, oy }: { ox: number; oy: number }) {
  return (
    <g>
      <rect x={ox + 84} y={oy + 8} width="4" height="34" fill="#546E7A" />
      <circle cx={ox + 86} cy={oy + 12} r="11" fill={C.teal} stroke="#fff" strokeWidth="3" />
      <rect x={ox + 80} y={oy + 7} width="12" height="9" rx="2" fill={C.gold} />
    </g>
  );
}

function ParkGate({ ox, oy }: { ox: number; oy: number }) {
  return (
    <g>
      <rect x={ox + 6} y={oy + 14} width="10" height="72" rx="4" fill={C.purple} />
      <rect x={ox + 84} y={oy + 14} width="10" height="72" rx="4" fill={C.purple} />
      <path d={`M${ox + 4} ${oy + 22} Q${ox + 50} ${oy - 6} ${ox + 96} ${oy + 22}`} stroke={C.gold} strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d={`M${ox + 11} ${oy + 14} v-14 l14 6 l-14 6`} fill={C.red} className="bb-flag" />
      <path d={`M${ox + 89} ${oy + 14} v-14 l-14 6 l14 6`} fill={C.teal} className="bb-flag" />
      <circle cx={ox + 50} cy={oy + 50} r="16" fill="#fff8" />
      <path d={`M${ox + 50} ${oy + 40} l3 7 h7 l-6 4 l2 7 l-6 -4 l-6 4 l2 -7 l-6 -4 h7 Z`} fill={C.gold} />
    </g>
  );
}

/** Drifting clouds over the map. */
export function Clouds({ width }: { width: number }) {
  return (
    <g className="pointer-events-none" opacity=".45">
      {[
        { y: 60, d: 46, delay: -8, s: 1 },
        { y: 260, d: 60, delay: -30, s: 0.8 },
        { y: 420, d: 52, delay: -18, s: 0.9 },
      ].map((c, i) => (
        <g key={i} className="bb-cloud" style={{ animationDuration: `${c.d}s`, animationDelay: `${c.delay}s`, ["--bb-w" as string]: `${width + 240}px` }}>
          <g transform={`translate(0 ${c.y}) scale(${c.s})`}>
            <ellipse cx="0" cy="0" rx="46" ry="20" fill="#fff" />
            <ellipse cx="-24" cy="-12" rx="22" ry="18" fill="#fff" />
            <ellipse cx="18" cy="-16" rx="26" ry="20" fill="#fff" />
          </g>
        </g>
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Command blocks                                                       */
/* ------------------------------------------------------------------ */

export const BLOCK_STYLE: Record<PaletteBlock, { color: string; label: string }> = {
  forward: { color: C.teal, label: "Forward" },
  left: { color: C.purple, label: "Turn left" },
  right: { color: C.purple, label: "Turn right" },
  honk: { color: "#E0A800", label: "Honk" },
  wait: { color: "#E53935", label: "Wait" },
  pickup: { color: "#43A047", label: "Pick up" },
  bridge: { color: "#A9743F", label: "Bridge" },
  ferry: { color: "#1E88E5", label: "Ferry" },
  repeat: { color: "#FF7A2F", label: "Repeat" },
};

/**
 * A block's picture. Moves are drawn on screen as Bina will make them: `dir`
 * is the way she faces when the block runs (0 up, 1 right, 2 down, 3 left),
 * so Forward points where she will actually drive.
 */
export function BlockIcon({ block, dir = 0 }: { block: PaletteBlock; dir?: number }) {
  const s = { stroke: "#fff", strokeWidth: 7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  const turns = block === "forward" || block === "left" || block === "right";
  return (
    <svg
      viewBox="0 0 60 60"
      className="h-full w-full transition-transform duration-300"
      style={turns ? { transform: `rotate(${dir * 90}deg)` } : undefined}
      aria-hidden
    >
      {block === "forward" ? (
        <g {...s}>
          <path d="M30 50 V12" />
          <path d="M16 26 L30 12 L44 26" />
        </g>
      ) : null}
      {block === "left" ? (
        <g {...s}>
          <path d="M40 52 V32 Q40 20 28 20 H14" />
          <path d="M24 9 L13 20 L24 31" />
        </g>
      ) : null}
      {block === "right" ? (
        <g {...s}>
          <path d="M20 52 V32 Q20 20 32 20 H46" />
          <path d="M36 9 L47 20 L36 31" />
        </g>
      ) : null}
      {block === "honk" ? (
        <g>
          <path d="M8 24 h10 l18 -12 v36 l-18 -12 h-10 Z" fill="#fff" />
          <g {...s} strokeWidth={5}>
            <path d="M42 22 q6 8 0 16" />
            <path d="M48 16 q10 14 0 28" />
          </g>
        </g>
      ) : null}
      {block === "wait" ? (
        <g>
          <rect x="18" y="6" width="24" height="48" rx="8" fill="#fff" opacity=".25" />
          <circle cx="30" cy="20" r="8" fill="#fff" />
          <circle cx="30" cy="40" r="8" fill="none" stroke="#fff" strokeWidth="3" />
          <path d="M8 46 a22 22 0 0 1 0 -32" {...s} strokeWidth={4} />
        </g>
      ) : null}
      {block === "pickup" ? (
        <path d="M18 50 V26 q0 -5 5 -5 q5 0 5 5 V16 q0 -5 5 -5 q5 0 5 5 v10 q0 -4 5 -4 q5 0 5 5 v15 q0 12 -14 12 h-6 q-8 0 -14 -8 l-8 -10 q-3 -4 1 -6 q4 -2 7 2 Z" fill="#fff" />
      ) : null}
      {block === "bridge" ? (
        <g>
          <path d="M4 44 Q30 6 56 44" {...s} strokeWidth={6} />
          <path d="M4 44 H56" {...s} strokeWidth={6} />
          <path d="M16 44 V30 M30 44 V24 M44 44 V30" {...s} strokeWidth={4} />
          <path d="M6 54 q6 -4 12 0 q6 4 12 0 q6 -4 12 0 q6 4 12 0" stroke="#fff" strokeWidth="3" fill="none" opacity=".7" />
        </g>
      ) : null}
      {block === "ferry" ? (
        <g>
          <path d="M6 34 H54 L46 48 H14 Z" fill="#fff" />
          <rect x="18" y="20" width="22" height="14" rx="3" fill="#fff" />
          <rect x="34" y="10" width="7" height="12" rx="2" fill="#fff" />
          <path d="M4 54 q6 -4 12 0 q6 4 12 0 q6 -4 12 0 q6 4 12 0" stroke="#fff" strokeWidth="3" fill="none" opacity=".7" />
        </g>
      ) : null}
      {block === "repeat" ? (
        <g {...s} strokeWidth={6}>
          <path d="M44 22 A16 16 0 1 0 46 34" />
          <path d="M36 20 L45 21 L46 12" />
        </g>
      ) : null}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Stickers                                                             */
/* ------------------------------------------------------------------ */

function StickerInner({ art }: { art: string }) {
  const animal = art === "turtle" || art === "duck" || art === "owl";
  if (animal)
    return (
      <svg x="14" y="12" width="72" height="72" viewBox="0 0 100 100">
        <PassengerArt id={art as PassengerId} />
      </svg>
    );
  const thing: Record<string, PassengerId> = { basket: "basket", gift: "gift", cake: "cake", "hat-party": "hat", balloons: "balloons" };
  if (thing[art])
    return (
      <svg x="16" y="14" width="68" height="68" viewBox="0 0 100 100">
        <ThingArt id={thing[art] as never} />
      </svg>
    );
  const tile = (children: React.ReactNode, vb = "0 0 100 100") => (
    <svg x="14" y="14" width="72" height="72" viewBox={vb}>
      {children}
    </svg>
  );
  switch (art) {
    case "park":
      return tile(<ParkGate ox={0} oy={10} />, "0 -10 100 110");
    case "bridge":
      return tile(
        <g>
          <rect x="0" y="0" width="100" height="100" rx="20" fill={WATER} />
          <BridgePlanks x={0} y={0} horizontal />
        </g>,
      );
    case "ferry":
      return tile(
        <g>
          <rect x="0" y="0" width="100" height="100" rx="20" fill={WATER} />
          <FerryBoat cx={50} cy={50} />
        </g>,
      );
    case "lake":
      return tile(
        <g>
          <circle cx="50" cy="50" r="46" fill={WATER} />
          <Water ox={0} oy={0} x={0} y={0} />
        </g>,
      );
    case "cone":
      return tile(<Cone x={0} y={0} />);
    case "digger":
      return tile(<Digger ox={0} oy={14} s={0.95} />);
    case "hat":
      return tile(
        <g>
          <path d="M14 70 Q14 26 50 24 Q86 26 86 70 Z" fill={C.gold} />
          <rect x="6" y="66" width="88" height="14" rx="7" fill="#E0A800" />
          <rect x="44" y="24" width="12" height="44" rx="4" fill="#E0A800" />
        </g>,
      );
    case "light":
      return tile(
        <g>
          <rect x="34" y="6" width="32" height="74" rx="10" fill={C.navy} />
          <circle cx="50" cy="24" r="10" fill="#4A2020" />
          <circle cx="50" cy="56" r="10" fill="#69F0AE" />
          <rect x="47" y="80" width="6" height="18" fill="#546E7A" />
        </g>,
      );
    case "fountain":
      return tile(<Goal ox={0} oy={0} art="fountain" />);
    case "ducklings":
      return tile(<LightPiece x={0} y={0} kind="ducks" red left={0} />);
    case "loop":
      return tile(
        <g>
          <circle cx="50" cy="50" r="40" fill="#FF7A2F" />
          <svg x="20" y="20" width="60" height="60" viewBox="0 0 60 60">
            <BlockIcon block="repeat" />
          </svg>
        </g>,
      );
    case "mountain":
      return tile(<Mountain ox={0} oy={0} big />);
    case "party":
      return tile(<Goal ox={0} oy={6} art="party" />, "0 0 100 100");
    default:
      return (
        <svg x="12" y="18" width="76" height="64" viewBox="0 0 240 160">
          <BinaSide />
        </svg>
      );
  }
}

export function StickerArt({ art, earned = true }: { art: string; earned?: boolean }) {
  const clip = "s" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg viewBox="0 0 100 100" className={`h-full w-full ${earned ? "" : "opacity-30 grayscale"}`} aria-hidden>
      <defs>
        <clipPath id={clip}>
          <circle cx="50" cy="50" r="40" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="46" fill="#fff" />
      <circle cx="50" cy="50" r="40" fill={earned ? "#FFF4C2" : "#E0E0E0"} />
      {earned ? (
        <g clipPath={`url(#${clip})`}>
          <StickerInner art={art} />
        </g>
      ) : (
        <text x="50" y="62" textAnchor="middle" fontSize="34" fontWeight="900" fill="#9E9E9E" fontFamily="sans-serif">
          ?
        </text>
      )}
    </svg>
  );
}

export type { Block };
