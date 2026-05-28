import HubSpotForm from "@/components/HubSpotForm";

export default function FranchiseKitForm() {
  return (
    <div className="bg-white rounded-2xl p-8">
      <HubSpotForm
        formId="b63c5c03-e55e-4e57-9a03-cebebbb87b3c"
        thankYouTitle="Your franchise kit is on its way!"
        thankYouBody="Thank you for your interest in CODEship Academy. We'll send your franchise information kit to your inbox shortly. If you have questions in the meantime, you're welcome to book a Discovery Call — we'd love to connect."
        thankYouCta={{ label: "Book a Discovery Call", href: "/contact" }}
      />
      <p className="text-xs text-gray-400 text-center mt-4">
        Submitting this form does not constitute a franchise offering or commitment. Franchise offerings are made only through a Franchise Disclosure Document where required by law.
      </p>
    </div>
  );
}
