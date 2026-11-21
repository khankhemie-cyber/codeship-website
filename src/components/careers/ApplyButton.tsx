"use client";

import { ROLE_EVENT } from "@/components/careers/ApplicationForm";
import type { RoleSlug } from "@/config/careers";

/**
 * Jumps to the application form (#apply) and preselects this role. Without
 * JavaScript it is a plain in-page link.
 */
export default function ApplyButton({ role, label = "Apply" }: { role: RoleSlug; label?: string }) {
  return (
    <a
      href="#apply"
      onClick={() => window.dispatchEvent(new CustomEvent<RoleSlug>(ROLE_EVENT, { detail: role }))}
      className="inline-flex items-center justify-center px-7 py-3.5 text-lg font-bold bg-[#F4D734] text-[#001532] hover:bg-[#E6C51E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#001532]"
    >
      {label}
    </a>
  );
}
