import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CURRICULUM_LEVELS, getAvailableLocales, type LevelSlug, type Locale } from "@/data/academy/curriculum";
import LevelSemesterMap from "@/components/academy/LevelSemesterMap";
import LocaleSwitcher from "@/components/academy/LocaleSwitcher";

export const runtime = "edge";

export function generateStaticParams() {
  return CURRICULUM_LEVELS.map((l) => ({ level: l.level }));
}

export async function generateMetadata({ params }: { params: { level: string } }): Promise<Metadata> {
  const level = CURRICULUM_LEVELS.find((l) => l.level === params.level);
  return { title: level?.name ?? "Level", robots: { index: false, follow: false } };
}

export default function LevelPage({
  params,
  searchParams,
}: {
  params: { level: string };
  searchParams: { lang?: string };
}) {
  const level = CURRICULUM_LEVELS.find((l) => l.level === params.level);
  if (!level) notFound();
  const locale: Locale = searchParams.lang === "fr" ? "fr" : "en";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex justify-end">
        <LocaleSwitcher
          available={getAvailableLocales(level.level as LevelSlug)}
          current={locale}
          basePath={`/academy/levels/${level.level}`}
        />
      </div>
      <LevelSemesterMap level={level.level as LevelSlug} locale={locale} />
    </div>
  );
}
