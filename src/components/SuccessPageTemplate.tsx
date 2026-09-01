"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PROGRAM_LINKS, ageLabel, type ProgramLevel } from "@/lib/payment-links";
import { CLASS_SCHEDULE, START_OPTIONS } from "@/config/classSchedule";
import { CLASSES_PER_SEMESTER } from "@/config/offering";

/**
 * Per-program Semester 1 content for the post-payment page. Project names and
 * level framing are fixed curriculum facts; no exact class titles are invented.
 */
const SUCCESS_CONTENT: Record<ProgramLevel, { project: string; framing: string }> = {
  explorers: {
    project: "My Helpful Robot",
    framing: "Visual block coding — first steps in giving a computer instructions",
  },
  builders: {
    project: "All About Me Page",
    framing: "Moving from blocks into real HTML & CSS",
  },
  developers: {
    project: "Homework Timer & Focus Tool",
    framing: "HTML/CSS into JavaScript — building something they'll actually use",
  },
  engineers: {
    project: "Password Strength Checker",
    framing: "JavaScript into Python, with real cybersecurity concepts",
  },
};

interface SuccessPageTemplateProps {
  program: ProgramLevel;
}

export default function SuccessPageTemplate({ program }: SuccessPageTemplateProps) {
  const config = PROGRAM_LINKS[program];
  const content = SUCCESS_CONTENT[program];
  const schedule = CLASS_SCHEDULE[program];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `purchase_fired_${program}`;
    if (sessionStorage.getItem(key)) return;

    // fbq is only present once the visitor has accepted analytics cookies
    // (see components/Analytics.tsx). The optional call respects that consent
    // gate — the value is used for the Pixel event only and is never rendered.
    const w = window as typeof window & { fbq?: (...args: unknown[]) => void };
    w.fbq?.("track", "Purchase", {
      value: config.priceCad,
      currency: "CAD",
      content_name: `${config.label} - Semester 1`,
      content_type: "product",
    });

    try {
      sessionStorage.setItem(key, "true");
    } catch {
      // Ignore storage failures (private mode).
    }
  }, [program, config.priceCad, config.label]);

  return (
    <div className="bg-[#FAF8F4]">
      {/* Confirmation header */}
      <section className="bg-[#0D1B2A] py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-[#2E8C8C] rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-[#F5C518] font-bold text-sm uppercase tracking-widest mb-2">Registration confirmed</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">You&apos;re registered!</h1>
          <p className="text-gray-300 text-xl">
            Welcome to <span className="font-semibold text-white">{config.label}</span> at CODEship Academy.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Program snapshot */}
          <div className="flex flex-wrap gap-3">
            <span className="bg-white border border-gray-100 shadow-sm text-[#0D1B2A] px-4 py-2 rounded-xl text-sm font-semibold">
              {config.label}
            </span>
            <span className="bg-white border border-gray-100 shadow-sm text-[#0D1B2A] px-4 py-2 rounded-xl text-sm font-semibold">
              {ageLabel(program, false)}
            </span>
            <span className="bg-white border border-gray-100 shadow-sm text-[#0D1B2A] px-4 py-2 rounded-xl text-sm font-semibold">
              In-Person &amp; Online
            </span>
          </div>

          {/* Class schedule card — both formats, so families see the option they chose */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#0D1B2A] mb-1">Your class schedule</h2>
            <p className="text-gray-500 text-sm mb-5">
              {CLASSES_PER_SEMESTER} weekly classes. Below are both formats — attend the one you chose at checkout.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* In-person */}
              <div className="rounded-xl border border-gray-100 bg-[#FAF8F4] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#2E8C8C]" />
                  <h3 className="font-bold text-[#0D1B2A]">In-Person — Oshawa</h3>
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Day</dt>
                    <dd className="font-semibold text-[#0D1B2A] text-right">{schedule.inperson.days}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Time</dt>
                    <dd className="font-semibold text-[#0D1B2A] text-right">{schedule.inperson.time}</dd>
                  </div>
                  {START_OPTIONS.map((opt) => (
                    <div key={opt.key} className="flex justify-between gap-4">
                      <dt className="text-gray-500">{opt.label}</dt>
                      <dd className="font-semibold text-[#0D1B2A] text-right">
                        {schedule.inperson.starts[opt.key as keyof typeof schedule.inperson.starts]}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-xs text-gray-500">21 Simcoe St South, Oshawa — serving families across Durham Region.</p>
              </div>

              {/* Online */}
              <div className="rounded-xl border border-gray-100 bg-[#FAF8F4] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#F5C518]" />
                  <h3 className="font-bold text-[#0D1B2A]">Online — anywhere</h3>
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Day</dt>
                    <dd className="font-semibold text-[#0D1B2A] text-right">{schedule.online.days}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Time</dt>
                    <dd className="font-semibold text-[#0D1B2A] text-right">{schedule.online.time}</dd>
                  </div>
                  {START_OPTIONS.map((opt) => (
                    <div key={opt.key} className="flex justify-between gap-4">
                      <dt className="text-gray-500">{opt.label}</dt>
                      <dd className="font-semibold text-[#0D1B2A] text-right">
                        {schedule.online.starts[opt.key as keyof typeof schedule.online.starts]}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-xs text-gray-500">Live, instructor-led — open to every city.</p>
              </div>
            </div>
          </div>

          {/* Semester 1 overview card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#0D1B2A] mb-1">What your child will build</h2>
            <p className="text-[#3A5B9E] text-sm font-semibold mb-4">{content.framing}</p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Over {CLASSES_PER_SEMESTER} hands-on classes, your child will work toward a real project:{" "}
              <span className="font-semibold text-[#0D1B2A]">{content.project}</span>. Along the way there are short
              quizzes to check understanding, and a theory component that connects what they&apos;re building
              to bigger ideas in computing.
            </p>
          </div>

          {/* What happens next */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#0D1B2A] mb-3">What happens next</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              There&apos;s nothing else you need to do right now. About one week before the first class, we&apos;ll
              email you everything your child needs to get started:
            </p>
            <ul className="space-y-2 mb-4">
              {["Class log-in details (online) or location directions (in-person)", "Their digital workbook", "The complete class schedule"].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-gray-700 text-sm">
                  <svg
                    className="w-5 h-5 text-[#2E8C8C] shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-gray-500 text-sm leading-relaxed">
              Keep an eye on your inbox as the start date approaches — and check your spam folder just in case.
            </p>
          </div>

          {/* Support footer */}
          <div className="text-center pt-2">
            <p className="text-gray-600 text-sm">
              Questions? Email us at{" "}
              <a href="mailto:admin@codeshipacademy.com" className="text-[#2E8C8C] font-semibold hover:underline">
                admin@codeshipacademy.com
              </a>
            </p>
            <p className="text-[#0D1B2A] font-bold text-sm uppercase tracking-widest mt-4">Dream. Code. Achieve.</p>
            <div className="mt-6">
              <Link href="/programs" className="text-[#3A5B9E] font-semibold text-sm hover:underline">
                Explore more programs →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
