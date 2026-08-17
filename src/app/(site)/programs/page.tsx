import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JourneyMap from "@/components/JourneyMap";
import AlignmentStrip from "@/components/AlignmentStrip";
import { pageMetadata } from "@/lib/pageMetadata";
import { breadcrumbSchema } from "@/lib/schema";
import Breadcrumbs from "@/components/Breadcrumbs";
import { TUTORING } from "@/data/tutoring";

export const metadata: Metadata = pageMetadata({
  title: "Coding Classes for Kids — Programs by Age | CODEship Academy",
  description:
    "Kids coding classes online and in Canada for ages 4–16: weekly classes, camps, school workshops, and AI & robotics. Project-based, small-group. Flat CAD $129/semester (8 weekly classes).",
  path: "/programs",
});

const programs = [
  {
    title: "Weekly Classes",
    href: "/programs/weekly-classes",
    age: "Ages 5–16",
    duration: "60–90 min per session",
    format: "Ongoing weekly",
    dotColour: "bg-[#001532]",
    borderColour: "border-l-4 border-[#001532]",
    description:
      "Our flagship ongoing program. Children attend weekly sessions where they develop coding skills, digital creativity, and project-building confidence over time. Each child works at their own pace on personally meaningful projects.",
    highlights: [
      "Beginner to advanced pathways",
      "Visual and text-based coding",
      "Games, apps, websites, and more",
      "Inclusive, encouraging environment",
      "Year-round enrollment available",
    ],
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80",
    imageAlt: "Children collaborating on coding projects in weekly class",
  },
  {
    title: "Summer & Holiday Camps",
    href: "/programs/camps",
    age: "Ages 6–14",
    duration: "Full-day or half-day",
    format: "Multi-day intensives",
    dotColour: "bg-[#E5A823]",
    borderColour: "border-l-4 border-[#E5A823]",
    description:
      "Immersive multi-day camp experiences where children build ambitious projects from start to finish. Available during summer, March Break, and PA Days. Week-long camps include a final project showcase.",
    highlights: [
      "Summer, March Break & PA Day options",
      "Theme-based camps (Games, AI, Web, etc.)",
      "Full-day and half-day formats",
      "Final project showcase",
      "Small group sizes",
    ],
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80",
    imageAlt: "Diverse children learning together at summer coding camp",
  },
  {
    title: "School Workshops",
    href: "/programs/school-workshops",
    age: "All school ages",
    duration: "1 hour to full day",
    format: "In-school and after-school",
    dotColour: "bg-[#138A9A]",
    borderColour: "border-l-4 border-[#138A9A]",
    description:
      "Curriculum-aligned coding and STEM workshops brought directly to your school. From single-period enrichment sessions to full after-school clubs, CODEship works with schools to build lasting digital education partnerships.",
    highlights: [
      "After-school coding clubs",
      "PA Day and March Break programs",
      "In-class STEM enrichment",
      "Curriculum-aligned content",
      "All equipment provided",
    ],
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&q=80",
    imageAlt: "Students participating in school STEM workshop",
  },
  {
    title: "Birthday Parties",
    href: "/programs/birthday-parties",
    age: "Ages 6–14",
    duration: "2 hours",
    format: "Weekend bookings",
    dotColour: "bg-[#6E43A8]",
    borderColour: "border-l-4 border-[#6E43A8]",
    description:
      "A truly unique birthday experience where the whole group builds something together — a game, animation, or interactive story — guided by our instructors. Every child goes home with their own creation.",
    highlights: [
      "2-hour hands-on coding party",
      "Choose your theme: Games, AI, Animation",
      "Up to 12 participants",
      "All materials included",
      "Digital creation to take home",
    ],
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80",
    imageAlt: "Children celebrating at a coding birthday party",
  },
  {
    title: "AI & Robotics",
    href: "/programs/ai-robotics",
    age: "Ages 8–16",
    duration: "60–90 min per session",
    format: "Weekly or intensive",
    dotColour: "bg-[#138A9A]",
    borderColour: "border-l-4 border-[#138A9A]",
    description:
      "Explore the world of artificial intelligence and physical robotics through hands-on projects. Students build AI models, program robots, and explore how intelligent systems work — through real, creative project work.",
    highlights: [
      "Hands-on AI model building",
      "Robot programming challenges",
      "AI ethics and critical thinking",
      "Physical computing projects",
      "Integration with coding skills",
    ],
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80",
    imageAlt: "Child exploring robotics and AI technology",
  },
];

