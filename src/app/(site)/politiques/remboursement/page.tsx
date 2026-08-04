import type { Metadata } from "next";
import { BASE_URL, DEFAULT_OG_IMAGE } from "@/lib/pageMetadata";

const TITLE = "Politique de remboursement | CODEship Academy";
const DESCRIPTION = "La politique de remboursement de CODEship Academy pour les inscriptions traitées par Stripe.";
const PATH = "/politiques/remboursement";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${BASE_URL}${PATH}` },
  openGraph: {
    type: "website",
    locale: "fr_CA",
    url: `${BASE_URL}${PATH}`,
    siteName: "CODEship Academy",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function PolitiqueRemboursementPage() {
  return (
    <div lang="fr" className="bg-[#FAF8F4]">
      <section className="bg-[#001532] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4">Politique de remboursement</h1>
          <p className="text-gray-300">Dernière mise à jour : juillet 2026</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8 text-gray-700 text-sm">
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">1. Inscription et paiement</h2>
              <p>
                L&apos;inscription et le paiement des programmes de CODEship Academy sont traités de façon
                sécurisée par <strong>Stripe</strong>, notre processeur de paiement. Lors de votre inscription
                à un cours, Stripe perçoit le paiement et vous envoie votre reçu par courriel. CODEship Academy
                gère les places disponibles pour chaque cours.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">2. Demander un remboursement</h2>
              <p>
                Pour demander un remboursement ou une annulation, écrivez à{" "}
                <a href="mailto:admin@codeshipacademy.com" className="text-[#E5A823] hover:underline">
                  admin@codeshipacademy.com
                </a>{" "}
                avec les détails de votre inscription, ou répondez au reçu de paiement Stripe que vous avez
                reçu. Les remboursements approuvés sont versés au mode de paiement original par
                l&apos;entremise de Stripe.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">3. Délais de remboursement</h2>
              <p>
                Le délai de remboursement précis pour un cours donné (par exemple, le nombre de jours avant
                la première séance pour un remboursement complet ou partiel) est indiqué au moment du
                paiement et confirmé dans votre courriel d&apos;inscription. Veuillez vous
                référer à cette confirmation pour connaître les conditions exactes applicables à votre
                inscription.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">4. Absences et retrait</h2>
              <p>
                Si votre enfant doit se retirer d&apos;un programme après son début, ou manque des séances,
                communiquez avec nous à{" "}
                <a href="mailto:admin@codeshipacademy.com" className="text-[#E5A823] hover:underline">
                  admin@codeshipacademy.com
                </a>{" "}
                et nous conviendrons ensemble des prochaines étapes, conformément aux conditions confirmées
                lors de l&apos;inscription.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">
                5. Changements ou annulations de programme par CODEship
              </h2>
              <p>
                Si CODEship Academy annule un cours ou un programme (par exemple, en raison d&apos;un nombre
                insuffisant d&apos;inscriptions), les familles inscrites se verront offrir un remboursement
                complet ou la possibilité de transférer vers un autre cours ou emplacement disponible.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001532] mb-3">6. Questions</h2>
              <p>
                Pour toute question sur cette politique de remboursement ou sur une inscription existante,
                communiquez avec nous à :{" "}
                <a href="mailto:admin@codeshipacademy.com" className="text-[#E5A823] hover:underline">
                  admin@codeshipacademy.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
