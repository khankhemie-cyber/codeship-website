"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

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
        isScrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="CODEship Academy"
              width={44}
              height={44}
              className="rounded-full"
            />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-base font-extrabold text-[#3D4466] tracking-tight">
                CODE<span className="text-[#F5C518]">ship</span>
              </span>
              <span className="text-xs font-semibold text-[#3D4466] -mt-0.5">Academy</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#1A1A2E] hover:text-[#F5C518] font-medium transition-colors duration-200 text-sm relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#F5C518] transition-all duration-200 group-hover:w-full" />
              </Link>
            ))}
            <Link
              href="/program-finder"
              className="bg-[#F5C518] text-[#3D4466] font-bold px-4 py-2 rounded-lg hover:bg-yellow-400 transition-all duration-200 text-sm shadow-sm hover:shadow-md"
            >
              Find a Program
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-md text-[#3D4466]"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
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
              className="block text-[#1A1A2E] hover:text-[#F5C518] font-medium py-2 border-b border-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/program-finder"
            className="block bg-[#F5C518] text-[#3D4466] font-bold px-4 py-3 rounded-lg text-center mt-4 hover:bg-yellow-400 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Find a Program
          </Link>
        </div>
      </div>
    </nav>
  );
}
