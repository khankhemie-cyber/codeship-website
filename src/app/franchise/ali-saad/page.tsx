import type { Metadata } from "next";
import FranchiseGate from "@/components/FranchiseGate";
import AliSaadKit from "@/components/franchise-kits/AliSaadKit";

export const metadata: Metadata = {
  title: "Franchise Opportunity | CODEship Academy",
  robots: { index: false, follow: false },
};

export default function AliSaadPage() {
  return (
    <FranchiseGate personKey="ali-saad">
      <AliSaadKit />
    </FranchiseGate>
  );
}
