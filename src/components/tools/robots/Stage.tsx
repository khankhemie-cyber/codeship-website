"use client";

import { useEffect, useRef, useState } from "react";
import type { Scene } from "./missions";
import type { ColourName, Frame, Item, LedColour, RobotKind, World } from "./sim";
import { ROBOT_RADIUS } from "./sim";

/**
 * Draws one moment of a run: an illustrated mat (decoration from the
 * mission's scene; the simulator never sees it), the robot, and what its
 * sensors are doing. Also used small, as mission-card thumbnails.
 */

export const FLOOR: Record<ColourName, string> = {
  white: "#FFFFFF",
  black: "#111111",
  red: "#E53935",
  green: "#43A047",
  blue: "#1E88E5",
  yellow: "#FDD835",
  purple: "#8E24AA",
  orange: "#FB8C00",
  pink: "#EC6FA5",
  grey: "#9AA4B2",
};

const LED: Record<LedColour, string> = {
  off: "#3A4659",
  red: "#FF3B3B",
  green: "#3DDC6A",
  blue: "#3BA4FF",
  yellow: "#FFE14D",
  white: "#FFFFFF",
  purple: "#C774FF",
};

const GROUND = {
  rug: { base: "#F7EEDD", accent: "#EFD9B5", grid: "rgba(150,110,60,0.18)" },
  grass: { base: "#CFE8B4", accent: "#B9DC98", grid: "rgba(40,90,30,0.14)" },
  tiles: { base: "#EEF2F8", accent: "#E2E8F1", grid: "rgba(40,60,100,0.14)" },
  concrete: { base: "#E3E1DC", accent: "#D6D3CC", grid: "rgba(60,60,60,0.16)" },
} as const;

type Props = {
  world: World;
  scene: Scene;
  frame: Frame;
  trail?: { x: number; y: number }[];
  clapNow?: boolean;
  /** Show the distance beam and line-sensor dots. */
  showSensors?: boolean;
  /** Small, static (mission-card thumbnail). */
  thumbnail?: boolean;
};

type C = CanvasRenderingContext2D;

function seeded(n: number) {
  let a = n >>> 0;
  return () => (a = (a * 1664525 + 1013904223) >>> 0) / 4294967296;
}

