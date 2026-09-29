import type { Metadata } from "next";
import ProgramFinder from "@/components/ProgramFinder";
import { PageHero, Section } from "@/components/ui/Page";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Which Coding Level Fits My Child? | CODEship Academy",
  description: "Answer two quick questions to find the right CODEship coding level for your child in K–Grade 8.",
  path: "/program-finder",
});

export default function ProgramFinderPage() {
  return (
    <>
      <PageHero eyebrow="Quick quiz" title="Find the right level" lead="Two questions. Ten seconds." />
      <Section narrow>
        <ProgramFinder />
      </Section>
    </>
  );
}
