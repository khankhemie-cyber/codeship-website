import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/pageMetadata";
import { localBusinessSchema, breadcrumbSchema } from "@/lib/schema";
import {
  IN_PERSON,
  IN_PERSON_CITY_GEO,
  IN_PERSON_OPENING_HOURS,
  IN_PERSON_VENUE,
  LOCATIONS,
  DURHAM_SERVICE_AREA,
} from "@/data/locations";
import { PageHero, Section, SectionHeader, ButtonLink } from "@/components/ui/Page";
import { saturdayTime } from "@/lib/booking";

export const metadata: Metadata = pageMetadata({
  title: "Locations — Oshawa In Person & Online Across Canada | CODEship Academy",
  description:
    "In-person kids coding classes at Core21, 21 Simcoe St South, Oshawa. Live online classes across Canada. In-person waitlists open in 11 more cities.",
  path: "/locations",
});

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Locations", href: "/locations" },
];

export default function LocationsPage() {
  const waitlistCities = LOCATIONS.filter((l) => l.inPerson === "waitlist");

  return (
    <>
      {IN_PERSON.map((city) => (
        <script
          key={city}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              localBusinessSchema(city, {
                geo: IN_PERSON_CITY_GEO[city],
                openingHours: IN_PERSON_OPENING_HOURS,
                streetAddress: IN_PERSON_VENUE.street,
                areaServed: [...DURHAM_SERVICE_AREA],
              })
            ),
          }}
        />
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />

      <PageHero
        crumbs={crumbs}
        eyebrow="Locations"
        title="In person in Oshawa. Online everywhere."
        lead="Saturday classes run at Core21 in Oshawa. Families anywhere in Canada can join online."
      />

      <Section>
        <div className="bg-white shadow-sm p-8 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t-4 border-[#138A9A]">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[#0f6f7c]">Open for booking</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#001532] mt-2">Oshawa</h2>
            <address className="not-italic text-xl text-gray-700 mt-4 leading-snug">
              {IN_PERSON_VENUE.building}
              <br />
              {IN_PERSON_VENUE.street}, {IN_PERSON_VENUE.city}
            </address>
          </div>
          <div>
            <ul className="space-y-2 text-lg text-[#001532]">
              <li>
                <span className="font-bold">Explorers &amp; Builders:</span> {saturdayTime("explorers")}
              </li>
              <li>
                <span className="font-bold">Developers &amp; Engineers:</span> {saturdayTime("developers")}
              </li>
            </ul>
            <div className="mt-6">
              <ButtonLink href="/locations/oshawa">See Oshawa Classes</ButtonLink>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="white">
        <SectionHeader
          title="Other cities"
          lead="Online classes are open in every city. Join a waitlist to hear when in-person classes open."
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {waitlistCities.map((city) => (
            <Link
              key={city.slug}
              href={`/locations/${city.slug}`}
              className="group bg-[#FAF8F4] p-5 border border-gray-200 hover:border-[#F4D734] hover:shadow-md transition-all"
            >
              <p className="text-xl font-bold text-[#001532] group-hover:text-[#138A9A]">{city.name}</p>
              <p className="text-base text-gray-600 mt-1">{city.province} · Online open</p>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
