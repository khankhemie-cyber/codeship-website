import type { Metadata } from "next";
import ApplicationForm from "@/components/careers/ApplicationForm";
import LocationPanel from "@/components/careers/LocationPanel";
import RoleCard from "@/components/careers/RoleCard";
import { PageHero, Section, SectionHeader } from "@/components/ui/Page";
import { CAREER_AREAS_TEXT, ROLES } from "@/config/careers";
import { pageMetadata } from "@/lib/pageMetadata";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = pageMetadata({
  title: "Careers: Coding and Robotics Instructors | CODEship Academy",
  description:
    "CODEship Academy is hiring a Senior Instructor ($35/hr) and an Assistant Instructor ($20/hr). Contract roles teaching coding, programming and robotics online and in Durham Region, Markham, Stouffville, Scarborough and Vaughan.",
  path: "/careers",
});

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Careers", href: "/careers" },
];

export default function CareersPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />

      <PageHero
        crumbs={crumbs}
        eyebrow="Careers"
        title="Teach coding and robotics with CODEship Academy"
        lead={`We are hiring instructors for classes online and at partner sites in ${CAREER_AREAS_TEXT}. Both roles are contract positions starting immediately.`}
      />

      <Section id="roles">
        <SectionHeader eyebrow="Open roles" title="Instructor positions" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ROLES.map((role) => (
            <RoleCard key={role.slug} role={role} detailsHref={`/careers/${role.slug}`} />
          ))}
        </div>
        <div className="mt-6">
          <LocationPanel title="Both roles: locations and travel" />
        </div>
      </Section>

      <Section tone="white" narrow id="apply">
        <SectionHeader center title="Apply" />
        <ApplicationForm />
      </Section>
    </>
  );
}
