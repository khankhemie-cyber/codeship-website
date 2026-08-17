export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "CODEship Academy",
    url: "https://www.codeshipacademy.com",
    logo: "https://www.codeshipacademy.com/logo-nav.png",
    description:
      "CODEship Academy offers K–8 coding, AI, math and reading programs — in-person in Oshawa (serving Durham Region) and live online across Canada — through weekly classes, camps, and school workshops.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Oshawa",
      addressRegion: "Ontario",
      addressCountry: "CA",
    },
    areaServed: [
      { "@type": "AdministrativeArea", name: "Durham Region" },
      { "@type": "City", name: "Oshawa" },
      { "@type": "City", name: "Whitby" },
      { "@type": "City", name: "Courtice" },
      { "@type": "City", name: "Bowmanville" },
      { "@type": "City", name: "Clarington" },
      { "@type": "Country", name: "Canada" },
    ],
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

interface LocalBusinessOptions {
  /** City-center coordinates — only pass for the 5 official in-person program cities. */
  geo?: { latitude: number; longitude: number };
  /** e.g. ["Saturday 09:00-13:45"] — only pass where CODEship actually runs in-person classes. */
  openingHours?: string[];
  areaServed?: string[];
}

export function localBusinessSchema(city: string, options: LocalBusinessOptions = {}) {
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
    ...(options.geo
      ? { geo: { "@type": "GeoCoordinates", latitude: options.geo.latitude, longitude: options.geo.longitude } }
      : {}),
    ...(options.openingHours ? { openingHours: options.openingHours } : {}),
    ...(options.areaServed ? { areaServed: options.areaServed } : {}),
    url: `https://www.codeshipacademy.com/locations/${city.toLowerCase().replace(/\s+/g, "-")}`,
  };
}

export function articleSchema(article: {
  title: string;
  metaDescription: string;
  publishDate: string;
  dateModified?: string;
  slug: string;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.publishDate,
    dateModified: article.dateModified ?? article.publishDate,
    author: {
      "@type": "Organization",
      name: article.authorName ?? "CODEship Academy Team",
      url: "https://www.codeshipacademy.com/about",
    },
    publisher: {
      "@type": "Organization",
      name: "CODEship Academy",
      logo: {
        "@type": "ImageObject",
        url: "https://www.codeshipacademy.com/logo-nav.png",
      },
    },
    url: `https://www.codeshipacademy.com/resources/${article.slug}`,
  };
}

interface CourseProgram {
  slug: string;
  level: string;
  gradeBand: string;
  codingSpace: string;
  summary: string;
}

interface CourseInstanceSource {
  inPersonCities: string[];
  inPersonSchedule: { start: string; end: string };
  online: { day: string; window: string };
}

function to24Hour(time: string): string {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return time.trim();
  const hourStr = match[1];
  const minute = match[2];
  const period = match[3];
  let hour = parseInt(hourStr, 10);
  if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (period.toUpperCase() === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

function parseOnlineWindow(window: string): { start: string; end: string } {
  const clean = window.replace(/\s*ET\s*$/i, "").trim();
  const [startRaw, endRaw] = clean.split(/[–-]/).map((s) => s.trim());
  const period = endRaw.match(/AM|PM/i)?.[0] ?? "PM";
  return { start: to24Hour(`${startRaw} ${period}`), end: to24Hour(endRaw) };
}

/** Course schema for a /programs/:slug page — in-person + online CourseInstances, no invented facts. */
export function courseSchema(program: CourseProgram, source: CourseInstanceSource) {
  const inPersonInstances = source.inPersonCities.map((city) => ({
    "@type": "CourseInstance",
    courseMode: "Blended",
    location: {
      "@type": "Place",
      name: city,
      address: { "@type": "PostalAddress", addressLocality: city, addressCountry: "CA" },
    },
    courseSchedule: {
      "@type": "Schedule",
      repeatFrequency: "Weekly",
      byDay: "https://schema.org/Saturday",
      startTime: to24Hour(source.inPersonSchedule.start),
      endTime: to24Hour(source.inPersonSchedule.end),
    },
  }));

  const onlineTimes = parseOnlineWindow(source.online.window);
  const onlineInstance = {
    "@type": "CourseInstance",
    courseMode: "Online",
    courseSchedule: {
      "@type": "Schedule",
      repeatFrequency: "Weekly",
      byDay: `https://schema.org/${source.online.day}`,
      startTime: onlineTimes.start,
      endTime: onlineTimes.end,
    },
  };

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `CODEship ${program.level}`,
    description: program.summary,
    provider: {
      "@type": "Organization",
      name: "CODEship Academy",
      sameAs: "https://www.codeshipacademy.com",
    },
    educationalLevel: program.gradeBand,
    teaches: program.codingSpace,
    audience: { "@type": "EducationalAudience", educationalRole: "student", audienceType: program.gradeBand },
    hasCourseInstance: [...inPersonInstances, onlineInstance],
    url: `https://www.codeshipacademy.com/programs/${program.slug}`,
  };
}

/** ItemList schema for listicle articles, stacked alongside Article + FAQPage. */
export function itemListSchema(items: { name: string; url?: string; description?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url ? { url: item.url } : {}),
      ...(item.description ? { description: item.description } : {}),
    })),
  };
}

/**
 * Speakable schema for voice/AI extraction of FAQ answers. Pair with the
 * "faq-answer" CSS class already rendered by FAQAccordion.
 */
export function speakableSchema(cssSelectors: string[] = [".faq-answer"]) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: cssSelectors,
    },
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
