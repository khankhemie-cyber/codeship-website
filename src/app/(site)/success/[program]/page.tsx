import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SuccessPageTemplate from "@/components/SuccessPageTemplate";
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
    title: `You're registered — ${c.label} | CODEship Academy`,
    description: `Registration confirmed for the ${c.label} program at CODEship Academy.`,
    path: `/success/${params.program}`,
    // Post-payment confirmation pages should never be indexed or in the sitemap.
    noindex: true,
  });
}

export default function SuccessPage({ params }: Props) {
  if (!isProgramLevel(params.program)) notFound();
  return <SuccessPageTemplate program={params.program} />;
}
