"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { CONSENT_EVENT, getConsent, type ConsentValue } from "@/lib/consent";
import { isChildPath } from "@/lib/childPages";
import { trackEvent } from "@/lib/analytics";
import { FB_PIXEL_ID, GA_ID } from "@/config/analytics";

const GRANTED = {
  analytics_storage: "granted",
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
} as const;
const DENIED = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
} as const;

/**
 * GA4 is loaded from an inline script in the root layout (`src/app/layout.tsx`)
 * with Google Consent Mode v2 defaulting to "denied". This component:
 *
 *  1. Applies the visitor's cookie choice to GA (and the Meta Pixel) whenever
 *     it is made or changed, with no reload.
 *  2. Loads the Meta Pixel only after "Accept all".
 *  3. Keeps every tag off child-facing pages (/tools, /quizzes, /workbooks),
 *     including when they are reached by in-app navigation.
 *  4. Reports a `begin_checkout` event when a visitor opens a Stripe checkout.
 */
export default function Analytics() {
  const pathname = usePathname();
  const childPage = isChildPath(pathname);
  const [consent, setConsentState] = useState<ConsentValue | null>(null);

  useEffect(() => {
    setConsentState(getConsent());
    const onConsentChange = (e: Event) => setConsentState((e as CustomEvent<ConsentValue>).detail);
    window.addEventListener(CONSENT_EVENT, onConsentChange);
    return () => window.removeEventListener(CONSENT_EVENT, onConsentChange);
  }, []);

  // Apply the consent choice (and the child-page rule) to tags already on the page.
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    w[`ga-disable-${GA_ID}`] = childPage;
    const granted = consent === "all" && !childPage;
    if (typeof w.gtag === "function") w.gtag("consent", "update", granted ? GRANTED : DENIED);
    if (typeof w.fbq === "function") w.fbq("consent", granted ? "grant" : "revoke");
  }, [consent, childPage]);

  // Stripe Payment Links are plain <a href="https://buy.stripe.com/...">, so
  // one delegated listener covers every checkout button on the site.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || !link.href.startsWith("https://buy.stripe.com/")) return;
      trackEvent(
        "begin_checkout",
        { checkout_url: link.href, link_text: link.innerText.trim().slice(0, 100), page_path: window.location.pathname },
        "InitiateCheckout",
      );
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (!FB_PIXEL_ID || consent !== "all" || childPage) return null;

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
