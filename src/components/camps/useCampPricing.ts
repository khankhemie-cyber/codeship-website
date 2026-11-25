"use client";

import { useEffect, useState } from "react";
import { campPricing, type CampPricing } from "@/config/camps";

const BUILT_AT = new Date(process.env.NEXT_PUBLIC_BUILD_TIME ?? Date.now());

/**
 * March Break price and link by the visitor's clock. The first render uses
 * the build time (so server and client HTML match), then corrects on mount.
 */
export function useCampPricing(): CampPricing {
  const [pricing, setPricing] = useState<CampPricing>(() => campPricing(BUILT_AT));
  useEffect(() => {
    setPricing(campPricing());
  }, []);
  return pricing;
}
