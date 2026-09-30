import type { Metadata } from "next";
import { PageHero, Section, CheckList, BookingBand } from "@/components/ui/Page";
import { pageMetadata } from "@/lib/pageMetadata";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = pageMetadata({
  title: "AI & Robotics Classes for Kids | Ages 8–16 | CODEship Academy",
  description:
    "Hands-on AI and robotics for kids ages 8–16. Kids train simple AI models, program robots and learn to use AI responsibly.",
  path: "/programs/ai-robotics",
});

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Programs", href: "/programs" },
  { name: "AI & robotics", href: "/programs/ai-robotics" },
];

const tracks = [
  {
    title: "AI",
    items: ["How machines learn from data", "Image and sound classifiers", "Chatbot basics", "AI ethics and bias"],
  },
  {
    title: "Robotics",
    items: ["Build and design a robot", "Sensors and control logic", "Mission-based challenges", "Test, fix and improve"],
  },
];

export default function AIRoboticsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      <PageHero
        crumbs={crumbs}
        eyebrow="Ages 8–16"
        title="AI and robotics, hands on"
        lead="Kids learn how AI really works by building it. They program robots to complete real missions."
      />

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tracks.map((t) => (
            <div key={t.title} className="bg-white shadow-sm p-8">
              <h2 className="text-2xl font-extrabold text-[#001532] mb-6">{t.title}</h2>
              <CheckList items={t.items} />
            </div>
          ))}
        </div>
        <p className="text-lg text-gray-700 mt-10 max-w-2xl">
          AI is built into our Developers (Grades 4–5) and Engineers (Grades 6–8) levels. Enroll in either level to start.
        </p>
      </Section>

      <BookingBand />
    </>
  );
}
