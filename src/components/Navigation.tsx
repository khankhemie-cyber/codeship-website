"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useTrialPhase } from "@/components/trial/useTrialPhase";
import SplitButton from "@/components/ui/SplitButton";

// The logo PNG has an opaque white background, so the bar stays solid white.
// Primary destinations, in the order a parent typically explores the site.
const navLinks = [
  { href: "/programs", label: "Programs" },
  { href: "/ship-it", label: "Ship It! Arcade" },
  { href: "/schools", label: "For Schools" },
  { href: "/about", label: "About" },
];

// Secondary link, grouped with the CTA on the right so it doesn't compete
// with the main destinations.
const contactLink = { href: "/contact", label: "Contact" };

const EASE = [0.22, 1, 0.36, 1] as const;

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Navigation() {
  const pathname = usePathname();
  const trialOpen = useTrialPhase() === "open";
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  // While the November trial runs, the header CTA invites a free class;
  // afterwards it goes back to semester enrolment.
  const cta = trialOpen
    ? { href: "/#free-trial", label: "Book a free class" }
    : { href: "/#book", label: "Enroll Now" };

  // Solid once the page moves; slides away while scrolling down and comes
  // back as soon as the visitor scrolls up.
  useEffect(() => {
    let lastY = window.scrollY;
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 24);
      if (Math.abs(y - lastY) > 6) {
        setIsHidden(y > 240 && y > lastY);
        lastY = y;
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the mobile menu on navigation and on Escape; lock page scroll while open.
  useEffect(() => setIsOpen(false), [pathname]);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  // On the home page the bar starts see-through over the photo hero.
  const overHero = pathname === "/" && !isScrolled && !isOpen;

  const linkClass = (active: boolean) =>
    `relative z-10 block whitespace-nowrap pl-5 pr-2.5 xl:pr-3.5 py-2 text-[15px] font-semibold tracking-[-0.01em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6F7C] ${
      overHero
        ? active
          ? "text-white"
          : "text-white/85 hover:text-white"
        : active
          ? "text-[#0F6F7C]"
          : "text-[#001532]/80 hover:text-[#001532]"
    }`;

  const renderDesktopLink = (link: { href: string; label: string }) => {
    const active = isActive(pathname, link.href);
    return (
      <li key={link.href} className="relative" onMouseEnter={() => setHovered(link.href)}>
        {hovered === link.href && (
          <motion.span
            layoutId="nav-hover"
            aria-hidden="true"
            className={`absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full ${overHero ? "bg-white" : "bg-[#6E43A8]"}`}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <Link href={link.href} aria-current={active ? "page" : undefined} className={linkClass(active)}>
          {link.label}
        </Link>
        {active && (
          <motion.span
            layoutId="nav-active"
            aria-hidden="true"
            className={`absolute left-5 right-2.5 xl:right-3.5 -bottom-px h-0.5 ${overHero ? "bg-white" : "bg-[#0F6F7C]"}`}
          />
        )}
      </li>
    );
  };

  return (
    <MotionConfig reducedMotion="user">
      <nav
        aria-label="Main"
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-[background-color,box-shadow,border-color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isHidden && !isOpen ? "-translate-y-full" : "translate-y-0"
        } ${
          overHero
            ? "bg-transparent border-transparent"
            : isScrolled || isOpen
              ? "bg-white border-[#001532]/[0.08] shadow-[0_8px_30px_-12px_rgba(0,21,50,0.18)]"
              : "bg-white border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isScrolled ? "h-16 lg:h-[72px]" : "h-[76px] lg:h-24"
            }`}
          >
            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center" aria-label="CODEship Academy home">
              <Image
                src={overHero ? "/logo-header-white.webp" : "/logo-header.webp"}
                alt="CODEship Academy: Dream. Code. Achieve."
                width={742}
                height={302}
                className={`w-auto object-contain transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isScrolled ? "h-11 lg:h-12 xl:h-14" : "h-14 lg:h-16 xl:h-20"
                }`}
                priority
              />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center">
              <ul className="flex items-center gap-0.5 xl:gap-1" onMouseLeave={() => setHovered(null)}>
                {navLinks.map(renderDesktopLink)}
              </ul>

              {/* Utility group: Contact + primary CTA */}
              <div className={`ml-3 xl:ml-5 pl-3 xl:pl-5 border-l flex items-center gap-1 xl:gap-2 ${overHero ? "border-white/20" : "border-[#001532]/10"}`}>
                <ul onMouseLeave={() => setHovered(null)}>{renderDesktopLink(contactLink)}</ul>
                <SplitButton href={cta.href} tone={overHero ? "light" : "dark"} size="sm">
                  {cta.label}
                </SplitButton>
              </div>
            </div>

            {/* Mobile hamburger */}
            <button
              className={`lg:hidden -mr-2 p-2 ${overHero ? "text-white" : "text-[#001532]"}`}
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
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-menu"
              key="mobile-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: EASE }}
              className={`lg:hidden overflow-y-auto bg-white border-t border-[#001532]/[0.08] ${
                isScrolled ? "h-[calc(100dvh-4rem)]" : "h-[calc(100dvh-76px)]"
              }`}
            >
              <div className="px-4 sm:px-6 pt-4 pb-8 flex min-h-full flex-col">
                <motion.ul
                  initial="hidden"
                  animate="shown"
                  variants={{ shown: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }}
                >
                  {[...navLinks, contactLink].map((link) => {
                    const active = isActive(pathname, link.href);
                    return (
                      <motion.li
                        key={link.href}
                        variants={{ hidden: { opacity: 0, x: -8 }, shown: { opacity: 1, x: 0 } }}
                        transition={{ duration: 0.3, ease: EASE }}
                      >
                        <Link
                          href={link.href}
                          aria-current={active ? "page" : undefined}
                          className={`flex items-center justify-between font-display text-2xl font-bold py-4 border-b border-[#001532]/[0.08] transition-colors ${
                            active ? "text-[#0F6F7C]" : "text-[#001532] hover:text-[#0F6F7C]"
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="flex items-center gap-3">
                            {active && <span aria-hidden="true" className="h-2 w-2 bg-[#0F6F7C]" />}
                            {link.label}
                          </span>
                          <Arrow className="h-5 w-5 text-[#001532]/30" />
                        </Link>
                      </motion.li>
                    );
                  })}
                </motion.ul>
                <div className="mt-auto pt-8">
                  {trialOpen && (
                    <p className="mb-3 text-center text-sm font-semibold text-[#0F6F7C]">
                      November only · One free class, online or in person
                    </p>
                  )}
                  <Link
                    href={cta.href}
                    className="flex items-center justify-center gap-2 rounded-full bg-[#001532] text-white font-bold text-lg px-4 py-4 hover:bg-[#6E43A8] transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {cta.label}
                    <Arrow className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </MotionConfig>
  );
}
