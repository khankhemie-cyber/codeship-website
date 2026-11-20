/**
 * Bus Buddies: the characters. Soft shading, no hard outlines, and always a
 * little alive: they breathe, blink, look around and react. Every part that
 * moves has a class animated in bus-buddies.css (and stilled under
 * prefers-reduced-motion).
 *
 * Shared props: `talking` opens the mouth and adds a talking bob; `mood`
 * switches the face (happy: smiling eyes and a bounce; oops: worried brows
 * and a wobble).
 */
import { useId } from "react";
import type { PassengerId, ThingId } from "@/lib/games/bus/levels";

export type Mood = "idle" | "happy" | "oops";

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
  sky: "#BDE8FF",
  pink: "#FF8FB1",
  orange: "#FF9F43",
  red: "#EF5350",
};

export interface CharProps {
  talking?: boolean;
  mood?: Mood;
}

/** SVG ids must be unique per drawing; React's ids contain colons, which url(#…) dislikes. */
function useGid() {
  return "g" + useId().replace(/[^a-zA-Z0-9]/g, "");
}

const rootClass = (name: string, { talking, mood = "idle" }: CharProps, extra = "") =>
  `bb-char ${name} bb-m-${mood} ${talking ? "bb-talking" : ""} ${extra}`;

/* ------------------------------------------------------------------ */
/* Face parts                                                           */
/* ------------------------------------------------------------------ */

export function Eye({ cx, cy, r, lid, mood = "idle", delay = 0 }: { cx: number; cy: number; r: number; lid: string; mood?: Mood; delay?: number }) {
  if (mood === "happy") {
    return <path d={`M${cx - r * 0.9} ${cy + r * 0.25} Q${cx} ${cy - r * 0.95} ${cx + r * 0.9} ${cy + r * 0.25}`} fill="none" stroke={C.navy} strokeWidth={r * 0.36} strokeLinecap="round" />;
  }
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#DCE4F0" />
      <circle cx={cx} cy={cy - r * 0.08} r={r * 0.92} fill="#fff" />
      <g className="bb-look" style={{ ["--lk" as string]: `${r * 0.3}px`, animationDelay: `${delay}s` }}>
        <circle cx={cx} cy={cy + r * 0.08} r={r * 0.56} fill={C.navy} />
        <circle cx={cx + r * 0.2} cy={cy - r * 0.14} r={r * 0.2} fill="#fff" />
        <circle cx={cx - r * 0.18} cy={cy + r * 0.28} r={r * 0.09} fill="#fff" opacity=".8" />
      </g>
      <ellipse className="bb-lid" cx={cx} cy={cy} rx={r * 1.1} ry={r * 1.1} fill={lid} style={{ transformOrigin: `${cx}px ${cy - r}px`, animationDelay: `${delay}s` }} />
    </g>
  );
}

function Brow({ x, y, w, color, mood = "idle", side }: { x: number; y: number; w: number; color: string; mood?: Mood; side: -1 | 1 }) {
  // oops: inner ends up (worried); happy: high and round.
  const tilt = mood === "oops" ? side * -w * 0.28 : 0;
  const lift = mood === "happy" ? -w * 0.18 : 0;
  return (
    <path
      className="bb-brow"
      d={`M${x - w / 2} ${y + lift - tilt} Q${x} ${y + lift - w * 0.32} ${x + w / 2} ${y + lift + tilt}`}
      fill="none"
      stroke={color}
      strokeWidth={w * 0.2}
      strokeLinecap="round"
    />
  );
}