function roundRect(ctx: C, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawGround(ctx: C, scene: Scene, w: number, h: number, s: number) {
  const g = GROUND[scene.ground];
  ctx.fillStyle = g.base;
  ctx.fillRect(0, 0, w, h);
  const rnd = seeded(7);
  if (scene.ground === "grass") {
    ctx.fillStyle = g.accent;
    for (let i = 0; i < (w * h) / (s * s * 18); i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      ctx.beginPath();
      ctx.ellipse(x, y, s * (0.6 + rnd()), s * 0.35, rnd() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (scene.ground === "rug") {
    ctx.strokeStyle = g.accent;
    ctx.lineWidth = s * 1.2;
    ctx.strokeRect(s * 3, s * 3, w - s * 6, h - s * 6);
    ctx.lineWidth = s * 0.4;
    ctx.strokeRect(s * 5, s * 5, w - s * 10, h - s * 10);
  } else if (scene.ground === "concrete") {
    const band = s * 2.2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, w, band);
    ctx.rect(0, h - band, w, band);
    ctx.clip();
    for (let x = -h; x < w + h; x += s * 4) {
      ctx.fillStyle = "#F0D030";
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + s * 2, 0);
      ctx.lineTo(x + s * 2 - h, h);
      ctx.lineTo(x - h, h);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawGrid(ctx: C, world: World, scene: Scene, w: number, h: number, s: number) {
  ctx.strokeStyle = GROUND[scene.ground].grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 10; x < world.w; x += 10) {
    ctx.moveTo(x * s + 0.5, 0);
    ctx.lineTo(x * s + 0.5, h);
  }
  for (let y = 10; y < world.h; y += 10) {
    ctx.moveTo(0, y * s + 0.5);
    ctx.lineTo(w, y * s + 0.5);
  }
  ctx.stroke();
}

function drawIcon(ctx: C, kind: NonNullable<Scene["zoneIcons"]>[string], cx: number, cy: number, size: number, colour: string) {
  const u = size / 10;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, u * 0.8);
  ctx.strokeStyle = "#010F2A";
  switch (kind) {
    case "house":
    case "school": {
      ctx.fillStyle = kind === "school" ? "#FFF3D6" : "#FFFFFF";
      roundRect(ctx, -4 * u, -1 * u, 8 * u, 6 * u, u * 0.6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = kind === "school" ? "#E53935" : colour;
      ctx.beginPath();
      ctx.moveTo(-5.2 * u, -0.8 * u);
      ctx.lineTo(0, -5.5 * u);
      ctx.lineTo(5.2 * u, -0.8 * u);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#5D4037";
      ctx.fillRect(-1 * u, 2 * u, 2 * u, 3 * u);
      if (kind === "school") {
        ctx.beginPath();
        ctx.moveTo(0, -5.5 * u);
        ctx.lineTo(0, -8 * u);
        ctx.stroke();
        ctx.fillStyle = "#F0D030";
        ctx.fillRect(0, -8 * u, 2.4 * u, 1.4 * u);
      }
      break;
    }
    case "park":
      for (const [dx, dy, r] of [
        [-2.5, 1, 3],
        [2.5, 0, 3.4],
        [0, -2.5, 3],
      ]) {
        ctx.fillStyle = "#2E7D32";
        ctx.beginPath();
        ctx.arc(dx * u, dy * u, r * u, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#43A047";
      ctx.beginPath();
      ctx.arc(-0.5 * u, -1 * u, 2 * u, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "heart":
      ctx.fillStyle = "#EC407A";
      ctx.beginPath();
      ctx.moveTo(0, 4 * u);
      ctx.bezierCurveTo(-6 * u, -0.5 * u, -3 * u, -5 * u, 0, -2 * u);
      ctx.bezierCurveTo(3 * u, -5 * u, 6 * u, -0.5 * u, 0, 4 * u);
      ctx.fill();
      ctx.stroke();
      break;
    case "toybox":
      ctx.fillStyle = "#8D5A2B";
      roundRect(ctx, -5 * u, -3 * u, 10 * u, 7 * u, u);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#F0D030";
      ctx.fillRect(-5 * u, -0.5 * u, 10 * u, 1.4 * u);
      ctx.fillStyle = "#E53935";
      ctx.beginPath();
      ctx.arc(-2 * u, -3.4 * u, 1.6 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1E88E5";
      ctx.fillRect(1 * u, -5 * u, 2.6 * u, 2.6 * u);
      break;
    case "bin":
      ctx.fillStyle = colour;
      roundRect(ctx, -4 * u, -4 * u, 8 * u, 8 * u, u);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath();
      for (const x of [-2.5, 0, 2.5]) {
        ctx.moveTo(x * u, -2 * u);
        ctx.lineTo(x * u, 2.5 * u);
      }
      ctx.stroke();
      break;
  }
  ctx.restore();
}

function drawDecor(ctx: C, d: NonNullable<Scene["decor"]>[number], s: number) {
  const x = d.x * s;
  const y = d.y * s;
  const r = (d.r ?? 4) * s;
  ctx.save();
  switch (d.kind) {
    case "tree":
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.beginPath();
      ctx.ellipse(x + r * 0.25, y + r * 0.3, r, r * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2E7D32";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#43A047";
      ctx.beginPath();
      ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#66BB6A";
      ctx.beginPath();
      ctx.arc(x - r * 0.4, y - r * 0.4, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "bush":
      ctx.fillStyle = "#558B2F";
      for (const [dx, dy] of [
        [-0.5, 0],
        [0.5, 0],
        [0, -0.45],
      ]) {
        ctx.beginPath();
        ctx.arc(x + dx * r, y + dy * r, r * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case "rock":
      ctx.fillStyle = "#9E9E9E";
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.75, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#BDBDBD";
      ctx.beginPath();
      ctx.ellipse(x - r * 0.25, y - r * 0.2, r * 0.45, r * 0.3, 0.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "ball":
      ctx.fillStyle = "#E53935";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = r * 0.25;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.6, 0.3, 2.6);
      ctx.stroke();
      break;
    case "bee": {
      const b = s * 1.6;
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath();
      ctx.ellipse(x - b * 0.4, y - b * 0.9, b * 0.7, b * 0.45, -0.5, 0, Math.PI * 2);
      ctx.ellipse(x + b * 0.4, y - b * 0.9, b * 0.7, b * 0.45, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#F0D030";
      ctx.beginPath();
      ctx.ellipse(x, y, b * 1.1, b * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#010F2A";
      ctx.fillRect(x - b * 0.2, y - b * 0.75, b * 0.35, b * 1.5);
      break;
    }
  }
  ctx.restore();
}

function drawFlower(ctx: C, x: number, y: number, s: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#F48FB1";
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * 2.6 * s, Math.sin(a) * 2.6 * s, 2 * s, 1.3 * s, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#F0D030";
  ctx.beginPath();
  ctx.arc(0, 0, 1.6 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawItem(ctx: C, it: Item, x: number, y: number, s: number) {
  const size = 4.4 * s;
  const px = x * s - size / 2;
  const py = y * s - size / 2;
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  roundRect(ctx, px + s * 0.6, py + s * 0.7, size, size, s * 0.8);
  ctx.fill();
  if (it.id === "package") {
    ctx.fillStyle = "#C8955A";
    roundRect(ctx, px, py, size, size, s * 0.4);
    ctx.fill();
    ctx.fillStyle = "#E9D3A8";
    ctx.fillRect(px + size * 0.42, py, size * 0.16, size);
  } else {
    ctx.fillStyle = FLOOR[it.colour];
    roundRect(ctx, px, py, size, size, s * 0.8);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    roundRect(ctx, px + size * 0.15, py + size * 0.12, size * 0.4, size * 0.25, s * 0.4);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(1,15,42,0.7)";
  ctx.lineWidth = Math.max(1, s * 0.3);
  roundRect(ctx, px, py, size, size, s * 0.8);
  ctx.stroke();
  ctx.restore();
}

const BODY: Record<RobotKind, { fill: string; trim: string }> = {
  scout: { fill: "#F0D030", trim: "#D58401" },
  racer: { fill: "#2B7BD8", trim: "#0D3C78" },
  rover: { fill: "#0F6F7C", trim: "#012C61" },
};

function drawRobot(ctx: C, kind: RobotKind, f: Frame, s: number) {
  const r = ROBOT_RADIUS[kind] * s;
  const { fill, trim } = BODY[kind];
  ctx.save();
  ctx.translate(f.x * s, f.y * s);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(r * 0.12, r * 0.18, r * 1.15, r * 1.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate((-f.heading * Math.PI) / 180);
  if (f.led !== "off") {
    const g = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 2.2);
    g.addColorStop(0, LED[f.led] + "88");
    g.addColorStop(1, LED[f.led] + "00");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  // wheels; the tread lines move as the robot moves
  const tread = (((f.x + f.y) / 3) % 1 + 1) % 1;
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#1A1F2B";
    roundRect(ctx, -r * 0.6, side * r - r * 0.21, r * 1.2, r * 0.42, r * 0.12);
    ctx.fill();
    ctx.strokeStyle = "#4A5468";
    ctx.lineWidth = Math.max(1, s * 0.25);
    ctx.beginPath();
    for (let k = 0; k < 5; k++) {
      const x = -r * 0.55 + ((k + tread) / 5) * r * 1.1;
      ctx.moveTo(x, side * r - r * 0.17);
      ctx.lineTo(x, side * r + r * 0.17);
    }
    ctx.stroke();
  }
  ctx.fillStyle = fill;
  ctx.strokeStyle = trim;
  ctx.lineWidth = Math.max(1.5, s * 0.5);
  if (kind === "racer") roundRect(ctx, -r * 1.05, -r * 0.82, r * 2.1, r * 1.64, r * 0.45);
  else roundRect(ctx, -r * 0.92, -r * 0.92, r * 1.84, r * 1.84, r * (kind === "scout" ? 0.7 : 0.35));
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  roundRect(ctx, -r * 0.7, -r * 0.62, r * 0.9, r * 1.24, r * 0.3);
  ctx.fill();
  // eyes look the way the robot is facing
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(r * 0.5, side * r * 0.33, r * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#010F2A";
    ctx.beginPath();
    ctx.arc(r * 0.58, side * r * 0.33, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }
  // the robot's light
  ctx.fillStyle = LED[f.led];
  ctx.strokeStyle = "#010F2A";
  ctx.lineWidth = Math.max(1, s * 0.3);
  ctx.beginPath();
  ctx.arc(-r * 0.3, 0, r * 0.26, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (kind === "rover") {
    ctx.strokeStyle = "#9AA4B2";
    ctx.lineWidth = Math.max(2, s * 0.9);
    ctx.beginPath();
    ctx.moveTo(r * 0.9, -r * 0.55);
    ctx.lineTo(r * 1.5, -r * 0.55);
    ctx.lineTo(r * 1.6, -r * 0.35);
    ctx.moveTo(r * 0.9, r * 0.55);
    ctx.lineTo(r * 1.5, r * 0.55);
    ctx.lineTo(r * 1.6, r * 0.35);
    ctx.stroke();
  }
  if (f.bumped) {
    ctx.strokeStyle = "#FF3B3B";
    ctx.lineWidth = Math.max(2, s * 0.8);
    for (const a of [-0.5, 0, 0.5]) {
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.3);
      ctx.lineTo(Math.cos(a) * r * 1.75, Math.sin(a) * r * 1.75);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawSensors(ctx: C, world: World, f: Frame, s: number) {
  const r = ROBOT_RADIUS[world.robot];
  const h = (f.heading * Math.PI) / 180;
  const fx = f.x + Math.cos(h) * r;
  const fy = f.y - Math.sin(h) * r;
  const d = f.sensors.distance;
  const ex = fx + Math.cos(h) * d;
  const ey = fy - Math.sin(h) * d;
  ctx.save();
  const beam = f.sensors.obstacle ? "rgba(255,59,59,0.85)" : "rgba(15,111,124,0.7)";
  ctx.strokeStyle = beam;
  ctx.lineWidth = Math.max(1.5, s * 0.45);
  ctx.setLineDash([s * 1.5, s * 1.2]);
  ctx.beginPath();
  ctx.moveTo(fx * s, fy * s);
  ctx.lineTo(ex * s, ey * s);
  ctx.stroke();
  ctx.setLineDash([]);
  if (d < 200) {
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.arc(ex * s, ey * s, s * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const [side, on] of [
    [1.1, f.sensors.lineLeft],
    [-1.1, f.sensors.lineRight],
  ] as const) {
    const px = f.x + Math.cos(h) * 3.2 - Math.sin(h) * side;
    const py = f.y - Math.sin(h) * 3.2 - Math.cos(h) * side;
    ctx.fillStyle = on ? "#FF3B3B" : "rgba(255,255,255,0.9)";
    ctx.strokeStyle = "#010F2A";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(px * s, py * s, Math.max(2, s * 0.45), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function label(ctx: C, text: string, x: number, y: number, s: number, dark = false) {
  ctx.font = `700 ${Math.max(10, 2.9 * s)}px system-ui, sans-serif`;
  const tw = ctx.measureText(text).width;
  const pad = Math.max(4, s);
  const h = Math.max(15, 4.4 * s);
  ctx.fillStyle = dark ? "rgba(1,15,42,0.82)" : "rgba(255,255,255,0.92)";
  roundRect(ctx, x, y, tw + pad * 2, h, h / 2);
  ctx.fill();
  ctx.fillStyle = dark ? "#F0D030" : "#010F2A";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + pad, y + h / 2 + 0.5);
}

export default function Stage({ world, scene, frame, trail = [], clapNow = false, showSensors = true, thumbnail = false }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [, setBoxWidth] = useState(0);

  useEffect(() => {
    const c = canvas.current;
    const box = wrap.current;
    if (!c || !box || box.clientWidth === 0) return;
    const dpr = window.devicePixelRatio || 1;
    const width = box.clientWidth;
    const s = width / world.w;
    const height = world.h * s;
    c.width = Math.round(width * dpr);
    c.height = Math.round(height * dpr);
    c.style.height = `${height}px`;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    drawGround(ctx, scene, width, height, s);
    if (world.grid) drawGrid(ctx, world, scene, width, height, s);

    for (const z of world.zones) {
      const col = FLOOR[z.colour];
      ctx.fillStyle = col + "55";
      roundRect(ctx, z.x * s, z.y * s, z.w * s, z.h * s, s * 1.5);
      ctx.fill();
      ctx.setLineDash([s * 1.6, s * 1]);
      ctx.strokeStyle = col;
      ctx.lineWidth = Math.max(1.5, s * 0.5);
      ctx.stroke();
      ctx.setLineDash([]);
      const icon = z.id ? scene.zoneIcons?.[z.id] : undefined;
      if (icon) drawIcon(ctx, icon, (z.x + z.w / 2) * s, (z.y + z.h / 2 + 1) * s, Math.min(z.w, z.h) * s * 0.55, col);
      if (z.label && !thumbnail) label(ctx, z.label, z.x * s + s, z.y * s + s, s);
    }

    for (const line of world.lines) {
      const pts = line.points;
      const path = () => {
        ctx.beginPath();
        pts.forEach((p, i) => (i ? ctx.lineTo(p.x * s, p.y * s) : ctx.moveTo(p.x * s, p.y * s)));
      };
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      if (scene.roads) {
        ctx.strokeStyle = "#8C939E";
        ctx.lineWidth = 9 * s;
        path();
        ctx.stroke();
        ctx.strokeStyle = "#A9AFB8";
        ctx.lineWidth = 7.5 * s;
        path();
        ctx.stroke();
      }
      ctx.strokeStyle = "#151515";
      ctx.lineWidth = (line.width ?? 2) * s;
      path();
      ctx.stroke();
    }

    for (const d of scene.decor ?? []) drawDecor(ctx, d, s);
    for (const p of world.places) {
      if (p.kind === "flower") drawFlower(ctx, p.x * s, p.y * s, s);
      else if (!thumbnail) label(ctx, p.label, p.x * s - 3 * s, p.y * s - 2 * s, s, true);
    }

    for (const w of world.walls) {
      const x = w.x * s;
      const y = w.y * s;
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      roundRect(ctx, x + s, y + s * 1.2, w.w * s, w.h * s, s);
      ctx.fill();
      if (scene.wall === "bin") {
        ctx.fillStyle = "#1E88E5";
        roundRect(ctx, x, y, w.w * s, w.h * s, s * 1.2);
        ctx.fill();
        ctx.strokeStyle = "#0D3C78";
        ctx.lineWidth = Math.max(1.5, s * 0.5);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = Math.max(1.5, s * 0.6);
        const cx = x + (w.w * s) / 2;
        const cy = y + (w.h * s) / 2;
        const rr = Math.min(w.w, w.h) * s * 0.28;
        for (let k = 0; k < 3; k++) {
          const a = (k / 3) * Math.PI * 2 - Math.PI / 2;
          ctx.beginPath();
          ctx.arc(cx, cy, rr, a + 0.25, a + 1.75);
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = "#B5563A";
        roundRect(ctx, x, y, w.w * s, w.h * s, s * 0.6);
        ctx.fill();
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = "rgba(255,230,210,0.55)";
        ctx.lineWidth = Math.max(1, s * 0.25);
        const bh = 2.5 * s;
        for (let row = 0; row * bh < w.h * s; row++) {
          ctx.beginPath();
          ctx.moveTo(x, y + row * bh);
          ctx.lineTo(x + w.w * s, y + row * bh);
          ctx.stroke();
          for (let bx = (row % 2) * 2.5 * s; bx < w.w * s; bx += 5 * s) {
            ctx.beginPath();
            ctx.moveTo(x + bx, y + row * bh);
            ctx.lineTo(x + bx, y + (row + 1) * bh);
            ctx.stroke();
          }
        }
        ctx.restore();
      }
    }

    // darker places (drawn over the floor, under the robot)
    const shade = (level: number) => (Math.max(0, 70 - level) / 70) * 0.72;
    if (shade(world.light) > 0) {
      ctx.fillStyle = `rgba(1,15,42,${shade(world.light)})`;
      ctx.fillRect(0, 0, width, height);
    }
    for (const z of world.lightZones) {
      const a = shade(z.level);
      if (a > 0) {
        ctx.fillStyle = `rgba(1,15,42,${a})`;
        ctx.fillRect(z.x * s, z.y * s, z.w * s, z.h * s);
      }
      if (z.level <= 15) {
        ctx.fillStyle = "#6D6A66";
        ctx.fillRect(z.x * s, z.y * s, z.w * s, s * 2.2);
        ctx.fillRect(z.x * s, (z.y + z.h) * s - s * 2.2, z.w * s, s * 2.2);
      }
      if (z.label && !thumbnail) label(ctx, `${z.label} · light ${z.level}`, z.x * s + s, height - 6 * s, s, a > 0.25);
    }

    if (trail.length > 1) {
      ctx.strokeStyle = "rgba(213,132,1,0.8)";
      ctx.lineWidth = Math.max(1.5, 0.55 * s);
      ctx.setLineDash([s * 1.2, s * 1.2]);
      ctx.beginPath();
      trail.forEach((p, i) => (i ? ctx.lineTo(p.x * s, p.y * s) : ctx.moveTo(p.x * s, p.y * s)));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    for (const it of world.items) {
      if (frame.carrying === it.id) continue;
      const p = frame.items[it.id] ?? it;
      drawItem(ctx, it, p.x, p.y, s);
    }
    if (showSensors && !thumbnail) drawSensors(ctx, world, frame, s);
    drawRobot(ctx, world.robot, frame, s);
    if (frame.carrying) {
      const it = world.items.find((i) => i.id === frame.carrying);
      const p = frame.items[frame.carrying];
      if (it && p) drawItem(ctx, it, p.x, p.y, s);
    }

    if (frame.display && !thumbnail) {
      ctx.font = `800 ${Math.max(12, 3.4 * s)}px system-ui, sans-serif`;
      const tw = ctx.measureText(frame.display).width + 14;
      const bh = Math.max(20, 5 * s);
      const bx = Math.min(Math.max(frame.x * s - tw / 2, 4), width - tw - 4);
      const by = Math.max(frame.y * s - ROBOT_RADIUS[world.robot] * s - bh - 8, 4);
      ctx.fillStyle = "#010F2A";
      roundRect(ctx, bx, by, tw, bh, 8);
      ctx.fill();
      ctx.fillStyle = "#F0D030";
      ctx.textBaseline = "middle";
      ctx.fillText(frame.display, bx + 7, by + bh / 2 + 0.5);
    }
    if (clapNow) {
      ctx.font = `900 ${Math.max(16, 6 * s)}px system-ui, sans-serif`;
      ctx.textBaseline = "top";
      ctx.fillStyle = "#D58401";
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 4;
      ctx.strokeText("CLAP!", 10, 10);
      ctx.fillText("CLAP!", 10, 10);
    }
  });

  useEffect(() => {
    const box = wrap.current;
    if (!box) return;
    const ro = new ResizeObserver(() => setBoxWidth(box.clientWidth));
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrap} className="w-full">
      <canvas
        ref={canvas}
        className={`block w-full ${thumbnail ? "" : "rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-black/10"}`}
        role="img"
        aria-label={`Robot mat, ${world.w} by ${world.h} centimetres`}
      />
    </div>
  );
}
