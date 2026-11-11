/**
 * Illustrated, gently animated scenes behind the stage in CODEship Blocks and
 * the Playground's Sprite Party. Each scene is inline SVG (nothing to
 * download) drawn on a 1000 x 800 canvas and cropped to fit the stage, with
 * the important scenery kept between y = 100 and y = 700 so a wide stage
 * doesn't cut it off.
 *
 * Movement is CSS keyframes on SVG groups: cheap on a Chromebook, and turned
 * off for anyone who asks their device for reduced motion. Animation stays
 * in the background layer, behind the characters and the counting grid.
 *
 * Scene ids are stored in saved projects and level files, so never rename
 * or remove one; add new ids instead.
 */

import type { ReactNode } from "react";

const CSS = `
.sc * { transform-box: fill-box; transform-origin: center; }
@keyframes sc-drift { from { transform: translateX(-320px); } to { transform: translateX(1320px); } }
@keyframes sc-drift-back { from { transform: translateX(1320px) scaleX(-1); } to { transform: translateX(-320px) scaleX(-1); } }
@keyframes sc-spin { to { transform: rotate(360deg); } }
@keyframes sc-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-18px); } }
@keyframes sc-sway { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
@keyframes sc-twinkle { 0%,100% { opacity: 1; } 50% { opacity: 0.15; } }
@keyframes sc-rise { from { transform: translateY(0); opacity: 0; } 10% { opacity: 0.9; } to { transform: translateY(-760px); opacity: 0; } }
@keyframes sc-fall { from { transform: translateY(-120px); } to { transform: translateY(900px); } }
@keyframes sc-fall-spin { from { transform: translateY(-120px) rotate(0); } to { transform: translateY(900px) rotate(720deg); } }
@keyframes sc-shoot { 0%,82% { transform: translate(0,0); opacity: 0; } 84% { opacity: 1; } 100% { transform: translate(-700px, 350px); opacity: 0; } }
@keyframes sc-pulse { 0%,100% { opacity: 0.35; } 50% { opacity: 0.85; } }
@keyframes sc-wave { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-40px); } }
@keyframes sc-flap { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(-0.6); } }
.sc-drift { animation: sc-drift linear infinite; }
.sc-drift-back { animation: sc-drift-back linear infinite; }
.sc-spin { animation: sc-spin 40s linear infinite; }
.sc-bob { animation: sc-bob 4s ease-in-out infinite; }
.sc-sway { animation: sc-sway 3.5s ease-in-out infinite; transform-origin: bottom center; }
.sc-twinkle { animation: sc-twinkle 2.6s ease-in-out infinite; }
.sc-rise { animation: sc-rise linear infinite; }
.sc-fall { animation: sc-fall linear infinite; }
.sc-fall-spin { animation: sc-fall-spin linear infinite; }
.sc-shoot { animation: sc-shoot 9s ease-in infinite; }
.sc-pulse { animation: sc-pulse 3s ease-in-out infinite; }
.sc-wave { animation: sc-wave 5s ease-in-out infinite; }
.sc-flap { animation: sc-flap 0.5s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .sc * { animation: none !important; } }
.sc-still * { animation: none !important; }
`;

/** Small deterministic random, so a scene looks the same every time. */
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

const d = (sec: number, delay = 0) => ({ animationDuration: `${sec}s`, animationDelay: `${-delay}s` });

const Cloud = ({ x, y, s = 1, o = 0.95 }: { x: number; y: number; s?: number; o?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <ellipse cx="0" cy="18" rx="80" ry="26" fill="#fff" />
    <circle cx="-34" cy="6" r="30" fill="#fff" />
    <circle cx="10" cy="-8" r="40" fill="#fff" />
    <circle cx="48" cy="8" r="26" fill="#fff" />
  </g>
);

function Clouds({ y0 = 110, n = 4, speed = 70, seed = 3 }: { y0?: number; n?: number; speed?: number; seed?: number }) {
  const r = rng(seed);
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const dur = speed * (0.7 + r() * 0.6);
        return (
          <g key={i} className="sc-drift" style={d(dur, (dur * i) / n)}>
            <Cloud x={0} y={y0 + r() * 140} s={0.6 + r() * 0.7} />
          </g>
        );
      })}
    </>
  );
}

