import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CAMPAIGNS, getCampaign } from "@/data/campaigns";
import LPView from "@/components/lp/LPView";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return CAMPAIGNS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const campaign = getCampaign(params.slug);
  if (!campaign) return {};
  return {
    title: campaign.adHeadline,
    description: campaign.subhead,
    // Paid-ad landing pages are single-purpose and never meant for organic
    // discovery — kept out of the sitemap and marked noindex here.
    robots: { index: false, follow: false },
    alternates: { canonical: `https://www.codeshipacademy.com/lp/${campaign.slug}` },
    openGraph: {
      title: campaign.adHeadline,
      description: campaign.subhead,
      locale: campaign.lang === "fr" ? "fr_CA" : "en_CA",
      images: [{ url: campaign.ogImage, width: 1200, height: 630, alt: campaign.adHeadline }],
    },
  };
}

export default function LandingPage({ params }: Props) {
  const campaign = getCampaign(params.slug);
  if (!campaign) notFound();

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#001532]" aria-hidden="true" />}>
      <LPView campaign={campaign} />
    </Suspense>
  );
}
