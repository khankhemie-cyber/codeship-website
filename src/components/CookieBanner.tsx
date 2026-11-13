"use client";

import { useState, useEffect } from "react";
import { OPEN_SETTINGS_EVENT, getConsent, setConsent } from "@/lib/consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getConsent()) setVisible(true);
    const reopen = () => setVisible(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, reopen);
  }, []);

  const accept = () => {
    setConsent("all");
    setVisible(false);
  };

  const decline = () => {
    setConsent("essential");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div role="region" aria-label="Cookie choices" className="fixed bottom-0 left-0 right-0 z-50 bg-[#001532] text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-200">
          We use cookies to improve your experience and, with your consent, to measure our advertising. Choose
          &ldquo;Accept all&rdquo; to enable analytics, or &ldquo;Essential only&rdquo; to keep just what the site
          needs.{" "}
          <a href="/privacy-policy" className="underline text-[#F4D734] hover:text-[#E6C51E]">
            Read our privacy policy
          </a>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={decline}
            className="text-sm px-4 py-2 border border-gray-400 hover:bg-gray-700 transition-colors"
          >
            Essential only
          </button>
          <button
            onClick={accept}
            className="text-sm px-4 py-2 bg-[#F4D734] text-[#001532] font-semibold hover:bg-[#E6C51E] transition-colors"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
