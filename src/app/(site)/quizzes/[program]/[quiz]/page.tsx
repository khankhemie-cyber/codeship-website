import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProgram } from "@/data/programs";
import { QUIZZES } from "@/data/quizzes";
import { getQuiz, quizPath, toPublicQuiz } from "@/lib/quizzes";
import { PageHero, Section } from "@/components/ui/Page";
import QuizRunner from "@/components/quiz/QuizRunner";

interface Props {
  params: { program: string; quiz: string };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return QUIZZES.map((q) => ({ program: q.program, quiz: q.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const quiz = getQuiz(params.program, params.quiz);
  return {
    title: `${quiz?.title ?? "Quiz"} | CODEship Academy`,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default function QuizPage({ params }: Props) {
  const quiz = getQuiz(params.program, params.quiz);
  const program = getProgram(params.program);
  if (!quiz || !program) notFound();

  return (
    <>
      <PageHero
        eyebrow={`${program.level} · Semester ${quiz.semester} · Week ${quiz.week}`}
        title={quiz.title}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Quizzes", href: "/quizzes/" },
          { name: quiz.title, href: quizPath(quiz) },
        ]}
      />
      <Section tone="cream">
        {/* Only the answer-free copy of the quiz goes to the browser; marking happens on the server. */}
        <QuizRunner quiz={toPublicQuiz(quiz)} level={program.level} />
      </Section>
    </>
  );
}
