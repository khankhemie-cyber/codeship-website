import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { articles, articlesBySlug } from "@/data/articles";
import { articleSchema, faqSchema, breadcrumbSchema } from "@/lib/schema";
import FAQAccordion from "@/components/FAQAccordion";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = articlesBySlug[params.slug];
  if (!article) return {};
  return {
    title: article.title,
    description: article.metaDescription,
    alternates: { canonical: `https://www.codeshipacademy.com/resources/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.metaDescription,
      type: "article",
      publishedTime: article.publishDate,
    },
  };
}

export default function ArticlePage({ params }: Props) {
  const article = articlesBySlug[params.slug];
  if (!article) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema(article)) }}
      />
      {article.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(article.faqs)) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", href: "/" },
              { name: "Resources", href: "/resources" },
              { name: article.title, href: `/resources/${article.slug}` },
            ])
          ),
        }}
      />

      <div className="bg-[#FAF8F4]">
        {/* Hero */}
        <section className="bg-[#001532] py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <Link href="/resources" className="text-gray-400 hover:text-[#E5A823] text-sm transition-colors">
                ← Resources
              </Link>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs bg-[#E5A823]/30 text-[#E5A823] font-semibold px-2 py-0.5 rounded uppercase tracking-wide">
                {article.category}
              </span>
              <span className="text-gray-400 text-xs">{article.readTime} min read</span>
              <span className="text-gray-500 text-xs">{article.publishDate}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              {article.title}
            </h1>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="article-content max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {article.faqs.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-[#001532] mb-6">Frequently Asked Questions</h2>
                <FAQAccordion faqs={article.faqs} />
              </div>
            )}

            {/* CTA */}
            <div className="mt-12 bg-[#001532] rounded-2xl p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-2">Ready to Explore CODEship Programs?</h3>
              <p className="text-gray-300 mb-6">Find the right program for your child in just 2 minutes.</p>
              <Link
                href="/program-finder"
                className="bg-[#E5A823] text-[#001532] font-bold px-6 py-3 rounded-xl hover:bg-[#d4941f] transition-colors inline-block"
              >
                Find a Program
              </Link>
            </div>
          </div>
        </section>

        {/* Related Articles */}
        <section className="py-12 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-[#001532] mb-6">More Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {articles
                .filter((a) => a.slug !== article.slug)
                .slice(0, 3)
                .map((related) => (
                  <Link
                    key={related.slug}
                    href={`/resources/${related.slug}`}
                    className="bg-[#FAF8F4] rounded-xl p-4 hover:shadow-md transition-shadow border border-gray-100 block"
                  >
                    <span className="text-xs text-[#E5A823] font-semibold uppercase">{related.category}</span>
                    <h3 className="font-bold text-[#001532] mt-1 mb-2 text-sm leading-snug">{related.title}</h3>
                    <span className="text-[#E5A823] text-xs font-semibold">Read more →</span>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
