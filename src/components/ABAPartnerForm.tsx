import HubSpotForm from "@/components/HubSpotForm";

/**
 * Partnership inquiry form for ABA clinics. Uses the same HubSpot partnership
 * form as /schools; leads are told apart by the page URL HubSpot records with
 * each submission (/partners/aba-clinics).
 */
export default function ABAPartnerForm() {
  return (
    <HubSpotForm
      formId="4f287331-c048-4599-be66-30874603cb12"
      thankYouTitle="Partnership request received!"
      thankYouBody="Thanks for reaching out. We will contact your clinic within 2 business days to book a planning call."
      thankYouCta={{ label: "Read our ABA and coding research", href: "/resources/aba-and-coding-robotics-research-2026" }}
    />
  );
}
