import type { Metadata } from "next";
import RobotLab from "@/components/tools/robots/RobotLab";

export const metadata: Metadata = {
  title: "CODEship Robot Lab",
  description: "Program a robot in Blocks, JavaScript or Python, right in the browser. A CODEship Academy student tool.",
  robots: { index: false, follow: false, nocache: true },
};

export default function RobotsPage() {
  return <RobotLab />;
}
