import type { Metadata } from "next";
import ProgramFinder from "@/components/ProgramFinder";

export const metadata: Metadata = {
  title: "Program Finder | Find the Right Coding Program for Your Child",
  description:
    "Answer 4 quick questions to find the best CODEship Academy program for your child based on age, experience, interests, and schedule.",
  alternates: { canonical: "https://www.codeshipacademy.com/program-finder" },
};

export default function ProgramFinderPage() {
  return (
    <div className="bg-[#FAF8F4]">
      <section className="bg-[#001532] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4">Find the Right Program</h1>
          <p className="text-gray-300 text-lg">
            Answer 4 quick questions and we&apos;ll recommend the best CODEship Academy program for your child.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProgramFinder />
        </div>
      </section>
    </div>
  );
}
