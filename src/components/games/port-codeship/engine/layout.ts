/**
 * Port CODEship town layout: one place for every position in the world, used by
 * the 3D scene, the collision boxes and the minimap.
 *
 * Coordinates are metres. +x is east, +z is south (towards the beach), y is up.
 */

import { rng } from "@/lib/games/port/missions";

export type Rect = { x0: number; z0: number; x1: number; z1: number };
export type Building = Rect & { h: number; color: number; roof: number };

export const LAND: Rect = { x0: -130, z0: -125, x1: 130, z1: 98 };
export const SAND_Z = 64;
export const WATER_Y = -0.45;
export const SEA_FLOOR = -2.6;

export const ROAD_W = 8;
export const ROADS: Rect[] = [
  { x0: -122, z0: -4, x1: 122, z1: 4 }, // Main Street
  { x0: -4, z0: -118, x1: 4, z1: 60 }, // Harbour Road
  { x0: -122, z0: -58, x1: 122, z1: -50 }, // North Street
  { x0: -76, z0: -118, x1: -68, z1: 60 }, // West Avenue
  { x0: 68, z0: -118, x1: 76, z1: 60 }, // East Avenue
  { x0: -122, z0: 52, x1: 122, z1: 60 }, // Shore Road
];

export const PLAZA = { x: 0, z: 0, r: 16 };

/** Your home plot. Cell (0, 0) is its north-west corner; cells are 1 m. */
export const PLOT = { x: 34, z: 12, w: 12, d: 10 };
export const PLOT_TERMINAL = { x: 32, z: 10.5 };

/** The Fresh Market hall. Aisles run north–south. */
export const MARKET: Rect = { x0: -64, z0: 10, x1: -34, z1: 34 };
/** Aisle 1 is on the left as you walk in from Main Street (you face south, so left is east). */
export const AISLE_X = [-40, -46, -52, -58];
/** Shelf units face north (towards the counter); one unit per aisle. */
export const SHELF_Z = 21;
export const SHELF_DEPTH = 1.2;
export const SHELF_W = 5;
export const SHELF_LEVEL_H = 1.0;
export const SHELF_H = 4.2;
export const LADDER_Z = 19.6;
export const COUNTER = { x: -49, z: 12 };
export const MARKET_TERMINAL = { x: -36.5, z: 11.5 };

/** Beach: bins and the Beach Bot dock sit on the boardwalk. */
export const BEACH_ORIGIN = { x: 0, z: 68 };
export const BOARDWALK: Rect = { x0: -62, z0: 62, x1: 62, z1: 67 };
export const BEACH_TERMINAL = { x: -9, z: 65 };
export const LIFEGUARD = { x: 22, z: 80 };

export type LookoutDef = { id: string; name: string; x: number; z: number; w: number; h: number; color: number };
export const LOOKOUTS: LookoutDef[] = [
  { id: "clock", name: "Clock Tower", x: -22, z: -22, w: 6, h: 26, color: 0xc9a27a },
  { id: "lighthouse", name: "Lighthouse", x: 112, z: 78, w: 7, h: 30, color: 0xf2f2ee },
  { id: "mast", name: "Radio Mast", x: 0, z: -96, w: 5, h: 34, color: 0xd65a4a },
];

// ---------------------------------------------------------------------------
// Buildings you can go inside. Each room is built far out of sight (x ≈ 400);
// walking through a door moves you there and back.

export type InteriorId = "townhall" | "bank" | "library";
export type Interior = {
  name: string;
  mission: "security" | "bank" | "library";
  /** The building in town. */
  rect: Rect;
  h: number;
  color: number;
  /** Door on the outside wall, and where you stand when you come back out. */
  door: { x: number; z: number; face: "s" | "w" | "e" };
  out: { x: number; z: number; yaw: number };
  /** The room: centre, size and height. Its door is in the middle of the south wall. */
  room: { ox: number; oz: number; w: number; d: number; h: number };
};

