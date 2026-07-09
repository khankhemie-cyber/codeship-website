import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/pageMetadata";
import { localBusinessSchema, breadcrumbSchema } from "@/lib/schema";
import { IN_PERSON, IN_PERSON_CITY_GEO, IN_PERSON_OPENING_HOURS } from "@/data/locations";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = pageMetadata({
  title: "CODEship Academy Locations Across Canada",
  description:
    "Find CODEship Academy coding and STEM programs near you. Locations across Ontario, BC, and Alberta including Toronto, Calgary, Vancouver, and more.",
  path: "/locations",
});

const cities = [
  { name: "Oshawa", province: "ON" },
  { name: "Toronto", province: "ON" },
  { name: "Mississauga", province: "ON" },
  { name: "Brampton", province: "ON" },
  { name: "Markham", province: "ON" },
  { name: "Scarborough", province: "ON" },
  { name: "Vaughan", province: "ON" },
  { name: "Milton", province: "ON" },
  { name: "Calgary", province: "AB" },
  { name: "Edmonton", province: "AB" },
  { name: "Vancouver", province: "BC" },
  { name: "Surrey", province: "BC" },
];

export default function LocationsPage() {
  return (
    <>
      {/* LocalBusiness schema — one per official in-person city only (Toronto, Vaughan, Oshawa, Calgary, Vancouver). */}
      {IN_PERSON.map((city) => (
        <script
          key={city}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              localBusinessSchema(city, { geo: IN_PERSON_CITY_GEO[city], openingHours: IN_PERSON_OPENING_HOURS })
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
              CODEship Academy programs are available across Canada. Find a location near you or inquire about bringing
              CODEship to your community.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
              {cities.map((city) => (
                <Link
                  key={city.name}
                  href={`/locations/${city.name.toLowerCase()}`}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100 group flex items-center justify-between"
                >
                  <div>
                    <h2 className="font-bold text-[#001532] text-lg group-hover:text-[#E5A823] transition-colors">
                      {city.name}
                    </h2>
                    <p className="text-gray-400 text-sm">{city.province}</p>
                  </div>
                  <span className="text-[#E5A823] text-xl">→</span>
                </Link>
              ))}
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
