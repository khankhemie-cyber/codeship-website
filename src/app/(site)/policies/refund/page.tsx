import type { Metadata } from "next";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Refund Policy | CODEship Academy",
  description:
    "CODEship Academy's refund policy: full refunds up to 7 days before the first class, no refunds after that, and no makeup classes for missed sessions.",
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
                Registration and payment for CODEship Academy programs are processed securely by{" "}
                <strong>Stripe</strong>, our payment processor. When you register for a class, Stripe collects
                payment and emails your receipt. CODEship Academy manages seat availability for each class.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">2. Full Refunds — Up to 7 Days Before the First Class</h2>
              <p>
                All CODEship Academy programs are <strong>fully refundable up to 7 days before the first
                scheduled class</strong> of the semester you registered for. Cancel within this window and you
                will receive a 100% refund of the program fee — no cancellation fees and no questions asked.
              </p>
              <p className="mt-3">
                Approved refunds are issued to the original payment method through Stripe. Please allow
                5–10 business days for the refund to appear on your statement, depending on your bank or card
                issuer.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">3. Cancellations Within 7 Days of the First Class</h2>
              <p>
                Cancellations made <strong>less than 7 days before the first scheduled class</strong>, or after
                the program has started, are <strong>not eligible for a refund</strong>. Our semesters run for
                8 weeks, and instructor staffing, class sizes, and seat allocations are finalized in the
                week leading up to the first class — a late cancellation means a seat another student could
                have taken goes unused.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">4. Missed Classes — No Makeup Classes</h2>
              <p>
                There are <strong>no makeup classes</strong> for missed sessions in any program. A missed class
                is treated as a <strong>no-show</strong> and is not eligible for a refund, credit, transfer, or
                replacement session. Because each semester is 8 weeks long, every session builds directly
                on the one before it, and our instructors and class schedules are committed for the full
                semester in advance.
              </p>
              <p className="mt-3">
                If your child misses a class, contact us at{" "}
                <a href="mailto:admin@codeshipacademy.com" className="text-[#E5A823] hover:underline">
                  admin@codeshipacademy.com
                </a>{" "}
                and we&apos;ll share what was covered so they can catch up before the next session.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">5. Program Changes or Cancellations by CODEship</h2>
              <p>
                If CODEship Academy cancels a class or program (for example, due to insufficient enrollment or
                instructor availability), registered families will receive a <strong>full refund</strong> — including
                for classes already underway, on a prorated basis for the sessions not delivered — or the option
                to transfer to another available class or location at no charge. If we reschedule a program and
                the new time doesn&apos;t work for your family, you may request a full refund before the first
                rescheduled class.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">6. How to Request a Refund</h2>
              <p>
                To cancel a registration or request a refund, email{" "}
                <a href="mailto:admin@codeshipacademy.com" className="text-[#E5A823] hover:underline">
                  admin@codeshipacademy.com
                </a>{" "}
                with your registration details, or reply to the Stripe payment receipt you received.
                Your cancellation date is the date we receive your request, and we will confirm receipt and the
                outcome of your request in writing.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">7. Your Consumer Rights</h2>
              <p>
                This policy is applied consistently and in good faith for all families. Nothing in this policy
                limits any non-waivable rights you may have under applicable consumer protection legislation in
                your province or territory of residence in Canada (or other applicable law), including rights
                relating to services that are not delivered as agreed.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">8. Questions</h2>
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
