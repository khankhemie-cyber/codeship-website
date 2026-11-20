"use client";

import { useEffect, useRef, useState } from "react";
import type { DecorKind, Scene, Theme, ZoneIcon } from "./missions";
import type { Collectible, ColourName, Frame, Item, LedColour, Note, Rect, RobotKind, SoundEvent, Target, World } from "./sim";
import { ROBOT_RADIUS } from "./sim";

/**
 * Draws one moment of a run: an illustrated world for the mission (decoration
 * only; the simulator never sees it), the robot, what it is doing, and what
 * its sensors see. Also used small, as mission-card thumbnails.
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

const PEN: Record<string, string> = { red: "#E53935", blue: "#1E6FE0", green: "#2E9E44", yellow: "#F2C200", purple: "#8E24AA", orange: "#F57C00", black: "#1A1A1A" };

/** Base colours per world. `dark` worlds get light labels. */
type Pattern = "speckle" | "planksH" | "planksV" | "tiles" | "checker" | "water" | "grass" | "concrete" | "mud" | "carpet" | "court" | "lined" | "stars" | "panels" | "ice" | "dunes" | "glass" | "cobbles";
/** More places: a palette and a pattern each, so every mission can have its own scene. */
const SPEC: Partial<Record<Theme, { base: string; accent: string; grid: string; dark?: boolean; pattern: Pattern; sky?: [string, string] }>> = {
  dawn: { base: "#E9D7A0", accent: "#D9C27C", grid: "rgba(120,80,20,0.15)", pattern: "speckle", sky: ["#FF9E7A", "#FFD27A"] },
  barn: { base: "#A86F3E", accent: "#966033", grid: "rgba(50,25,0,0.18)", pattern: "planksV" },
  pigpen: { base: "#8D6E52", accent: "#7A5C42", grid: "rgba(40,20,0,0.18)", pattern: "mud" },
  practice: { base: "#6A4C93", accent: "#5C4083", grid: "rgba(255,255,255,0.10)", dark: true, pattern: "carpet" },
  gym: { base: "#D9A86C", accent: "#CC9A5C", grid: "rgba(80,50,10,0.14)", pattern: "court" },
  party: { base: "#FCE4EC", accent: "#F8BBD0", grid: "rgba(150,40,90,0.12)", pattern: "checker" },
  lagoon: { base: "#4FC3D9", accent: "#7DD8E6", grid: "rgba(255,255,255,0.18)", pattern: "water" },
  kelp: { base: "#1E7A6B", accent: "#26907D", grid: "rgba(255,255,255,0.12)", dark: true, pattern: "water" },
  deep: { base: "#0D2B55", accent: "#123A6E", grid: "rgba(255,255,255,0.10)", dark: true, pattern: "water" },
  snowpark: { base: "#F3F8FC", accent: "#DDEAF5", grid: "rgba(60,100,150,0.12)", pattern: "speckle" },
  ice: { base: "#CFE9F7", accent: "#B5DCF2", grid: "rgba(40,90,140,0.14)", pattern: "ice" },
  village: { base: "#E9EEF2", accent: "#C9D2DA", grid: "rgba(60,80,100,0.14)", pattern: "cobbles" },
  sidewalk: { base: "#BFC3C7", accent: "#AEB3B8", grid: "rgba(40,40,50,0.18)", pattern: "concrete" },
  paper: { base: "#FFFFFF", accent: "#E3F2FD", grid: "rgba(30,90,180,0.15)", pattern: "lined" },
  canvas: { base: "#F2E8D5", accent: "#E8DCC2", grid: "rgba(90,70,40,0.12)", pattern: "speckle" },
  dressing: { base: "#4E342E", accent: "#5D4037", grid: "rgba(255,255,255,0.08)", dark: true, pattern: "planksH" },
  rooftop: { base: "#263238", accent: "#37474F", grid: "rgba(255,255,255,0.08)", dark: true, pattern: "stars" },
  classroom: { base: "#E8EEF4", accent: "#D7E1EB", grid: "rgba(40,60,100,0.12)", pattern: "tiles" },
  meadow: { base: "#C5E1A5", accent: "#AED581", grid: "rgba(40,90,30,0.12)", pattern: "grass" },
  nightrail: { base: "#5B6B4A", accent: "#4E5D3F", grid: "rgba(255,255,255,0.08)", dark: true, pattern: "grass" },
  dogpark: { base: "#B5DD8E", accent: "#9ED06F", grid: "rgba(40,90,30,0.13)", pattern: "grass" },
  hill: { base: "#9CCC65", accent: "#8BC34A", grid: "rgba(30,80,20,0.15)", pattern: "dunes" },
  greenhouse: { base: "#DCEDC8", accent: "#C5E1A5", grid: "rgba(40,90,30,0.12)", pattern: "glass" },
  sunflowers: { base: "#D4E157", accent: "#C0CA33", grid: "rgba(80,90,10,0.15)", pattern: "grass" },
  firehall: { base: "#B71C1C", accent: "#A31717", grid: "rgba(255,255,255,0.10)", dark: true, pattern: "tiles" },
  street: { base: "#B0B6BE", accent: "#9EA5AE", grid: "rgba(30,30,40,0.12)", pattern: "concrete" },
  control: { base: "#14213D", accent: "#1D2D50", grid: "rgba(140,190,255,0.12)", dark: true, pattern: "panels" },
  hangar: { base: "#9AA4AE", accent: "#8A949E", grid: "rgba(20,30,40,0.14)", pattern: "concrete" },
  boardwalk: { base: "#C49A6C", accent: "#B48A5C", grid: "rgba(60,30,0,0.15)", pattern: "planksV" },
  snackbar: { base: "#FFF3E0", accent: "#FFE0B2", grid: "rgba(150,90,20,0.12)", pattern: "checker" },
  pier: { base: "#3E8EC4", accent: "#5AA5D6", grid: "rgba(255,255,255,0.12)", pattern: "water" },
  dunes: { base: "#D9844F", accent: "#C8733F", grid: "rgba(60,15,0,0.15)", pattern: "dunes" },
  craters: { base: "#A9543A", accent: "#97472F", grid: "rgba(60,15,0,0.16)", pattern: "speckle" },
  tunnel: { base: "#6D5A4B", accent: "#5E4C3E", grid: "rgba(255,230,200,0.10)", dark: true, pattern: "speckle" },
  cavern: { base: "#3C3348", accent: "#4A3F58", grid: "rgba(255,230,255,0.10)", dark: true, pattern: "speckle" },
  gemvault: { base: "#2C3E50", accent: "#34495E", grid: "rgba(150,230,255,0.12)", dark: true, pattern: "speckle" },
  hall: { base: "#E8E2D6", accent: "#D8D0C0", grid: "rgba(60,50,40,0.10)", pattern: "planksH" },
  dinohall: { base: "#E3D5B8", accent: "#D4C4A2", grid: "rgba(90,70,40,0.12)", pattern: "tiles" },
  sculpture: { base: "#ECEFF1", accent: "#CFD8DC", grid: "rgba(40,50,60,0.10)", pattern: "checker" },
  deck: { base: "#9C7350", accent: "#8A6443", grid: "rgba(50,25,0,0.18)", pattern: "planksH" },
  cave: { base: "#4B4237", accent: "#3D352C", grid: "rgba(255,230,200,0.10)", dark: true, pattern: "speckle" },
  warehouse: { base: "#C9C2B4", accent: "#B8B0A0", grid: "rgba(40,30,20,0.12)", pattern: "concrete" },
  lab2: { base: "#E0F2F1", accent: "#B2DFDB", grid: "rgba(0,90,80,0.12)", pattern: "tiles" },
  bridge: { base: "#1A2238", accent: "#232E4A", grid: "rgba(140,190,255,0.12)", dark: true, pattern: "panels" },
  garden2: { base: "#A5D6A7", accent: "#81C784", grid: "rgba(30,90,30,0.12)", pattern: "grass" },
  ashfield: { base: "#55504C", accent: "#48433F", grid: "rgba(255,200,160,0.10)", dark: true, pattern: "speckle" },
  lavalake: { base: "#2B2422", accent: "#3A2E2A", grid: "rgba(255,200,160,0.10)", dark: true, pattern: "speckle" },
  rooftopsolar: { base: "#8D8D8D", accent: "#7E7E7E", grid: "rgba(20,20,20,0.15)", pattern: "concrete" },
  windfarm: { base: "#B9DD8C", accent: "#A4D06E", grid: "rgba(40,90,30,0.12)", pattern: "grass" },
};

const THEME: Record<string, { base: string; accent: string; grid: string; dark?: boolean }> = {
  farm: { base: "#E8D7A4", accent: "#D7BF7E", grid: "rgba(120,80,20,0.16)" },
  stage: { base: "#B9814C", accent: "#A56E3C", grid: "rgba(60,30,0,0.16)" },
  ocean: { base: "#1F6FA8", accent: "#2C86C2", grid: "rgba(255,255,255,0.12)", dark: true },
  snow: { base: "#F1F7FD", accent: "#DCEAF7", grid: "rgba(60,100,150,0.13)" },
  studio: { base: "#D9B98F", accent: "#C9A579", grid: "rgba(80,60,40,0.12)" },
  disco: { base: "#1B1035", accent: "#2A1A55", grid: "rgba(255,255,255,0.08)", dark: true },
  rail: { base: "#BFDC9A", accent: "#A9CF7F", grid: "rgba(40,90,30,0.12)" },
  park: { base: "#BFE3A1", accent: "#A7D684", grid: "rgba(40,90,30,0.13)" },
  garden: { base: "#B6DB8E", accent: "#9FCF72", grid: "rgba(40,90,30,0.13)" },
  city: { base: "#C9CDD3", accent: "#B7BCC4", grid: "rgba(30,30,40,0.12)" },
  launch: { base: "#D5D8DD", accent: "#C3C7CE", grid: "rgba(30,40,60,0.14)" },
  beach: { base: "#F3DFAE", accent: "#E9CF92", grid: "rgba(120,90,30,0.14)" },
  mars: { base: "#C4643A", accent: "#B4552E", grid: "rgba(60,15,0,0.16)" },
  mine: { base: "#5B4B40", accent: "#4C3E34", grid: "rgba(255,230,200,0.10)", dark: true },
  museum: { base: "#EDEAE4", accent: "#DAD5CC", grid: "rgba(60,50,40,0.10)" },
  cove: { base: "#F0D9A0", accent: "#E4C783", grid: "rgba(120,90,30,0.14)" },
  factory: { base: "#AEB6BF", accent: "#9CA5AF", grid: "rgba(20,30,40,0.14)" },
  station: { base: "#1E2A44", accent: "#27355A", grid: "rgba(140,190,255,0.12)", dark: true },
  volcano: { base: "#3B3433", accent: "#2E2827", grid: "rgba(255,200,160,0.10)", dark: true },
  solar: { base: "#C7E3A0", accent: "#B2D686", grid: "rgba(40,90,30,0.12)" },
  lab: { base: "#EEF2F8", accent: "#E2E8F1", grid: "rgba(40,60,100,0.14)" },
};

type Props = {
  world: World;
  scene: Scene;
  frame: Frame;
  trail?: { x: number; y: number }[];
  /** All frames of the run and the one showing (for paint and effects). */
  frames?: Frame[];
  index?: number;
  sounds?: SoundEvent[];
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
  ctx.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2)));
}

function circle(ctx: C, x: number, y: number, r: number, fill: string) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx: C, x: number, y: number, rx: number, ry: number, fill: string, rot = 0) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot, 0, Math.PI * 2);
  ctx.fill();
}

// ---------------------------------------------------------------- ground

