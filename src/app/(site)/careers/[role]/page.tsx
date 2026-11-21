import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ApplicationForm from "@/components/careers/ApplicationForm";
import RoleDetail from "@/components/careers/RoleDetail";
import { PageHero, Section, SectionHeader } from "@/components/ui/Page";
import { CAREER_AREAS_TEXT, ROLES } from "@/config/careers";
import { pageMetadata } from "@/lib/pageMetadata";
import { breadcrumbSchema, jobPostingSchema } from "@/lib/schema";

// Each role has its own page so its JobPosting sits on a single-job page, as
// Google for Jobs asks (it ignores JobPosting markup on job-list pages).
// /careers lists both roles.
export const dynamicParams = false;

export function generateStaticParams() {
  return ROLES.map((r) => ({ role: r.slug }));
}

function findRole(slug: string) {
  return ROLES.find((r) => r.slug === slug);
}

export function generateMetadata({ params }: { params: { role: string } }): Metadata {
  const role = findRole(params.role);
  if (!role) return {};
  return pageMetadata({
    title: `${role.title}, $${role.hourlyRate}/hr Contract | CODEship Academy`,
    description: `${role.title} at CODEship Academy: $${role.hourlyRate}/hr CAD, contract, starting immediately. ${role.tagline} Classes online and at partner sites in ${CAREER_AREAS_TEXT}.`,
    path: `/careers/${role.slug}`,
  });
}

export default function RolePage({ params }: { params: { role: string } }) {
  const role = findRole(params.role);
  if (!role) notFound();

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Careers", href: "/careers" },
    { name: role.title, href: `/careers/${role.slug}` },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema(role)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />

      <PageHero
        crumbs={crumbs}
        eyebrow="Careers"
        title={role.title}
        lead={`${role.tagline} $${role.hourlyRate} per hour (CAD), contract, starting immediately.`}
      />

      <Section>
        <RoleDetail role={role} />
      </Section>

      <Section tone="white" narrow id="apply">
        <SectionHeader center title={`Apply for ${role.title}`} />
        <ApplicationForm defaultRole={role.slug} />
      </Section>
    </>
  );
}
