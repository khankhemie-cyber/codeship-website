/**
 * Bus Buddies Road Trip: every character, map tile, block icon and sticker,
 * drawn in SVG. All original. Animation is CSS (bus-buddies.css) and stops
 * under prefers-reduced-motion.
 */
import type { Block, PassengerId } from "@/lib/games/bus/levels";

export const C = {
  navy: "#001432",
  gold: "#F0D030",
  goldDark: "#D4AE12",
  purple: "#7E57C2",
  teal: "#138A9A",
  tealLight: "#BFF4F0",
  grass: "#8FD16C",
  grassDark: "#76BC57",
  road: "#7D8798",
  roadEdge: "#6A7384",
  sky: "#BDE8FF",
  pink: "#FF8FB1",
  orange: "#FF9F43",
  red: "#EF5350",
};

interface Talkable {
  talking?: boolean;
}

/* ------------------------------------------------------------------ */
/* Shared face parts                                                    */
/* ------------------------------------------------------------------ */

function Eye({ cx, cy, r, lid, look = 0 }: { cx: number; cy: number; r: number; lid: string; look?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={C.navy} strokeWidth={r * 0.18} />
      <circle cx={cx + look * r * 0.3} cy={cy + r * 0.1} r={r * 0.5} fill={C.navy} />
      <circle cx={cx + look * r * 0.3 + r * 0.18} cy={cy - r * 0.12} r={r * 0.16} fill="#fff" />
      <ellipse className="bb-lid" cx={cx} cy={cy} rx={r * 1.08} ry={r * 1.08} fill={lid} style={{ transformOrigin: `${cx}px ${cy - r}px` }} />
    </g>
  );
}

function Mouth({ x, y, w, talking, color = "#7A1F2B" }: { x: number; y: number; w: number; talking?: boolean; color?: string }) {
  return talking ? (
    <ellipse className="bb-talk" cx={x} cy={y + w * 0.15} rx={w * 0.42} ry={w * 0.32} fill={color} style={{ transformOrigin: `${x}px ${y}px` }} />
  ) : (
    <path d={`M${x - w / 2} ${y} Q${x} ${y + w * 0.55} ${x + w / 2} ${y}`} fill="none" stroke={C.navy} strokeWidth={w * 0.13} strokeLinecap="round" />
  );
}

/* ------------------------------------------------------------------ */
/* Passengers                                                           */
/* ------------------------------------------------------------------ */

export function Turtle({ talking }: Talkable) {
  return (
    <svg viewBox="0 0 100 100" className="bb-char bb-turtle" aria-hidden>
      <ellipse cx="50" cy="90" rx="34" ry="5" fill="#0002" />
      <ellipse cx="30" cy="84" rx="9" ry="6" fill="#8BC34A" />
      <ellipse cx="62" cy="84" rx="9" ry="6" fill="#8BC34A" />
      <path d="M14 78 Q16 40 46 38 Q74 38 76 78 Z" fill="#43A047" stroke="#2E7D32" strokeWidth="3" />
      <path d="M30 60 l8 -10 l12 0 l6 10 l-6 10 l-12 0 Z M52 52 l8 -6 l8 8" fill="#66BB6A" stroke="#2E7D32" strokeWidth="2" />
      <rect x="14" y="74" width="62" height="8" rx="4" fill="#A5D6A7" />
      <g className="bb-turtle-head">
        <path d="M70 70 Q74 54 80 50" stroke="#8BC34A" strokeWidth="14" strokeLinecap="round" fill="none" />
        <circle cx="82" cy="44" r="15" fill="#9CCC65" stroke="#689F38" strokeWidth="2" />
        <Eye cx={86} cy={40} r={5} lid="#9CCC65" look={0.4} />
        <circle cx="78" cy="49" r="3" fill={C.pink} opacity=".7" />
        <Mouth x={87} y={50} w={8} talking={talking} />
      </g>
    </svg>
  );
}

