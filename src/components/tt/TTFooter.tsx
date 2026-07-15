import { TRINIDAD_COMPLIANCE_DISCLAIMER } from "@/data/trinidadCampaigns";

/**
 * Minimal Trinidad-LP footer — no nav links, tagline + the required
 * SEA/Ministry compliance disclaimer. Never links deeper into the site.
 */
export default function TTFooter() {
  return (
    <footer className="bg-[#001532] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center">
        <p className="text-[#E5A823] text-sm font-bold mb-2">DREAM. CODE. ACHIEVE.</p>
        <p className="text-gray-400 text-xs mb-2">© {new Date().getFullYear()} CODEship Academy. All rights reserved.</p>
        <p className="text-gray-500 text-xs max-w-xl mx-auto">{TRINIDAD_COMPLIANCE_DISCLAIMER}</p>
      </div>
    </footer>
  );
}
