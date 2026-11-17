"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PROGRAM_LINKS, ageLabel, type ProgramLevel } from "@/lib/payment-links";
import { CLASS_SCHEDULE } from "@/config/classSchedule";
import { IN_PERSON_VENUE } from "@/data/locations";
import { PHONE_DISPLAY, PHONE_HREF } from "@/config/contact";
import { trackEvent } from "@/lib/analytics";

interface TrialBookedTemplateProps {
  program: ProgramLevel;
}

/**
 * Landing page after a free-trial Stripe checkout (the trial Payment Links
 * redirect here). Reports one `generate_lead` to GA4 and one Meta `Lead` per
 * program per browser session, so trial bookings show up separately from
 * paid enrolments (which fire `purchase` on /success/<program>/).
 */
export default function TrialBookedTemplate({ program }: TrialBookedTemplateProps) {
  const config = PROGRAM_LINKS[program];
  const schedule = CLASS_SCHEDULE[program];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `trial_lead_fired_${program}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "true");
    } catch {
      // Storage blocked (private mode): report anyway.
    }

    // GA4 lead (GA applies the visitor's Consent Mode choice).
    trackEvent("generate_lead", { method: "free_trial", item_id: program, value: 0, currency: "CAD" });

    // The Meta Pixel only exists after "Accept all" and loads after this page
    // hydrates, so wait briefly for it rather than miss the lead.
    let tries = 0;
    const timer = window.setInterval(() => {
      const w = window as typeof window & { fbq?: (...args: unknown[]) => void };
      if (w.fbq) {
        w.fbq("track", "Lead", { content_name: `${config.label} - Free trial class`, content_category: "free_trial" });
      }
      if (w.fbq || ++tries >= 20) window.clearInterval(timer);
    }, 250);
    return () => window.clearInterval(timer);
  }, [program, config.label]);

  return (
    <div className="bg-[#FAF8F4]">
      <section className="bg-[#0D1B2A] py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-[#2E8C8C] rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-[#F4D734] font-bold text-sm uppercase tracking-widest mb-2">Free trial booked</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">You&apos;re booked in!</h1>
          <p className="text-gray-300 text-xl">
            Your child&apos;s free <span className="font-semibold text-white">{config.label}</span> trial class is
            reserved.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-wrap gap-3">
            <span className="bg-white border border-gray-100 shadow-sm text-[#0D1B2A] px-4 py-2 text-sm font-semibold">
              {config.label}
            </span>
            <span className="bg-white border border-gray-100 shadow-sm text-[#0D1B2A] px-4 py-2 text-sm font-semibold">
              {ageLabel(program, false)}
            </span>
          </div>

          <div className="bg-white shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#0D1B2A] mb-1">When {config.label} meets</h2>
            <p className="text-gray-500 text-sm mb-5">Come to the format you chose at checkout.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-gray-100 bg-[#FAF8F4] p-5">
                <h3 className="font-bold text-[#0D1B2A] mb-2">In-Person: Oshawa</h3>
                <p className="text-sm text-[#0D1B2A]">
                  {schedule.inperson.days}, {schedule.inperson.time}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  {IN_PERSON_VENUE.building}, {IN_PERSON_VENUE.street}, {IN_PERSON_VENUE.city}
                </p>
              </div>
              <div className="border border-gray-100 bg-[#FAF8F4] p-5">
                <h3 className="font-bold text-[#0D1B2A] mb-2">Online: anywhere</h3>
                <p className="text-sm text-[#0D1B2A]">
                  {schedule.online.days}, {schedule.online.time}
                </p>
                <p className="mt-2 text-sm text-gray-600">Live with an instructor. Eastern Time.</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#0D1B2A] mb-3">What happens next</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your booking confirmation from Stripe is on its way to your inbox. If you have a question about your
              trial class, email us or call, and we&apos;ll help.
            </p>
          </div>

          <div className="bg-white shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#0D1B2A] mb-2">Enjoyed it? Save a seat for the full semester</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              After the trial, your child can join {config.label} for the full semester.
            </p>
            <Link
              href={`/register/${program}/`}
              className="focus-ring inline-block bg-[#F4D734] text-[#0D1B2A] font-bold px-6 py-3 text-sm hover:brightness-95"
            >
              See {config.label} semester dates
            </Link>
          </div>

          <div className="text-center pt-2">
            <p className="text-gray-600 text-sm">
              Questions? Email us at{" "}
              <a href="mailto:admin@codeshipacademy.com" className="text-[#2E8C8C] font-semibold hover:underline">
                admin@codeshipacademy.com
              </a>{" "}
              or call{" "}
              <a href={PHONE_HREF} className="text-[#2E8C8C] font-semibold hover:underline">
                {PHONE_DISPLAY}
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