function drawPattern(ctx: C, sp: NonNullable<(typeof SPEC)[Theme]>, w: number, h: number, s: number, t: number, seed: number) {
  const rnd = seeded(seed);
  const area = (w * h) / (s * s);
  ctx.fillStyle = sp.base;
  ctx.fillRect(0, 0, w, h);
  const line = (x1: number, y1: number, x2: number, y2: number, col: string, lw: number) => {
    ctx.strokeStyle = col;
    ctx.lineWidth = Math.max(1, lw);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };
  switch (sp.pattern) {
    case "speckle":
      for (let i = 0; i < area / 22; i++) ellipse(ctx, rnd() * w, rnd() * h, s * (0.6 + rnd() * 1.6), s * (0.3 + rnd() * 0.8), sp.accent, rnd() * 3);
      break;
    case "grass":
      for (let i = 0; i < area / 10; i++) {
        const x = rnd() * w;
        const y = rnd() * h;
        line(x, y, x + (rnd() - 0.5) * s, y - s * (0.8 + rnd()), sp.accent, s * 0.3);
      }
      break;
    case "mud":
      for (let i = 0; i < area / 120; i++) ellipse(ctx, rnd() * w, rnd() * h, s * (3 + rnd() * 5), s * (1.5 + rnd() * 2.5), "rgba(90,60,35,0.55)", rnd());
      for (let i = 0; i < area / 260; i++) ellipse(ctx, rnd() * w, rnd() * h, s * (2 + rnd() * 2), s * (1 + rnd()), "rgba(150,190,220,0.45)", rnd());
      break;
    case "planksH":
    case "planksV": {
      const p = 6 * s;
      const horiz = sp.pattern === "planksH";
      for (let k = 0; k * p < (horiz ? h : w); k++) {
        ctx.fillStyle = k % 2 ? sp.base : sp.accent;
        if (horiz) ctx.fillRect(0, k * p, w, p);
        else ctx.fillRect(k * p, 0, p, h);
        if (horiz) line(0, k * p, w, k * p, "rgba(0,0,0,0.25)", s * 0.2);
        else line(k * p, 0, k * p, h, "rgba(0,0,0,0.25)", s * 0.2);
      }
      break;
    }
    case "tiles":
    case "checker": {
      const tile = 10 * s;
      for (let y = 0; y < h; y += tile)
        for (let x = 0; x < w; x += tile) {
          if (sp.pattern === "checker" && (Math.round(x / tile) + Math.round(y / tile)) % 2) {
            ctx.fillStyle = sp.accent;
            ctx.fillRect(x, y, tile, tile);
          }
          if (sp.pattern === "tiles") {
            ctx.strokeStyle = sp.accent;
            ctx.lineWidth = Math.max(1, s * 0.3);
            ctx.strokeRect(x, y, tile, tile);
          }
        }
      break;
    }
    case "water":
      for (let i = 0; i < 16; i++) {
        const x = ((rnd() * w + t * 6 * s) % (w + 20 * s)) - 10 * s;
        ellipse(ctx, x, rnd() * h, s * (6 + rnd() * 8), s * (1 + rnd()), sp.accent, 0.2);
      }
      for (let i = 0; i < 10; i++) {
        const rise = (t * 0.3 + rnd()) % 1;
        circle(ctx, rnd() * w, h - rise * h, s * (0.4 + rnd() * 0.5), "rgba(255,255,255,0.35)");
      }
      break;
    case "concrete":
      for (let x = 0; x < w; x += 20 * s) line(x, 0, x, h, sp.accent, s * 0.25);
      for (let y = 0; y < h; y += 20 * s) line(0, y, w, y, sp.accent, s * 0.25);
      for (let i = 0; i < area / 40; i++) circle(ctx, rnd() * w, rnd() * h, s * 0.25, "rgba(0,0,0,0.12)");
      break;
    case "carpet":
      for (let y = 0; y < h; y += 3 * s) for (let x = ((y / (3 * s)) % 2) * 1.5 * s; x < w; x += 3 * s) circle(ctx, x, y, s * 0.35, sp.accent);
      break;
    case "court":
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = Math.max(1.5, s * 0.6);
      ctx.strokeRect(3 * s, 3 * s, w - 6 * s, h - 6 * s);
      line(w / 2, 3 * s, w / 2, h - 3 * s, "rgba(255,255,255,0.75)", s * 0.6);
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 8 * s, 0, Math.PI * 2);
      ctx.stroke();
      for (let x = 0; x < w; x += 6 * s) line(x, 0, x, h, "rgba(80,50,10,0.12)", s * 0.2);
      break;
    case "lined":
      for (let y = 6 * s; y < h; y += 6 * s) line(0, y, w, y, sp.accent, s * 0.35);
      line(8 * s, 0, 8 * s, h, "rgba(229,57,53,0.45)", s * 0.35);
      break;
    case "stars":
      for (let i = 0; i < area / 18; i++) circle(ctx, rnd() * w, rnd() * h, s * (0.15 + rnd() * 0.3), `rgba(255,255,255,${0.3 + 0.5 * Math.abs(Math.sin(t * 2 + i))})`);
      for (let x = 0; x < w; x += 12 * s) {
        const bh = (6 + rnd() * 10) * s;
        ctx.fillStyle = sp.accent;
        ctx.fillRect(x, h - bh, 10 * s, bh);
        for (let k = 0; k < 4; k++) if (rnd() > 0.4) {
          ctx.fillStyle = "#FFE082";
          ctx.fillRect(x + (1 + (k % 2) * 5) * s, h - bh + (1.5 + Math.floor(k / 2) * 3) * s, 2 * s, 1.5 * s);
        }
      }
      break;
    case "panels": {
      const p = 20 * s;
      for (let y = 0; y < h; y += p)
        for (let x = 0; x < w; x += p) {
          ctx.strokeStyle = sp.grid;
          ctx.lineWidth = Math.max(1, s * 0.3);
          roundRect(ctx, x + s, y + s, p - 2 * s, p - 2 * s, s);
          ctx.stroke();
        }
      for (let i = 0; i < 10; i++) circle(ctx, rnd() * w, rnd() * h, s * 0.5, Math.sin(t * 3 + i) > 0 ? "#4DD0E1" : "#FFB74D");
      break;
    }
    case "ice":
      for (let i = 0; i < area / 70; i++) {
        const x = rnd() * w;
        const y = rnd() * h;
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = Math.max(1, s * 0.3);
        ctx.beginPath();
        ctx.arc(x, y, s * (4 + rnd() * 8), rnd() * 6, rnd() * 6 + 1.2);
        ctx.stroke();
      }
      break;
    case "dunes":
      for (let k = 0; k < 9; k++) {
        ctx.strokeStyle = sp.accent;
        ctx.lineWidth = Math.max(1, s * 0.8);
        ctx.beginPath();
        for (let x = 0; x <= w; x += 4 * s) ctx.lineTo(x, (k / 8) * h + Math.sin(x / (14 * s) + k) * 3 * s);
        ctx.stroke();
      }
      break;
    case "glass":
      for (let x = 0; x < w; x += 15 * s) line(x, 0, x, h, "rgba(255,255,255,0.7)", s * 0.5);
      for (let y = 0; y < h; y += 15 * s) line(0, y, w, y, "rgba(255,255,255,0.7)", s * 0.5);
      break;
    case "cobbles":
      for (let y = 0; y < h; y += 4 * s) for (let x = ((y / (4 * s)) % 2) * 2.5 * s; x < w; x += 5 * s) ellipse(ctx, x, y, 2.2 * s, 1.6 * s, sp.accent);
      break;
  }
  if (sp.sky) {
    const g = ctx.createLinearGradient(0, 0, 0, 10 * s);
    g.addColorStop(0, sp.sky[0]);
    g.addColorStop(1, sp.sky[1] + "00");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, 10 * s);
  }
}

