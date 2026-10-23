"use client";

import Link from "next/link";
import { useTrialPhase } from "./useTrialPhase";

/** Thin announcement bar for the November free trial. Gone once November ends. */
export default function TrialBanner() {
  const phase = useTrialPhase();
  if (phase === "closed") return null;
  return (
    <Link
      href="#free-trial"
      className="group relative block overflow-hidden bg-[#F4D734] px-4 py-3 text-center text-base font-bold text-[#001532]"
    >
      <span className="shimmer absolute inset-0" aria-hidden="true" />
      <span className="relative">
        <span className="mr-2 inline-block bg-[#001532] px-2 py-0.5 text-xs uppercase tracking-widest text-[#F4D734] align-middle">
          New
        </span>
        Free trial class this November · Online or in person ·{" "}
        {phase === "open" ? "Claim yours" : "Booking opens Nov 1"}
        <span className="inline-block transition-transform group-hover:translate-x-1"> →</span>
      </span>
    </Link>
  );
}