export function Duck({ talking }: Talkable) {
  return (
    <svg viewBox="0 0 100 100" className="bb-char bb-duck" aria-hidden>
      <ellipse cx="50" cy="92" rx="26" ry="5" fill="#0002" />
      <path d="M38 88 l-6 4 h12 Z M58 88 l-6 4 h12 Z" fill={C.orange} />
      <ellipse cx="50" cy="68" rx="28" ry="22" fill="#FFF6C8" stroke="#E8CF6A" strokeWidth="3" />
      <path d="M26 64 Q16 58 20 72 Q28 76 32 70 Z" fill="#FFF6C8" stroke="#E8CF6A" strokeWidth="2" />
      <circle cx="52" cy="36" r="20" fill="#FFF6C8" stroke="#E8CF6A" strokeWidth="3" />
      <path d="M46 16 q4 -8 8 0" stroke="#E8CF6A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M40 22 l-8 -6 l2 10 Z M40 22 l-8 8 l10 -2 Z" fill={C.purple} />
      <Eye cx={46} cy={32} r={5} lid="#FFF6C8" />
      <Eye cx={60} cy={32} r={5} lid="#FFF6C8" />
      <circle cx="42" cy="42" r="3.5" fill={C.pink} opacity=".7" />
      <circle cx="64" cy="42" r="3.5" fill={C.pink} opacity=".7" />
      <g className={talking ? "bb-beak-talk" : ""} style={{ transformOrigin: "53px 44px" }}>
        <path d="M44 42 Q53 37 62 42 Q53 46 44 42 Z" fill={C.orange} />
      </g>
      <path d="M44 44 Q53 54 62 44 Q53 48 44 44 Z" fill="#F08A24" className={talking ? "bb-jaw-talk" : ""} style={{ transformOrigin: "53px 44px" }} />
    </svg>
  );
}

