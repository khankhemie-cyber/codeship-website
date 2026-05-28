import HubSpotForm from "@/components/HubSpotForm";

export default function SchoolContactForm() {
  return (
    <HubSpotForm
      formId="4f287331-c048-4599-be66-30874603cb12"
      thankYouTitle="Partnership request received!"
      thankYouBody="Thank you for your interest in bringing CODEship Academy to your school. We'll review your request and follow up within 2 business days to discuss the right program fit for your students and community."
      thankYouCta={{ label: "Learn More About School Programs", href: "/schools" }}
    />
  );
}
