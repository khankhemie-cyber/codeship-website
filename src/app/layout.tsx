import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CODEship Academy | Kids Coding, AI & STEM Programs",
    template: "%s | CODEship Academy",
  },
  description:
    "CODEship Academy offers children's coding, AI, and STEM programs through weekly classes, camps, and school workshops. Creativity before code.",
  keywords: ["kids coding", "STEM education", "children AI programs", "coding camps", "school workshops"],
  authors: [{ name: "CODEship Academy" }],
  creator: "CODEship Academy",
  metadataBase: new URL("https://www.codeshipacademy.com"),
  icons: {
    icon: "/logo-nav.png",
    apple: "/logo-nav.png",
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://www.codeshipacademy.com",
    siteName: "CODEship Academy",
    title: "CODEship Academy | Kids Coding, AI & STEM Programs",
    description:
      "Where curiosity becomes creation. CODEship Academy helps children build real digital projects through hands-on project-based learning.",
    images: [
      {
        url: "/logo-banner.png",
        width: 1200,
        height: 630,
        alt: "CODEship Academy — Dream. Code. Achieve.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CODEship Academy | Kids Coding, AI & STEM Programs",
    description:
      "Where curiosity becomes creation. CODEship Academy helps children build real digital projects.",
    images: ["/logo-banner.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-[#FAF8F4] text-[#2E3440] antialiased">
        <Navigation />
        <main className="pt-16">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
