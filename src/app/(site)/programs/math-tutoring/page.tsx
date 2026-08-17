import type { Metadata } from "next";
import TutoringProgramPage from "@/components/TutoringProgramPage";
import { pageMetadata } from "@/lib/pageMetadata";
import { getTutoring } from "@/data/tutoring";

const offering = getTutoring("math-tutoring")!;

export const metadata: Metadata = pageMetadata({
  title: "Math Tutoring for Kids (K–8) | In-Person in Oshawa & Online | CODEship Academy",
  description:
    "K–8 math tutoring in Oshawa (Durham Region) and live online — number sense, fractions, and pre-algebra taught the creative CODEship way. Flat CAD $129/semester, 8 weekly classes.",
  path: "/programs/math-tutoring",
});

export default function MathTutoringPage() {
  return <TutoringProgramPage offering={offering} />;
}
