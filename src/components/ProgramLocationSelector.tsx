"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Program } from "@/data/programs";
import { IN_PERSON, ONLINE, IN_PERSON_SATURDAY_SCHEDULE, type InPersonCity } from "@/data/locations";
import { buildRegistrationUrl, type LocationSlug } from "@/lib/registration";
import { trackView, trackSelectLocation, trackRegisterClick } from "@/lib/analytics";

interface ProgramLocationSelectorProps {
  program: Program;
}

function cityToSlug(city: InPersonCity): LocationSlug {
  return city.toLowerCase() as LocationSlug;
}

export default function ProgramLocationSelector({ program }: ProgramLocationSelectorProps) {
  const [location, setLocation] = useState<LocationSlug>(cityToSlug(IN_PERSON[0]));

  useEffect(() => {
    trackView({ program: program.slug });
    // Only fire once, on mount, for this program page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (value: LocationSlug) => {
    setLocation(value);
    trackSelectLocation({ program: program.slug, location: value });
  };

  const registrationUrl = buildRegistrationUrl({ program: program.slug, location });
  const saturday = IN_PERSON_SATURDAY_SCHEDULE[program.slug];
  const online = ONLINE[program.slug];

  const scheduleDetail =
    location === "online"
      ? `Online — ${online.day}s, ${online.window} (${online.length} class)`
      : `${IN_PERSON.find((c) => cityToSlug(c) === location)} — Saturdays, ${saturday.start}–${saturday.end} (${saturday.length} class)`;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-[#001532] mb-1">Choose a location & schedule</h2>
      <p className="text-gray-500 text-sm mb-5">
        {program.level} runs every Saturday at all five in-person locations, or online {online.day}s.
      </p>

      <fieldset>
        <legend className="sr-only">Choose an in-person location or online schedule for {program.level}</legend>
        <div role="radiogroup" aria-label="Location and schedule" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {IN_PERSON.map((city) => {
            const value = cityToSlug(city);
            const checked = location === value;
            return (
              <label
                key={city}
                className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-colors ${
                  checked ? "border-[#E5A823] bg-[#E5A823]/10" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name={`location-${program.slug}`}
                  value={value}
                  checked={checked}
                  onChange={() => handleSelect(value)}
                  className="accent-[#E5A823] w-4 h-4 shrink-0"
                />
                <span>
                  <span className="block font-semibold text-[#001532] text-sm">{city}</span>
                  <span className="block text-gray-500 text-xs">
                    Saturdays, {saturday.start}–{saturday.end}
                  </span>
                </span>
              </label>
            );
          })}
          <label
            className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-colors sm:col-span-2 ${
              location === "online" ? "border-[#E5A823] bg-[#E5A823]/10" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name={`location-${program.slug}`}
              value="online"
              checked={location === "online"}
              onChange={() => handleSelect("online")}
              className="accent-[#E5A823] w-4 h-4 shrink-0"
            />
            <span>
              <span className="block font-semibold text-[#001532] text-sm">Online</span>
              <span className="block text-gray-500 text-xs">
                {online.day}s, {online.window} ({online.length})
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      <div className="mt-5 bg-[#FAF8F4] rounded-xl px-4 py-3 text-sm text-[#001532]" aria-live="polite">
        <span className="font-semibold">Selected: </span>
        {scheduleDetail}
      </div>

      <Link
        href={registrationUrl}
        onClick={() => trackRegisterClick({ program: program.slug, location })}
        className="mt-5 w-full bg-[#E5A823] text-[#001532] font-bold px-6 py-3.5 rounded-xl hover:bg-[#d4941f] transition-colors inline-flex items-center justify-center text-center"
      >
        Register for {program.level}
      </Link>

      {/* Sticky mobile register bar, mirrors the same selection */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-4 py-3">
        <Link
          href={registrationUrl}
          onClick={() => trackRegisterClick({ program: program.slug, location })}
          className="block w-full bg-[#E5A823] text-[#001532] font-bold px-6 py-3 rounded-xl text-center hover:bg-[#d4941f] transition-colors"
        >
          Register for {program.level}
        </Link>
      </div>
      {/* Spacer so the sticky bar never covers page content on mobile */}
      <div className="md:hidden h-16" aria-hidden="true" />
    </div>
  );
}
