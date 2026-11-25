/**
 * Port CODEship 3D engine: the town, the player, the camera, the bots that play
 * back students' code, and hand-building at the home plot.
 *
 * The React shell (PortCodeship.tsx) owns quests, dialogue and saving. The engine
 * tells it what the player can interact with (hooks.label decides what's
 * available) and plays back mission steps on request.
 */

import * as THREE from "three";
import {
  AISLES,
  BIN_POS,
  PLOT_D,
  PLOT_H,
  PLOT_W,
  type BeachStep,
  type BinName,
  type Block,
  type BlockColor,
  type HomeStep,
  type Litter,
  type MarketStep,
} from "@/lib/games/port/missions";
import {
  AISLE_X,
  BEACH_ORIGIN,
  BEACH_TERMINAL,
  BOARDWALK,
  COUNTER,
  GROUND_EXTENT,
  LADDER_Z,
  LIFEGUARD,
  LOOKOUTS,
  MARKET,
  MARKET_TERMINAL,
  NPCS,
  PARK,
  PLAZA,
  PLOT,
  PLOT_TERMINAL,
  SEA_FLOOR,
  SHELF_DEPTH,
  SHELF_H,
  SHELF_W,
  SHELF_Z,
  SPAWN,
  WATER_Y,
  bitSpots,
  buildings,
  groundHeight,
  paintGround,
  trees,
  type Building,
  type NpcId,
} from "./layout";
import {
  PRODUCT_COLORS,
  animateAvatar,
  cube,
  facadeTexture,
  makeAvatar,
  makeBeachBot,
  makeBuilderBot,
  makeLadderBot,
  makeLitter,
  makePalm,
  makeTerminal,
  makeTree,
  mat,
  textTexture,
  tiledBox,
  type Avatar,
  type BeachBotStyle,
} from "./models";
import { Colliders, Player, box, type Box, type MoveInput } from "./physics";

export type Focus = { id: string; label: string } | null;

export interface Hooks {
  /** What pressing E would do for this target right now, or null if nothing. */
  label(id: string): string | null;
  interact(id: string): void;
  focus(f: Focus): void;
  bits(collected: number[]): void;
  blocksChanged(blocks: Block[]): void;
  buildMode(on: boolean): void;
  /** Mouse-look turned on (pointer locked) or off. */
  mouseLook(on: boolean): void;
  say(who: string, text: string, tone?: "good" | "bad" | "info"): void;
}

export type EngineSave = {
  x: number;
  y: number;
  z: number;
  yaw: number;
  bits: number[];
  lit: string[];
};

export type Look = { shirt: number; skin: number; hair: number; cap?: number };

const BLOCK_MATS: Record<BlockColor, THREE.Material> = {
  brick: mat(0xb5523b),
  wood: mat(0xa4723f),
  stone: mat(0x8d969d),
  white: mat(0xf3f1ea),
  teal: mat(0x1f8a9e),
  yellow: mat(0xf5c33d),
  glass: new THREE.MeshStandardMaterial({ color: 0x9fd8ef, transparent: true, opacity: 0.45, roughness: 0.1 }),
};

const plotKey = (x: number, y: number, z: number) => `${x},${y},${z}`;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

type Tween = { t: number; dur: number; fn: (k: number) => void; done: () => void };

export class Game {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(62, 1, 0.1, 700);
  private col = new Colliders();
  private player = new Player(this.col);
  private avatar: Avatar;
  private sun = new THREE.DirectionalLight(0xfff1d6, 2.2);
  private raf = 0;
  private last = performance.now();
  private disposed = false;

  // Input
  private keys = new Set<string>();
  private touch = { x: 0, y: 0, jump: false, sprint: false };
  enabled = false;
  private camYaw = SPAWN.yaw + Math.PI;
  private camPitch = 0.32;
  private camDist = 7;
  private camTarget = new THREE.Vector3();
  private drag: { id: number; x: number; y: number; moved: number; button: number } | null = null;
  private cinematic: ((dt: number) => boolean) | null = null;

  // World state
  private focus: Focus = null;
  private interactables: { id: string; x: number; y: number; z: number; r: number }[] = [];
  private npcs = new Map<NpcId, { av: Avatar; alert: THREE.Mesh }>();
  private wanderers: { av: Avatar; path: { x: number; z: number }[]; i: number; t: number }[] = [];
  private bits: { id: number; mesh: THREE.Mesh; x: number; y: number; z: number }[] = [];
  private collected = new Set<number>();
  private lit = new Set<string>();
  private beacons = new Map<string, THREE.Mesh>();
  private marker: THREE.Group;
  private markerPos: THREE.Vector3 | null = null;
  private tweens: Tween[] = [];
  timeScale = 1;
  private carry: THREE.Object3D | null = null;
  private buildings: Building[] = [];
  private mapCanvas: HTMLCanvasElement;

  // Home plot
  private blocks = new Map<string, { b: Block; mesh: THREE.Mesh; box: Box }>();
  private builder: THREE.Group;
  private building = false;
  private buildColor: BlockColor = "brick";
  private ghost: THREE.Mesh;
  private ghostCell: { x: number; y: number; z: number } | null = null;
  private ghostRemove: string | null = null;
  private raycaster = new THREE.Raycaster();
  private pointerNdc = new THREE.Vector2();
  private plotGround!: THREE.Mesh;

  // Market
  private ladder: THREE.Group;
  private ladderLift: THREE.Object3D;
  private counterItem: THREE.Object3D | null = null;

  // Beach
  private litter = new Map<number, { l: Litter; obj: THREE.Object3D }>();
  private beachBot: THREE.Group;
  private beachStyle: BeachBotStyle = { wheels: "wheels", color: 0x2fb38f, arm: "claw" };

  constructor(private canvas: HTMLCanvasElement, private hooks: Hooks, look: Look) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.avatar = makeAvatar({ ...look, pants: 0x34495e });
    this.scene.add(this.avatar.root);
    this.buildSky();
    this.buildTerrain();
    this.buildTown();
    this.buildPlot();
    this.buildMarket();
    this.buildBeach();
    this.buildLookouts();
    this.buildPeople();
    this.mapCanvas = this.paintMap();

    this.builder = makeBuilderBot();
    this.scene.add(this.builder);
    this.resetBuilder();
    const ladder = makeLadderBot();
    this.ladder = ladder;
    this.ladderLift = ladder.getObjectByName("lift")!;
    ladder.position.set(COUNTER.x, 0, LADDER_Z);
    this.scene.add(ladder);
    this.beachBot = makeBeachBot(this.beachStyle);
    this.parkBeachBot();
    this.scene.add(this.beachBot);

