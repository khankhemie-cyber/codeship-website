import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/pageMetadata";
import { REFUND_POLICY_VERSION } from "@/data/catalog";

export const metadata: Metadata = pageMetadata({
  title: "Politique de minimum de classe et de remboursement | CODEship Academy",
  description:
    "La politique de minimum de classe et de remboursement de CODEship Academy — quand les cours ont lieu, ce qui se passe sinon, et comment demander un remboursement.",
  path: "/politiques/remboursement",
});

export default function PolitiqueRemboursementPage() {
  return (
    <div lang="fr" className="bg-[#FAF8F4]">
      <section className="bg-[#001532] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4">
            Politique de minimum de classe et de remboursement
          </h1>
          <p className="text-gray-300">
            Dernière mise à jour : 10 juillet 2026 (version {REFUND_POLICY_VERSION})
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8 text-gray-700 text-sm">
            <p>
              CODEship Academy n&apos;offre un cours ou une cohorte que lorsqu&apos;il atteint un taux
              d&apos;inscription minimal de <strong>50 % de la capacité de la classe</strong>.
            </p>

            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">Si un cours n&apos;atteint pas le minimum</h2>
              <p>
                Si un cours n&apos;atteint pas le minimum de 50 % au moins 3 jours ouvrables avant sa date de
                début, nous pouvons :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>le reporter,</li>
                <li>offrir un transfert vers un autre cours, emplacement ou séance en ligne,</li>
                <li>offrir un crédit de compte, ou</li>
                <li>annuler le cours.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">
                Si nous annulons, ou si vous refusez une solution de rechange
              </h2>
              <p>
                Si nous annulons un cours — ou si vous refusez une solution de rechange proposée — vous recevez un{" "}
                <strong>remboursement complet</strong> des frais payés pour ce cours, sur votre mode de paiement
                initial, dans un délai de 10 jours ouvrables (et au plus tard 15 jours, conformément à la Loi sur
                la protection du consommateur de l&apos;Ontario).
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">Annulations à l&apos;initiative de la famille</h2>
              <p>
                Remboursement complet si vous annulez au moins 7 jours avant la date de début. Après ce délai, un
                crédit de compte ou un remboursement au prorata des séances non encore données.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">Comment demander un remboursement</h2>
              <p>
                Écrivez à{" "}
                <a href="mailto:admin@codeshipacademy.com" className="text-[#E5A823] hover:underline">
                  admin@codeshipacademy.com
                </a>{" "}
                avec votre numéro de commande. Les remboursements sont versés sur le mode de paiement initial.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">Vos droits</h2>
              <p>
                Cette politique s&apos;ajoute aux droits qui vous sont accordés par les lois applicables en
                matière de protection du consommateur dans votre province (Ontario, Colombie-Britannique,
                Alberta, Québec) ou votre pays. Pour les résidents du Québec :{" "}
                <strong>la version française fait foi</strong>.
              </p>
            </div>

            <p className="text-xs text-gray-500 pt-4 border-t border-gray-100">
              Voir aussi nos{" "}
              <Link href="/terms" className="text-[#138A9A] hover:underline">
                conditions d&apos;utilisation
              </Link>{" "}
              et notre{" "}
              <Link href="/privacy-policy" className="text-[#138A9A] hover:underline">
                politique de confidentialité
              </Link>
              . / Version anglaise :{" "}
              <Link href="/policies/refund" className="text-[#138A9A] hover:underline">
                Refund Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
