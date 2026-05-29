import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | CODEship Academy",
  description: "CODEship Academy's privacy policy — how we collect, use, and protect your personal information.",
  alternates: { canonical: "https://www.codeshipacademy.com/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#FAF8F4]">
      <section className="bg-[#071B3B] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-300">Last updated: January 2025</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8 text-gray-700">
            <div>
              <h2 className="text-xl font-bold text-[#071B3B] mb-3">1. Information We Collect</h2>
              <p className="mb-3">
                CODEship Academy collects personal information that you voluntarily provide when you:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>Enroll a child in our programs</li>
                <li>Contact us through our website forms</li>
                <li>Subscribe to our newsletter</li>
                <li>Inquire about franchise opportunities</li>
                <li>Request school partnership information</li>
              </ul>
              <p className="mt-3 text-sm">
                Information we may collect includes: name, email address, phone number, child&apos;s name and age, city,
                and any information you include in messages to us.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#071B3B] mb-3">2. How We Use Your Information</h2>
              <p className="text-sm mb-3">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>Respond to your inquiries and requests</li>
                <li>Process program enrollments</li>
                <li>Send program updates and information you have requested</li>
                <li>Improve our programs and services</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#071B3B] mb-3">3. Children&apos;s Privacy</h2>
              <p className="text-sm">
                We take the privacy of children seriously. We do not knowingly collect personal information directly
                from children under 13 without verifiable parental consent. Information about children enrolled in our
                programs is collected from parents or guardians only and is used solely for program delivery purposes.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#071B3B] mb-3">4. Information Sharing</h2>
              <p className="text-sm">
                We do not sell, trade, or rent your personal information to third parties. We may share information with
                service providers who assist in our operations (such as email service providers), who are contractually
                obligated to keep your information confidential and use it only to provide services to us.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#071B3B] mb-3">5. Cookies</h2>
              <p className="text-sm">
                Our website uses cookies to improve your experience. Cookies are small files placed on your device
                that help us remember your preferences and understand how you use our site. You can control cookie
                settings through your browser. Our cookie consent banner allows you to accept or decline non-essential
                cookies.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#071B3B] mb-3">6. Data Security</h2>
              <p className="text-sm">
                We implement reasonable security measures to protect your personal information. However, no internet
                transmission is completely secure. We encourage you to use strong passwords and to be cautious about
                what information you share online.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#071B3B] mb-3">7. Your Rights</h2>
              <p className="text-sm mb-3">You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your information (subject to legal obligations)</li>
                <li>Withdraw consent to receive marketing communications</li>
              </ul>
              <p className="mt-3 text-sm">
                To exercise these rights, please contact us at admin@codeshipacademy.com.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#071B3B] mb-3">8. Contact Us</h2>
              <p className="text-sm">
                If you have questions about this privacy policy or our data practices, please contact us at:{" "}
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
