import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FAQAccordion from "@/components/FAQAccordion";
import NewsletterForm from "@/components/NewsletterForm";
import ScrollReveal from "@/components/ScrollReveal";
import TestimonialMarquee from "@/components/TestimonialMarquee";
import { websiteSchema, organizationSchema, faqSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "CODEship Academy | Kids Coding, AI & STEM Programs",
  description:
    "CODEship Academy helps children turn ideas into real digital projects — coding, AI, STEM, camps, and school workshops. Creativity before code.",
  alternates: { canonical: "https://www.codeshipacademy.com" },
};

const homeFaqs = [
  {
    question: "What is CODEship Academy?",
    answer:
      "CODEship Academy is a children's STEM, coding, AI, and digital skills education program. We offer weekly classes, camps, school workshops, and birthday parties for children ages 4–18, with a focus on project-based learning and creativity.",
  },
  {
    question: "How is CODEship different from other coding programs?",
    answer:
      "We put creativity first. Children don't follow tutorials — they build their own games, apps, websites, and AI projects from their own ideas. Our approach is inclusive, project-based, and focused on building real things kids are proud of.",
  },
  {
    question: "What can my child build?",
    answer:
      "Children in CODEship programs build games, websites, mobile app prototypes, animations, AI projects, interactive stories, and more — all based on their own ideas and interests.",
  },
  {
    question: "Does coding help with school subjects?",
    answer:
      "Yes. Coding naturally reinforces mathematical thinking, reading comprehension, logical reasoning, and problem-solving — skills that support performance across all academic subjects.",
  },
  {
    question: "Does my child need prior experience?",
    answer:
      "No prior experience is required. Our programs welcome complete beginners and provide pathways for children at every experience level.",
  },
  {
    question: "Can schools book CODEship programs?",
    answer:
      "Yes! CODEship Academy offers after-school clubs, PA Day workshops, March Break camps, and in-school STEM workshops for schools and school boards across Canada. Contact us to learn more.",
  },
];

const programs = [
  {
    title: "Weekly Classes",
    description:
      "Ongoing weekly sessions where children build real projects, develop coding skills, and grow their creative confidence over time.",
    age: "Ages 5–16",
    href: "/programs/weekly-classes",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
    imageAlt: "Children collaborating on coding projects in weekly class",
  },
  {
    title: "Summer & Holiday Camps",
    description:
      "Immersive multi-day camp experiences where kids build ambitious projects, make friends, and discover their potential as creators.",
    age: "Ages 6–14",
    href: "/programs/camps",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80",
    imageAlt: "Diverse children learning together at summer coding camp",
  },
  {
    title: "School Workshops",
    description:
      "Curriculum-aligned in-school and after-school STEM workshops brought directly to your school community.",
    age: "All ages",
    href: "/programs/school-workshops",
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80",
    imageAlt: "Students participating in school STEM workshop",
  },
  {
    title: "Birthday Parties",
    description:
      "Unique, screen-smart birthday celebrations where the whole group builds a game, animation, or app together.",
    age: "Ages 6–14",
    href: "/programs/birthday-parties",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80",
    imageAlt: "Children celebrating at coding birthday party",
  },
  {
    title: "AI & Robotics",
    description:
      "Hands-on exploration of artificial intelligence concepts, machine learning, and physical robotics — taught through real projects.",
    age: "Ages 8–16",
    href: "/programs/ai-robotics",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80",
    imageAlt: "Child exploring robotics and AI technology",
  },
];


