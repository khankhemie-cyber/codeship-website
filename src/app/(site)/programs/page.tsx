import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import GradeCards from "@/components/booking/GradeCards";
import { PageHero, Section, SectionHeader, BookingBand } from "@/components/ui/Page";
import { pageMetadata } from "@/lib/pageMetadata";
import { breadcrumbSchema } from "@/lib/schema";
import { PROGRAM_STRUCTURE } from "@/data/programs";
import { SEMESTER_WEEKS } from "@/config/offering";

export const metadata: Metadata = pageMetadata({
  title: "Kids Coding Programs by Grade (K–8) | CODEship Academy",
  description:
    "Four coding levels for Kindergarten to Grade 8: Explorers, Builders, Developers and Engineers. Saturdays in Oshawa or live online. CAD $129 per 8-week semester.",
  path: "/programs",
});

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Programs", href: "/programs" },
];

const pathFacts = [
  { value: `${SEMESTER_WEEKS}`, label: "classes per semester" },
  { value: `${PROGRAM_STRUCTURE.semesters}`, label: "semesters per level" },
  { value: "1", label: "capstone project to move up" },
];

const more = [
  {
    title: "Camps",
    desc: "Summer, March Break and PA Day camps.",
    href: "/programs/camps",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80",
    alt: "Children working together at a coding camp",
  },
  {
    title: "Birthday parties",
    desc: "Two hours. Every guest builds a game.",
    href: "/programs/birthday-parties",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80",
    alt: "Children celebrating at a coding birthday party",
  },
  {
    title: "AI & robotics",
    desc: "Hands-on AI and robot projects for ages 8–16.",
    href: "/programs/ai-robotics",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80",
    alt: "A child programming a robot",
  },
  {
    title: "For schools",
    desc: "Clubs, workshops and PA Day programs.",
    href: "/schools",
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80",
    alt: "Students in a school coding workshop",
  },
];

export default function ProgramsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }}
      />

      <PageHero
        crumbs={crumbs}
        eyebrow="Programs"
        title="Coding classes for every grade"
        lead="Four levels take your child from Kindergarten to Grade 8. Each level builds on the last."
      />

      <Section id="journey">
        <SectionHeader eyebrow="Weekly classes" title="Choose by school grade" />
        <GradeCards />
      </Section>

      <Section tone="white">
        <SectionHeader center title="How each level works" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {pathFacts.map((f) => (
            <div key={f.label} className="rounded-2xl bg-[#F4D734] p-8 text-center">
              <p className="text-5xl font-extrabold text-[#001532]">{f.value}</p>
              <p className="text-lg font-semibold text-[#001532] mt-2">{f.label}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="sand">
        <SectionHeader eyebrow="Also available" title="More ways to learn" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {more.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow"
            >
              <div className="relative h-40">
                <Image src={m.image} alt={m.alt} fill className="object-cover" sizes="(max-width: 640px) 100vw, 25vw" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-extrabold text-[#001532] group-hover:text-[#138A9A]">{m.title} →</h3>
                <p className="text-base text-gray-600 mt-2">{m.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <BookingBand />
    </>
  );
}
