import type { Metadata } from "next";
import RegistrationForm from "@/components/RegistrationForm";

export const metadata: Metadata = {
  title: "Register | CODEship Academy",
  description:
    "Register your child for CODEship Academy coding, AI, and STEM programs. Weekly classes, camps, school workshops, and more.",
  alternates: { canonical: "https://www.codeshipacademy.com/register" },
};

export default function RegisterPage() {
  return (
    <div className="bg-[#FAF8F4]">
      <section className="bg-[#071B3B] py-20">
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
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-[#071B3B] mb-6 text-center">Program Registration</h2>
            <RegistrationForm />
          </div>
        </div>
      </section>
    </div>
  );
}
