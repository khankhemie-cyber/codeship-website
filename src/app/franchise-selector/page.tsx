import type { Metadata } from "next";
import FranchiseSelector from "@/components/FranchiseSelector";

export const metadata: Metadata = {
  title: "Franchise Model Selector | CODEship Academy",
  description:
    "Not sure which CODEship franchise model is right for you? Answer 4 questions and get a personalized recommendation.",
  alternates: { canonical: "https://www.codeshipacademy.com/franchise-selector" },
};

export default function FranchiseSelectorPage() {
  return (
    <div className="bg-[#FAF8F4]">
      <section className="bg-[#071B3B] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4">Find Your Franchise Model</h1>
          <p className="text-gray-300 text-lg">
            Answer 4 questions about your goals, budget, and preferred operating style — and we&apos;ll recommend the
            best CODEship franchise model for you.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <FranchiseSelector />
          <p className="text-xs text-gray-400 text-center mt-6">
            This tool is for informational purposes only and does not constitute a franchise offering. Franchise
            offerings are made only through a Franchise Disclosure Document where required by law.
          </p>
        </div>
      </section>
    </div>
  );
}
