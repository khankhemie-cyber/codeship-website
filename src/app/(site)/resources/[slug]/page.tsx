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
            <p className="text-[#E5A823] font-bold text-sm uppercase tracking-widest mb-3">
              {article.category} · {article.readTime} min read
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              {article.title}
            </h1>
            <p className="text-gray-300 text-base">
              By {article.author ?? "CODEship Academy Team"} ·
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
              className="article-content max-w-none text-lg text-gray-700"
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
                    className="text-base text-[#0f6f7c] font-semibold hover:underline"
                  >
                    {link.label} →
                  </Link>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="mt-12 bg-[#001532] rounded-2xl p-8 text-center text-white">
              <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">Saturday coding classes in Oshawa</h3>
              <p className="text-lg text-gray-200 mb-6">October and November semesters are open for K–Grade 8.</p>
              <Link
                href="/#book"
                className="bg-[#E5A823] text-[#001532] text-lg font-bold px-7 py-3.5 rounded-xl hover:bg-[#d4941f] transition-colors inline-block"
              >
                Book a Semester
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
                  className="bg-[#FAF8F4] rounded-2xl p-6 hover:shadow-md transition-shadow border border-gray-100 block"
                >
                  <span className="text-sm text-[#0f6f7c] font-bold uppercase tracking-widest">{r.category}</span>
                  <h3 className="font-bold text-[#001532] mt-2 mb-3 text-lg leading-snug">{r.title}</h3>
                  <span className="text-[#001532] text-base font-bold">Read →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
