import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQAccordion from "@/components/FAQAccordion";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { BASE_URL } from "@/lib/pageMetadata";
import { SEMESTER_SHAPE_LABEL, SEMESTER_WEEKS } from "@/config/offering";
import { isLivePaymentLink, type TutoringOffering } from "@/data/tutoring";
import { TUTORING } from "@/data/tutoring";

const INCLUDED = [
  "Live, small-group sessions with a dedicated tutor",
  "Weekly lessons matched to your child's grade and level",
  "Progress updates for families along the way",
  "Inclusive, neurodiverse-friendly, encouraging environment",
];

/** Where the format CTA points. Real Stripe link when live; interest-list lead form while placeholder. */
function ctaHref(offering: TutoringOffering, format: "in-person" | "online"): string {
  if (isLivePaymentLink(offering.paymentLink)) return offering.paymentLink;
  return `/waitlist?program=${encodeURIComponent(offering.label)}&status=interest&format=${format}`;
}

function ctaLabel(offering: TutoringOffering): string {
  return isLivePaymentLink(offering.paymentLink) ? "Register now" : "Join the interest list";
}

export default function TutoringProgramPage({ offering }: { offering: TutoringOffering }) {
  const live = isLivePaymentLink(offering.paymentLink);

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `CODEship ${offering.label}`,
    description: offering.summary,
    provider: { "@type": "EducationalOrganization", name: "CODEship Academy", sameAs: BASE_URL },
    educationalLevel: offering.gradeBand,
    teaches: offering.subject,
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
      audienceType: offering.gradeBand,
    },
    offers: {
      "@type": "Offer",
      price: offering.priceCad,
      priceCurrency: "CAD",
      category: "Tuition per semester",
      availability: "https://schema.org/InStock",
      url: `${BASE_URL}/programs/${offering.slug}`,
    },
    url: `${BASE_URL}/programs/${offering.slug}`,
  };

  const formats: { key: "in-person" | "online"; title: string; sub: string }[] = [
    { key: "in-person", title: "In-Person — Oshawa", sub: "Saturdays, serving families across Durham Region" },
    { key: "online", title: "Online — anywhere", sub: "Live online for families in any city" },
  ];

  const others = TUTORING.filter((t) => t.slug !== offering.slug);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(offering.faqs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", href: "/" },
              { name: "Programs", href: "/programs" },
              { name: offering.label, href: `/programs/${offering.slug}` },
            ])
          ),
        }}
      />

      <div className="bg-[#FAF8F4]">
        {/* Header */}
        <section className="bg-[#001532] py-16 sm:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs
              className="mb-4"
              items={[
                { name: "Home", href: "/" },
                { name: "Programs", href: "/programs" },
                { name: offering.label, href: `/programs/${offering.slug}` },
              ]}
            />
            <p className="text-[#E5A823] font-bold text-sm uppercase tracking-widest mb-2">Academic Skill-Building</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">{offering.label}</h1>
            <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">{offering.summary}</p>
            <div className="flex flex-wrap gap-3 mt-6">
              <span className="bg-white/10 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                Grades {offering.gradeBand}
              </span>
              <span className="bg-white/10 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                {offering.subject}
              </span>
              <span className="bg-[#E5A823] text-[#001532] px-3 py-1.5 rounded-full text-sm font-bold">
                CAD ${offering.priceCad}/semester
              </span>
              <span className="bg-white/10 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                {SEMESTER_SHAPE_LABEL} · in-person in Oshawa or online
              </span>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main column */}
            <div className="lg:col-span-2 space-y-12">
              {/* Outcomes */}
              <div>
                <h2 className="text-2xl font-bold text-[#001532] mb-4">What your child will gain</h2>
                <ul className="space-y-3">
                  {offering.outcomes.map((outcome) => (
                    <li key={outcome} className="flex items-start gap-3 text-gray-700">
                      <svg className="w-5 h-5 text-[#138A9A] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Focus by grade band */}
              <div>
                <h2 className="text-2xl font-bold text-[#001532] mb-4">What sessions focus on, K–8</h2>
                <div className="space-y-4">
                  {offering.focus.map((f) => (
                    <div
                      key={f.band}
                      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 border-l-4"
                      style={{ borderLeftColor: offering.accentColour }}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <span
                          className="flex items-center justify-center px-2.5 h-7 rounded-full text-white font-bold text-xs shrink-0"
                          style={{ backgroundColor: offering.accentColour }}
                        >
                          Grades {f.band}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mt-2">{f.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Included */}
              <div>
                <h2 className="text-2xl font-bold text-[#001532] mb-4">Included with every semester</h2>
                <ul className="space-y-2">
                  {INCLUDED.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-600 text-sm">
                      <span className="w-2 h-2 bg-[#138A9A] rounded-full shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pairs with coding */}
              <div className="bg-[#138A9A]/10 rounded-xl p-6 border border-[#138A9A]/20">
                <p className="text-gray-700 text-sm leading-relaxed">
                  Tutoring complements our coding and AI programs — it doesn&apos;t replace them. Many families pair a
                  coding program with math or reading tutoring.{" "}
                  <Link href="/programs" className="font-semibold text-[#138A9A] underline">
                    Explore the full CODEship journey →
                  </Link>
                </p>
              </div>

              {/* FAQ */}
              <div>
                <h2 className="text-2xl font-bold text-[#001532] mb-4">Common Questions</h2>
                <FAQAccordion faqs={offering.faqs} />
              </div>
            </div>

            {/* Sidebar: both formats */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-4">
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-extrabold text-[#001532]">CAD ${offering.priceCad}</span>
                    <span className="text-gray-500 text-sm">/ semester</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-5">
                    {SEMESTER_SHAPE_LABEL} — one class a week for {SEMESTER_WEEKS} weeks. Choose your format:
                  </p>

                  <div className="space-y-3">
                    {formats.map((f) => (
                      <div key={f.key} className="rounded-xl border-2 border-gray-200 p-4">
                        <p className="font-semibold text-[#001532] text-sm">{f.title}</p>
                        <p className="text-gray-500 text-xs mb-3">{f.sub}</p>
                        <Link
                          href={ctaHref(offering, f.key)}
                          {...(isLivePaymentLink(offering.paymentLink)
                            ? { target: "_self" as const }
                            : {})}
                          className="inline-flex w-full items-center justify-center rounded-xl bg-[#E5A823] px-5 py-3 text-center font-bold text-[#001532] transition-colors hover:bg-[#d4941f]"
                        >
                          {ctaLabel(offering)}
                        </Link>
                      </div>
                    ))}
                  </div>

                  <p className="text-gray-400 text-xs mt-4 text-center">
                    {live
                      ? "Secure checkout powered by Stripe."
                      : "Enrollment opens soon — join the interest list and we'll email you the moment it does."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Other offering */}
        {others.length > 0 && (
          <section className="pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-xl font-bold text-[#001532] mb-4">More academic skill-building</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {others.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/programs/${t.slug}`}
                    className="block bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <span className="block font-bold text-[#001532]">{t.label}</span>
                    <span className="block text-gray-500 text-sm mt-1">Grades {t.gradeBand} · {t.subject}</span>
                  </Link>
                ))}
                <Link
                  href="/programs/weekly-classes"
                  className="block bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <span className="block font-bold text-[#001532]">Coding &amp; AI Weekly Classes</span>
                  <span className="block text-gray-500 text-sm mt-1">The K–8 CODEship journey</span>
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
