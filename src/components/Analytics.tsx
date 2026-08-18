"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { CONSENT_EVENT, hasAnalyticsConsent, type ConsentValue } from "@/lib/consent";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-83QR0ML32G";
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

/**
 * Loads GA4 on every page via Google Consent Mode v2. The gtag.js tag is
 * always present (so Tag Assistant / GTM can detect it and pageviews are
 * measured), but analytics_storage and ad_storage default to "denied" —
 * no analytics cookies are written until the visitor accepts all cookies.
 * When the cookie banner writes that choice it fires CONSENT_EVENT and we
 * update consent to "granted" with no page reload.
 *
 * The Meta Pixel stays fully consent-gated: it is only injected after the
 * visitor has opted into all cookies.
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

  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied'
});
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
          </Script>
        </>
      )}

      {FB_PIXEL_ID && fbEnabled && (
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
      )}
    </>
  );
}
