"use client";

import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#001532] text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-200">
          We use cookies to improve your experience on our website. By continuing, you agree to our use of cookies.{" "}
          <a href="/privacy-policy" className="underline text-[#E5A823] hover:text-[#d4941f]">
            Learn more
          </a>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={decline}
            className="text-sm px-4 py-2 border border-gray-400 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="text-sm px-4 py-2 bg-[#E5A823] text-[#001532] font-semibold rounded-lg hover:bg-[#d4941f] transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
