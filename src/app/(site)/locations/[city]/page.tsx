import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { localBusinessSchema, breadcrumbSchema } from "@/lib/schema";
import FAQAccordion from "@/components/FAQAccordion";

const cities = [
  "oshawa", "toronto", "mississauga", "brampton", "markham",
  "scarborough", "vaughan", "milton", "calgary", "edmonton", "vancouver", "surrey",
];

const cityNames: Record<string, string> = {
  oshawa: "Oshawa",
  toronto: "Toronto",
  mississauga: "Mississauga",
  brampton: "Brampton",
  markham: "Markham",
  scarborough: "Scarborough",
  vaughan: "Vaughan",
  milton: "Milton",
  calgary: "Calgary",
  edmonton: "Edmonton",
  vancouver: "Vancouver",
  surrey: "Surrey",
};

const cityProvinces: Record<string, string> = {
  oshawa: "ON", toronto: "ON", mississauga: "ON", brampton: "ON",
  markham: "ON", scarborough: "ON", vaughan: "ON", milton: "ON",
  calgary: "AB", edmonton: "AB", vancouver: "BC", surrey: "BC",
};

interface Props {
  params: { city: string };
}

export async function generateStaticParams() {
  return cities.map((city) => ({ city }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cityName = cityNames[params.city];
  if (!cityName) return {};
  return {
    title: `CODEship Academy ${cityName} | Kids Coding & STEM Programs`,
    description: `CODEship Academy in ${cityName} offers coding, AI, and STEM programs for children — weekly classes, camps, school workshops, and more.`,
    alternates: { canonical: `https://www.codeshipacademy.com/locations/${params.city}` },
  };
}

export default function CityPage({ params }: Props) {
  const citySlug = params.city;
  if (!cities.includes(citySlug)) notFound();

  const cityName = cityNames[citySlug];
  const province = cityProvinces[citySlug];

  const localFaqs = [
    {
      question: `What CODEship programs are available in ${cityName}?`,
      answer: `CODEship Academy in ${cityName} offers weekly classes, summer camps, March Break and PA Day workshops, school partnership programs, and birthday parties. Contact us for current availability.`,
    },
    {
      question: `How do I enroll my child in ${cityName}?`,
      answer: `Contact us directly to learn about current enrollment opportunities in ${cityName}. Our team will match your child with the right program based on age, experience, and interest.`,
    },
    {
      question: `Does CODEship partner with schools in ${cityName}?`,
      answer: `Yes. We work with schools in and around ${cityName} to deliver after-school clubs, PA Day programs, and in-class STEM enrichment. School administrators can request information through our school partnerships page.`,
    },
    {
      question: `Is there a franchise opportunity in ${cityName}?`,
      answer: `We may have franchise opportunities available in the ${cityName} area. Contact us for current territory availability.`,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema(cityName)) }}
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

      <div className="bg-[#FAF8F4]">
        <section className="bg-[#001532] py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Link href="/locations" className="text-gray-400 hover:text-[#E5A823] text-sm transition-colors mb-4 inline-block">
              ← All Locations
            </Link>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              CODEship Academy {cityName}
            </h1>
            <p className="text-gray-300 text-xl max-w-2xl mx-auto">
              Coding, AI, and STEM programs for children in {cityName}, {province} — building future creators
              through hands-on project-based learning.
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
                  coding and STEM education accessible to more children and families.
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

                {/* Register CTA */}
                <div className="bg-[#E5A823] rounded-2xl p-6 text-center">
                  <h3 className="font-bold text-[#001532] text-lg mb-2">Ready to Enroll?</h3>
                  <p className="text-[#001532]/70 text-sm mb-4">
                    Get started with CODEship Academy in {cityName}. Contact us to check availability and register.
                  </p>
                  <Link href="/register" className="bg-[#001532] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#001532] transition-colors inline-block text-sm">
                    Register Now
                  </Link>
                </div>

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

            {/* FAQ */}
            <h2 className="text-2xl font-bold text-[#001532] mb-6">{cityName} FAQ</h2>
            <FAQAccordion faqs={localFaqs} />
          </div>
        </section>
      </div>
    </>
  );
}
