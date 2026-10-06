import type { Metadata } from "next";
import CertificateStudio from "@/components/certificates/CertificateStudio";

export const metadata: Metadata = {
  title: "Certificates (staff)",
};

export default function CertificatesPage() {
  return <CertificateStudio />;
}
