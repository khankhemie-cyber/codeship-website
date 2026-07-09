import type { Metadata } from "next";
import FranchiseGate from "@/components/FranchiseGate";
import JaspreetKit from "@/components/franchise-kits/JaspreetKit";

export const metadata: Metadata = {
  title: "Franchise Opportunity | CODEship Academy",
  robots: { index: false, follow: false },
};

export default function JaspreetPage() {
  return (
    <FranchiseGate personKey="jaspreet">
      <JaspreetKit />
    </FranchiseGate>
  );
}
