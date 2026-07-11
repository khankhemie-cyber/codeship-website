import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "You're Enrolled! | CODEship Academy",
  description: "Your CODEship Academy enrollment and payment are confirmed.",
  path: "/register/success",
  noindex: true,
});

export default function RegisterSuccessPage() {
  return (
    <div className="bg-[#FAF8F4] min-h-[60vh]">
      <section className="bg-[#001532] py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4">You&apos;re Enrolled!</h1>
          <p className="text-gray-300 text-lg">
            Your payment was successful and your spot is confirmed.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-md p-8 text-center space-y-4">
            <p className="text-gray-700">
              A receipt and confirmation email are on their way from Stripe and CODEship Academy, including a copy
              of the{" "}
              <Link href="/policies/refund" className="text-[#138A9A] font-semibold hover:underline">
                Class Minimum &amp; Refund Policy
              </Link>{" "}
              you agreed to at checkout.
            </p>
            <p className="text-gray-500 text-sm">
              Questions about your enrollment? Email{" "}
              <a href="mailto:admin@codeshipacademy.com" className="text-[#E5A823] hover:underline">
                admin@codeshipacademy.com
              </a>
              .
            </p>
            <Link
              href="/programs"
              className="inline-block mt-2 bg-[#E5A823] text-[#001532] font-bold px-6 py-3 rounded-xl hover:bg-[#d4941f] transition-colors"
            >
              Explore More Programs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
