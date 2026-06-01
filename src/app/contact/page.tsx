import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact CODEship Academy",
  description:
    "Get in touch with CODEship Academy. Questions about programs, school partnerships, franchise opportunities, or general inquiries.",
  alternates: { canonical: "https://www.codeshipacademy.com/contact" },
};

export default function ContactPage() {
  return (
    <div className="bg-[#FAF8F4]">
      <section className="bg-[#001532] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Get in Touch</h1>
          <p className="text-gray-300 text-xl max-w-xl mx-auto">
            Questions about programs, school partnerships, or franchise opportunities? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-[#001532] mb-6">Send Us a Message</h2>
              <ContactForm />
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#001532] mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#E5A823]/20 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-lg">📧</span>
                    </div>
                    <div>
                      <p className="font-semibold text-[#001532]">Email</p>
                      <p className="text-gray-600">admin@codeshipacademy.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#E5A823]/20 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-lg">🏢</span>
                    </div>
                    <div>
                      <p className="font-semibold text-[#001532]">Headquarters</p>
                      <p className="text-gray-600">Canada</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#001532] rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-3">Quick Links</h3>
                <ul className="space-y-2">
                  {[
                    { label: "Find a Program", href: "/program-finder" },
                    { label: "School Partnerships", href: "/schools" },
                    { label: "Franchise Information", href: "/franchise" },
                    { label: "Find a Location", href: "/locations" },
                  ].map((link) => (
                    <li key={link.href}>
                      <a href={link.href} className="text-gray-300 hover:text-[#E5A823] transition-colors text-sm flex items-center gap-2">
                        <span>→</span> {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#138A9A]/10 rounded-2xl p-6">
                <h3 className="font-bold text-[#001532] mb-2">Response Time</h3>
                <p className="text-gray-600 text-sm">
                  We aim to respond to all inquiries within 1–2 business days. For urgent program questions, please
                  contact your local CODEship location directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
