"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import SplitButton from "@/components/ui/SplitButton";
import { useTrialPhase } from "@/components/trial/useTrialPhase";
import { startDates } from "@/lib/booking";
import { IMAGES } from "@/config/images";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Scenes that cycle behind the fixed headline. */
const SCENES = [
  { img: IMAGES.heroRobot, label: "Robotics", tint: "#6E43A8" },
  { img: IMAGES.kidLaptop, label: "JavaScript", tint: "#138A9A" },
  { img: IMAGES.robotsTablet, label: "Coding robots", tint: "#6E43A8" },
  { img: IMAGES.camp, label: "Camps", tint: "#138A9A" },
  { img: IMAGES.girlCoding, label: "Python + AI", tint: "#6E43A8" },
  { img: IMAGES.kidsBuilding, label: "Building", tint: "#138A9A" },
];
const SCENE_MS = 4500;
const INTRO_KEY = "codeship-intro-seen";

const LINES = ["Where kids build", "games, robots", "and AI."];

/**
 * The first-visit loader: the logo on a light screen and a filling bar, then
 * the screen lifts away like a curtain. Shown once per browser session.
 */
function Intro({ armed, onDone }: { armed: boolean; onDone: () => void }) {
  useEffect(() => {
    if (!armed) return;
    const t = window.setTimeout(onDone, 1500);
    return () => window.clearTimeout(t);
  }, [armed, onDone]);
  return (
    <motion.div
      key="intro"
      aria-hidden="true"
      suppressHydrationWarning
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-white"
      exit={{ y: "-100%", transition: { duration: 0.8, ease: EASE } }}
    >
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: EASE }}>
        <Image src="/logo-header.png" alt="" width={742} height={302} priority className="h-24 w-auto sm:h-32" />
      </motion.div>
      <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-[#001532]/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#138A9A] via-[#6E43A8] to-[#F4D734]"
          initial={{ width: "0%" }}
          animate={armed ? { width: "100%" } : undefined}
          transition={{ duration: 1.3, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}

/**
 * Home hero: full-screen photos of kids coding and building cycle behind a
 * headline and button that never move. The site nav sits on top of it.
 */
export default function Hero() {
  const phase = useTrialPhase();
  const trial = phase !== "closed";
  const still = useReducedMotion();
  const [intro, setIntro] = useState<"pending" | "show" | "done">("pending");
  const [i, setI] = useState(0);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(INTRO_KEY) === "1";
    } catch {
      seen = true;
    }
    setIntro(seen || still ? "done" : "show");
  }, [still]);

  useEffect(() => {
    if (still) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % SCENES.length), SCENE_MS);
    return () => window.clearInterval(t);
  }, [still]);

  const ready = intro === "done";
  const scene = SCENES[i];

  return (
    <section className="relative -mt-[76px] flex min-h-[100svh] items-end overflow-hidden bg-[#001532] text-white lg:-mt-24">
      <AnimatePresence>
        {intro !== "done" && (
          <Intro
            armed={intro === "show"}
            onDone={() => {
              try {
                sessionStorage.setItem(INTRO_KEY, "1");
              } catch {
                // Storage blocked: the intro just plays again next visit.
              }
              setIntro("done");
            }}
          />
        )}
      </AnimatePresence>
      {/* Hides the loader before first paint for returning or reduced-motion visitors. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var s=document.currentScript,el=s&&s.previousElementSibling;try{if(sessionStorage.getItem("${INTRO_KEY}")!=="1"&&!matchMedia("(prefers-reduced-motion: reduce)").matches)return}catch(e){}if(el)el.style.display="none"})()`,
        }}
      />

      {/* Cycling scenes */}
      <AnimatePresence initial={false}>
        <motion.div
          key={scene.img.src}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.12 }}
            animate={{ scale: still ? 1.12 : 1 }}
            transition={{ duration: SCENE_MS / 1000 + 1.2, ease: "linear" }}
          >
            <Image src={scene.img.src} alt="" fill priority={i === 0} sizes="100vw" className="object-cover" />
          </motion.div>
          <div className="absolute inset-0 mix-blend-multiply opacity-40" style={{ backgroundColor: scene.tint }} />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-[#001532] via-[#001532]/55 to-[#001532]/40" aria-hidden="true" />

      {/* Fixed message */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-36 sm:pb-20 lg:pb-24">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex flex-wrap items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-white/80"
        >
          <span className="h-2 w-2 rounded-full bg-[#5FD3E0]" aria-hidden="true" />
          Coding · AI · Robotics · K–Grade 8
          {trial && <span className="rounded-full bg-[#6E43A8] px-3 py-1 text-xs tracking-wider text-white">November · 1 free class</span>}
        </motion.p>

        <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
          {LINES.map((line, n) => (
            <span key={line} className="block overflow-hidden pb-1">
              <motion.span
                className="block"
                initial={{ y: "105%" }}
                animate={ready ? { y: "0%" } : undefined}
                transition={{ duration: 0.9, ease: EASE, delay: 0.1 + n * 0.12 }}
              >
                {n === 0 ? (
                  <>
                    Where kids <span className="text-[#5FD3E0]">build</span>
                  </>
                ) : (
                  line
                )}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
          className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <p className="max-w-xl text-lg text-white/85 sm:text-xl">
              Small, friendly classes in Oshawa on Saturdays, or live online after school. Beginners welcome.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <SplitButton href={trial ? "#free-trial" : "#book"} tone="light">
                {trial ? "Book a free class" : "Enroll for January"}
              </SplitButton>
              <a href="/programs/camps/#march-break" className="text-lg font-semibold text-white underline decoration-[#5FD3E0] decoration-2 underline-offset-8 hover:decoration-white">
                March Break camp is open
              </a>
            </div>
            <p className="mt-5 text-sm text-white/60">
              {trial
                ? "Free trial: book by Nov 30, class taken in November."
                : `January starts ${startDates("inperson", "january")} in person, ${startDates("online", "january")} online.`}
            </p>
          </div>

          {/* What's on screen now */}
          <div className="flex items-center gap-4" aria-hidden="true">
            <AnimatePresence mode="wait">
              <motion.p
                key={scene.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="min-w-[8rem] text-right text-sm font-bold uppercase tracking-[0.2em] text-white/80"
              >
                {scene.label}
              </motion.p>
            </AnimatePresence>
            <div className="flex gap-1.5">
              {SCENES.map((s, n) => (
                <span key={s.label} className="relative h-1 w-6 overflow-hidden rounded-full bg-white/25">
                  {n === i && (
                    <motion.span
                      className="absolute inset-y-0 left-0 bg-white"
                      initial={{ width: "0%" }}
                      animate={{ width: still ? "100%" : "100%" }}
                      transition={{ duration: still ? 0 : SCENE_MS / 1000, ease: "linear" }}
                    />
                  )}
                  {n < i && <span className="absolute inset-0 bg-white/70" />}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.a
        href={trial ? "#free-trial" : "#book"}
        aria-label="Scroll down"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-white/70 hover:text-white md:block"
        animate={still ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 40 60" className="h-12 w-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M20 4c8 6 10 16 2 22s-8 18-2 28" />
          <path d="M14 48l6 7 6-7" />
        </svg>
      </motion.a>
    </section>
  );
}