const differentiators = [
  {
    title: "Creativity-First Learning",
    desc: "Children bring their own ideas. We provide the tools, guidance, and environment to make them real.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&q=80",
    imageAlt: "Children being creative with digital tools",
  },
  {
    title: "Real Project Building",
    desc: "Every child leaves with something they built — not a tutorial copy, but a genuine creation.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&q=80",
    imageAlt: "Children presenting their real projects",
  },
  {
    title: "AI & Digital Skills",
    desc: "Beyond coding, children develop AI literacy and digital skills for an evolving world.",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=300&q=80",
    imageAlt: "AI and digital skills exploration",
  },
  {
    title: "Inclusive for All Learners",
    desc: "Our programs welcome children of all backgrounds, genders, abilities, and experience levels.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300&q=80",
    imageAlt: "Diverse and inclusive group of children learning together",
  },
  {
    title: "Academic Skill-Building",
    desc: "Coding naturally reinforces math, reading, and problem-solving skills children use in school.",
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=300&q=80",
    imageAlt: "Children building academic skills through coding",
  },
  {
    title: "School & Community Model",
    desc: "We bring programs to schools and community spaces, making access easier for more families.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&q=80",
    imageAlt: "School and community coding workshop",
  },
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(homeFaqs)) }}
      />

      {/* ── Hero ── */}
      <section className="relative hero-gradient min-h-[640px] flex items-center overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[10%] w-64 h-64 bg-[#F5C518]/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-[#F5C518]/5 rounded-full blur-3xl animate-float animation-delay-300" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3D4466]/30 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Where Curiosity{" "}
              <span className="text-[#F5C518] relative">
                Becomes Creation
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#F5C518]/40 rounded" />
              </span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-xl leading-relaxed">
              CODEship Academy helps children turn their ideas into real digital projects — building coding skills,
              confidence, creativity, and future-ready thinking through hands-on project-based learning.
            </p>
            <p className="text-[#F5C518] font-bold text-lg mb-8 tracking-wide">DREAM. CODE. ACHIEVE.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/program-finder"
                className="bg-[#F5C518] text-[#3D4466] font-bold px-8 py-4 rounded-xl hover:bg-yellow-400 transition-all duration-200 text-center text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Find a Program
              </Link>
              <Link
                href="/franchise"
                className="border-2 border-white/60 text-white font-bold px-8 py-4 rounded-xl hover:bg-white hover:text-[#3D4466] transition-all duration-200 text-center text-lg backdrop-blur-sm"
              >
                Partner With Us
              </Link>
            </div>
          </div>

          {/* Hero image + video placeholder */}
          <div className="animate-slide-in-right animation-delay-200 space-y-4">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <Image
                src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80"
                alt="Diverse children collaborating on digital projects at CODEship Academy"
                width={800}
                height={500}
                className="w-full h-[320px] object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3D4466]/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-semibold text-sm">
                  Children building real projects — not just following tutorials.
                </p>
              </div>
            </div>
            <div className="bg-[#3D4466]/60 backdrop-blur-sm border border-[#F5C518]/20 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-[#F5C518] rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-[#3D4466] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <p className="text-gray-300 text-xs">
                Follow us on{" "}
                <a href="https://www.instagram.com/codeshipacademy" target="_blank" rel="noopener noreferrer" className="text-[#F5C518] font-semibold hover:underline">@codeshipacademy</a>
                {" "}to see what our students are building
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Differentiator Strip ── */}
      <section className="bg-[#F5C518] py-4 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6 lg:gap-10">
            {[
              "Creativity First",
              "Real Projects",
              "AI & Coding",
              "Inclusive Learning",
              "Academic Skills",
              "DREAM. CODE. ACHIEVE.",
            ].map((item) => (
              <span key={item} className="font-bold text-[#3D4466] text-sm md:text-base flex items-center gap-2">
                <span className="w-2 h-2 bg-[#3D4466] rounded-full" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Programs ── */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#3D4466] mb-4">Our Programs</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                From weekly after-school classes to immersive camps, we have a program for every child and every schedule.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((prog, i) => (
              <ScrollReveal key={prog.title} delay={i * 100}>
                <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col card-hover group">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={prog.image}
                      alt={prog.imageAlt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3D4466]/70 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <span className="text-xs bg-[#F5C518] text-[#3D4466] font-bold px-2 py-1 rounded">
                        {prog.age}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-[#3D4466] text-xl mb-2">{prog.title}</h3>
                    <p className="text-gray-600 text-sm flex-1 mb-4">{prog.description}</p>
                    <Link
                      href={prog.href}
                      className="bg-[#3D4466] text-white font-semibold px-4 py-2 rounded-lg text-center hover:bg-[#2a3052] transition-colors text-sm"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/programs" className="text-[#3D4466] font-semibold hover:text-[#F5C518] transition-colors">
              View all programs →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why CODEship is Different ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-[#3D4466] mb-4">
                Why CODEship Academy Is Different
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                We built CODEship Academy around a simple belief: when children are given the freedom to create —
                not just follow instructions — they discover what they&apos;re truly capable of.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {differentiators.map((d, i) => (
              <ScrollReveal key={d.title} delay={i * 100}>
                <div className="group bg-[#FAFAFA] rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 card-hover">
                  <div className="relative h-36 overflow-hidden">
                    <Image
                      src={d.image}
                      alt={d.imageAlt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-[#3D4466]/50" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="font-bold text-white text-base">{d.title}</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex gap-3">
                      <div className="w-3 h-3 bg-[#F5C518] rounded-full mt-1 shrink-0" />
                      <p className="text-gray-600 text-sm">{d.desc}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How CODEship Works + Video ── */}
      <section className="py-20 bg-[#3D4466]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-14">
              How CODEship Works
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {[
                {
                  step: "1",
                  label: "Explore",
                  desc: "Children explore tools, concepts, and possibilities. Curiosity leads the way.",
                  image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&q=80",
                },
                {
                  step: "2",
                  label: "Create",
                  desc: "With guidance and support, children build their own original projects from their own ideas.",
                  image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&q=80",
                },
                {
                  step: "3",
                  label: "Present",
                  desc: "Children share their work with pride — celebrating what they built.",
                  image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&q=80",
                },
              ].map((s, i) => (
                <ScrollReveal key={s.step} delay={i * 150}>
                  <div className="flex gap-5 items-start group">
                    <div className="w-14 h-14 bg-[#F5C518] text-[#3D4466] rounded-full flex items-center justify-center font-bold text-xl shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                      {s.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-lg mb-1">{s.label}</h4>
                      <p className="text-gray-300 text-sm">{s.desc}</p>
                    </div>
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 ring-2 ring-[#F5C518]/30">
                      <Image
                        src={s.image}
                        alt={`Step ${s.step}: ${s.label}`}
                        fill
                        className="object-cover"
                        loading="lazy"
                        sizes="64px"
                      />
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Video placeholder */}
            <ScrollReveal delay={200}>
              <div className="bg-[#2a3052] rounded-2xl overflow-hidden border border-[#F5C518]/20 shadow-2xl">
                <div className="relative aspect-video bg-[#1e2240] flex items-center justify-center">
                  <Image
                    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80"
                    alt="CODEship Academy workshop — children building digital projects"
                    fill
                    className="object-cover opacity-40"
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="relative z-10 text-center p-6">
                    <div className="w-16 h-16 bg-[#F5C518] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-float">
                      <svg className="w-7 h-7 text-[#3D4466] ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <p className="text-white font-semibold text-lg mb-1">See CODEship in Action</p>
                    <p className="text-gray-400 text-sm">
                      Watch students build, create, and present their own digital projects
                    </p>
                  </div>
                </div>
                <div className="p-4 border-t border-[#F5C518]/10">
                  <p className="text-gray-400 text-xs text-center">
                    Follow us on{" "}
                    <a
                      href="https://www.instagram.com/codeshipacademy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#F5C518] hover:underline font-semibold"
                    >
                      @codeshipacademy
                    </a>
                    {" "}to see real student projects
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Age-Based Program Finder ── */}
      <section className="py-16 bg-[#F5C518]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-[#3D4466] mb-4">
              Find the Right Program for Your Child
            </h2>
            <p className="text-gray-600 mb-8">Select your child&apos;s age to explore recommended programs:</p>
            <div className="flex flex-wrap justify-center gap-4">
              {["Ages 4–6", "Ages 7–9", "Ages 10–12", "Ages 13+"].map((age) => (
                <Link
                  key={age}
                  href="/program-finder"
                  className="bg-white border-2 border-[#3D4466] text-[#3D4466] font-semibold px-6 py-3 rounded-xl hover:bg-[#3D4466] hover:text-white transition-all duration-200 card-hover"
                >
                  {age}
                </Link>
              ))}
            </div>
            <p className="mt-6 text-sm text-gray-500">
              Not sure where to start?{" "}
              <Link href="/program-finder" className="text-[#F5C518] font-semibold hover:underline">
                Take our Program Finder quiz →
              </Link>
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── School Partnership CTA ── */}
      <section className="py-20 bg-[#3D4466] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F5C518]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F5C518]/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Bring CODEship to Your School
                </h2>
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  We partner with schools across Canada to deliver curriculum-aligned coding, AI, and STEM programs —
                  from after-school clubs and PA Day workshops to in-school enrichment and March Break camps.
                </p>
                <ul className="space-y-2 mb-8">
                  {["After-school coding clubs", "PA Day workshops", "March Break programs", "In-school STEM workshops", "Curriculum enrichment"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-gray-300 text-sm">
                      <span className="w-2 h-2 bg-[#F5C518] rounded-full shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/schools"
                  className="bg-[#F5C518] text-[#3D4466] font-bold px-8 py-4 rounded-xl hover:bg-yellow-400 transition-all duration-200 inline-block text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Request School Partnership Info
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80"
                  alt="School STEM workshop with students learning coding"
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-[#3D4466]/30" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Testimonials (rolling marquee) ── */}
      <TestimonialMarquee />

      {/* ── Newsletter ── */}
      <section className="py-16 bg-[#3D4466] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#F5C518]/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-white mb-4">Stay in the Loop</h2>
            <p className="text-gray-300 mb-8">
              Get updates on new programs, resources for parents, and coding education tips — delivered straight to your inbox.
            </p>
            <NewsletterForm />
            <p className="text-gray-400 text-xs mt-3">No spam. Unsubscribe anytime.</p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-[#3D4466] text-center mb-10">
              Frequently Asked Questions
            </h2>
            <FAQAccordion faqs={homeFaqs} />
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
