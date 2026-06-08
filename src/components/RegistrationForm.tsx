import HubSpotForm from "@/components/HubSpotForm";

export default function RegistrationForm() {
  return (
    <HubSpotForm
      formId="09ccd84f-0c0b-477b-ba0a-0e3146c4c779"
      thankYouTitle="Thank you for registering!"
      thankYouBody="Your registration request has been received. Please note that registration does not guarantee placement — a member of our admissions team will be in touch shortly to confirm your spot and share next steps."
      thankYouCta={{ label: "Explore Programs", href: "/programs" }}
    />
  );
}
