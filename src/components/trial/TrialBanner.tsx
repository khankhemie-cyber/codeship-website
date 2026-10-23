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
      className="group block bg-[#F4D734] px-4 py-3 text-center text-base font-bold text-[#001532] hover:bg-[#E6C51E] transition-colors"
    >
      <span>
        Free trial class this November · Online or in person ·{" "}
        {phase === "open" ? "Claim yours" : "Booking opens Nov 1"}
        <span className="inline-block transition-transform group-hover:translate-x-1"> →</span>
      </span>
    </Link>
  );
}
