import type { Metadata } from "next";
import ApplicationForm from "@/components/careers/ApplicationForm";
import LocationPanel from "@/components/careers/LocationPanel";
import HiringProcess from "@/components/careers/HiringProcess";
import RoleCard from "@/components/careers/RoleCard";
import WhyCodeship from "@/components/careers/WhyCodeship";
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
        lead={`CODEship Academy teaches coding, AI and STEM to students aged 4 to 16. We are hiring instructors for classes online and at partner sites in ${CAREER_AREAS_TEXT}.`}
      />

      <Section id="roles">
        <SectionHeader eyebrow="Open roles" title="Instructor positions" lead="Both roles are contract positions starting immediately." />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ROLES.map((role) => (
            <RoleCard key={role.slug} role={role} />
          ))}
        </div>
        <div className="mt-6">
          <LocationPanel />
        </div>
      </Section>

      <Section tone="sand">
        <SectionHeader eyebrow="Why CODEship" title="Why teach with us" />
        <WhyCodeship />
      </Section>

      <Section tone="navy">
        <SectionHeader dark eyebrow="Hiring process" title="From application to your first class" />
        <HiringProcess dark />
      </Section>

      <Section tone="white" narrow id="apply">
        <SectionHeader center title="Apply" />
        <ApplicationForm />
      </Section>
    </>
  );
}
