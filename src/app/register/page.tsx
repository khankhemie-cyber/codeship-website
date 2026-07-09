import type { Metadata } from "next";
import RegistrationForm from "@/components/RegistrationForm";
import { getProgram } from "@/data/programs";
import { locationLabel, type LocationValue } from "@/data/locations";

export const metadata: Metadata = {
  title: "Register | CODEship Academy",
  description:
    "Register your child for CODEship Academy coding, AI, and STEM programs. Weekly classes, camps, school workshops, and more.",
  alternates: { canonical: "https://www.codeshipacademy.com/register" },
};

interface Props {
  searchParams: { program?: string; location?: string };
}

export default function RegisterPage({ searchParams }: Props) {
  const program = searchParams.program ? getProgram(searchParams.program) : undefined;
  const location = searchParams.location as LocationValue | undefined;

  return (
    <div className="bg-[#FAF8F4]">
      <section className="bg-[#001532] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Register Now
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            Complete the form below and a member of our team will be in touch to confirm your spot and answer any questions.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {program && (
            <div className="bg-[#E5A823]/15 border border-[#E5A823]/40 rounded-2xl px-6 py-4 mb-6 text-center">
              <p className="text-[#001532] text-sm">
                Registering for <strong>{program.level}</strong> ({program.gradeBand})
                {location && <> — {locationLabel(location)}</>}
              </p>
            </div>
          )}
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-[#001532] mb-6 text-center">Program Registration</h2>
            <RegistrationForm />
          </div>
        </div>
      </section>
    </div>
  );
}
