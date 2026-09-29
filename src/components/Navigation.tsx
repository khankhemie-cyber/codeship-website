"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { href: "/programs", label: "Programs" },
  { href: "/locations/oshawa", label: "Location" },
  { href: "/schools", label: "For Schools" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-nav.png"
              alt="CODEship Academy"
              width={120}
              height={120}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#001532] hover:text-[#E5A823] font-semibold transition-colors duration-200 text-base relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#E5A823] transition-all duration-200 group-hover:w-full" />
              </Link>
            ))}
            <Link
              href="/#book"
              className="bg-[#E5A823] text-[#001532] font-bold px-5 py-2.5 rounded-lg hover:bg-[#d4941f] transition-all duration-200 text-base shadow-sm hover:shadow-md"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-md text-[#001532]"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <div className={`w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? "rotate-45 translate-y-2" : "mb-1.5"}`}></div>
            <div className={`w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? "opacity-0" : "mb-1.5"}`}></div>
            <div className={`w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-2" : ""}`}></div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden bg-white border-t border-gray-100 shadow-lg transition-all duration-300 overflow-hidden ${isOpen ? "max-h-screen" : "max-h-0"}`}>
        <div className="px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-[#001532] hover:text-[#E5A823] font-semibold text-lg py-3 border-b border-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#book"
            className="block bg-[#E5A823] text-[#001532] font-bold text-lg px-4 py-3 rounded-lg text-center mt-4 hover:bg-[#d4941f] transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Book Now
          </Link>
        </div>
      </div>
    </nav>
  );
}
