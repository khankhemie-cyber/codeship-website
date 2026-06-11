import type { Metadata } from "next";
import FranchiseGate from "@/components/FranchiseGate";
import RaghaviKit from "@/components/franchise-kits/RaghaviKit";

export const metadata: Metadata = {
  title: "Franchise Opportunity | CODEship Academy",
  robots: { index: false, follow: false },
};

export default function RaghaviPage() {
  return (
    <FranchiseGate personKey="raghavi">
      <RaghaviKit />
    </FranchiseGate>
  );
}