    this.marker = new THREE.Group();
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.6), mat(0xf5c33d, { emissive: 0xb07a00, rough: 0.3 }));
    gem.scale.y = 1.5;
    this.marker.add(gem);
    this.marker.visible = false;
    this.scene.add(this.marker);

    this.ghost = new THREE.Mesh(new THREE.BoxGeometry(1.02, 1.02, 1.02), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false }));
    this.ghost.visible = false;
    this.scene.add(this.ghost);

    this.player.x = SPAWN.x;
    this.player.z = SPAWN.z;
    this.player.yaw = SPAWN.yaw;

    this.bindInput();
    this.resize();
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  // ---------------------------------------------------------------------------
  // World building

  private buildSky() {
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(600, 24, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { top: { value: new THREE.Color(0x3d9be0) }, bottom: { value: new THREE.Color(0xd8eef5) } },
        vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader: "uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main(){ float h = clamp(vP.y*1.6+0.1,0.0,1.0); gl_FragColor = vec4(mix(bottom, top, h),1.0); }",
      })
    );
    this.scene.add(sky);
    this.scene.fog = new THREE.Fog(0xcfe7f0, 90, 380);
    this.scene.add(new THREE.HemisphereLight(0xcfe9ff, 0x6b8f4e, 1.1));
    this.sun.position.set(60, 90, 40);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const s = this.sun.shadow.camera;
    s.left = -55;
    s.right = 55;
    s.top = 55;
    s.bottom = -55;
    s.near = 1;
    s.far = 260;
    this.sun.shadow.bias = -0.0005;
    this.sun.shadow.normalBias = 0.04;
    this.scene.add(this.sun, this.sun.target);
  }

  private buildTerrain() {
    const size = GROUND_EXTENT.size;
    const seg = 150;
    const geo = new THREE.PlaneGeometry(size, size, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const cx = GROUND_EXTENT.x0 + size / 2;
    const cz = GROUND_EXTENT.z0 + size / 2;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + cx;
      const z = pos.getZ(i) + cz;
      pos.setY(i, groundHeight(x, z));
    }
    geo.computeVertexNormals();
    const tex = new THREE.CanvasTexture(paintGround(2048));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const ground = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }));
    ground.position.set(cx, 0.001, cz);
    ground.receiveShadow = true;
    this.scene.add(ground);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), mat(0xb8a679));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = SEA_FLOOR - 0.01;
    this.scene.add(floor);
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(1400, 1400),
      new THREE.MeshStandardMaterial({ color: 0x1e88a8, transparent: true, opacity: 0.72, roughness: 0.12, metalness: 0.05 })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = WATER_Y;
    water.name = "water";
    this.scene.add(water);
  }

  private solid(b: Box, mesh?: THREE.Object3D) {
    this.col.add(b);
    void mesh;
    return b;
  }

  private buildTown() {
    const tex = facadeTexture();
    const facadeMats = new Map<number, THREE.Material>();
    this.buildings = buildings();
    for (const b of this.buildings) {
      const w = b.x1 - b.x0;
      const d = b.z1 - b.z0;
      let m = facadeMats.get(b.color);
      if (!m) facadeMats.set(b.color, (m = new THREE.MeshStandardMaterial({ map: tex, color: b.color, roughness: 0.85 })));
      const mesh = new THREE.Mesh(tiledBox(w, b.h, d), m);
      mesh.position.set((b.x0 + b.x1) / 2, b.h / 2, (b.z0 + b.z1) / 2);
      mesh.castShadow = mesh.receiveShadow = true;
      this.scene.add(mesh);
      this.scene.add(cube(w + 0.3, 0.3, d + 0.3, mat(b.roof), mesh.position.x, b.h + 0.15, mesh.position.z));
      this.solid(box(b.x0, 0, b.z0, b.x1, b.h + 0.3, b.z1), mesh);
      // Rooftop clutter you can hop over.
      if (w > 6 && d > 6) {
        const ax = b.x0 + 1.5;
        const az = b.z0 + 1.5;
        this.scene.add(cube(1.4, 0.9, 1.2, mat(0xaab4bb), ax + 0.7, b.h + 0.75, az + 0.6));
        this.col.add(box(ax, b.h + 0.3, az, ax + 1.4, b.h + 1.2, az + 1.2, true));
      }
    }
    // Plaza fountain
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.4, 0.8, 24), mat(0xc8bba0));
    basin.position.set(PLAZA.x, 0.4, PLAZA.z);
    basin.castShadow = basin.receiveShadow = true;
    this.scene.add(basin);
    const pool = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.1, 24), mat(0x4fb8d8, { rough: 0.1 }));
    pool.position.set(PLAZA.x, 0.78, PLAZA.z);
    this.scene.add(pool);
    this.scene.add(cube(0.8, 2.4, 0.8, mat(0xc8bba0), PLAZA.x, 1.2, PLAZA.z));
    this.solid(box(-2.6, 0, -2.6, 2.6, 0.8, 2.6, false));
    this.solid(box(-0.4, 0, -0.4, 0.4, 2.4, 0.4, true));
    // Welcome sign
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.6), new THREE.MeshStandardMaterial({ map: textTexture(["Welcome to", "PORT CODESHIP"], { h: 200, font: 52 }) }));
    sign.position.set(0, 3.2, -14.6);
    this.scene.add(sign);
    this.scene.add(cube(0.2, 2.6, 0.2, mat(0x5b4636), -2.2, 1.3, -14.7), cube(0.2, 2.6, 0.2, mat(0x5b4636), 2.2, 1.3, -14.7));
    // Trees and palms
    for (const t of trees()) {
      const g = t.s < 0 ? makePalm() : makeTree(t.s);
      g.position.set(t.x, 0, t.z);
      g.rotation.y = t.x * 1.7;
      g.traverse((o) => ((o as THREE.Mesh).castShadow = true));
      this.scene.add(g);
      this.col.add(box(t.x - 0.25, 0, t.z - 0.25, t.x + 0.25, 4, t.z + 0.25, t.s >= 0));
    }
    // Lamp posts along Main Street
    for (let x = -110; x <= 110; x += 20) {
      if (Math.abs(x) < 18) continue;
      for (const z of [-5.2, 5.2]) {
        this.scene.add(cube(0.16, 4, 0.16, mat(0x2c3e50), x, 2, z));
        this.scene.add(cube(0.5, 0.25, 0.5, mat(0xfff3c4, { emissive: 0x6d5a1e }), x, 4.1, z));
      }
    }
    // Park benches
    for (let i = 0; i < 4; i++) this.scene.add(cube(1.8, 0.45, 0.6, mat(0x8a5a36), PARK.x0 + 6 + i * 9, 0.45, PARK.z1 - 2));
    // Collectible bits
    const bitGeo = new THREE.OctahedronGeometry(0.35);
    const bitMat = mat(0x39d0f0, { emissive: 0x1a8fb0, rough: 0.2 });
    for (const s of bitSpots(this.buildings)) {
      const mesh = new THREE.Mesh(bitGeo, bitMat);
      mesh.position.set(s.x, s.y, s.z);
      this.scene.add(mesh);
      this.bits.push({ id: s.id, mesh, x: s.x, y: s.y, z: s.z });
    }
  }

  private buildPlot() {
    // Fence posts (decor) around the plot with a gap on the west side.
    const post = mat(0xe8dcc0);
    for (let i = 0; i <= PLOT.w; i += 2) {
      this.scene.add(cube(0.15, 0.8, 0.15, post, PLOT.x - 1 + i + 1, 0.4, PLOT.z - 1));
      this.scene.add(cube(0.15, 0.8, 0.15, post, PLOT.x - 1 + i + 1, 0.4, PLOT.z + PLOT.d + 1));
    }
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(PLOT.w, PLOT.d), new THREE.MeshBasicMaterial({ visible: false }));
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(PLOT.x + PLOT.w / 2, 0.01, PLOT.z + PLOT.d / 2);
    this.plotGround = plane;
    this.scene.add(plane);
    const grid = new THREE.GridHelper(PLOT.w, PLOT.w, 0x6b4a2c, 0x6b4a2c);
    grid.scale.z = PLOT.d / PLOT.w;
    grid.position.set(PLOT.x + PLOT.w / 2, 0.02, PLOT.z + PLOT.d / 2);
    (grid.material as THREE.Material).opacity = 0.35;
    (grid.material as THREE.Material).transparent = true;
    this.scene.add(grid);
    const term = makeTerminal();
    term.position.set(PLOT_TERMINAL.x, 0, PLOT_TERMINAL.z);
    term.rotation.y = -Math.PI / 2;
    this.scene.add(term);
    this.interactables.push({ id: "term:home", x: PLOT_TERMINAL.x, y: 0, z: PLOT_TERMINAL.z, r: 2.2 });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(3, 1), new THREE.MeshStandardMaterial({ map: textTexture(["Your plot"], { h: 170, font: 60 }) }));
    sign.position.set(PLOT.x + PLOT.w / 2, 2.6, PLOT.z - 1.3);
    sign.rotation.y = Math.PI;
    this.scene.add(sign);
    this.scene.add(cube(0.15, 2.2, 0.15, post, PLOT.x + PLOT.w / 2, 1.1, PLOT.z - 1.25));
  }

  private buildMarket() {
    const { x0, z0, x1, z1 } = MARKET;
    const wall = mat(0xe9dcc4);
    const H = 7.5;
    // Back and side walls, open front with pillars.
    this.scene.add(cube(x1 - x0, H, 0.5, wall, (x0 + x1) / 2, H / 2, z1, false));
    this.solid(box(x0, 0, z1 - 0.25, x1, H, z1 + 0.25));
    for (const x of [x0, x1]) {
      this.scene.add(cube(0.5, H, z1 - z0, wall, x, H / 2, (z0 + z1) / 2, false));
      this.solid(box(x - 0.25, 0, z0, x + 0.25, H, z1));
    }
    for (const x of [x0 + 0.4, -49 - 6, -49 + 6, x1 - 0.4]) {
      this.scene.add(cube(0.6, H, 0.6, mat(0xc0392b), x, H / 2, z0));
      this.solid(box(x - 0.3, 0, z0 - 0.3, x + 0.3, H, z0 + 0.3));
    }
    // The roof and walls don't cast shadows, so the shop floor stays bright.
    const roof = cube(x1 - x0 + 1.2, 0.5, z1 - z0 + 1.2, mat(0x7a5c4d), (x0 + x1) / 2, H + 0.25, (z0 + z1) / 2, false);
    this.scene.add(roof);
    this.solid(box(x0 - 0.6, H, z0 - 0.6, x1 + 0.6, H + 0.5, z1 + 0.6), roof);
    // Awning stripes and sign
    for (let i = 0; i < 10; i++) this.scene.add(cube((x1 - x0) / 10, 0.15, 1.6, mat(i % 2 ? 0xffffff : 0xc0392b), x0 + (i + 0.5) * ((x1 - x0) / 10), H - 0.6, z0 - 0.7));
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.6), new THREE.MeshStandardMaterial({ map: textTexture([], { title: "FRESH MARKET", w: 1024, h: 180, font: 120 }) }));
    sign.position.set((x0 + x1) / 2, H + 1.3, z0 - 0.3);
    sign.rotation.y = Math.PI;
    this.scene.add(sign);
    this.scene.add(cube(9.2, 1.8, 0.2, mat(0x0d1b2a), (x0 + x1) / 2, H + 1.3, z0 - 0.15));

    // Shelf units: one per aisle, facing north, four levels.
    const shelfMat = mat(0xd9d4c8);
    AISLE_X.forEach((ax, ai) => {
      const zf = SHELF_Z;
      this.scene.add(cube(SHELF_W, SHELF_H, 0.15, shelfMat, ax, SHELF_H / 2, zf + SHELF_DEPTH));
      for (const sx of [-SHELF_W / 2, SHELF_W / 2]) this.scene.add(cube(0.12, SHELF_H, SHELF_DEPTH, shelfMat, ax + sx, SHELF_H / 2, zf + SHELF_DEPTH / 2));
      for (let lv = 0; lv < 4; lv++) {
        // Plank height; level 1 is raised a little so its label fits underneath.
        const y = lv * 1.0 + 0.32;
        this.scene.add(cube(SHELF_W, 0.08, SHELF_DEPTH, shelfMat, ax, y, zf + SHELF_DEPTH / 2));
        const product = AISLES[ai][lv];
        const pm = mat(PRODUCT_COLORS[product] ?? 0xffffff, { rough: 0.6 });
        for (let k = 0; k < 6; k++) this.scene.add(cube(0.55, 0.6, 0.5, pm, ax - SHELF_W / 2 + 0.5 + k * 0.8, y + 0.34, zf + 0.45, false));
        // Shelf label on the front edge, centred under its products.
        const label = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.3), new THREE.MeshBasicMaterial({ map: textTexture([`Shelf ${lv + 1}: ${product}`], { w: 512, h: 70, font: 44, bg: "#ffffff", fg: "#0d1b2a" }) }));
        label.position.set(ax, y - 0.2, zf - 0.02);
        label.rotation.y = Math.PI;
        this.scene.add(label);
      }
      this.scene.add(cube(SHELF_W, 0.1, SHELF_DEPTH, shelfMat, ax, SHELF_H, zf + SHELF_DEPTH / 2));
      this.solid(box(ax - SHELF_W / 2, 0, zf, ax + SHELF_W / 2, SHELF_H, zf + SHELF_DEPTH, true, `shelf:${ai + 1}`));
      // Top line is the top shelf, so the sign reads in the same order as the shelves.
      const lines = AISLES[ai].map((p, i) => `Shelf ${i + 1}:  ${p}`).reverse();
      const board = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.2), new THREE.MeshStandardMaterial({ map: textTexture(lines, { title: `AISLE ${ai + 1}`, w: 512, h: 352, font: 52, align: "left" }) }));
      board.position.set(ax, SHELF_H + 1.35, zf - 0.02);
      board.rotation.y = Math.PI;
      this.scene.add(board);
      this.scene.add(cube(3.3, 2.3, 0.08, mat(0x0d1b2a), ax, SHELF_H + 1.35, zf + 0.03));
      this.interactables.push({ id: `shelf:${ai + 1}`, x: ax, y: 0, z: zf - 0.4, r: SHELF_W / 2 + 0.6 });
    });
    // Ladder rail
    this.scene.add(cube(AISLE_X[3] - COUNTER.x + 8, 0.08, 0.2, mat(0x7f8c8d, { metal: 0.6, rough: 0.4 }), (AISLE_X[0] + AISLE_X[3]) / 2, 0.04, LADDER_Z));
    // Counter
    this.scene.add(cube(3, 1.1, 1, mat(0x8e6e4e), COUNTER.x, 0.55, COUNTER.z));
    this.solid(box(COUNTER.x - 1.5, 0, COUNTER.z - 0.5, COUNTER.x + 1.5, 1.1, COUNTER.z + 0.5, false));
    const term = makeTerminal();
    term.position.set(MARKET_TERMINAL.x, 0, MARKET_TERMINAL.z);
    term.rotation.y = Math.PI;
    this.scene.add(term);
    this.interactables.push({ id: "term:market", x: MARKET_TERMINAL.x, y: 0, z: MARKET_TERMINAL.z, r: 2.2 });
  }

  private buildBeach() {
    const { x0, z0, x1, z1 } = BOARDWALK;
    const plank = cube(x1 - x0, 0.3, z1 - z0, mat(0xa0744a), (x0 + x1) / 2, 0.15, (z0 + z1) / 2);
    this.scene.add(plank);
    this.col.add(box(x0, 0, z0, x1, 0.3, z1, false));
    const binColor: Record<BinName, number> = { recycling: 0x2f80ed, compost: 0x27ae60, garbage: 0x5d6d7e };
    for (const [name, p] of Object.entries(BIN_POS) as [BinName, { x: number; z: number }][]) {
      const x = BEACH_ORIGIN.x + p.x;
      const z = BEACH_ORIGIN.z + p.z - 1.6;
      this.scene.add(cube(1.4, 1.2, 1.1, mat(binColor[name]), x, 0.6 + 0.3, z));
      const lbl = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.35), new THREE.MeshBasicMaterial({ map: textTexture([name.toUpperCase()], { w: 256, h: 64, font: 34, bg: "#ffffff", fg: "#0d1b2a" }) }));
      lbl.position.set(x, 1.1, z + 0.56);
      this.scene.add(lbl);
      this.col.add(box(x - 0.7, 0.3, z - 0.55, x + 0.7, 1.5, z + 0.55, false));
      this.interactables.push({ id: `bin:${name}`, x, y: 0, z: z + 0.6, r: 1.6 });
    }
    // Lifeguard stand
    const lx = LIFEGUARD.x;
    const lz = LIFEGUARD.z;
    for (const [dx, dz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]) {
      this.scene.add(cube(0.2, 3, 0.2, mat(0xffffff), lx + dx, 1.5, lz + dz));
      this.col.add(box(lx + dx - 0.1, 0, lz + dz - 0.1, lx + dx + 0.1, 3, lz + dz + 0.1, true));
    }
    const deck = cube(2.6, 0.25, 2.6, mat(0xd35400), lx, 3.1, lz);
    this.scene.add(deck);
    this.solid(box(lx - 1.3, 2.95, lz - 1.3, lx + 1.3, 3.25, lz + 1.3, true));
    this.scene.add(cube(2.8, 0.15, 2.8, mat(0xe74c3c), lx, 4.9, lz));
    const term = makeTerminal();
    term.position.set(BEACH_TERMINAL.x, 0.3, BEACH_TERMINAL.z);
    this.scene.add(term);
    this.interactables.push({ id: "term:beach", x: BEACH_TERMINAL.x, y: 0, z: BEACH_TERMINAL.z, r: 2.2 });
    // Umbrellas
    [-36, -20, 36, 48].forEach((x, i) => {
      this.scene.add(cube(0.1, 2.4, 0.1, mat(0xffffff), x, 1.2, 84 + (i % 2) * 6));
      const top = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.6, 8), mat(i % 2 ? 0xf39c12 : 0x16a085));
      top.position.set(x, 2.5, 84 + (i % 2) * 6);
      top.castShadow = true;
      this.scene.add(top);
    });
  }

  private buildLookouts() {
    for (const l of LOOKOUTS) {
      const stripes = document.createElement("canvas");
      stripes.width = 64;
      stripes.height = 128;
      const g = stripes.getContext("2d")!;
      g.fillStyle = "#" + l.color.toString(16).padStart(6, "0");
      g.fillRect(0, 0, 64, 128);
      g.fillStyle = l.id === "clock" ? "rgba(90,60,40,0.35)" : l.id === "lighthouse" ? "#c0392b" : "#ffffff";
      if (l.id === "clock") for (let y = 0; y < 128; y += 16) g.fillRect(0, y, 64, 2);
      else g.fillRect(0, 0, 64, 40);
      // Hand-holds: little ledges every metre make the climb readable.
      g.fillStyle = "rgba(0,0,0,0.18)";
      for (let y = 8; y < 128; y += 16) g.fillRect(6, y, 52, 3);
      const t = new THREE.CanvasTexture(stripes);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.8 });
      const geo = tiledBox(l.w, l.h, l.w, 8);
      const tower = new THREE.Mesh(geo, m);
      tower.position.set(l.x, l.h / 2, l.z);
      tower.castShadow = tower.receiveShadow = true;
      this.scene.add(tower);
      this.solid(box(l.x - l.w / 2, 0, l.z - l.w / 2, l.x + l.w / 2, l.h, l.z + l.w / 2, true, `lookout:${l.id}`), tower);
      this.scene.add(cube(l.w + 1, 0.4, l.w + 1, mat(0x34495e), l.x, l.h + 0.2, l.z));
      this.col.add(box(l.x - l.w / 2 - 0.5, l.h, l.z - l.w / 2 - 0.5, l.x + l.w / 2 + 0.5, l.h + 0.4, l.z + l.w / 2 + 0.5, true));
      const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 1.2, 10), new THREE.MeshStandardMaterial({ color: 0x555555, emissive: 0x000000 }));
      beacon.position.set(l.x, l.h + 1, l.z);
      this.scene.add(beacon);
      this.beacons.set(l.id, beacon);
      this.interactables.push({ id: `lookout:${l.id}`, x: l.x, y: l.h + 0.4, z: l.z, r: l.w / 2 + 1.2 });
      if (l.id === "clock") {
        const face = new THREE.Mesh(new THREE.CircleGeometry(1.8, 24), mat(0xfaf3e0));
        face.position.set(l.x, l.h - 4, l.z + l.w / 2 + 0.02);
        this.scene.add(face);
        this.scene.add(cube(0.15, 1.3, 0.05, mat(0x222222), l.x, l.h - 3.5, l.z + l.w / 2 + 0.06, false));
      }
    }
  }

  private buildPeople() {
    for (const [id, n] of Object.entries(NPCS) as [NpcId, (typeof NPCS)[NpcId]][]) {
      const av = makeAvatar({ shirt: n.shirt, skin: n.skin, hair: n.hair, cap: id === "kofi" ? 0xe74c3c : id === "ada" ? 0x0d1b2a : undefined });
      av.root.position.set(n.x, groundHeight(n.x, n.z) + (id === "kofi" ? 0 : 0), n.z);
      av.root.rotation.y = 0;
      if (id === "ada") av.root.rotation.y = Math.PI * 0.85;
      if (id === "rosa") av.root.rotation.y = Math.PI / 2;
      this.scene.add(av.root);
      const alert = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.55, 0.18), mat(0xf5c33d, { emissive: 0xa77800 }));
      alert.position.y = 2.5;
      alert.visible = false;
      av.root.add(alert);
      this.npcs.set(id, { av, alert });
      this.interactables.push({ id: `npc:${id}`, x: n.x, y: 0, z: n.z, r: 3 });
      this.col.add(box(n.x - 0.3, 0, n.z - 0.3, n.x + 0.3, 1.8, n.z + 0.3, false));
    }
    const looks = [
      { shirt: 0x8e44ad, skin: 0xf1c27d, hair: 0x3b2314 },
      { shirt: 0x16a085, skin: 0x8d5524, hair: 0x111111 },
      { shirt: 0xd35400, skin: 0xe0ac69, hair: 0x6d3b1a },
      { shirt: 0x2980b9, skin: 0xc68642, hair: 0x222222 },
      { shirt: 0xf1c40f, skin: 0xffdbac, hair: 0xb55239 },
      { shirt: 0x34495e, skin: 0x5a3825, hair: 0x111111 },
    ];
    const loops = [
      [
        { x: -100, z: 5.5 },
        { x: 100, z: 5.5 },
      ],
      [
        { x: 90, z: -5.5 },
        { x: -90, z: -5.5 },
      ],
      [
        { x: 5.5, z: -100 },
        { x: 5.5, z: 50 },
      ],
      [
        { x: -66, z: -110 },
        { x: -66, z: 50 },
      ],
      [
        { x: -50, z: 61 },
        { x: 50, z: 61 },
      ],
      [
        { x: 20, z: -12 },
        { x: 55, z: -12 },
        { x: 55, z: -36 },
        { x: 20, z: -36 },
      ],
    ];
    loops.forEach((path, i) => {
      const av = makeAvatar(looks[i]);
      this.scene.add(av.root);
      this.wanderers.push({ av, path, i: 0, t: (i * 0.37) % 1 });
    });
  }

  private paintMap() {
    const c = paintGround(1024, { map: true });
    const g = c.getContext("2d")!;
    const s = 1024 / GROUND_EXTENT.size;
    const P = (x: number, z: number) => [(x - GROUND_EXTENT.x0) * s, (z - GROUND_EXTENT.z0) * s] as const;
    for (const b of this.buildings) {
      const [x, y] = P(b.x0, b.z0);
      g.fillStyle = b.h > 15 ? "#8796a3" : "#a9b6c1";
      g.fillRect(x, y, (b.x1 - b.x0) * s, (b.z1 - b.z0) * s);
    }
    const label = (text: string, x: number, z: number) => {
      const [px, py] = P(x, z);
      g.font = "700 22px system-ui, sans-serif";
      g.textAlign = "center";
      g.lineWidth = 5;
      g.strokeStyle = "rgba(13,27,42,0.8)";
      g.strokeText(text, px, py);
      g.fillStyle = "#ffffff";
      g.fillText(text, px, py);
    };
    const [mx, mz] = P(MARKET.x0, MARKET.z0);
    g.fillStyle = "#c0392b";
    g.fillRect(mx, mz, (MARKET.x1 - MARKET.x0) * s, (MARKET.z1 - MARKET.z0) * s);
    label("Fresh Market", (MARKET.x0 + MARKET.x1) / 2, MARKET.z0 + 13);
    label("Your plot", PLOT.x + PLOT.w / 2, PLOT.z + PLOT.d / 2 + 2);
    label("Town Square", 0, 3);
    label("Beach", 0, 84);
    label("Maple Park", (PARK.x0 + PARK.x1) / 2, (PARK.z0 + PARK.z1) / 2);
    return c;
  }

  // ---------------------------------------------------------------------------
  // Input

  private onKeyDown = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if (!this.enabled) return;
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
    this.keys.add(e.code);
    if (e.code === "KeyE" && !e.repeat) this.pressInteract();
    if (e.code === "KeyB" && !e.repeat) this.toggleBuild();
  };
  private onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.code);
  private onBlur = () => this.keys.clear();

  private unlockedAt = 0;
  private get locked() {
    return typeof document !== "undefined" && document.pointerLockElement === this.canvas;
  }
  /** True right after mouse-look ended: the same Esc press shouldn't also open the menu. */
  justUnlocked() {
    return performance.now() - this.unlockedAt < 400;
  }
  private onLockChange = () => {
    if (!this.locked) this.unlockedAt = performance.now();
    this.hooks.mouseLook(this.locked);
  };
  /** Free the mouse cursor (for menus, the code panel and build mode). */
  releaseMouse() {
    if (this.locked) document.exitPointerLock();
  }

  private onPointerDown = (e: PointerEvent) => {
    if (!this.enabled) return;
    // A mouse click on the world turns on mouse-look, so the view turns while you walk.
    if (e.pointerType === "mouse" && !this.building && !this.locked && e.button === 0) {
      try {
        const r = this.canvas.requestPointerLock() as unknown as Promise<void> | undefined;
        r?.catch?.(() => {});
      } catch {
        /* pointer lock unavailable: drag-to-look still works */
      }
    }
    if (this.locked) return;
    this.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0, button: e.button };
    this.canvas.setPointerCapture(e.pointerId);
  };
  private onPointerMove = (e: PointerEvent) => {
    if (this.locked) {
      if (!this.enabled) return;
      this.camYaw -= e.movementX * 0.0035;
      this.camPitch = Math.max(-0.15, Math.min(1.25, this.camPitch + e.movementY * 0.0028));
      return;
    }
    const r = this.canvas.getBoundingClientRect();
    this.pointerNdc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    if (!this.drag || this.drag.id !== e.pointerId) return;
    const dx = e.clientX - this.drag.x;
    const dy = e.clientY - this.drag.y;
    this.drag.x = e.clientX;
    this.drag.y = e.clientY;
    this.drag.moved += Math.abs(dx) + Math.abs(dy);
    if (this.building && this.drag.button === 0 && this.drag.moved < 6) return;
    this.camYaw -= dx * 0.006;
    this.camPitch = Math.max(-0.15, Math.min(1.25, this.camPitch + dy * 0.004));
  };
  private onPointerUp = (e: PointerEvent) => {
    if (!this.drag || this.drag.id !== e.pointerId) return;
    const click = this.drag.moved < 6;
    const button = this.drag.button;
    this.drag = null;
    if (click && this.building) {
      if (button === 2 || e.shiftKey) this.removeAtGhost();
      else this.placeAtGhost();
    }
  };
  private onWheel = (e: WheelEvent) => {
    if (!this.enabled) return;
    e.preventDefault();
    // Trackpads: swipe sideways to turn the view, up/down (or the wheel) to zoom.
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) this.camYaw -= e.deltaX * 0.004;
    else this.camDist = Math.max(3, Math.min(16, this.camDist + e.deltaY * 0.01));
  };
  private onContext = (e: Event) => e.preventDefault();

  private bindInput() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlur);
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    this.canvas.addEventListener("pointermove", this.onPointerMove);
    this.canvas.addEventListener("pointerup", this.onPointerUp);
    this.canvas.addEventListener("pointercancel", this.onPointerUp);
    this.canvas.addEventListener("wheel", this.onWheel, { passive: false });
    this.canvas.addEventListener("contextmenu", this.onContext);
    window.addEventListener("resize", this.resize);
    document.addEventListener("pointerlockchange", this.onLockChange);
  }

  /** Sprint toggle (on-screen button): run without holding Shift. */
  sprintLock = false;

  setTouch(x: number, y: number) {
    this.touch.x = x;
    this.touch.y = y;
  }
  setTouchButton(b: "jump" | "sprint", down: boolean) {
    this.touch[b] = down;
  }
  pressInteract() {
    if (!this.enabled || !this.focus) return;
    this.hooks.interact(this.focus.id);
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (!on) {
      this.releaseMouse();
      this.keys.clear();
      this.touch = { x: 0, y: 0, jump: false, sprint: false };
    }
  }

  resize = () => {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  setLowGraphics(low: boolean) {
    this.renderer.shadowMap.enabled = !low;
    this.sun.castShadow = !low;
    this.renderer.setPixelRatio(low ? 1 : Math.min(window.devicePixelRatio || 1, 1.75));
    this.scene.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | undefined;
      if (m) m.needsUpdate = true;
    });
    this.resize();
  }

  // ---------------------------------------------------------------------------
  // Main loop

  private loop(now: number) {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.update(dt);
    this.renderer.render(this.scene, this.camera);
  }

  private readInput(): MoveInput {
    const k = this.keys;
    let fwd = (k.has("KeyW") || k.has("ArrowUp") ? 1 : 0) - (k.has("KeyS") || k.has("ArrowDown") ? 1 : 0);
    let side = (k.has("KeyD") || k.has("ArrowRight") ? 1 : 0) - (k.has("KeyA") || k.has("ArrowLeft") ? 1 : 0);
    if (this.touch.x || this.touch.y) {
      fwd = -this.touch.y;
      side = this.touch.x;
    }
    if (!this.enabled || this.cinematic) {
      fwd = 0;
      side = 0;
    }
    const fx = -Math.sin(this.camYaw);
    const fz = -Math.cos(this.camYaw);
    const rx = Math.cos(this.camYaw);
    const rz = -Math.sin(this.camYaw);
    let wx = fx * fwd + rx * side;
    let wz = fz * fwd + rz * side;
    const len = Math.hypot(wx, wz);
    if (len > 1) {
      wx /= len;
      wz /= len;
    }
    // While climbing, "forward" means "up the wall" whichever way the camera faces.
    const climbing = this.player.mode === "climb";
    const mag = Math.min(1, Math.hypot(fwd, side));
    return {
      wx,
      wz,
      fwd: climbing ? fwd : len > 0.1 ? mag : 0,
      side: climbing ? side : 0,
      jump: this.enabled && !this.cinematic && (k.has("Space") || this.touch.jump),
      sprint: this.sprintLock || k.has("ShiftLeft") || k.has("ShiftRight") || this.touch.sprint,
    };
  }

  private update(dt: number) {
    const sdt = dt * this.timeScale;
    for (const tw of [...this.tweens]) {
      tw.t += sdt;
      const k = Math.min(1, tw.t / tw.dur);
      tw.fn(k);
      if (k >= 1) {
        this.tweens.splice(this.tweens.indexOf(tw), 1);
        tw.done();
      }
    }

    const p = this.player;
    p.update(dt, this.readInput());
    const av = this.avatar;
    av.root.position.set(p.x, p.y, p.z);
    av.root.rotation.y = p.yaw;
    animateAvatar(av, dt, p.speed, p.mode === "walk" ? "walk" : p.mode, p.mode === "walk" && !p.onGround && p.vy > -2 && p.y > 0.3);

    // NPCs face the player when close
    for (const [, n] of this.npcs) {
      const r = n.av.root;
      const d = Math.hypot(p.x - r.position.x, p.z - r.position.z);
      if (d < 5) {
        const want = Math.atan2(p.x - r.position.x, p.z - r.position.z);
        let diff = want - r.rotation.y;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        r.rotation.y += diff * Math.min(1, dt * 5);
      }
      animateAvatar(n.av, dt, 0, "idle");
      n.alert.rotation.y += dt * 2;
      n.alert.position.y = 2.5 + Math.sin(performance.now() / 300) * 0.08;
    }
    for (const w of this.wanderers) {
      const a = w.path[w.i];
      const b = w.path[(w.i + 1) % w.path.length];
      const len = Math.hypot(b.x - a.x, b.z - a.z);
      w.t += (dt * 1.6) / len;
      if (w.t >= 1) {
        w.t = 0;
        w.i = (w.i + 1) % w.path.length;
      }
      w.av.root.position.set(a.x + (b.x - a.x) * w.t, 0, a.z + (b.z - a.z) * w.t);
      w.av.root.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
      animateAvatar(w.av, dt, 1.6, "walk");
    }

    // Bits
    const t = performance.now() / 1000;
    for (const b of this.bits) {
      if (this.collected.has(b.id)) continue;
      b.mesh.rotation.y = t * 2;
      b.mesh.position.y = b.y + Math.sin(t * 3 + b.id) * 0.12;
      if (Math.abs(p.x - b.x) < 1.1 && Math.abs(p.z - b.z) < 1.1 && Math.abs(p.y + 0.9 - b.y) < 1.4) {
        this.collected.add(b.id);
        b.mesh.visible = false;
        this.hooks.bits([...this.collected]);
      }
    }
    // Builder bot rotors
    this.builder.children.forEach((c) => c.name === "rotor" && (c.rotation.y += dt * 30));
    if (this.markerPos) {
      this.marker.visible = true;
      this.marker.position.set(this.markerPos.x, this.markerPos.y + 3 + Math.sin(t * 2.5) * 0.25, this.markerPos.z);
      this.marker.rotation.y = t * 1.5;
    } else this.marker.visible = false;
    for (const [id, beacon] of this.beacons) {
      if (this.lit.has(id)) (beacon.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.2 + Math.sin(t * 4) * 0.3;
    }

    this.updateFocus();
    if (this.building) this.updateGhost();
    this.updateCamera(dt);

    // Shadows follow the player.
    this.sun.position.set(p.x + 60, 90, p.z + 40);
    this.sun.target.position.set(p.x, 0, p.z);
  }

  private updateCamera(dt: number) {
    if (this.cinematic) {
      if (!this.cinematic(dt)) this.cinematic = null;
      return;
    }
    const p = this.player;
    const target = new THREE.Vector3(p.x, p.y + 1.6, p.z);
    this.camTarget.lerp(target, 1 - Math.exp(-dt * 14));
    if (this.camTarget.distanceTo(target) > 8) this.camTarget.copy(target);
    const cp = Math.cos(this.camPitch);
    const dir = new THREE.Vector3(Math.sin(this.camYaw) * cp, Math.sin(this.camPitch), Math.cos(this.camYaw) * cp);
    // Keep the camera out of walls: test the line from the player's head to
    // the camera against every solid box (buildings, walls, shelves, blocks…),
    // padded so the lens never touches a surface.
    const want = this.camDist;
    const hitAt = this.cameraHit(this.camTarget, dir, want, 0.35);
    const blocked = Math.max(0.9, hitAt - 0.15);
    // Pull in instantly when something is in the way; ease back out after,
    // so the view doesn't jump back and forth along a wall.
    if (blocked < this.camCur) this.camCur = blocked;
    else this.camCur += (Math.min(blocked, want) - this.camCur) * (1 - Math.exp(-dt * 5));
    const pos = this.camTarget.clone().addScaledVector(dir, this.camCur);
    const g = groundHeight(pos.x, pos.z);
    if (pos.y < Math.max(g, WATER_Y) + 0.4) pos.y = Math.max(g, WATER_Y) + 0.4;
    this.camera.position.copy(pos);
    this.camera.lookAt(this.camTarget);
  }

  private camCur = 7;

  /** Distance along a ray to the nearest solid box (grown by `pad`), up to `max`. */
  private cameraHit(o: THREE.Vector3, d: THREE.Vector3, max: number, pad: number) {
    const ex = o.x + d.x * max;
    const ez = o.z + d.z * max;
    const boxes = this.col.query(Math.min(o.x, ex) - 1, Math.min(o.z, ez) - 1, Math.max(o.x, ex) + 1, Math.max(o.z, ez) + 1);
    let best = max;
    for (const b of boxes) {
      const lo = [b.minX - pad, b.minY - pad, b.minZ - pad];
      const hi = [b.maxX + pad, b.maxY + pad, b.maxZ + pad];
      const org = [o.x, o.y, o.z];
      // Ignore a box the player's head is already inside (e.g. hugging a wall).
      if (org.every((v, i) => v > lo[i] && v < hi[i])) continue;
      const dv = [d.x, d.y, d.z];
      let t0 = 0;
      let t1 = best;
      let ok = true;
      for (let i = 0; i < 3 && ok; i++) {
        if (Math.abs(dv[i]) < 1e-6) {
          if (org[i] < lo[i] || org[i] > hi[i]) ok = false;
          continue;
        }
        let a = (lo[i] - org[i]) / dv[i];
        let c = (hi[i] - org[i]) / dv[i];
        if (a > c) [a, c] = [c, a];
        t0 = Math.max(t0, a);
        t1 = Math.min(t1, c);
        if (t0 > t1) ok = false;
      }
      if (ok && t0 < best) best = t0;
    }
    return best;
  }

  private updateFocus() {
    if (!this.enabled || this.cinematic) {
      if (this.focus) {
        this.focus = null;
        this.hooks.focus(null);
      }
      return;
    }
    const p = this.player;
    let best: Focus = null;
    let bestD = Infinity;
    const consider = (id: string, x: number, y: number, z: number, r: number) => {
      const d = Math.hypot(p.x - x, p.z - z);
      if (d > r || Math.abs(p.y - y) > 2.2) return;
      if (d >= bestD) return;
      const label = this.hooks.label(id);
      if (!label) return;
      best = { id, label };
      bestD = d;
    };
    for (const it of this.interactables) {
      if (it.id.startsWith("shelf:")) {
        // Reach the shelf level at hand height (climb to reach higher ones).
        if (p.z > SHELF_Z + 0.2 || p.z < SHELF_Z - 1.6 || Math.abs(p.x - it.x) > SHELF_W / 2) continue;
        const level = Math.max(1, Math.min(4, 1 + Math.floor((p.y + 0.35) / 1.0)));
        consider(`grab:${it.id.slice(6)}:${level}`, p.x, p.y, p.z, 1);
        continue;
      }
      consider(it.id, it.x, it.y, it.z, it.r);
    }
    for (const [id, { l }] of this.litter) consider(`litter:${id}`, BEACH_ORIGIN.x + l.x, 0, BEACH_ORIGIN.z + l.z, 1.6);
    const f = best as Focus;
    if (f?.id !== this.focus?.id || f?.label !== this.focus?.label) {
      this.focus = f;
      this.hooks.focus(f);
    }
  }

  // ---------------------------------------------------------------------------
  // Commands from the React shell

  setMarker(pos: { x: number; y?: number; z: number } | null) {
    this.markerPos = pos ? new THREE.Vector3(pos.x, pos.y ?? 0, pos.z) : null;
  }

  setNpcAlert(id: NpcId, on: boolean) {
    const n = this.npcs.get(id);
    if (n) n.alert.visible = on;
  }

  setLook(look: Look) {
    const pos = this.avatar.root.position.clone();
    this.scene.remove(this.avatar.root);
    this.avatar = makeAvatar({ ...look, pants: 0x34495e });
    this.avatar.root.position.copy(pos);
    this.scene.add(this.avatar.root);
    if (this.carry) this.avatar.hand.add(this.carry);
  }

  setCarry(item: { kind: "litter" | "product"; name: string } | null) {
    if (this.carry) this.carry.parent?.remove(this.carry);
    this.carry = null;
    if (!item) return;
    const obj = item.kind === "litter" ? makeLitter(item.name) : cube(0.5, 0.55, 0.4, mat(PRODUCT_COLORS[item.name] ?? 0xffffff));
    obj.position.set(0, 0, 0.05);
    this.carry = obj;
    this.avatar.hand.add(obj);
  }

  load(save: Partial<EngineSave>) {
    if (typeof save.x === "number" && typeof save.z === "number") {
      this.player.x = save.x;
      this.player.y = save.y ?? 0;
      this.player.z = save.z;
      this.player.yaw = save.yaw ?? 0;
      this.camYaw = (save.yaw ?? 0) + Math.PI;
    }
    for (const id of save.bits ?? []) {
      this.collected.add(id);
      const b = this.bits.find((q) => q.id === id);
      if (b) b.mesh.visible = false;
    }
    for (const id of save.lit ?? []) this.lightBeacon(id);
    this.camTarget.set(this.player.x, this.player.y + 1.6, this.player.z);
  }

  getSave(): EngineSave {
    const p = this.player;
    // Don't save mid-climb or mid-air: drop back to safe ground on load.
    const safe = p.mode === "walk" && p.onGround;
    return { x: safe ? p.x : SPAWN.x, y: safe ? p.y : 0, z: safe ? p.z : SPAWN.z, yaw: p.yaw, bits: [...this.collected], lit: [...this.lit] };
  }

  /** Test helper: move the player (used by the automated playthrough). */
  teleport(x: number, z: number, y = 0, yaw = this.player.yaw) {
    this.player.x = x;
    this.player.z = z;
    this.player.y = y;
    this.player.vx = this.player.vy = this.player.vz = 0;
    this.player.mode = "walk";
    this.player.yaw = yaw;
    this.camYaw = yaw + Math.PI;
    this.camTarget.set(x, y + 1.6, z);
  }

  get totalBits() {
    return this.bits.length;
  }

  playerPos() {
    return { x: this.player.x, y: this.player.y, z: this.player.z };
  }

  /** A slow sweep around the town for the title screen. */
  attract() {
    let a = 0;
    this.cinematic = (dt) => {
      a += dt * 0.06;
      this.camera.position.set(Math.sin(a) * 120, 60, Math.cos(a) * 120 + 10);
      this.camera.lookAt(0, 0, 10);
      return !this.enabled;
    };
  }

  private lightBeacon(id: string) {
    this.lit.add(id);
    const b = this.beacons.get(id);
    if (b) {
      const m = b.material as THREE.MeshStandardMaterial;
      m.color.set(0xffd166);
      m.emissive.set(0xff9f1c);
    }
  }

  /** Light a lookout and sweep the camera around the view. */
  lightLookout(id: string): Promise<void> {
    this.lightBeacon(id);
    const l = LOOKOUTS.find((q) => q.id === id)!;
    let a = this.camYaw;
    let t = 0;
    return new Promise((resolve) => {
      this.cinematic = (dt) => {
        t += dt;
        a += dt * 0.9;
        const r = 38;
        this.camera.position.set(l.x + Math.sin(a) * r, l.h + 14, l.z + Math.cos(a) * r);
        this.camera.lookAt(l.x, l.h * 0.6, l.z);
        if (t > 4.2) {
          resolve();
          return false;
        }
        return true;
      };
    });
  }

  /** Point the camera at a mission while its bot works. */
  watch(where: "home" | "market" | "beach" | null) {
    if (!where) {
      this.cinematic = null;
      return;
    }
    const spots = {
      home: { tx: PLOT.x + 6, tz: PLOT.z + 5, cx: PLOT.x - 6, cy: 13, cz: PLOT.z + 18 },
      market: { tx: -49, tz: 19, cx: -49, cy: 7, cz: 5 },
      beach: { tx: 0, tz: 76, cx: 0, cy: 17, cz: 52 },
    } as const;
    const s = spots[where];
    const from = this.camera.position.clone();
    let k = 0;
    this.cinematic = (dt) => {
      k = Math.min(1, k + dt * 1.2);
      const e = ease(k);
      const follow = where === "beach" ? this.beachBot.position : where === "market" ? this.ladder.position : null;
      const tx = follow ? s.tx * 0.5 + follow.x * 0.5 : s.tx;
      this.camera.position.set(from.x + (s.cx - from.x) * e + (follow ? (follow.x - s.tx) * 0.4 : 0), from.y + (s.cy - from.y) * e, from.z + (s.cz - from.z) * e);
      this.camera.lookAt(tx, 1.5, s.tz);
      return true;
    };
  }

  private tween(dur: number, fn: (k: number) => void): Promise<void> {
    return new Promise((done) => this.tweens.push({ t: 0, dur: Math.max(0.001, dur), fn, done }));
  }

  // ---------------------------------------------------------------------------
  // Home plot: blocks, hand-building, Builder Bot

  private blockWorld(x: number, y: number, z: number) {
    return new THREE.Vector3(PLOT.x + x + 0.5, y + 0.5, PLOT.z + z + 0.5);
  }

  private addBlock(b: Block) {
    const k = plotKey(b.x, b.y, b.z);
    if (this.blocks.has(k)) return null;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), BLOCK_MATS[b.c] ?? BLOCK_MATS.brick);
    mesh.position.copy(this.blockWorld(b.x, b.y, b.z));
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.userData.cell = { x: b.x, y: b.y, z: b.z };
    this.scene.add(mesh);
    const bx = box(PLOT.x + b.x, b.y, PLOT.z + b.z, PLOT.x + b.x + 1, b.y + 1, PLOT.z + b.z + 1, true, "block");
    this.col.add(bx);
    this.blocks.set(k, { b, mesh, box: bx });
    return mesh;
  }

  private removeBlock(x: number, y: number, z: number) {
    const k = plotKey(x, y, z);
    const e = this.blocks.get(k);
    if (!e) return false;
    this.scene.remove(e.mesh);
    e.mesh.geometry.dispose();
    this.col.remove(e.box);
    this.blocks.delete(k);
    return true;
  }

  setBlocks(list: Block[]) {
    for (const [, e] of this.blocks) this.removeBlock(e.b.x, e.b.y, e.b.z);
    for (const b of list) this.addBlock(b);
  }

  getBlocks(): Block[] {
    return [...this.blocks.values()].map((e) => e.b);
  }

  private nearPlot() {
    const p = this.player;
    return p.x > PLOT.x - 8 && p.x < PLOT.x + PLOT.w + 8 && p.z > PLOT.z - 8 && p.z < PLOT.z + PLOT.d + 8;
  }

  toggleBuild(force?: boolean) {
    const want = force ?? !this.building;
    if (want && !this.nearPlot()) {
      this.hooks.say("Rosa", "You can only build on your own plot. Head east of the Town Square.", "info");
      return;
    }
    if (want && this.hooks.label("build") === null) return;
    if (want) this.releaseMouse();
    this.building = want;
    this.ghost.visible = false;
    this.hooks.buildMode(want);
  }

  setBuildColor(c: BlockColor) {
    this.buildColor = c;
    (this.ghost.material as THREE.MeshBasicMaterial).color.set(c === "glass" ? 0x9fd8ef : (BLOCK_MATS[c] as THREE.MeshStandardMaterial).color);
  }

  private updateGhost() {
    if (!this.nearPlot()) {
      this.toggleBuild(false);
      return;
    }
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    this.raycaster.far = 60;
    const targets = [...[...this.blocks.values()].map((e) => e.mesh), this.plotGround];
    const hit = this.raycaster.intersectObjects(targets, false)[0];
    this.ghostCell = null;
    this.ghostRemove = null;
    if (!hit) {
      this.ghost.visible = false;
      return;
    }
    let cell: { x: number; y: number; z: number };
    if (hit.object === this.plotGround) {
      cell = { x: Math.floor(hit.point.x - PLOT.x), y: 0, z: Math.floor(hit.point.z - PLOT.z) };
    } else {
      const c = hit.object.userData.cell as { x: number; y: number; z: number };
      this.ghostRemove = plotKey(c.x, c.y, c.z);
      const n = hit.face!.normal;
      cell = { x: c.x + Math.round(n.x), y: c.y + Math.round(n.y), z: c.z + Math.round(n.z) };
    }
    if (this.eraser) {
      // The eraser highlights the block it would remove.
      if (!this.ghostRemove) {
        this.ghost.visible = false;
        return;
      }
      const [rx, ry, rz] = this.ghostRemove.split(",").map(Number);
      this.ghost.visible = true;
      this.ghost.position.copy(this.blockWorld(rx, ry, rz));
      return;
    }
    if (cell.x < 0 || cell.z < 0 || cell.y < 0 || cell.x >= PLOT_W || cell.z >= PLOT_D || cell.y >= PLOT_H) {
      this.ghost.visible = false;
      return;
    }
    // Don't place a block inside the player.
    const w = this.blockWorld(cell.x, cell.y, cell.z);
    const p = this.player;
    const inside = Math.abs(w.x - p.x) < 0.8 && Math.abs(w.z - p.z) < 0.8 && w.y + 0.5 > p.y && w.y - 0.5 < p.y + 1.75;
    this.ghostCell = inside ? null : cell;
    this.ghost.visible = !inside;
    this.ghost.position.copy(w);
  }

  private placeAtGhost() {
    if (this.eraser) return this.removeAtGhost();
    const c = this.ghostCell;
    if (!c) return;
    const b: Block = { ...c, c: this.buildColor };
    const mesh = this.addBlock(b);
    if (mesh) {
      mesh.scale.setScalar(0.2);
      this.tween(0.12, (k) => mesh.scale.setScalar(0.2 + 0.8 * k));
      this.history.push({ kind: "place", b });
      this.hooks.blocksChanged(this.getBlocks());
    }
  }

  private removeAtGhost() {
    if (!this.ghostRemove) return;
    const e = this.blocks.get(this.ghostRemove);
    if (e && this.removeBlock(e.b.x, e.b.y, e.b.z)) {
      this.history.push({ kind: "remove", b: e.b });
      this.hooks.blocksChanged(this.getBlocks());
    }
  }

  // ---- Fixing builds without starting over ----

  /** Hand-building steps that Undo can take back, newest last. */
  private history: { kind: "place" | "remove"; b: Block }[] = [];
  /** Blocks the Builder Bot placed on its last run. */
  private lastRun: Block[] = [];
  private eraser = false;

  /** Eraser on: a click removes the block under the cursor. */
  setEraser(on: boolean) {
    this.eraser = on;
    const m = this.ghost.material as THREE.MeshBasicMaterial;
    if (on) m.color.set(0xff4d4d);
    else this.setBuildColor(this.buildColor);
  }

  get canUndo() {
    return this.history.length > 0;
  }

  get lastRunCount() {
    return this.lastRun.filter((b) => this.blocks.get(plotKey(b.x, b.y, b.z))?.b === b).length;
  }

  /** Takes back the last block you placed or removed by hand. */
  undoBuild() {
    const h = this.history.pop();
    if (!h) return false;
    if (h.kind === "place") this.removeBlock(h.b.x, h.b.y, h.b.z);
    else this.addBlock(h.b);
    this.hooks.blocksChanged(this.getBlocks());
    return true;
  }

  /** Removes only the blocks the Builder Bot placed on its last run. */
  undoLastRun() {
    let n = 0;
    for (const b of this.lastRun) {
      if (this.blocks.get(plotKey(b.x, b.y, b.z))?.b === b && this.removeBlock(b.x, b.y, b.z)) n++;
    }
    this.lastRun = [];
    this.resetBuilder();
    this.hooks.blocksChanged(this.getBlocks());
    return n;
  }

  /** Empties the plot. */
  clearBlocks() {
    this.setBlocks([]);
    this.history = [];
    this.lastRun = [];
    this.resetBuilder();
    this.hooks.blocksChanged([]);
  }

  /** Puts the Ladder Bot back by the counter with an empty basket. */
  resetMarket() {
    if (this.counterItem) this.scene.remove(this.counterItem);
    this.counterItem = null;
    for (const c of [...this.ladderLift.children]) if (c.userData.product) this.ladderLift.remove(c);
    this.ladder.position.x = COUNTER.x;
    this.ladderLift.position.y = 0.4;
  }

  /** Parks the Beach Bot back on the boardwalk. */
  resetBeachBot() {
    this.parkBeachBot();
  }

  private resetBuilder() {
    const w = this.blockWorld(0, 0, 0);
    this.builder.position.set(w.x, 1.0, w.z);
    this.builder.rotation.y = Math.PI / 2;
  }

  async playHome(steps: HomeStep[]) {
    this.resetBuilder();
    this.lastRun = [];
    let cx = 0;
    let cz = 0;
    let cy = 0;
    const bot = this.builder;
    for (const s of steps) {
      if (s.t === "move") {
        const from = bot.position.clone();
        const to = this.blockWorld(s.x, cy, s.z);
        const dist = Math.abs(s.x - cx) + Math.abs(s.z - cz);
        cx = s.x;
        cz = s.z;
        await this.tween(Math.min(0.9, 0.11 * dist + 0.04), (k) => {
          bot.position.x = from.x + (to.x - from.x) * k;
          bot.position.z = from.z + (to.z - from.z) * k;
        });
      } else if (s.t === "turn") {
        const from = bot.rotation.y;
        const target = Math.PI / 2 - (s.dir * Math.PI) / 2;
        let d = target - from;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        await this.tween(0.14, (k) => (bot.rotation.y = from + d * ease(k)));
      } else if (s.t === "lift") {
        const from = bot.position.y;
        cy = s.y;
        await this.tween(0.16, (k) => (bot.position.y = from + (cy + 1 - from) * ease(k)));
      } else if (s.t === "place") {
        const placed: Block = { x: s.x, y: s.y, z: s.z, c: s.c };
        const mesh = this.addBlock(placed);
        if (mesh) {
          this.lastRun.push(placed);
          mesh.scale.setScalar(0.1);
          await this.tween(0.08, (k) => mesh.scale.setScalar(0.1 + 0.9 * k));
        }
      } else if (s.t === "remove") {
        this.removeBlock(s.x, s.y, s.z);
        await this.tween(0.05, () => {});
      } else if (s.t === "say") {
        this.hooks.say("Builder Bot", s.text, "info");
      }
    }
    this.hooks.blocksChanged(this.getBlocks());
    // Fly home
    const from = bot.position.clone();
    const w = this.blockWorld(0, 0, 0);
    await this.tween(0.5, (k) => bot.position.set(from.x + (w.x - 1.5 - from.x) * k, from.y + (1 - from.y) * k, from.z + (w.z - 1.5 - from.z) * k));
  }

  // ---------------------------------------------------------------------------
  // Market: Ladder Bot

  async playMarket(steps: MarketStep[]) {
    const lad = this.ladder;
    const lift = this.ladderLift;
    let held: THREE.Object3D | null = null;
    const slide = async (x: number) => {
      const from = lad.position.x;
      await this.tween(Math.min(1.4, 0.2 + Math.abs(x - from) * 0.09), (k) => (lad.position.x = from + (x - from) * ease(k)));
    };
    const raise = async (lv: number) => {
      const from = lift.position.y;
      const to = lv === 0 ? 0.4 : (lv - 1) * 1.0 + 0.4;
      await this.tween(0.2 + Math.abs(to - from) * 0.12, (k) => (lift.position.y = from + (to - from) * ease(k)));
    };
    for (const s of steps) {
      if (s.t === "customer") this.hooks.say(`Customer ${s.n}`, `I'd like ${s.want}, please!`, "info");
      else if (s.t === "aisle") await slide(AISLE_X[s.aisle - 1]);
      else if (s.t === "raise") await raise(s.level);
      else if (s.t === "pick") {
        held = cube(0.45, 0.5, 0.35, mat(PRODUCT_COLORS[s.product] ?? 0xffffff));
        held.userData.product = true;
        held.position.set(0, 0.3, 0.45);
        this.ladderLift.add(held);
        await this.tween(0.25, (k) => held && (held.position.y = 0.6 - 0.3 * k));
      } else if (s.t === "deliver") {
        await raise(0);
        await slide(COUNTER.x);
        if (held) {
          this.ladderLift.remove(held);
          if (this.counterItem) this.scene.remove(this.counterItem);
          held.position.set(COUNTER.x, 1.35, COUNTER.z);
          this.scene.add(held);
          this.counterItem = held;
          held = null;
        }
        this.hooks.say(`Customer ${s.n}`, s.ok ? `Thank you! That's exactly the ${s.want} I wanted.` : `Hmm, that's ${s.product}. I asked for ${s.want}.`, s.ok ? "good" : "bad");
        await this.tween(0.5, () => {});
      } else if (s.t === "say") this.hooks.say("Ladder Bot", s.text, "info");
    }
    if (held) this.ladderLift.remove(held);
    await raise(0);
    await slide(COUNTER.x);
  }

  // ---------------------------------------------------------------------------
  // Beach: litter and the Beach Bot

  setLitter(list: Litter[]) {
    for (const [, e] of this.litter) this.scene.remove(e.obj);
    this.litter.clear();
    for (const l of list) {
      const obj = makeLitter(l.kind);
      obj.position.set(BEACH_ORIGIN.x + l.x, groundHeight(BEACH_ORIGIN.x + l.x, BEACH_ORIGIN.z + l.z), BEACH_ORIGIN.z + l.z);
      obj.rotation.y = l.id * 2.1;
      this.scene.add(obj);
      this.litter.set(l.id, { l, obj });
    }
  }

  removeLitter(id: number) {
    const e = this.litter.get(id);
    if (e) this.scene.remove(e.obj);
    this.litter.delete(id);
  }

  setBeachBotStyle(style: BeachBotStyle) {
    this.beachStyle = style;
    const pos = this.beachBot.position.clone();
    const rot = this.beachBot.rotation.y;
    this.scene.remove(this.beachBot);
    this.beachBot = makeBeachBot(style);
    this.beachBot.position.copy(pos);
    this.beachBot.rotation.y = rot;
    this.scene.add(this.beachBot);
  }

  private parkBeachBot() {
    this.beachBot.position.set(BEACH_ORIGIN.x + 7, 0, BEACH_ORIGIN.z + 1);
    this.beachBot.rotation.y = 0;
  }

  async playBeach(steps: BeachStep[]) {
    const bot = this.beachBot;
    const grip = bot.getObjectByName("grip")!;
    const arm = bot.getObjectByName("arm")!;
    const speed = this.beachStyle.wheels === "treads" ? 7 : 9;
    let held: THREE.Object3D | null = null;
    const drive = async (x: number, z: number) => {
      const tx = BEACH_ORIGIN.x + x;
      const tz = BEACH_ORIGIN.z + z;
      const from = bot.position.clone();
      const want = Math.atan2(tx - from.x, tz - from.z);
      const r0 = bot.rotation.y;
      let d = want - r0;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      await this.tween(0.15, (k) => (bot.rotation.y = r0 + d * k));
      const dist = Math.hypot(tx - from.x, tz - from.z);
      // Stop just short so the arm reaches the target.
      const stop = Math.max(0, dist - 1.3);
      const ex = from.x + ((tx - from.x) / (dist || 1)) * stop;
      const ez = from.z + ((tz - from.z) / (dist || 1)) * stop;
      await this.tween(Math.max(0.1, stop / speed), (k) => {
        bot.position.x = from.x + (ex - from.x) * k;
        bot.position.z = from.z + (ez - from.z) * k;
        bot.position.y = Math.max(0, groundHeight(bot.position.x, bot.position.z));
      });
    };
    for (const s of steps) {
      if (s.t === "goto") await drive(s.x, s.z);
      else if (s.t === "pick") {
        await this.tween(0.12, (k) => (arm.rotation.x = 0.6 * k));
        const e = this.litter.get(s.id);
        if (e) {
          this.scene.remove(e.obj);
          this.litter.delete(s.id);
        }
        held = makeLitter(s.kind);
        grip.add(held);
        await this.tween(0.12, (k) => (arm.rotation.x = 0.6 * (1 - k)));
      } else if (s.t === "drop") {
        await this.tween(0.15, (k) => (arm.rotation.x = -0.5 * k));
        if (held) grip.remove(held);
        held = null;
        await this.tween(0.1, (k) => (arm.rotation.x = -0.5 * (1 - k)));
        if (!s.ok) this.hooks.say("Beach Bot", `Oops: that went in ${s.bin}.`, "bad");
      } else if (s.t === "say") this.hooks.say("Beach Bot", s.text, "info");
    }
    const from = bot.position.clone();
    await this.tween(0.6, (k) => bot.position.set(from.x + (BEACH_ORIGIN.x + 7 - from.x) * k, 0, from.z + (BEACH_ORIGIN.z + 1 - from.z) * k));
  }

  // ---------------------------------------------------------------------------
  // Map

  drawMap(ctx: CanvasRenderingContext2D, w: number, h: number, mode: "mini" | "full", markers: { x: number; z: number; color: string }[]) {
    const p = this.player;
    const S = 1024 / GROUND_EXTENT.size;
    ctx.save();
    ctx.clearRect(0, 0, w, h);
    let scale: number;
    let ox: number;
    let oz: number;
    if (mode === "mini") {
      scale = 1.6; // px per metre
      ox = p.x - w / 2 / scale;
      oz = p.z - h / 2 / scale;
    } else {
      scale = Math.min(w, h) / GROUND_EXTENT.size;
      ox = GROUND_EXTENT.x0 - (w / scale - GROUND_EXTENT.size) / 2;
      oz = GROUND_EXTENT.z0 - (h / scale - GROUND_EXTENT.size) / 2;
    }
    ctx.fillStyle = "#2f8fb0";
    ctx.fillRect(0, 0, w, h);
    const sx = (ox - GROUND_EXTENT.x0) * S;
    const sz = (oz - GROUND_EXTENT.z0) * S;
    ctx.drawImage(this.mapCanvas, sx, sz, (w / scale) * S, (h / scale) * S, 0, 0, w, h);
    const P = (x: number, z: number) => [(x - ox) * scale, (z - oz) * scale] as const;
    for (const l of LOOKOUTS) {
      const [x, y] = P(l.x, l.z);
      ctx.fillStyle = this.lit.has(l.id) ? "#ffb703" : "#ffffff";
      ctx.strokeStyle = "#0d1b2a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y - 8);
      ctx.lineTo(x + 6, y + 6);
      ctx.lineTo(x - 6, y + 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    for (const m of markers) {
      let [x, y] = P(m.x, m.z);
      if (mode === "mini") {
        // Pin off-screen markers to the edge.
        x = Math.max(8, Math.min(w - 8, x));
        y = Math.max(8, Math.min(h - 8, y));
      }
      ctx.fillStyle = m.color;
      ctx.strokeStyle = "#0d1b2a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    const [px, py] = P(p.x, p.z);
    ctx.translate(px, py);
    ctx.rotate(-p.yaw + Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#e3664f";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(6, 7);
    ctx.lineTo(0, 3);
    ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
    window.removeEventListener("resize", this.resize);
    document.removeEventListener("pointerlockchange", this.onLockChange);
    this.releaseMouse();
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("pointercancel", this.onPointerUp);
    this.canvas.removeEventListener("wheel", this.onWheel);
    this.canvas.removeEventListener("contextmenu", this.onContext);
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
    });
    this.renderer.dispose();
  }
}
