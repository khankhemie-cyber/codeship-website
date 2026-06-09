import type { Metadata } from "next";
import FranchiseGate from "@/components/FranchiseGate";
import TomCheKit from "@/components/franchise-kits/TomCheKit";

export const metadata: Metadata = {
  title: "Franchise Opportunity | CODEship Academy",
  robots: { index: false, follow: false },
};

export default function TomChePage() {
  const hash = process.env.NEXT_PUBLIC_FRANCHISE_HASH_TOM_CHE ?? "";
  return (
    <FranchiseGate personKey="tom-che" passwordHash={hash}>
      <TomCheKit />
    </FranchiseGate>
  );
}
