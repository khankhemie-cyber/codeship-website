import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { PageHero, Section } from "@/components/ui/Page";
import { pageMetadata } from "@/lib/pageMetadata";
import { IN_PERSON_VENUE } from "@/data/locations";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us — Oshawa",
  description: `Questions about classes, camps, parties or schools? Email admin@codeshipacademy.com or visit us at ${IN_PERSON_VENUE.full}.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="We're happy to help" lead="Send a message and we will reply within 1–2 business days." />

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-extrabold text-[#001532] mb-6">Send a message</h2>
            <ContactForm />
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Email</h2>
              <a href="mailto:admin@codeshipacademy.com" className="block text-xl font-bold text-[#001532] mt-2 hover:text-[#138A9A]">
                admin@codeshipacademy.com
              </a>
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Saturday classes</h2>
              <address className="not-italic text-xl font-bold text-[#001532] mt-2 leading-snug">
                {IN_PERSON_VENUE.building}
                <br />
                {IN_PERSON_VENUE.street}
                <br />
                {IN_PERSON_VENUE.city}, Ontario
              </address>
              <a
                href={IN_PERSON_VENUE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-lg font-semibold text-[#0f6f7c] underline underline-offset-2"
              >
                Get directions
              </a>
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Quick links</h2>
              <ul className="mt-3 space-y-2">
                {[
                  { label: "Book a class", href: "/#book" },
                  { label: "Find the right level", href: "/program-finder" },
                  { label: "For schools", href: "/schools" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-lg font-semibold text-[#001532] hover:text-[#138A9A]">
                      {l.label} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
