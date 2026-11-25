// © 2026 CODEship Academy. All rights reserved. Proprietary and confidential: see LICENSE.
/**
 * Port CODEship movement: axis-aligned boxes for everything solid, and a player
 * controller that walks, jumps, swims and climbs any wall marked climbable
 * (buildings, towers, shelves, your own house).
 */

import { WATER_Y, groundHeight } from "./layout";

export type Box = {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
  climb: boolean;
  tag?: string;
};

export function box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, climb = true, tag?: string): Box {
  return { minX: Math.min(x0, x1), minY: Math.min(y0, y1), minZ: Math.min(z0, z1), maxX: Math.max(x0, x1), maxY: Math.max(y0, y1), maxZ: Math.max(z0, z1), climb, tag };
}

const CELL = 8;

/** Boxes in a uniform grid, so a query only looks at nearby ones. */
export class Colliders {
  private grid = new Map<string, Set<Box>>();

  private cells(b: Box, fn: (k: string) => void) {
    for (let cx = Math.floor(b.minX / CELL); cx <= Math.floor(b.maxX / CELL); cx++)
      for (let cz = Math.floor(b.minZ / CELL); cz <= Math.floor(b.maxZ / CELL); cz++) fn(`${cx},${cz}`);
  }

  add(b: Box) {
    this.cells(b, (k) => {
      let s = this.grid.get(k);
      if (!s) this.grid.set(k, (s = new Set()));
      s.add(b);
    });
    return b;
  }

  remove(b: Box) {
    this.cells(b, (k) => this.grid.get(k)?.delete(b));
  }

  query(minX: number, minZ: number, maxX: number, maxZ: number): Box[] {
    const out = new Set<Box>();
    for (let cx = Math.floor(minX / CELL); cx <= Math.floor(maxX / CELL); cx++)
      for (let cz = Math.floor(minZ / CELL); cz <= Math.floor(maxZ / CELL); cz++) this.grid.get(`${cx},${cz}`)?.forEach((b) => out.add(b));
    return [...out];
  }
}

export const R = 0.32;
export const H = 1.75;
const GRAVITY = -26;
const JUMP_V = 9.4;
const STEP = 0.55;

export type Mode = "walk" | "climb" | "swim";

export type MoveInput = {
  /** World-space wish direction (already rotated by the camera). */
  wx: number;
  wz: number;
  /** Raw stick input: forward (+1) / back and right (+1) / left. */
  fwd: number;
  side: number;
  jump: boolean;
  sprint: boolean;
};

export class Player {
  x = 0;
  y = 0;
  z = 0;
  vx = 0;
  vy = 0;
  vz = 0;
  yaw = 0;
  mode: Mode = "walk";
  onGround = false;
  climbBox: Box | null = null;
  /** Outward wall normal while climbing. */
  nx = 0;
  nz = 0;
  speed = 0;
  private regrab = 0;
  private coyote = 0;
  private jumpHeld = false;

  constructor(private col: Colliders) {}

  ground(x: number, z: number) {
    return groundHeight(x, z);
  }

  private overlapping(x: number, y: number, z: number): Box[] {
    const hits = this.col.query(x - R, z - R, x + R, z + R);
    return hits.filter((b) => x + R > b.minX && x - R < b.maxX && z + R > b.minZ && z - R < b.maxZ && y + H > b.minY && y < b.maxY);
  }

  private headroom(x: number, y: number, z: number) {
    return this.overlapping(x, y, z).length === 0;
  }

