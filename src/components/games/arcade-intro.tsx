"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import SplitButton from "@/components/ui/SplitButton";

/** Brand colours, used across the arcade. */
export const BRAND = {
  yellow: "#F4D734",
  teal: "#138A9A",
  tealDark: "#0F6F7C",
  purple: "#6E43A8",
  navy: "#001532",
};

/** Game screens that float around the title, with how fast each drifts on scroll. */
const TILES = [
  { src: "/arcade/bus.jpg", cls: "left-[3%] top-[3%] sm:top-[12%] w-28 sm:w-56 -rotate-6", speed: -260, ring: BRAND.yellow },
  { src: "/arcade/rover.jpg", cls: "right-[4%] top-[3%] sm:top-[8%] w-28 sm:w-52 rotate-6", speed: -380, ring: BRAND.purple },
  { src: "/arcade/prompt.jpg", cls: "left-[6%] bottom-[12%] w-36 sm:w-48 rotate-3 hidden sm:block", speed: -180, ring: BRAND.teal },
  { src: "/arcade/studio.jpg", cls: "right-[7%] bottom-[14%] w-40 sm:w-56 -rotate-3 hidden sm:block", speed: -300, ring: BRAND.yellow },
  { src: "/arcade/bot.jpg", cls: "left-[1%] top-[46%] w-32 lg:w-40 rotate-2 hidden lg:block", speed: -440, ring: BRAND.teal },
];

const EMOJI = [
  { e: "🚌", cls: "left-[22%] top-[22%]", speed: -520 },
  { e: "🛰️", cls: "right-[24%] top-[26%]", speed: -620 },
  { e: "🤖", cls: "left-[26%] bottom-[26%]", speed: -420 },
  { e: "📱", cls: "right-[26%] bottom-[30%]", speed: -560 },
  { e: "⭐", cls: "left-[45%] top-[10%]", speed: -700 },
];

function Floater({ speed, progress, className, children }: { speed: number; progress: ReturnType<typeof useSpring>; className: string; children: React.ReactNode }) {
  const y = useTransform(progress, [0, 1], [0, speed]);
  const r = useTransform(progress, [0, 1], [0, speed / 30]);
  return (
    <motion.div style={{ y, rotate: r }} className={`absolute ${className}`}>
      {children}
    </motion.div>
  );
}

/**
 * Arcade intro screen: a full-height title screen with game screens floating
 * around the logo. As you scroll, the tiles drift away at different speeds and
 * the title shrinks into the page. Still for reduced-motion users.
 */
export function ArcadeIntro({ games }: { games: number }) {
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const titleScale = useTransform(progress, [0, 1], [1, still ? 1 : 0.8]);
  const titleY = useTransform(progress, [0, 1], [0, still ? 0 : 140]);
  const fade = useTransform(progress, [0, 0.8], [1, still ? 1 : 0]);
  const hue = useTransform(progress, [0, 1], [0, still ? 0 : 40]);
  const bg = useTransform(hue, (h) => `linear-gradient(160deg, ${BRAND.navy} 0%, ${BRAND.purple} ${55 - h / 2}%, ${BRAND.teal} ${110 - h}%)`);

  return (
    <motion.section
      ref={ref}
      style={{ background: bg }}
      className="relative flex min-h-[calc(100svh-76px)] items-center justify-center overflow-hidden text-white lg:min-h-[calc(100svh-96px)]"
    >
      {/* Glows */}
      <div className="pointer-events-none absolute -left-20 top-1/3 h-80 w-80 rounded-full blur-3xl" style={{ backgroundColor: `${BRAND.yellow}40` }} aria-hidden />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-96 w-96 rounded-full blur-3xl" style={{ backgroundColor: `${BRAND.teal}66` }} aria-hidden />
      {/* Pixel grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        aria-hidden
        style={{ backgroundImage: "linear-gradient(#fff2 1px, transparent 1px), linear-gradient(90deg, #fff2 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      />

      {/* Floating game screens */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {TILES.map((t) => (
          <Floater key={t.src} speed={still ? 0 : t.speed} progress={progress} className={t.cls}>
            <motion.div
              animate={still ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border-4 shadow-2xl"
              style={{ borderColor: t.ring }}
            >
              <Image src={t.src} alt="" fill sizes="224px" className="object-cover" />
            </motion.div>
          </Floater>
        ))}
        {EMOJI.map((m) => (
          <Floater key={m.e} speed={still ? 0 : m.speed} progress={progress} className={`${m.cls} hidden sm:block text-4xl drop-shadow-lg`}>
            {m.e}
          </Floater>
        ))}
      </div>

      {/* Title */}
      <motion.div style={{ scale: titleScale, y: titleY, opacity: fade }} className="relative z-10 px-4 pt-20 pb-10 text-center sm:py-0">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold uppercase tracking-[0.2em]"
          style={{ backgroundColor: BRAND.yellow, color: BRAND.navy }}
        >
          CODEship presents
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          className="mt-6 font-display text-6xl font-extrabold leading-[0.9] drop-shadow-[0_6px_0_rgba(0,0,0,0.25)] sm:text-8xl lg:text-9xl"
        >
          Ship It!{" "}
          <span className="block" style={{ color: BRAND.yellow }}>
            Arcade
          </span>
        </motion.h1>
        <p className="mx-auto mt-6 max-w-lg text-lg text-white/85 sm:text-xl">
          {games} free coding games. Blocks, JavaScript, Python and AI. No sign-up, nothing to install.
        </p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-9 flex justify-center">
          <SplitButton href="#games" tone="light" size="lg">
            ▶ Press start
          </SplitButton>
        </motion.div>
        <motion.p
          animate={still ? undefined : { opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="mt-8 text-sm font-bold uppercase tracking-[0.3em] text-white/70"
        >
          Scroll to choose a game ↓
        </motion.p>
      </motion.div>
    </motion.section>
  );
}
