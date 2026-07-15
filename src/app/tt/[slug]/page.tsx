import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { TRINIDAD_CAMPAIGNS, getTrinidadCampaign } from "@/data/trinidadCampaigns";
import TTView from "@/components/tt/TTView";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return TRINIDAD_CAMPAIGNS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const campaign = getTrinidadCampaign(params.slug);
  if (!campaign) return {};
  // Indexable for Trinidad-market organic search, like /gy (unlike /lp, which
  // is pure paid traffic). Canonical is always the clean route — the paid-only
  // ?lead_submitted=1 and ?v= variants must never become canonical.
  const url = `https://www.codeshipacademy.com/tt/${campaign.slug}`;
  return {
    // Absolute: the approved meta titles already carry the brand — the root
    // layout's "%s | CODEship Academy" template would double it.
    title: { absolute: campaign.metaTitle },
    description: campaign.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: campaign.metaTitle,
      description: campaign.metaDescription,
      url,
      siteName: "CODEship Academy",
      locale: "en_TT",
      images: [{ url: "/logo-banner.png", width: 1200, height: 630, alt: campaign.headline }],
    },
    twitter: {
      card: "summary_large_image",
      title: campaign.metaTitle,
      description: campaign.metaDescription,
      images: ["/logo-banner.png"],
    },
  };
}

export default function TrinidadLandingPage({ params }: Props) {
  const campaign = getTrinidadCampaign(params.slug);
  if (!campaign) notFound();

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#001532]" aria-hidden="true" />}>
      <TTView campaign={campaign} />
    </Suspense>
  );
}
