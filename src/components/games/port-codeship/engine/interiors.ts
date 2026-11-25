/**
 * Port CODEship interiors: the Town Hall, the Port Bank and the Library.
 *
 * Each room is built far away from the town (see INTERIORS in layout.ts) and
 * doors move the player between the two. This file builds the buildings you
 * see in town, the rooms, their furniture, and plays back the three indoor
 * coding challenges.
 */

import * as THREE from "three";
import { APPOINTMENTS, type BankStep, type LibraryStep, type SecurityStep } from "@/lib/games/port/missions";
import { INTERIORS, type Interior, type InteriorId } from "./layout";
import { cube, makeAvatar, makeTerminal, mat, textTexture, tiledBox, facadeTexture, animateAvatar, type Avatar } from "./models";
import { box, type Box, type Colliders } from "./physics";

export type InteriorCtx = {
  scene: THREE.Scene;
  col: Colliders;
  interactables: { id: string; x: number; y: number; z: number; r: number }[];
  tween: (dur: number, fn: (k: number) => void) => Promise<void>;
  say: (who: string, text: string, tone?: "good" | "bad" | "info") => void;
};

const BILL_COLORS: Record<number, number> = { 50: 0x8e44ad, 20: 0x27ae60, 10: 0x2f80ed, 5: 0xf39c12, 1: 0x95a5a6 };
const VISITOR_LOOKS = [
  { shirt: 0xc0392b, skin: 0xf1c27d, hair: 0x3b2314 },
  { shirt: 0x16a085, skin: 0x8d5524, hair: 0x111111 },
  { shirt: 0xf1c40f, skin: 0xe0ac69, hair: 0x6d3b1a },
  { shirt: 0x2980b9, skin: 0xffdbac, hair: 0xb55239 },
  { shirt: 0x7f8c8d, skin: 0x5a3825, hair: 0x111111 },
];

export class Interiors {
  private gateBar: THREE.Object3D | null = null;
  private tray: THREE.Group | null = null;
  private books: THREE.Mesh[] = [];
  private bookSlots: THREE.Vector3[] = [];

  constructor(private c: InteriorCtx) {
    for (const [id, it] of Object.entries(INTERIORS) as [InteriorId, Interior][]) {
      this.buildOutside(id, it);
      this.buildRoom(id, it);
    }
    this.furnishTownHall(INTERIORS.townhall);
    this.furnishBank(INTERIORS.bank);
    this.furnishLibrary(INTERIORS.library);
  }

  /** Which room a point is in, if any. */
  static roomAt(x: number, z: number): InteriorId | null {
    for (const [id, it] of Object.entries(INTERIORS) as [InteriorId, Interior][]) {
      const r = it.room;
      if (Math.abs(x - r.ox) <= r.w / 2 + 1 && Math.abs(z - r.oz) <= r.d / 2 + 1) return id;
    }
    return null;
  }

  /** Where you stand just inside the door, facing into the room. */
  static entry(id: InteriorId) {
    const r = INTERIORS[id].room;
    // A few steps in from the door, so the camera has room behind you.
    return { x: r.ox, z: r.oz + r.d / 2 - 3.4, yaw: Math.PI };
  }

  private add(...o: THREE.Object3D[]) {
    this.c.scene.add(...o);
  }

  private solid(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, climb = false): Box {
    return this.c.col.add(box(x0, y0, z0, x1, y1, z1, climb));
  }

  // ---------------------------------------------------------------------------
  // Buildings in town

