import type { Metadata } from "next";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service | CODEship Academy",
  description: "CODEship Academy's terms of service for website use, program enrollment, and franchise inquiries.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="bg-[#FAF8F4]">
      <section className="bg-[#001532] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4">Terms of Service</h1>
          <p className="text-gray-300">Last updated: January 2025</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8 text-gray-700 text-sm">
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the CODEship Academy website (codeshipacademy.com), you agree to be bound by
                these Terms of Service. If you do not agree to these terms, please do not use our website.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">2. Website Use</h2>
              <p>
                The content on this website is for informational purposes only. CODEship Academy grants you a limited,
                non-exclusive, non-transferable license to access and use the website for personal, non-commercial
                purposes. You may not reproduce, distribute, or create derivative works from website content without
                express written permission.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">3. Franchise Information Disclaimer</h2>
              <p>
                <strong>IMPORTANT:</strong> This website is for informational purposes only and does not constitute
                a franchise offering. Franchise offerings are made only through a Franchise Disclosure Document
                (FDD) where required by law. No earnings claims are made or implied. Prospective franchisees should
                conduct thorough due diligence and seek independent legal and financial advice before making any
                franchise investment.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">4. Program Enrollment</h2>
              <p>
                Program enrollment is subject to separate enrollment agreements, which include specific terms and
                conditions, cancellation policies, and refund policies. Details are provided at the time of
                enrollment.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">5. Intellectual Property</h2>
              <p>
                The CODEship Academy name, logo, curriculum, and all website content are the intellectual property
                of CODEship Academy. Unauthorized use is prohibited.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">6. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, CODEship Academy shall not be liable for any indirect,
                incidental, special, or consequential damages arising from your use of or inability to use this
                website or its content.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">7. Governing Law</h2>
              <p>
                These terms are governed by the laws of Ontario, Canada. Any disputes shall be resolved in the
                courts of Ontario.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">8. Changes to Terms</h2>
              <p>
                We may update these terms from time to time. Continued use of the website after changes constitutes
                acceptance of the updated terms.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">9. Contact</h2>
              <p>
                Questions about these terms should be directed to:{" "}
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
