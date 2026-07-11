import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CURRICULUM_LEVELS, getAvailableLocales, getLocalizedLevel, type LevelSlug, type Locale } from "@/data/academy/curriculum";
import LocaleSwitcher from "@/components/academy/LocaleSwitcher";

export const runtime = "edge";

export function generateStaticParams() {
  return CURRICULUM_LEVELS.map((l) => ({ level: l.level }));
}

export async function generateMetadata({ params }: { params: { level: string } }): Promise<Metadata> {
  const level = CURRICULUM_LEVELS.find((l) => l.level === params.level);
  return { title: level ? `${level.name} capstone` : "Capstone", robots: { index: false, follow: false } };
}

export default function CapstonePage({
  params,
  searchParams,
}: {
  params: { level: string };
  searchParams: { lang?: string };
}) {
  const levelMeta = CURRICULUM_LEVELS.find((l) => l.level === params.level);
  if (!levelMeta) notFound();
  const locale: Locale = searchParams.lang === "fr" ? "fr" : "en";
  const langSuffix = locale === "fr" ? "?lang=fr" : "";

  const curriculum = getLocalizedLevel(levelMeta.level as LevelSlug, locale);
  const lessons = curriculum.lessons.filter((l) => l.semester === "capstone").sort((a, b) => a.classNumber - b.classNumber);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <p className="text-sm">
          <Link href={`/academy/levels/${levelMeta.level}${langSuffix}`} className="text-[#138A9A] hover:underline">
            ← {curriculum.name}
          </Link>
        </p>
        <LocaleSwitcher available={getAvailableLocales(levelMeta.level as LevelSlug)} current={locale} basePath={`/academy/capstones/${levelMeta.level}`} />
      </div>

      <h1 className="mt-2 text-2xl font-bold text-[#001532]">
        {locale === "fr" ? "Projet synthèse" : "Capstone"}: {curriculum.capstone.title}
      </h1>
      <p className="mt-2 text-[#2E3440]">{curriculum.capstone.description}</p>

      <h2 className="mt-6 text-lg font-semibold text-[#001532]">{locale === "fr" ? "Cours" : "Classes"}</h2>
      <ol className="mt-3 space-y-2">
        {lessons.map((lesson) => (
          <li key={lesson.id}>
            <Link
              href={`/academy/lessons/${lesson.id}${langSuffix}`}
              className="block rounded-md border bg-white p-3 shadow-sm hover:shadow-md"
              style={{ borderColor: curriculum.accentColour }}
            >
              <span className="text-xs font-medium text-[#138A9A]">
                {locale === "fr" ? "Cours" : "Class"} {lesson.classNumber}
              </span>
              <span className="block font-medium text-[#001532]">{lesson.title}</span>
            </Link>
          </li>
        ))}
      </ol>

      <h2 className="mt-6 text-lg font-semibold text-[#001532]">{locale === "fr" ? "Grille" : "Rubric"}</h2>
      <ul className="mt-2 space-y-1 text-sm text-[#2E3440]">
        {curriculum.capstone.rubric.map((r) => (
          <li key={r.criterion}>
            <span className="font-medium text-[#001532]">{r.criterion}.</span> {r.description}
          </li>
        ))}
      </ul>
      <p className="mt-4 rounded-md bg-[#F1EEE7] p-3 text-sm text-[#2E3440]">
        {locale === "fr"
          ? "Ton enseignant·e évalue le projet synthèse et attribue la réussite après ta présentation."
          : "Your teacher scores the capstone rubric and records a pass after your presentation."}
      </p>
    </div>
  );
}