export function Mouth({ x, y, w, talking, mood = "idle" }: { x: number; y: number; w: number; talking?: boolean; mood?: Mood }) {
  if (talking) {
    return (
      <g className="bb-mouth-talk" style={{ transformOrigin: `${x}px ${y}px` }}>
        <path d={`M${x - w / 2} ${y} Q${x} ${y + w * 0.95} ${x + w / 2} ${y} Z`} fill="#6B1F2A" />
        <ellipse cx={x} cy={y + w * 0.36} rx={w * 0.22} ry={w * 0.12} fill="#FF7A8A" />
      </g>
    );
  }
  if (mood === "happy") {
    return (
      <g>
        <path d={`M${x - w * 0.55} ${y - w * 0.05} Q${x} ${y + w * 0.9} ${x + w * 0.55} ${y - w * 0.05} Z`} fill="#6B1F2A" />
        <ellipse cx={x} cy={y + w * 0.38} rx={w * 0.24} ry={w * 0.12} fill="#FF7A8A" />
      </g>
    );
  }
  if (mood === "oops") {
    return <ellipse cx={x} cy={y + w * 0.12} rx={w * 0.2} ry={w * 0.25} fill="#6B1F2A" />;
  }
  return <path d={`M${x - w / 2} ${y} Q${x} ${y + w * 0.55} ${x + w / 2} ${y}`} fill="none" stroke="#5A2430" strokeWidth={w * 0.14} strokeLinecap="round" />;
}

