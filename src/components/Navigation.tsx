"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Primary destinations, in the order a parent typically explores the site.
const navLinks = [
  { href: "/programs", label: "Programs" },
  { href: "/locations", label: "Locations" },
  { href: "/ship-it", label: "Ship It! Arcade" },
  { href: "/schools", label: "For Schools" },
  { href: "/about", label: "About" },
];

// Secondary link, grouped with the CTA on the right so it doesn't compete
// with the main destinations.
const contactLink = { href: "/contact", label: "Contact" };

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the mobile menu on navigation and on Escape.
  useEffect(() => setIsOpen(false), [pathname]);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const desktopLinkClass = (active: boolean) =>
    `relative whitespace-nowrap px-2.5 xl:px-3.5 py-2 text-[15px] xl:text-base font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6F7C] ${
      active
        ? "text-[#0F6F7C]"
        : "text-[#001532] hover:text-[#0F6F7C] hover:bg-[#001532]/[0.04]"
    }`;

  return (
    <nav
      aria-label="Main"
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-[background-color,box-shadow,border-color] duration-300 ${
        isScrolled
          ? "bg-white border-gray-200 shadow-sm"
          : "bg-white/95 backdrop-blur-sm border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[76px] lg:h-24">
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center"
            aria-label="CODEship Academy home"
          >
            <Image
              src="/logo-header.png"
              alt="CODEship Academy: Dream. Code. Achieve."
              width={742}
              height={302}
              className="h-14 lg:h-16 xl:h-20 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center">
            <ul className="flex items-center gap-0.5 xl:gap-1">
              {navLinks.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={desktopLinkClass(active)}
                    >
                      {link.label}
                      {active && (
                        <span
                          aria-hidden="true"
                          className="absolute left-2.5 right-2.5 xl:left-3.5 xl:right-3.5 -bottom-[1px] h-0.5 bg-[#0F6F7C]"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Utility group: Contact + primary CTA */}
            <div className="ml-3 xl:ml-5 pl-3 xl:pl-5 border-l border-gray-200 flex items-center gap-1 xl:gap-2">
              <Link
                href={contactLink.href}
                aria-current={isActive(pathname, contactLink.href) ? "page" : undefined}
                className={desktopLinkClass(isActive(pathname, contactLink.href))}
              >
                {contactLink.label}
              </Link>
              <Link
                href="/#book"
                className="whitespace-nowrap bg-[#F4D734] text-[#001532] font-bold px-4 xl:px-5 py-2.5 text-[15px] xl:text-base hover:bg-[#E6C51E] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#001532]"
              >
                Enroll Now
              </Link>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 text-[#001532]"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <span className="relative block w-6 h-[18px]" aria-hidden="true">
              <span className={`absolute left-0 top-0 w-6 h-0.5 bg-current transition-transform duration-300 ${isOpen ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`absolute left-0 top-2 w-6 h-0.5 bg-current transition-opacity duration-300 ${isOpen ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 top-4 w-6 h-0.5 bg-current transition-transform duration-300 ${isOpen ? "-translate-y-2 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`lg:hidden bg-white border-t border-gray-100 shadow-lg transition-all duration-300 overflow-hidden ${isOpen ? "max-h-screen" : "max-h-0 invisible"}`}
      >
        <div className="px-4 py-4">
          <ul>
            {[...navLinks, contactLink].map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`block font-semibold text-lg py-3 pl-3 border-b border-gray-100 border-l-2 transition-colors ${
                      active
                        ? "text-[#0F6F7C] border-l-[#0F6F7C]"
                        : "text-[#001532] border-l-transparent hover:text-[#0F6F7C]"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/#book"
            className="block bg-[#F4D734] text-[#001532] font-bold text-lg px-4 py-3 text-center mt-5 hover:bg-[#E6C51E] transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Enroll Now
          </Link>
        </div>
      </div>
    </nav>
  );
}
