import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TrialBookedTemplate from "@/components/TrialBookedTemplate";
import { PROGRAM_LINKS, PROGRAM_ORDER, isProgramLevel } from "@/lib/payment-links";
import { pageMetadata } from "@/lib/pageMetadata";

interface Props {
  params: { program: string };
}

export function generateStaticParams() {
  return PROGRAM_ORDER.map((program) => ({ program }));
}

export function generateMetadata({ params }: Props): Metadata {
  if (!isProgramLevel(params.program)) return {};
  const c = PROGRAM_LINKS[params.program];
  return pageMetadata({
    title: `Free trial booked: ${c.label} | CODEship Academy`,
    description: `Your free ${c.label} trial class at CODEship Academy is booked.`,
    path: `/trial-booked/${params.program}`,
    // Post-checkout confirmation pages should never be indexed or in the sitemap.
    noindex: true,
  });
}

export default function TrialBookedPage({ params }: Props) {
  if (!isProgramLevel(params.program)) notFound();
  return <TrialBookedTemplate program={params.program} />;
}
