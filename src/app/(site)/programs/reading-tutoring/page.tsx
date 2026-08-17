import type { Metadata } from "next";
import TutoringProgramPage from "@/components/TutoringProgramPage";
import { pageMetadata } from "@/lib/pageMetadata";
import { getTutoring } from "@/data/tutoring";

const offering = getTutoring("reading-tutoring")!;

export const metadata: Metadata = pageMetadata({
  title: "English & Reading Tutoring for Kids (K–8) | In-Person in Oshawa & Online | CODEship Academy",
  description:
    "K–8 English and reading tutoring in Oshawa (Durham Region) and live online — phonics, comprehension, vocabulary, and writing. Flat CAD $129/semester, 8 weekly classes.",
  path: "/programs/reading-tutoring",
});

export default function ReadingTutoringPage() {
  return <TutoringProgramPage offering={offering} />;
}
