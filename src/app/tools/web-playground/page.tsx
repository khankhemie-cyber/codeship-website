import type { Metadata } from "next";
import WebPlayground from "@/components/tools/playground/WebPlayground";

export const metadata: Metadata = {
  title: "Web Playground",
  description: "Write HTML, CSS and JavaScript and see it run live. A CODEship Academy student tool.",
  robots: { index: false, follow: false, nocache: true },
};

export default function WebPlaygroundPage() {
  return <WebPlayground />;
}
