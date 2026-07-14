import type { Metadata } from "next";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Refund Policy | CODEship Academy",
  description: "CODEship Academy's refund policy for program registrations processed through Corsizio.",
  path: "/policies/refund",
});

export default function RefundPolicyPage() {
  return (
    <div className="bg-[#FAF8F4]">
      <section className="bg-[#001532] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4">Refund Policy</h1>
          <p className="text-gray-300">Last updated: July 2026</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8 text-gray-700 text-sm">
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">1. Registration & Payment</h2>
              <p>
                Registration and payment for CODEship Academy programs are processed by{" "}
                <strong>Corsizio</strong>, our registration and payment partner — not directly on this website.
                When you register for a class, Corsizio collects payment and sends your confirmation and
                receipt. Corsizio also manages seat availability and waitlists for each class.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">2. Requesting a Refund</h2>
              <p>
                To request a refund or cancellation, email{" "}
                <a href="mailto:admin@codeshipacademy.com" className="text-[#E5A823] hover:underline">
                  admin@codeshipacademy.com
                </a>{" "}
                with your registration details, or reply to the confirmation email you received from Corsizio.
                Approved refunds are issued back to the original payment method through Corsizio.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">3. Refund Windows</h2>
              <p>
                The specific refund window for a given class (for example, how many days before the first
                session a full or partial refund is available) is shown at checkout and confirmed in your
                Corsizio registration email. Please refer to that confirmation for the exact terms that apply
                to your registration.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">4. Missed Classes & Withdrawal</h2>
              <p>
                If your child needs to withdraw from a program after it has started, or misses individual
                sessions, contact us at{" "}
                <a href="mailto:admin@codeshipacademy.com" className="text-[#E5A823] hover:underline">
                  admin@codeshipacademy.com
                </a>{" "}
                and we&apos;ll work with you on next steps, consistent with the terms confirmed at
                registration.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">5. Program Changes or Cancellations by CODEship</h2>
              <p>
                If CODEship Academy cancels a class or program (for example, due to insufficient enrollment),
                registered families will be offered a full refund or the option to transfer to another
                available class or location.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">6. Questions</h2>
              <p>
                Questions about this refund policy or an existing registration should be directed to:{" "}
                <a href="mailto:admin@codeshipacademy.com" className="text-[#E5A823] hover:underline">
                  admin@codeshipacademy.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
