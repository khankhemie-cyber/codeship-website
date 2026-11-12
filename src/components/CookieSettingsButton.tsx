"use client";

import { openCookieSettings } from "@/lib/consent";

/** Reopens the cookie banner so a visitor can change or withdraw their choice. */
export default function CookieSettingsButton({
  className = "",
  label = "Cookie settings",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <button type="button" onClick={openCookieSettings} className={`underline-offset-2 hover:underline ${className}`}>
      {label}
    </button>
  );
}
