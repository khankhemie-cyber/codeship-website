import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#071B3B] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center space-x-3 mb-4">
              <Image
                src="/logo.png"
                alt="CODEship Academy"
                width={50}
                height={50}
                className="rounded-full"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-lg font-extrabold text-white tracking-tight">
                  CODE<span className="text-[#E5A823]">ship</span>
                </span>
                <span className="text-xs font-semibold text-gray-300 -mt-0.5">Academy</span>
              </div>
            </Link>
            <p className="text-[#E5A823] text-sm font-bold mb-1">DREAM. CODE. ACHIEVE.</p>
            <p className="text-gray-300 text-xs mb-1">Future Skills Start Here.</p>
            <p className="text-gray-400 text-xs mb-2">Headquartered in Oshawa, Ontario, Canada.</p>
            <a href="mailto:admin@codeshipacademy.com" className="text-gray-300 hover:text-[#E5A823] text-xs transition-colors">
              admin@codeshipacademy.com
            </a>
            {/* Social — Instagram only */}
            <div className="flex space-x-4 mt-4">
              <a
                href="https://www.instagram.com/codeshipacademy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow CODEship Academy on Instagram"
                className="text-gray-400 hover:text-[#E5A823] transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Programs */}
          <div>
            <h3 className="font-semibold text-white mb-4">Programs</h3>
            <ul className="space-y-2">
              <li><Link href="/programs/weekly-classes" className="text-gray-400 hover:text-[#E5A823] text-sm transition-colors">Weekly Classes</Link></li>
              <li><Link href="/programs/camps" className="text-gray-400 hover:text-[#E5A823] text-sm transition-colors">Camps</Link></li>
              <li><Link href="/programs/school-workshops" className="text-gray-400 hover:text-[#E5A823] text-sm transition-colors">School Workshops</Link></li>
              <li><Link href="/programs/birthday-parties" className="text-gray-400 hover:text-[#E5A823] text-sm transition-colors">Birthday Parties</Link></li>
              <li><Link href="/programs/ai-robotics" className="text-gray-400 hover:text-[#E5A823] text-sm transition-colors">AI &amp; Robotics</Link></li>
              <li><Link href="/program-finder" className="text-gray-400 hover:text-[#E5A823] text-sm transition-colors">Program Finder</Link></li>
            </ul>
          </div>

          {/* Franchise */}
          <div>
            <h3 className="font-semibold text-white mb-4">Franchise</h3>
            <ul className="space-y-2">
              <li><Link href="/franchise" className="text-gray-400 hover:text-[#E5A823] text-sm transition-colors">Franchise Overview</Link></li>
              <li><Link href="/franchise/mobile-model" className="text-gray-400 hover:text-[#E5A823] text-sm transition-colors">Mobile Model</Link></li>
              <li><Link href="/franchise/studio-model" className="text-gray-400 hover:text-[#E5A823] text-sm transition-colors">Studio Model</Link></li>
              <li><Link href="/franchise/regional-model" className="text-gray-400 hover:text-[#E5A823] text-sm transition-colors">Regional Model</Link></li>
              <li><Link href="/franchise-selector" className="text-gray-400 hover:text-[#E5A823] text-sm transition-colors">Franchise Selector</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-[#E5A823] text-sm transition-colors">About Us</Link></li>
              <li><Link href="/schools" className="text-gray-400 hover:text-[#E5A823] text-sm transition-colors">Schools</Link></li>
              <li><Link href="/locations" className="text-gray-400 hover:text-[#E5A823] text-sm transition-colors">Locations</Link></li>
              <li><Link href="/resources" className="text-gray-400 hover:text-[#E5A823] text-sm transition-colors">Resources</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-[#E5A823] text-sm transition-colors">Contact</Link></li>
              <li><Link href="/privacy-policy" className="text-gray-400 hover:text-[#E5A823] text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-[#E5A823] text-sm transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-10 pt-8">
          <p className="text-gray-400 text-xs mb-3 text-center">
            &copy; {new Date().getFullYear()} CODEship Academy. All rights reserved. Headquartered in Oshawa, Ontario, Canada.
          </p>
          <p className="text-gray-500 text-xs text-center max-w-3xl mx-auto">
            This website is for informational purposes only and does not constitute a franchise offering.
            Franchise offerings are made only through a Franchise Disclosure Document where required by law.
            No earnings claims are made or implied. Individual results will vary.
          </p>
        </div>
      </div>
    </footer>
  );
}
