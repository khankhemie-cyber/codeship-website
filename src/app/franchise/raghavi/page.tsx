import type { Metadata } from "next";
import FranchiseGate from "@/components/FranchiseGate";
import RaghaviKit from "@/components/franchise-kits/RaghaviKit";

export const metadata: Metadata = {
  title: "Franchise Opportunity | CODEship Academy",
  robots: { index: false, follow: false },
};

export default function RaghaviPage() {
  const hash = process.env.NEXT_PUBLIC_FRANCHISE_HASH_RAGHAVI ?? "";
  return (
    <FranchiseGate personKey="raghavi" passwordHash={hash}>
      <RaghaviKit />
    </FranchiseGate>
  );
}
