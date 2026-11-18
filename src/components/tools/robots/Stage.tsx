"use client";

import { useEffect, useRef, useState } from "react";
import type { ColourName, Frame, Item, LedColour, RobotKind, World } from "./sim";
import { ROBOT_RADIUS } from "./sim";

/** Draws the mat and the robot for one moment of a run. */

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

type Props = {
  world: World;
  frame: Frame;
  trail: { x: number; y: number }[];
  clapNow: boolean;
};

function drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#F48FB1";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    const a = (i / 5) * Math.PI * 2;
    ctx.ellipse(Math.cos(a) * 2.2 * s, Math.sin(a) * 2.2 * s, 1.8 * s, 1.2 * s, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#F0D030";
  ctx.beginPath();
  ctx.arc(0, 0, 1.4 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawRobot(ctx: CanvasRenderingContext2D, kind: RobotKind, f: Frame, s: number) {
  const r = ROBOT_RADIUS[kind] * s;
  ctx.save();
  ctx.translate(f.x * s, f.y * s);
  ctx.rotate((-f.heading * Math.PI) / 180);
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 6;
  // wheels
  ctx.fillStyle = "#1A1F2B";
  const wheelL = r * 0.9;
  ctx.fillRect(-wheelL / 2, -r - r * 0.18, wheelL, r * 0.3);
  ctx.fillRect(-wheelL / 2, r - r * 0.12, wheelL, r * 0.3);
  ctx.shadowBlur = 0;
  // body
  ctx.fillStyle = kind === "scout" ? "#F0D030" : kind === "racer" ? "#1E88E5" : "#012C61";
  ctx.strokeStyle = "#010F2A";
  ctx.lineWidth = Math.max(1, s * 0.4);
  ctx.beginPath();
  if (kind === "racer") ctx.roundRect(-r * 1.1, -r * 0.85, r * 2.2, r * 1.7, r * 0.35);
  else ctx.roundRect(-r, -r, r * 2, r * 2, r * (kind === "scout" ? 0.6 : 0.3));
  ctx.fill();
  ctx.stroke();
  // front marker (which way it faces)
  ctx.fillStyle = kind === "rover" ? "#F0D030" : "#010F2A";
  ctx.beginPath();
  ctx.moveTo(r * 0.95, 0);
  ctx.lineTo(r * 0.45, -r * 0.35);
  ctx.lineTo(r * 0.45, r * 0.35);
  ctx.closePath();
  ctx.fill();
  // gripper arms
  if (kind === "rover") {
    ctx.strokeStyle = "#9AA4B2";
    ctx.lineWidth = Math.max(1.5, s * 0.8);
    ctx.beginPath();
    ctx.moveTo(r, -r * 0.55);
    ctx.lineTo(r * 1.45, -r * 0.55);
    ctx.moveTo(r, r * 0.55);
    ctx.lineTo(r * 1.45, r * 0.55);
    ctx.stroke();
  }
  // LED
  ctx.fillStyle = LED[f.led];
  ctx.beginPath();
  ctx.arc(-r * 0.25, 0, r * 0.32, 0, Math.PI * 2);
  ctx.fill();
  if (f.led !== "off") {
    ctx.fillStyle = LED[f.led] + "55";
    ctx.beginPath();
    ctx.arc(-r * 0.25, 0, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }
  if (f.bumped) {
    ctx.strokeStyle = "#FF3B3B";
    ctx.lineWidth = Math.max(2, s);
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.35, -0.6, 0.6);
    ctx.stroke();
  }
  ctx.restore();
}

function drawItem(ctx: CanvasRenderingContext2D, it: Item, x: number, y: number, s: number) {
  const size = 4 * s;
  ctx.fillStyle = FLOOR[it.colour];
  ctx.strokeStyle = "#010F2A";
  ctx.lineWidth = Math.max(1, s * 0.35);
  ctx.beginPath();
  ctx.roundRect(x * s - size / 2, y * s - size / 2, size, size, s * 0.6);
  ctx.fill();
  ctx.stroke();
}

export default function Stage({ world, frame, trail, clapNow }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [, setBoxWidth] = useState(0);

  useEffect(() => {
    const c = canvas.current;
    const box = wrap.current;
    if (!c || !box) return;
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

    // mat
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
    if (world.grid) {
      ctx.strokeStyle = "#E3E9F2";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 10; x < world.w; x += 10) {
        ctx.moveTo(x * s, 0);
        ctx.lineTo(x * s, height);
      }
      for (let y = 10; y < world.h; y += 10) {
        ctx.moveTo(0, y * s);
        ctx.lineTo(width, y * s);
      }
      ctx.stroke();
    }
    ctx.font = `600 ${Math.max(10, 3.2 * s)}px system-ui, sans-serif`;
    ctx.textBaseline = "top";
    for (const z of world.zones) {
      ctx.fillStyle = FLOOR[z.colour] + "66";
      ctx.fillRect(z.x * s, z.y * s, z.w * s, z.h * s);
      ctx.strokeStyle = FLOOR[z.colour];
      ctx.lineWidth = 2;
      ctx.strokeRect(z.x * s, z.y * s, z.w * s, z.h * s);
      if (z.label) {
        ctx.fillStyle = "#010F2A";
        ctx.fillText(z.label, z.x * s + 4, z.y * s + 3);
      }
    }
    for (const line of world.lines) {
      ctx.strokeStyle = "#111111";
      ctx.lineWidth = (line.width ?? 2) * s;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      line.points.forEach((p, i) => (i ? ctx.lineTo(p.x * s, p.y * s) : ctx.moveTo(p.x * s, p.y * s)));
      ctx.stroke();
    }
    for (const p of world.places) {
      if (p.kind === "flower") drawFlower(ctx, p.x * s, p.y * s, s);
      else {
        ctx.fillStyle = "#010F2A";
        ctx.fillText(p.label, p.x * s, p.y * s);
      }
    }
    for (const w of world.walls) {
      ctx.fillStyle = "#5D4037";
      ctx.fillRect(w.x * s, w.y * s, w.w * s, w.h * s);
      ctx.strokeStyle = "#3E2723";
      ctx.lineWidth = 2;
      ctx.strokeRect(w.x * s, w.y * s, w.w * s, w.h * s);
    }
    // darkness last, so it shades everything under it
    // Ordinary room light (70+) stays clear; darker areas get darker.
    const shade = (level: number) => `rgba(1,15,42,${(Math.max(0, 70 - level) / 70) * 0.75})`;
    if (world.light < 70) {
      ctx.fillStyle = shade(world.light);
      ctx.fillRect(0, 0, width, height);
    }
    for (const z of world.lightZones) {
      ctx.clearRect(z.x * s, z.y * s, z.w * s, z.h * s);
      ctx.save();
      ctx.beginPath();
      ctx.rect(z.x * s, z.y * s, z.w * s, z.h * s);
      ctx.clip();
      // redraw the floor under this zone, then its own shade
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(z.x * s, z.y * s, z.w * s, z.h * s);
      for (const line of world.lines) {
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = (line.width ?? 2) * s;
        ctx.beginPath();
        line.points.forEach((p, i) => (i ? ctx.lineTo(p.x * s, p.y * s) : ctx.moveTo(p.x * s, p.y * s)));
        ctx.stroke();
      }
      ctx.fillStyle = shade(z.level);
      ctx.fillRect(z.x * s, z.y * s, z.w * s, z.h * s);
      ctx.restore();
      if (z.label) {
        ctx.fillStyle = z.level < 45 ? "#F0D030" : "#010F2A";
        ctx.fillText(`${z.label} · light ${z.level}`, z.x * s + 4, height - 4.5 * s);
      }
    }
    // trail
    if (trail.length > 1) {
      ctx.strokeStyle = "rgba(213,132,1,0.75)";
      ctx.lineWidth = Math.max(1.5, 0.6 * s);
      ctx.setLineDash([4, 4]);
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
    drawRobot(ctx, world.robot, frame, s);
    if (frame.carrying) {
      const it = world.items.find((i) => i.id === frame.carrying);
      const p = frame.items[frame.carrying];
      if (it && p) drawItem(ctx, it, p.x, p.y, s);
    }
    if (frame.display) {
      const text = frame.display;
      ctx.font = `700 ${Math.max(12, 3.6 * s)}px system-ui, sans-serif`;
      const tw = ctx.measureText(text).width + 12;
      const bx = Math.min(Math.max(frame.x * s - tw / 2, 2), width - tw - 2);
      const by = Math.max(frame.y * s - ROBOT_RADIUS[world.robot] * s - 26, 2);
      ctx.fillStyle = "#010F2A";
      ctx.beginPath();
      ctx.roundRect(bx, by, tw, 20, 6);
      ctx.fill();
      ctx.fillStyle = "#F0D030";
      ctx.textBaseline = "middle";
      ctx.fillText(text, bx + 6, by + 10);
    }
    if (clapNow) {
      ctx.font = `800 ${Math.max(14, 5 * s)}px system-ui, sans-serif`;
      ctx.fillStyle = "#D58401";
      ctx.textBaseline = "top";
      ctx.fillText("CLAP!", 8, 8);
    }
    ctx.strokeStyle = "#012C61";
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, width - 3, height - 3);
  });

  useEffect(() => {
    const box = wrap.current;
    if (!box) return;
    // A new width means a redraw (the drawing effect runs after every render).
    const ro = new ResizeObserver(() => setBoxWidth(box.clientWidth));
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrap} className="w-full">
      <canvas ref={canvas} className="block w-full rounded-lg" role="img" aria-label={`Robot mat, ${world.w} by ${world.h} centimetres`} />
    </div>
  );
}
