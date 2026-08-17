import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { localBusinessSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/pageMetadata";
import {
  IN_PERSON_CITY_GEO,
  IN_PERSON_OPENING_HOURS,
  LOCATIONS,
  LOCATIONS_BY_SLUG,
  DURHAM_SERVICE_AREA,
  type InPersonCity,
} from "@/data/locations";
import FAQAccordion from "@/components/FAQAccordion";
import Breadcrumbs from "@/components/Breadcrumbs";

interface Props {
  params: { city: string };
}

export function generateStaticParams() {
  return LOCATIONS.map((l) => ({ city: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const location = LOCATIONS_BY_SLUG[params.city];
  if (!location) return {};
  const isOpen = location.inPerson === "open";
  const description = isOpen
    ? `Kids coding, AI & STEM programs in ${location.name} (Durham Region) — in-person on Saturdays and live online. K–8, flat CAD $129/semester. Register today.`
    : `Live online kids coding, AI & STEM classes for families in ${location.name} — open now, flat CAD $129/semester. In-person classes are coming to ${location.name}; join the waitlist to be first in line.`;
  return pageMetadata({
    title: `CODEship Academy ${location.name} | Kids Coding, AI & STEM (K–8)`,
    description,
    path: `/locations/${params.city}`,
  });
}

export default function CityPage({ params }: Props) {
  const location = LOCATIONS_BY_SLUG[params.city];
  if (!location) notFound();

  const cityName = location.name;
  const province = location.province;
  const citySlug = location.slug;
  const isOpen = location.inPerson === "open";

  const localFaqs = [
    {
      question: `Can my child join CODEship in ${cityName} in-person or online?`,
      answer: isOpen
        ? `Both. ${cityName} is our in-person home base — coding, AI, and STEM classes run on Saturdays — and every program is also available live online. Each program is a flat CAD $129 per semester (8 weekly classes).`
        : `Online classes are open to ${cityName} families right now — every program runs live online for a flat CAD $129 per semester (8 weekly classes). In-person classes in ${cityName} are on the way; join the waitlist to be first in line when a local cohort opens.`,
    },
    {
      question: `What CODEship programs are available in ${cityName}?`,
      answer: `Families in ${cityName} can enrol in the full K–8 journey — Explorers, Builders, Developers and Engineers — along with camps, school workshops, birthday parties, and AI & robotics.`,
    },
    {
      question: `How do I enroll my child in ${cityName}?`,
      answer: isOpen
        ? `Register online in a few minutes and pick in-person (Oshawa, Saturdays) or online at checkout. Our team will confirm placement and share next steps.`
        : `Register online today for any program, or join the in-person waitlist for ${cityName}. Our admissions team will contact waitlisted families as soon as a local in-person cohort is scheduled.`,
    },
    {
      question: `Does CODEship partner with schools in ${cityName}?`,
      answer: `Yes. We work with schools in and around ${cityName} to deliver after-school clubs, PA Day programs, and in-class STEM enrichment. School administrators can request information through our school partnerships page.`,
    },
  ];

  const localBusinessOptions = isOpen
    ? {
        geo: IN_PERSON_CITY_GEO[cityName as InPersonCity],
        openingHours: IN_PERSON_OPENING_HOURS,
        areaServed: [...DURHAM_SERVICE_AREA],
      }
    : { areaServed: [cityName] };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema(cityName, localBusinessOptions)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", href: "/" },
              { name: "Locations", href: "/locations" },
              { name: cityName, href: `/locations/${citySlug}` },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(localFaqs)) }}
      />

      <div className="bg-[#FAF8F4]">
        <section className="bg-[#001532] py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-4">
              <Breadcrumbs
                items={[
                  { name: "Home", href: "/" },
                  { name: "Locations", href: "/locations" },
                  { name: cityName, href: `/locations/${citySlug}` },
                ]}
              />
            </div>
            <div className="flex justify-center mb-4">
              {isOpen ? (
                <span className="text-xs font-bold uppercase tracking-widest bg-[#138A9A] text-white px-3 py-1 rounded-full">
                  In-Person Open · Online Open
                </span>
              ) : (
                <span className="text-xs font-bold uppercase tracking-widest bg-[#E5A823] text-[#001532] px-3 py-1 rounded-full">
                  In-Person: Waitlist · Online: Open
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              CODEship Academy {cityName}
            </h1>
            <p className="text-gray-300 text-xl max-w-2xl mx-auto">
              {isOpen
                ? `Coding, AI, and STEM programs for children in ${cityName}, ${province} — in-person on Saturdays and live online, serving families across Durham Region.`
                : `Live online coding, AI, and STEM programs for children in ${cityName}, ${province} — open now. In-person classes are coming to ${cityName}; join the waitlist to be first in line.`}
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              <div>
                <h2 className="text-2xl font-bold text-[#001532] mb-4">Programs in {cityName}</h2>
                <p className="text-gray-600 mb-6">
                  CODEship Academy serves the {cityName} community through multiple program formats — making quality
                  coding, AI, and STEM education accessible to more children and families, in-person and online.
                </p>
                <div className="space-y-3">
                  {[
                    { title: "Weekly Classes", desc: "Ongoing weekly sessions for all experience levels, ages 5–16.", href: "/programs/weekly-classes" },
                    { title: "Summer Camps", desc: "Immersive week-long camps during the summer.", href: "/programs/camps" },
                    { title: "March Break & PA Day", desc: "Full-day workshops during school breaks.", href: "/programs/camps" },
                    { title: "School Workshops", desc: "After-school clubs and in-school enrichment.", href: "/programs/school-workshops" },
                    { title: "Birthday Parties", desc: "Unique coding birthday party experiences.", href: "/programs/birthday-parties" },
                    { title: "AI & Robotics", desc: "Hands-on AI and robotics programs for ages 8–16.", href: "/programs/ai-robotics" },
                  ].map((prog) => (
                    <Link key={prog.title} href={prog.href} className="flex items-start gap-3 bg-white rounded-xl p-4 hover:shadow-md transition-shadow border border-gray-100">
                      <span className="w-2 h-2 bg-[#138A9A] rounded-full mt-1.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-[#001532] text-sm">{prog.title}</p>
                        <p className="text-gray-500 text-xs">{prog.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {/* Map embed */}
                <div className="rounded-2xl overflow-hidden h-48 shadow-sm border border-gray-100">
                  <iframe
                    title={`Map of ${cityName}, ${province}`}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(cityName + ", " + province + ", Canada")}&output=embed&z=12`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                {/* Register / Waitlist CTA */}
                {isOpen ? (
                  <div className="bg-[#E5A823] rounded-2xl p-6 text-center">
                    <h3 className="font-bold text-[#001532] text-lg mb-2">Ready to Enroll?</h3>
                    <p className="text-[#001532]/70 text-sm mb-4">
                      In-person classes in {cityName} are open for registration — pick in-person or online at checkout.
                      Flat CAD $129/semester.
                    </p>
                    <Link href="/register" className="bg-[#001532] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#00306b] transition-colors inline-block text-sm">
                      Register Now
                    </Link>
                  </div>
                ) : (
                  <div className="bg-[#E5A823] rounded-2xl p-6 text-center">
                    <h3 className="font-bold text-[#001532] text-lg mb-2">In-Person Is Coming to {cityName}</h3>
                    <p className="text-[#001532]/80 text-sm mb-4">
                      We&apos;re building in-person classes in {cityName} — join the waitlist to be first in line, or
                      register online today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link
                        href={`/waitlist?city=${encodeURIComponent(cityName)}`}
                        className="bg-[#001532] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#00306b] transition-colors inline-block text-sm"
                      >
                        Join the Waitlist
                      </Link>
                      <Link
                        href="/register"
                        className="bg-white text-[#001532] font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors inline-block text-sm border border-[#001532]/20"
                      >
                        Register Online
                      </Link>
                    </div>
                  </div>
                )}

                {/* School CTA */}
                <div className="bg-[#001532] rounded-2xl p-6 text-white">
                  <h3 className="font-bold text-lg mb-2">Schools in {cityName}</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Interested in bringing CODEship programs to your school in {cityName}? We partner with schools
                    across the region.
                  </p>
                  <Link href="/schools" className="bg-[#E5A823] text-[#001532] font-bold px-4 py-2 rounded-lg hover:bg-[#d4941f] transition-colors inline-block text-sm">
                    School Partnership Info
                  </Link>
                </div>

                {/* Franchise CTA */}
                <div className="bg-[#138A9A]/10 rounded-2xl p-6">
                  <h3 className="font-bold text-[#001532] mb-2">Franchise Opportunity in {cityName}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Interested in bringing CODEship Academy to {cityName} as a franchise owner? Contact us to learn
                    about territory availability.
                  </p>
                  <Link href="/franchise" className="text-[#E5A823] font-semibold text-sm hover:underline">
                    Learn About Franchising →
                  </Link>
                  <p className="text-xs text-gray-400 mt-1">
                    For informational purposes only. No franchise offering is made here.
                  </p>
                </div>
              </div>
            </div>

            {/* Durham Region service-area note — anchored on Oshawa */}
            {isOpen && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-16">
                <h2 className="text-2xl font-bold text-[#001532] mb-3">Serving Families Across Durham Region</h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Our Oshawa home base welcomes families from across Durham Region. Whether you&apos;re in Oshawa,
                  Whitby, Courtice, Bowmanville, or Clarington, your child can join our Saturday in-person coding, AI,
                  and STEM classes — or attend live online from home. CODEship Academy is Durham Region&apos;s K–8
                  destination for creative, project-based coding, AI, and STEM education.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Every program is a flat CAD $129 per semester — 8 weekly classes, one class a week — with the same
                  price whether your child attends in-person in Oshawa or online.
                </p>
              </div>
            )}

            {/* FAQ */}
            <h2 className="text-2xl font-bold text-[#001532] mb-6">{cityName} FAQ</h2>
            <FAQAccordion faqs={localFaqs} />
          </div>
        </section>
      </div>
    </>
  );
}
