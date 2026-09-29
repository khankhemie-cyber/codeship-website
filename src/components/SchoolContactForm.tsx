import HubSpotForm from "@/components/HubSpotForm";

export default function SchoolContactForm() {
  return (
    <HubSpotForm
      formId="4f287331-c048-4599-be66-30874603cb12"
      thankYouTitle="Partnership request received!"
      thankYouBody="We will follow up within 2 business days."
      thankYouCta={{ label: "Learn More About School Programs", href: "/schools" }}
    />
  );
}