  private buildOutside(id: InteriorId, it: Interior) {
    const { x0, z0, x1, z1 } = it.rect;
    const w = x1 - x0;
    const d = z1 - z0;
    const m = new THREE.MeshStandardMaterial({ map: facadeTexture(), color: it.color, roughness: 0.85 });
    const body = new THREE.Mesh(tiledBox(w, it.h, d), m);
    body.position.set((x0 + x1) / 2, it.h / 2, (z0 + z1) / 2);
    body.castShadow = body.receiveShadow = true;
    this.add(body);
    this.add(cube(w + 0.4, 0.4, d + 0.4, mat(0x5b6770), body.position.x, it.h + 0.2, body.position.z));
    this.solid(x0, 0, z0, x1, it.h + 0.4, z1, true);

    // Door, steps and sign on the door's wall.
    const { x, z, face } = it.door;
    const out = face === "s" ? [0, 1] : face === "w" ? [-1, 0] : [1, 0];
    const along = face === "s" ? [1, 0] : [0, 1];
    const door = cube(face === "s" ? 2.4 : 0.15, 3.2, face === "s" ? 0.15 : 2.4, mat(0x3b2a1e), x + out[0] * 0.05, 1.6, z + out[1] * 0.05, false);
    this.add(door);
    this.add(cube(face === "s" ? 3.4 : 1.2, 0.18, face === "s" ? 1.2 : 3.4, mat(0xbfb7a6), x + out[0] * 0.6, 0.09, z + out[1] * 0.6, false));
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.1), new THREE.MeshStandardMaterial({ map: textTexture([it.name.toUpperCase()], { w: 512, h: 112, font: 70, bg: "#0d1b2a", fg: "#f5c35a" }) }));
    sign.position.set(x + out[0] * 0.12, 4.3, z + out[1] * 0.12);
    sign.rotation.y = Math.atan2(out[0], out[1]);
    this.add(sign);
    if (id === "townhall") {
      // Columns along the front and a flag on the roof.
      for (let k = -3; k <= 3; k++) {
        if (k === 0) continue;
        const cx = x + along[0] * k * 3;
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 6, 12), mat(0xf4efe4));
        col.position.set(cx, 3, z + 1.1);
        col.castShadow = true;
        this.add(col);
        this.solid(cx - 0.4, 0, z + 0.7, cx + 0.4, 6, z + 1.5, true);
      }
      this.add(cube(w * 0.6, 0.5, 2.4, mat(0xf4efe4), x, 6.2, z + 1.1));
      this.add(cube(0.12, 5, 0.12, mat(0xdddddd), (x0 + x1) / 2, it.h + 2.5, (z0 + z1) / 2));
      this.add(cube(2.2, 1.3, 0.05, mat(0x1f8a9e), (x0 + x1) / 2 + 1.15, it.h + 4.2, (z0 + z1) / 2, false));
    }
    if (id === "bank") {
      // Stone trim either side of the bank's door.
      for (const dz of [-2.2, 2.2]) this.add(cube(0.5, it.h, 0.6, mat(0xf4efe4), x0 - 0.25, it.h / 2, z + dz, false));
    }
    this.c.interactables.push({ id: `door:${id}`, x: x + out[0] * 1.2, y: 0, z: z + out[1] * 1.2, r: 2.2 });
  }

  // ---------------------------------------------------------------------------
  // Rooms

  private buildRoom(id: InteriorId, it: Interior) {
    const { ox, oz, w, d, h } = it.room;
    const floorColor = id === "townhall" ? 0xe9e4d8 : id === "bank" ? 0x3a4652 : 0x9c7148;
    const wallColor = id === "townhall" ? 0xf3ead8 : id === "bank" ? 0xd8dde2 : 0xe9dcc0;
    const floor = cube(w, 0.2, d, mat(floorColor, { rough: id === "townhall" ? 0.35 : 0.8 }), ox, -0.1, oz, false);
    this.add(floor);
    this.solid(ox - w / 2 - 1, -1, oz - d / 2 - 1, ox + w / 2 + 1, 0, oz + d / 2 + 1);
    const wall = mat(wallColor);
    const t = 0.4;
    // Walls: north, west, east, and south with the doorway in the middle.
    const walls: [number, number, number, number][] = [
      [ox - w / 2, oz - d / 2 - t, ox + w / 2, oz - d / 2],
      [ox - w / 2 - t, oz - d / 2, ox - w / 2, oz + d / 2],
      [ox + w / 2, oz - d / 2, ox + w / 2 + t, oz + d / 2],
      [ox - w / 2, oz + d / 2, ox - 1.4, oz + d / 2 + t],
      [ox + 1.4, oz + d / 2, ox + w / 2, oz + d / 2 + t],
    ];
    for (const [a, b, cx, cz] of walls) {
      // Walls inside don't cast sun shadows: the rooms are lit as if by their own lamps.
      this.add(cube(cx - a, h, cz - b, wall, (a + cx) / 2, h / 2, (b + cz) / 2, false));
      this.solid(a, 0, b, cx, h, cz);
    }
    this.add(cube(2.8, h - 3.2, t, wall, ox, 3.2 + (h - 3.2) / 2, oz + d / 2 + t / 2, false));
    this.solid(ox - 1.4, 3.2, oz + d / 2, ox + 1.4, h, oz + d / 2 + t);
    // The doorway shows daylight; walking into it takes you back outside.
    this.add(cube(2.8, 3.2, 0.05, mat(0xcfe7f0, { emissive: 0x9fc7d8 }), ox, 1.6, oz + d / 2 + t + 0.1, false));
    this.solid(ox - 1.4, 0, oz + d / 2 + t, ox + 1.4, 3.2, oz + d / 2 + t + 0.3);
    // A faint glow keeps the ceiling white (otherwise the outdoor grass light tints it green).
    const ceil = cube(w + 1, 0.3, d + 1, mat(0xf7f3ea, { emissive: 0x6e6b64 }), ox, h + 0.15, oz, false);
    this.add(ceil);
    this.solid(ox - w / 2 - 1, h, oz - d / 2 - 1, ox + w / 2 + 1, h + 0.3, oz + d / 2 + 1);
    // Ceiling lights (glowing panels).
    for (let i = -1; i <= 1; i += 2) for (let j = -1; j <= 1; j += 2) this.add(cube(1.4, 0.08, 1.4, mat(0xfffbe8, { emissive: 0xfff3c4 }), ox + i * w * 0.25, h - 0.05, oz + j * d * 0.25, false));
    this.c.interactables.push({ id: `exit:${id}`, x: ox, y: 0, z: oz + d / 2 - 0.6, r: 1.8 });
  }

  private plant(x: number, z: number) {
    this.add(cube(0.6, 0.6, 0.6, mat(0x8a5a36), x, 0.3, z), cube(0.9, 1.1, 0.9, mat(0x3f8f45), x, 1.15, z));
    this.solid(x - 0.35, 0, z - 0.35, x + 0.35, 1.7, z + 0.35);
  }

  private wallText(lines: string[], x: number, y: number, z: number, w: number, h: number, title?: string, rotY = 0) {
    const board = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: textTexture(lines, { title, w: 512, h: Math.round((512 * h) / w), font: 40, align: "left" }) }));
    board.position.set(x, y, z);
    board.rotation.y = rotY;
    this.add(board);
  }

  private furnishTownHall(it: Interior) {
    const { ox, oz, w, d } = it.room;
    // Red carpet from the door to the hall, flags and portraits.
    this.add(cube(2.4, 0.02, d - 1, mat(0xa83232), ox, 0.01, oz, false));
    for (const [fx, color] of [
      [-3, 0x1f8a9e],
      [3, 0xf5b83d],
    ] as [number, number][]) {
      this.add(cube(0.08, 3.4, 0.08, mat(0xcccccc), ox + fx, 1.7, oz - d / 2 + 0.6));
      this.add(cube(1.2, 0.8, 0.04, mat(color), ox + fx + 0.62, 3, oz - d / 2 + 0.6, false));
    }
    for (const px of [-8, 8]) this.add(cube(1.6, 2, 0.08, mat(0x5b4636), ox + px, 3.5, oz - d / 2 + 0.06, false), cube(1.3, 1.7, 0.1, mat(0x8fb996), ox + px, 3.5, oz - d / 2 + 0.1, false));
    // Security gate: an arch with a swinging bar across the carpet.
    const frame = mat(0x2c3e50, { metal: 0.5, rough: 0.4 });
    this.add(cube(0.3, 2.6, 0.5, frame, ox - 1.3, 1.3, oz + 2), cube(0.3, 2.6, 0.5, frame, ox + 1.3, 1.3, oz + 2), cube(2.9, 0.3, 0.5, frame, ox, 2.6, oz + 2));
    this.solid(ox - 1.45, 0, oz + 1.75, ox - 1.15, 2.7, oz + 2.25);
    this.solid(ox + 1.15, 0, oz + 1.75, ox + 1.45, 2.7, oz + 2.25);
    const bar = new THREE.Group();
    bar.position.set(ox - 1.15, 1, oz + 2);
    bar.add(cube(2.3, 0.12, 0.12, mat(0xe3664f), 1.15, 0, 0));
    this.add(bar);
    this.gateBar = bar;
    // Low barriers each side of the gate so visitors have to use it.
    this.add(cube(w / 2 - 2, 1, 0.2, frame, ox - w / 4 - 0.7, 0.5, oz + 2), cube(w / 2 - 2, 1, 0.2, frame, ox + w / 4 + 0.7, 0.5, oz + 2));
    this.solid(ox - w / 2, 0, oz + 1.9, ox - 1.45, 1, oz + 2.1);
    this.solid(ox + 1.45, 0, oz + 1.9, ox + w / 2, 1, oz + 2.1);
    // Front desk, benches, plants.
    this.add(cube(3.2, 1.1, 1, mat(0x6d4c35), ox - 7, 0.55, oz + 0.6));
    this.solid(ox - 8.6, 0, oz + 0.1, ox - 5.4, 1.1, oz + 1.1);
    this.wallText(["Front desk"], ox - 7, 2.6, oz - 1.1, 2.2, 0.5);
    for (const bx of [-6, 6]) {
      this.add(cube(2.4, 0.5, 0.7, mat(0x8a5a36), ox + bx, 0.45, oz + 5.5));
      this.solid(ox + bx - 1.2, 0, oz + 5.15, ox + bx + 1.2, 0.7, oz + 5.85);
    }
    this.plant(ox - w / 2 + 1, oz + d / 2 - 1.2);
    this.plant(ox + w / 2 - 1, oz + d / 2 - 1.2);
    this.plant(ox - w / 2 + 1, oz - d / 2 + 1.2);
    // The appointment board the Gate Bot code needs.
    this.wallText(APPOINTMENTS, ox + w / 2 - 0.06, 2.8, oz + 4.5, 3.2, 3.2, "TODAY'S APPOINTMENTS", -Math.PI / 2);
    this.wallText(["Visitors need an appointment", "AND photo ID to go past", "the gate. Everyone else:", "please see the front desk."], ox - w / 2 + 0.06, 2.8, oz + 4.5, 3.4, 1.8, "SECURITY", Math.PI / 2);
    const term = makeTerminal();
    term.position.set(ox + 4.5, 0, oz + 3.2);
    term.rotation.y = Math.PI;
    this.add(term);
    this.solid(ox + 4.05, 0, oz + 2.75, ox + 4.95, 1.6, oz + 3.65);
    this.c.interactables.push({ id: "term:security", x: ox + 4.5, y: 0, z: oz + 4.2, r: 1.8 });
  }

  private furnishBank(it: Interior) {
    const { ox, oz, w, d } = it.room;
    // Teller counters with glass along the back, and a big round vault door.
    this.add(cube(w * 0.55, 1.15, 1, mat(0x5d4037), ox - 3, 0.58, oz - d / 2 + 3));
    this.solid(ox - 3 - w * 0.275, 0, oz - d / 2 + 2.5, ox - 3 + w * 0.275, 1.15, oz - d / 2 + 3.5);
    this.add(cube(w * 0.55, 1.2, 0.05, new THREE.MeshStandardMaterial({ color: 0xbfe6f2, transparent: true, opacity: 0.35 }), ox - 3, 1.75, oz - d / 2 + 2.6, false));
    const vault = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.4, 32), mat(0xb0b7bd, { metal: 0.8, rough: 0.3 }));
    vault.rotation.x = Math.PI / 2;
    vault.position.set(ox + 6, 2.2, oz - d / 2 + 0.25);
    this.add(vault);
    for (let i = 0; i < 6; i++) {
      const spoke = cube(0.12, 1.6, 0.12, mat(0x7f8c8d, { metal: 0.8 }), ox + 6, 2.2, oz - d / 2 + 0.55, false);
      spoke.rotation.z = (i / 6) * Math.PI;
      this.add(spoke);
    }
    this.wallText(["VAULT"], ox + 6, 4.4, oz - d / 2 + 0.06, 1.6, 0.4);
    // Velvet rope line.
    for (let i = 0; i < 4; i++) {
      this.add(cube(0.12, 1, 0.12, mat(0xd4af37, { metal: 0.7 }), ox - 6 + i * 1.6, 0.5, oz + 1.5));
      if (i < 3) this.add(cube(1.5, 0.06, 0.06, mat(0x8b0000), ox - 5.2 + i * 1.6, 0.85, oz + 1.5, false));
    }
    this.solid(ox - 6.1, 0, oz + 1.4, ox - 1.1, 1, oz + 1.6);
    // The change machine and its tray.
    this.add(cube(1.6, 2.2, 0.9, mat(0x2c3e50), ox + 3, 1.1, oz - 1.5));
    this.add(cube(1.1, 0.7, 0.05, mat(0x39d0a8, { emissive: 0x1f8f74 }), ox + 3, 1.6, oz - 1.04, false));
    this.solid(ox + 2.2, 0, oz - 1.95, ox + 3.8, 2.2, oz - 1.05);
    this.wallText(["CHANGE", "MACHINE"], ox + 3, 2.6, oz - 1.03, 1.4, 0.6);
    const tray = new THREE.Group();
    tray.position.set(ox + 3, 0.95, oz - 0.85);
    tray.add(cube(1.2, 0.08, 0.5, mat(0x7f8c8d, { metal: 0.6 }), 0, 0, 0));
    this.add(tray);
    this.tray = tray;
    this.plant(ox - w / 2 + 1, oz + d / 2 - 1.2);
    this.plant(ox + w / 2 - 1, oz + d / 2 - 1.2);
    this.wallText(["Bills: 50, 20, 10, 5 and 1.", "Pay exactly what's owed,", "in the fewest bills."], ox - w / 2 + 0.06, 2.6, oz + 1, 3, 1.5, "CHANGE MACHINE", Math.PI / 2);
    const term = makeTerminal();
    term.position.set(ox + 5.6, 0, oz - 0.6);
    term.rotation.y = -Math.PI / 4;
    this.add(term);
    this.solid(ox + 5.15, 0, oz - 1.05, ox + 6.05, 1.6, oz - 0.15);
    this.c.interactables.push({ id: "term:bank", x: ox + 5.6, y: 0, z: oz + 0.2, r: 1.8 });
  }

  private furnishLibrary(it: Interior) {
    const { ox, oz, w, d } = it.room;
    const colors = [0xc0392b, 0x2980b9, 0x27ae60, 0x8e44ad, 0xf39c12, 0x16a085, 0xd35400];
    // Tall bookshelves along the side walls.
    for (const side of [-1, 1]) {
      for (let k = 0; k < 3; k++) {
        const sx = ox + side * (w / 2 - 0.5);
        const sz = oz - d / 2 + 2.5 + k * 4;
        this.add(cube(0.8, 4, 3.2, mat(0x6d4c35), sx, 2, sz));
        this.solid(sx - 0.4, 0, sz - 1.6, sx + 0.4, 4, sz + 1.6, true);
        for (let row = 0; row < 4; row++)
          for (let b = 0; b < 8; b++) this.add(cube(0.25, 0.7, 0.32, mat(colors[(b + row + k) % colors.length]), sx - side * 0.35, 0.5 + row * 0.95, sz - 1.3 + b * 0.37, false));
      }
    }
    // Reading tables.
    for (const tx of [-3, 3]) {
      this.add(cube(2.6, 0.12, 1.4, mat(0x8a5a36), ox + tx, 0.85, oz + 3.2), cube(0.12, 0.85, 0.12, mat(0x5b4636), ox + tx - 1.1, 0.42, oz + 2.7), cube(0.12, 0.85, 0.12, mat(0x5b4636), ox + tx + 1.1, 0.42, oz + 3.7));
      this.solid(ox + tx - 1.3, 0, oz + 2.5, ox + tx + 1.3, 0.9, oz + 3.9);
    }
    // Librarian's desk.
    this.add(cube(2.6, 1.1, 1, mat(0x5b4636), ox - 6, 0.55, oz + 2.3));
    this.solid(ox - 7.3, 0, oz + 1.8, ox - 4.7, 1.1, oz + 2.8);
    // The returns shelf the Shelf Bot sorts, facing the door.
    const sz = oz - d / 2 + 1.4;
    this.add(cube(7.6, 0.15, 0.9, mat(0x6d4c35), ox, 1.0, sz), cube(7.6, 0.15, 0.9, mat(0x6d4c35), ox, 0.1, sz), cube(0.15, 1.9, 0.9, mat(0x6d4c35), ox - 3.8, 0.95, sz), cube(0.15, 1.9, 0.9, mat(0x6d4c35), ox + 3.8, 0.95, sz));
    this.solid(ox - 3.9, 0, sz - 0.45, ox + 3.9, 1.9, sz + 0.45);
    this.wallText(["RETURNS: sort smallest number first"], ox, 2.7, oz - d / 2 + 0.06, 5, 0.45);
    for (let i = 0; i < 9; i++) this.bookSlots.push(new THREE.Vector3(ox - 3.2 + i * 0.8, 1.45, sz + 0.05));
    const term = makeTerminal();
    term.position.set(ox + 5, 0, oz - d / 2 + 2.2);
    term.rotation.y = -Math.PI / 6;
    this.add(term);
    this.solid(ox + 4.55, 0, oz - d / 2 + 1.75, ox + 5.45, 1.6, oz - d / 2 + 2.65);
    this.c.interactables.push({ id: "term:library", x: ox + 5, y: 0, z: oz - d / 2 + 3, r: 1.8 });
  }

  // ---------------------------------------------------------------------------
  // Library books

  private bookMesh(n: number) {
    const side = mat(0x2f6f8f);
    const front = new THREE.MeshStandardMaterial({ map: textTexture([String(n)], { w: 128, h: 256, font: 60, bg: "#f4efe4", fg: "#0d1b2a" }) });
    // Box faces: +x, -x, +y, -y, +z (front), -z.
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.85, 0.5), [side, side, side, side, front, side]);
    mesh.castShadow = true;
    return mesh;
  }

  /** Puts books on the returns shelf in this order. */
  setBooks(order: number[]) {
    for (const b of this.books) this.c.scene.remove(b);
    this.books = order.map((n, i) => {
      const m = this.bookMesh(n);
      m.position.copy(this.bookSlots[i]);
      this.add(m);
      return m;
    });
  }

  async playLibrary(steps: LibraryStep[], order: number[]) {
    this.setBooks(order);
    for (const s of steps) {
      if (s.t === "say") {
        this.c.say("Shelf Bot", s.text, "info");
        continue;
      }
      const a = this.books[s.i];
      const b = this.books[s.j];
      const pa = this.bookSlots[s.i].clone();
      const pb = this.bookSlots[s.j].clone();
      await this.c.tween(0.35, (k) => {
        const lift = Math.sin(k * Math.PI) * 0.6;
        a.position.lerpVectors(pa, pb, k).setY(pa.y + lift);
        b.position.lerpVectors(pb, pa, k).setY(pb.y + lift * 0.4);
        a.position.z = pa.z + Math.sin(k * Math.PI) * 0.5;
      });
      a.position.copy(pb);
      b.position.copy(pa);
      [this.books[s.i], this.books[s.j]] = [b, a];
    }
  }

  // ---------------------------------------------------------------------------
  // Town Hall gate

  private walker(look: number) {
    const av = makeAvatar(VISITOR_LOOKS[look % VISITOR_LOOKS.length]);
    this.add(av.root);
    return av;
  }

  private async walk(av: Avatar, from: THREE.Vector3, to: THREE.Vector3, speed = 3.2) {
    av.root.rotation.y = Math.atan2(to.x - from.x, to.z - from.z);
    const dist = from.distanceTo(to);
    await this.c.tween(Math.max(0.1, dist / speed), (k) => {
      av.root.position.lerpVectors(from, to, k);
      animateAvatar(av, 1 / 60, speed, "walk");
    });
    animateAvatar(av, 0, 0, "idle");
  }

  async playSecurity(steps: SecurityStep[]) {
    const { ox, oz, d } = INTERIORS.townhall.room;
    const door = new THREE.Vector3(ox, 0, oz + d / 2 - 0.8);
    const gate = new THREE.Vector3(ox, 0, oz + 3.2);
    let av: Avatar | null = null;
    let n = 0;
    for (const s of steps) {
      if (s.t === "say") this.c.say("Gate Bot", s.text, "info");
      else if (s.t === "visitor") {
        av = this.walker(n++);
        av.root.position.copy(door);
        this.c.say("Visitor", `Hi, I'm ${s.name}. ${s.id ? "Here's my photo ID." : "I forgot my ID..."}`, "info");
        await this.walk(av, door, gate);
      } else if (s.t === "in" || s.t === "desk") {
        if (!av) continue;
        if (s.t === "in") {
          await this.c.tween(0.3, (k) => this.gateBar && (this.gateBar.rotation.y = (-Math.PI / 2) * k));
          await this.walk(av, gate, new THREE.Vector3(ox + (n % 2 ? -3 : 3), 0, oz - 4));
          await this.c.tween(0.3, (k) => this.gateBar && (this.gateBar.rotation.y = (-Math.PI / 2) * (1 - k)));
        } else await this.walk(av, gate, new THREE.Vector3(ox - 7, 0, oz + 1.8));
        if (!s.ok) this.c.say("Officer Grant", s.t === "in" ? `Wait! ${s.name} shouldn't have gone through.` : `Hold on, ${s.name} was allowed in.`, "bad");
        const leaving = av;
        await this.c.tween(0.25, (k) => leaving.root.scale.setScalar(1 - k));
        this.c.scene.remove(leaving.root);
        av = null;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Bank change machine

  async playBank(steps: BankStep[]) {
    const { ox, oz, d } = INTERIORS.bank.room;
    const door = new THREE.Vector3(ox, 0, oz + d / 2 - 0.8);
    const spot = new THREE.Vector3(ox + 3, 0, oz + 0.3);
    let av: Avatar | null = null;
    let stack = 0;
    let n = 0;
    const clearTray = () => {
      if (!this.tray) return;
      for (const ch of [...this.tray.children].slice(1)) this.tray.remove(ch);
      stack = 0;
    };
    for (const s of steps) {
      if (s.t === "say") this.c.say("Change Machine", s.text, "info");
      else if (s.t === "customer") {
        clearTray();
        av = this.walker(n++ + 2);
        av.root.position.copy(door);
        this.c.say(`Customer ${s.n}`, `I'm owed ${s.amount} coins, please.`, "info");
        await this.walk(av, door, spot);
        av.root.rotation.y = Math.PI;
      } else if (s.t === "give") {
        if (this.tray) {
          const bill = cube(0.5, 0.03, 0.25, mat(BILL_COLORS[s.bill] ?? 0xffffff), -0.3 + (stack % 3) * 0.3, 0.06 + Math.floor(stack / 3) * 0.035, 0, false);
          this.tray.add(bill);
          stack++;
        }
        await this.c.tween(0.12, () => {});
      } else if (s.t === "paid") {
        this.c.say(`Customer ${s.n}`, s.ok ? `Thanks! ${s.bills} bills, perfect.` : s.bills > s.best ? `That's a thick stack: ${s.bills} bills when ${s.best} would do.` : "Hmm, that's not what I'm owed.", s.ok ? "good" : "bad");
        await this.c.tween(0.4, () => {});
        clearTray();
        if (av) {
          const leaving = av;
          await this.walk(leaving, spot, door);
          this.c.scene.remove(leaving.root);
          av = null;
        }
      }
    }
    clearTray();
  }
}
