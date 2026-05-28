import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FAQAccordion from "@/components/FAQAccordion";
import NewsletterForm from "@/components/NewsletterForm";
import { websiteSchema, organizationSchema, faqSchema } from "@/lib/schema";
import { articles } from "@/data/articles";

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
    icon: "📅",
  },
  {
    title: "Summer & Holiday Camps",
    description:
      "Immersive multi-day camp experiences where kids build ambitious projects, make friends, and discover their potential as creators.",
    age: "Ages 6–14",
    href: "/programs/camps",
    icon: "🏕️",
  },
  {
    title: "School Workshops",
    description:
      "Curriculum-aligned in-school and after-school STEM workshops brought directly to your school community.",
    age: "All ages",
    href: "/programs/school-workshops",
    icon: "🏫",
  },
  {
    title: "Birthday Parties",
    description:
      "Unique, screen-smart birthday celebrations where the whole group builds a game, animation, or app together.",
    age: "Ages 6–14",
    href: "/programs/birthday-parties",
    icon: "🎉",
  },
  {
    title: "AI & Robotics",
    description:
      "Hands-on exploration of artificial intelligence concepts, machine learning, and physical robotics — taught through real projects.",
    age: "Ages 8–16",
    href: "/programs/ai-robotics",
    icon: "🤖",
  },
];

const buildCards = [
  { title: "Games", icon: "🎮", desc: "Design and code original games from the ground up." },
  { title: "Apps", icon: "📱", desc: "Prototype and build real mobile app ideas." },
  { title: "Websites", icon: "🌐", desc: "Create and publish websites using HTML, CSS, and more." },
  { title: "AI Projects", icon: "🧠", desc: "Build AI models and intelligent interactive experiences." },
  { title: "Animations", icon: "✨", desc: "Bring characters and stories to life with code." },
  { title: "Stories", icon: "📖", desc: "Create interactive digital stories and choose-your-own adventures." },
];

const differentiators = [
  {
    title: "Creativity-First Learning",
    desc: "Children bring their own ideas. We provide the tools, guidance, and environment to make them real.",
  },
  {
    title: "Real Project Building",
    desc: "Every child leaves with something they built — not a tutorial copy, but a genuine creation.",
  },
  {
    title: "AI & Digital Skills",
    desc: "Beyond coding, children develop AI literacy and digital skills for an evolving world.",
  },
  {
    title: "Inclusive for All Learners",
    desc: "Our programs welcome children of all backgrounds, genders, abilities, and experience levels.",
  },
  {
    title: "Academic Skill-Building",
    desc: "Coding naturally reinforces math, reading, and problem-solving skills children use in school.",
  },
  {
    title: "School & Community Model",
    desc: "We bring programs to schools and community spaces, making access easier for more families.",
  },
];

