"use client";

import { useState, type FormEvent } from "react";
import type { ProgramSlug } from "@/data/locations";
import type { LocationSlug } from "@/lib/registration";
import { leadCapture } from "@/lib/leadCapture";
import { trackLeadSubmit } from "@/lib/analytics";

interface SampleKitFormProps {
  program: ProgramSlug;
  location: LocationSlug;
  utm: Record<string, string | undefined>;
  lang?: "en" | "fr";
}

const COPY = {
  en: {
    heading: "Get a free sample kit",
    body: "See a real lesson before you register — we'll email you a free sample from the curriculum.",
    placeholder: "Your email address",
    submit: "Send me the free sample",
    submitting: "Sending…",
    success: "Check your inbox — your free sample kit is on its way.",
    label: "Email address",
  },
  fr: {
    heading: "Obtenez une trousse d'exemples gratuite",
    body: "Découvrez une vraie leçon avant de vous inscrire — nous vous enverrons un exemple gratuit du curriculum.",
    placeholder: "Votre adresse courriel",
    submit: "Envoyez-moi l'exemple gratuit",
    submitting: "Envoi en cours…",
    success: "Vérifiez votre boîte de réception — votre trousse d'exemples arrive.",
    label: "Adresse courriel",
  },
};

export default function SampleKitForm({ program, location, utm, lang = "en" }: SampleKitFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const t = COPY[lang];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("submitting");
    await leadCapture({ email, program, location, utm });
    trackLeadSubmit({ program, location, email_domain: email.split("@")[1] });
    setStatus("success");
  };

  if (status === "success") {
    return (
      <div className="bg-[#138A9A]/10 border border-[#138A9A]/30 rounded-xl p-5 text-center" aria-live="polite">
        <p className="text-[#001532] font-semibold text-sm">{t.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="font-bold text-[#001532] mb-1">{t.heading}</h3>
      <p className="text-gray-500 text-sm mb-4">{t.body}</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <label htmlFor="sample-kit-email" className="sr-only">
          {t.label}
        </label>
        <input
          id="sample-kit-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.placeholder}
          className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#E5A823]"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="bg-[#001532] text-white font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-[#2a3052] transition-colors disabled:opacity-60"
        >
          {status === "submitting" ? t.submitting : t.submit}
        </button>
      </div>
    </form>
  );
}
