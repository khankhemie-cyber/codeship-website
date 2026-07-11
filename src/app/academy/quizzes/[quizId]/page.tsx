import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CURRICULUM_LEVELS, getAvailableLocales, getLocalizedLevel, type Locale } from "@/data/academy/curriculum";
import QuizPlayer from "@/components/academy/QuizPlayer";
import LocaleSwitcher from "@/components/academy/LocaleSwitcher";

export const runtime = "edge";

export function generateStaticParams() {
  return CURRICULUM_LEVELS.flatMap((l) => l.quizzes.map((q) => ({ quizId: q.id })));
}

function findQuiz(quizId: string) {
  for (const level of CURRICULUM_LEVELS) {
    const quiz = level.quizzes.find((q) => q.id === quizId);
    if (quiz) return { level: level.level, quiz };
  }
  return undefined;
}

export async function generateMetadata({ params }: { params: { quizId: string } }): Promise<Metadata> {
  const found = findQuiz(params.quizId);
  return { title: found ? `Quiz ${found.quiz.quizNumber}` : "Quiz", robots: { index: false, follow: false } };
}

export default function QuizPage({
  params,
  searchParams,
}: {
  params: { quizId: string };
  searchParams: { lang?: string };
}) {
  const found = findQuiz(params.quizId);
  if (!found) notFound();
  const locale: Locale = searchParams.lang === "fr" ? "fr" : "en";
  const langSuffix = locale === "fr" ? "?lang=fr" : "";

  const curriculum = getLocalizedLevel(found.level, locale);
  const quiz = curriculum.quizzes.find((q) => q.id === params.quizId)!;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <p className="text-sm">
          <Link href={`/academy/levels/${found.level}/${quiz.semester}${langSuffix}`} className="text-[#138A9A] hover:underline">
            ← {locale === "fr" ? "Semestre" : "Semester"} {quiz.semester}
          </Link>
        </p>
        <LocaleSwitcher available={getAvailableLocales(found.level)} current={locale} basePath={`/academy/quizzes/${quiz.id}`} />
      </div>
      <h1 className="mt-2 text-2xl font-bold text-[#001532]">
        {locale === "fr" ? "Quiz" : "Quiz"} {quiz.quizNumber} <span className="text-base font-normal text-[#2E3440]">({quiz.kind})</span>
      </h1>
      <QuizPlayer quiz={quiz} locale={locale} />
    </div>
  );
}
