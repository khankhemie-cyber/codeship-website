"use client";

import { useEffect } from "react";

interface ZohoFormProps {
  divId: string;
  formPerma: string;
  formPath: string;
  initialHeight: string;
  ariaLabel: string;
}

export default function ZohoForm({ divId, formPerma, formPath, initialHeight, ariaLabel }: ZohoFormProps) {
  useEffect(() => {
    const container = document.getElementById(divId);
    if (!container || container.querySelector("iframe")) return;

    let ifrmSrc = `https://forms.zohopublic.ca/admincodeshi1/form/${formPath}/formperma/${formPerma}?zf_rszfm=1`;

    try {
      if (!(/[?&]referrername=/.test(ifrmSrc))) {
        let rfr = window.location.href;
        try {
          rfr = window.self !== window.top
            ? window.top!.location.href
            : (/^https?:\/\/[\w.-]+\.[a-zA-Z]{2,}/i.test(rfr) ? rfr : "");
        } catch (_) {}
        if (rfr) {
          if (rfr.length > 1800) {
            const qi = rfr.indexOf("?");
            if (qi > -1) rfr = rfr.substring(0, qi);
            if (rfr.length > 1800) rfr = rfr.substring(0, 1800);
          }
          ifrmSrc += (ifrmSrc.indexOf("?") > 0 ? "&" : "?") + "referrername=" + encodeURIComponent(rfr);
        }
      }
    } catch (_) {}

    const f = document.createElement("iframe");
    f.src = ifrmSrc;
    f.style.border = "none";
    f.style.height = initialHeight;
    f.style.width = "90%";
    f.style.transition = "all 0.5s ease";
    f.setAttribute("aria-label", ariaLabel);
    container.appendChild(f);

    const onMessage = (event: MessageEvent) => {
      if (typeof event.data !== "string") return;
      const parts = event.data.split("|");
      if (parts.length !== 2 && parts.length !== 3) return;
      const [perma, rawHt, scroll] = parts;
      const newHt = (parseInt(rawHt, 10) + 15) + "px";
      const el = document.getElementById(divId)?.querySelector("iframe") as HTMLIFrameElement | null;
      if (!el || !el.src.includes("formperma") || !el.src.includes(perma)) return;
      if (el.style.height === newHt) return;
      if (scroll !== undefined) {
        el.scrollIntoView();
        setTimeout(() => { el.style.height = newHt; }, 500);
      } else {
        el.style.height = newHt;
      }
    };

    window.addEventListener("message", onMessage, false);
    return () => window.removeEventListener("message", onMessage);
  }, [divId, formPerma, formPath, initialHeight, ariaLabel]);

  return <div id={divId} />;
}