function Cheeks({ points, r }: { points: [number, number][]; r: number }) {
  return (
    <g className="bb-cheeks">
      {points.map(([x, y]) => (
        <ellipse key={x} cx={x} cy={y} rx={r} ry={r * 0.7} fill={C.pink} opacity=".5" />
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Tuck the Turtle                                                      */
/* ------------------------------------------------------------------ */

export function Turtle(props: CharProps) {
  const id = useGid();
  const { talking, mood } = props;
  return (
    <svg viewBox="0 0 100 100" className={rootClass("bb-turtle", props)} aria-hidden overflow="visible">
      <defs>
        <radialGradient id={`${id}s`} cx="40%" cy="30%" r="75%">
          <stop offset="0" stopColor="#7BD67E" />
          <stop offset=".6" stopColor="#3FA650" />
          <stop offset="1" stopColor="#2A7D3A" />
        </radialGradient>
        <radialGradient id={`${id}k`} cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#C8EE8F" />
          <stop offset="1" stopColor="#8BC34A" />
        </radialGradient>
      </defs>
      <ellipse className="bb-shadow" cx="50" cy="91" rx="34" ry="5" fill="#00143222" />
      <g className="bb-body">
        <ellipse className="bb-leg bb-leg-a" cx="28" cy="83" rx="9" ry="6.5" fill={`url(#${id}k)`} />
        <ellipse className="bb-leg bb-leg-b" cx="64" cy="83" rx="9" ry="6.5" fill={`url(#${id}k)`} />
        <path className="bb-tail" d="M14 76 q-8 2 -9 -3 q5 -1 9 -3 Z" fill="#9CCC65" />
        <path d="M13 79 Q14 38 46 36 Q77 37 79 79 Z" fill={`url(#${id}s)`} />
        <g fill="#ffffff" opacity=".18">
          <path d="M30 62 l7 -11 l13 0 l6 11 l-6 10 l-13 0 Z" />
          <path d="M53 50 l9 -5 l9 9 l-4 9 l-10 -2 Z" />
          <path d="M22 60 l5 -10 l7 2 l-2 14 Z" />
        </g>
        <path d="M24 50 Q34 40 48 40" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity=".45" />
        <rect x="12" y="74" width="68" height="9" rx="4.5" fill="#B7E3A0" />
        <g className="bb-turtle-head">
          <path d="M71 72 Q75 56 80 51" stroke="#9CCC65" strokeWidth="14" strokeLinecap="round" fill="none" />
          <circle cx="83" cy="44" r="16" fill={`url(#${id}k)`} />
          <Eye cx={80} cy={40} r={5.5} lid="#B5DE7E" mood={mood} delay={-0.8} />
          <Eye cx={92} cy={41} r={4.8} lid="#B5DE7E" mood={mood} delay={-0.8} />
          <Brow x={80} y={32} w={7} color="#5E8F2E" mood={mood === "idle" ? "oops" : mood} side={-1} />
          <Cheeks points={[[76, 50]]} r={3.5} />
          <Mouth x={87} y={51} w={8} talking={talking} mood={mood} />
        </g>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Dot the Duck                                                         */
/* ------------------------------------------------------------------ */

export function Duck(props: CharProps) {
  const id = useGid();
  const { talking, mood } = props;
  return (
    <svg viewBox="0 0 100 100" className={rootClass("bb-duck", props)} aria-hidden overflow="visible">
      <defs>
        <radialGradient id={`${id}b`} cx="40%" cy="30%" r="80%">
          <stop offset="0" stopColor="#FFFBE6" />
          <stop offset=".65" stopColor="#FFE98A" />
          <stop offset="1" stopColor="#F5C842" />
        </radialGradient>
        <linearGradient id={`${id}k`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFB547" />
          <stop offset="1" stopColor="#F28A1E" />
        </linearGradient>
      </defs>
      <ellipse className="bb-shadow" cx="50" cy="93" rx="26" ry="5" fill="#00143222" />
      <g className="bb-feet">
        <path className="bb-foot-a" d="M36 88 l-7 5 h14 Z" fill={`url(#${id}k)`} />
        <path className="bb-foot-b" d="M58 88 l-7 5 h14 Z" fill={`url(#${id}k)`} />
      </g>
      <g className="bb-body">
        <path className="bb-tail" d="M22 66 q-10 -10 -8 -18 q6 6 14 8 Z" fill="#FFE98A" />
        <ellipse cx="50" cy="69" rx="29" ry="22" fill={`url(#${id}b)`} />
        <path className="bb-wing" d="M30 64 Q20 66 24 78 Q34 82 40 72 Z" fill="#F7D869" />
        <path className="bb-wing bb-wing-r" d="M70 64 Q80 66 76 78 Q66 82 60 72 Z" fill="#F7D869" />
        <g className="bb-duck-head">
          <circle cx="51" cy="36" r="21" fill={`url(#${id}b)`} />
          <path className="bb-tuft" d="M48 16 q-2 -10 6 -10 q-4 4 0 9 q2 -6 8 -4 q-6 2 -6 7 Z" fill="#F5C842" />
          <g className="bb-bow">
            <path d="M36 22 l-10 -6 l2 12 Z M36 22 l-10 9 l11 -2 Z" fill={C.purple} />
            <circle cx="37" cy="23" r="3" fill="#9C7FD8" />
          </g>
          <Eye cx={44} cy={33} r={6} lid="#FFF2B3" mood={mood} delay={-1.6} />
          <Eye cx={59} cy={33} r={6} lid="#FFF2B3" mood={mood} delay={-1.6} />
          <Brow x={44} y={24} w={7} color="#D9A520" mood={mood} side={-1} />
          <Brow x={59} y={24} w={7} color="#D9A520" mood={mood} side={1} />
          <Cheeks points={[[38, 43], [66, 43]]} r={4} />
          <g className={talking ? "bb-beak-talk" : ""} style={{ transformOrigin: "52px 44px" }}>
            <path d="M42 43 Q52 36 62 43 Q52 48 42 43 Z" fill={`url(#${id}k)`} />
          </g>
          <path d="M43 45 Q52 54 61 45 Q52 49 43 45 Z" fill="#E07A12" className={talking ? "bb-jaw-talk" : mood === "happy" ? "bb-jaw-open" : ""} style={{ transformOrigin: "52px 45px" }} />
        </g>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Olive the Owl                                                        */
/* ------------------------------------------------------------------ */

export function Owl(props: CharProps & { asleep?: boolean }) {
  const id = useGid();
  const { talking, mood, asleep } = props;
  return (
    <svg viewBox="0 0 100 100" className={rootClass("bb-owl", props, asleep ? "bb-asleep" : "")} aria-hidden overflow="visible">
      <defs>
        <radialGradient id={`${id}b`} cx="40%" cy="30%" r="80%">
          <stop offset="0" stopColor="#B08A7C" />
          <stop offset=".7" stopColor="#8D6E63" />
          <stop offset="1" stopColor="#6D4C41" />
        </radialGradient>
        <radialGradient id={`${id}f`} cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E7DCD6" />
        </radialGradient>
      </defs>
      <ellipse className="bb-shadow" cx="50" cy="94" rx="26" ry="5" fill="#00143222" />
      <path d="M40 90 l-4 5 h8 Z M60 90 l-4 5 h8 Z" fill={C.orange} />
      <g className="bb-body">
        <path className="bb-owl-wing" d="M23 52 Q12 70 25 84 Q31 70 29 54 Z" fill="#7B5E57" />
        <path className="bb-owl-wing bb-owl-wing-r" d="M77 52 Q88 70 75 84 Q69 70 71 54 Z" fill="#7B5E57" />
        <ellipse cx="50" cy="60" rx="29" ry="33" fill={`url(#${id}b)`} />
        <ellipse cx="50" cy="70" rx="17" ry="19" fill="#E2D3CB" />
        <path d="M41 64 q4 4 8 0 M52 64 q4 4 8 0 M45 74 q4 4 8 0" stroke="#B9A196" strokeWidth="2" fill="none" strokeLinecap="round" />
        <g className="bb-owl-head">
          <path d="M28 30 l-5 -15 l15 9 Z M72 30 l5 -15 l-15 9 Z" fill="#7B5E57" />
          <circle cx="39" cy="43" r="13" fill={`url(#${id}f)`} />
          <circle cx="61" cy="43" r="13" fill={`url(#${id}f)`} />
          {asleep ? (
            <g stroke={C.navy} strokeWidth="2.6" strokeLinecap="round" fill="none">
              <path d="M32 44 q7 5 14 0" />
              <path d="M54 44 q7 5 14 0" />
            </g>
          ) : (
            <>
              <Eye cx={39} cy={43} r={7.5} lid="#EDE3DD" mood={mood} delay={-2.4} />
              <Eye cx={61} cy={43} r={7.5} lid="#EDE3DD" mood={mood} delay={-2.4} />
              <Brow x={39} y={31} w={11} color="#5D4037" mood={mood} side={-1} />
              <Brow x={61} y={31} w={11} color="#5D4037" mood={mood} side={1} />
            </>
          )}
          <path d="M46 51 Q50 49 54 51 L50 59 Z" fill={C.orange} />
          {talking && !asleep ? <ellipse className="bb-mouth-talk" cx="50" cy="61" rx="4" ry="3" fill="#6B1F2A" style={{ transformOrigin: "50px 59px" }} /> : null}
          <Cheeks points={[[30, 54], [70, 54]]} r={4} />
          {/* Night cap */}
          <path d="M25 27 Q48 5 75 24 L87 39 Q60 21 25 27 Z" fill={C.teal} />
          <path d="M28 27 Q48 12 70 22" stroke="#fff" strokeWidth="2.5" fill="none" opacity=".35" strokeLinecap="round" />
          <circle className="bb-pom" cx="88" cy="41" r="5.5" fill={C.gold} />
        </g>
      </g>
      {asleep ? (
        <g className="bb-zzz" fill={C.purple} fontFamily="sans-serif" fontWeight="900">
          <text x="78" y="16" fontSize="13">z</text>
          <text x="88" y="6" fontSize="9">z</text>
        </g>
      ) : null}
    </svg>
  );
}

export function PassengerArt({ id, talking, asleep, mood }: { id: PassengerId; talking?: boolean; asleep?: boolean; mood?: Mood }) {
  if (id === "turtle") return <Turtle talking={talking} mood={mood} />;
  if (id === "duck") return <Duck talking={talking} mood={mood} />;
  if (id === "owl") return <Owl talking={talking} asleep={asleep} mood={mood} />;
  return <ThingArt id={id} mood={mood} />;
}

/* ------------------------------------------------------------------ */
/* Things to pick up (they bob and sparkle, like the friends breathe)   */
/* ------------------------------------------------------------------ */

export function ThingArt({ id, mood }: { id: ThingId; mood?: Mood }) {
  return (
    <svg viewBox="0 0 100 100" className={rootClass("bb-thing", { mood })} aria-hidden overflow="visible">
      <ellipse className="bb-shadow" cx="50" cy="92" rx="26" ry="5" fill="#00143222" />
      <g className="bb-body">
        {id === "basket" ? (
          <g>
            <path d="M28 48 Q50 10 72 48" stroke="#8D6E63" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M18 48 H82 L74 88 H26 Z" fill="#D7A86E" />
            <path d="M22 60 H78 M24 72 H76 M36 48 L34 88 M50 48 V88 M64 48 L66 88" stroke="#B5844A" strokeWidth="3" />
            <path d="M18 48 H82 L80 56 H20 Z" fill={C.red} />
            <path d="M24 48 h8 v8 h-8 Z M40 48 h8 v8 h-8 Z M56 48 h8 v8 h-8 Z M72 48 h8 v8 h-8 Z" fill="#fff" />
            <circle cx="40" cy="42" r="7" fill={C.red} />
            <circle cx="58" cy="40" r="7" fill="#7CB342" />
          </g>
        ) : null}
        {id === "cake" ? (
          <g>
            <ellipse cx="50" cy="84" rx="36" ry="7" fill="#E0E0E0" />
            <rect x="20" y="52" width="60" height="32" rx="8" fill="#FFB3C7" />
            <path d="M20 60 q7 8 15 0 q7 8 15 0 q7 8 15 0 q7 8 15 0" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" />
            <rect x="28" y="32" width="44" height="22" rx="7" fill="#FFF1C9" />
            <path d="M28 38 q5 6 11 0 q5 6 11 0 q5 6 11 0 q5 6 11 0" stroke={C.pink} strokeWidth="5" fill="none" strokeLinecap="round" />
            {[38, 50, 62].map((x) => (
              <g key={x}>
                <rect x={x - 2.5} y="18" width="5" height="15" rx="2" fill={x === 50 ? C.teal : C.purple} />
                <path className="bb-flame" d={`M${x} 6 q5 7 0 11 q-5 -4 0 -11 Z`} fill="#FFB300" style={{ transformOrigin: `${x}px 17px` }} />
              </g>
            ))}
          </g>
        ) : null}
        {id === "balloons" ? (
          <g>
            <path d="M50 92 Q46 76 34 56 M50 92 Q52 74 52 48 M50 92 Q58 76 68 58" stroke="#90A4AE" strokeWidth="2" fill="none" />
            <g className="bb-balloon">
              <ellipse cx="32" cy="38" rx="15" ry="18" fill={C.red} />
              <path d="M26 30 q2 -6 8 -7" stroke="#fff" strokeWidth="3" fill="none" opacity=".6" strokeLinecap="round" />
            </g>
            <g className="bb-balloon bb-balloon-2">
              <ellipse cx="68" cy="40" rx="15" ry="18" fill={C.teal} />
              <path d="M62 32 q2 -6 8 -7" stroke="#fff" strokeWidth="3" fill="none" opacity=".6" strokeLinecap="round" />
            </g>
            <g className="bb-balloon bb-balloon-3">
              <ellipse cx="52" cy="28" rx="16" ry="19" fill={C.gold} />
              <path d="M45 20 q2 -6 8 -7" stroke="#fff" strokeWidth="3" fill="none" opacity=".6" strokeLinecap="round" />
            </g>
          </g>
        ) : null}
        {id === "gift" ? (
          <g>
            <rect x="22" y="44" width="56" height="44" rx="6" fill={C.purple} />
            <rect x="18" y="36" width="64" height="14" rx="5" fill="#9C7FD8" />
            <rect x="45" y="36" width="10" height="52" fill={C.gold} />
            <path d="M50 36 q-20 -18 -22 -4 q4 8 22 4 Z M50 36 q20 -18 22 -4 q-4 8 -22 4 Z" fill={C.gold} />
            <path d="M28 54 l4 4" stroke="#fff" strokeWidth="3" opacity=".5" strokeLinecap="round" />
          </g>
        ) : null}
        {id === "flowers" ? (
          <g>
            <path d="M50 86 V52 M50 70 Q36 60 32 48 M50 70 Q64 60 68 48" stroke="#43A047" strokeWidth="4" fill="none" />
            <path d="M36 78 L50 92 L64 78 L58 66 H42 Z" fill={C.teal} />
            {[
              [50, 40, C.pink],
              [32, 44, C.gold],
              [68, 44, C.red],
            ].map(([x, y, c]) => (
              <g key={String(x)}>
                {[0, 72, 144, 216, 288].map((a) => (
                  <circle key={a} cx={(x as number) + 8 * Math.cos((a * Math.PI) / 180)} cy={(y as number) + 8 * Math.sin((a * Math.PI) / 180)} r="6.5" fill={c as string} />
                ))}
                <circle cx={x as number} cy={y as number} r="5" fill="#FFF59D" />
              </g>
            ))}
          </g>
        ) : null}
        {id === "hat" ? (
          <g>
            <path d="M22 86 L36 40 L50 86 Z" fill={C.teal} />
            <path d="M50 86 L64 34 L78 86 Z" fill={C.pink} />
            <path d="M26 74 h20 M29 62 h14 M54 74 h20 M57 60 h14" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
            <circle cx="36" cy="38" r="6" fill={C.gold} />
            <circle cx="64" cy="32" r="6" fill={C.gold} />
          </g>
        ) : null}
      </g>
      {mood === "happy" ? (
        <g className="bb-sparkle" fill="#fff">
          <path d="M84 20 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" />
          <path d="M14 30 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" />
        </g>
      ) : null}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Captain Codey                                                        */
/* ------------------------------------------------------------------ */

export function Codey(props: CharProps) {
  const id = useGid();
  const { talking, mood } = props;
  return (
    <svg viewBox="0 0 120 120" className={rootClass("bb-codey", props)} aria-hidden overflow="visible">
      <defs>
        <radialGradient id={`${id}s`} cx="42%" cy="35%" r="70%">
          <stop offset="0" stopColor="#E3A66B" />
          <stop offset="1" stopColor="#B87842" />
        </radialGradient>
        <linearGradient id={`${id}u`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#123466" />
          <stop offset="1" stopColor={C.navy} />
        </linearGradient>
      </defs>
      <g className="bb-body">
        <path d="M20 122 Q22 90 60 88 Q98 90 100 122 Z" fill={`url(#${id}u)`} />
        <path d="M50 90 L60 104 L70 90 Z" fill="#fff" />
        <circle cx="60" cy="110" r="3" fill={C.gold} />
        <rect x="26" y="94" width="16" height="5" rx="2.5" fill={C.gold} />
        <rect x="78" y="94" width="16" height="5" rx="2.5" fill={C.gold} />
        {/* Waving hand */}
        <g className="bb-wave-arm">
          <path d="M96 104 Q108 92 106 76" stroke={`url(#${id}u)`} strokeWidth="12" strokeLinecap="round" fill="none" />
          <circle cx="106" cy="70" r="8" fill={`url(#${id}s)`} />
          <path d="M101 64 v-6 M105 62 v-7 M109 63 v-6" stroke="#C98A50" strokeWidth="3.5" strokeLinecap="round" />
        </g>
        <g className="bb-codey-head">
          <circle cx="34" cy="62" r="8" fill="#B9773F" />
          <circle cx="86" cy="62" r="8" fill="#B9773F" />
          <ellipse cx="60" cy="60" rx="27" ry="30" fill={`url(#${id}s)`} />
          <path d="M36 46 Q40 30 60 30 Q80 30 84 46 Q74 38 60 40 Q46 38 36 46 Z" fill="#3E2723" />
          <Eye cx={49} cy={58} r={6} lid="#D69A5E" mood={mood} delay={-1.1} />
          <Eye cx={71} cy={58} r={6} lid="#D69A5E" mood={mood} delay={-1.1} />
          <Brow x={49} y={48} w={11} color="#3E2723" mood={mood} side={-1} />
          <Brow x={71} y={48} w={11} color="#3E2723" mood={mood} side={1} />
          <Cheeks points={[[41, 70], [79, 70]]} r={5} />
          <path d="M57 64 q3 4 6 0" stroke="#A86A36" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <Mouth x={60} y={74} w={16} talking={talking} mood={mood === "idle" ? "idle" : mood} />
          {/* Captain's hat */}
          <path d="M28 35 Q60 2 94 35 Z" fill="#fff" />
          <path d="M34 30 Q60 10 86 30" stroke="#E6ECF5" strokeWidth="5" fill="none" />
          <rect x="28" y="31" width="66" height="10" rx="5" fill={C.navy} />
          <path d="M31 40 Q60 52 91 40 L89 45 Q60 57 33 45 Z" fill="#0C2347" />
          <circle cx="61" cy="25" r="7.5" fill={C.gold} />
          <path d="M61 20 v10 M56 25 h10" stroke={C.navy} strokeWidth="2" />
        </g>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Bina the Bus                                                         */
/* ------------------------------------------------------------------ */

function BinaDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFE873" />
        <stop offset=".55" stopColor="#F6D02C" />
        <stop offset="1" stopColor="#E3B514" />
      </linearGradient>
      <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#E9FFFC" />
        <stop offset="1" stopColor="#9BE3DC" />
      </linearGradient>
      <radialGradient id={`${id}w`} cx="40%" cy="35%" r="65%">
        <stop offset="0" stopColor="#3A4A66" />
        <stop offset="1" stopColor="#0B1730" />
      </radialGradient>
    </defs>
  );
}

const WINDOW_X = [30, 76, 122];

/** Side view, for story scenes and the riders panel. */
export function BinaSide({
  talking,
  mood = "idle",
  riders = [],
  driving,
  withCodey = true,
}: CharProps & { riders?: PassengerId[]; driving?: boolean; withCodey?: boolean }) {
  const id = useGid();
  return (
    <svg viewBox="0 -14 240 180" className={rootClass("bb-bina", { talking, mood }, driving ? "bb-driving" : "")} aria-hidden overflow="visible">
      <BinaDefs id={id} />
      <ellipse className="bb-shadow" cx="120" cy="150" rx="104" ry="8" fill="#00143226" />
      {driving ? (
        <g className="bb-puffs" fill="#fff">
          <circle className="bb-puff" cx="6" cy="118" r="7" />
          <circle className="bb-puff bb-puff-2" cx="6" cy="118" r="5" />
        </g>
      ) : null}
      <g className="bb-bina-body">
        <g className="bb-antenna">
          <path d="M58 28 L50 4" stroke="#B48F0A" strokeWidth="3" strokeLinecap="round" />
          <circle cx="49" cy="2" r="6" fill={C.pink} />
          <circle cx="47" cy="0" r="2" fill="#fff" opacity=".8" />
        </g>
        <rect x="12" y="24" width="216" height="104" rx="32" fill={`url(#${id}b)`} />
        <path d="M20 114 H220 a10 10 0 0 1 -9 12 H29 a10 10 0 0 1 -9 -12 Z" fill="#D9A80E" opacity=".55" />
        <path d="M44 34 H186" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity=".45" />
        <rect x="40" y="16" width="150" height="13" rx="6.5" fill={C.purple} />
        <text x="115" y="26" textAnchor="middle" fontSize="9" fontWeight="900" fill="#fff" fontFamily="sans-serif" letterSpacing="1">
          BUS BUDDIES
        </text>
        {WINDOW_X.map((x, i) => (
          <g key={x}>
            <rect x={x} y="40" width="40" height="40" rx="11" fill={`url(#${id}g)`} />
            {riders[i] ? (
              <svg x={x + 1} y="41" width="38" height="38" viewBox="8 2 84 84" overflow="hidden">
                <PassengerArt id={riders[i]} mood={mood === "happy" ? "happy" : "idle"} />
              </svg>
            ) : null}
            <path d={`M${x + 7} 58 l11 -11`} stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".7" />
            <rect x={x} y="40" width="40" height="40" rx="11" fill="none" stroke="#C99A0A" strokeWidth="3" />
          </g>
        ))}
        <rect x="170" y="36" width="48" height="30" rx="10" fill={`url(#${id}g)`} />
        {withCodey ? (
          <svg x="177" y="36" width="34" height="30" viewBox="22 14 76 68" overflow="hidden">
            <Codey mood={mood === "happy" ? "happy" : "idle"} />
          </svg>
        ) : null}
        <rect x="170" y="36" width="48" height="30" rx="10" fill="none" stroke="#C99A0A" strokeWidth="3" />
        {/* Mirror "ear" */}
        <g className="bb-mirror">
          <path d="M224 50 h8" stroke="#B48F0A" strokeWidth="3" />
          <rect x="230" y="40" width="8" height="18" rx="4" fill="#B48F0A" />
        </g>
        {/* Face */}
        <g className="bb-bina-face">
          <Eye cx={181} cy={85} r={12} lid="#F6D02C" mood={mood} />
          <Eye cx={210} cy={85} r={12} lid="#F6D02C" mood={mood} />
          <Brow x={181} y={71} w={15} color="#B48F0A" mood={mood} side={-1} />
          <Brow x={210} y={71} w={15} color="#B48F0A" mood={mood} side={1} />
          <Cheeks points={[[170, 100], [221, 100]]} r={6} />
          <Mouth x={196} y={100} w={18} talking={talking} mood={mood} />
        </g>
        <circle className="bb-headlight" cx="225" cy="110" r="5" fill="#FFF4B8" />
        <rect x="128" y="88" width="26" height="6" rx="3" fill="#C99A0A" opacity=".6" />
      </g>
      {[62, 182].map((cx) => (
        <g key={cx} className="bb-wheel" style={{ transformOrigin: `${cx}px 130px` }}>
          <circle cx={cx} cy="130" r="19" fill={`url(#${id}w)`} />
          <circle cx={cx} cy="130" r="8.5" fill="#CFD8DC" />
          <path d={`M${cx - 8} 130 h16 M${cx} 122 v16`} stroke="#90A4AE" strokeWidth="3" />
          <path d={`M${cx - 12} 120 a14 14 0 0 1 10 -5`} stroke="#fff" strokeWidth="2.5" fill="none" opacity=".35" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

/** Bina's face, for the speech-bubble portrait. */
export function BinaFace(props: CharProps) {
  const id = useGid();
  const { talking, mood } = props;
  return (
    <svg viewBox="0 0 100 100" className={rootClass("bb-bina-face-only", props)} aria-hidden overflow="visible">
      <BinaDefs id={id} />
      <g className="bb-body">
        <rect x="8" y="12" width="84" height="82" rx="24" fill={`url(#${id}b)`} />
        <rect x="18" y="20" width="64" height="24" rx="10" fill={`url(#${id}g)`} />
        <path d="M24 38 l10 -12" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".7" />
        <rect x="30" y="7" width="40" height="9" rx="4.5" fill={C.purple} />
        <Eye cx={34} cy={60} r={11} lid="#F6D02C" mood={mood} />
        <Eye cx={66} cy={60} r={11} lid="#F6D02C" mood={mood} />
        <Brow x={34} y={46} w={13} color="#B48F0A" mood={mood} side={-1} />
        <Brow x={66} y={46} w={13} color="#B48F0A" mood={mood} side={1} />
        <Cheeks points={[[20, 78], [80, 78]]} r={5} />
        <Mouth x={50} y={79} w={20} talking={talking} mood={mood} />
      </g>
    </svg>
  );
}

/** Top-down Bina for the map, drawn facing north around (0, 0). */
export function BinaTop() {
  const id = useGid();
  return (
    <g className="bb-bina-top">
      <defs>
        <linearGradient id={`${id}t`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E3B514" />
          <stop offset=".35" stopColor="#FFE873" />
          <stop offset="1" stopColor="#E9BF1A" />
        </linearGradient>
      </defs>
      <ellipse cx="4" cy="6" rx="31" ry="43" fill="#0014322e" />
      <rect x="-29" y="-41" width="58" height="82" rx="18" fill={`url(#${id}t)`} />
      <rect x="-20" y="-12" width="40" height="44" rx="9" fill="#FFF0A0" opacity=".7" />
      <rect x="-6" y="-8" width="12" height="36" rx="6" fill={C.purple} />
      <rect x="-21" y="-35" width="42" height="17" rx="8" fill="#BFF4F0" />
      <path d="M-14 -22 l8 -9" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".8" />
      <g className="bb-top-eyes">
        <circle cx="-14" cy="-45" r="9" fill="#fff" />
        <circle cx="14" cy="-45" r="9" fill="#fff" />
        <g className="bb-look" style={{ ["--lk" as string]: "2.5px" }}>
          <circle cx="-14" cy="-47" r="4.6" fill={C.navy} />
          <circle cx="14" cy="-47" r="4.6" fill={C.navy} />
          <circle cx="-12.5" cy="-48.5" r="1.6" fill="#fff" />
          <circle cx="15.5" cy="-48.5" r="1.6" fill="#fff" />
        </g>
      </g>
    </g>
  );
}
