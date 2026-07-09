import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { articles, articlesBySlug } from "@/data/articles";
import { articleSchema, faqSchema, breadcrumbSchema, itemListSchema, speakableSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/pageMetadata";
import FAQAccordion from "@/components/FAQAccordion";
import Breadcrumbs from "@/components/Breadcrumbs";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = articlesBySlug[params.slug];
  if (!article) return {};
  return pageMetadata({
    title: article.title,
    description: article.metaDescription,
    path: `/resources/${article.slug}`,
    type: "article",
    publishedTime: article.publishDate,
    modifiedTime: article.dateModified ?? article.publishDate,
    image: article.ogImage,
  });
}

export default function ArticlePage({ params }: Props) {
  const article = articlesBySlug[params.slug];
  if (!article) notFound();

  const related = articles
    .filter((a) => a.slug !== article.slug)
    .sort((a, b) => (b.cluster === article.cluster ? 1 : 0) - (a.cluster === article.cluster ? 1 : 0))
    .slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleSchema({ ...article, authorName: article.author, dateModified: article.dateModified })
          ),
        }}
      />
      {article.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(article.faqs)) }}
        />
      )}
      {article.faqs.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema()) }} />
      )}
      {article.listItems && article.listItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              itemListSchema(article.listItems.map((item) => ({ name: item.name, description: item.description })))
            ),
          }}
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
            <Breadcrumbs
              className="mb-4"
              items={[
                { name: "Home", href: "/" },
                { name: "Resources", href: "/resources" },
                { name: article.title, href: `/resources/${article.slug}` },
              ]}
            />
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs bg-[#E5A823]/30 text-[#E5A823] font-semibold px-2 py-0.5 rounded uppercase tracking-wide">
                {article.category}
              </span>
              <span className="text-gray-400 text-xs">{article.readTime} min read</span>
              <span className="text-gray-500 text-xs">By {article.author ?? "CODEship Academy Team"}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-3">
              {article.title}
            </h1>
            <p className="text-gray-400 text-xs">
              Published {article.publishDate}
              {article.dateModified && article.dateModified !== article.publishDate && (
                <> · Last updated {article.dateModified}</>
              )}
            </p>
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

            {article.internalLinks && article.internalLinks.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3">
                {article.internalLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-[#138A9A] font-semibold hover:underline"
                  >
                    {link.label} →
                  </Link>
                ))}
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
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/resources/${r.slug}`}
                  className="bg-[#FAF8F4] rounded-xl p-4 hover:shadow-md transition-shadow border border-gray-100 block"
                >
                  <span className="text-xs text-[#E5A823] font-semibold uppercase">{r.category}</span>
                  <h3 className="font-bold text-[#001532] mt-1 mb-2 text-sm leading-snug">{r.title}</h3>
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
