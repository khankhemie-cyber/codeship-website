import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About CODEship Academy | Our Mission & Story",
  description:
    "Learn about CODEship Academy — our mission, values, and why we believe creativity comes before code in children's education.",
  alternates: { canonical: "https://www.codeshipacademy.com/about" },
};

export default function AboutPage() {
  return (
    <div className="bg-[#FAF8F4]">
      <section className="bg-[#001532] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">About CODEship Academy</h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            We exist because children deserve more than tutorials. They deserve the chance to create, to build, and to
            discover what they&apos;re truly capable of.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h2 className="text-3xl font-bold text-[#001532] mb-6">Our Mission</h2>
              <p className="text-gray-600 text-lg mb-4">
                CODEship Academy&apos;s mission is to help every child discover their capacity to create — using digital
                tools as a medium for imagination, problem-solving, and self-expression.
              </p>
              <p className="text-gray-600 mb-4">
                We believe coding is more than a career skill. It&apos;s a way of thinking. When children learn to break big
                problems into small steps, to test ideas and revise them, to build something from nothing — they develop
                habits of mind that serve them for life.
              </p>
              <p className="text-gray-600">
                But we also believe that technical skill without creativity is incomplete. The most important thing we
                teach is not how to code — it&apos;s how to have an idea, and the confidence to build it.
              </p>
            </div>
            <div className="bg-[#001532] rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold text-[#E5A823] mb-6">Our Core Beliefs</h3>
              <ul className="space-y-4">
                {[
                  "Every child has ideas worth building.",
                  "Creativity comes before code.",
                  "Real projects build real confidence.",
                  "Technology belongs to everyone.",
                  "Learning happens best through making.",
                  "Community and school are where access begins.",
                ].map((belief) => (
                  <li key={belief} className="flex items-start gap-3">
                    <span className="text-[#E5A823] font-bold shrink-0">•</span>
                    <p className="text-gray-300">{belief}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold text-[#001532] text-center mb-10">What Makes Us Different</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Clean, Inclusive Design", desc: "No dark aesthetics, no gamer culture, no belt systems. CODEship is bright, welcoming, and designed for every child — not a narrow archetype.", dot: "bg-[#E5A823]", border: "border-t-4 border-[#E5A823]" },
                { title: "Creativity-First Pedagogy", desc: "Children bring ideas. We provide tools, structure, and encouragement. Every project is genuinely theirs.", dot: "bg-[#6E43A8]", border: "border-t-4 border-[#6E43A8]" },
                { title: "Project-Based Learning", desc: "No tutorials. No templates. Real projects from original ideas — with all the struggle and satisfaction that comes with building something real.", dot: "bg-[#6E43A8]", border: "border-t-4 border-[#6E43A8]" },
                { title: "Community Model", desc: "Programs delivered at schools and community spaces make quality STEM education accessible to more families in more places.", dot: "bg-[#001532]", border: "border-t-4 border-[#001532]" },
                { title: "Academic Integration", desc: "Our programs reinforce the reading, math, and thinking skills children develop in school — coding becomes a bridge to academic success.", dot: "bg-[#138A9A]", border: "border-t-4 border-[#138A9A]" },
                { title: "Future-Ready Curriculum", desc: "AI literacy, digital citizenship, and design thinking alongside coding — preparing children for a world we can only partially predict.", dot: "bg-[#138A9A]", border: "border-t-4 border-[#138A9A]" },
              ].map((diff) => (
                <div key={diff.title} className={`bg-white rounded-2xl p-6 shadow-sm ${diff.border}`}>
                  <div className={`w-2 h-2 ${diff.dot} rounded-full mb-3`} />
                  <h3 className="font-bold text-[#001532] mb-2">{diff.title}</h3>
                  <p className="text-gray-600 text-sm">{diff.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center bg-[#138A9A]/10 rounded-2xl p-10">
            <h2 className="text-3xl font-bold text-[#001532] mb-4">&ldquo;Creativity Before Code&rdquo;</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              This is more than a tagline. It&apos;s the principle that guides every curriculum decision we make, every
              program we design, and every class we run. Children build real ideas. That&apos;s what CODEship is for.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link href="/programs" className="bg-[#E5A823] text-[#001532] font-bold px-6 py-3 rounded-xl hover:bg-[#d4941f] transition-colors">
                Explore Programs
              </Link>
              <Link href="/contact" className="border-2 border-[#001532] text-[#001532] font-bold px-6 py-3 rounded-xl hover:bg-[#001532] hover:text-white transition-colors">
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