export const INTERIORS: Record<InteriorId, Interior> = {
  townhall: {
    name: "Town Hall",
    mission: "security",
    rect: { x0: -42, z0: -46, x1: -16, z1: -32 },
    h: 12,
    color: 0xe8e1d0,
    door: { x: -29, z: -32, face: "s" },
    out: { x: -29, z: -30.4, yaw: 0 },
    room: { ox: 400, oz: 0, w: 24, d: 18, h: 7 },
  },
  bank: {
    name: "Port Bank",
    mission: "bank",
    rect: { x0: 6, z0: 30, x1: 20, z1: 44 },
    h: 10,
    color: 0x9aa7b2,
    door: { x: 6, z: 37, face: "w" },
    out: { x: 4.6, z: 37, yaw: -Math.PI / 2 },
    room: { ox: 400, oz: 60, w: 20, d: 14, h: 6 },
  },
  library: {
    name: "Library",
    mission: "library",
    rect: { x0: -24, z0: 26, x1: -8, z1: 40 },
    h: 9,
    color: 0xb5523b,
    door: { x: -8, z: 33, face: "e" },
    out: { x: -6.6, z: 33, yaw: Math.PI / 2 },
    room: { ox: 400, oz: 120, w: 22, d: 16, h: 7 },
  },
};

const R_TH = INTERIORS.townhall.room;
const R_BK = INTERIORS.bank.room;
const R_LB = INTERIORS.library.room;

export const NPCS = {
  ada: { name: "Captain Ada", x: 5, z: 6, shirt: 0x1f6f8b, skin: 0x8d5524, hair: 0xe8e8e8 },
  ali: { name: "Mrs. Ali", x: -49, z: 7.5, shirt: 0xc0392b, skin: 0xc68642, hair: 0x2b1b14 },
  kofi: { name: "Kofi", x: 18, z: 76, shirt: 0xf39c12, skin: 0x5a3825, hair: 0x111111 },
  rosa: { name: "Rosa", x: 31, z: 14, shirt: 0x27ae60, skin: 0xf1c27d, hair: 0x6d3b1a },
  guard: { name: "Officer Grant", x: R_TH.ox + 2.6, z: R_TH.oz + 2.2, shirt: 0x1c2b4a, skin: 0x5a3825, hair: 0x111111 },
  clerk: { name: "Ms. Joseph", x: R_TH.ox - 7, z: R_TH.oz - 0.6, shirt: 0x8e44ad, skin: 0xc68642, hair: 0x2b1b14 },
  teller: { name: "Mr. Mensah", x: R_BK.ox - 4, z: R_BK.oz - 4.6, shirt: 0x2e7d32, skin: 0x8d5524, hair: 0x111111 },
  bankguard: { name: "Officer Diaz", x: R_BK.ox + 7.5, z: R_BK.oz + 3.5, shirt: 0x1c2b4a, skin: 0xe0ac69, hair: 0x3b2314 },
  librarian: { name: "Mrs. Thompson", x: R_LB.ox - 6, z: R_LB.oz + 1, shirt: 0xd35400, skin: 0xf1c27d, hair: 0xb0b0b0 },
} as const;
export type NpcId = keyof typeof NPCS;

export const SPAWN = { x: 0, z: 10, yaw: Math.PI };

const RESERVED: Rect[] = [
  { x0: -20, z0: -20, x1: 20, z1: 20 },
  { x0: PLOT.x - 6, z0: PLOT.z - 6, x1: PLOT.x + PLOT.w + 6, z1: PLOT.z + PLOT.d + 6 },
  { x0: MARKET.x0 - 3, z0: MARKET.z0 - 6, x1: MARKET.x1 + 3, z1: MARKET.z1 + 3 },
  ...LOOKOUTS.map((l) => ({ x0: l.x - l.w / 2 - 4, z0: l.z - l.w / 2 - 4, x1: l.x + l.w / 2 + 4, z1: l.z + l.w / 2 + 4 })),
  { x0: 14, z0: -40, x1: 60, z1: -8 }, // Maple Park
  ...Object.values(INTERIORS).map((i) => ({ x0: i.rect.x0 - 3, z0: i.rect.z0 - 3, x1: i.rect.x1 + 3, z1: i.rect.z1 + 3 })),
];
export const PARK: Rect = { x0: 16, z0: -38, x1: 58, z1: -10 };

const overlaps = (a: Rect, b: Rect, pad = 0) => a.x0 < b.x1 + pad && a.x1 > b.x0 - pad && a.z0 < b.z1 + pad && a.z1 > b.z0 - pad;

