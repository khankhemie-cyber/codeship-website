"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { MARCH_BREAK_CAMP as CAMP } from "@/config/camps";
import { trackEvent } from "@/lib/analytics";
import { CONSENT_EVENT, getConsent } from "@/lib/consent";
import { isChildPath } from "@/lib/childPages";
import { useCampPricing } from "./useCampPricing";

/**
 * Entry popup for the March Break camp offer.
 *
 * Opens a moment after the visitor lands (and after the cookie choice).
 * Shown once per visit, not again for 3 days after it is closed, never after
 * the visitor clicks through to sign up, and never on child, checkout, legal
 * or school/franchise pages. Stops after the camp starts.
 * Add ?camppopup=1 to any page to preview it.
 */

const SEEN_KEY = "codeship-camp-popup-seen"; // localStorage: last time shown (ms)
const SESSION_KEY = "codeship-camp-popup-session"; // sessionStorage: shown this visit
const SIGNED_UP_KEY = "codeship-camp-signed-up"; // localStorage: clicked a camp checkout link
const EXIT_SESSION_KEY = "codeship-exit-popup-session"; // the exit popup's per-visit flag
const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;
const OPEN_DELAY_MS = 1800;
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
  "/quizzes",
  "/workbooks",
];

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
    /* storage unavailable: the popup may show again */
  }
}

function isSuppressed(pathname: string): boolean {
  if (Date.now() >= new Date(CAMP.startISO).getTime()) return true;
  if (isChildPath(pathname) || EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  if (read("local", SIGNED_UP_KEY)) return true;
  if (read("session", SESSION_KEY) || read("session", EXIT_SESSION_KEY)) return true;
  const seen = Number(read("local", SEEN_KEY));
  return !!seen && Date.now() - seen < SNOOZE_MS;
}

export default function CampEntryPopup() {
  const pathname = usePathname() ?? "/";
  const pricing = useCampPricing();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const show = useCallback(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    write("session", SESSION_KEY, "1");
    // One popup per visit: keep the exit popup quiet too.
    write("session", EXIT_SESSION_KEY, "1");
    write("local", SEEN_KEY, String(Date.now()));
    setOpen(true);
    trackEvent("camp_popup_view", { page: window.location.pathname });
  }, []);

  const close = useCallback((reason: string) => {
    setOpen(false);
    trackEvent("camp_popup_dismiss", { reason });
    returnFocusRef.current?.focus?.();
  }, []);

  // Trigger: shortly after landing, once the cookie choice is made.
  useEffect(() => {
    if (open) return;
    if (new URLSearchParams(window.location.search).get("camppopup") === "1") {
      const t = window.setTimeout(show, 400);
      return () => window.clearTimeout(t);
    }
    if (isSuppressed(pathname)) return;

    let timer: number | undefined;
    const arm = () => {
      if (timer !== undefined || !getConsent()) return;
      timer = window.setTimeout(() => {
        if (!isSuppressed(pathname)) show();
      }, OPEN_DELAY_MS);
    };
    arm();
    window.addEventListener(CONSENT_EVENT, arm);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(CONSENT_EVENT, arm);
    };
  }, [pathname, open, show]);

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
            key="camp-popup"
            className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div aria-hidden="true" className="absolute inset-0 bg-[#001532]/60 backdrop-blur-sm" onClick={() => close("backdrop")} />

            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="camp-popup-title"
              aria-describedby="camp-popup-desc"
              className="relative w-full sm:max-w-[520px] max-h-[92dvh] overflow-y-auto bg-white shadow-[0_30px_80px_-20px_rgba(0,21,50,0.55)]"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
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
                  {pricing.earlyBird ? `Early bird · ends ${CAMP.earlyBirdEndsLabel}` : `March Break · ${CAMP.shortDates}, 2027`}
                </p>
                <h2 id="camp-popup-title" className="relative font-display text-[24px] sm:text-[34px] font-extrabold leading-[1.1] mt-2 sm:mt-3 pr-6">
                  {pricing.earlyBird ? `March Break camp: save $${CAMP.earlyBirdSaving} a day.` : "March Break camp is open."}
                </h2>
                <p id="camp-popup-desc" className="relative mt-2 sm:mt-3 text-[15px] sm:text-base text-white/80">
                  Coding, AI and robotics in Oshawa, {CAMP.hours}, {CAMP.ages.toLowerCase()}. Book the full week or only the days you need.
                </p>
              </div>

              <div className="px-5 py-5 sm:px-8 sm:py-6">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-4xl font-extrabold text-[#001532]">${pricing.priceCad}</span>
                  <span className="text-base text-gray-500">per day</span>
                  {pricing.earlyBird && <span className="text-base text-gray-400 line-through">${CAMP.priceCad}</span>}
                </div>

                <p className="mt-4 text-sm font-semibold text-[#001532]">Pick your days at checkout:</p>
                <ul className="mt-2 grid grid-cols-5 gap-1.5">
                  {CAMP.campDays.map((d, i) => (
                    <li key={d.short} className="border border-[#001532]/10 bg-[#FAF8F4] py-2 text-center">
                      <span className="block text-xs font-bold uppercase tracking-wider text-[#0F6F7C]">{d.short}</span>
                      <span className="block font-display text-lg font-extrabold text-[#001532]">{15 + i}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-gray-500">March 2027 · Core21, 21 Simcoe St South, Oshawa · {CAMP.spots} spots</p>

                <a
                  href={pricing.url}
                  data-autofocus
                  onClick={() => {
                    write("local", SIGNED_UP_KEY, "1");
                    trackEvent("camp_signup_click", { camp: CAMP.slug, source: "entry_popup", early_bird: pricing.earlyBird ? "yes" : "no" });
                  }}
                  className="mt-5 flex w-full items-center justify-center rounded-full bg-[#F4D734] px-6 py-4 text-lg font-bold text-[#001532] hover:bg-[#E6C51E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6F7C]"
                >
                  {pricing.earlyBird ? `Save my spot at $${pricing.priceCad}/day →` : "Sign up for March Break →"}
                </a>

                <div className="mt-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#001532]/[0.08] pt-4">
                  <button
                    type="button"
                    onClick={() => close("no_thanks")}
                    className="text-sm font-medium text-gray-500 hover:text-[#001532] underline-offset-4 hover:underline transition-colors self-center sm:self-auto"
                  >
                    No thanks
                  </button>
                  <Link
                    href="/programs/camps/#march-break"
                    onClick={() => close("details_link")}
                    className="text-sm font-semibold text-[#0F6F7C] hover:text-[#001532] transition-colors self-center sm:self-auto"
                  >
                    Camp details →
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
