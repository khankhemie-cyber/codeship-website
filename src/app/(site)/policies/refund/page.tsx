import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/pageMetadata";
import { REFUND_POLICY_VERSION } from "@/data/catalog";

export const metadata: Metadata = pageMetadata({
  title: "Class Minimum & Refund Policy | CODEship Academy",
  description:
    "CODEship Academy's class minimum and refund policy — when classes run, what happens if they don't, and how to request a refund.",
  path: "/policies/refund",
});

export default function RefundPolicyPage() {
  return (
    <div className="bg-[#FAF8F4]">
      <section className="bg-[#001532] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4">Class Minimum & Refund Policy</h1>
          <p className="text-gray-300">Last updated: July 10, 2026 (version {REFUND_POLICY_VERSION})</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8 text-gray-700 text-sm">
            <p>
              CODEship Academy runs each class or cohort only when it reaches a minimum enrollment of{" "}
              <strong>50% of the class&apos;s capacity</strong>.
            </p>

            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">If a class doesn&apos;t reach the minimum</h2>
              <p>
                If a class does not reach the 50% minimum by 3 business days before its start date, we may:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>reschedule it,</li>
                <li>offer a transfer to another class, location, or online session,</li>
                <li>offer account credit, or</li>
                <li>cancel the class.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">If we cancel, or you decline an alternative</h2>
              <p>
                If we cancel a class — or you decline an offered alternative — you receive a{" "}
                <strong>full refund</strong> of the fees paid for that class, to your original payment method,
                within 10 business days (and no later than 15 days, as required under Ontario&apos;s Consumer
                Protection Act).
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">Family-initiated cancellations</h2>
              <p>
                Full refund if you cancel 7 or more days before the start date. After that, account credit or a
                prorated refund for sessions not yet delivered.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">How to request a refund</h2>
              <p>
                Email{" "}
                <a href="mailto:admin@codeshipacademy.com" className="text-[#E5A823] hover:underline">
                  admin@codeshipacademy.com
                </a>{" "}
                with your order number. Refunds go to the original payment method.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">Your rights</h2>
              <p>
                This policy is in addition to your rights under applicable consumer-protection law in your province
                (Ontario, British Columbia, Alberta, Québec) or country. Québec residents:{" "}
                <Link href="/politiques/remboursement" className="text-[#E5A823] hover:underline">
                  la version française fait foi
                </Link>
                .
              </p>
            </div>

            <p className="text-xs text-gray-500 pt-4 border-t border-gray-100">
              See also our{" "}
              <Link href="/terms" className="text-[#138A9A] hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="text-[#138A9A] hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
