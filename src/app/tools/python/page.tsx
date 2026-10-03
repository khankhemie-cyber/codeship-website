import type { Metadata } from "next";
import PythonConsole from "@/components/tools/python/PythonConsole";

export const metadata: Metadata = {
  title: "CODEship Python",
  description: "Write checker.py, press Run, read the output. A CODEship Academy student tool.",
  robots: { index: false, follow: false, nocache: true },
};

export default function PythonPage() {
  return <PythonConsole />;
}
