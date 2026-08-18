"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { CONSENT_EVENT, hasAnalyticsConsent, type ConsentValue } from "@/lib/consent";

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

/**
 * GA4 itself is loaded server-side in the root layout (`src/app/layout.tsx`)
 * via Google Consent Mode v2, so the tag is present on first load and
 * detectable by Tag Assistant / GTM. This component's only jobs are:
 *
 *  1. Flip GA consent from "denied" to "granted" once the visitor accepts all
 *     cookies (existing cookie banner fires CONSENT_EVENT), with no reload.
 *  2. Load the Meta Pixel, which stays fully consent-gated — injected only
 *     after the visitor has opted into all cookies.
 */
export default function Analytics() {
  const [fbEnabled, setFbEnabled] = useState(false);

  useEffect(() => {
    const grantGa = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (typeof w.gtag !== "function") return;
      w.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
      });
    };

    if (hasAnalyticsConsent()) {
      grantGa();
      setFbEnabled(true);
    }

    const onConsentChange = (e: Event) => {
      const value = (e as CustomEvent<ConsentValue>).detail;
      if (value === "all") {
        grantGa();
        setFbEnabled(true);
      }
    };

    window.addEventListener(CONSENT_EVENT, onConsentChange);
    return () => window.removeEventListener(CONSENT_EVENT, onConsentChange);
  }, []);

  if (!FB_PIXEL_ID || !fbEnabled) return null;

  return (
    <Script id="fb-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${FB_PIXEL_ID}');
fbq('track', 'PageView');`}
    </Script>
  );
}
