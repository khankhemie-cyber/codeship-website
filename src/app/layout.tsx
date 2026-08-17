import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/Analytics";
import CookieBanner from "@/components/CookieBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CODEship Academy | Kids Coding, AI & STEM — Oshawa & Online",
    template: "%s | CODEship Academy",
  },
  description:
    "K–8 coding, AI & STEM programs in Oshawa and across Durham Region, plus live online classes across Canada. Small-group and project-based — a strong back-to-school choice. Creativity before code.",
  keywords: [
    "kids coding Oshawa",
    "coding classes Durham Region",
    "kids coding classes online Canada",
    "K-8 coding and AI",
    "kids STEM programs Oshawa",
    "back to school kids programs Durham",
    "AI classes for kids",
    "STEM programs for schools",
  ],
  authors: [{ name: "CODEship Academy" }],
  creator: "CODEship Academy",
  metadataBase: new URL("https://www.codeshipacademy.com"),
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://www.codeshipacademy.com",
    siteName: "CODEship Academy",
    title: "CODEship Academy | Kids Coding, AI & STEM — Oshawa & Online",
    description:
      "Where curiosity becomes creation. K–8 coding, AI & STEM in Oshawa and across Durham Region, plus live online classes across Canada.",
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
        {children}
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
