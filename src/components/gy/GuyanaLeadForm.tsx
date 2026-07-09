"use client";

import { useState, type FormEvent } from "react";
import { GUYANA_REGIONS, GUYANA_SUPPORT_NEEDED, type GuyanaPageSlug } from "@/data/guyanaCampaigns";
import { guyanaLeadCapture } from "@/lib/leadCapture";
import { trackLeadSubmit, trackSelectRegion } from "@/lib/analytics";

interface GuyanaLeadFormProps {
  page: GuyanaPageSlug;
  utm: Record<string, string | undefined>;
}

export default function GuyanaLeadForm({ page, utm }: GuyanaLeadFormProps) {
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [childAge, setChildAge] = useState("");
  const [region, setRegion] = useState("");
  const [mainSupportNeeded, setMainSupportNeeded] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleRegionChange = (value: string) => {
    setRegion(value);
    trackSelectRegion({ page, country: "guyana" as const, location: "online" as const, region: value, ...utm });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!parentName || !email || !whatsapp || !childAge || !region || !mainSupportNeeded) return;
    setStatus("submitting");
    await guyanaLeadCapture({ parentName, email, whatsapp, childAge, region, mainSupportNeeded, page, utm });
    trackLeadSubmit({ page, country: "guyana" as const, location: "online" as const, region, mainSupportNeeded, ...utm });
    setStatus("success");
  };

  if (status === "success") {
    return (
      <div className="bg-[#138A9A]/10 border border-[#138A9A]/30 rounded-xl p-5 text-center" aria-live="polite">
        <p className="text-[#001532] font-semibold text-sm">
          Thank you — we&apos;ll send the program details to your email and WhatsApp shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
      <h3 className="font-bold text-[#001532] mb-1">Get the Program Details</h3>
      <p className="text-gray-500 text-sm mb-3">
        This is not registration — we&apos;ll send you the full program details first.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="gy-parent-name" className="block text-xs font-semibold text-[#001532] mb-1">
            Parent name
          </label>
          <input
            id="gy-parent-name"
            type="text"
            required
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E5A823]"
          />
        </div>
        <div>
          <label htmlFor="gy-email" className="block text-xs font-semibold text-[#001532] mb-1">
            Email
          </label>
          <input
            id="gy-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E5A823]"
          />
        </div>
        <div>
          <label htmlFor="gy-whatsapp" className="block text-xs font-semibold text-[#001532] mb-1">
            WhatsApp number
          </label>
          <input
            id="gy-whatsapp"
            type="tel"
            required
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E5A823]"
          />
        </div>
        <div>
          <label htmlFor="gy-child-age" className="block text-xs font-semibold text-[#001532] mb-1">
            Child&apos;s age
          </label>
          <input
            id="gy-child-age"
            type="text"
            required
            value={childAge}
            onChange={(e) => setChildAge(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E5A823]"
          />
        </div>
        <div>
          <label htmlFor="gy-region" className="block text-xs font-semibold text-[#001532] mb-1">
            Community or region
          </label>
          <select
            id="gy-region"
            required
            value={region}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E5A823] bg-white"
          >
            <option value="" disabled>
              Select a community
            </option>
            {GUYANA_REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="gy-support" className="block text-xs font-semibold text-[#001532] mb-1">
            Main support needed
          </label>
          <select
            id="gy-support"
            required
            value={mainSupportNeeded}
            onChange={(e) => setMainSupportNeeded(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E5A823] bg-white"
          >
            <option value="" disabled>
              Select an area
            </option>
            {GUYANA_SUPPORT_NEEDED.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full bg-[#001532] text-white font-semibold px-5 py-3 rounded-lg text-sm hover:bg-[#2a3052] transition-colors disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Get the Program Details"}
      </button>
    </form>
  );
}
