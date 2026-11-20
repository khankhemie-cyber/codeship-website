/**
 * Bus Buddies Road Trip: every character, map tile, block icon and sticker,
 * drawn in SVG. All original. Animation is CSS (bus-buddies.css) and stops
 * under prefers-reduced-motion.
 */
import type { Block, PassengerId } from "@/lib/games/bus/levels";
import { BinaSide, C, PassengerArt } from "./characters";

export { C, BinaFace, BinaSide, BinaTop, Codey, Duck, Owl, PassengerArt, Turtle } from "./characters";

/* ------------------------------------------------------------------ */
/* Map tiles (100 x 100 units each)                                     */
/* ------------------------------------------------------------------ */

const isRoadChar = (ch: string | undefined, stops: string) => !!ch && ("#SG".includes(ch) || stops.includes(ch));

export function Tile({ map, x, y, stops, waving }: { map: string[]; x: number; y: number; stops: string; waving?: boolean }) {
  const ch = map[y][x];
  const ox = x * 100;
  const oy = y * 100;
  const grass = <rect x={ox} y={oy} width="100" height="100" fill={(x + y) % 2 ? C.grass : "#97D774"} />;
  if (isRoadChar(ch, stops)) {
    const n = isRoadChar(map[y - 1]?.[x], stops);
    const s = isRoadChar(map[y + 1]?.[x], stops);
    const w = isRoadChar(map[y]?.[x - 1], stops);
    const e = isRoadChar(map[y]?.[x + 1], stops);
    return (
      <g>
        {grass}
        <rect x={ox + 14} y={oy + 14} width="72" height="72" rx="22" fill={C.road} />
        {n ? <rect x={ox + 14} y={oy} width="72" height="50" fill={C.road} /> : null}
        {s ? <rect x={ox + 14} y={oy + 50} width="72" height="50" fill={C.road} /> : null}
        {w ? <rect x={ox} y={oy + 14} width="50" height="72" fill={C.road} /> : null}
        {e ? <rect x={ox + 50} y={oy + 14} width="50" height="72" fill={C.road} /> : null}
        <g stroke="#fff" strokeWidth="4" strokeDasharray="10 10" opacity=".75">
          {n ? <line x1={ox + 50} y1={oy} x2={ox + 50} y2={oy + 50} /> : null}
          {s ? <line x1={ox + 50} y1={oy + 50} x2={ox + 50} y2={oy + 100} /> : null}
          {w ? <line x1={ox} y1={oy + 50} x2={ox + 50} y2={oy + 50} /> : null}
          {e ? <line x1={ox + 50} y1={oy + 50} x2={ox + 100} y2={oy + 50} /> : null}
        </g>
        {ch === "G" ? <ParkGate ox={ox} oy={oy} /> : null}
        {stops.includes(ch) ? <BusStopSign ox={ox} oy={oy} /> : null}
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
      {ch === "w" ? <rect x={ox} y={oy} width="100" height="100" fill="#4FC3F7" /> : null}
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

export const BLOCK_STYLE: Record<Block, { color: string; label: string }> = {
  forward: { color: C.teal, label: "Forward" },
  left: { color: C.purple, label: "Turn left" },
  right: { color: C.purple, label: "Turn right" },
  honk: { color: "#E0A800", label: "Honk" },
  wait: { color: C.red, label: "Wait" },
  pickup: { color: "#43A047", label: "Pick up" },
};

/**
 * A block's picture. Moves are drawn on screen as Bina will make them: `dir`
 * is the way she faces when the block runs (0 up, 1 right, 2 down, 3 left),
 * so Forward points where she will actually drive.
 */
export function BlockIcon({ block, dir = 0 }: { block: Block; dir?: number }) {
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
          <circle cx="30" cy="30" r="20" fill="none" stroke="#fff" strokeWidth="6" />
          <path d="M30 18 V30 L38 36" {...s} strokeWidth={5} />
        </g>
      ) : null}
      {block === "pickup" ? (
        <g>
          <path d="M18 50 V26 q0 -5 5 -5 q5 0 5 5 V16 q0 -5 5 -5 q5 0 5 5 v10 q0 -4 5 -4 q5 0 5 5 v15 q0 12 -14 12 h-6 q-8 0 -14 -8 l-8 -10 q-3 -4 1 -6 q4 -2 7 2 Z" fill="#fff" />
        </g>
      ) : null}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Stickers                                                             */
/* ------------------------------------------------------------------ */

export function StickerArt({ art, earned = true }: { art: string; earned?: boolean }) {
  const inner =
    art === "turtle" || art === "duck" || art === "owl" ? (
      <svg x="14" y="12" width="72" height="72" viewBox="0 0 100 100">
        <PassengerArt id={art as PassengerId} />
      </svg>
    ) : art === "park" ? (
      <svg x="10" y="14" width="80" height="80" viewBox="0 -10 100 110">
        <ParkGate ox={0} oy={10} />
      </svg>
    ) : (
      <svg x="12" y="18" width="76" height="64" viewBox="0 0 240 160">
        <BinaSide />
      </svg>
    );
  return (
    <svg viewBox="0 0 100 100" className={`h-full w-full ${earned ? "" : "opacity-30 grayscale"}`} aria-hidden>
      <circle cx="50" cy="50" r="46" fill="#fff" />
      <circle cx="50" cy="50" r="40" fill={earned ? "#FFF4C2" : "#E0E0E0"} />
      {earned ? inner : <text x="50" y="62" textAnchor="middle" fontSize="34" fontWeight="900" fill="#9E9E9E" fontFamily="sans-serif">?</text>}
    </svg>
  );
}
