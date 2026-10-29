import type { Metadata } from "next";
import { getProgram } from "@/data/programs";
import { QUIZZES } from "@/data/quizzes";
import { quizId } from "@/lib/quizzes";
import { PageHero, Section } from "@/components/ui/Page";
import InstructorResults from "@/components/quiz/InstructorResults";

export const metadata: Metadata = {
  title: "Quiz Results | CODEship Academy",
  robots: { index: false, follow: false, nocache: true },
};

export default function QuizResultsPage() {
  const quizzes = QUIZZES.map((q) => ({
    id: quizId(q),
    label: `${getProgram(q.program)?.level ?? q.program} · ${q.title}`,
  }));
  return (
    <>
      <PageHero eyebrow="Instructors" title="Quiz results" lead="See every submitted quiz, read written answers, and download a spreadsheet." />
      <Section tone="cream">
        <InstructorResults quizzes={quizzes} />
      </Section>
    </>
  );
}