export function Owl({ talking, asleep }: Talkable & { asleep?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={`bb-char bb-owl ${asleep ? "bb-asleep" : ""}`} aria-hidden>
      <ellipse cx="50" cy="93" rx="26" ry="5" fill="#0002" />
      <path d="M30 26 l-4 -14 l14 8 Z M70 26 l4 -14 l-14 8 Z" fill="#7B5E57" />
      <ellipse cx="50" cy="58" rx="30" ry="34" fill="#8D6E63" stroke="#6D4C41" strokeWidth="3" />
      <ellipse cx="50" cy="68" rx="18" ry="20" fill="#D7CCC8" />
      <path d="M40 64 q4 4 8 0 M52 64 q4 4 8 0 M44 74 q4 4 8 0" stroke="#A1887F" strokeWidth="2" fill="none" />
      <path d="M22 54 Q14 70 26 82 Q30 70 28 56 Z M78 54 Q86 70 74 82 Q70 70 72 56 Z" fill="#7B5E57" />
      <circle cx="39" cy="42" r="12" fill="#EFEBE9" />
      <circle cx="61" cy="42" r="12" fill="#EFEBE9" />
      {asleep ? (
        <g stroke={C.navy} strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d="M32 43 q7 6 14 0" />
          <path d="M54 43 q7 6 14 0" />
        </g>
      ) : (
        <>
          <Eye cx={39} cy={42} r={7} lid="#EFEBE9" />
          <Eye cx={61} cy={42} r={7} lid="#EFEBE9" />
          <path d="M31 36 q8 -3 15 1 M54 37 q7 -4 15 -1" stroke="#6D4C41" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}
      <path d="M46 50 L50 58 L54 50 Z" fill={C.orange} />
      {talking && !asleep ? <ellipse className="bb-talk" cx="50" cy="60" rx="4" ry="3" fill="#7A1F2B" style={{ transformOrigin: "50px 58px" }} /> : null}
      {/* Night cap */}
      <path d="M28 24 Q50 2 74 22 Q86 28 88 40" fill="none" stroke={C.teal} strokeWidth="0" />
      <path d="M26 26 Q48 6 74 24 L86 38 Q60 22 26 26 Z" fill={C.teal} />
      <circle cx="88" cy="40" r="5" fill={C.gold} />
      {asleep ? (
        <g className="bb-zzz" fill={C.purple} fontFamily="sans-serif" fontWeight="900">
          <text x="76" y="18" fontSize="12">z</text>
          <text x="84" y="10" fontSize="9">z</text>
        </g>
      ) : null}
    </svg>
  );
}

export function PassengerArt({ id, talking, asleep }: { id: PassengerId; talking?: boolean; asleep?: boolean }) {
  if (id === "turtle") return <Turtle talking={talking} />;
  if (id === "duck") return <Duck talking={talking} />;
  return <Owl talking={talking} asleep={asleep} />;
}

/* ------------------------------------------------------------------ */
/* Captain Codey                                                        */
/* ------------------------------------------------------------------ */

export function Codey({ talking }: Talkable) {
  return (
    <svg viewBox="0 0 120 120" className="bb-char bb-codey" aria-hidden>
      <path d="M22 120 Q24 90 60 88 Q96 90 98 120 Z" fill={C.navy} />
      <path d="M50 90 L60 104 L70 90 Z" fill="#fff" />
      <circle cx="60" cy="110" r="3" fill={C.gold} />
      <circle cx="34" cy="62" r="8" fill="#B9773F" />
      <circle cx="86" cy="62" r="8" fill="#B9773F" />
      <ellipse cx="60" cy="60" rx="27" ry="30" fill="#C98A50" />
      <path d="M36 46 Q40 30 60 30 Q80 30 84 46 Q74 38 60 40 Q46 38 36 46 Z" fill="#3E2723" />
      <Eye cx={49} cy={58} r={5.5} lid="#C98A50" />
      <Eye cx={71} cy={58} r={5.5} lid="#C98A50" />
      <path d="M43 49 q6 -3 11 0 M66 49 q6 -3 11 0" stroke="#3E2723" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="42" cy="70" r="4.5" fill={C.pink} opacity=".55" />
      <circle cx="78" cy="70" r="4.5" fill={C.pink} opacity=".55" />
      <Mouth x={60} y={73} w={16} talking={talking} />
      {/* Captain's hat */}
      <path d="M30 34 Q60 4 92 34 Z" fill="#fff" stroke="#D9DEE8" strokeWidth="2" />
      <rect x="30" y="31" width="62" height="10" rx="4" fill={C.navy} />
      <path d="M32 40 Q60 52 90 40 L88 44 Q60 56 34 44 Z" fill="#0C2347" />
      <circle cx="61" cy="25" r="7" fill={C.gold} stroke={C.goldDark} strokeWidth="1.5" />
      <path d="M61 20 v10 M56 25 h10" stroke={C.navy} strokeWidth="2" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Bina the Bus                                                         */
/* ------------------------------------------------------------------ */

const WINDOW_X = [30, 76, 122];

/** Side view, for story scenes. */
export function BinaSide({
  talking,
  mood = "idle",
  riders = [],
  driving,
  withCodey = true,
}: Talkable & { mood?: "idle" | "happy" | "confused"; riders?: PassengerId[]; driving?: boolean; withCodey?: boolean }) {
  return (
    <svg viewBox="0 0 240 160" className={`bb-char bb-bina bb-mood-${mood} ${driving ? "bb-driving" : ""}`} aria-hidden>
      <ellipse cx="120" cy="146" rx="104" ry="8" fill="#0002" />
      <g className="bb-bina-body">
        <rect x="12" y="22" width="216" height="104" rx="30" fill={C.gold} stroke={C.goldDark} strokeWidth="4" />
        <rect x="12" y="96" width="216" height="12" fill={C.goldDark} opacity=".6" />
        <rect x="40" y="14" width="150" height="12" rx="6" fill={C.purple} />
        <text x="115" y="24" textAnchor="middle" fontSize="9" fontWeight="900" fill="#fff" fontFamily="sans-serif">
          BUS BUDDIES
        </text>
        {WINDOW_X.map((x, i) => (
          <g key={x}>
            <rect x={x} y="36" width="40" height="40" rx="10" fill={C.tealLight} stroke={C.navy} strokeWidth="3" />
            {riders[i] ? (
              <svg x={x + 2} y="38" width="36" height="36" viewBox="10 4 80 80" overflow="hidden">
                <PassengerArt id={riders[i]} />
              </svg>
            ) : null}
          </g>
        ))}
        <rect x="170" y="32" width="48" height="36" rx="10" fill={C.tealLight} stroke={C.navy} strokeWidth="3" />
        {withCodey ? (
          <svg x="176" y="32" width="36" height="36" viewBox="22 14 76 76">
            <Codey />
          </svg>
        ) : null}
        {/* Face: headlight eyes and smile on the front */}
        <Eye cx={180} cy={88} r={11} lid={C.gold} look={0.5} />
        <Eye cx={208} cy={88} r={11} lid={C.gold} look={0.5} />
        <circle cx="172" cy="106" r="5" fill={C.pink} opacity=".6" />
        <circle cx="220" cy="106" r="5" fill={C.pink} opacity=".6" />
        <Mouth x={196} y={108} w={20} talking={talking} />
        <rect x="222" y="84" width="10" height="16" rx="4" fill="#FFE082" stroke={C.goldDark} strokeWidth="2" />
        <rect x="128" y="86" width="26" height="6" rx="3" fill={C.goldDark} />
      </g>
      {[62, 182].map((cx) => (
        <g key={cx} className="bb-wheel" style={{ transformOrigin: `${cx}px 128px` }}>
          <circle cx={cx} cy="128" r="18" fill={C.navy} />
          <circle cx={cx} cy="128" r="8" fill="#B0BEC5" />
          <path d={`M${cx - 8} 128 h16 M${cx} 120 v16`} stroke={C.navy} strokeWidth="3" />
        </g>
      ))}
    </svg>
  );
}

/** Bina's face, for the speech-bubble portrait. */
export function BinaFace({ talking }: Talkable) {
  return (
    <svg viewBox="0 0 100 100" className="bb-char bb-bina-face" aria-hidden>
      <rect x="8" y="10" width="84" height="84" rx="22" fill={C.gold} stroke={C.goldDark} strokeWidth="4" />
      <rect x="18" y="18" width="64" height="26" rx="9" fill={C.tealLight} stroke={C.navy} strokeWidth="3" />
      <rect x="30" y="6" width="40" height="8" rx="4" fill={C.purple} />
      <Eye cx={34} cy={60} r={11} lid={C.gold} />
      <Eye cx={66} cy={60} r={11} lid={C.gold} />
      <circle cx="20" cy="78" r="5" fill={C.pink} opacity=".6" />
      <circle cx="80" cy="78" r="5" fill={C.pink} opacity=".6" />
      <Mouth x={50} y={80} w={20} talking={talking} />
    </svg>
  );
}

/** Top-down Bina for the map, drawn facing north around (0, 0). */
export function BinaTop() {
  return (
    <g>
      <ellipse cx="3" cy="4" rx="30" ry="42" fill="#0003" />
      <rect x="-28" y="-40" width="56" height="80" rx="16" fill={C.gold} stroke={C.goldDark} strokeWidth="4" />
      <rect x="-20" y="-12" width="40" height="44" rx="8" fill="#F7E27A" />
      <rect x="-6" y="-8" width="12" height="36" rx="5" fill={C.purple} />
      <rect x="-21" y="-34" width="42" height="16" rx="7" fill={C.tealLight} stroke={C.navy} strokeWidth="3" />
      <g className="bb-blink-top">
        <circle cx="-14" cy="-44" r="8" fill="#fff" stroke={C.navy} strokeWidth="2.5" />
        <circle cx="14" cy="-44" r="8" fill="#fff" stroke={C.navy} strokeWidth="2.5" />
        <circle cx="-14" cy="-46" r="4" fill={C.navy} />
        <circle cx="14" cy="-46" r="4" fill={C.navy} />
      </g>
    </g>
  );
}

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

export function BlockIcon({ block }: { block: Block }) {
  const s = { stroke: "#fff", strokeWidth: 7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  return (
    <svg viewBox="0 0 60 60" className="h-full w-full" aria-hidden>
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
