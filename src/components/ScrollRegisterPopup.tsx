"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const DISMISS_KEY = "codeship-register-popup-dismissed";

interface ScrollRegisterPopupProps {
  city?: string | null;
}

/**
 * A dismissible registration nudge that slides in after the visitor scrolls
 * ~40% of the page. Dismissed state is kept per browser session, and the
 * entrance animation is skipped for visitors who prefer reduced motion.
 */
export default function ScrollRegisterPopup({ city }: ScrollRegisterPopupProps) {
  const [visible, setVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (total > 0 && scrolled / total >= 0.4) {
        setVisible(true);
        window.removeEventListener("scroll", onScroll);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // In case the page is already scrolled past the threshold.
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Ignore storage failures (private mode) — the popup just won't persist dismissal.
    }
  };

  if (!visible) return null;

  const headline = city
    ? `Live online coding classes — now enrolling in ${city}.`
    : "Live online coding classes — now enrolling across Canada.";

  return (
    <div
      role="dialog"
      aria-label="Register for CODEship Academy"
      className={`fixed bottom-4 right-4 z-50 max-w-sm w-[calc(100%-2rem)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 ${
        reduceMotion ? "" : "animate-fade-in-up"
      }`}
    >
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <p className="text-[#E5A823] font-bold text-xs uppercase tracking-widest mb-1">Now Enrolling</p>
      <h3 className="text-lg font-bold text-[#001532] mb-2 pr-6">{headline}</h3>
      <p className="text-gray-600 text-sm mb-4">
        Small-group, project-based coding for ages 4–16. Pick your child&apos;s level and register in minutes.
      </p>
      <Link
        href="/register"
        onClick={dismiss}
        className="block w-full bg-[#E5A823] text-[#001532] font-bold px-6 py-3 rounded-xl text-center hover:bg-[#d4941f] transition-colors"
      >
        See programs & register
      </Link>
    </div>
  );
}
