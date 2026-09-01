"use client";

import { useEffect, useState } from "react";
import type { Program } from "@/data/programs";
import { CLASS_SCHEDULE, startsSummary } from "@/config/classSchedule";
import { SEMESTER_SHAPE_LABEL, SEMESTER_WEEKS } from "@/config/offering";
import type { LocationSlug } from "@/lib/registration";
import { EnrollButton } from "@/components/EnrollButton";
import { PROGRAM_LINKS, type ProgramLevel } from "@/lib/payment-links";
import { trackView, trackSelectLocation, trackRegisterClick } from "@/lib/analytics";

interface ProgramLocationSelectorProps {
  program: Program;
}

type Format = "inperson" | "online";

/**
 * Format picker for a program page. Two formats, both sold through the same
 * Stripe link:
 *   - In-Person — open in Oshawa only (Saturdays).
 *   - Online — open to every city.
 * In-person in the other 11 cities is waitlist-only and lives on those cities'
 * location pages, not here.
 */
export default function ProgramLocationSelector({ program }: ProgramLocationSelectorProps) {
  const level = program.slug as ProgramLevel;
  const config = PROGRAM_LINKS[level];
  const [format, setFormat] = useState<Format>("inperson");

  useEffect(() => {
    trackView({ program: program.slug });
    // Only fire once, on mount, for this program page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (value: Format) => {
    setFormat(value);
    const location: LocationSlug = value === "online" ? "online" : "oshawa";
    trackSelectLocation({ program: program.slug, location });
  };

  const schedule = CLASS_SCHEDULE[program.slug];
  const modeSchedule = schedule[format];

  const handleRegisterClick = () =>
    trackRegisterClick({ program: program.slug, location: format === "online" ? "online" : "oshawa" });

  const scheduleDetail =
    format === "online"
      ? `Online — ${modeSchedule.days} ${modeSchedule.time}, ${startsSummary(modeSchedule)}`
      : `Oshawa (in-person) — ${modeSchedule.days} ${modeSchedule.time}, ${startsSummary(modeSchedule)}`;

  const options: { value: Format; title: string; sub: string }[] = [
    {
      value: "inperson",
      title: "In-Person — Oshawa",
      sub: `${schedule.inperson.days}, ${schedule.inperson.time}`,
    },
    {
      value: "online",
      title: "Online — anywhere",
      sub: `${schedule.online.days}, ${schedule.online.time}`,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-extrabold text-[#001532]">CAD ${config.priceCad}</span>
        <span className="text-gray-500 text-sm">/ semester</span>
      </div>
      <p className="text-gray-500 text-sm mb-4">{SEMESTER_SHAPE_LABEL} — one class a week for {SEMESTER_WEEKS} weeks.</p>
      <h2 className="text-xl font-bold text-[#001532] mb-1">Choose a format</h2>
      <p className="text-gray-500 text-sm mb-5">
        {program.level} runs in-person on {schedule.inperson.days.toLowerCase()} in Oshawa, or online{" "}
        {schedule.online.days.toLowerCase()} for families anywhere.
      </p>

      <fieldset>
        <legend className="sr-only">Choose in-person (Oshawa) or online for {program.level}</legend>
        <div role="radiogroup" aria-label="Class format" className="grid grid-cols-1 gap-2.5">
          {options.map((opt) => {
            const checked = format === opt.value;
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-colors ${
                  checked ? "border-[#E5A823] bg-[#E5A823]/10" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name={`format-${program.slug}`}
                  value={opt.value}
                  checked={checked}
                  onChange={() => handleSelect(opt.value)}
                  className="accent-[#E5A823] w-4 h-4 shrink-0"
                />
                <span>
                  <span className="block font-semibold text-[#001532] text-sm">{opt.title}</span>
                  <span className="block text-gray-500 text-xs">{opt.sub}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-5 bg-[#FAF8F4] rounded-xl px-4 py-3 text-sm text-[#001532]" aria-live="polite">
        <span className="font-semibold">Selected: </span>
        {scheduleDetail}
      </div>

      <div className="mt-3">
        <EnrollButton program={level} label={`Register for ${program.level}`} onClick={handleRegisterClick} />
      </div>
      <p className="text-gray-400 text-xs mt-2 text-center">Secure checkout powered by Stripe.</p>

      <p className="text-gray-500 text-xs mt-4 leading-relaxed">
        Looking for in-person classes in another city?{" "}
        <a href="/locations" className="text-[#138A9A] font-semibold underline">
          Join the waitlist
        </a>{" "}
        — online is open to your family today.
      </p>

      {/* Sticky mobile register bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-4 py-3">
        <EnrollButton program={level} label={`Register for ${program.level}`} onClick={handleRegisterClick} />
      </div>
      {/* Spacer so the sticky bar never covers page content on mobile */}
      <div className="md:hidden h-16" aria-hidden="true" />
    </div>
  );
}
