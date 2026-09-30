import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localBusinessSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/pageMetadata";
import {
  IN_PERSON_CITY_GEO,
  IN_PERSON_OPENING_HOURS,
  IN_PERSON_VENUE,
  LOCATIONS,
  LOCATIONS_BY_SLUG,
  DURHAM_SERVICE_AREA,
  type InPersonCity,
} from "@/data/locations";
import FAQAccordion from "@/components/FAQAccordion";
import GradeCards from "@/components/booking/GradeCards";
import NowBookingCard from "@/components/booking/NowBookingCard";
import { PageHero, Section, SectionHeader, BookingBand, ButtonLink } from "@/components/ui/Page";
import { PROGRAMS } from "@/data/programs";
import { CLASS_SCHEDULE } from "@/config/classSchedule";
import { PRICE_LABEL, SEMESTER_SHAPE_LABEL } from "@/config/offering";
import { SEMESTERS } from "@/lib/booking";

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
  return pageMetadata({
    title: isOpen
      ? `Kids Coding Classes in ${location.name}: Saturdays at Core21 | CODEship Academy`
      : `Kids Coding Classes in ${location.name}: Live Online | CODEship Academy`,
    description: isOpen
      ? `Saturday coding, AI & STEM classes for K–Grade 8 at ${IN_PERSON_VENUE.full}. Serving Durham Region. CAD $129 for 8 weekly classes.`
      : `Live online coding classes for ${location.name} kids in K–Grade 8. CAD $129 for 8 weekly classes. Join the waitlist for in-person classes.`,
    path: `/locations/${params.city}`,
  });
}

export default function CityPage({ params }: Props) {
  const location = LOCATIONS_BY_SLUG[params.city];
  if (!location) notFound();

  const cityName = location.name;
  const citySlug = location.slug;
  const isOpen = location.inPerson === "open";
  const semesters = SEMESTERS.map((s) => s.label).join(" and ");

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Locations", href: "/locations" },
    { name: cityName, href: `/locations/${citySlug}` },
  ];

  const localFaqs = isOpen
    ? [
        {
          question: `Where are the ${cityName} classes?`,
          answer: `At ${IN_PERSON_VENUE.full}, inside the ${IN_PERSON_VENUE.building} building. Classes run on Saturdays.`,
        },
        {
          question: "Which towns do you serve?",
          answer: `Families come from across Durham Region. That includes ${DURHAM_SERVICE_AREA.join(", ")}.`,
        },
        {
          question: "How much does it cost?",
          answer: `${PRICE_LABEL} per semester. Each semester has 8 weekly classes.`,
        },
        {
          question: "Which semesters are open?",
          answer: `The ${semesters} semesters are open for booking.`,
        },
      ]
    : [
        {
          question: `Are there in-person classes in ${cityName}?`,
          answer: `Not yet. Join the waitlist and we will contact you when a local class opens.`,
        },
        {
          question: `Can my child join online from ${cityName}?`,
          answer: `Yes. Live online classes are open now. They cost ${PRICE_LABEL} per semester.`,
        },
        {
          question: "When are the online classes?",
          answer: "Explorers and Builders meet on Tuesdays. Developers and Engineers meet on Thursdays. All classes are after school, Eastern Time.",
        },
      ];

  const localBusinessOptions = isOpen
    ? {
        geo: IN_PERSON_CITY_GEO[cityName as InPersonCity],
        openingHours: IN_PERSON_OPENING_HOURS,
        streetAddress: IN_PERSON_VENUE.street,
        areaServed: [...DURHAM_SERVICE_AREA],
      }
    : { areaServed: [cityName] };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema(cityName, localBusinessOptions)) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(localFaqs)) }} />

      {isOpen ? (
        <>
          <PageHero
            crumbs={crumbs}
            eyebrow="Durham Region"
            title={`Kids coding classes in ${cityName}`}
            lead={`Saturdays at ${IN_PERSON_VENUE.full}, in the ${IN_PERSON_VENUE.building} building.`}
          />

          <Section>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <NowBookingCard />
              <div className=" overflow-hidden shadow-sm border border-gray-200 h-80 lg:h-full lg:min-h-[420px]">
                <iframe
                  title={`Map of ${IN_PERSON_VENUE.full}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${IN_PERSON_VENUE.street}, ${IN_PERSON_VENUE.city}, ON, Canada`)}&output=embed&z=16`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </Section>

          <Section tone="white" id="book">
            <SectionHeader
              eyebrow="Enroll in 3 minutes"
              title="Pick your child's grade"
              lead={`${PRICE_LABEL} per semester · ${SEMESTER_SHAPE_LABEL}`}
            />
            <GradeCards />
          </Section>
        </>
      ) : (
        <>
          <PageHero
            crumbs={crumbs}
            eyebrow="Online now · In person soon"
            title={`Kids coding classes in ${cityName}`}
            lead="Live online classes are open now. In-person classes are coming soon."
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <ButtonLink href="/register">Enroll in Online Classes</ButtonLink>
              <ButtonLink href={`/waitlist?city=${encodeURIComponent(cityName)}`} variant="outline">
                Join the Waitlist
              </ButtonLink>
            </div>
          </PageHero>

          <Section>
            <SectionHeader title="Online class times" lead={`${PRICE_LABEL} per semester · ${SEMESTER_SHAPE_LABEL}`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PROGRAMS.map((p) => (
                <div key={p.slug} className="bg-white shadow-sm p-6">
                  <p className="text-sm font-bold uppercase tracking-widest text-gray-500">{p.gradeBand}</p>
                  <h3 className="text-2xl font-extrabold text-[#001532] mt-1">{p.level}</h3>
                  <p className="text-lg font-semibold text-[#001532] mt-4">
                    {CLASS_SCHEDULE[p.slug].online.days}
                    <br />
                    {CLASS_SCHEDULE[p.slug].online.time}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}

      <Section narrow>
        <SectionHeader center title={`${cityName} questions`} />
        <FAQAccordion faqs={localFaqs} />
      </Section>

      {isOpen ? (
        <BookingBand href="#book" />
      ) : (
        <BookingBand
          title="Start online today"
          href="/register"
          label="Enroll Online"
          detail="Live online classes with an instructor. October and November semesters are open."
        />
      )}
    </>
  );
}
