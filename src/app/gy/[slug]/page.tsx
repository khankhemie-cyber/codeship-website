import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { GUYANA_CAMPAIGNS, getGuyanaCampaign } from "@/data/guyanaCampaigns";
import GYView from "@/components/gy/GYView";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return GUYANA_CAMPAIGNS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const campaign = getGuyanaCampaign(params.slug);
  if (!campaign) return {};
  return {
    title: campaign.metaTitle,
    description: campaign.metaDescription,
    // Unlike /lp (pure paid traffic), these Guyana pages are meant to be
    // found via organic search for Guyana-market keywords — indexable.
    alternates: { canonical: `https://www.codeshipacademy.com/gy/${campaign.slug}` },
    openGraph: {
      title: campaign.metaTitle,
      description: campaign.metaDescription,
      locale: "en_GY",
      images: [{ url: "/logo-banner.png", width: 1200, height: 630, alt: campaign.headline }],
    },
  };
}

export default function GuyanaLandingPage({ params }: Props) {
  const campaign = getGuyanaCampaign(params.slug);
  if (!campaign) notFound();

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#001532]" aria-hidden="true" />}>
      <GYView campaign={campaign} />
    </Suspense>
  );
}
