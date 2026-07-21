import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CURRICULUM_LEVELS, getAvailableLocales, getLocalizedLevel, type Locale } from "@/data/academy/curriculum";
import ProjectSubmission from "@/components/academy/ProjectSubmission";
import LocaleSwitcher from "@/components/academy/LocaleSwitcher";

export const runtime = "edge";

export function generateStaticParams() {
  return CURRICULUM_LEVELS.flatMap((l) => l.projects.map((p) => ({ projectId: p.id })));
}

function findProject(projectId: string) {
  for (const level of CURRICULUM_LEVELS) {
    const project = level.projects.find((p) => p.id === projectId);
    if (project) return { level: level.level, project };
  }
  return undefined;
}

export async function generateMetadata({ params }: { params: { projectId: string } }): Promise<Metadata> {
  const found = findProject(params.projectId);
  return { title: found?.project.title ?? "Project", robots: { index: false, follow: false } };
}

export default function ProjectPage({
  params,
  searchParams,
}: {
  params: { projectId: string };
  searchParams: { lang?: string };
}) {
  const found = findProject(params.projectId);
  if (!found) notFound();
  const locale: Locale = searchParams.lang === "fr" ? "fr" : "en";
  const langSuffix = locale === "fr" ? "?lang=fr" : "";

  const curriculum = getLocalizedLevel(found.level, locale);
  const project = curriculum.projects.find((p) => p.id === params.projectId)!;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <p className="text-sm">
          <Link href={`/academy/levels/${found.level}/${project.semester}${langSuffix}`} className="text-[#138A9A] hover:underline">
            ← {locale === "fr" ? "Semestre" : "Semester"} {project.semester}
          </Link>
        </p>
        <LocaleSwitcher available={getAvailableLocales(found.level)} current={locale} basePath={`/academy/projects/${project.id}`} />
      </div>
      <h1 className="mt-2 text-2xl font-bold text-[#001532]">{project.title}</h1>
      <p className="mt-2 text-[#2E3440]">{project.brief}</p>
      <p className="mt-2 text-sm text-[#2E3440]">
        <strong>{locale === "fr" ? "Réussite" : "Success criteria"}:</strong> {project.successCriteria}
      </p>
      {project.extension && (
        <p className="mt-2 text-sm text-[#2E3440]">
          <strong>{locale === "fr" ? "Enrichissement" : "Extension"}:</strong> {project.extension}
        </p>
      )}
      <ProjectSubmission project={project} locale={locale} />
    </div>
  );
}
