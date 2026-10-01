import type { Metadata } from "next";
import Link from "next/link";
import { articles } from "@/data/articles";
import { pageMetadata } from "@/lib/pageMetadata";
import { breadcrumbSchema } from "@/lib/schema";
import { PageHero, Section } from "@/components/ui/Page";

export const metadata: Metadata = pageMetadata({
  title: "Parent Resources | Coding, AI & STEM for Kids",
  description: "Short guides for parents about coding, AI and STEM for kids in K–Grade 8.",
  path: "/resources",
});

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Resources", href: "/resources" },
];

export default function ResourcesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      <PageHero crumbs={crumbs} eyebrow="Resources" title="Guides for parents" lead="Clear answers about coding, AI and STEM for kids." />

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/resources/${article.slug}`}
              className="group bg-white shadow-sm hover:shadow-lg transition-shadow border border-gray-100 p-7 flex flex-col"
            >
              <p className="text-sm font-bold uppercase tracking-widest text-[#0f6f7c]">
                {article.category} · {article.readTime} min
              </p>
              <h2 className="text-xl font-bold text-[#001532] mt-3 leading-snug group-hover:text-[#138A9A] transition-colors">
                {article.title}
              </h2>
              <p className="text-base text-gray-600 mt-3 line-clamp-2 flex-1">{article.metaDescription}</p>
              <span className="text-base font-bold text-[#001532] mt-5">Read →</span>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
