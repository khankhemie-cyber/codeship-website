import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProgram } from "@/data/programs";
import { WORKBOOK_PROGRAMS, isWorkbookProgram, workbookFileName, workbookDownloadPath } from "@/lib/workbooks";
import { PageHero, Section } from "@/components/ui/Page";
import WorkbookGate from "@/components/WorkbookGate";

interface Props {
  params: { program: string };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return WORKBOOK_PROGRAMS.map((program) => ({ program }));
}

export function generateMetadata({ params }: Props): Metadata {
  const program = getProgram(params.program);
  return {
    title: `${program?.level ?? "Student"} Workbook | CODEship Academy`,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default function ProgramWorkbookPage({ params }: Props) {
  const program = getProgram(params.program);
  if (!program || !isWorkbookProgram(program.slug)) notFound();

  return (
    <>
      <PageHero
        eyebrow={`${program.level} · ${program.gradeBand}`}
        title={`${program.level} Semester 1 workbook`}
        lead="Download it once, save it on your computer, and fill it in class by class."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Workbooks", href: "/workbooks/" },
          { name: program.level, href: `/workbooks/${program.slug}/` },
        ]}
      />
      <Section tone="cream">
        <WorkbookGate
          program={program.slug}
          level={program.level}
          fileUrl={workbookDownloadPath(program.slug)}
          fileName={workbookFileName(program.slug)}
        />
      </Section>
    </>
  );
}
