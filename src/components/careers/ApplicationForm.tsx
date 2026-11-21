"use client";

import { useEffect, useRef, useState } from "react";
import { CAREER_AREAS, CAREERS_EMAIL, CAREERS_FORMSPREE_ID, ROLES, type RoleSlug } from "@/config/careers";

const CONFIRMATIONS = [
  { name: "Work authorization", text: "I am legally able to work in Canada without sponsorship." },
  { name: "Vulnerable Sector Check", text: "I am able to obtain a current Vulnerable Sector Check." },
];

/** Fired by ApplyButton so the form can preselect the role a visitor chose. */
export const ROLE_EVENT = "careers:select-role";

const FORMATS = [
  { value: "Online", label: "Online" },
  { value: "In person", label: "In person" },
  { value: "Both", label: "Both" },
];

const inputClass =
  "w-full px-4 py-3 text-base text-[#001532] bg-white border-2 border-gray-300 outline-none focus:border-[#138A9A] transition-colors";
const labelClass = "block text-sm font-bold text-[#001532] mb-2";
const hintClass = "text-sm text-gray-600 mt-1.5";

type Status = "idle" | "sending" | "sent" | "error";

export default function ApplicationForm({ defaultRole }: { defaultRole?: RoleSlug }) {
  const [role, setRole] = useState<RoleSlug | "">(defaultRole ?? "");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onSelect = (e: Event) => {
      const slug = (e as CustomEvent<RoleSlug>).detail;
      if (ROLES.some((r) => r.slug === slug)) setRole(slug);
    };
    window.addEventListener(ROLE_EVENT, onSelect);
    return () => window.removeEventListener(ROLE_EVENT, onSelect);
  }, []);

  useEffect(() => {
    if (status === "sent" || status === "error") statusRef.current?.focus();
  }, [status]);

  if (!CAREERS_FORMSPREE_ID) {
    return (
      <div className="bg-white border border-gray-200 p-6 sm:p-8">
        <p className="text-base text-gray-700 leading-relaxed">
          To apply, email your resume to{" "}
          <a href={`mailto:${CAREERS_EMAIL}`} className="font-semibold text-[#0F6F7C] hover:underline">
            {CAREERS_EMAIL}
          </a>{" "}
          and tell us which role you are applying for.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Send the multi-select as one readable line rather than repeated keys.
    const locations = data.getAll("Preferred locations").map(String);
    data.delete("Preferred locations");
    data.set("Preferred locations", locations.length ? locations.join(", ") : "None selected");

    const roleTitle = ROLES.find((r) => r.slug === data.get("Role"))?.title ?? "";
    data.set("Role", roleTitle);
    data.set("_subject", `Instructor application: ${roleTitle}, ${data.get("Name")}`);

    setStatus("sending");
    setError("");
    try {
      const res = await fetch(`https://formspree.io/f/${CAREERS_FORMSPREE_ID}`, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message = body?.errors?.map((x: { message: string }) => x.message).join(" ");
        throw new Error(message || "The application could not be sent.");
      }
      form.reset();
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "The application could not be sent.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="bg-white border-l-4 border-[#138A9A] p-6 sm:p-8 outline-none">
        <h3 className="font-display text-2xl font-extrabold text-[#001532]">Application received</h3>
        <p className="text-base text-gray-700 mt-3 leading-relaxed">
          Thank you for applying to CODEship Academy. If you have not sent a resume link, email your resume to{" "}
          <a href={`mailto:${CAREERS_EMAIL}`} className="font-semibold text-[#0F6F7C] hover:underline">
            {CAREERS_EMAIL}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 sm:p-8 space-y-6">
      {/* Formspree honeypot: hidden from people, filled in by bots. */}
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="sm:col-span-2">
          <label htmlFor="app-name" className={labelClass}>Full name</label>
          <input id="app-name" name="Name" type="text" autoComplete="name" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="app-email" className={labelClass}>Email</label>
          <input id="app-email" name="email" type="email" autoComplete="email" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="app-phone" className={labelClass}>Phone</label>
          <input id="app-phone" name="Phone" type="tel" autoComplete="tel" required className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="app-role" className={labelClass}>Role</label>
        <select
          id="app-role"
          name="Role"
          required
          value={role}
          onChange={(e) => setRole(e.target.value as RoleSlug)}
          className={inputClass}
        >
          <option value="" disabled>Select a role</option>
          {ROLES.map((r) => (
            <option key={r.slug} value={r.slug}>{r.title}</option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className={labelClass}>Online or in person</legend>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {FORMATS.map((f) => (
            <label key={f.value} className="flex items-center gap-2.5 text-base text-gray-800 cursor-pointer">
              <input type="radio" name="Format" value={f.value} required className="h-5 w-5 accent-[#0F6F7C]" />
              {f.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={labelClass}>Preferred locations</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CAREER_AREAS.map((area) => (
            <label key={area} className="flex items-center gap-2.5 text-base text-gray-800 cursor-pointer">
              <input type="checkbox" name="Preferred locations" value={area} className="h-5 w-5 accent-[#0F6F7C]" />
              {area}
            </label>
          ))}
        </div>
        <p className={hintClass}>Select all that apply. Leave blank if you are applying for online classes only.</p>
      </fieldset>

      <div>
        <label htmlFor="app-availability" className={labelClass}>Availability</label>
        <textarea
          id="app-availability"
          name="Availability"
          rows={3}
          required
          placeholder="Days and times you are available"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="app-resume" className={labelClass}>Resume link</label>
        <input
          id="app-resume"
          name="Resume link"
          type="url"
          inputMode="url"
          placeholder="https://"
          className={inputClass}
        />
        <p className={hintClass}>
          A link to your resume (for example Google Drive, Dropbox or LinkedIn). You can also email it to{" "}
          <a href={`mailto:${CAREERS_EMAIL}`} className="font-semibold text-[#0F6F7C] hover:underline">
            {CAREERS_EMAIL}
          </a>
          .
        </p>
      </div>

      <div>
        <label htmlFor="app-message" className={labelClass}>Message</label>
        <textarea
          id="app-message"
          name="Message"
          rows={4}
          placeholder="A short note about your background and why you are applying"
          className={inputClass}
        />
      </div>

      <fieldset className="space-y-3">
        <legend className={labelClass}>Confirm</legend>
        {CONFIRMATIONS.map((c) => (
          <label key={c.name} className="flex items-start gap-3 text-base text-gray-800 cursor-pointer">
            <input type="checkbox" name={c.name} value={c.text} required className="h-5 w-5 mt-0.5 shrink-0 accent-[#0F6F7C]" />
            <span>{c.text}</span>
          </label>
        ))}
      </fieldset>

      {status === "error" && (
        <div ref={statusRef} tabIndex={-1} role="alert" className="border-l-4 border-red-600 bg-red-50 p-4 text-base text-red-800 outline-none">
          {error} Please try again, or email your application to{" "}
          <a href={`mailto:${CAREERS_EMAIL}`} className="font-semibold underline">{CAREERS_EMAIL}</a>.
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-lg font-bold bg-[#F4D734] text-[#001532] hover:bg-[#E6C51E] transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#001532]"
      >
        {status === "sending" ? "Sending…" : "Submit application"}
      </button>
    </form>
  );
}
