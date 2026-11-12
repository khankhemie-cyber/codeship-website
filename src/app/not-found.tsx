import type { Metadata } from "next";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ButtonLink } from "@/components/ui/Page";
import { CircuitLines, CodeMark } from "@/components/ui/Stem";

/**
 * Sitewide 404. The root not-found renders inside the root layout only, so it
 * brings its own Navigation and Footer to match the (site) pages.
 */

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "We couldn't find that page. Head back home or explore CODEship Academy programs and coding tools.",
  robots: { index: false, follow: true },
};

const suggestions = [
  {
    href: "/programs/",
    title: "Programs",
    detail: "K–Grade 8 coding, AI & STEM classes.",
  },
  {
    href: "/program-finder/",
    title: "Program Finder",
    detail: "Find the right level for your child.",
  },
  {
    href: "/tools/playground/",
    title: "Coding Playground",
    detail: "Free games and puzzles to practise coding.",
  },
  {
    href: "/contact/",
    title: "Contact Us",
    detail: "Ask a question, we're happy to help.",
  },
];

export default function NotFound() {
  return (
    <>
      <Navigation />
      <main className="pt-[76px] lg:pt-24">
        <section className="relative overflow-hidden bg-[#001532] bg-dotgrid-dark">
          <CircuitLines className="absolute -right-12 -top-6 w-80 opacity-30 hidden md:block" />
          <CircuitLines className="absolute -left-16 -bottom-16 w-72 opacity-20 rotate-180 hidden md:block" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
            <p className="inline-flex items-center gap-2 text-[#F4D734] font-bold text-sm uppercase tracking-widest mb-4">
              <CodeMark className="w-5 h-5" />
              Error 404
            </p>
            <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Oops! This page has a bug.
            </h1>
            <p className="text-gray-200 text-lg sm:text-xl mt-5 max-w-2xl mx-auto leading-relaxed">
              We looked everywhere, but the page you&apos;re after doesn&apos;t exist or has moved.
              Let&apos;s get you back on track.
            </p>

            <pre
              aria-hidden="true"
              className="mt-8 mx-auto max-w-md text-left text-sm sm:text-base font-mono bg-black/30 border border-white/10 px-5 py-4 text-gray-300 overflow-x-auto"
            >
              <span className="text-[#5FC3CF]">if</span> (page === <span className="text-[#F4D734]">undefined</span>) {"{\n"}
              {"  "}goHome(); <span className="text-gray-500">{"// 🚀"}</span>
              {"\n}"}
            </pre>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <ButtonLink href="/">Back to Home</ButtonLink>
              <ButtonLink href="/contact/" variant="outline">
                Report a Broken Link
              </ButtonLink>
            </div>
          </div>
        </section>

        <section className="bg-[#FAF8F4] py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#001532] text-center mb-10">
              Popular places to start
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {suggestions.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="group block h-full bg-white border border-[#E5E1D8] p-6 transition-colors hover:border-[#0F6F7C]"
                  >
                    <span className="font-display text-lg font-extrabold text-[#001532] group-hover:text-[#0F6F7C]">
                      {s.title} <span aria-hidden="true">→</span>
                    </span>
                    <span className="block mt-2 text-base text-gray-600">{s.detail}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