  update(dt: number, inp: MoveInput) {
    this.regrab = Math.max(0, this.regrab - dt);
    const jumpPressed = inp.jump && !this.jumpHeld;
    this.jumpHeld = inp.jump;
    if (this.mode === "climb") return this.climb(dt, inp, jumpPressed);

    const inWater = this.y < WATER_Y - 0.6 && this.ground(this.x, this.z) < 0;
    this.mode = inWater ? "swim" : "walk";
    const max = this.mode === "swim" ? 3.2 : inp.sprint ? 8.6 : 5.2;
    const accel = this.onGround || this.mode === "swim" ? 40 : 14;
    const tx = inp.wx * max;
    const tz = inp.wz * max;
    this.vx += Math.max(-accel * dt, Math.min(accel * dt, tx - this.vx));
    this.vz += Math.max(-accel * dt, Math.min(accel * dt, tz - this.vz));
    if (Math.hypot(inp.wx, inp.wz) > 0.1) {
      const want = Math.atan2(inp.wx, inp.wz);
      let d = want - this.yaw;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      this.yaw += d * Math.min(1, dt * 12);
    }

    if (this.mode === "swim") {
      const float = WATER_Y - 1.15;
      this.vy = (float - this.y) * 4;
      if (jumpPressed) this.vy = 7;
    } else {
      this.coyote = this.onGround ? 0.12 : Math.max(0, this.coyote - dt);
      if (jumpPressed && (this.onGround || this.coyote > 0)) {
        this.vy = JUMP_V;
        this.coyote = 0;
        this.onGround = false;
      }
      this.vy += GRAVITY * dt;
      if (this.vy < -40) this.vy = -40;
    }

    const hx = this.moveAxis("x", this.vx * dt);
    const hz = this.moveAxis("z", this.vz * dt);
    const hit = hx && hz ? (hx.b.maxY >= hz.b.maxY ? hx : hz) : hx ?? hz;

    // Vertical
    this.y += this.vy * dt;
    this.onGround = false;
    for (const b of this.overlapping(this.x, this.y, this.z)) {
      if (this.vy <= 0 && this.y - this.vy * dt >= b.maxY - 0.05) {
        this.y = b.maxY;
        this.vy = 0;
        this.onGround = true;
      } else if (this.vy > 0) {
        this.y = b.minY - H - 0.001;
        this.vy = 0;
      }
    }
    const g = this.ground(this.x, this.z);
    if (this.y <= g) {
      this.y = g;
      this.vy = Math.max(0, this.vy);
      this.onGround = true;
    }
    this.speed = Math.hypot(this.vx, this.vz);

    if (hit && this.mode === "walk" && this.regrab <= 0 && hit.b.climb && inp.fwd > 0.3) {
      const into = -(inp.wx * hit.nx + inp.wz * hit.nz);
      if (into > 0.5 && hit.b.maxY - this.y > 1.0) {
        this.nx = hit.nx;
        this.nz = hit.nz;
        this.startClimb(hit.b);
      }
    }
  }

  /** Moves along one axis and resolves collisions; returns the tallest wall hit, if any. */
  private moveAxis(axis: "x" | "z", d: number): { b: Box; nx: number; nz: number } | null {
    if (d === 0) return null;
    if (axis === "x") this.x += d;
    else this.z += d;
    let hit: { b: Box; nx: number; nz: number } | null = null;
    for (const b of this.overlapping(this.x, this.y, this.z)) {
      const canStep = (this.onGround || this.mode === "swim") && b.maxY - this.y <= (this.mode === "swim" ? 1.4 : STEP) && this.headroom(this.x, b.maxY + 0.01, this.z);
      if (canStep) {
        this.y = b.maxY;
        this.vy = 0;
        continue;
      }
      let nx = 0;
      let nz = 0;
      if (axis === "x") {
        if (d > 0) this.x = b.minX - R - 0.001;
        else this.x = b.maxX + R + 0.001;
        nx = d > 0 ? -1 : 1;
        this.vx = 0;
      } else {
        if (d > 0) this.z = b.minZ - R - 0.001;
        else this.z = b.maxZ + R + 0.001;
        nz = d > 0 ? -1 : 1;
        this.vz = 0;
      }
      if (!hit || b.maxY > hit.b.maxY) hit = { b, nx, nz };
    }
    return hit;
  }

  private startClimb(b: Box) {
    this.mode = "climb";
    this.climbBox = b;
    this.vx = this.vy = this.vz = 0;
    this.yaw = Math.atan2(-this.nx, -this.nz);
  }

