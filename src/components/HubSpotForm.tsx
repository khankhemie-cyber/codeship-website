"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";

interface Props {
  formId: string;
  thankYouTitle: string;
  thankYouBody: string;
  thankYouCta?: { label: string; href: string };
  className?: string;
}

const PORTAL_ID = "342242925";
const REGION = "na3";

export default function HubSpotForm({
  formId,
  thankYouTitle,
  thankYouBody,
  thankYouCta,
  className = "",
}: Props) {
  const uid = useId().replace(/:/g, "");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Load HubSpot embed script once per page
    const scriptId = "hs-form-embed-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://js-${REGION}.hsforms.net/forms/embed/${PORTAL_ID}.js`;
      script.defer = true;
      document.head.appendChild(script);
    }

    // Listen for HubSpot submission events (new embed format fires via postMessage)
    function handleMessage(event: MessageEvent) {
      if (!event.data || typeof event.data !== "object") return;
      const d = event.data as { type?: string; eventName?: string; id?: string };
      if (
        d.type === "hsFormCallback" &&
        (d.eventName === "onFormSubmitted" || d.eventName === "onFormSubmit") &&
        d.id === formId
      ) {
        setSubmitted(true);
        if (typeof window.fbq === "function") {
          window.fbq("track", "Lead", { content_name: formId });
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [formId]);

  if (submitted) {
    return (
      <div className={`text-center py-10 px-6 ${className}`}>
        <div className="w-16 h-16 bg-[#E5A823] rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
          <svg className="w-8 h-8 text-[#001532]" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-[#001532] mb-3">{thankYouTitle}</h3>
        <p className="text-gray-600 max-w-md mx-auto leading-relaxed mb-6">{thankYouBody}</p>
        {thankYouCta && (
          <Link
            href={thankYouCta.href}
            className="inline-block bg-[#001532] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#2a3052] transition-colors"
          >
            {thankYouCta.label}
          </Link>
        )}
        <p className="text-xs text-gray-400 mt-6">
          Questions? Email us at{" "}
          <a href="mailto:admin@codeshipacademy.com" className="text-[#E5A823] hover:underline">
            admin@codeshipacademy.com
          </a>
        </p>
      </div>
    );
  }

  return (
    <div id={`hs-wrapper-${uid}`} className={className}>
      <div
        className="hs-form-frame"
        data-region={REGION}
        data-form-id={formId}
        data-portal-id={PORTAL_ID}
      />
    </div>
  );
}
