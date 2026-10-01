import type { Metadata } from "next";
import Launchpad from "@/components/tools/launchpad/Launchpad";

export const metadata: Metadata = {
  title: "CODEship Launchpad",
  description: "Write HTML, CSS and JavaScript and launch it live. A CODEship Academy student tool.",
  robots: { index: false, follow: false, nocache: true },
};

export default function LaunchpadPage() {
  return <Launchpad />;
}
