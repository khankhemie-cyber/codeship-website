import type { Metadata } from "next";
import Link from "next/link";
import { PROGRAMS } from "@/data/programs";
import { WORKBOOK_PROGRAMS } from "@/lib/workbooks";
import { PageHero, Section } from "@/components/ui/Page";

export const metadata: Metadata = {
  title: "Student Workbooks | CODEship Academy",
  robots: { index: false, follow: false, nocache: true },
};

export default function WorkbooksPage() {
  const programs = PROGRAMS.filter((p) => WORKBOOK_PROGRAMS.includes(p.slug));
  return (
    <>
      <PageHero
        eyebrow="Students and families"
        title="Semester 1 workbooks"
        lead="Pick your program, enter the password from your instructor, then download your workbook and fill it in on your computer."
      />
      <Section tone="cream">
        <div className="grid gap-5 sm:grid-cols-2">
          {programs.map((p) => (
            <Link
              key={p.slug}
              href={`/workbooks/${p.slug}/`}
              className="group block bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              style={{ borderTop: `6px solid ${p.accentColour}` }}
            >
              <p className="text-sm font-bold uppercase tracking-widest text-[#0F6F7C]">{p.gradeBand}</p>
              <h2 className="font-display text-2xl font-extrabold text-[#001532] mt-1">{p.level}</h2>
              <p className="text-base text-gray-600 mt-2">Semester 1 workbook</p>
              <span className="inline-block mt-4 font-bold text-[#001532] group-hover:underline">Open →</span>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
