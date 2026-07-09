interface LPFooterProps {
  lang?: "en" | "fr";
}

const COPY = {
  en: {
    tagline: "Dream. Code. Achieve.",
    rights: (year: number) => `© ${year} CODEship Academy. All rights reserved.`,
    disclaimer:
      "Provincial curriculum alignment claims support and align with — not endorsed or approved by — any ministry of education.",
  },
  fr: {
    tagline: "Rêver. Coder. Réussir.",
    rights: (year: number) => `© ${year} CODEship Academy. Tous droits réservés.`,
    disclaimer:
      "Les mentions d'alignement au curriculum provincial appuient et s'alignent avec — sans être endossées ou approuvées par — un ministère de l'Éducation.",
  },
};

/**
 * Minimal paid-LP footer: no nav links, just the tagline and required
 * compliance disclaimer. Intentionally does not link deeper into the site.
 */
export default function LPFooter({ lang = "en" }: LPFooterProps) {
  const t = COPY[lang];
  return (
    <footer className="bg-[#001532] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center">
        <p className="text-[#E5A823] text-sm font-bold mb-2">{t.tagline.toUpperCase()}</p>
        <p className="text-gray-400 text-xs mb-2">{t.rights(new Date().getFullYear())}</p>
        <p className="text-gray-500 text-xs max-w-xl mx-auto">{t.disclaimer}</p>
      </div>
    </footer>
  );
}