function drawGround(ctx: C, scene: Scene, world: World, w: number, h: number, s: number, t: number) {
  const sp = SPEC[scene.theme];
  if (sp) return drawPattern(ctx, sp, w, h, s, t, scene.theme.length * 31 + world.w);
  const th = THEME[scene.theme];
  ctx.fillStyle = th.base;
  ctx.fillRect(0, 0, w, h);
  const rnd = seeded(scene.theme.length * 97 + 7);
  const speckle = (n: number, col: string, rx: number, ry: number) => {
    for (let i = 0; i < n; i++) ellipse(ctx, rnd() * w, rnd() * h, s * rx * (0.5 + rnd()), s * ry * (0.5 + rnd()), col, rnd() * 3);
  };
  const area = (w * h) / (s * s);
  switch (scene.theme) {
    case "farm":
      speckle(area / 30, th.accent, 1.4, 0.5);
      ctx.strokeStyle = "rgba(200,160,60,0.55)";
      ctx.lineWidth = Math.max(1, s * 0.25);
      for (let i = 0; i < area / 25; i++) {
        const x = rnd() * w;
        const y = rnd() * h;
        const a = rnd() * Math.PI;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * s * 2, y + Math.sin(a) * s * 2);
        ctx.stroke();
      }
      break;
    case "stage": {
      const plank = 6 * s;
      for (let y = 0; y < h; y += plank) {
        ctx.fillStyle = Math.round(y / plank) % 2 ? th.base : "#C18B56";
        ctx.fillRect(0, y, w, plank);
        ctx.fillStyle = "rgba(60,30,10,0.35)";
        ctx.fillRect(0, y, w, Math.max(1, s * 0.2));
        for (let x = (Math.round(y / plank) % 3) * 13 * s; x < w; x += 40 * s) ctx.fillRect(x, y, Math.max(1, s * 0.2), plank);
      }
      // curtain along the back
      ctx.fillStyle = "#A3122A";
      ctx.fillRect(0, 0, w, 5 * s);
      ctx.fillStyle = "#C2183A";
      for (let x = 0; x < w; x += 8 * s) {
        ctx.beginPath();
        ctx.arc(x + 4 * s, 5 * s, 4 * s, 0, Math.PI);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(255,215,64,0.9)";
      ctx.fillRect(0, 0, w, s * 0.8);
      break;
    }
    case "ocean": {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#2A8CCB");
      g.addColorStop(1, "#14507E");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.07)";
      for (let i = 0; i < 14; i++) {
        const x = ((rnd() * w + t * 6 * s) % (w + 20 * s)) - 10 * s;
        ellipse(ctx, x, rnd() * h, s * (6 + rnd() * 8), s * (1.2 + rnd()), "rgba(255,255,255,0.07)", 0.2);
      }
      ctx.fillStyle = "#E6CF94";
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 10 * s) ctx.lineTo(x, h - (2.5 + Math.sin(x / (9 * s)) * 1.2) * s);
      ctx.lineTo(w, h);
      ctx.fill();
      break;
    }
    case "snow":
      speckle(area / 60, th.accent, 5, 2);
      for (let i = 0; i < area / 12; i++) circle(ctx, rnd() * w, rnd() * h, s * 0.25, "rgba(150,190,230,0.6)");
      break;
    case "studio": {
      const plank = 8 * s;
      for (let x = 0; x < w; x += plank) {
        ctx.fillStyle = Math.round(x / plank) % 2 ? th.base : th.accent;
        ctx.fillRect(x, 0, plank, h);
      }
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      roundRect(ctx, 9 * s, 7 * s, (world.w - 22) * s, (world.h - 16) * s, s);
      ctx.fill();
      ctx.fillStyle = "#FFFDF7";
      roundRect(ctx, 8 * s, 6 * s, (world.w - 22) * s, (world.h - 16) * s, s);
      ctx.fill();
      break;
    }
    case "disco": {
      const tile = 10 * s;
      const palette = ["#FF4FA3", "#7C4DFF", "#00E5FF", "#FFD600", "#76FF03", "#FF6D00"];
      for (let y = 0; y < h; y += tile)
        for (let x = 0; x < w; x += tile) {
          const k = Math.floor(x / tile) * 7 + Math.floor(y / tile) * 3 + Math.floor(t * 2);
          ctx.fillStyle = (Math.floor(x / tile) + Math.floor(y / tile)) % 2 ? palette[k % palette.length] + "55" : "#241447";
          ctx.fillRect(x + 1, y + 1, tile - 2, tile - 2);
        }
      break;
    }
    case "rail":
    case "park":
    case "solar":
      speckle(area / 18, th.accent, 1, 0.4);
      break;
    case "garden":
      speckle(area / 18, th.accent, 1, 0.4);
      break;
    case "city":
      ctx.fillStyle = "#AEB4BC";
      for (let x = 0; x < w; x += 10 * s) ctx.fillRect(x, 0, Math.max(1, s * 0.15), h);
      break;
    case "launch": {
      for (let i = 0; i < area / 40; i++) circle(ctx, rnd() * w, rnd() * h, s * 0.3, "rgba(80,90,110,0.2)");
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, h - 3 * s, w, 3 * s);
      ctx.rect(0, 0, w, 3 * s);
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
      break;
    }
    case "beach": {
      speckle(area / 30, th.accent, 0.8, 0.5);
      const sea = 9 * s;
      ctx.fillStyle = "#4FB3E8";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w, 0);
      for (let x = w; x >= 0; x -= 4 * s) ctx.lineTo(x, sea + Math.sin(x / (6 * s) + t * 2) * 1.2 * s);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = Math.max(1.5, s * 0.6);
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4 * s) ctx.lineTo(x, sea + Math.sin(x / (6 * s) + t * 2) * 1.2 * s);
      ctx.stroke();
      break;
    }
    case "mars":
      speckle(area / 20, th.accent, 2, 1);
      speckle(area / 50, "#D7794A", 1.5, 0.8);
      break;
    case "mine":
      speckle(area / 15, th.accent, 2.4, 1.6);
      speckle(area / 40, "#6E5C4F", 1.2, 0.8);
      break;
    case "museum": {
      const tile = 10 * s;
      for (let y = 0; y < h; y += tile)
        for (let x = 0; x < w; x += tile) {
          ctx.fillStyle = (Math.round(x / tile) + Math.round(y / tile)) % 2 ? th.base : th.accent;
          ctx.fillRect(x, y, tile, tile);
        }
      break;
    }
    case "cove": {
      speckle(area / 30, th.accent, 0.8, 0.5);
      ctx.fillStyle = "#3FA7D6";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(48 * s, 0);
      ctx.bezierCurveTo(40 * s, 6 * s, 26 * s, 14 * s, 0, 18 * s);
      ctx.fill();
      // the vault: stone floor behind the door
      const vx = 82 * s;
      ctx.fillStyle = "#8D8A86";
      ctx.fillRect(vx, 0, w - vx, h);
      ctx.strokeStyle = "rgba(60,55,50,0.5)";
      ctx.lineWidth = Math.max(1, s * 0.25);
      for (let y = 0; y < h; y += 6 * s) {
        ctx.beginPath();
        ctx.moveTo(vx, y);
        ctx.lineTo(w, y);
        ctx.stroke();
        for (let x = vx + ((y / (6 * s)) % 2) * 5 * s; x < w; x += 10 * s) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + 6 * s);
          ctx.stroke();
        }
      }
      break;
    }
    case "factory": {
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = Math.max(1, s * 0.3);
      for (let y = 0; y < h; y += 4 * s)
        for (let x = ((y / (4 * s)) % 2) * 2 * s; x < w; x += 4 * s) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 1.4 * s, y + 0.8 * s);
          ctx.stroke();
        }
      ctx.fillStyle = "#F0D030";
      ctx.fillRect(110 * s, 0, s * 1.2, h);
      break;
    }
    case "station": {
      const p = 20 * s;
      ctx.strokeStyle = "rgba(140,190,255,0.18)";
      ctx.lineWidth = Math.max(1, s * 0.3);
      for (let y = 0; y < h; y += p)
        for (let x = 0; x < w; x += p) {
          roundRect(ctx, x + s, y + s, p - 2 * s, p - 2 * s, s * 1.2);
          ctx.stroke();
        }
      for (let i = 0; i < 8; i++) circle(ctx, rnd() * w, rnd() * h, s * 0.5, rnd() > 0.5 ? "#4DD0E1" : "#FFB74D");
      break;
    }
    case "volcano": {
      for (const z of world.heatZones ?? []) {
        const heat = Math.min(1, Math.max(0, (z.temp - 25) / 160));
        ctx.fillStyle = `rgba(255,${Math.round(110 - heat * 80)},20,${0.06 + heat * 0.3})`;
        ctx.fillRect(z.x * s, z.y * s, z.w * s, z.h * s);
        ctx.strokeStyle = `rgba(255,${Math.round(170 - heat * 100)},40,${0.25 + heat * 0.7})`;
        ctx.lineWidth = Math.max(1, s * (0.3 + heat * 0.6));
        const r2 = seeded(Math.round(z.x));
        for (let k = 0; k < 2 + heat * 6; k++) {
          ctx.beginPath();
          let x = (z.x + r2() * z.w) * s;
          let y = (z.y + r2() * z.h) * s;
          ctx.moveTo(x, y);
          for (let j = 0; j < 4; j++) {
            x += (r2() - 0.5) * 10 * s;
            y += (r2() - 0.2) * 8 * s;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
      break;
    }
    case "lab":
      break;
  }
}

function drawGrid(ctx: C, world: World, scene: Scene, w: number, h: number, s: number) {
  ctx.strokeStyle = (SPEC[scene.theme] ?? THEME[scene.theme]).grid;
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

// ---------------------------------------------------------------- paths (tape lines)

function drawPath(ctx: C, pts: { x: number; y: number }[], width: number, style: Scene["path"], s: number) {
  const path = () => {
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p.x * s, p.y * s) : ctx.moveTo(p.x * s, p.y * s)));
  };
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  if (style === "road") {
    ctx.strokeStyle = "#5E646D";
    ctx.lineWidth = 12 * s;
    path();
    ctx.stroke();
    ctx.strokeStyle = "#6E757F";
    ctx.lineWidth = 10.5 * s;
    path();
    ctx.stroke();
    ctx.strokeStyle = "#F5F5F5";
    ctx.lineWidth = Math.max(1, s * 0.5);
    ctx.setLineDash([3 * s, 3 * s]);
    path();
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (style === "rail") {
    ctx.strokeStyle = "#A1968A";
    ctx.lineWidth = 9 * s;
    path();
    ctx.stroke();
    ctx.strokeStyle = "#6D4C41";
    ctx.lineWidth = 7 * s;
    ctx.setLineDash([1.2 * s, 2.2 * s]);
    ctx.lineCap = "butt";
    path();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineCap = "round";
    for (const off of [-2.4, 2.4]) {
      ctx.strokeStyle = "#5C6670";
      ctx.lineWidth = Math.max(1.2, s * 0.7);
      ctx.beginPath();
      pts.forEach((p, i) => {
        const q = pts[Math.min(i + 1, pts.length - 1)];
        const r = pts[Math.max(i - 1, 0)];
        const dx = q.x - r.x;
        const dy = q.y - r.y;
        const l = Math.hypot(dx, dy) || 1;
        const x = (p.x - (dy / l) * off) * s;
        const y = (p.y + (dx / l) * off) * s;
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      });
      ctx.stroke();
    }
    ctx.restore();
    return;
  } else if (style === "trail") {
    ctx.strokeStyle = "#D3E3F2";
    ctx.lineWidth = 11 * s;
    path();
    ctx.stroke();
    ctx.strokeStyle = "#C3D7EA";
    ctx.lineWidth = 8 * s;
    ctx.setLineDash([0.1, 3 * s]);
    path();
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.strokeStyle = style === "trail" ? "#284B6E" : "#151515";
  ctx.lineWidth = width * s;
  path();
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------- zone icons

function drawIcon(ctx: C, kind: ZoneIcon, cx: number, cy: number, size: number, colour: string) {
  const u = size / 10;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, u * 0.7);
  ctx.strokeStyle = "#010F2A";
  switch (kind) {
    case "house":
    case "school":
    case "station": {
      ctx.fillStyle = kind === "station" ? "#FFE0DC" : "#FFFFFF";
      roundRect(ctx, -4 * u, -1 * u, 8 * u, 6 * u, u * 0.6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = kind === "station" ? "#C62828" : colour;
      ctx.beginPath();
      ctx.moveTo(-5.2 * u, -0.8 * u);
      ctx.lineTo(0, -5.5 * u);
      ctx.lineTo(5.2 * u, -0.8 * u);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = kind === "station" ? "#C62828" : "#5D4037";
      if (kind === "station") {
        roundRect(ctx, -3 * u, 1 * u, 6 * u, 4 * u, u * 0.4);
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        for (const x of [-1.5, 0, 1.5]) {
          ctx.beginPath();
          ctx.moveTo(x * u, 1.4 * u);
          ctx.lineTo(x * u, 4.6 * u);
          ctx.stroke();
        }
      } else ctx.fillRect(-1 * u, 2 * u, 2 * u, 3 * u);
      break;
    }
    case "park":
      for (const [dx, dy, r] of [
        [-2.5, 1, 3],
        [2.5, 0, 3.4],
        [0, -2.5, 3],
      ])
        circle(ctx, dx * u, dy * u, r * u, "#2E7D32");
      circle(ctx, -0.5 * u, -1 * u, 2 * u, "#43A047");
      break;
    case "basket": {
      ctx.fillStyle = "#B7793A";
      ctx.beginPath();
      ctx.moveTo(-5 * u, -1 * u);
      ctx.lineTo(5 * u, -1 * u);
      ctx.lineTo(3.8 * u, 4 * u);
      ctx.lineTo(-3.8 * u, 4 * u);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(90,50,10,0.6)";
      for (const x of [-2.5, 0, 2.5]) {
        ctx.beginPath();
        ctx.moveTo(x * u, -1 * u);
        ctx.lineTo(x * 0.8 * u, 4 * u);
        ctx.stroke();
      }
      ctx.strokeStyle = "#8D5A2B";
      ctx.lineWidth = u * 0.9;
      ctx.beginPath();
      ctx.arc(0, -1 * u, 4 * u, Math.PI, 0);
      ctx.stroke();
      break;
    }
    case "star": {
      ctx.fillStyle = "#FFD54F";
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const r = (i % 2 ? 2.2 : 5) * u;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case "igloo": {
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(0, 3 * u, 5.5 * u, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(60,100,150,0.5)";
      for (const r of [2, 4]) {
        ctx.beginPath();
        ctx.arc(0, 3 * u, (5.5 - r * 0.6) * u, Math.PI, 0);
        ctx.stroke();
      }
      ctx.fillStyle = "#2B4C6F";
      ctx.beginPath();
      ctx.arc(0, 3 * u, 1.8 * u, Math.PI, 0);
      ctx.fill();
      break;
    }
    case "bin":
    case "crate": {
      ctx.fillStyle = kind === "crate" ? "#C8955A" : colour;
      roundRect(ctx, -4.5 * u, -3.5 * u, 9 * u, 7 * u, u);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = kind === "crate" ? "rgba(90,50,10,0.6)" : "rgba(255,255,255,0.85)";
      ctx.beginPath();
      for (const x of [-2.2, 0, 2.2]) {
        ctx.moveTo(x * u, -3 * u);
        ctx.lineTo(x * u, 3 * u);
      }
      ctx.stroke();
      break;
    }
    case "deck": {
      ctx.fillStyle = "#ECEFF1";
      roundRect(ctx, -5 * u, -2 * u, 10 * u, 6 * u, u);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#4FC3F7";
      for (const x of [-3.5, -0.75, 2]) ctx.fillRect(x * u, -0.8 * u, 1.6 * u, 2 * u);
      break;
    }
    case "lab": {
      ctx.fillStyle = "#0B1638";
      roundRect(ctx, -5 * u, -4 * u, 10 * u, 8 * u, u * 1.5);
      ctx.fill();
      ctx.stroke();
      circle(ctx, 1 * u, 0.5 * u, 2.6 * u, "#2E7DD7");
      ellipse(ctx, 0.2 * u, 0, 1.2 * u, 0.8 * u, "#43A047");
      circle(ctx, -3 * u, -2.5 * u, 0.3 * u, "#FFFFFF");
      circle(ctx, 3.6 * u, 2.6 * u, 0.3 * u, "#FFFFFF");
      break;
    }
    case "door":
      break;
  }
  ctx.restore();
}

// ---------------------------------------------------------------- decoration

type Decor = NonNullable<Scene["decor"]>[number];

function drawDecor(ctx: C, d: Decor, s: number, t: number, frame: Frame) {
  const x = d.x * s;
  const y = d.y * s;
  const r = (d.r ?? 4) * s;
  const shadow = (rx: number, ry: number, dx = 0.6, dy = 0.8) => ellipse(ctx, x + dx * s, y + dy * s, rx, ry, "rgba(0,0,0,0.16)");
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  switch (d.kind as DecorKind) {
    case "tree":
      shadow(r, r * 0.9, r * 0.05, r * 0.06);
      circle(ctx, x, y, r, "#2E7D32");
      circle(ctx, x - r * 0.25, y - r * 0.25, r * 0.65, "#43A047");
      circle(ctx, x - r * 0.4, y - r * 0.4, r * 0.3, "#66BB6A");
      break;
    case "pine":
      shadow(r, r * 0.8);
      for (const [k, c] of [
        [1, "#1B5E20"],
        [0.7, "#2E7D32"],
        [0.4, "#388E3C"],
      ] as const)
        circle(ctx, x, y, r * k, c);
      ellipse(ctx, x - r * 0.3, y - r * 0.35, r * 0.35, r * 0.2, "rgba(255,255,255,0.85)");
      ellipse(ctx, x + r * 0.35, y + r * 0.2, r * 0.25, r * 0.15, "rgba(255,255,255,0.75)");
      break;
    case "bush":
      for (const [dx, dy] of [
        [-0.5, 0],
        [0.5, 0],
        [0, -0.45],
      ])
        circle(ctx, x + dx * r, y + dy * r, r * 0.65, "#558B2F");
      break;
    case "rock":
      ellipse(ctx, x, y, r, r * 0.75, "#8D8580", 0.4);
      ellipse(ctx, x - r * 0.25, y - r * 0.2, r * 0.45, r * 0.3, "#B1A9A3", 0.4);
      break;
    case "bee": {
      const b = s * 1.5;
      const bob = Math.sin(t * 6 + d.x) * s * 0.6;
      ellipse(ctx, x - b * 0.4, y - b * 0.9 + bob, b * 0.7, b * 0.45, "rgba(255,255,255,0.85)", -0.5);
      ellipse(ctx, x + b * 0.4, y - b * 0.9 + bob, b * 0.7, b * 0.45, "rgba(255,255,255,0.85)", 0.5);
      ellipse(ctx, x, y + bob, b * 1.1, b * 0.75, "#F0D030");
      ctx.fillStyle = "#010F2A";
      ctx.fillRect(x - b * 0.2, y - b * 0.75 + bob, b * 0.35, b * 1.5);
      break;
    }
    case "hive":
      shadow(5 * s, 4 * s);
      for (let k = 0; k < 4; k++) ellipse(ctx, x, y - (k - 1.5) * 1.8 * s, (5 - Math.abs(k - 1.5) * 1.1) * s, 1.2 * s, k % 2 ? "#F6C445" : "#E8A922");
      circle(ctx, x, y + 1.6 * s, s * 0.9, "#5D3A00");
      break;
    case "hen": {
      shadow(3 * s, 2.2 * s);
      ellipse(ctx, x, y, 3 * s, 2.3 * s, "#FFFFFF");
      ctx.strokeStyle = "#D7CCC8";
      ctx.lineWidth = Math.max(1, s * 0.3);
      ctx.stroke();
      circle(ctx, x + 2.6 * s, y - 1.2 * s, 1.5 * s, "#FFFFFF");
      ctx.fillStyle = "#E53935";
      ctx.beginPath();
      ctx.arc(x + 2.6 * s, y - 2.6 * s, 0.7 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFA000";
      ctx.beginPath();
      ctx.moveTo(x + 3.9 * s, y - 1.4 * s);
      ctx.lineTo(x + 5 * s, y - 1 * s);
      ctx.lineTo(x + 3.9 * s, y - 0.6 * s);
      ctx.fill();
      circle(ctx, x + 3 * s, y - 1.5 * s, 0.3 * s, "#010F2A");
      break;
    }
    case "hay":
      shadow(r, r * 0.8);
      roundRect(ctx, x - r, y - r * 0.7, r * 2, r * 1.4, r * 0.3);
      ctx.fillStyle = "#E8C25A";
      ctx.fill();
      ctx.strokeStyle = "#B8902E";
      ctx.lineWidth = Math.max(1, s * 0.35);
      ctx.stroke();
      for (const k of [-0.4, 0.4]) {
        ctx.beginPath();
        ctx.moveTo(x + k * r, y - r * 0.7);
        ctx.lineTo(x + k * r, y + r * 0.7);
        ctx.stroke();
      }
      break;
    case "fence": {
      const w = (d.w ?? 100) * s;
      ctx.strokeStyle = "#8D6E63";
      ctx.lineWidth = Math.max(1.5, s * 0.6);
      ctx.beginPath();
      ctx.moveTo(x, y - s * 0.6);
      ctx.lineTo(x + w, y - s * 0.6);
      ctx.moveTo(x, y + s * 0.6);
      ctx.lineTo(x + w, y + s * 0.6);
      ctx.stroke();
      ctx.fillStyle = "#A1887F";
      for (let k = x + 2 * s; k < x + w; k += 8 * s) ctx.fillRect(k - s * 0.6, y - s * 1.6, s * 1.2, s * 3.2);
      break;
    }
    case "barn":
      shadow(r * 1.2, r);
      ctx.fillStyle = "#C62828";
      roundRect(ctx, x - r, y - r * 0.8, r * 2, r * 1.6, r * 0.15);
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = Math.max(1, s * 0.5);
      ctx.beginPath();
      ctx.moveTo(x - r, y - r * 0.8);
      ctx.lineTo(x + r, y + r * 0.8);
      ctx.moveTo(x + r, y - r * 0.8);
      ctx.lineTo(x - r, y + r * 0.8);
      ctx.stroke();
      ctx.strokeRect(x - r, y - r * 0.8, r * 2, r * 1.6);
      break;
    case "speaker":
      shadow(3.5 * s, 4 * s);
      ctx.fillStyle = "#1C1C24";
      roundRect(ctx, x - 3.2 * s, y - 4 * s, 6.4 * s, 8 * s, s);
      ctx.fill();
      {
        const pulse = 1 + Math.max(0, Math.sin(t * 9)) * 0.12;
        circle(ctx, x, y + 1 * s, 2.2 * s * pulse, "#3A3A48");
        circle(ctx, x, y + 1 * s, 1 * s, "#77778A");
        circle(ctx, x, y - 2.4 * s, 0.9 * s, "#3A3A48");
      }
      break;
    case "crowd": {
      const w = (d.w ?? 100) * s;
      const cols = ["#FFCC80", "#8D5524", "#C68642", "#F1C27D", "#E0AC69", "#5C3A21"];
      const shirts = ["#E53935", "#1E88E5", "#43A047", "#8E24AA", "#FB8C00", "#00ACC1"];
      for (let k = 0, px = x + 3 * s; px < x + w; k++, px += 7 * s) {
        const hop = Math.max(0, Math.sin(t * 5 + k)) * s * 0.8;
        ellipse(ctx, px, y + 3 * s, 3 * s, 2.4 * s, shirts[k % shirts.length]);
        circle(ctx, px, y - hop, 2 * s, cols[k % cols.length]);
      }
      break;
    }
    case "seaweed": {
      ctx.strokeStyle = "#2E9E5B";
      ctx.lineWidth = Math.max(2, s * 1.1);
      for (let k = -1; k <= 1; k++) {
        ctx.beginPath();
        ctx.moveTo(x + k * 2 * s, y + 3 * s);
        for (let j = 1; j <= 4; j++) ctx.lineTo(x + k * 2 * s + Math.sin(t * 2 + j + k) * 1.4 * s, y + 3 * s - j * 2.6 * s);
        ctx.stroke();
      }
      break;
    }
    case "fish": {
      const lit = frame.led !== "off" && frame.sensors.obstacle;
      ctx.globalAlpha = lit ? 1 : 0.3;
      const sway = Math.sin(t * 3 + d.y) * 2 * s;
      ctx.translate(x + sway, y);
      ctx.fillStyle = lit ? "#FF8A00" : "#9AA4B2";
      ctx.beginPath();
      ctx.ellipse(0, 0, 3.2 * s, 2 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(2.6 * s, 0);
      ctx.lineTo(5 * s, -1.8 * s);
      ctx.lineTo(5 * s, 1.8 * s);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(-0.6 * s, -1.9 * s, 0.8 * s, 3.8 * s);
      circle(ctx, -1.8 * s, -0.4 * s, 0.45 * s, "#010F2A");
      break;
    }
    case "chest":
      shadow(4 * s, 3 * s);
      ctx.fillStyle = "#8D5A2B";
      roundRect(ctx, x - 4 * s, y - 2.5 * s, 8 * s, 5 * s, s * 0.8);
      ctx.fill();
      ctx.fillStyle = "#F0D030";
      ctx.fillRect(x - 4 * s, y - 0.4 * s, 8 * s, s * 0.8);
      circle(ctx, x, y + 0.6 * s, s * 0.7, "#F0D030");
      break;
    case "snowman":
      shadow(3.5 * s, 3 * s);
      circle(ctx, x, y + 1.5 * s, 3.4 * s, "#FFFFFF");
      circle(ctx, x, y - 2.6 * s, 2.3 * s, "#FFFFFF");
      ctx.strokeStyle = "#B0C4DE";
      ctx.lineWidth = Math.max(1, s * 0.3);
      ctx.beginPath();
      ctx.arc(x, y + 1.5 * s, 3.4 * s, 0, Math.PI * 2);
      ctx.arc(x, y - 2.6 * s, 2.3 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#FB8C00";
      ctx.beginPath();
      ctx.moveTo(x + 1.6 * s, y - 2.8 * s);
      ctx.lineTo(x + 4 * s, y - 2.4 * s);
      ctx.lineTo(x + 1.6 * s, y - 2 * s);
      ctx.fill();
      ctx.fillStyle = "#C62828";
      ctx.fillRect(x - 2.4 * s, y - 0.8 * s, 4.8 * s, 1 * s);
      break;
    case "penguin":
      shadow(2 * s, 1.6 * s);
      ellipse(ctx, x, y, 2 * s, 2.6 * s, "#1C2833");
      ellipse(ctx, x, y + 0.4 * s, 1.3 * s, 1.9 * s, "#FFFFFF");
      ctx.fillStyle = "#FB8C00";
      ctx.beginPath();
      ctx.moveTo(x - 0.5 * s, y - 1.6 * s);
      ctx.lineTo(x + 0.5 * s, y - 1.6 * s);
      ctx.lineTo(x, y - 0.8 * s);
      ctx.fill();
      break;
    case "easel":
      shadow(5 * s, 6 * s);
      ctx.strokeStyle = "#6D4C41";
      ctx.lineWidth = Math.max(1.5, s * 0.8);
      ctx.beginPath();
      ctx.moveTo(x - 4 * s, y + 7 * s);
      ctx.lineTo(x, y - 6 * s);
      ctx.lineTo(x + 4 * s, y + 7 * s);
      ctx.stroke();
      ctx.fillStyle = "#FFFFFF";
      roundRect(ctx, x - 5 * s, y - 5 * s, 10 * s, 8 * s, s * 0.4);
      ctx.fill();
      ctx.strokeStyle = "#B0BEC5";
      ctx.stroke();
      circle(ctx, x - 1.5 * s, y - 1.5 * s, 1.8 * s, "#FFB300");
      ellipse(ctx, x + 1.5 * s, y + 1 * s, 2.4 * s, 1 * s, "#43A047");
      break;
    case "paint":
      shadow(2.2 * s, 2 * s);
      circle(ctx, x, y, 2.2 * s, "#ECEFF1");
      circle(ctx, x, y, 1.6 * s, d.colour ?? "#E53935");
      ctx.strokeStyle = "#90A4AE";
      ctx.lineWidth = Math.max(1, s * 0.3);
      ctx.beginPath();
      ctx.arc(x, y, 2.2 * s, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case "discoball": {
      for (let k = 0; k < 8; k++) {
        const a = t * 1.5 + (k * Math.PI) / 4;
        ctx.strokeStyle = `hsla(${(k * 45 + t * 60) % 360},100%,70%,0.35)`;
        ctx.lineWidth = Math.max(2, s * 1.2);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * 60 * s, y + Math.sin(a) * 60 * s);
        ctx.stroke();
      }
      circle(ctx, x, y, 4 * s, "#CFD8DC");
      ctx.fillStyle = "#ECEFF1";
      for (let k = -3; k <= 3; k += 1.5) for (let j = -3; j <= 3; j += 1.5) if (k * k + j * j < 10) ctx.fillRect(x + k * s, y + j * s, s * 0.9, s * 0.9);
      break;
    }
    case "duck": {
      const bob = Math.sin(t * 2 + d.x) * s * 0.5;
      ellipse(ctx, x, y + bob, 2.4 * s, 1.6 * s, "#FFFFFF");
      circle(ctx, x + 1.8 * s, y - 1 * s + bob, 1.1 * s, "#2E7D32");
      ctx.fillStyle = "#FFA000";
      ctx.fillRect(x + 2.6 * s, y - 1.1 * s + bob, s, s * 0.5);
      break;
    }
    case "bench":
      shadow(6 * s, 2 * s);
      ctx.fillStyle = "#8D6E63";
      for (const k of [-1.2, 0, 1.2]) ctx.fillRect(x - 6 * s, y + k * s - s * 0.4, 12 * s, s * 0.8);
      break;
    case "lamp": {
      shadow(1.2 * s, 1 * s);
      const g = ctx.createRadialGradient(x, y, 0, x, y, 8 * s);
      g.addColorStop(0, "rgba(255,236,150,0.55)");
      g.addColorStop(1, "rgba(255,236,150,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, 8 * s, 0, Math.PI * 2);
      ctx.fill();
      circle(ctx, x, y, 1.3 * s, "#FFE082");
      ctx.strokeStyle = "#455A64";
      ctx.lineWidth = Math.max(1, s * 0.3);
      ctx.beginPath();
      ctx.arc(x, y, 1.3 * s, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case "building": {
      const bw = (d.w ?? 20) * s;
      const bh = (d.h ?? 20) * s;
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      roundRect(ctx, x + s, y + s * 1.2, bw, bh, s);
      ctx.fill();
      ctx.fillStyle = d.colour ?? "#78909C";
      roundRect(ctx, x, y, bw, bh, s);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      roundRect(ctx, x + s, y + s, bw - 2 * s, bh - 2 * s, s * 0.6);
      ctx.fill();
      ctx.fillStyle = "rgba(1,15,42,0.35)";
      for (let wy = y + 3 * s; wy < y + bh - 3 * s; wy += 5 * s) for (let wx = x + 3 * s; wx < x + bw - 3 * s; wx += 5 * s) ctx.fillRect(wx, wy, 2.4 * s, 2.4 * s);
      break;
    }
    case "hydrant":
      shadow(1.6 * s, 1.4 * s);
      circle(ctx, x, y, 1.6 * s, "#E53935");
      circle(ctx, x, y, 0.8 * s, "#FFCDD2");
      break;
    case "rocket": {
      // the pad stays; the rocket climbs once launched
      circle(ctx, x, y, 10 * s, "#9EA6B0");
      circle(ctx, x, y, 8.5 * s, "#B9C0C8");
      ctx.strokeStyle = "#F0D030";
      ctx.lineWidth = Math.max(1.5, s * 0.7);
      ctx.beginPath();
      ctx.arc(x, y, 9.2 * s, 0, Math.PI * 2);
      ctx.stroke();
      const since = frame.launchAt >= 0 ? frame.t - frame.launchAt : -1;
      if (since >= 0) {
        for (let k = 0; k < 7; k++) {
          const a = (k / 7) * Math.PI * 2;
          const rr = (6 + since * 6) * s;
          circle(ctx, x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.6, (3 + since * 1.5) * s, `rgba(236,239,241,${Math.max(0, 0.8 - since * 0.15)})`);
        }
      }
      const lift = since > 0 ? since * since * 18 * s : 0;
      ctx.translate(x, y - lift);
      const scale = since > 0 ? Math.max(0.35, 1 - since * 0.12) : 1;
      ctx.scale(scale, scale);
      if (since >= 0) {
        const fl = (5 + Math.sin(t * 40) * 1.2) * s;
        ellipse(ctx, 0, 7 * s + fl * 0.5, 2.2 * s, fl, "#FF7043");
        ellipse(ctx, 0, 7 * s + fl * 0.3, 1.2 * s, fl * 0.6, "#FFE082");
      }
      ctx.fillStyle = "#ECEFF1";
      ctx.beginPath();
      ctx.moveTo(0, -11 * s);
      ctx.bezierCurveTo(4 * s, -6 * s, 3.4 * s, 4 * s, 3 * s, 7 * s);
      ctx.lineTo(-3 * s, 7 * s);
      ctx.bezierCurveTo(-3.4 * s, 4 * s, -4 * s, -6 * s, 0, -11 * s);
      ctx.fill();
      ctx.strokeStyle = "#546E7A";
      ctx.lineWidth = Math.max(1, s * 0.4);
      ctx.stroke();
      ctx.fillStyle = "#E53935";
      for (const k of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(k * 3 * s, 3 * s);
        ctx.lineTo(k * 6 * s, 8 * s);
        ctx.lineTo(k * 3 * s, 7 * s);
        ctx.fill();
      }
      circle(ctx, 0, -3 * s, 1.6 * s, "#4FC3F7");
      break;
    }
    case "palm":
      shadow(4 * s, 3 * s, 1.5, 1.5);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2 + 0.3;
        ellipse(ctx, x + Math.cos(a) * 3.4 * s, y + Math.sin(a) * 3.4 * s, 4 * s, 1.4 * s, k % 2 ? "#2E7D32" : "#43A047", a);
      }
      circle(ctx, x, y, 1.4 * s, "#795548");
      break;
    case "umbrella": {
      shadow(7 * s, 6 * s, 2, 2);
      for (let k = 0; k < 8; k++) {
        ctx.fillStyle = k % 2 ? "#FFFFFF" : "#E53935";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, 7 * s, (k * Math.PI) / 4, ((k + 1) * Math.PI) / 4);
        ctx.fill();
      }
      circle(ctx, x, y, 0.8 * s, "#5D4037");
      break;
    }
    case "friend": {
      ctx.translate(x, y);
      ctx.scale(1.7, 1.7);
      ctx.translate(-x, -y);
      ellipse(ctx, x + 1 * s, y + 1 * s, 4 * s, 3.4 * s, "rgba(0,0,0,0.15)");
      ellipse(ctx, x + 1.5 * s, y, 3.2 * s, 2.8 * s, "#26A69A");
      circle(ctx, x + 4.5 * s, y, 2 * s, "#C68642");
      ctx.strokeStyle = "#3E2723";
      ctx.lineWidth = Math.max(1, s * 0.5);
      ctx.beginPath();
      ctx.arc(x + 4.8 * s, y, 2 * s, -1.3, 1.3);
      ctx.stroke();
      ctx.strokeStyle = "#C68642";
      ctx.lineWidth = Math.max(1.2, s * 0.8);
      ctx.beginPath();
      ctx.moveTo(x + 0.5 * s, y - 2.2 * s);
      ctx.lineTo(x - 2.2 * s, y - 2 * s);
      ctx.moveTo(x + 0.5 * s, y + 2.2 * s);
      ctx.lineTo(x - 2.2 * s, y + 2 * s);
      ctx.stroke();
      break;
    }
    case "crater":
      ellipse(ctx, x, y, r, r * 0.8, "#A54A27");
      ellipse(ctx, x + r * 0.15, y + r * 0.12, r * 0.75, r * 0.58, "#93401F");
      ctx.strokeStyle = "#D47A4E";
      ctx.lineWidth = Math.max(1, s * 0.5);
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.8, 0, Math.PI * 0.9, Math.PI * 1.9);
      ctx.stroke();
      break;
    case "crystal": {
      const c = d.colour ?? "#26C6DA";
      for (const [dx, hgt, a] of [
        [-1.6, 5, -0.4],
        [0, 7, 0],
        [1.8, 4.5, 0.45],
      ]) {
        ctx.save();
        ctx.translate(x + dx * s, y + 2 * s);
        ctx.rotate(a);
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.moveTo(0, -hgt * s);
        ctx.lineTo(1.3 * s, -hgt * 0.6 * s);
        ctx.lineTo(1 * s, 0);
        ctx.lineTo(-1 * s, 0);
        ctx.lineTo(-1.3 * s, -hgt * 0.6 * s);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.fillRect(-0.3 * s, -hgt * 0.8 * s, 0.5 * s, hgt * 0.6 * s);
        ctx.restore();
      }
      break;
    }
    case "painting": {
      ctx.fillStyle = "#C9A227";
      roundRect(ctx, x, y, 12 * s, 7 * s, s * 0.5);
      ctx.fill();
      ctx.fillStyle = "#FFF8E1";
      ctx.fillRect(x + s, y + s, 10 * s, 5 * s);
      circle(ctx, x + 4 * s, y + 3.4 * s, 1.8 * s, d.colour ?? "#1E88E5");
      ellipse(ctx, x + 8 * s, y + 4.4 * s, 2 * s, 1 * s, "#43A047");
      break;
    }
    case "statue":
      shadow(3.4 * s, 3 * s);
      ctx.fillStyle = "#B0A99F";
      roundRect(ctx, x - 3.4 * s, y - 3.4 * s, 6.8 * s, 6.8 * s, s);
      ctx.fill();
      circle(ctx, x, y, 2.4 * s, "#ECEAE6");
      circle(ctx, x - 0.6 * s, y - 0.6 * s, 1 * s, "#FFFFFF");
      break;
    case "ship": {
      ctx.translate(x, y);
      ctx.rotate(Math.sin(t * 1.5) * 0.04);
      ctx.fillStyle = "#6D4C41";
      ctx.beginPath();
      ctx.moveTo(-10 * s, -3 * s);
      ctx.lineTo(8 * s, -3 * s);
      ctx.lineTo(12 * s, 0);
      ctx.lineTo(8 * s, 3 * s);
      ctx.lineTo(-10 * s, 3 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#F5F5F5";
      ctx.beginPath();
      ctx.moveTo(-2 * s, -9 * s);
      ctx.lineTo(4 * s, -1 * s);
      ctx.lineTo(-2 * s, -1 * s);
      ctx.fill();
      ctx.fillStyle = "#1C1C1C";
      ctx.fillRect(-2.4 * s, -10 * s, 0.8 * s, 9 * s);
      ctx.fillRect(-2 * s, -10.5 * s, 3 * s, 1.6 * s);
      break;
    }
    case "barrel":
      shadow(2.6 * s, 2.4 * s);
      circle(ctx, x, y, 2.6 * s, "#8D5A2B");
      ctx.strokeStyle = "#4E342E";
      ctx.lineWidth = Math.max(1, s * 0.4);
      ctx.beginPath();
      ctx.arc(x, y, 1.8 * s, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case "conveyor": {
      const ch = (d.h ?? 80) * s;
      ctx.fillStyle = "#37474F";
      roundRect(ctx, x - 5 * s, y, 10 * s, ch, 2 * s);
      ctx.fill();
      ctx.fillStyle = "#263238";
      const shift = ((t * 4) % 4) * s;
      for (let k = y + shift; k < y + ch - s; k += 4 * s) ctx.fillRect(x - 4.4 * s, k, 8.8 * s, 1.4 * s);
      ctx.strokeStyle = "#90A4AE";
      ctx.lineWidth = Math.max(1, s * 0.4);
      roundRect(ctx, x - 5 * s, y, 10 * s, ch, 2 * s);
      ctx.stroke();
      break;
    }
    case "window": {
      const ww = (d.w ?? 30) * s;
      ctx.fillStyle = "#050A1A";
      roundRect(ctx, x, y, ww, 9 * s, 4 * s);
      ctx.fill();
      ctx.strokeStyle = "#90A4AE";
      ctx.lineWidth = Math.max(1.5, s * 0.6);
      ctx.stroke();
      ctx.save();
      roundRect(ctx, x, y, ww, 9 * s, 4 * s);
      ctx.clip();
      circle(ctx, x + ww * 0.7, y + 14 * s, 12 * s, "#2E7DD7");
      ellipse(ctx, x + ww * 0.62, y + 6 * s, 5 * s, 2 * s, "#43A047", 0.3);
      ellipse(ctx, x + ww * 0.8, y + 4.6 * s, 3 * s, 1.2 * s, "rgba(255,255,255,0.8)");
      for (let k = 0; k < 10; k++) circle(ctx, x + ((k * 37) % 100) / 100 * ww, y + ((k * 53) % 70) / 100 * 9 * s, s * 0.25, "#FFFFFF");
      ctx.restore();
      break;
    }
    case "console": {
      ctx.fillStyle = "#37474F";
      roundRect(ctx, x, y, 10 * s, 6 * s, s);
      ctx.fill();
      for (let k = 0; k < 4; k++) circle(ctx, x + (2 + k * 2) * s, y + 2 * s, 0.6 * s, Math.sin(t * 4 + k * 2) > 0 ? ["#66BB6A", "#FFCA28", "#EF5350", "#29B6F6"][k] : "#263238");
      ctx.fillStyle = "#29B6F6";
      ctx.fillRect(x + 1.5 * s, y + 3.6 * s, 7 * s, 1.2 * s);
      break;
    }
    case "lava": {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 1.6);
      g.addColorStop(0, "rgba(255,200,60,0.9)");
      g.addColorStop(0.5, "rgba(255,90,20,0.8)");
      g.addColorStop(1, "rgba(255,60,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r * 1.6, 0, Math.PI * 2);
      ctx.fill();
      for (let k = 0; k < 3; k++) {
        const rise = (t * 0.6 + k / 3) % 1;
        circle(ctx, x + (k - 1) * r * 0.5, y - rise * r * 2, r * 0.25 * (1 - rise), `rgba(200,200,200,${0.5 * (1 - rise)})`);
      }
      break;
    }
    case "turbine": {
      ctx.fillStyle = "#ECEFF1";
      circle(ctx, x, y, 1.4 * s, "#ECEFF1");
      ctx.translate(x, y);
      ctx.rotate(t * 2);
      for (let k = 0; k < 3; k++) {
        ctx.rotate((Math.PI * 2) / 3);
        ellipse(ctx, 0, -5 * s, 1 * s, 5 * s, "#FFFFFF");
        ctx.strokeStyle = "#B0BEC5";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      break;
    }
    case "station": {
      ctx.fillStyle = "#795548";
      roundRect(ctx, x - 9 * s, y - 4 * s, 18 * s, 8 * s, s);
      ctx.fill();
      ctx.fillStyle = "#C62828";
      ctx.fillRect(x - 10 * s, y - 5 * s, 20 * s, 2 * s);
      ctx.fillStyle = "#FFF3E0";
      for (const k of [-6, -1, 4]) ctx.fillRect(x + k * s, y - 1 * s, 3 * s, 3 * s);
      break;
    }
    case "rooster": {
      shadow(3 * s, 2.4 * s);
      ellipse(ctx, x, y, 3.2 * s, 2.4 * s, "#FFF3E0");
      for (const [dx, c] of [[-3.4, "#2E7D32"], [-3.8, "#1565C0"], [-3.2, "#E65100"]] as const) ellipse(ctx, x + dx * s, y - 1.2 * s, 1.6 * s, 0.6 * s, c, -0.8);
      circle(ctx, x + 2.8 * s, y - 1.6 * s, 1.6 * s, "#FFF3E0");
      for (const dx of [2.2, 2.9, 3.6]) circle(ctx, x + dx * s, y - 3.1 * s, 0.6 * s, "#E53935");
      ctx.fillStyle = "#FFA000";
      ctx.beginPath();
      ctx.moveTo(x + 4.2 * s, y - 1.8 * s);
      ctx.lineTo(x + 5.5 * s, y - 1.4 * s);
      ctx.lineTo(x + 4.2 * s, y - 1 * s);
      ctx.fill();
      circle(ctx, x + 3.2 * s, y - 1.9 * s, 0.3 * s, "#010F2A");
      break;
    }
    case "pig":
      shadow(3.4 * s, 2.6 * s);
      ellipse(ctx, x, y, 3.6 * s, 2.6 * s, "#F8BBD0");
      circle(ctx, x + 3.2 * s, y, 1.8 * s, "#F8BBD0");
      ellipse(ctx, x + 4.6 * s, y, 0.8 * s, 0.9 * s, "#F48FB1");
      ellipse(ctx, x + 2.6 * s, y - 1.6 * s, 0.7 * s, 0.5 * s, "#F06292", 0.4);
      circle(ctx, x + 3.4 * s, y - 0.7 * s, 0.25 * s, "#010F2A");
      ctx.strokeStyle = "#F48FB1";
      ctx.lineWidth = Math.max(1, s * 0.4);
      ctx.beginPath();
      ctx.arc(x - 3.8 * s, y, 0.8 * s, 0, Math.PI * 1.5);
      ctx.stroke();
      break;
    case "trough":
      shadow(7 * s, 2.4 * s);
      ctx.fillStyle = "#8D6E63";
      roundRect(ctx, x - 7 * s, y - 2 * s, 14 * s, 4 * s, s);
      ctx.fill();
      ctx.fillStyle = "#FFCC80";
      roundRect(ctx, x - 6 * s, y - 1.2 * s, 12 * s, 2.4 * s, s * 0.6);
      ctx.fill();
      break;
    case "tractor":
      shadow(7 * s, 5 * s);
      ctx.fillStyle = "#43A047";
      roundRect(ctx, x - 5 * s, y - 3.5 * s, 10 * s, 7 * s, s);
      ctx.fill();
      ctx.fillStyle = "#C8E6C9";
      ctx.fillRect(x - 3 * s, y - 2.5 * s, 3.5 * s, 5 * s);
      for (const [dx, dy, r] of [[-4, -4, 1.8], [-4, 4, 1.8], [4, -3.6, 1.2], [4, 3.6, 1.2]] as const) circle(ctx, x + dx * s, y + dy * s, r * s, "#212121");
      break;
    case "balloon": {
      const bob = Math.sin(t * 2 + d.x) * s * 0.6;
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y + 3 * s + bob);
      ctx.lineTo(x + s, y + 7 * s);
      ctx.stroke();
      ellipse(ctx, x, y + bob, 2.4 * s, 3 * s, d.colour ?? "#EC407A");
      ellipse(ctx, x - 0.8 * s, y - 1 * s + bob, 0.6 * s, 0.9 * s, "rgba(255,255,255,0.6)");
      break;
    }
    case "mirror": {
      const mw = (d.w ?? 30) * s;
      ctx.fillStyle = "#B0BEC5";
      roundRect(ctx, x, y, mw, 6 * s, s);
      ctx.fill();
      ctx.fillStyle = "#E3F2FD";
      roundRect(ctx, x + s, y + s, mw - 2 * s, 4 * s, s * 0.6);
      ctx.fill();
      for (let k = x + 2 * s; k < x + mw; k += 4 * s) circle(ctx, k, y, 0.9 * s, Math.sin(t * 4 + k) > -0.2 ? "#FFF59D" : "#FBC02D");
      break;
    }
    case "desk":
      shadow(6 * s, 4 * s);
      ctx.fillStyle = "#BCAAA4";
      roundRect(ctx, x - 6 * s, y - 4 * s, 12 * s, 8 * s, s);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(x - 3 * s, y - 2 * s, 5 * s, 3.5 * s);
      ctx.fillStyle = "#FFB300";
      ctx.fillRect(x + 3 * s, y - 2.5 * s, 0.8 * s, 4 * s);
      break;
    case "kitten":
      ellipse(ctx, x, y, 2.4 * s, 1.8 * s, "#FFB74D");
      circle(ctx, x + 2 * s, y - 0.4 * s, 1.4 * s, "#FFB74D");
      for (const k of [-0.6, 0.6]) {
        ctx.fillStyle = "#FFB74D";
        ctx.beginPath();
        ctx.moveTo(x + 2 * s + k * s, y - 1.4 * s);
        ctx.lineTo(x + 2 * s + k * 1.6 * s, y - 2.8 * s);
        ctx.lineTo(x + 2 * s + k * 0.2 * s, y - 1.8 * s);
        ctx.fill();
      }
      circle(ctx, x + 2.5 * s, y - 0.6 * s, 0.25 * s, "#010F2A");
      break;
    case "sun": {
      const r2 = (d.r ?? 5) * s;
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2 + t * 0.3;
        ctx.strokeStyle = "#FFB300";
        ctx.lineWidth = Math.max(1.5, s * 0.6);
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * r2 * 1.2, y + Math.sin(a) * r2 * 1.2);
        ctx.lineTo(x + Math.cos(a) * r2 * 1.6, y + Math.sin(a) * r2 * 1.6);
        ctx.stroke();
      }
      circle(ctx, x, y, r2, "#FFD54F");
      break;
    }
    case "moon":
      circle(ctx, x, y, r, "#FFF8E1");
      circle(ctx, x + r * 0.45, y - r * 0.2, r * 0.85, (SPEC.nightrail?.base ?? "#263238"));
      break;
    case "cloud": {
      const drift = Math.sin(t * 0.4 + d.x) * 2 * s;
      for (const [dx, dy, rr] of [[-3, 0, 3], [0, -1.5, 3.6], [3.2, 0, 3], [0, 1.2, 3]] as const) circle(ctx, x + dx * s + drift, y + dy * s, rr * s, "rgba(255,255,255,0.92)");
      break;
    }
    case "dino": {
      shadow(8 * s, 4 * s);
      ctx.strokeStyle = "#F5F0E6";
      ctx.lineWidth = Math.max(1.5, s * 0.7);
      ctx.beginPath();
      ctx.moveTo(x - 10 * s, y + 1 * s);
      ctx.quadraticCurveTo(x - 4 * s, y - 3 * s, x + 2 * s, y - 2 * s);
      ctx.quadraticCurveTo(x + 6 * s, y - 2 * s, x + 7 * s, y - 6 * s);
      ctx.stroke();
      for (let k = -6; k <= 2; k += 2) {
        ctx.beginPath();
        ctx.moveTo(x + k * s, y - 2 * s);
        ctx.lineTo(x + k * s, y + 2.5 * s);
        ctx.stroke();
      }
      circle(ctx, x + 7.5 * s, y - 6.5 * s, 1.6 * s, "#F5F0E6");
      break;
    }
    case "lighthouse":
      shadow(4 * s, 4 * s);
      circle(ctx, x, y, 4 * s, "#FFFFFF");
      ctx.strokeStyle = "#E53935";
      ctx.lineWidth = Math.max(1.5, s * 1.2);
      ctx.beginPath();
      ctx.arc(x, y, 2.8 * s, 0, Math.PI * 2);
      ctx.stroke();
      circle(ctx, x, y, 1.4 * s, "#FFE082");
      ctx.fillStyle = "rgba(255,236,150,0.35)";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, 30 * s, t * 0.8, t * 0.8 + 0.35);
      ctx.fill();
      break;
    case "cactus":
      shadow(2.4 * s, 2 * s);
      circle(ctx, x, y, 2.2 * s, "#558B2F");
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        circle(ctx, x + Math.cos(a) * 2.4 * s, y + Math.sin(a) * 2.4 * s, 0.3 * s, "#F1F8E9");
      }
      circle(ctx, x, y, 0.8 * s, "#EC407A");
      break;
    case "flower":
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        circle(ctx, x + Math.cos(a) * 1.4 * s, y + Math.sin(a) * 1.4 * s, 1.1 * s, d.colour ?? "#EC407A");
      }
      circle(ctx, x, y, 0.8 * s, "#FDD835");
      break;
    case "plant":
      for (let k = 0; k < 5; k++) ellipse(ctx, x, y, 3 * s, 1 * s, "#43A047", (k / 5) * Math.PI);
      break;
    case "chalk":
      ctx.fillStyle = d.colour ?? "#F48FB1";
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(0.5);
      roundRect(ctx, -2.5 * s, -0.6 * s, 5 * s, 1.2 * s, 0.6 * s);
      ctx.fill();
      ctx.restore();
      break;
    case "cone":
      shadow(2 * s, 2 * s);
      circle(ctx, x, y, 2.2 * s, "#FB8C00");
      circle(ctx, x, y, 1.3 * s, "#FFFFFF");
      circle(ctx, x, y, 0.7 * s, "#FB8C00");
      break;
    case "shell":
      ctx.fillStyle = d.colour ?? "#FFCCBC";
      ctx.beginPath();
      ctx.moveTo(x, y + 1.6 * s);
      ctx.arc(x, y + 1.6 * s, 2.6 * s, Math.PI * 1.1, Math.PI * 1.9);
      ctx.fill();
      break;
    case "starfish":
      ctx.fillStyle = d.colour ?? "#FF7043";
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rr = (i % 2 ? 0.9 : 2.6) * s;
        ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
      ctx.fill();
      break;
    case "dish": {
      shadow(4 * s, 4 * s);
      circle(ctx, x, y, 4 * s, "#ECEFF1");
      circle(ctx, x, y, 3 * s, "#CFD8DC");
      ctx.strokeStyle = "#607D8B";
      ctx.lineWidth = Math.max(1, s * 0.4);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(t * 0.5) * 4 * s, y + Math.sin(t * 0.5) * 4 * s);
      ctx.stroke();
      break;
    }
    case "mountain":
      break;
  }
  ctx.restore();
}

// ---------------------------------------------------------------- walls, doors, collectibles

function drawWall(ctx: C, wall: Rect, style: Scene["wall"], s: number, t: number) {
  const x = wall.x * s;
  const y = wall.y * s;
  const w = wall.w * s;
  const h = wall.h * s;
  ctx.save();
  if (style !== "pond") {
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    roundRect(ctx, x + s, y + s * 1.2, w, h, s);
    ctx.fill();
  }
  switch (style) {
    case "coral": {
      ctx.fillStyle = "#C2477A";
      roundRect(ctx, x, y, w, h, 3 * s);
      ctx.fill();
      const cols = ["#FF7043", "#F06292", "#FFCA28", "#BA68C8", "#4DB6AC"];
      const r = seeded(11);
      for (let k = 0; k < (w * h) / (s * s * 9); k++) circle(ctx, x + r() * w, y + r() * h, (1 + r() * 2.2) * s, cols[k % cols.length]);
      break;
    }
    case "pond": {
      ctx.fillStyle = "#7CB342";
      roundRect(ctx, x - 1.5 * s, y - 1.5 * s, w + 3 * s, h + 3 * s, 12 * s);
      ctx.fill();
      ctx.fillStyle = "#3D9BE0";
      roundRect(ctx, x, y, w, h, 11 * s);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = Math.max(1, s * 0.4);
      for (let k = 0; k < 3; k++) {
        const rr = ((t * 4 + k * 4) % 12) * s;
        ctx.beginPath();
        ctx.ellipse(x + w * 0.3, y + h * 0.65, rr, rr * 0.6, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ellipse(ctx, x + w * 0.75, y + h * 0.25, 3 * s, 2.4 * s, "#43A047");
      break;
    }
    case "building": {
      ctx.fillStyle = "#8D6E63";
      roundRect(ctx, x, y, w, h, s);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      roundRect(ctx, x + s, y + s, w - 2 * s, h - 2 * s, s * 0.6);
      ctx.fill();
      ctx.fillStyle = "rgba(1,15,42,0.4)";
      for (let wy = y + 3 * s; wy < y + h - 3 * s; wy += 5 * s) for (let wx = x + 3 * s; wx < x + w - 3 * s; wx += 5 * s) ctx.fillRect(wx, wy, 2.4 * s, 2.4 * s);
      break;
    }
    case "canyon": {
      for (let k = 0; k < 6; k++) {
        ctx.fillStyle = ["#7A2E14", "#8E3A1A", "#A04722", "#8E3A1A", "#7A2E14", "#6A2610"][k];
        ctx.fillRect(x + (k * w) / 6, y, w / 6 + 1, h);
      }
      ctx.strokeStyle = "rgba(255,190,150,0.45)";
      ctx.lineWidth = Math.max(1, s * 0.4);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + h);
      ctx.stroke();
      break;
    }
    case "rockface": {
      ctx.fillStyle = "#2A211C";
      roundRect(ctx, x, y, w, h, 2 * s);
      ctx.fill();
      ctx.strokeStyle = "#A1887F";
      ctx.lineWidth = Math.max(1.5, s * 0.6);
      ctx.stroke();
      const r = seeded(5);
      for (let k = 0; k < (w * h) / (s * s * 14); k++) ellipse(ctx, x + r() * w, y + r() * h, (1.5 + r() * 2) * s, (1 + r()) * s, "#55463B", r() * 3);
      break;
    }
    case "gallery": {
      ctx.fillStyle = "#F3E9D2";
      roundRect(ctx, x, y, w, h, s);
      ctx.fill();
      ctx.strokeStyle = "#C9A227";
      ctx.lineWidth = Math.max(2, s * 0.9);
      ctx.stroke();
      const art = ["#1E88E5", "#E53935", "#43A047", "#8E24AA", "#FB8C00", "#00897B"];
      let k = 0;
      for (let px = x + 6 * s; px + 12 * s < x + w; px += 20 * s, k++) {
        ctx.fillStyle = "#C9A227";
        roundRect(ctx, px, y + h - 9 * s, 12 * s, 7 * s, s * 0.5);
        ctx.fill();
        ctx.fillStyle = "#FFF8E1";
        ctx.fillRect(px + s, y + h - 8 * s, 10 * s, 5 * s);
        circle(ctx, px + 4 * s, y + h - 5.6 * s, 1.8 * s, art[k % art.length]);
        ellipse(ctx, px + 8 * s, y + h - 4.6 * s, 2 * s, 1 * s, "#43A047");
      }
      ctx.fillStyle = "rgba(160,140,100,0.25)";
      ctx.font = `800 ${Math.max(10, 4 * s)}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (w > 70 && h > 30) ctx.fillText("CODEship Museum", x + w / 2, y + h / 2 - 4 * s);
      ctx.textAlign = "left";
      break;
    }
    case "door": {
      ctx.fillStyle = "#6D4C41";
      roundRect(ctx, x, y, w, h, s);
      ctx.fill();
      ctx.strokeStyle = "#4E342E";
      ctx.lineWidth = Math.max(1, s * 0.4);
      ctx.strokeRect(x + s, y + s, w - 2 * s, h / 2 - 1.5 * s);
      ctx.strokeRect(x + s, y + h / 2 + 0.5 * s, w - 2 * s, h / 2 - 1.5 * s);
      circle(ctx, x + 2.2 * s, y + h / 2, s * 0.8, "#F0D030");
      ctx.fillStyle = "#2E7D32";
      ctx.fillRect(x - 2.5 * s, y - 0.5 * s, 2 * s, 3 * s);
      break;
    }
    default: {
      ctx.fillStyle = "#B5563A";
      roundRect(ctx, x, y, w, h, s * 0.6);
      ctx.fill();
      ctx.clip();
      ctx.strokeStyle = "rgba(255,230,210,0.55)";
      ctx.lineWidth = Math.max(1, s * 0.25);
      const bh = 2.5 * s;
      for (let row = 0; row * bh < h; row++) {
        ctx.beginPath();
        ctx.moveTo(x, y + row * bh);
        ctx.lineTo(x + w, y + row * bh);
        ctx.stroke();
        for (let bx = (row % 2) * 2.5 * s; bx < w; bx += 5 * s) {
          ctx.beginPath();
          ctx.moveTo(x + bx, y + row * bh);
          ctx.lineTo(x + bx, y + (row + 1) * bh);
          ctx.stroke();
        }
      }
    }
  }
  ctx.restore();
}

function drawDoor(ctx: C, d: Rect, open: boolean, s: number) {
  const x = d.x * s;
  const y = d.y * s;
  const w = d.w * s;
  const h = d.h * s;
  ctx.save();
  if (open) {
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#5D4037";
    ctx.fillRect(x, y, w * 0.35, h);
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(x + s, y + s, w, h);
    ctx.fillStyle = "#4E4A47";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#8D8984";
    ctx.lineWidth = Math.max(1.5, s * 0.6);
    for (let k = y + 3 * s; k < y + h; k += 4 * s) {
      ctx.beginPath();
      ctx.moveTo(x, k);
      ctx.lineTo(x + w, k);
      ctx.stroke();
    }
    circle(ctx, x + w / 2, y + h / 2, 2.4 * s, "#F0D030");
    ctx.fillStyle = "#4E4A47";
    roundRect(ctx, x + w / 2 - 0.6 * s, y + h / 2 - 0.4 * s, 1.2 * s, 1.8 * s, 0.3 * s);
    ctx.fill();
  }
  ctx.restore();
}

function drawCollectible(ctx: C, c: Collectible, done: boolean, s: number, t: number) {
  const x = c.x * s;
  const y = c.y * s;
  ctx.save();
  switch (c.kind) {
    case "egg":
      if (done) break;
      ellipse(ctx, x + 0.5 * s, y + 0.8 * s, 2 * s, 1.4 * s, "rgba(0,0,0,0.15)");
      ellipse(ctx, x, y, 1.9 * s, 2.5 * s, "#FFF8EC");
      ctx.strokeStyle = "#D7C4A8";
      ctx.lineWidth = Math.max(1, s * 0.3);
      ctx.beginPath();
      ctx.ellipse(x, y, 1.9 * s, 2.5 * s, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case "pearl":
      if (done) break;
      circle(ctx, x, y, 2 * s, "#F5F5F5");
      circle(ctx, x - 0.6 * s, y - 0.6 * s, 0.7 * s, "#FFFFFF");
      ctx.strokeStyle = "rgba(180,190,210,0.9)";
      ctx.lineWidth = Math.max(1, s * 0.3);
      ctx.beginPath();
      ctx.arc(x, y, 2 * s, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case "ball":
      if (done) break;
      circle(ctx, x, y, 2.4 * s, "#E53935");
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = Math.max(1, s * 0.5);
      ctx.beginPath();
      ctx.arc(x, y, 2.4 * s, -0.5, 0.9);
      ctx.stroke();
      circle(ctx, x - 0.8 * s, y - 0.8 * s, 0.6 * s, "rgba(255,255,255,0.6)");
      break;
    case "mitten":
      if (done) break;
      ellipse(ctx, x, y, 2.2 * s, 2.8 * s, "#E53935");
      ellipse(ctx, x + 2 * s, y - 0.6 * s, 0.9 * s, 1.4 * s, "#E53935", 0.4);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(x - 2.2 * s, y + 1.8 * s, 4.4 * s, 1 * s);
      break;
    case "gem":
    case "star": {
      if (done) break;
      const glow = 0.5 + Math.sin(t * 4 + c.x) * 0.25;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 6 * s);
      g.addColorStop(0, `rgba(120,240,255,${glow})`);
      g.addColorStop(1, "rgba(120,240,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, 6 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#26C6DA";
      ctx.beginPath();
      ctx.moveTo(x, y - 3 * s);
      ctx.lineTo(x + 2.4 * s, y - 0.6 * s);
      ctx.lineTo(x, y + 3 * s);
      ctx.lineTo(x - 2.4 * s, y - 0.6 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath();
      ctx.moveTo(x, y - 3 * s);
      ctx.lineTo(x + 2.4 * s, y - 0.6 * s);
      ctx.lineTo(x, y - 0.6 * s);
      ctx.fill();
      break;
    }
    case "treasure": {
      if (done) break;
      ellipse(ctx, x + 0.6 * s, y + 0.8 * s, 5 * s, 3.6 * s, "rgba(0,0,0,0.2)");
      ctx.fillStyle = "#8D5A2B";
      roundRect(ctx, x - 5 * s, y - 3.5 * s, 10 * s, 7 * s, s);
      ctx.fill();
      ctx.fillStyle = "#6D4C41";
      roundRect(ctx, x - 5 * s, y - 3.5 * s, 10 * s, 2.6 * s, s);
      ctx.fill();
      ctx.fillStyle = "#F0D030";
      ctx.fillRect(x - 5 * s, y - 1 * s, 10 * s, 1 * s);
      circle(ctx, x, y + 0.6 * s, 1 * s, "#F0D030");
      for (let k = 0; k < 3; k++) circle(ctx, x - 3 * s + k * 3 * s, y - 4.2 * s, 1 * s, "#FFD54F");
      break;
    }
    case "panel": {
      ctx.translate(x, y);
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      roundRect(ctx, -10 * s + s, -6 * s + s, 20 * s, 12 * s, s);
      ctx.fill();
      ctx.fillStyle = "#1A3A6E";
      roundRect(ctx, -10 * s, -6 * s, 20 * s, 12 * s, s);
      ctx.fill();
      ctx.strokeStyle = "#8FB3E8";
      ctx.lineWidth = Math.max(1, s * 0.3);
      for (let k = -6; k <= 6; k += 4) {
        ctx.beginPath();
        ctx.moveTo(k * s, -6 * s);
        ctx.lineTo(k * s, 6 * s);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(-10 * s, 0);
      ctx.lineTo(10 * s, 0);
      ctx.stroke();
      if (!done) {
        const r = seeded(Math.round(c.x * 7 + c.y));
        ctx.fillStyle = "rgba(150,110,60,0.55)";
        roundRect(ctx, -10 * s, -6 * s, 20 * s, 12 * s, s);
        ctx.fill();
        for (let k = 0; k < 14; k++) ellipse(ctx, (r() - 0.5) * 18 * s, (r() - 0.5) * 10 * s, (1 + r() * 1.5) * s, (0.6 + r()) * s, "rgba(120,85,40,0.6)");
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.beginPath();
        ctx.moveTo(-8 * s, -6 * s);
        ctx.lineTo(-4 * s, -6 * s);
        ctx.lineTo(-9 * s, 6 * s);
        ctx.lineTo(-10 * s, 6 * s);
        ctx.fill();
        const sp = (Math.sin(t * 5 + c.x) + 1) / 2;
        ctx.fillStyle = `rgba(255,255,200,${0.4 + sp * 0.5})`;
        ctx.font = `${Math.max(9, 4 * s)}px system-ui`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("✦", 6 * s, -2 * s);
      }
      break;
    }
  }
  ctx.restore();
}

function drawTarget(ctx: C, tg: Target, done: boolean, s: number, t: number) {
  const x = tg.x * s;
  const y = tg.y * s;
  ctx.save();
  if (tg.kind === "plant") {
    const wet = done;
    for (let k = 0; k < 6; k++) ellipse(ctx, x, y, 3.4 * s, 1.1 * s, wet ? "#2E7D32" : "#A1887F", (k / 6) * Math.PI);
    circle(ctx, x, y, 1.2 * s, wet ? "#EC407A" : "#8D6E63");
    if (wet) for (let k = 0; k < 3; k++) circle(ctx, x + (k - 1) * 2.5 * s, y + 3.5 * s, 0.6 * s, "rgba(79,195,247,0.85)");
  } else if (tg.kind === "fire") {
    if (!done) {
      for (let k = -2; k <= 2; k++) {
        const fl = (4 + Math.sin(t * 12 + k * 2) * 1.4 + (2 - Math.abs(k)) * 1.5) * s;
        const fx = x + k * 3 * s;
        ellipse(ctx, fx, y - fl * 0.6, 2 * s, fl, "#FF7043");
        ellipse(ctx, fx, y - fl * 0.45, 1.1 * s, fl * 0.6, "#FFD54F");
      }
    } else {
      for (let k = 0; k < 4; k++) {
        const rise = (t * 0.5 + k / 4) % 1;
        circle(ctx, x + (k - 1.5) * 3 * s, y - rise * 14 * s, (2 + rise * 3) * s, `rgba(160,160,170,${0.55 * (1 - rise)})`);
      }
    }
  }
  ctx.restore();
}

function drawFlower(ctx: C, x: number, y: number, s: number, bloom: boolean, t: number) {
  ctx.save();
  ctx.translate(x, y);
  ellipse(ctx, 0, 0, 5 * s, 4 * s, "#8D6E4F");
  ellipse(ctx, 0, -0.4 * s, 4.2 * s, 3.2 * s, "#7B5C40");
  if (!bloom) {
    ellipse(ctx, -1.6 * s, 0.6 * s, 1.8 * s, 0.8 * s, "#4CAF50", -0.6);
    ellipse(ctx, 1.6 * s, 0.6 * s, 1.8 * s, 0.8 * s, "#4CAF50", 0.6);
    ellipse(ctx, 0, -0.6 * s, 1.1 * s, 1.7 * s, "#F48FB1");
  } else {
    const k = 1 + Math.sin(t * 3 + x) * 0.05;
    ctx.fillStyle = "#EC407A";
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * 2.8 * s * k, Math.sin(a) * 2.8 * s * k, 2.2 * s, 1.4 * s, a, 0, Math.PI * 2);
      ctx.fill();
    }
    circle(ctx, 0, 0, 1.7 * s, "#F0D030");
    const bx = Math.cos(t * 2 + x) * 6 * s;
    const by = Math.sin(t * 3 + x) * 4 * s - 4 * s;
    ellipse(ctx, bx, by, 1.3 * s, 0.9 * s, "#F0D030");
    ctx.fillStyle = "#010F2A";
    ctx.fillRect(bx - 0.25 * s, by - 0.9 * s, 0.5 * s, 1.8 * s);
  }
  ctx.restore();
}

function drawItem(ctx: C, it: Item, x: number, y: number, s: number) {
  ctx.save();
  const px = x * s;
  const py = y * s;
  if (it.kind === "fruit") {
    ellipse(ctx, px + 0.6 * s, py + 0.8 * s, 2.6 * s, 2 * s, "rgba(0,0,0,0.18)");
    if (it.colour === "yellow") {
      ctx.strokeStyle = "#F9D71C";
      ctx.lineWidth = 2.2 * s;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(px, py - 2.2 * s, 3.2 * s, 0.5, Math.PI - 0.5);
      ctx.stroke();
      circle(ctx, px - 2.6 * s, py - 0.7 * s, 0.5 * s, "#5D4037");
    } else {
      circle(ctx, px, py, 2.6 * s, it.colour === "red" ? "#E53935" : it.colour === "purple" ? "#6A1B9A" : "#FB8C00");
      circle(ctx, px - 0.8 * s, py - 0.8 * s, 0.8 * s, "rgba(255,255,255,0.45)");
      ellipse(ctx, px + 0.6 * s, py - 2.6 * s, 1.1 * s, 0.5 * s, "#43A047", -0.5);
    }
  } else if (it.kind === "bottle") {
    ellipse(ctx, px + 0.6 * s, py + 0.8 * s, 2.8 * s, 1.4 * s, "rgba(0,0,0,0.18)");
    ctx.fillStyle = "rgba(129,212,250,0.9)";
    roundRect(ctx, px - 2.8 * s, py - 1.2 * s, 4.4 * s, 2.4 * s, s);
    ctx.fill();
    ctx.fillStyle = "#1E88E5";
    ctx.fillRect(px + 1.6 * s, py - 0.6 * s, 1.4 * s, 1.2 * s);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillRect(px - 2 * s, py - 0.8 * s, 2.4 * s, 0.5 * s);
  } else if (it.kind === "kitten") {
    ctx.translate(px, py);
    ctx.scale(1.2, 1.2);
    ellipse(ctx, 0, 0, 2.4 * s, 1.8 * s, "#FFB74D");
    circle(ctx, 2 * s, -0.4 * s, 1.4 * s, "#FFB74D");
    circle(ctx, 2.5 * s, -0.6 * s, 0.25 * s, "#010F2A");
    ctx.strokeStyle = "#FFB74D";
    ctx.lineWidth = Math.max(1, s * 0.5);
    ctx.beginPath();
    ctx.moveTo(-2.2 * s, 0);
    ctx.quadraticCurveTo(-4 * s, -1 * s, -3.6 * s, -2.4 * s);
    ctx.stroke();
  } else if (it.kind === "flag") {
    ctx.translate(px, py);
    ctx.scale(1.8, 1.8);
    ctx.translate(-px, -py);
    circle(ctx, px, py, 0.8 * s, "#424242");
    ctx.fillStyle = "#E53935";
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + 5 * s, py - 1.8 * s);
    ctx.lineTo(px, py - 3.6 * s);
    ctx.fill();
    ctx.strokeStyle = "#424242";
    ctx.lineWidth = Math.max(1, s * 0.4);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - 4 * s);
    ctx.stroke();
  } else {
    const size = 4.4 * s;
    const bx = px - size / 2;
    const by = py - size / 2;
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    roundRect(ctx, bx + s * 0.6, by + s * 0.7, size, size, s * 0.8);
    ctx.fill();
    ctx.fillStyle = FLOOR[it.colour];
    roundRect(ctx, bx, by, size, size, s * 0.8);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    roundRect(ctx, bx + size * 0.15, by + size * 0.12, size * 0.4, size * 0.25, s * 0.4);
    ctx.fill();
    ctx.strokeStyle = "rgba(1,15,42,0.7)";
    ctx.lineWidth = Math.max(1, s * 0.3);
    roundRect(ctx, bx, by, size, size, s * 0.8);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the robot (themed costumes)

const BODY: Record<RobotKind, { fill: string; trim: string }> = {
  scout: { fill: "#F0D030", trim: "#D58401" },
  racer: { fill: "#2B7BD8", trim: "#0D3C78" },
  rover: { fill: "#0F6F7C", trim: "#012C61" },
};

type Costume = "sub" | "train" | "truck" | "sled" | "rover" | null;
const COSTUME: Partial<Record<Theme, Costume>> = { ocean: "sub", rail: "train", city: "truck", snow: "sled", mars: "rover" };

function drawRobot(ctx: C, kind: RobotKind, f: Frame, s: number, theme: Theme, t: number) {
  const r = ROBOT_RADIUS[kind] * s;
  const costume = COSTUME[theme] ?? null;
  let { fill, trim } = BODY[kind];
  if (costume === "sub") ({ fill, trim } = { fill: "#FFD23F", trim: "#C98A00" });
  if (costume === "train" || costume === "truck") ({ fill, trim } = { fill: "#E53935", trim: "#8E1B1B" });
  if (costume === "sled") ({ fill, trim } = { fill: "#29B6F6", trim: "#01579B" });
  if (costume === "rover") ({ fill, trim } = { fill: "#ECEFF1", trim: "#78909C" });
  ctx.save();
  ctx.translate(f.x * s, f.y * s);
  ellipse(ctx, r * 0.12, r * 0.18, r * 1.15, r * 1.1, "rgba(0,0,0,0.18)");
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
  if (costume === "sub") {
    // propeller instead of wheels
    ctx.fillStyle = "#9E9E9E";
    const spin = Math.sin(t * 30) * r * 0.5;
    ctx.fillRect(-r * 1.25, -Math.abs(spin), r * 0.25, Math.abs(spin) * 2 + 1);
    for (let k = 0; k < 3; k++) {
      const rise = (t * 0.8 + k / 3) % 1;
      circle(ctx, -r * (1.4 + rise * 1.4), (k - 1) * r * 0.4, r * 0.18 * (1 - rise * 0.5), `rgba(255,255,255,${0.7 * (1 - rise)})`);
    }
  } else if (costume === "sled") {
    ctx.strokeStyle = "#5D4037";
    ctx.lineWidth = Math.max(1.5, s * 0.6);
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(-r * 1.1, side * r * 0.85);
      ctx.lineTo(r * 1.0, side * r * 0.85);
      ctx.quadraticCurveTo(r * 1.4, side * r * 0.85, r * 1.3, side * r * 0.5);
      ctx.stroke();
    }
  } else {
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
  }
  ctx.fillStyle = fill;
  ctx.strokeStyle = trim;
  ctx.lineWidth = Math.max(1.5, s * 0.5);
  if (costume === "sub") {
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.2, r * 0.85, 0, 0, Math.PI * 2);
  } else if (costume === "train" || costume === "truck" || kind === "racer") roundRect(ctx, -r * 1.05, -r * 0.82, r * 2.1, r * 1.64, r * 0.45);
  else roundRect(ctx, -r * 0.92, -r * 0.92, r * 1.84, r * 1.84, r * (kind === "scout" ? 0.7 : 0.35));
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  roundRect(ctx, -r * 0.7, -r * 0.62, r * 0.9, r * 1.24, r * 0.3);
  ctx.fill();
  if (costume === "train") {
    circle(ctx, -r * 0.45, 0, r * 0.32, "#263238");
    for (let k = 0; k < 3; k++) {
      const rise = (t * 0.7 + k / 3) % 1;
      circle(ctx, -r * (0.6 + rise * 2), -rise * r * 0.4, r * (0.25 + rise * 0.4), `rgba(240,240,240,${0.7 * (1 - rise)})`);
    }
  }
  if (costume === "truck") {
    ctx.strokeStyle = "#ECEFF1";
    ctx.lineWidth = Math.max(1, s * 0.35);
    ctx.strokeRect(-r * 0.85, -r * 0.18, r * 1.2, r * 0.36);
    for (let k = -0.7; k < 0.3; k += 0.25) {
      ctx.beginPath();
      ctx.moveTo(k * r, -r * 0.18);
      ctx.lineTo(k * r, r * 0.18);
      ctx.stroke();
    }
    circle(ctx, r * 0.15, -r * 0.55, r * 0.16, Math.sin(t * 14) > 0 ? "#2196F3" : "#FF1744");
    circle(ctx, r * 0.15, r * 0.55, r * 0.16, Math.sin(t * 14) > 0 ? "#FF1744" : "#2196F3");
  }
  if (costume === "rover") {
    ctx.strokeStyle = "#607D8B";
    ctx.lineWidth = Math.max(1, s * 0.4);
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, 0);
    ctx.lineTo(-r * 0.2, -r * 1.3);
    ctx.stroke();
    circle(ctx, -r * 0.2, -r * 1.3, r * 0.3, "#90A4AE");
  }
  for (const side of [-1, 1]) {
    circle(ctx, r * 0.5, side * r * 0.33, r * 0.24, "#FFFFFF");
    circle(ctx, r * 0.58, side * r * 0.33, r * 0.12, "#010F2A");
  }
  ctx.fillStyle = LED[f.led];
  ctx.strokeStyle = "#010F2A";
  ctx.lineWidth = Math.max(1, s * 0.3);
  ctx.beginPath();
  ctx.arc(-r * 0.3, 0, r * 0.26, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (kind === "rover" && !costume) {
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
  if (f.pen) {
    circle(ctx, 0, 0, r * 0.22, PEN[f.pen] ?? "#1E6FE0");
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

function drawPuppy(ctx: C, x: number, y: number, heading: number, s: number, t: number) {
  ctx.save();
  ctx.translate(x * s, y * s);
  ctx.rotate(heading);
  ellipse(ctx, 0.4 * s, 0.6 * s, 3 * s, 2 * s, "rgba(0,0,0,0.15)");
  ellipse(ctx, 0, 0, 2.8 * s, 1.8 * s, "#C68642");
  circle(ctx, 2.6 * s, 0, 1.6 * s, "#C68642");
  ellipse(ctx, 2.2 * s, -1.4 * s, 0.9 * s, 0.6 * s, "#6D4C41", 0.4);
  ellipse(ctx, 2.2 * s, 1.4 * s, 0.9 * s, 0.6 * s, "#6D4C41", -0.4);
  circle(ctx, 4 * s, 0, 0.45 * s, "#1A1A1A");
  ctx.strokeStyle = "#C68642";
  ctx.lineWidth = Math.max(1, s * 0.6);
  ctx.beginPath();
  ctx.moveTo(-2.6 * s, 0);
  ctx.lineTo(-4 * s, Math.sin(t * 16) * 1.2 * s);
  ctx.stroke();
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
  if (d < 200) circle(ctx, ex * s, ey * s, s * 0.9, beam);
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

const NOTE_COLOUR: Record<Note, string> = { C: "#E53935", D: "#FB8C00", E: "#FDD835", F: "#43A047", G: "#1E88E5", A: "#5E35B1", B: "#D81B60", C2: "#E53935" };

export default function Stage({ world, scene, frame, trail = [], frames, index = 0, sounds = [], clapNow = false, showSensors = true, thumbnail = false }: Props) {
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
    const t = frame.t;
    const th = SPEC[scene.theme] ?? THEME[scene.theme];
    const done = new Set(frame.done);

    drawGround(ctx, scene, world, width, height, s, t);
    if (scene.theme !== "volcano")
      for (const z of world.heatZones ?? []) {
        const heat = Math.min(1, Math.max(0, (z.temp - 25) / 160));
        ctx.fillStyle = `rgba(255,${Math.round(110 - heat * 80)},20,${0.05 + heat * 0.35})`;
        ctx.fillRect(z.x * s, z.y * s, z.w * s, z.h * s);
      }
    if (world.grid) drawGrid(ctx, world, scene, width, height, s);

    for (const z of world.zones) {
      const col = FLOOR[z.colour];
      ctx.fillStyle = col + "55";
      roundRect(ctx, z.x * s, z.y * s, z.w * s, z.h * s, s * 1.5);
      ctx.fill();
      if (z.id) {
        ctx.setLineDash([s * 1.6, s * 1]);
        ctx.strokeStyle = col;
        ctx.lineWidth = Math.max(1.5, s * 0.5);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      const icon = z.id ? scene.zoneIcons?.[z.id] : undefined;
      if (icon) drawIcon(ctx, icon, (z.x + z.w / 2) * s, (z.y + z.h / 2 + 1) * s, Math.min(z.w, z.h) * s * 0.55, col);
      if (z.label && !thumbnail) label(ctx, z.label, z.x * s + s, z.y * s + s, s, th.dark);
    }

    for (const line of world.lines) drawPath(ctx, line.points, line.width ?? 2, scene.path ?? "tape", s);

    // paint from the pen, up to now
    if (frames && frames.length > 1) {
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = Math.max(2, s * 1.6);
      for (let k = 1; k <= Math.min(index, frames.length - 1); k++) {
        const a = frames[k - 1];
        const b = frames[k];
        if (!a.pen || !b.pen || (a.x === b.x && a.y === b.y)) continue;
        ctx.strokeStyle = PEN[b.pen] ?? "#1E6FE0";
        ctx.beginPath();
        ctx.moveTo(a.x * s, a.y * s);
        ctx.lineTo(b.x * s, b.y * s);
        ctx.stroke();
      }
      ctx.restore();
    }

    for (const p of world.places) {
      if (p.kind === "flower") drawFlower(ctx, p.x * s, p.y * s, s, Boolean(p.id && done.has(p.id)), t);
      else if (!thumbnail) label(ctx, p.label, p.x * s - 3 * s, p.y * s - 2 * s, s, true);
    }
    for (const col of world.collectibles ?? []) drawCollectible(ctx, col, done.has(col.id), s, t);
    for (const w of world.walls) drawWall(ctx, w, scene.wall, s, t);
    for (const d of scene.decor ?? []) drawDecor(ctx, d, s, t, frame);
    for (const d of world.doors ?? []) drawDoor(ctx, d, frame.unlocked, s);
    for (const tg of world.targets ?? []) drawTarget(ctx, tg, done.has(tg.id), s, t);

    // darker places (drawn over the world, under the robot)
    const shade = (level: number) => (Math.max(0, 70 - level) / 70) * 0.72;
    if (shade(world.light) > 0) {
      ctx.fillStyle = `rgba(1,15,42,${shade(world.light)})`;
      ctx.fillRect(0, 0, width, height);
    }
    for (const z of world.lightZones) {
      const a = shade(z.level);
      if (scene.theme === "rail" && z.level <= 15) {
        // a hill with a tunnel through it
        ctx.fillStyle = "#6D7B4F";
        roundRect(ctx, z.x * s - 2 * s, z.y * s, z.w * s + 4 * s, z.h * s, 6 * s);
        ctx.fill();
        ctx.fillStyle = `rgba(1,15,42,${a + 0.1})`;
        ctx.fillRect(z.x * s, 18 * s, z.w * s, 14 * s);
        for (const ex of [z.x, z.x + z.w]) {
          ctx.fillStyle = "#8D8A86";
          ctx.fillRect(ex * s - s, 16 * s, 2 * s, 18 * s);
        }
      } else if (a > 0) {
        ctx.fillStyle = `rgba(1,15,42,${a})`;
        ctx.fillRect(z.x * s, z.y * s, z.w * s, z.h * s);
      }
      if (z.label && !thumbnail) label(ctx, `${z.label} · light ${z.level}`, z.x * s + s, (z.y + z.h) * s - 6 * s, s, a > 0.25);
    }

    if (trail.length > 1 && !scene.follower && !frames?.some((f) => f.pen)) {
      ctx.strokeStyle = th.dark ? "rgba(255,214,90,0.7)" : "rgba(213,132,1,0.8)";
      ctx.lineWidth = Math.max(1.5, 0.55 * s);
      ctx.setLineDash([s * 1.2, s * 1.2]);
      ctx.beginPath();
      trail.forEach((p, i) => (i ? ctx.lineTo(p.x * s, p.y * s) : ctx.moveTo(p.x * s, p.y * s)));
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (scene.follower === "puppy") {
      for (let k = 4; k < trail.length - 8; k += 4) {
        const p = trail[k];
        const side = (k / 4) % 2 ? 1 : -1;
        for (const [dx, dy, rr] of [[0, 0, 0.7], [-0.8, -0.9, 0.35], [0, -1.2, 0.35], [0.8, -0.9, 0.35]] as const) circle(ctx, (p.x + dx + side) * s, (p.y + dy + side * 0.6) * s, rr * s, "rgba(109,76,65,0.45)");
      }
      const back = trail.length > 8 ? trail[trail.length - 8] : { x: frame.x - 8, y: frame.y };
      const ahead = trail.length > 6 ? trail[trail.length - 6] : frame;
      drawPuppy(ctx, back.x, back.y, Math.atan2(ahead.y - back.y, ahead.x - back.x) || 0, s, t);
    }

    for (const it of world.items) {
      if (frame.carrying === it.id) continue;
      const p = frame.items[it.id] ?? it;
      drawItem(ctx, it, p.x, p.y, s);
    }

    // headlight in the dark
    const here = world.lightZones.find((z) => frame.x >= z.x && frame.x <= z.x + z.w && frame.y >= z.y && frame.y <= z.y + z.h);
    if (frame.led !== "off" && here && here.level < 40) {
      const h = (frame.heading * Math.PI) / 180;
      const g = ctx.createRadialGradient(frame.x * s, frame.y * s, s * 2, frame.x * s, frame.y * s, 40 * s);
      g.addColorStop(0, "rgba(255,247,200,0.65)");
      g.addColorStop(1, "rgba(255,247,200,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(frame.x * s, frame.y * s);
      ctx.arc(frame.x * s, frame.y * s, 40 * s, -h - 0.45, -h + 0.45);
      ctx.closePath();
      ctx.fill();
    }

    // the hose
    if (frame.spraying) {
      const h = (frame.heading * Math.PI) / 180;
      const r0 = ROBOT_RADIUS[world.robot];
      for (let k = 0; k < 18; k++) {
        const along = r0 + ((k * 7 + t * 60) % 30);
        const wob = Math.sin(k * 2.3 + t * 20) * 1.6;
        const px = frame.x + Math.cos(h) * along - Math.sin(h) * wob;
        const py = frame.y - Math.sin(h) * along - Math.cos(h) * wob;
        circle(ctx, px * s, py * s, s * 0.8, "rgba(79,195,247,0.85)");
      }
    }

    if (showSensors && !thumbnail) drawSensors(ctx, world, frame, s);
    drawRobot(ctx, world.robot, frame, s, scene.theme, t);
    if (frame.carrying) {
      const it = world.items.find((i) => i.id === frame.carrying);
      const p = frame.items[frame.carrying];
      if (it && p) drawItem(ctx, it, p.x, p.y, s);
    }

    // a tossed snack
    if (frame.ball) {
      const b = frame.ball;
      ellipse(ctx, b.x * s, b.y * s, 2 * s, 1.2 * s, "rgba(0,0,0,0.2)");
      const by = (b.y - b.z) * s;
      ctx.save();
      ctx.translate(b.x * s, by);
      ctx.rotate(t * 8);
      ellipse(ctx, 0, 0, 2.6 * s, 1.8 * s, "#43A047");
      ellipse(ctx, 0, 0, 2.1 * s, 1.3 * s, "#E53935");
      ctx.restore();
    }

    // music notes and sparkles from recent sounds
    for (const ev of sounds) {
      const age = t - ev.t;
      if (age < 0 || age > 1.4) continue;
      if (ev.kind === "note" && ev.note) {
        const x = (frame.x + 3 + age * 4) * s;
        const y = (frame.y - 6 - age * 10) * s;
        ctx.globalAlpha = Math.max(0, 1 - age / 1.4);
        ctx.font = `900 ${Math.max(18, 9 * s)}px system-ui, sans-serif`;
        ctx.fillStyle = NOTE_COLOUR[ev.note];
        ctx.textAlign = "center";
        ctx.fillText("♪", x, y);
        ctx.font = `800 ${Math.max(11, 3.6 * s)}px system-ui, sans-serif`;
        ctx.fillText(ev.note === "C2" ? "high C" : ev.note, x + 5 * s, y + 2 * s);
        ctx.globalAlpha = 1;
        ctx.textAlign = "left";
      }
      if (ev.kind === "collect" && age < 0.7) {
        const k = age / 0.7;
        ctx.strokeStyle = `rgba(255,214,0,${1 - k})`;
        ctx.lineWidth = Math.max(1.5, s * 0.6);
        for (let j = 0; j < 6; j++) {
          const a = (j / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo((frame.x + Math.cos(a) * (3 + k * 4)) * s, (frame.y + Math.sin(a) * (3 + k * 4)) * s);
          ctx.lineTo((frame.x + Math.cos(a) * (5 + k * 7)) * s, (frame.y + Math.sin(a) * (5 + k * 7)) * s);
          ctx.stroke();
        }
      }
    }

    // dust storm on Mars
    if (scene.theme === "mars" && !thumbnail) {
      ctx.strokeStyle = "rgba(255,210,170,0.25)";
      ctx.lineWidth = Math.max(1, s * 0.4);
      const r = seeded(3);
      for (let k = 0; k < 40; k++) {
        const x = ((r() * width + t * 30 * s) % (width + 20 * s)) - 10 * s;
        const y = r() * height;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 5 * s, y + 1 * s);
        ctx.stroke();
      }
    }

    // disco: the floor under the robot glows its light colour
    if (scene.theme === "disco" && frame.led !== "off") {
      const tx = Math.floor(frame.x / 10) * 10;
      const ty = Math.floor(frame.y / 10) * 10;
      for (let dx = -10; dx <= 10; dx += 10)
        for (let dy = -10; dy <= 10; dy += 10) {
          ctx.fillStyle = LED[frame.led] + (dx === 0 && dy === 0 ? "66" : "2A");
          ctx.fillRect((tx + dx) * s + 1, (ty + dy) * s + 1, 10 * s - 2, 10 * s - 2);
        }
    }

    // photo flash
    if (frame.photoAt >= 0 && t - frame.photoAt < 0.35) {
      ctx.fillStyle = `rgba(255,255,255,${0.8 * (1 - (t - frame.photoAt) / 0.35)})`;
      ctx.fillRect(0, 0, width, height);
    }

    // progress counter for things to collect
    const cols = world.collectibles ?? [];
    if (cols.length && !thumbnail) {
      const names: Record<string, string> = { egg: "Eggs", gem: "Crystals", panel: "Clean panels", treasure: "Treasure", star: "Stars", pearl: "Pearls", mitten: "Mittens", ball: "Balls" };
      const got = cols.filter((c) => done.has(c.id)).length;
      ctx.font = `800 ${Math.max(11, 3.2 * s)}px system-ui, sans-serif`;
      const text = `${names[cols[0].kind]} ${got} / ${cols.length}`;
      const tw = ctx.measureText(text).width + 16;
      const bh = Math.max(20, 5 * s);
      ctx.fillStyle = got === cols.length ? "#2EB84B" : "rgba(1,15,42,0.85)";
      roundRect(ctx, width - tw - 6, height - bh - 6, tw, bh, bh / 2);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.textBaseline = "middle";
      ctx.fillText(text, width - tw + 2, height - 6 - bh / 2 + 0.5);
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
