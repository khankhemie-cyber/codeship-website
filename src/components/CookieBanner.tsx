"use client";

import { useState, useEffect } from "react";
import { getConsent, setConsent } from "@/lib/consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getConsent()) setVisible(true);
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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#001532] text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-200">
          We use cookies to improve your experience and, with your consent, to measure our advertising. Choose
          &ldquo;Accept all&rdquo; to enable analytics, or &ldquo;Essential only&rdquo; to keep just what the site
          needs.{" "}
          <a href="/privacy-policy" className="underline text-[#E5A823] hover:text-[#d4941f]">
            Learn more
          </a>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={decline}
            className="text-sm px-4 py-2 border border-gray-400 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Essential only
          </button>
          <button
            onClick={accept}
            className="text-sm px-4 py-2 bg-[#E5A823] text-[#001532] font-semibold rounded-lg hover:bg-[#d4941f] transition-colors"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