const FACADES = [0xe8d5b0, 0xd98e73, 0x9fc5c9, 0xf0e6d2, 0xb7a6d6, 0xe3b04b, 0x8fb996, 0xcfd8dc];

/** Buildings fill the blocks between roads, with alleys to jump across. */
export function buildings(): Building[] {
  const r = rng(1984);
  const out: Building[] = [];
  const blocks: Rect[] = [];
  const xb = [
    [-122, -76],
    [-68, -4],
    [4, 68],
    [76, 122],
  ];
  const zb = [
    [-118, -58],
    [-50, -4],
    [4, 52],
  ];
  for (const [x0, x1] of xb) for (const [z0, z1] of zb) blocks.push({ x0: x0 + 3, z0: z0 + 3, x1: x1 - 3, z1: z1 - 3 });
  for (const b of blocks) {
    // Rows of buildings facing the streets, leaving a courtyard in the middle.
    let x = b.x0;
    while (x < b.x1 - 5) {
      const w = 6 + Math.floor(r() * 5);
      const gap = 1.5 + r() * 2.5;
      for (const side of [0, 1]) {
        const d = 7 + Math.floor(r() * 5);
        const z0 = side === 0 ? b.z0 : b.z1 - d;
        const rect = { x0: x, z0, x1: Math.min(x + w, b.x1), z1: z0 + d };
        if (rect.x1 - rect.x0 < 4) continue;
        if (RESERVED.some((q) => overlaps(q, rect, 1))) continue;
        if (b.z1 - b.z0 < 2 * d + 4 && side === 1) continue;
        const tall = r();
        const h = Math.round(tall < 0.55 ? 5 + r() * 5 : tall < 0.9 ? 10 + r() * 6 : 16 + r() * 8);
        out.push({ ...rect, h, color: FACADES[Math.floor(r() * FACADES.length)], roof: r() < 0.5 ? 0x5b6770 : 0x7a5c4d });
      }
      x += w + gap;
    }
  }
  return out;
}

export function trees(): { x: number; z: number; s: number }[] {
  const r = rng(77);
  const out: { x: number; z: number; s: number }[] = [];
  for (let i = 0; i < 26; i++) out.push({ x: PARK.x0 + 2 + r() * (PARK.x1 - PARK.x0 - 4), z: PARK.z0 + 2 + r() * (PARK.z1 - PARK.z0 - 4), s: 0.8 + r() * 0.6 });
  // Palms along the beach.
  for (let x = -56; x <= 56; x += 14) out.push({ x: x + (r() - 0.5) * 4, z: 62 - 1.5, s: -1 });
  return out;
}

/** Collectible bits: rooftop rewards for exploring and climbing. */
export function bitSpots(b: Building[]): { id: number; x: number; y: number; z: number }[] {
  const r = rng(5150);
  const out: { id: number; x: number; y: number; z: number }[] = [];
  const tall = b.filter((q) => q.h >= 9);
  for (let i = 0; i < 24 && tall.length; i++) {
    const q = tall.splice(Math.floor(r() * tall.length), 1)[0];
    out.push({ id: i + 1, x: (q.x0 + q.x1) / 2, y: q.h + 1, z: (q.z0 + q.z1) / 2 });
  }
  // A few on the ground in out-of-the-way places.
  const extra = [
    { x: 54, z: -30, y: 1 },
    { x: -110, z: 80, y: 1 },
    { x: 120, z: -110, y: 1 },
    { x: -48, z: 37, y: 7 }, // market roof
    { x: 0, z: 94, y: 0.6 },
    { x: -120, z: -112, y: 1 },
  ];
  extra.forEach((e, i) => out.push({ id: 100 + i, ...e }));
  return out;
}

function landValue(x: number, z: number) {
  const cx = (LAND.x0 + LAND.x1) / 2;
  const cz = (LAND.z0 + LAND.z1) / 2;
  const nx = Math.abs(x - cx) / ((LAND.x1 - LAND.x0) / 2);
  const nz = Math.abs(z - cz) / ((LAND.z1 - LAND.z0) / 2);
  return nx ** 6 + nz ** 6;
}

/** Ground height: flat land that slopes gently into the sea at the shore. */
export function groundHeight(x: number, z: number) {
  const v = landValue(x, z);
  if (v <= 0.9) return 0;
  const t = Math.min(1, (v - 0.9) / 0.3);
  return SEA_FLOOR * t * t * (3 - 2 * t);
}

