"use client";

import { useEffect, useState } from "react";
import type { Program } from "@/data/programs";
import { CLASS_SCHEDULE, startsSummary } from "@/config/classSchedule";
import { SEMESTER_SHAPE_LABEL } from "@/config/offering";
import type { LocationSlug } from "@/lib/registration";
import { IN_PERSON_VENUE } from "@/data/locations";
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
 *   - In-Person: open in Oshawa only (Saturdays).
 *   - Online: open to every city.
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
      ? `Online · ${modeSchedule.days}, ${modeSchedule.time} · ${startsSummary(modeSchedule)}`
      : `${IN_PERSON_VENUE.building}, Oshawa · ${modeSchedule.days}, ${modeSchedule.time.replace(" ET", "")} · ${startsSummary(modeSchedule)}`;

  const options: { value: Format; title: string; sub: string }[] = [
    {
      value: "inperson",
      title: "In person · Oshawa",
      sub: `${schedule.inperson.days}, ${schedule.inperson.time.replace(" ET", "")} · ${IN_PERSON_VENUE.building}`,
    },
    {
      value: "online",
      title: "Online · anywhere",
      sub: `${schedule.online.days}, ${schedule.online.time}`,
    },
  ];

  return (
    <div className="bg-white shadow-md border border-gray-100 p-6 sm:p-8">
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-extrabold text-[#001532]">CAD ${config.priceCad}</span>
        <span className="text-gray-600 text-base">/ semester</span>
      </div>
      <p className="text-gray-600 text-base mt-1 mb-6">{SEMESTER_SHAPE_LABEL}</p>
      <h2 className="text-xl font-bold text-[#001532] mb-3">Choose a format</h2>

      <fieldset>
        <legend className="sr-only">Choose in person or online for {program.level}</legend>
        <div role="radiogroup" aria-label="Class format" className="grid grid-cols-1 gap-3">
          {options.map((opt) => {
            const checked = format === opt.value;
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-3 border-2 px-4 py-3 cursor-pointer transition-colors ${
                  checked ? "border-[#F4D734] bg-[#F4D734]/10" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name={`format-${program.slug}`}
                  value={opt.value}
                  checked={checked}
                  onChange={() => handleSelect(opt.value)}
                  className="accent-[#F4D734] w-5 h-5 shrink-0"
                />
                <span>
                  <span className="block font-bold text-[#001532] text-base">{opt.title}</span>
                  <span className="block text-gray-600 text-sm">{opt.sub}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <p className="mt-5 bg-[#FAF8F4] px-4 py-3 text-base text-[#001532]" aria-live="polite">
        {scheduleDetail}
      </p>

      <div className="mt-4">
        <EnrollButton program={level} label={`Book ${program.level}`} onClick={handleRegisterClick} />
      </div>
      <p className="text-gray-500 text-sm mt-3 text-center">Secure checkout with Stripe.</p>

      {/* Sticky mobile register bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-4 py-3">
        <EnrollButton program={level} label={`Book ${program.level}`} onClick={handleRegisterClick} />
      </div>
      {/* Spacer so the sticky bar never covers page content on mobile */}
      <div className="md:hidden h-16" aria-hidden="true" />
    </div>
  );
}
