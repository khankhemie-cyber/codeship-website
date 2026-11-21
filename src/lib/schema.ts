import { FLAT_PRICE_CAD } from "@/config/offering";
import { IN_PERSON_VENUE } from "@/data/locations";
import { PHONE_E164 } from "@/config/contact";
import { CAREER_AREAS, CLASSROOM, JOB_DATE_POSTED, JOB_VALID_THROUGH, LOCATION_TERMS, ROLE_DETAILS, WORK_AUTHORIZATION, type CareerRole } from "@/config/careers";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "CODEship Academy",
    url: "https://www.codeshipacademy.com",
    logo: "https://www.codeshipacademy.com/logo-nav.png",
    telephone: PHONE_E164,
    description:
      "CODEship Academy teaches coding, AI and STEM to kids in K–Grade 8. Classes run Saturdays at Core21, 21 Simcoe St South, Oshawa, and live online across Canada.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "21 Simcoe St South",
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
      telephone: PHONE_E164,
    },
    sameAs: [
      "https://www.instagram.com/codeshipacademy",
    ],
  };
}

interface LocalBusinessOptions {
  /** City-center coordinates, only pass for the open in-person city (Oshawa). */
  geo?: { latitude: number; longitude: number };
  /** e.g. ["Sa 09:00-12:30"], only pass where CODEship actually runs in-person classes (Oshawa). */
  openingHours?: string[];
  /** Only for the open in-person venue (Oshawa). */
  streetAddress?: string;
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
      ...(options.streetAddress ? { streetAddress: options.streetAddress } : {}),
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
  keyTakeaways?: string[];
  sources?: { title: string; publisher: string; authors?: string; date: string; url: string }[];
}) {
  const url = `https://www.codeshipacademy.com/resources/${article.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    ...(article.keyTakeaways?.length ? { abstract: article.keyTakeaways.join(" ") } : {}),
    inLanguage: "en-CA",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: "https://www.codeshipacademy.com/logo-banner.png",
    datePublished: article.publishDate,
    dateModified: article.dateModified ?? article.publishDate,
    ...(article.sources?.length
      ? {
          citation: article.sources.map((s) => ({
            "@type": "CreativeWork",
            name: s.title,
            url: s.url,
            datePublished: s.date,
            publisher: { "@type": "Organization", name: s.publisher },
            ...(s.authors ? { author: s.authors } : {}),
          })),
        }
      : {}),
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
    url,
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

/** Course schema for a /programs/:slug page, in-person + online CourseInstances, no invented facts. */
export function courseSchema(program: CourseProgram, source: CourseInstanceSource) {
  const inPersonInstances = source.inPersonCities.map((city) => ({
    "@type": "CourseInstance",
    courseMode: "Blended",
    location: {
      "@type": "Place",
      name: city === IN_PERSON_VENUE.city ? IN_PERSON_VENUE.building : city,
      address: {
        "@type": "PostalAddress",
        ...(city === IN_PERSON_VENUE.city ? { streetAddress: IN_PERSON_VENUE.street } : {}),
        addressLocality: city,
        addressCountry: "CA",
      },
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
    offers: {
      "@type": "Offer",
      price: FLAT_PRICE_CAD,
      priceCurrency: "CAD",
      category: "Tuition per 8-week semester",
      availability: "https://schema.org/InStock",
      url: `https://www.codeshipacademy.com/register/${program.slug}`,
    },
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
    inLanguage: "en-CA",
    publisher: { "@type": "Organization", name: "CODEship Academy", url: "https://www.codeshipacademy.com" },
  };
}

/**
 * Google for Jobs JobPosting for one /careers role. Hybrid: in-person at the
 * partner-site areas (jobLocation) plus online (TELECOMMUTE, Canada only).
 * Durham Region is given the Oshawa address, where Durham-based hires may
 * also have shifts; the other areas are listed by town.
 */
export function jobPostingSchema(role: CareerRole) {
  const list = (items: string[]) => `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
  const description = [
    `<p><strong>About the role</strong></p>`,
    `<p>${role.about}</p>`,
    list([`Pay: $${role.hourlyRate} per hour (CAD)`, ...ROLE_DETAILS.map((d) => `${d.label}: ${d.value}`)]),
    `<p><strong>What you'll do</strong></p>`,
    list(role.duties),
    `<p><strong>In the classroom</strong></p>`,
    list(CLASSROOM),
    `<p><strong>Locations and travel</strong></p>`,
    list(LOCATION_TERMS),
    `<p><strong>Requirements</strong></p>`,
    list(role.requirements),
    `<p><strong>Assets</strong></p>`,
    list(role.assets),
  ].join("");

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: role.title,
    description,
    identifier: { "@type": "PropertyValue", name: "CODEship Academy", value: role.slug },
    datePosted: JOB_DATE_POSTED,
    validThrough: `${JOB_VALID_THROUGH}T23:59:59-05:00`,
    employmentType: "CONTRACTOR",
    eligibilityToWorkRequirement: WORK_AUTHORIZATION,
    responsibilities: role.duties.join(". ") + ".",
    hiringOrganization: {
      "@type": "Organization",
      name: "CODEship Academy",
      sameAs: "https://www.codeshipacademy.com",
      logo: "https://www.codeshipacademy.com/logo-nav.png",
    },
    jobLocation: CAREER_AREAS.map((area) => ({
      "@type": "Place",
      name: area,
      address:
        area === "Durham Region"
          ? {
              "@type": "PostalAddress",
              streetAddress: IN_PERSON_VENUE.street,
              addressLocality: IN_PERSON_VENUE.city,
              addressRegion: "ON",
              addressCountry: "CA",
            }
          : { "@type": "PostalAddress", addressLocality: area, addressRegion: "ON", addressCountry: "CA" },
    })),
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: { "@type": "Country", name: "Canada" },
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "CAD",
      value: { "@type": "QuantitativeValue", value: role.hourlyRate, unitText: "HOUR" },
    },
    directApply: true,
    url: `https://www.codeshipacademy.com/careers/${role.slug}/`,
  };
}
