import type { Metadata } from "next";
import BlocksApp from "@/components/tools/blocks/BlocksApp";

export const metadata: Metadata = {
  title: "CODEship Blocks",
  description: "Picture block coding for CODEship Academy Explorers.",
  robots: { index: false, follow: false, nocache: true },
};

export default function BlocksPage() {
  return <BlocksApp />;
}
