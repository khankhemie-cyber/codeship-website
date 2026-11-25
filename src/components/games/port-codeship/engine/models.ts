/**
 * Port CODEship models: blocky low-poly people and bots, built from boxes so they
 * cost almost nothing to draw, plus canvas textures for facades and signs.
 */

import * as THREE from "three";

const matCache = new Map<string, THREE.MeshStandardMaterial>();
export function mat(color: number, opts: { rough?: number; metal?: number; emissive?: number } = {}) {
  const key = `${color}-${opts.rough ?? 0.8}-${opts.metal ?? 0}-${opts.emissive ?? 0}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: opts.rough ?? 0.8, metalness: opts.metal ?? 0, emissive: opts.emissive ?? 0 });
    matCache.set(key, m);
  }
  return m;
}

const boxGeo = new THREE.BoxGeometry(1, 1, 1);
export function cube(w: number, h: number, d: number, m: THREE.Material, x = 0, y = 0, z = 0, shadow = true) {
  const mesh = new THREE.Mesh(boxGeo, m);
  mesh.scale.set(w, h, d);
  mesh.position.set(x, y, z);
  mesh.castShadow = shadow;
  mesh.receiveShadow = true;
  return mesh;
}

export type Avatar = {
  root: THREE.Group;
  body: THREE.Group;
  head: THREE.Mesh;
  armL: THREE.Group;
  armR: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
  hand: THREE.Group;
  phase: number;
  /** Holding something in both hands: arms stay out in front, around the item. */
  carrying?: boolean;
};

function limb(w: number, h: number, m: THREE.Material, x: number, y: number) {
  const g = new THREE.Group();
  g.position.set(x, y, 0);
  g.add(cube(w, h, w, m, 0, -h / 2, 0));
  return g;
}

/** A blocky person, ~1.75 m tall, feet at y = 0, facing +z. */
export function makeAvatar(c: { shirt: number; skin: number; hair: number; pants?: number; cap?: number }): Avatar {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const shirt = mat(c.shirt);
  const skin = mat(c.skin);
  const pants = mat(c.pants ?? 0x2c3e50);
  const legL = limb(0.24, 0.8, pants, -0.14, 0.8);
  const legR = limb(0.24, 0.8, pants, 0.14, 0.8);
  body.add(legL, legR);
  body.add(cube(0.56, 0.62, 0.3, shirt, 0, 1.1, 0));
  const armL = limb(0.18, 0.62, shirt, -0.38, 1.38);
  const armR = limb(0.18, 0.62, shirt, 0.38, 1.38);
  armL.children[0].add(cube(1, 0.25, 1, skin, 0, -0.55, 0));
  armR.children[0].add(cube(1, 0.25, 1, skin, 0, -0.55, 0));
  body.add(armL, armR);
  const head = cube(0.42, 0.42, 0.42, skin, 0, 1.64, 0);
  body.add(head);
  const hair = cube(1.06, 0.3, 1.06, mat(c.hair), 0, 0.42, -0.02);
  head.add(hair);
  if (c.cap !== undefined) head.add(cube(1.12, 0.22, 1.3, mat(c.cap), 0, 0.55, 0.12));
  // Eyes
  const eye = mat(0x111111);
  head.add(cube(0.12, 0.14, 0.05, eye, -0.2, 0.02, 0.51, false));
  head.add(cube(0.12, 0.14, 0.05, eye, 0.2, 0.02, 0.51, false));
  const hand = new THREE.Group();
  // Where a carried item sits: between the hands when the arms are held out.
  hand.position.set(0, 1.12, 0.56);
  body.add(hand);
  return { root, body, head, armL, armR, legL, legR, hand, phase: 0 };
}

export function animateAvatar(a: Avatar, dt: number, speed: number, mode: "walk" | "climb" | "swim" | "idle", airborne = false) {
  if (mode === "climb") {
    a.phase += dt * speed * 3.2;
    const s = Math.sin(a.phase);
    a.armL.rotation.x = Math.PI + 0.3 + s * 0.4;
    a.armR.rotation.x = Math.PI + 0.3 - s * 0.4;
    a.legL.rotation.x = -0.4 - s * 0.4;
    a.legR.rotation.x = -0.4 + s * 0.4;
    a.body.rotation.x = 0;
    return;
  }
  if (mode === "swim") {
    a.phase += dt * 6;
    const s = Math.sin(a.phase);
    a.armL.rotation.x = Math.PI * 0.9 + s * 0.8;
    a.armR.rotation.x = Math.PI * 0.9 - s * 0.8;
    a.legL.rotation.x = s * 0.5;
    a.legR.rotation.x = -s * 0.5;
    a.body.rotation.x = 0.9;
    return;
  }
  a.body.rotation.x = 0;
  if (airborne) {
    a.armL.rotation.x = -2.4;
    a.armR.rotation.x = -2.4;
    a.legL.rotation.x = -0.5;
    a.legR.rotation.x = 0.3;
    return;
  }
  a.phase += dt * Math.max(speed, 0.001) * 1.9;
  const amp = Math.min(1, speed / 5) * 0.9;
  const s = Math.sin(a.phase);
  a.armL.rotation.x = s * amp;
  a.armR.rotation.x = -s * amp;
  a.legL.rotation.x = -s * amp;
  a.legR.rotation.x = s * amp;
  if (a.carrying) {
    // Arms out in front holding the item; they don't swing through it.
    a.armL.rotation.x = -1.2;
    a.armR.rotation.x = -1.2;
    a.armL.rotation.z = -0.12;
    a.armR.rotation.z = 0.12;
    return;
  }
  a.armL.rotation.z = 0;
  a.armR.rotation.z = 0;
  if (speed < 0.2) {
    const t = performance.now() / 1000;
    a.armL.rotation.x = Math.sin(t * 1.5) * 0.05;
    a.armR.rotation.x = -Math.sin(t * 1.5) * 0.05;
  }
}

/** Hovering builder drone with a little block claw. */
export function makeBuilderBot() {
  const g = new THREE.Group();
  const shell = mat(0xf5b83d, { rough: 0.4, metal: 0.2 });
  const dark = mat(0x22303c, { rough: 0.5 });
  g.add(cube(0.8, 0.35, 0.8, shell, 0, 0.6, 0));
  g.add(cube(0.5, 0.2, 0.5, dark, 0, 0.85, 0));
  g.add(cube(0.12, 0.12, 0.12, mat(0x7cf2ff, { emissive: 0x2bd8f0 }), 0.15, 0.62, 0.41, false));
  g.add(cube(0.12, 0.12, 0.12, mat(0x7cf2ff, { emissive: 0x2bd8f0 }), -0.15, 0.62, 0.41, false));
  for (const [x, z] of [
    [0.5, 0.5],
    [-0.5, 0.5],
    [0.5, -0.5],
    [-0.5, -0.5],
  ]) {
    g.add(cube(0.1, 0.08, 0.1, dark, x * 0.9, 0.7, z * 0.9));
    const rotor = cube(0.5, 0.02, 0.08, mat(0xdddddd), x * 0.9, 0.76, z * 0.9, false);
    rotor.name = "rotor";
    g.add(rotor);
  }
  return g;
}

/** Rolling shop ladder with a lift platform and a grabber bot on top. */
export function makeLadderBot() {
  const g = new THREE.Group();
  const frame = mat(0xe3664f, { rough: 0.5 });
  g.add(cube(1.2, 0.25, 1.0, mat(0x34495e), 0, 0.15, 0));
  g.add(cube(0.1, 4.6, 0.1, frame, -0.5, 2.4, 0));
  g.add(cube(0.1, 4.6, 0.1, frame, 0.5, 2.4, 0));
  for (let y = 0.6; y < 4.8; y += 0.5) g.add(cube(1.0, 0.06, 0.06, frame, 0, y, 0));
  const lift = new THREE.Group();
  lift.name = "lift";
  lift.add(cube(1.1, 0.12, 0.9, mat(0x2c3e50), 0, 0, 0));
  const bot = cube(0.45, 0.4, 0.4, mat(0x9fe3ec, { rough: 0.3 }), 0, 0.3, 0);
  lift.add(bot);
  lift.add(cube(0.08, 0.08, 0.08, mat(0x111111), -0.1, 0.36, 0.21, false));
  lift.add(cube(0.08, 0.08, 0.08, mat(0x111111), 0.1, 0.36, 0.21, false));
  const basket = cube(0.5, 0.2, 0.35, mat(0x8e6e4e), 0, 0.15, 0.45);
  basket.name = "basket";
  lift.add(basket);
  lift.position.y = 0.4;
  g.add(lift);
  return g;
}

export type BeachBotStyle = { wheels: "wheels" | "treads"; color: number; arm: "claw" | "scoop" };

export function makeBeachBot(style: BeachBotStyle) {
  const g = new THREE.Group();
  const shell = mat(style.color, { rough: 0.45, metal: 0.15 });
  const dark = mat(0x1d2730);
  g.add(cube(1.1, 0.55, 1.3, shell, 0, 0.6, 0));
  g.add(cube(0.7, 0.4, 0.5, shell, 0, 1.05, -0.2));
  g.add(cube(0.5, 0.15, 0.06, mat(0x7cf2ff, { emissive: 0x1fb3c8 }), 0, 1.1, 0.06, false));
  if (style.wheels === "treads") {
    g.add(cube(0.3, 0.45, 1.5, dark, -0.68, 0.28, 0));
    g.add(cube(0.3, 0.45, 1.5, dark, 0.68, 0.28, 0));
  } else {
    for (const [x, z] of [
      [-0.62, 0.45],
      [0.62, 0.45],
      [-0.62, -0.45],
      [0.62, -0.45],
    ]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.2, 14), dark);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.28, z);
      w.castShadow = true;
      g.add(w);
    }
  }
  const arm = new THREE.Group();
  arm.name = "arm";
  arm.position.set(0, 0.9, 0.55);
  arm.add(cube(0.12, 0.12, 0.8, mat(0x95a5a6, { metal: 0.5, rough: 0.4 }), 0, 0, 0.4));
  if (style.arm === "claw") {
    arm.add(cube(0.06, 0.25, 0.06, dark, -0.1, -0.12, 0.82));
    arm.add(cube(0.06, 0.25, 0.06, dark, 0.1, -0.12, 0.82));
  } else {
    arm.add(cube(0.45, 0.08, 0.35, dark, 0, -0.08, 0.85));
  }
  const grip = new THREE.Group();
  grip.name = "grip";
  grip.position.set(0, -0.15, 0.85);
  arm.add(grip);
  g.add(arm);
  const flag = cube(0.03, 0.9, 0.03, dark, 0.4, 1.5, -0.45);
  g.add(flag);
  g.add(cube(0.3, 0.2, 0.02, mat(0xf5b83d), 0.55, 1.85, -0.45, false));
  return g;
}

export function makeTerminal() {
  const g = new THREE.Group();
  g.add(cube(0.5, 1.0, 0.5, mat(0x22303c), 0, 0.5, 0));
  const screen = cube(0.9, 0.6, 0.08, mat(0x0d1b2a), 0, 1.25, 0);
  screen.rotation.x = -0.35;
  g.add(screen);
  const glow = cube(0.8, 0.5, 0.02, mat(0x39d0a8, { emissive: 0x1f8f74 }), 0, 1.26, 0.05, false);
  glow.rotation.x = -0.35;
  g.add(glow);
  return g;
}

export function makeTree(scale: number) {
  const g = new THREE.Group();
  g.add(cube(0.35 * scale, 2.2 * scale, 0.35 * scale, mat(0x7a5536), 0, 1.1 * scale, 0));
  const leaf = mat(0x3f8f45, { rough: 0.9 });
  g.add(cube(2.4 * scale, 1.6 * scale, 2.4 * scale, leaf, 0, 2.9 * scale, 0));
  g.add(cube(1.6 * scale, 1.0 * scale, 1.6 * scale, mat(0x4ea653, { rough: 0.9 }), 0, 4.0 * scale, 0));
  return g;
}

export function makePalm() {
  const g = new THREE.Group();
  const trunk = mat(0x9c7a54);
  for (let i = 0; i < 6; i++) g.add(cube(0.32, 0.8, 0.32, trunk, Math.sin(i * 0.35) * 0.4, 0.4 + i * 0.75, 0));
  const leaf = mat(0x3f9b4a, { rough: 0.9 });
  for (let i = 0; i < 5; i++) {
    const f = cube(0.5, 0.08, 2.4, leaf, 0, 0, 0);
    const holder = new THREE.Group();
    holder.position.set(Math.sin(5 * 0.35) * 0.4, 4.6, 0);
    f.position.z = 1.1;
    f.rotation.x = 0.35;
    holder.rotation.y = (i / 5) * Math.PI * 2;
    holder.add(f);
    g.add(holder);
  }
  return g;
}

/** A label floating over things (aisle signs, names). */
export function textTexture(
  lines: string[],
  opts: { w?: number; h?: number; bg?: string; fg?: string; title?: string; font?: number; align?: "center" | "left" } = {}
) {
  const w = opts.w ?? 512;
  const h = opts.h ?? 256;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = opts.bg ?? "#0d1b2a";
  g.fillRect(0, 0, w, h);
  g.textBaseline = "middle";
  const fs = opts.font ?? 40;
  const all = opts.title ? [opts.title, ...lines] : lines;
  const lh = h / all.length;
  const pad = w * 0.06;
  const maxW = w - pad * 2;
  all.forEach((line, i) => {
    const isTitle = i === 0 && !!opts.title;
    // Shrink a line until it fits, so long words are never cut off at the edges.
    let size = Math.min(isTitle ? fs * 1.15 : fs, lh * 0.8);
    const font = () => `${isTitle ? 800 : 600} ${size}px "Trebuchet MS", system-ui, sans-serif`;
    g.font = font();
    while (size > 10 && g.measureText(line).width > maxW) {
      size -= 2;
      g.font = font();
    }
    g.fillStyle = isTitle ? "#f5c35a" : opts.fg ?? "#ffffff";
    const left = opts.align === "left" && !isTitle;
    g.textAlign = left ? "left" : "center";
    g.fillText(line, left ? pad : w / 2, lh * i + lh / 2);
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Facade with a window grid; UVs are scaled per building so it tiles. */
export function facadeTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, 128, 128);
  g.fillStyle = "rgba(0,0,0,0.06)";
  for (let y = 0; y < 128; y += 8) g.fillRect(0, y, 128, 1);
  g.fillStyle = "#2b3f52";
  g.fillRect(28, 30, 72, 64);
  g.fillStyle = "#4f7896";
  g.fillRect(32, 34, 30, 56);
  g.fillRect(66, 34, 30, 56);
  g.fillStyle = "rgba(255,255,255,0.35)";
  g.fillRect(34, 36, 8, 30);
  g.fillStyle = "rgba(0,0,0,0.25)";
  g.fillRect(24, 94, 80, 6);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Scale a box geometry's UVs so a 4 m texture tile repeats across each face. */
export function tiledBox(w: number, h: number, d: number, tile = 4) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  // Face order: +x, -x, +y, -y, +z, -z; 4 vertices each.
  const dims = [
    [d, h],
    [d, h],
    [w, d],
    [w, d],
    [w, h],
    [w, h],
  ];
  for (let f = 0; f < 6; f++)
    for (let v = 0; v < 4; v++) {
      const i = f * 4 + v;
      uv.setXY(i, uv.getX(i) * Math.max(1, Math.round(dims[f][0] / tile)), uv.getY(i) * Math.max(1, Math.round(dims[f][1] / tile)));
    }
  uv.needsUpdate = true;
  return geo;
}

export const LITTER_LOOK: Record<string, { color: number; w: number; h: number; d: number }> = {
  bottle: { color: 0x7fd3e6, w: 0.18, h: 0.18, d: 0.5 },
  can: { color: 0xc0392b, w: 0.16, h: 0.26, d: 0.16 },
  newspaper: { color: 0xe9e4d6, w: 0.5, h: 0.05, d: 0.4 },
  "apple core": { color: 0xd8c27a, w: 0.14, h: 0.22, d: 0.14 },
  "banana peel": { color: 0xf1d332, w: 0.4, h: 0.06, d: 0.25 },
  "chip bag": { color: 0x8e44ad, w: 0.35, h: 0.06, d: 0.45 },
  straw: { color: 0xff6fa8, w: 0.05, h: 0.05, d: 0.45 },
};

export function makeLitter(kind: string) {
  const l = LITTER_LOOK[kind] ?? LITTER_LOOK.can;
  // Drawn about twice life size so it's easy to spot on the sand.
  const k = 1.9;
  const m = cube(l.w * k, l.h * k, l.d * k, mat(l.color, { rough: 0.5 }), 0, (l.h * k) / 2, 0);
  const g = new THREE.Group();
  g.add(m);
  return g;
}

export const PRODUCT_COLORS: Record<string, number> = {
  rice: 0xf4f1e6, beans: 0x8e4b32, pasta: 0xf2c94c, flour: 0xffffff,
  milk: 0xe8f4ff, cheese: 0xf6c343, yogurt: 0xf7b7c9, eggs: 0xe9d8b4,
  apples: 0xd63a2f, bananas: 0xf7dd3a, mangoes: 0xf39c34, oranges: 0xf08a24,
  bread: 0xc98d4b, cookies: 0x8a5a36, crackers: 0xe7bf74, cereal: 0x2f80ed,
};
