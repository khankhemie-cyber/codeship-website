import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  CURRICULUM_LEVELS,
  getAvailableLocales,
  getLocalizedLevel,
  type LevelSlug,
  type Locale,
  type Semester,
} from "@/data/academy/curriculum";
import LocaleSwitcher from "@/components/academy/LocaleSwitcher";

const VALID_SEMESTERS: Semester[] = ["1", "2", "3", "4"];

export const runtime = "edge";

export function generateStaticParams() {
  return CURRICULUM_LEVELS.flatMap((l) => VALID_SEMESTERS.map((semester) => ({ level: l.level, semester })));
}

export async function generateMetadata({ params }: { params: { level: string; semester: string } }): Promise<Metadata> {
  return { title: `Semester ${params.semester}`, robots: { index: false, follow: false } };
}

export default function SemesterPage({
  params,
  searchParams,
}: {
  params: { level: string; semester: string };
  searchParams: { lang?: string };
}) {
  const levelMeta = CURRICULUM_LEVELS.find((l) => l.level === params.level);
  const semester = params.semester as Semester;
  if (!levelMeta || !VALID_SEMESTERS.includes(semester)) notFound();
  const locale: Locale = searchParams.lang === "fr" ? "fr" : "en";
  const langSuffix = locale === "fr" ? "?lang=fr" : "";

  const curriculum = getLocalizedLevel(levelMeta.level as LevelSlug, locale);
  const theory = curriculum.theoryUnits.find((t) => t.semester === semester);
  const lessons = curriculum.lessons.filter((l) => l.semester === semester).sort((a, b) => a.classNumber - b.classNumber);
  const project = curriculum.projects.find((p) => p.semester === semester);
  const quizzes = curriculum.quizzes.filter((q) => q.semester === semester).sort((a, b) => a.quizNumber - b.quizNumber);

  const t = (en: string, fr: string) => (locale === "fr" ? fr : en);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <p className="text-sm">
          <Link href={`/academy/levels/${levelMeta.level}${langSuffix}`} className="text-[#138A9A] hover:underline">
            ← {curriculum.name}
          </Link>
        </p>
        <LocaleSwitcher
          available={getAvailableLocales(levelMeta.level as LevelSlug)}
          current={locale}
          basePath={`/academy/levels/${levelMeta.level}/${semester}`}
        />
      </div>
      <h1 className="mt-2 text-2xl font-bold text-[#001532]">
        {t("Semester", "Semestre")} {semester}
        {project ? `: ${project.title}` : ""}
      </h1>

      {theory && (
        <section className="mt-4 rounded-lg border border-[#138A9A]/30 bg-white p-4">
          <h2 className="font-semibold text-[#001532]">{theory.title}</h2>
          <p className="mt-1 text-sm text-[#2E3440]">{theory.bodyMd}</p>
        </section>
      )}

      <h2 className="mt-8 text-lg font-semibold text-[#001532]">{t("Classes", "Cours")}</h2>
      <ol className="mt-3 space-y-2">
        {lessons.map((lesson) => (
          <li key={lesson.id}>
            <Link
              href={`/academy/lessons/${lesson.id}${langSuffix}`}
              className="block rounded-md border bg-white p-3 shadow-sm hover:shadow-md"
              style={{ borderColor: curriculum.accentColour }}
            >
              <span className="text-xs font-medium text-[#138A9A]">
                {t("Class", "Cours")} {lesson.classNumber}
              </span>
              <span className="block font-medium text-[#001532]">{lesson.title}</span>
            </Link>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {project && (
          <Link
            href={`/academy/projects/${project.id}${langSuffix}`}
            className="rounded-lg border bg-white p-4 shadow-sm hover:shadow-md"
            style={{ borderColor: curriculum.accentColour }}
          >
            <h2 className="font-semibold text-[#001532]">
              {t("Project", "Projet")}: {project.title}
            </h2>
            <p className="mt-1 text-sm text-[#2E3440]">{project.brief}</p>
          </Link>
        )}
        <div className="space-y-2">
          {quizzes.map((quiz) => (
            <Link
              key={quiz.id}
              href={`/academy/quizzes/${quiz.id}${langSuffix}`}
              className="block rounded-lg border bg-white p-4 shadow-sm hover:shadow-md"
              style={{ borderColor: curriculum.accentColour }}
            >
              <h2 className="font-semibold text-[#001532]">
                {t("Quiz", "Quiz")} {quiz.quizNumber} <span className="text-sm font-normal text-[#2E3440]">({quiz.kind})</span>
              </h2>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
