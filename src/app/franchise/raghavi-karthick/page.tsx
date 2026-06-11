import type { Metadata } from "next";
import FranchiseGate from "@/components/FranchiseGate";
import RaghaviKarthickKit from "@/components/franchise-kits/RaghaviKarthickKit";

export const metadata: Metadata = {
  title: "Franchise Opportunity | CODEship Academy",
  robots: { index: false, follow: false },
};

export default function RaghaviKarthickPage() {
  return (
    <FranchiseGate personKey="raghavi-karthick">
      <RaghaviKarthickKit />
    </FranchiseGate>
  );
}
