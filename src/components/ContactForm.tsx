import HubSpotForm from "@/components/HubSpotForm";

export default function ContactForm() {
  return (
    <HubSpotForm
      formId="68ae6f1b-3769-48c3-8d83-20e9d1f38666"
      thankYouTitle="Message received — thank you!"
      thankYouBody="We will reply within 1–2 business days."
      thankYouCta={{ label: "Explore Our Programs", href: "/programs" }}
    />
  );
}