export default function ProgramsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([{ name: "Home", href: "/" }, { name: "Programs", href: "/programs" }])),
        }}
      />
    <div className="bg-[#FAF8F4]">
      {/* Hero */}
      <section className="bg-[#001532] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Programs", href: "/programs" }]} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Programs for Every Child
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            From weekly after-school classes to immersive camps and school workshops, CODEship Academy has a program
            that fits your child, your schedule, and your community.
          </p>
        </div>
      </section>

      {/* The CODEship Journey — K–8 grade-band programs */}
      <section id="journey" className="py-20 bg-[#FAF8F4] scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <JourneyMap />
          <div className="mt-10">
            <AlignmentStrip />
          </div>
        </div>
      </section>

      {/* Programs List */}
      <section className="py-20 bg-[#F1EEE8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#001532] mb-4">Program Formats</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Every level of the CODEship Journey above is delivered through these formats — pick the schedule that
            works for your family.
          </p>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {programs.map((prog, i) => (
            <div
              key={prog.href}
              className={`bg-white rounded-2xl shadow-md overflow-hidden flex flex-col md:flex-row ${
                i % 2 === 1 ? "md:flex-row-reverse" : ""
              } ${prog.borderColour}`}
            >
              <div className="relative md:w-48 shrink-0 h-48 md:h-auto">
                <Image
                  src={prog.image}
                  alt={prog.imageAlt}
                  fill
                  className="object-cover"
                  sizes="192px"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-[#001532]/40" />
              </div>
              <div className="p-8 flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h2 className="text-2xl font-bold text-[#001532]">{prog.title}</h2>
                  <span className="text-xs bg-[#E5A823]/20 text-[#001532] font-semibold px-2 py-1 rounded">
                    {prog.age}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{prog.format}</span>
                </div>
                <p className="text-gray-600 mb-4">{prog.description}</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-5">
                  {prog.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className={`w-2 h-2 ${prog.dotColour} rounded-full shrink-0`} />
                      {h}
                    </li>
                  ))}
                </ul>
                <Link
                  href={prog.href}
                  className="bg-[#E5A823] text-[#001532] font-bold px-6 py-3 rounded-xl hover:bg-[#d4941f] transition-colors inline-block"
                >
                  Learn More
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Math & Reading Tutoring */}
      <section id="tutoring" className="py-20 bg-[#FAF8F4] scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
          <p className="text-[#E5A823] font-bold text-sm uppercase tracking-widest mb-2">Academic Skill-Building</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#001532] mb-4">Math &amp; Reading Tutoring</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We also now offer dedicated K–8 tutoring alongside our coding and AI programs — same 8-week weekly format,
            same flat CAD $129/semester, in-person in Oshawa or online.
          </p>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {TUTORING.map((t) => (
            <div
              key={t.slug}
              className="bg-white rounded-2xl shadow-md p-8 border-l-4"
              style={{ borderLeftColor: t.accentColour }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h3 className="text-2xl font-bold text-[#001532]">{t.label}</h3>
                <span className="text-xs bg-[#E5A823]/20 text-[#001532] font-semibold px-2 py-1 rounded">
                  Grades {t.gradeBand}
                </span>
              </div>
              <p className="text-gray-600 mb-5">{t.summary}</p>
              <Link
                href={`/programs/${t.slug}`}
                className="bg-[#E5A823] text-[#001532] font-bold px-6 py-3 rounded-xl hover:bg-[#d4941f] transition-colors inline-block"
              >
                Learn More
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#001532] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Not Sure Which Program?</h2>
          <p className="text-gray-300 mb-8">Take our 2-minute program finder quiz to get a personalized recommendation.</p>
          <Link
            href="/program-finder"
            className="bg-[#E5A823] text-[#001532] font-bold px-8 py-4 rounded-xl hover:bg-[#d4941f] transition-colors inline-block"
          >
            Find My Program
          </Link>
        </div>
      </section>
    </div>
    </>
  );
}
