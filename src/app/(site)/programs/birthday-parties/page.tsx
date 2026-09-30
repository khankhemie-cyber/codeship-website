import type { Metadata } from "next";
import { PageHero, Section, SectionHeader, CheckList, ButtonLink } from "@/components/ui/Page";
import { pageMetadata } from "@/lib/pageMetadata";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = pageMetadata({
  title: "Kids Coding Birthday Parties in Oshawa | CODEship Academy",
  description:
    "A two-hour coding birthday party for ages 6–14. Up to 12 guests. Every child builds their own game or animation to take home.",
  path: "/programs/birthday-parties",
});

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Programs", href: "/programs" },
  { name: "Birthday parties", href: "/programs/birthday-parties" },
];

const steps = [
  { title: "Pick a theme", desc: "Game design, animation, AI art or web design." },
  { title: "Everyone builds", desc: "An instructor guides each guest through their own project." },
  { title: "Share and celebrate", desc: "Guests show their creations. Then the celebration begins." },
];

const included = [
  "Two hours with a CODEship instructor",
  "Up to 12 guests, ages 6–14",
  "All equipment provided",
  "A digital copy of every project",
  "No coding experience needed",
];

export default function BirthdayPartiesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      <PageHero
        crumbs={crumbs}
        eyebrow="Birthday parties"
        title="A birthday where every guest builds a game"
        lead="Two hours of creating, sharing and celebrating. Ages 6–14."
      />

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <SectionHeader title="How it works" />
            <ol className="space-y-6">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F4D734] text-lg font-extrabold text-[#001532]">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-[#001532]">{s.title}</h3>
                    <p className="text-lg text-gray-600 mt-1">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-extrabold text-[#001532] mb-6">What&apos;s included</h2>
            <CheckList items={included} />
          </div>
        </div>
      </Section>

      <section className="bg-[#001532]">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Book a party</h2>
          <p className="text-lg text-gray-200 mt-4">Tell us your date and we will confirm availability.</p>
          <div className="mt-8">
            <ButtonLink href="/contact">Check a Date</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
