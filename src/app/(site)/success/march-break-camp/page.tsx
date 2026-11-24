import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/pageMetadata";
import { MARCH_BREAK_CAMP as CAMP } from "@/config/camps";
import { IN_PERSON_VENUE } from "@/data/locations";
import { PHONE_DISPLAY, PHONE_HREF } from "@/config/contact";
import CampPurchase from "./CampPurchase";

export const metadata: Metadata = pageMetadata({
  title: "You're registered: March Break Camp | CODEship Academy",
  description: "Registration confirmed for the CODEship March Break camp.",
  path: "/success/march-break-camp",
  noindex: true,
});

export default function CampSuccessPage() {
  return (
    <div className="bg-[#FAF8F4]">
      <CampPurchase />
      <section className="bg-[#001532] py-16 sm:py-20 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-[#F4D734] font-bold text-sm uppercase tracking-widest mb-2">Registration confirmed</p>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white">You&apos;re in for March Break!</h1>
          <p className="text-gray-300 text-xl mt-3">Your child&apos;s spot at {CAMP.title} is secured.</p>
        </div>
      </section>
      <section className="py-14">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#001532]">Camp details</h2>
            <dl className="mt-4 space-y-2 text-base">
              {[
                ["Dates", `${CAMP.days}, ${CAMP.dates}`],
                ["Hours", CAMP.hours],
                ["Where", `${IN_PERSON_VENUE.building}, ${IN_PERSON_VENUE.street}, ${IN_PERSON_VENUE.city}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-gray-500">{k}</dt>
                  <dd className="font-semibold text-[#001532] text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#001532]">What happens next</h2>
            <p className="text-gray-600 mt-3">
              Nothing else to do right now. About one week before camp, we&apos;ll email you drop-off details and what to pack.
              Questions? Call or text{" "}
              <a href={PHONE_HREF} className="font-semibold text-[#0F6F7C] underline">
                {PHONE_DISPLAY}
              </a>
              .
            </p>
          </div>
          <Link href="/" className="inline-block font-semibold text-[#0F6F7C] underline">
            Back to the home page
          </Link>
        </div>
      </section>
    </div>
  );
}
