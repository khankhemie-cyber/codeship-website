import type { Metadata } from "next";
import PlaygroundApp from "@/components/tools/playground/PlaygroundApp";

export const metadata: Metadata = {
  title: "CODEship Playground",
  description: "Quick coding games for CODEship Academy classes: Star Path, Sprite Party and Rocket Hop.",
  robots: { index: false, follow: false, nocache: true },
};

export default function PlaygroundPage() {
  return <PlaygroundApp />;
}
