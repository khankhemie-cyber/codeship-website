import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CURRICULUM_LEVELS, getAvailableLocales, getLesson, getLocalizedLevel, type Locale } from "@/data/academy/curriculum";
import LessonPlayer from "@/components/academy/LessonPlayer";
import LocaleSwitcher from "@/components/academy/LocaleSwitcher";

export const runtime = "edge";

export function generateStaticParams() {
  return CURRICULUM_LEVELS.flatMap((l) => l.lessons.map((lesson) => ({ lessonId: lesson.id })));
}

export async function generateMetadata({ params }: { params: { lessonId: string } }): Promise<Metadata> {
  const found = getLesson(params.lessonId);
  return { title: found?.lesson.title ?? "Lesson", robots: { index: false, follow: false } };
}

export default function LessonPage({
  params,
  searchParams,
}: {
  params: { lessonId: string };
  searchParams: { lang?: string };
}) {
  const found = getLesson(params.lessonId);
  if (!found) notFound();
  const { level } = found;
  const locale: Locale = searchParams.lang === "fr" ? "fr" : "en";
  const langSuffix = locale === "fr" ? "?lang=fr" : "";

  const curriculum = getLocalizedLevel(level, locale);
  const lesson = curriculum.lessons.find((l) => l.id === params.lessonId)!;
  const puzzle = curriculum.blockPuzzles.find((p) => p.lessonId === lesson.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <p className="text-sm">
          <Link href={`/academy/levels/${level}/${lesson.semester}${langSuffix}`} className="text-[#138A9A] hover:underline">
            ← {locale === "fr" ? "Semestre" : "Semester"} {lesson.semester}
          </Link>
        </p>
        <LocaleSwitcher available={getAvailableLocales(level)} current={locale} basePath={`/academy/lessons/${lesson.id}`} />
      </div>
      <div className="mt-2">
        <LessonPlayer level={level} lesson={lesson} puzzle={puzzle} locale={locale} />
      </div>
    </div>
  );
}