const latestArticles = articles.slice(0, 3);

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

      {/* Hero */}
      <section className="relative bg-[#0A2342] min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-[#0A2342] via-[#0d3060] to-[#0A2342]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Where Curiosity{" "}
              <span className="text-[#F5A623]">Becomes Creation</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-xl">
              CODEship Academy helps children turn their ideas into real digital projects — building coding skills,
              confidence, creativity, and future-ready thinking through hands-on project-based learning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/program-finder"
                className="bg-[#F5A623] text-[#0A2342] font-bold px-8 py-4 rounded-xl hover:bg-yellow-400 transition-colors text-center text-lg"
              >
                Find a Program
              </Link>
              <Link
                href="/franchise"
                className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl hover:bg-white hover:text-[#0A2342] transition-colors text-center text-lg"
              >
                Partner With Us
              </Link>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            {/* Hero image */}
            <Image
              src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80"
              alt="Diverse children collaborating on digital projects at CODEship Academy"
              width={800}
              height={500}
              className="w-full h-full object-cover"
              priority
            />
            <div className="absolute inset-0 bg-[#0A2342]/20" />
          </div>
        </div>
      </section>

      {/* Differentiator Strip */}
      <section className="bg-[#F5A623] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6 lg:gap-10">
            {["Creativity First", "Real Projects", "AI & Coding", "Inclusive Learning", "Academic Skills"].map(
              (item) => (
                <span key={item} className="font-bold text-[#0A2342] text-sm md:text-base flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#0A2342] rounded-full" />
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* What Can Your Child Build? */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A2342] mb-4">
            What Can Your Child Build?
          </h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto text-lg">
            At CODEship Academy, children don&apos;t follow templates — they build their own original creations.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {buildCards.map((card) => (
              <div key={card.title} className="bg-[#FAFAFA] rounded-2xl p-6 hover:shadow-lg transition-shadow border border-gray-100">
                <div className="text-4xl mb-3">{card.icon}</div>
                <h3 className="font-bold text-[#0A2342] text-lg mb-2">{card.title}</h3>
                <p className="text-gray-500 text-sm">{card.desc}</p>
                <Link href="/programs" className="text-[#F5A623] text-sm font-semibold mt-3 inline-block hover:underline">
                  Learn more →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0A2342] mb-4">Our Programs</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              From weekly after-school classes to immersive camps, we have a program for every child and every schedule.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((prog) => (
              <div key={prog.title} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 flex flex-col">
                <div className="text-3xl mb-3">{prog.icon}</div>
                <h3 className="font-bold text-[#0A2342] text-xl mb-1">{prog.title}</h3>
                <span className="text-xs bg-[#F5A623]/20 text-[#0A2342] font-semibold px-2 py-1 rounded mb-3 self-start">
                  {prog.age}
                </span>
                <p className="text-gray-600 text-sm flex-1 mb-4">{prog.description}</p>
                <Link
                  href={prog.href}
                  className="bg-[#0A2342] text-white font-semibold px-4 py-2 rounded-lg text-center hover:bg-blue-900 transition-colors text-sm"
                >
                  Learn More
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/programs" className="text-[#0A2342] font-semibold hover:text-[#F5A623] transition-colors">
              View all programs →
            </Link>
          </div>
        </div>
      </section>

      {/* Why CODEship is Different */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0A2342] mb-4">
                Why CODEship Academy Is Different
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                We built CODEship Academy around a simple belief: when children are given the freedom to create —
                not just follow instructions — they discover what they&apos;re truly capable of.
              </p>
              <div className="space-y-4">
                {differentiators.map((d) => (
                  <div key={d.title} className="flex gap-4">
                    <div className="w-3 h-3 bg-[#2ECC71] rounded-full mt-1.5 shrink-0" />
                    <div>
                      <h3 className="font-bold text-[#0A2342]">{d.title}</h3>
                      <p className="text-gray-600 text-sm">{d.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0A2342] rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6 text-[#F5A623]">How CODEship Works</h3>
              <div className="space-y-6">
                {[
                  { step: "1", label: "Explore", desc: "Children explore tools, concepts, and possibilities. Curiosity leads the way." },
                  { step: "2", label: "Create", desc: "With guidance and support, children build their own original projects." },
                  { step: "3", label: "Present", desc: "Children share their work with pride — celebrating what they built." },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4">
                    <div className="w-10 h-10 bg-[#F5A623] text-[#0A2342] rounded-full flex items-center justify-center font-bold shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{s.label}</h4>
                      <p className="text-gray-300 text-sm">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Video placeholder */}
              <div className="mt-6 bg-[#0d3060] rounded-xl p-4 border border-gray-600 text-center">
                <p className="text-gray-400 text-sm italic">
                  [Video placeholder: How CODEship Works — children building and presenting projects]
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Age-Based Program Finder Teaser */}
      <section className="py-16 bg-[#2ECC71]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#0A2342] mb-4">
            Find the Right Program for Your Child
          </h2>
          <p className="text-gray-600 mb-8">Select your child&apos;s age to explore recommended programs:</p>
          <div className="flex flex-wrap justify-center gap-4">
            {["Ages 4–6", "Ages 7–9", "Ages 10–12", "Ages 13+"].map((age) => (
              <Link
                key={age}
                href="/program-finder"
                className="bg-white border-2 border-[#0A2342] text-[#0A2342] font-semibold px-6 py-3 rounded-xl hover:bg-[#0A2342] hover:text-white transition-colors"
              >
                {age}
              </Link>
            ))}
          </div>
          <p className="mt-6 text-sm text-gray-500">
            Not sure where to start?{" "}
            <Link href="/program-finder" className="text-[#F5A623] font-semibold hover:underline">
              Take our Program Finder quiz →
            </Link>
          </p>
        </div>
      </section>

      {/* School Partnership CTA */}
      <section className="py-20 bg-[#0A2342]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Bring CODEship to Your School
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            We partner with schools across Canada to deliver curriculum-aligned coding, AI, and STEM programs —
            from after-school clubs and PA Day workshops to in-school enrichment and March Break camps.
          </p>
          <Link
            href="/schools"
            className="bg-[#F5A623] text-[#0A2342] font-bold px-8 py-4 rounded-xl hover:bg-yellow-400 transition-colors inline-block text-lg"
          >
            Request School Partnership Info
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#0A2342] text-center mb-12">
            What Families Are Saying
          </h2>
          {/* NOTE: The following testimonials are placeholder quotes for illustration purposes only */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "My daughter used to think coding wasn't for her. After two months at CODEship, she built her own game and presented it to our whole family. The confidence boost has been incredible.",
                name: "Parent, Markham",
                role: "Parent of 10-year-old",
              },
              {
                quote:
                  "We booked CODEship for a PA Day workshop and the kids were completely engaged the entire time. They left with real projects they built themselves. Our teachers were impressed.",
                name: "Vice Principal",
                role: "Elementary School, Mississauga",
              },
              {
                quote:
                  "My son had his birthday party at CODEship and all the kids made their own mini games. Parents were shocked by how much the kids accomplished in a couple of hours. Best party we've ever done.",
                name: "Parent, Oshawa",
                role: "Parent of 9-year-old",
              },
            ].map((t, i) => (
              <div key={i} className="bg-[#FAFAFA] rounded-2xl p-6 border border-gray-100">
                <p className="text-gray-600 italic mb-4 text-sm leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-bold text-[#0A2342] text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            * Testimonials are illustrative placeholders and will be replaced with verified reviews.
          </p>
        </div>
      </section>

      {/* Franchise Teaser */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A2342] mb-4">
            Bring CODEship Academy to Your Community
          </h2>
          <p className="text-gray-600 text-lg mb-4 max-w-2xl mx-auto">
            CODEship Academy is expanding across Canada. Join a mission-driven franchise building the next generation
            of creators and problem-solvers in communities like yours.
          </p>
          <p className="text-gray-500 mb-8">
            Investment range: <strong>$10K–$150K+</strong> across three flexible franchise models.
          </p>
          <Link
            href="/franchise"
            className="bg-[#0A2342] text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-900 transition-colors inline-block"
          >
            Learn About the Franchise Opportunity
          </Link>
          <p className="text-xs text-gray-400 mt-4">
            For informational purposes only. No franchise offering is made here. See franchise disclosure for details.
          </p>
        </div>
      </section>

      {/* Resources Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-[#0A2342]">Latest from the Blog</h2>
            <Link href="/resources" className="text-[#F5A623] font-semibold hover:underline">
              View all articles →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/resources/${article.slug}`}
                className="bg-[#FAFAFA] rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow block"
              >
                <span className="text-xs bg-[#F5A623]/20 text-[#0A2342] font-semibold px-2 py-1 rounded uppercase tracking-wide">
                  {article.category}
                </span>
                <h3 className="font-bold text-[#0A2342] text-lg mt-3 mb-2 leading-snug">{article.title}</h3>
                <p className="text-gray-500 text-sm mb-3">{article.metaDescription.substring(0, 100)}...</p>
                <span className="text-[#F5A623] text-sm font-semibold">Read more →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-[#0A2342]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stay in the Loop</h2>
          <p className="text-gray-300 mb-8">
            Get updates on new programs, resources for parents, and coding education tips — delivered straight to your inbox.
          </p>
          <NewsletterForm />
          <p className="text-gray-400 text-xs mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#0A2342] text-center mb-10">
            Frequently Asked Questions
          </h2>
          <FAQAccordion faqs={homeFaqs} />
        </div>
      </section>
    </>
  );
}