  private climb(dt: number, inp: MoveInput, jumpPressed: boolean) {
    const b = this.climbBox!;
    // Facing f = (-nx, -nz), so right = (-f.z, f.x) = (nz, -nx).
    const right = { x: this.nz, z: -this.nx };
    const up = inp.fwd * 3.4;
    const side = inp.side * 2.6;
    this.speed = Math.abs(up) + Math.abs(side);

    if (jumpPressed) {
      // Kick off the wall, or leap up and over a ledge right above.
      this.mode = "walk";
      this.climbBox = null;
      this.vx = this.nx * 5.5;
      this.vz = this.nz * 5.5;
      this.vy = 8;
      this.yaw = Math.atan2(this.nx, this.nz);
      this.regrab = 0.35;
      return;
    }

    this.y += up * dt;
    // A roof edge or ledge that sticks out above us: pull up onto it instead
    // of pushing our hands through it.
    if (up > 0) {
      const reach = this.y + 2.3;
      const over = this.col
        .query(this.x - R, this.z - R, this.x + R, this.z + R)
        .find((q) => q !== b && this.x + R > q.minX && this.x - R < q.maxX && this.z + R > q.minZ && this.z - R < q.maxZ && q.minY > this.y + 1 && q.minY < reach);
      if (over) {
        const tx = this.x - this.nx * (R * 2 + 0.25);
        const tz = this.z - this.nz * (R * 2 + 0.25);
        if (this.headroom(tx, over.maxY + 0.01, tz)) return this.mantle(over);
        this.y = over.minY - 2.3;
      }
    }
    let nx = this.x + right.x * side * dt;
    let nz = this.z + right.z * side * dt;
    // Stay glued to the face we're on.
    if (this.nx !== 0) nx = this.nx < 0 ? b.minX - R - 0.001 : b.maxX + R + 0.001;
    if (this.nz !== 0) nz = this.nz < 0 ? b.minZ - R - 0.001 : b.maxZ + R + 0.001;

    // Find what's in front of us at hand height: maybe a neighbouring box.
    const probeX = nx - this.nx * (R + 0.15);
    const probeZ = nz - this.nz * (R + 0.15);
    const handY = this.y + 1.2;
    const near = this.col.query(probeX - 0.1, probeZ - 0.1, probeX + 0.1, probeZ + 0.1);
    const front = near.find((q) => q.climb && probeX >= q.minX && probeX <= q.maxX && probeZ >= q.minZ && probeZ <= q.maxZ && handY >= q.minY - 0.3 && this.y < q.maxY);
    if (front && front !== b) this.climbBox = front;

    const cur = this.climbBox!;
    if (!front) {
      // Hands went past the top: climb onto it.
      if (this.y + 1.2 >= cur.maxY && up >= 0) return this.mantle(cur);
      // Slid off the side: drop.
      this.mode = "walk";
      this.climbBox = null;
      this.regrab = 0.25;
      return;
    }
    this.x = nx;
    this.z = nz;
    if (this.y + 1.2 >= cur.maxY && up > 0) return this.mantle(cur);
    const g = this.ground(this.x, this.z);
    if (this.y <= g && up < 0) {
      this.y = g;
      this.mode = "walk";
      this.climbBox = null;
      this.regrab = 0.4;
    }
    // Anything below our feet (e.g. a ledge) ends the climb too.
    if (up < 0) {
      const below = this.overlapping(this.x, this.y, this.z).find((q) => q.maxY <= this.y + 0.3);
      if (below) {
        this.y = below.maxY;
        this.mode = "walk";
        this.climbBox = null;
        this.regrab = 0.4;
      }
    }
  }

  private mantle(b: Box) {
    const tx = this.x - this.nx * (R * 2 + 0.25);
    const tz = this.z - this.nz * (R * 2 + 0.25);
    if (this.headroom(tx, b.maxY + 0.01, tz)) {
      this.x = tx;
      this.z = tz;
      this.y = b.maxY;
    }
    this.mode = "walk";
    this.climbBox = null;
    this.vy = 0;
    this.onGround = true;
    this.regrab = 0.3;
  }
}
