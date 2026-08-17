import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/pageMetadata";
import { localBusinessSchema, breadcrumbSchema } from "@/lib/schema";
import { IN_PERSON, IN_PERSON_CITY_GEO, IN_PERSON_OPENING_HOURS, LOCATIONS, DURHAM_SERVICE_AREA } from "@/data/locations";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = pageMetadata({
  title: "CODEship Academy Locations — In-Person in Oshawa & Online Across Canada",
  description:
    "In-person kids coding, AI, math and reading programs in Oshawa (Durham Region), plus live online classes across Canada. Toronto, Mississauga, Calgary, Vancouver and more — join the in-person waitlist or start online today.",
  path: "/locations",
});

export default function LocationsPage() {
  return (
    <>
      {/* LocalBusiness schema — the open in-person city only (Oshawa), serving Durham Region. */}
      {IN_PERSON.map((city) => (
        <script
          key={city}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              localBusinessSchema(city, {
                geo: IN_PERSON_CITY_GEO[city],
                openingHours: IN_PERSON_OPENING_HOURS,
                areaServed: [...DURHAM_SERVICE_AREA],
              })
            ),
          }}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([{ name: "Home", href: "/" }, { name: "Locations", href: "/locations" }])),
        }}
      />

      <div className="bg-[#FAF8F4]">
        <section className="bg-[#001532] py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-4">
              <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Locations", href: "/locations" }]} />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Find a Location</h1>
            <p className="text-gray-300 text-xl max-w-2xl mx-auto">
              In-person coding, AI, math and reading classes are open for registration in Oshawa, serving families
              across Durham Region. Live online classes are open everywhere — and in-person is coming to 11 more cities,
              where you can join the waitlist now.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
              {LOCATIONS.map((city) => {
                const isOpen = city.inPerson === "open";
                return (
                  <Link
                    key={city.slug}
                    href={`/locations/${city.slug}`}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100 group flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-bold text-[#001532] text-lg group-hover:text-[#E5A823] transition-colors">
                          {city.name}
                        </h2>
                        {isOpen ? (
                          <span className="text-[10px] font-bold uppercase tracking-wide bg-[#138A9A]/15 text-[#0f6f7c] px-2 py-0.5 rounded-full">
                            In-Person Open
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wide bg-[#E5A823]/20 text-[#8a6410] px-2 py-0.5 rounded-full">
                            In-Person: Waitlist
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-0.5">
                        {city.province} · Online open
                      </p>
                    </div>
                    <span className="text-[#E5A823] text-xl shrink-0">→</span>
                  </Link>
                );
              })}
            </div>

            <div className="bg-[#001532] rounded-2xl p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-3">Don&apos;t See Your City?</h2>
              <p className="text-gray-300 mb-6">
                CODEship Academy is expanding across Canada. Inquire about bringing programs to your community — or learn
                about franchise opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/contact" className="bg-[#E5A823] text-[#001532] font-bold px-6 py-3 rounded-xl hover:bg-[#d4941f] transition-colors">
                  Contact Us
                </Link>
                <Link href="/franchise" className="border-2 border-white text-white font-bold px-6 py-3 rounded-xl hover:bg-white hover:text-[#001532] transition-colors">
                  Franchise Opportunity
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
