export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CODEship Academy",
    url: "https://www.codeshipacademy.com",
    logo: "https://www.codeshipacademy.com/logo.png",
    description:
      "CODEship Academy offers children's coding, AI, and STEM education programs through weekly classes, camps, and school workshops.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Oshawa",
      addressRegion: "Ontario",
      addressCountry: "CA",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "admin@codeshipacademy.com",
    },
    sameAs: [
      "https://www.instagram.com/codeshipacademy",
    ],
  };
}

export function localBusinessSchema(city: string) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: `CODEship Academy ${city}`,
    description: `CODEship Academy in ${city} offers coding, AI, and STEM programs for children.`,
    address: {
      "@type": "PostalAddress",
      addressLocality: city,
      addressCountry: "CA",
    },
    url: `https://www.codeshipacademy.com/locations/${city.toLowerCase().replace(/\s+/g, "-")}`,
  };
}

export function articleSchema(article: {
  title: string;
  metaDescription: string;
  publishDate: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.publishDate,
    author: {
      "@type": "Organization",
      name: "CODEship Academy",
    },
    publisher: {
      "@type": "Organization",
      name: "CODEship Academy",
      logo: {
        "@type": "ImageObject",
        url: "https://www.codeshipacademy.com/logo.png",
      },
    },
    url: `https://www.codeshipacademy.com/resources/${article.slug}`,
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbSchema(
  items: { name: string; href: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `https://www.codeshipacademy.com${item.href}`,
    })),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CODEship Academy",
    url: "https://www.codeshipacademy.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://www.codeshipacademy.com/resources?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };
}
