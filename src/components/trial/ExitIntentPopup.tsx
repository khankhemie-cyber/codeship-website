"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { PROGRAMS } from "@/data/programs";
import { LEVEL_ACCENT } from "@/lib/booking";
import { LevelIcon } from "@/components/ui/Stem";
import { TRIAL_LINKS } from "@/config/trialOffer";
import { trackTrialClick, trackEvent } from "@/lib/analytics";
import { getConsent } from "@/lib/consent";
import { isChildPath } from "@/lib/childPages";
import { useTrialPhase } from "./useTrialPhase";

/**
 * Exit-intent invitation to the November free trial class.
 *
 * Desktop: opens when the pointer leaves through the top of the window.
 * Touch: opens on a quick scroll back up after reading a good part of the page.
 * Shown at most once per visit and not again for a week after it is closed,
 * never after the visitor has booked, never before the cookie choice, and
 * never on child, checkout, legal or school/franchise pages.
 * Add ?exitpopup=1 to any page to preview it.
 */

const SEEN_KEY = "codeship-exit-popup-seen"; // localStorage: last time shown (ms)
const SESSION_KEY = "codeship-exit-popup-session"; // sessionStorage: shown this visit
const BOOKED_KEY = "codeship-trial-booked"; // localStorage: clicked a trial link
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
const ARM_DELAY_MS = 6000; // don't fire on a visitor who leaves within seconds of landing
const EASE = [0.22, 1, 0.36, 1] as const;

const EXCLUDED_PREFIXES = [
  "/success",
  "/trial-booked",
  "/register",
  "/waitlist",
  "/privacy-policy",
  "/terms",
  "/policies",
  "/politiques",
  "/schools",
  "/franchise",
  "/careers",
  "/quizzes",
  "/workbooks",
];

const TRIAL_URLS = new Set(Object.values(TRIAL_LINKS));

function read(storage: "local" | "session", key: string): string | null {
  try {
    return (storage === "local" ? window.localStorage : window.sessionStorage).getItem(key);
  } catch {
    return null;
  }
}

function write(storage: "local" | "session", key: string, value: string) {
  try {
    (storage === "local" ? window.localStorage : window.sessionStorage).setItem(key, value);
  } catch {
    /* storage unavailable: the popup simply may show again */
  }
}

