"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const navLinks = [
  { href: "/programs", label: "Programs" },
  { href: "/schools", label: "Schools" },
  { href: "/franchise", label: "Franchise" },
  { href: "/resources", label: "Resources" },
  { href: "/locations", label: "Locations" },
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
        isScrolled ? "bg-white shadow-md" : "bg-white/95"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-extrabold text-[#0A2342]">
              CODE<span className="text-[#F5A623]">ship</span>
            </span>
            <span className="text-lg font-semibold text-[#0A2342] hidden sm:inline">
              Academy
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#1A1A2E] hover:text-[#F5A623] font-medium transition-colors duration-200 text-sm"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/program-finder"
              className="bg-[#F5A623] text-[#0A2342] font-semibold px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors duration-200 text-sm"
            >
              Find a Program
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-md text-[#0A2342]"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-0.5 bg-current mb-1.5 transition-all"></div>
            <div className="w-6 h-0.5 bg-current mb-1.5 transition-all"></div>
            <div className="w-6 h-0.5 bg-current transition-all"></div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-[#1A1A2E] hover:text-[#F5A623] font-medium py-2 border-b border-gray-50"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/program-finder"
              className="block bg-[#F5A623] text-[#0A2342] font-semibold px-4 py-3 rounded-lg text-center mt-4"
              onClick={() => setIsOpen(false)}
            >
              Find a Program
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
