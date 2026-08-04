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
    default: "CODEship Academy | Kids Coding, AI & STEM Programs",
    template: "%s | CODEship Academy",
  },
  description:
    "Live online coding classes for kids in Canada — coding, AI, and STEM for ages 4–16 through weekly classes, camps, and school workshops. Creativity before code.",
  keywords: [
    "coding classes for kids",
    "kids coding classes online",
    "coding for kids Canada",
    "STEM programs for schools",
    "AI classes for kids",
    "kids coding camps",
  ],
  authors: [{ name: "CODEship Academy" }],
  creator: "CODEship Academy",
  metadataBase: new URL("https://www.codeshipacademy.com"),
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
        {children}
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
