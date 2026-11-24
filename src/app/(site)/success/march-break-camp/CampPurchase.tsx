"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { MARCH_BREAK_CAMP as CAMP } from "@/config/camps";

/** Reports the camp purchase once per visit (GA4 + Meta Pixel when allowed). */
export default function CampPurchase() {
  useEffect(() => {
    const key = `purchase_fired_${CAMP.slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "true");
    } catch {
      // Storage blocked: report anyway.
    }
    trackEvent("purchase", { currency: "CAD", value: CAMP.priceCad, item_name: CAMP.title, item_id: CAMP.slug });
    let tries = 0;
    const timer = window.setInterval(() => {
      const w = window as typeof window & { fbq?: (...args: unknown[]) => void };
      if (w.fbq) w.fbq("track", "Purchase", { value: CAMP.priceCad, currency: "CAD", content_name: CAMP.title, content_type: "product" });
      if (w.fbq || ++tries >= 20) window.clearInterval(timer);
    }, 250);
    return () => window.clearInterval(timer);
  }, []);
  return null;
}
