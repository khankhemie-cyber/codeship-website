"use client";

import { useEffect, useState } from "react";
import { trialPhase, type TrialPhase } from "@/config/trialOffer";

const BUILT_AT = new Date(process.env.NEXT_PUBLIC_BUILD_TIME ?? Date.now());

/**
 * The trial's phase by the visitor's clock. The first render uses the build
 * time's phase (so server and client HTML match), then corrects on mount.
 */
export function useTrialPhase(): TrialPhase {
  const [phase, setPhase] = useState<TrialPhase>(() => trialPhase(BUILT_AT));
  useEffect(() => {
    setPhase(trialPhase());
  }, []);
  return phase;
}
