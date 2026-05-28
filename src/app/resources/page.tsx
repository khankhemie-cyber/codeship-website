import type { Metadata } from "next";
import Link from "next/link";
import { articles } from "@/data/articles";

export const metadata: Metadata = {
  title: "Resources & Blog | Coding, AI & STEM for Kids",
  description:
    "Articles, guides, and resources for parents, schools, and educators about coding education, AI for kids, STEM learning, and more.",
  alternates: { canonical: "https://www.codeshipacademy.com/resources" },
};

const categories = ["All", "parent", "school", "franchise", "coding", "ai", "stem"] as const;

export default function ResourcesPage() {
  return (
    <div className="bg-[#FAFAFA]">
      <section className="bg-[#0A2342] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Resources &amp; Blog</h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            Articles, guides, and insights for parents, schools, and educators passionate about future-ready education.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category filter (static — no JS needed for static site) */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-600 capitalize cursor-pointer hover:border-[#F5A623] hover:text-[#0A2342] transition-colors"
              >
                {cat}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/resources/${article.slug}`}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 flex flex-col overflow-hidden group"
              >
                <div className="p-6 flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-[#F5A623]/20 text-[#0A2342] font-semibold px-2 py-0.5 rounded uppercase tracking-wide">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-400">{article.readTime} min read</span>
                  </div>
                  <h2 className="font-bold text-[#0A2342] text-lg mb-3 leading-snug group-hover:text-[#F5A623] transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-gray-500 text-sm">{article.metaDescription}</p>
                </div>
                <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xs text-gray-400">{article.publishDate}</span>
                  <span className="text-[#F5A623] text-sm font-semibold">Read more →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
