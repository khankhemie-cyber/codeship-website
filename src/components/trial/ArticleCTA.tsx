"use client";

import Link from "next/link";
import { useTrialPhase } from "./useTrialPhase";

/** End-of-article call to action: the free trial while it runs, semester enrolment after. */
export default function ArticleCTA() {
  const trial = useTrialPhase() !== "closed";
  return (
    <div className="mt-12 bg-[#001532] p-8 text-center text-white">
      <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">
        {trial ? "Try a free coding class this November" : "Coding classes for K–Grade 8"}
      </h3>
      <p className="text-lg text-gray-200 mb-6">
        {trial
          ? "One free class per student. In person in Oshawa or live online. Book by November 30."
          : "Saturdays in Oshawa or live online across Canada."}
      </p>
      <Link
        href={trial ? "/#free-trial" : "/#book"}
        className="bg-[#F4D734] text-[#001532] text-lg font-bold px-7 py-3.5 hover:bg-[#E6C51E] transition-colors inline-block"
      >
        {trial ? "Claim a free class" : "Enroll Now"}
      </Link>
    </div>
  );
}