function Stars({ n = 60, h = 520, seed = 7, colour = "#FFF9C4" }: { n?: number; h?: number; seed?: number; colour?: string }) {
  const r = rng(seed);
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} className="sc-twinkle" style={d(1.5 + r() * 3, r() * 4)} cx={r() * 1000} cy={r() * h} r={1.2 + r() * 2.8} fill={colour} />
      ))}
    </>
  );
}

const Sun = ({ x, y, r = 60 }: { x: number; y: number; r?: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <g className="sc-spin">
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={-6} y={-r - 38} width={12} height={28} rx={6} fill="#FFD54F" transform={`rotate(${i * 30})`} />
      ))}
    </g>
    <circle r={r + 14} fill="#FFE082" opacity="0.5" />
    <circle r={r} fill="#FFCA28" />
    <circle cx={-r * 0.3} cy={-r * 0.25} r={r * 0.25} fill="#FFE082" opacity="0.7" />
  </g>
);

const Tree = ({ x, y, s = 1, sway = false }: { x: number; y: number; s?: number; sway?: boolean }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-9" y="-60" width="18" height="62" rx="4" fill="#795548" />
    <g className={sway ? "sc-sway" : undefined}>
      <circle cx="0" cy="-92" r="48" fill="#43A047" />
      <circle cx="-30" cy="-70" r="30" fill="#388E3C" />
      <circle cx="30" cy="-70" r="30" fill="#388E3C" />
      <circle cx="-14" cy="-108" r="16" fill="#66BB6A" />
    </g>
  </g>
);

const Pine = ({ x, y, s = 1, snow = false }: { x: number; y: number; s?: number; snow?: boolean }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-8" y="-20" width="16" height="22" fill="#6D4C41" />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <path d={`M0 ${-150 + i * 40}L${-50 - i * 12} ${-60 + i * 40}H${50 + i * 12}z`} fill={["#2E7D32", "#1B5E20", "#2E7D32"][i]} />
        {snow && <path d={`M0 ${-150 + i * 40}L${-22 - i * 4} ${-110 + i * 40}H${22 + i * 4}z`} fill="#fff" />}
      </g>
    ))}
  </g>
);

const Flower = ({ x, y, c }: { x: number; y: number; c: string }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M0 0v-22" stroke="#2E7D32" strokeWidth="4" />
    {[0, 72, 144, 216, 288].map((a) => (
      <circle key={a} cx="0" cy="-30" r="7" fill={c} transform={`rotate(${a} 0 -22)`} />
    ))}
    <circle cx="0" cy="-22" r="5" fill="#FFEB3B" />
  </g>
);

const Bird = ({ y, dur, delay, s = 1 }: { y: number; dur: number; delay: number; s?: number }) => (
  <g className="sc-drift" style={d(dur, delay)}>
    <g transform={`translate(0 ${y}) scale(${s})`}>
      <g className="sc-flap">
        <path d="M-18 0q9-12 18 0q9-12 18 0" fill="none" stroke="#37474F" strokeWidth="4" strokeLinecap="round" />
      </g>
    </g>
  </g>
);

const Fish = ({ y, c, dur, delay, back }: { y: number; c: string; dur: number; delay: number; back?: boolean }) => (
  <g className={back ? "sc-drift-back" : "sc-drift"} style={d(dur, delay)}>
    <g transform={`translate(0 ${y})`}>
      <path d="M-30 0q30-28 56 0q-26 28-56 0z" fill={c} />
      <path d="M-28 0l-20-16v32z" fill={c} />
      <circle cx="14" cy="-4" r="4" fill="#fff" />
      <circle cx="15" cy="-4" r="2" fill="#010F2A" />
    </g>
  </g>
);

const Balloon = ({ x, y, c, dur }: { x: number; y: number; c: string; dur: number }) => (
  <g className="sc-bob" style={d(dur, x % 3)}>
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 40q-8 30 6 60" stroke="#78909C" strokeWidth="2" fill="none" />
      <ellipse cx="0" cy="0" rx="32" ry="40" fill={c} />
      <ellipse cx="-11" cy="-14" rx="7" ry="12" fill="#fff" opacity="0.45" />
      <path d="M-5 40h10l-5 8z" fill={c} />
    </g>
  </g>
);

