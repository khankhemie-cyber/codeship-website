import type { Metadata } from "next";
import { PageHero, Section, SectionHeader, ButtonLink } from "@/components/ui/Page";
import { pageMetadata } from "@/lib/pageMetadata";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = pageMetadata({
  title: "Kids Coding Camps in Oshawa | Summer, March Break & PA Day",
  description:
    "Coding and STEM camps for kids in Oshawa and Durham Region. Summer weeks, March Break and PA Day workshops. Kids build and present their own projects.",
  path: "/programs/camps",
});

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Programs", href: "/programs" },
  { name: "Camps", href: "/programs/camps" },
];

const camps = [
  { title: "Summer camp", when: "July – August", length: "Monday to Friday", desc: "A week of building that ends with a project showcase." },
  { title: "March Break camp", when: "March Break week", length: "Full or half week", desc: "Pick a track and build something big over the break." },
  { title: "PA Day workshops", when: "School PA days", length: "Full or half day", desc: "One focused day of building on a day off school." },
];

const tracks = ["Game design", "Websites", "AI projects", "Robotics", "App prototypes", "Animation"];

export default function CampsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      <PageHero
        crumbs={crumbs}
        eyebrow="Camps"
        title="Coding camps for school breaks"
        lead="Kids spend the day building a real project. They finish by showing it off."
      />

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {camps.map((c) => (
            <div key={c.title} className="bg-white rounded-2xl shadow-sm p-7">
              <h2 className="text-2xl font-extrabold text-[#001532]">{c.title}</h2>
              <p className="text-base font-semibold text-[#138A9A] mt-2">
                {c.when} · {c.length}
              </p>
              <p className="text-lg text-gray-600 mt-3">{c.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="white">
        <SectionHeader center title="Camp tracks" lead="Each camp focuses on one track." />
        <div className="flex flex-wrap justify-center gap-3">
          {tracks.map((t) => (
            <span key={t} className="bg-[#FAF8F4] border border-gray-200 text-[#001532] text-lg font-semibold px-5 py-3 rounded-full">
              {t}
            </span>
          ))}
        </div>
      </Section>

      <section className="bg-[#001532]">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Get upcoming camp dates</h2>
          <p className="text-lg text-gray-200 mt-4">Send us a note and we will share the next camp dates.</p>
          <div className="mt-8">
            <ButtonLink href="/contact">Ask About Camps</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