export function isLand(x: number, z: number) {
  // A rounded rectangle, so the island has soft corners.
  const cx = (LAND.x0 + LAND.x1) / 2;
  const cz = (LAND.z0 + LAND.z1) / 2;
  const hx = (LAND.x1 - LAND.x0) / 2;
  const hz = (LAND.z1 - LAND.z0) / 2;
  const nx = Math.abs(x - cx) / hx;
  const nz = Math.abs(z - cz) / hz;
  return nx ** 6 + nz ** 6 <= 1;
}

/** Paints the ground (grass, roads, plaza, sand) once. Also used for the map. */
export function paintGround(size: number, opts: { map?: boolean } = {}): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const W = LAND.x1 - LAND.x0 + 40;
  const ox = LAND.x0 - 20;
  const oz = LAND.z0 - 20;
  const s = size / W;
  const P = (x: number, z: number) => [(x - ox) * s, (z - oz) * s] as const;
  const rect = (q: Rect, fill: string) => {
    const [a, b] = P(q.x0, q.z0);
    g.fillStyle = fill;
    g.fillRect(a, b, (q.x1 - q.x0) * s, (q.z1 - q.z0) * s);
  };
  g.fillStyle = opts.map ? "#2f8fb0" : "#b8a679";
  g.fillRect(0, 0, size, size);
  // Land
  g.fillStyle = "#79b45a";
  const step = 2;
  for (let x = LAND.x0; x <= LAND.x1; x += step)
    for (let z = LAND.z0; z <= LAND.z1; z += step)
      if (isLand(x, z)) {
        const [a, b] = P(x, z);
        g.fillStyle = z >= SAND_Z || landValue(x, z) > 0.82 ? "#ecd9a6" : "#79b45a";
        g.fillRect(a - 0.5, b - 0.5, step * s + 1, step * s + 1);
      }
  if (!opts.map) {
    // Grass speckle
    const r = rng(9);
    for (let i = 0; i < size * 6; i++) {
      const x = r() * size;
      const y = r() * size;
      const [, sandY] = P(0, SAND_Z);
      if (y > sandY) continue;
      g.fillStyle = r() < 0.5 ? "rgba(40,90,30,0.18)" : "rgba(200,230,140,0.16)";
      g.fillRect(x, y, 2, 2);
    }
  }
  rect(PARK, "#5fa44a");
  for (const road of ROADS) rect(road, "#4b5258");
  // Centre lines
  if (!opts.map) {
    g.strokeStyle = "rgba(255,240,180,0.85)";
    g.lineWidth = Math.max(1, 0.25 * s);
    g.setLineDash([3 * s, 3 * s]);
    for (const road of ROADS) {
      g.beginPath();
      if (road.x1 - road.x0 > road.z1 - road.z0) {
        const [a, b] = P(road.x0, (road.z0 + road.z1) / 2);
        const [c2] = P(road.x1, 0);
        g.moveTo(a, b);
        g.lineTo(c2, b);
      } else {
        const [a, b] = P((road.x0 + road.x1) / 2, road.z0);
        const [, d] = P(0, road.z1);
        g.moveTo(a, b);
        g.lineTo(a, d);
      }
      g.stroke();
    }
    g.setLineDash([]);
  }
  // Plaza
  const [px, pz] = P(PLAZA.x, PLAZA.z);
  g.fillStyle = "#d9cdb4";
  g.beginPath();
  g.arc(px, pz, PLAZA.r * s, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "rgba(170,150,115,0.45)";
  g.lineWidth = 0.25 * s;
  for (let k = 5; k < PLAZA.r; k += 5) {
    g.beginPath();
    g.arc(px, pz, k * s, 0, Math.PI * 2);
    g.stroke();
  }
  // Home plot (dirt) and market floor
  rect({ x0: PLOT.x - 1, z0: PLOT.z - 1, x1: PLOT.x + PLOT.w + 1, z1: PLOT.z + PLOT.d + 1 }, "#a77b52");
  rect(MARKET, "#c9c2b5");
  rect(BOARDWALK, "#a0744a");
  return c;
}

export const GROUND_EXTENT = { x0: LAND.x0 - 20, z0: LAND.z0 - 20, size: LAND.x1 - LAND.x0 + 40 };
