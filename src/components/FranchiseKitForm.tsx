import ZohoForm from "@/components/ZohoForm";

export default function FranchiseKitForm() {
  return (
    <div className="bg-white rounded-2xl p-8">
      <ZohoForm
        divId="zf_div_dlp6ZONGBrA_vcnSIiSvLxHviD1pr3VZ5noeqGzzSdw"
        formPerma="dlp6ZONGBrA_vcnSIiSvLxHviD1pr3VZ5noeqGzzSdw"
        formPath="FranchiseKit"
        initialHeight="946px"
        ariaLabel="Franchise Kit"
      />
      <p className="text-xs text-gray-400 text-center mt-4">
        Submitting this form does not constitute a franchise offering or commitment. Franchise offerings are made only through a Franchise Disclosure Document where required by law.
      </p>
    </div>
  );
}
