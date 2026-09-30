import Link from "next/link";
import Image from "next/image";
import { IN_PERSON_VENUE } from "@/data/locations";

const COLUMNS = [
  {
    title: "Classes",
    links: [
      { href: "/programs/explorers", label: "Explorers · K–Grade 1" },
      { href: "/programs/builders", label: "Builders · Grades 2–3" },
      { href: "/programs/developers", label: "Developers · Grades 4–5" },
      { href: "/programs/engineers", label: "Engineers · Grades 6–8" },
      { href: "/register", label: "Online classes" },
    ],
  },
  {
    title: "More",
    links: [
      { href: "/programs/camps", label: "Camps" },
      { href: "/programs/birthday-parties", label: "Birthday parties" },
      { href: "/schools", label: "For schools" },
      { href: "/resources", label: "Parent resources" },
      { href: "/franchise", label: "Franchise" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/locations", label: "Locations" },
      { href: "/contact", label: "Contact" },
      { href: "/policies/refund", label: "Refund policy" },
      { href: "/privacy-policy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#001532] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand + visit */}
          <div>
            <Link href="/" className="inline-block mb-5">
              <Image
                src="/logo-footer.png"
                alt="CODEship Academy"
                width={140}
                height={140}
                className="h-20 w-auto object-contain"
              />
            </Link>
            <p className="text-[#F4D734] font-bold tracking-widest text-sm mb-4">DREAM. CODE. ACHIEVE.</p>
            <address className="not-italic text-base text-gray-300 leading-relaxed">
              {IN_PERSON_VENUE.building}
              <br />
              {IN_PERSON_VENUE.street}
              <br />
              {IN_PERSON_VENUE.city}, Ontario
            </address>
            <a
              href="mailto:admin@codeshipacademy.com"
              className="block mt-3 text-base text-gray-300 hover:text-[#F4D734] transition-colors"
            >
              admin@codeshipacademy.com
            </a>
            <a
              href="https://www.instagram.com/codeshipacademy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-base text-gray-300 hover:text-[#F4D734] transition-colors"
            >
              Instagram @codeshipacademy
            </a>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-bold text-white text-lg mb-4">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-base text-gray-300 hover:text-[#F4D734] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/15 mt-12 pt-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} CODEship Academy · Oshawa, Ontario ·{" "}
            <Link href="/politiques/remboursement" className="hover:text-[#F4D734]">
              Politique de remboursement
            </Link>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Franchise information is not an offering. Offerings are made only by disclosure document.
          </p>
        </div>
      </div>
    </footer>
  );
}
