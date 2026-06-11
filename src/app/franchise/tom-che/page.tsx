import type { Metadata } from "next";
import FranchiseGate from "@/components/FranchiseGate";
import TomCheKit from "@/components/franchise-kits/TomCheKit";

export const metadata: Metadata = {
  title: "Franchise Opportunity | CODEship Academy",
  robots: { index: false, follow: false },
};

export default function TomChePage() {
  return (
    <FranchiseGate personKey="tom-che">
      <TomCheKit />
    </FranchiseGate>
  );
}
