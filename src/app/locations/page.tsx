import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CODEship Academy Locations Across Canada",
  description:
    "Find CODEship Academy coding and STEM programs near you. Locations across Ontario, BC, and Alberta including Toronto, Calgary, Vancouver, and more.",
  alternates: { canonical: "https://www.codeshipacademy.com/locations" },
};

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
    <div className="bg-[#FAFAFA]">
      <section className="bg-[#3D4466] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
                  <h2 className="font-bold text-[#3D4466] text-lg group-hover:text-[#F5C518] transition-colors">
                    {city.name}
                  </h2>
                  <p className="text-gray-400 text-sm">{city.province}</p>
                </div>
                <span className="text-[#F5C518] text-xl">→</span>
              </Link>
            ))}
          </div>

          <div className="bg-[#3D4466] rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Don&apos;t See Your City?</h2>
            <p className="text-gray-300 mb-6">
              CODEship Academy is expanding across Canada. Inquire about bringing programs to your community — or learn
              about franchise opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact" className="bg-[#F5C518] text-[#3D4466] font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors">
                Contact Us
              </Link>
              <Link href="/franchise" className="border-2 border-white text-white font-bold px-6 py-3 rounded-xl hover:bg-white hover:text-[#3D4466] transition-colors">
                Franchise Opportunity
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