function Windows({ x, y, w, h, seed, lit = "#FFF59D", dark = "#455A64" }: { x: number; y: number; w: number; h: number; seed: number; lit?: string; dark?: string }) {
  const r = rng(seed);
  const out: ReactNode[] = [];
  for (let wy = y + 16; wy < y + h - 24; wy += 34)
    for (let wx = x + 14; wx < x + w - 22; wx += 30) {
      const on = r() > 0.4;
      out.push(<rect key={`${wx}-${wy}`} className={on && r() > 0.8 ? "sc-pulse" : undefined} style={d(2 + r() * 4, r() * 3)} x={wx} y={wy} width={14} height={18} rx={2} fill={on ? lit : dark} />);
    }
  return <>{out}</>;
}

// ── The scenes ─────────────────────────────────────────────────────────────

const SCENES: Record<string, () => ReactNode> = {
  grass: () => (
    <>
      <defs>
        <linearGradient id="sc-g-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4FC3F7" />
          <stop offset="1" stopColor="#E1F5FE" />
        </linearGradient>
      </defs>
      <rect width="1000" height="800" fill="url(#sc-g-sky)" />
      <Sun x={850} y={215} />
      <Clouds n={4} speed={80} />
      <Bird y={200} dur={26} delay={4} />
      <Bird y={230} dur={30} delay={18} s={0.7} />
      <path d="M0 430q160-90 330-20t330-30 340 40V800H0z" fill="#81C784" />
      <path d="M0 480q200-60 420 0t580-30V800H0z" fill="#66BB6A" />
      <Tree x={120} y={470} s={1.1} sway />
      <Tree x={880} y={460} s={0.9} sway />
      <Tree x={640} y={450} s={0.6} />
      <path d="M0 560q250-40 500 0t500 0V800H0z" fill="#4CAF50" />
      {[[80, 700, "#E91E63"], [210, 640, "#FFEB3B"], [380, 720, "#BA68C8"], [560, 650, "#FF7043"], [730, 710, "#E91E63"], [900, 640, "#29B6F6"], [470, 600, "#FFFFFF"], [820, 600, "#FFEB3B"]].map(([x, y, c], i) => (
        <Flower key={i} x={x as number} y={y as number} c={c as string} />
      ))}
    </>
  ),

  map: () => (
    <>
      <rect width="1000" height="800" fill="#C5E1A5" />
      {rng(11) && Array.from({ length: 40 }, (_, i) => <circle key={i} cx={(i * 137) % 1000} cy={(i * 251) % 800} r="10" fill="#AED581" />)}
      <path d="M-20 620q200-60 320 20t320-40 400 60" stroke="#4FC3F7" strokeWidth="46" fill="none" />
      <path d="M-20 620q200-60 320 20t320-40 400 60" stroke="#81D4FA" strokeWidth="14" fill="none" strokeDasharray="30 40" className="sc-wave" />
      <ellipse cx="800" cy="230" rx="110" ry="70" fill="#4FC3F7" />
      <ellipse cx="780" cy="215" rx="40" ry="14" fill="#B3E5FC" opacity="0.8" className="sc-pulse" />
      <rect x="0" y="360" width="1000" height="56" fill="#90A4AE" />
      <rect x="440" y="0" width="56" height="800" fill="#90A4AE" />
      <path d="M0 388H1000M468 0V800" stroke="#fff" strokeWidth="5" strokeDasharray="26 22" />
      <rect x="430" y="590" width="76" height="70" fill="#8D6E63" />
      {[[120, 200, "#E53935"], [260, 230, "#1E88E5"], [620, 520, "#FB8C00"], [760, 500, "#8E24AA"], [180, 520, "#43A047"]].map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <rect x="-36" y="-20" width="72" height="56" fill="#FFF8E1" stroke="#8D6E63" strokeWidth="3" />
          <path d="M-46 -18L0 -60l46 42z" fill={c as string} />
          <rect x="-8" y="10" width="16" height="26" fill="#6D4C41" />
        </g>
      ))}
      <Tree x={330} y={300} s={0.6} />
      <Tree x={620} y={300} s={0.55} />
      <Tree x={900} y={720} s={0.6} />
      <Tree x={60} y={740} s={0.5} />
      <g className="sc-drift" style={d(14, 3)}>
        <g transform="translate(0 362)">
          <rect x="-30" y="0" width="60" height="22" rx="8" fill="#E53935" />
          <rect x="-18" y="-10" width="34" height="14" rx="5" fill="#EF9A9A" />
          <circle cx="-16" cy="22" r="7" fill="#263238" />
          <circle cx="16" cy="22" r="7" fill="#263238" />
        </g>
      </g>
    </>
  ),

  room: () => (
    <>
      <rect width="1000" height="800" fill="#FFF3E0" />
      {Array.from({ length: 21 }, (_, i) => <rect key={i} x={i * 50} y="0" width="22" height="560" fill="#FFE0B2" opacity="0.7" />)}
      <rect x="0" y="540" width="1000" height="22" fill="#A1887F" />
      <rect x="0" y="560" width="1000" height="240" fill="#D7B899" />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M0 ${590 + i * 30}H1000`} stroke="#C49A72" strokeWidth="3" />)}
      <g transform="translate(140 140)">
        <rect width="250" height="200" rx="8" fill="#81D4FA" stroke="#8D6E63" strokeWidth="14" />
        <g className="sc-drift" style={d(30)}>
          <Cloud x={-80} y={70} s={0.5} />
        </g>
        <rect width="250" height="200" rx="8" fill="none" stroke="#8D6E63" strokeWidth="14" />
        <path d="M125 0v200M0 100h250" stroke="#8D6E63" strokeWidth="8" />
        <path d="M-30 -20q60 120 0 240" fill="#EF5350" />
        <path d="M280 -20q-60 120 0 240" fill="#EF5350" />
      </g>
      <rect x="560" y="150" width="260" height="14" fill="#795548" />
      {[["#E53935", 40], ["#1E88E5", 34], ["#43A047", 46], ["#FDD835", 30], ["#8E24AA", 42]].map(([c, h], i) => (
        <rect key={i} x={575 + i * 34} y={150 - (h as number)} width="28" height={h as number} fill={c as string} />
      ))}
      <g transform="translate(760 70)">
        <rect x="0" y="0" width="12" height="12" fill="#795548" />
      </g>
      <rect x="600" y="230" width="150" height="110" fill="#FFF" stroke="#795548" strokeWidth="8" />
      <path d="M612 330l40-50 30 30 25-25 30 45z" fill="#66BB6A" />
      <circle cx="715" cy="262" r="12" fill="#FFCA28" />
      <ellipse cx="500" cy="690" rx="300" ry="70" fill="#7E57C2" />
      <ellipse cx="500" cy="690" rx="230" ry="48" fill="#9575CD" />
      <ellipse cx="500" cy="690" rx="150" ry="28" fill="#B39DDB" />
      <g transform="translate(900 540)">
        <rect x="-6" y="-200" width="12" height="200" fill="#5D4037" />
        <path d="M-50 -200h100l-20 -70h-60z" fill="#FFCA28" />
        <ellipse cx="0" cy="-200" rx="90" ry="40" fill="#FFF59D" opacity="0.4" className="sc-pulse" />
      </g>
    </>
  ),

  street: () => (
    <>
      <defs>
        <linearGradient id="sc-s-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#64B5F6" />
          <stop offset="1" stopColor="#E3F2FD" />
        </linearGradient>
      </defs>
      <rect width="1000" height="800" fill="url(#sc-s-sky)" />
      <Clouds n={3} speed={90} y0={100} seed={5} />
      {[[0, 260, 150, "#90A4AE"], [150, 200, 130, "#EF9A9A"], [280, 300, 170, "#FFCC80"], [450, 180, 120, "#80CBC4"], [570, 250, 160, "#B39DDB"], [730, 220, 140, "#A5D6A7"], [870, 280, 140, "#FFAB91"]].map(([x, top, w, c], i) => (
        <g key={i}>
          <rect x={x as number} y={top as number} width={w as number} height={560 - (top as number)} fill={c as string} />
          <Windows x={x as number} y={top as number} w={w as number} h={560 - (top as number) - 40} seed={i + 2} lit="#E3F2FD" dark="#B0BEC5" />
        </g>
      ))}
      <rect x="0" y="540" width="1000" height="40" fill="#BDBDBD" />
      <rect x="0" y="580" width="1000" height="220" fill="#546E7A" />
      <path d="M0 690H1000" stroke="#FFEB3B" strokeWidth="8" strokeDasharray="50 40" />
      <Tree x={90} y={545} s={0.7} sway />
      <Tree x={640} y={545} s={0.7} sway />
      <g transform="translate(400 545)">
        <rect x="-4" y="-150" width="8" height="150" fill="#37474F" />
        <circle cx="0" cy="-155" r="14" fill="#FFF59D" className="sc-pulse" />
      </g>
      <g className="sc-drift" style={d(9, 2)}>
        <g transform="translate(0 600)">
          <rect x="-60" y="0" width="120" height="40" rx="14" fill="#1E88E5" />
          <rect x="-36" y="-26" width="70" height="30" rx="10" fill="#64B5F6" />
          <circle cx="-34" cy="42" r="13" fill="#263238" />
          <circle cx="34" cy="42" r="13" fill="#263238" />
        </g>
      </g>
      <g className="sc-drift-back" style={d(12, 7)}>
        <g transform="translate(0 710)">
          <rect x="-70" y="0" width="140" height="44" rx="12" fill="#FDD835" />
          <rect x="-58" y="-28" width="100" height="32" rx="8" fill="#FFF59D" />
          <circle cx="-40" cy="46" r="13" fill="#263238" />
          <circle cx="40" cy="46" r="13" fill="#263238" />
        </g>
      </g>
      <Bird y={160} dur={24} delay={10} />
    </>
  ),

  sky: () => (
    <>
      <defs>
        <linearGradient id="sc-k-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#29B6F6" />
          <stop offset="0.7" stopColor="#B3E5FC" />
          <stop offset="1" stopColor="#FFF8E1" />
        </linearGradient>
      </defs>
      <rect width="1000" height="800" fill="url(#sc-k-sky)" />
      <Sun x={160} y={215} r={55} />
      <Clouds n={7} speed={60} y0={140} seed={9} />
      <g className="sc-bob" style={d(6)}>
        <g transform="translate(760 300)">
          <path d="M-62 0a62 70 0 1 1 124 0q0 40-40 76h-44q-40-36-40-76z" fill="#EF5350" />
          <path d="M-20 -68q-20 70 0 144h40q20-74 0-144z" fill="#FFCA28" />
          <path d="M-22 76l6 30M22 76l-6 30" stroke="#6D4C41" strokeWidth="3" />
          <rect x="-20" y="104" width="40" height="30" rx="4" fill="#8D6E63" />
        </g>
      </g>
      <Bird y={260} dur={22} delay={2} />
      <Bird y={300} dur={28} delay={12} s={0.8} />
      <Bird y={420} dur={34} delay={20} s={0.6} />
      <g opacity="0.9">
        <Cloud x={150} y={700} s={2} />
        <Cloud x={480} y={720} s={2.4} />
        <Cloud x={850} y={700} s={2} />
      </g>
    </>
  ),

  party: () => {
    const r = rng(21);
    const colours = ["#E91E63", "#29B6F6", "#FFEB3B", "#66BB6A", "#AB47BC", "#FF7043"];
    return (
      <>
        <rect width="1000" height="800" fill="#4A148C" />
        {[["#F06292", 200], ["#4FC3F7", 500], ["#FFF176", 800]].map(([c, x], i) => (
          <path key={i} className="sc-pulse" style={d(2.5, i)} d={`M${x} 0L${(x as number) - 180} 800H${(x as number) + 180}z`} fill={c as string} opacity="0.5" />
        ))}
        <rect x="0" y="600" width="1000" height="200" fill="#311B92" />
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} className="sc-pulse" style={d(1.6, i * 0.3)} x={i * 100} y="600" width="100" height="200" fill={colours[i % 6]} opacity="0.5" />
        ))}
        <path d="M0 130q125 60 250 0t250 0 250 0 250 0" stroke="#FFF" strokeWidth="3" fill="none" />
        {Array.from({ length: 16 }, (_, i) => {
          const x = 30 + i * 62;
          const y = 130 + Math.sin((i / 4) * Math.PI) * 30;
          return (
            <g key={i} className="sc-sway" style={d(2 + (i % 3) * 0.4, i * 0.2)}>
              <path d={`M${x - 20} ${y}h40l-20 46z`} fill={colours[i % 6]} />
            </g>
          );
        })}
        <Balloon x={110} y={330} c="#E91E63" dur={4} />
        <Balloon x={190} y={380} c="#FFEB3B" dur={5} />
        <Balloon x={830} y={320} c="#29B6F6" dur={4.5} />
        <Balloon x={910} y={390} c="#66BB6A" dur={3.8} />
        {Array.from({ length: 36 }, (_, i) => (
          <rect key={i} className="sc-fall-spin" style={d(5 + r() * 6, r() * 10)} x={r() * 1000} y="0" width="12" height="7" fill={colours[i % 6]} />
        ))}
        <g transform="translate(500 175)">
          <g className="sc-spin" style={d(8)}>
            <circle r="40" fill="#CFD8DC" />
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x="-6" y="-38" width="12" height="12" fill={i % 2 ? "#ECEFF1" : "#90A4AE"} transform={`rotate(${i * 30})`} />
            ))}
          </g>
        </g>
      </>
    );
  },

  night: () => (
    <>
      <defs>
        <linearGradient id="sc-n-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0D1440" />
          <stop offset="1" stopColor="#3F51B5" />
        </linearGradient>
      </defs>
      <rect width="1000" height="800" fill="url(#sc-n-sky)" />
      <Stars n={80} h={560} />
      <g className="sc-shoot">
        <path d="M900 90l90-40" stroke="#FFF" strokeWidth="4" strokeLinecap="round" />
        <circle cx="900" cy="90" r="5" fill="#FFF" />
      </g>
      <g transform="translate(800 180)">
        <circle r="95" fill="#FFF9C4" opacity="0.15" />
        <circle r="70" fill="#FFF9C4" />
        <circle cx="-22" cy="-14" r="12" fill="#F0E68C" />
        <circle cx="20" cy="22" r="16" fill="#F0E68C" />
        <circle cx="26" cy="-28" r="7" fill="#F0E68C" />
      </g>
      <g className="sc-drift" style={d(90, 30)}>
        <Cloud x={0} y={280} s={0.8} o={0.25} />
      </g>
      {[[0, 420, 140], [140, 360, 110], [250, 450, 130], [380, 330, 120], [500, 400, 150], [650, 300, 110], [760, 380, 130], [890, 430, 110]].map(([x, top, w], i) => (
        <g key={i}>
          <rect x={x} y={top} width={w} height={800 - top} fill={i % 2 ? "#1A237E" : "#283593"} />
          <Windows x={x} y={top} w={w} h={760 - top} seed={i + 30} />
        </g>
      ))}
      <rect x="0" y="740" width="1000" height="60" fill="#0D1440" />
    </>
  ),

  plain: () => (
    <>
      <rect width="1000" height="800" fill="#FFFFFF" />
      {Array.from({ length: 11 * 9 }, (_, i) => (
        <circle key={i} cx={(i % 11) * 100} cy={Math.floor(i / 11) * 100} r="3" fill="#E3E8EF" />
      ))}
    </>
  ),

  ocean: () => {
    const r = rng(41);
    return (
      <>
        <defs>
          <linearGradient id="sc-o-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4FC3F7" />
            <stop offset="1" stopColor="#01579B" />
          </linearGradient>
        </defs>
        <rect width="1000" height="800" fill="url(#sc-o-sea)" />
        {[150, 380, 620, 860].map((x, i) => (
          <path key={x} className="sc-pulse" style={d(5, i)} d={`M${x} 0l-120 800h90l90-800z`} fill="#E1F5FE" opacity="0.25" />
        ))}
        <Fish y={220} c="#FFCA28" dur={18} delay={2} />
        <Fish y={320} c="#FF7043" dur={22} delay={11} back />
        <Fish y={420} c="#BA68C8" dur={16} delay={6} />
        <Fish y={270} c="#4DD0E1" dur={26} delay={17} back />
        <path d="M0 660q120-40 250 0t250 0 250 0 250 0V800H0z" fill="#FFE082" />
        <path d="M0 700q140-20 300 10t340-10 360 10V800H0z" fill="#FFD54F" />
        {[[80, "#43A047"], [160, "#2E7D32"], [700, "#43A047"], [930, "#2E7D32"], [480, "#66BB6A"]].map(([x, c], i) => (
          <g key={i} className="sc-sway" style={d(3 + i * 0.5, i)}>
            <path d={`M${x} 700q-30-60 0-120t0-120q30 60 0 120t0 120`} fill={c as string} />
          </g>
        ))}
        <g transform="translate(300 690)">
          <path d="M0 0v-70M0 -40l-30-30M0 -50l28-34M-30 -70v-20M28 -84v-16" stroke="#FF7043" strokeWidth="14" strokeLinecap="round" fill="none" />
        </g>
        <g transform="translate(820 700)">
          <path d="M0 0v-60M0 -30l-26-26M0 -40l24-28" stroke="#F06292" strokeWidth="14" strokeLinecap="round" fill="none" />
        </g>
        <path d="M580 712l14-20 14 20 20-4-14 16 6 22-26-10-26 10 6-22-14-16z" fill="#FF8A65" />
        {Array.from({ length: 18 }, (_, i) => (
          <circle key={i} className="sc-rise" style={d(6 + r() * 6, r() * 10)} cx={r() * 1000} cy="760" r={4 + r() * 8} fill="none" stroke="#E1F5FE" strokeWidth="3" />
        ))}
      </>
    );
  },

  space: () => (
    <>
      <defs>
        <radialGradient id="sc-p-neb" cx="0.3" cy="0.4" r="0.8">
          <stop offset="0" stopColor="#6A1B9A" />
          <stop offset="0.5" stopColor="#1A1050" />
          <stop offset="1" stopColor="#05051A" />
        </radialGradient>
      </defs>
      <rect width="1000" height="800" fill="url(#sc-p-neb)" />
      <Stars n={110} h={800} seed={13} colour="#FFFFFF" />
      <g className="sc-shoot" style={d(11)}>
        <path d="M900 90l90-40" stroke="#B3E5FC" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g transform="translate(200 230)">
        <circle r="80" fill="#FF7043" />
        <path d="M-78 -10q78 20 156 0M-70 30q70 16 140 0" stroke="#FFAB91" strokeWidth="10" fill="none" />
      </g>
      <g transform="translate(780 520)">
        <g className="sc-spin" style={d(60)}>
          <ellipse rx="150" ry="38" fill="none" stroke="#FFE082" strokeWidth="12" transform="rotate(-18)" />
        </g>
        <circle r="90" fill="#7E57C2" />
        <circle cx="-30" cy="-20" r="20" fill="#9575CD" />
        <circle cx="30" cy="30" r="14" fill="#9575CD" />
      </g>
      <g className="sc-bob" style={d(5)}>
        <g transform="translate(520 300) rotate(-30)">
          <path d="M0 -60q30 30 24 90h-48q-6-60 24-90z" fill="#ECEFF1" />
          <circle cy="-10" r="12" fill="#4FC3F7" stroke="#90A4AE" strokeWidth="4" />
          <path d="M-24 30l-18 26h18zM24 30l18 26h-18z" fill="#E53935" />
          <path className="sc-pulse" style={d(0.4)} d="M-14 32q14 50 28 0z" fill="#FFCA28" />
        </g>
      </g>
      <g transform="translate(100 680)">
        <circle r="34" fill="#B0BEC5" />
        <circle cx="-10" cy="-8" r="8" fill="#90A4AE" />
        <circle cx="12" cy="10" r="6" fill="#90A4AE" />
      </g>
    </>
  ),

  snow: () => {
    const r = rng(51);
    return (
      <>
        <defs>
          <linearGradient id="sc-w-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#90CAF9" />
            <stop offset="1" stopColor="#E3F2FD" />
          </linearGradient>
        </defs>
        <rect width="1000" height="800" fill="url(#sc-w-sky)" />
        <path d="M0 420l160-180 140 120 160-200 200 220 140-140 200 180V800H0z" fill="#B0BEC5" />
        <path d="M160 240l-50 56 40-8 30 30 30-36zM460 160l-60 70 50-10 30 30 40-40zM800 220l-46 50 40-6 26 24 30-34z" fill="#fff" />
        <path d="M0 500q250-80 500 0t500 0V800H0z" fill="#ECEFF1" />
        <path d="M0 580q300-60 600 0t400 0V800H0z" fill="#FFFFFF" />
        <Pine x={90} y={560} s={1} snow />
        <Pine x={200} y={590} s={0.7} snow />
        <Pine x={900} y={560} s={1.1} snow />
        <g transform="translate(700 640)">
          <circle cy="0" r="56" fill="#fff" stroke="#CFD8DC" strokeWidth="3" />
          <circle cy="-80" r="40" fill="#fff" stroke="#CFD8DC" strokeWidth="3" />
          <rect x="-28" y="-140" width="56" height="12" fill="#263238" />
          <rect x="-18" y="-180" width="36" height="42" fill="#263238" />
          <circle cx="-12" cy="-88" r="4" fill="#263238" />
          <circle cx="12" cy="-88" r="4" fill="#263238" />
          <path d="M0 -78l26 6-26 6z" fill="#FF7043" />
          <path d="M-36 -46q36 16 72 0" stroke="#E53935" strokeWidth="10" fill="none" />
          <circle cy="-10" r="5" fill="#263238" />
          <circle cy="12" r="5" fill="#263238" />
        </g>
        {Array.from({ length: 60 }, (_, i) => (
          <circle key={i} className="sc-fall" style={d(7 + r() * 8, r() * 15)} cx={r() * 1000} cy="0" r={3 + r() * 5} fill="#fff" opacity="0.9" />
        ))}
      </>
    );
  },

  beach: () => (
    <>
      <defs>
        <linearGradient id="sc-b-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF8A65" />
          <stop offset="0.45" stopColor="#FFCC80" />
          <stop offset="1" stopColor="#FFF3E0" />
        </linearGradient>
      </defs>
      <rect width="1000" height="800" fill="url(#sc-b-sky)" />
      <Sun x={500} y={330} r={90} />
      <Clouds n={3} speed={100} y0={120} seed={17} />
      <rect x="0" y="380" width="1000" height="200" fill="#0288D1" />
      {[400, 450, 500, 550].map((y, i) => (
        <path key={y} className="sc-wave" style={d(4 + i, i)} d={`M-60 ${y}q30-14 60 0t60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0 60 0`} stroke="#81D4FA" strokeWidth="5" fill="none" />
      ))}
      <g className="sc-bob" style={d(3)}>
        <g transform="translate(260 420)">
          <path d="M-50 0h100l-16 22h-68z" fill="#8D6E63" />
          <path d="M0 0v-90l50 80z" fill="#FFF" />
          <path d="M-4 -80v76l-36-10z" fill="#EF5350" />
        </g>
      </g>
      <path d="M0 560q250-50 500 0t500 0V800H0z" fill="#FFE082" />
      <path d="M0 620q250-30 500 10t500-10V800H0z" fill="#FFD54F" />
      <g transform="translate(830 640)">
        <path d="M0 0q-10-120 30-240" stroke="#8D6E63" strokeWidth="22" fill="none" strokeLinecap="round" />
        <g className="sc-sway" style={d(4)}>
          <g transform="translate(30 -240)">
            {[-150, -110, -60, -20, 20].map((a) => (
              <path key={a} d="M0 0q60-30 120 10q-60-10-120 0z" fill="#43A047" transform={`rotate(${a})`} />
            ))}
          </g>
        </g>
      </g>
      <g transform="translate(160 700)">
        <path d="M0 0l40-100" stroke="#ECEFF1" strokeWidth="6" />
        <path d="M-60 -70a100 50 0 0 1 200 -40z" fill="#E91E63" />
      </g>
      <path d="M560 700l14-20 14 20 20-4-14 16 6 22-26-10-26 10 6-22-14-16z" fill="#FF7043" />
    </>
  ),
};

export const SCENE_IDS = Object.keys(SCENES);

/** The scene drawn to fill its (positioned) parent. `still` stops all movement, for menus and thumbnails. */
export function SceneBackdrop({ id, still = false, className = "" }: { id: string; still?: boolean; className?: string }) {
  const draw = SCENES[id] ?? SCENES.grass;
  return (
    <svg
      viewBox="0 0 1000 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={`sc pointer-events-none absolute inset-0 h-full w-full ${still ? "sc-still" : ""} ${className}`}
    >
      <style>{CSS}</style>
      {draw()}
    </svg>
  );
}
