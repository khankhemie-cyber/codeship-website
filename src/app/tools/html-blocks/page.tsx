import type { Metadata } from "next";
import HtmlBlocksGate from "@/components/tools/htmlblocks/HtmlBlocksGate";

export const metadata: Metadata = {
  title: "CODEship HTML Blocks",
  description: "Builders build a real web page from HTML tag cards. A CODEship Academy student tool.",
  robots: { index: false, follow: false, nocache: true },
};

export default function HtmlBlocksPage() {
  return <HtmlBlocksGate />;
}
