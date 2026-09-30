import type { Metadata } from "next";
import { PageHero, Section, SectionHeader, BookingBand } from "@/components/ui/Page";
import { pageMetadata } from "@/lib/pageMetadata";
import { IN_PERSON_VENUE } from "@/data/locations";

export const metadata: Metadata = pageMetadata({
  title: "About Us — Kids Coding School in Oshawa",
  description:
    "CODEship Academy teaches coding, AI and STEM to kids in K–Grade 8. Classes run Saturdays at Core21 in Oshawa and live online across Canada.",
  path: "/about",
});

const beliefs = [
  { title: "Creativity before code", desc: "Kids start with their own idea. Code is the tool that brings it to life." },
  { title: "Real projects", desc: "No copying tutorials. Every child builds something that is truly theirs." },
  { title: "Room for everyone", desc: "Bright, welcoming classes for every child and every learning style." },
  { title: "Skills for school", desc: "Coding strengthens math, reading and problem solving." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="We help kids turn ideas into real projects"
        lead={`CODEship Academy teaches coding, AI and STEM to kids in K–Grade 8. Our home is ${IN_PERSON_VENUE.full}.`}
      />

      <Section>
        <SectionHeader title="What we believe" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {beliefs.map((b) => (
            <div key={b.title} className="bg-white rounded-2xl shadow-sm p-7 border-t-4 border-[#F4D734]">
              <h3 className="text-2xl font-extrabold text-[#001532]">{b.title}</h3>
              <p className="text-lg text-gray-600 mt-3">{b.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="white" narrow>
        <div className="text-center">
          <p className="text-[#0F6F7C] font-bold text-sm uppercase tracking-widest">Our mission</p>
          <p className="text-2xl sm:text-3xl font-bold text-[#001532] leading-snug mt-4">
            Every child has an idea worth building. We give them the skills and the confidence to build it.
          </p>
        </div>
      </Section>

      <BookingBand title="Come build with us" />
    </>
  );
}