function isSuppressed(pathname: string): boolean {
  if (isChildPath(pathname) || EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  if (read("local", BOOKED_KEY)) return true;
  if (read("session", SESSION_KEY)) return true;
  const seen = Number(read("local", SEEN_KEY));
  return !!seen && Date.now() - seen < SNOOZE_MS;
}

export default function ExitIntentPopup() {
  const pathname = usePathname() ?? "/";
  const phase = useTrialPhase();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const show = useCallback(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    write("session", SESSION_KEY, "1");
    write("local", SEEN_KEY, String(Date.now()));
    setOpen(true);
    trackEvent("exit_popup_view", { page: window.location.pathname });
  }, []);

  const close = useCallback((reason: string) => {
    setOpen(false);
    trackEvent("exit_popup_dismiss", { reason });
    returnFocusRef.current?.focus?.();
  }, []);

  // Remember a booking made anywhere on the site, so we never ask again.
  useEffect(() => {
    if (pathname.startsWith("/trial-booked")) write("local", BOOKED_KEY, "1");
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (a && TRIAL_URLS.has(a.href)) write("local", BOOKED_KEY, "1");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  // Triggers.
  useEffect(() => {
    if (phase !== "open" || open) return;

    if (new URLSearchParams(window.location.search).get("exitpopup") === "1") {
      const t = window.setTimeout(show, 400);
      return () => window.clearTimeout(t);
    }

    if (isSuppressed(pathname)) return;

    let armed = false;
    const armTimer = window.setTimeout(() => (armed = true), ARM_DELAY_MS);
    const ready = () => armed && !!getConsent() && !isSuppressed(pathname);

    // Desktop: pointer leaves through the top edge (towards tabs / address bar).
    const onMouseOut = (e: MouseEvent) => {
      if (e.relatedTarget || e.clientY > 0) return;
      if (ready()) show();
    };

    // Touch: a fast scroll back up once the visitor has read a good part of the page.
    let lastY = window.scrollY;
    let lastT = performance.now();
    let maxDepth = 0;
    const onScroll = () => {
      const y = window.scrollY;
      const t = performance.now();
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0) maxDepth = Math.max(maxDepth, y / scrollable);
      const velocity = (lastY - y) / Math.max(t - lastT, 1); // px/ms, positive = upwards
      if (velocity > 2 && maxDepth > 0.3 && ready()) show();
      lastY = y;
      lastT = t;
    };

    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) window.addEventListener("scroll", onScroll, { passive: true });
    else document.addEventListener("mouseout", onMouseOut);

    return () => {
      window.clearTimeout(armTimer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, [pathname, phase, open, show]);

  // While open: Escape closes, Tab stays inside, page doesn't scroll.
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>("[data-autofocus]")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close("escape");
      if (e.key !== "Tab" || !dialog) return;
      const items = dialog.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open && (
          <motion.div
            key="exit-popup"
            className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Backdrop */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[#001532]/60 backdrop-blur-sm"
              onClick={() => close("backdrop")}
            />

            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="exit-popup-title"
              aria-describedby="exit-popup-desc"
              className="relative w-full sm:max-w-[560px] max-h-[92dvh] overflow-y-auto bg-white shadow-[0_30px_80px_-20px_rgba(0,21,50,0.55)]"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {/* Header band */}
              <div className="relative overflow-hidden bg-[#001532] bg-dotgrid-dark px-5 pt-6 pb-5 sm:px-8 sm:pt-8 sm:pb-6 text-white">
                <div aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#F4D734]/20 blur-3xl" />
                <button
                  type="button"
                  onClick={() => close("close_button")}
                  aria-label="Close"
                  className="absolute right-3 top-3 p-2 text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4D734]"
                >
                  <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
                    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
                <p className="relative text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] sm:tracking-[0.2em] text-[#F4D734]">
                  Before you go · November only
                </p>
                <h2
                  id="exit-popup-title"
                  className="relative font-display text-[24px] sm:text-[34px] font-extrabold leading-[1.1] mt-2 sm:mt-3 pr-6"
                >
                  Let your child try a coding class, free.
                </h2>
                <p id="exit-popup-desc" className="relative mt-2 sm:mt-3 text-[15px] sm:text-base text-white/80">
                  One live class, online or in person in Oshawa. See how your child learns with us before you
                  commit to a semester.
                </p>
              </div>

              {/* Grade picker */}
              <div className="px-5 py-5 sm:px-8 sm:py-6">
                <p className="text-sm font-semibold text-[#001532]">Choose your child&rsquo;s grade to book:</p>
                <ul className="mt-3 grid grid-cols-2 gap-2 sm:gap-2.5">
                  {PROGRAMS.map((p, i) => (
                    <li key={p.slug}>
                      <a
                        href={TRIAL_LINKS[p.slug]}
                        {...(i === 0 ? { "data-autofocus": true } : {})}
                        onClick={() => {
                          write("local", BOOKED_KEY, "1");
                          trackTrialClick({ program: p.slug, source: "exit_popup" });
                        }}
                        className="group flex items-center gap-2.5 sm:gap-3 border border-[#001532]/10 bg-white px-2.5 py-2.5 sm:px-3.5 sm:py-3 transition-all duration-200 hover:border-[#001532]/25 hover:shadow-[0_8px_24px_-12px_rgba(0,21,50,0.35)] hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6F7C]"
                      >
                        <span
                          className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center"
                          style={{
                            backgroundColor: LEVEL_ACCENT[p.slug],
                            color: p.slug === "explorers" ? "#001532" : "#FFFFFF",
                          }}
                        >
                          <LevelIcon slug={p.slug} className="h-4 w-4 sm:h-5 sm:w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm sm:text-[15px] font-bold text-[#001532] leading-tight">{p.gradeBand}</span>
                          <span className="block text-xs sm:text-sm text-gray-500">{p.level}</span>
                        </span>
                        <svg viewBox="0 0 16 16" className="hidden sm:block h-4 w-4 text-[#001532]/40 transition-transform group-hover:translate-x-0.5 group-hover:text-[#001532]" aria-hidden="true">
                          <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 sm:mt-5 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#001532]/[0.08] pt-4">
                  <button
                    type="button"
                    onClick={() => close("no_thanks")}
                    className="text-sm font-medium text-gray-500 hover:text-[#001532] underline-offset-4 hover:underline transition-colors self-center sm:self-auto"
                  >
                    No thanks, maybe later
                  </button>
                  <Link
                    href="/#free-trial"
                    onClick={() => close("details_link")}
                    className="text-sm font-semibold text-[#0F6F7C] hover:text-[#001532] transition-colors self-center sm:self-auto"
                  >
                    How the free class works →
                  </Link>
                </div>
                <p className="mt-3 text-center sm:text-left text-xs text-gray-400">
                  Book by November 30, 2026 · One free class per student
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
