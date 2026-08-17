"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const DISMISS_KEY = "codeship-exit-promo-dismissed";
const MIN_ON_PAGE_MS = 4000; // Don't fire in the first few seconds on the page.

/**
 * A site-wide exit-intent modal that nudges undecided visitors toward the
 * Program Finder. On desktop it fires when the cursor leaves through the top of
 * the viewport (heading for the tab bar / back button). On touch devices, where
 * there is no cursor to track, it falls back to a fast upward scroll after the
 * visitor has scrolled down. Shown at most once per browser session; the
 * entrance animation (not the content) is skipped for reduced-motion users.
 *
 * This is a wayfinding nudge, not a promotion — no price, discount, or
 * "limited time" framing.
 */
export default function ExitIntentPromoBanner() {
  const [visible, setVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) return;
    } catch {
      // Ignore storage access failures (private mode) and continue.
    }

    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    const armedAt = Date.now();
    let done = false;

    const show = () => {
      if (done) return;
      if (Date.now() - armedAt < MIN_ON_PAGE_MS) return;
      done = true;
      setVisible(true);
      cleanup();
    };

    // Desktop: pointer exits through the top of the window.
    const onMouseOut = (e: MouseEvent) => {
      if (e.relatedTarget) return; // Moved to another element, not out of the window.
      if (e.clientY <= 0) show();
    };

    // Touch fallback: a quick upward flick after the visitor has scrolled down.
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (lastY - y > 60 && y < 200) show();
      lastY = y;
    };

    document.addEventListener("mouseout", onMouseOut);
    window.addEventListener("scroll", onScroll, { passive: true });

    function cleanup() {
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", onScroll);
    }

    return cleanup;
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Ignore storage failures (private mode) — the banner just won't persist dismissal.
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Find the right program"
      onClick={dismiss}
    >
      <div
        className={`relative w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl ${
          reduceMotion ? "" : "animate-scale-in"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute right-3 top-3 text-gray-400 transition-colors hover:text-gray-600"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <p className="text-xs font-bold uppercase tracking-widest text-[#E5A823]">Before you go</p>
        <h2 className="mt-2 text-3xl font-extrabold text-[#001532]">
          Find the right program for your child
        </h2>
        <p className="mt-3 text-gray-600">
          Answer a few quick questions about your child&apos;s age and interests, and we&apos;ll point you to the
          coding, AI, math, or reading program that fits — in-person in Oshawa or online anywhere.
        </p>

        <Link
          href="/program-finder"
          onClick={dismiss}
          className="mt-6 block w-full rounded-xl bg-[#E5A823] px-6 py-4 text-center font-bold text-[#001532] transition-colors hover:bg-[#d4941f]"
        >
          Take the Program Finder
        </Link>
        <button onClick={dismiss} className="mt-3 text-sm text-gray-400 underline hover:text-gray-600">
          No thanks, keep browsing
        </button>
      </div>
    </div>
  );
}
