"use client";

import { useState } from "react";
import { getLocationOptions, type ProgramSlug } from "@/data/locations";
import type { LocationSlug } from "@/lib/registration";

interface LocationBarProps {
  program: ProgramSlug;
  value: LocationSlug;
  onChange: (value: LocationSlug) => void;
  /** True when the location came from the incoming utm_content/?loc= param. */
  defaulted: boolean;
  lang?: "en" | "fr";
}

const COPY = {
  en: {
    showing: "Showing",
    change: "Change",
    heading: "Choose your location & schedule",
  },
  fr: {
    showing: "Emplacement",
    change: "Modifier",
    heading: "Choisissez votre emplacement et votre horaire",
  },
};

function toSlug(city: string): LocationSlug {
  return city.toLowerCase() as LocationSlug;
}

export default function LocationBar({ program, value, onChange, defaulted, lang = "en" }: LocationBarProps) {
  const [expanded, setExpanded] = useState(!defaulted);
  const t = COPY[lang];
  const options = getLocationOptions(program);
  const selectedLabel = options.find((o) => (o.type === "online" ? "online" : toSlug(o.city)) === value)?.label;

  if (!expanded) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-sm">
        <span className="text-[#001532]">
          <span className="font-semibold">{t.showing}: </span>
          {selectedLabel}
        </span>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-[#E5A823] font-semibold hover:underline shrink-0"
        >
          {t.change}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <fieldset>
        <legend className="text-sm font-semibold text-[#001532] mb-3">{t.heading}</legend>
        <div role="radiogroup" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {options.map((opt) => {
            const optValue: LocationSlug = opt.type === "online" ? "online" : toSlug(opt.city);
            const checked = value === optValue;
            return (
              <label
                key={optValue}
                className={`flex items-center gap-2.5 rounded-lg border-2 px-3 py-2.5 cursor-pointer text-sm transition-colors ${
                  checked ? "border-[#E5A823] bg-[#E5A823]/10" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name={`lp-location-${program}`}
                  checked={checked}
                  onChange={() => {
                    onChange(optValue);
                    setExpanded(false);
                  }}
                  className="accent-[#E5A823] w-4 h-4 shrink-0"
                />
                <span className="text-[#001532]">{opt.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
