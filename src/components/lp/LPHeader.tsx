import Link from "next/link";
import Image from "next/image";

/**
 * Minimal paid-LP header: logo links home, nothing else. Deliberately has no
 * nav links (Programs/Franchise/Locations/etc.) — paid landing pages are
 * single-purpose and are never linked from the main site's nav or footer.
 */
export default function LPHeader() {
  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center">
        <Link href="/" aria-label="CODEship Academy home" className="inline-block">
          <Image
            src="/logo-nav.png"
            alt="CODEship Academy"
            width={120}
            height={120}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>
      </div>
    </header>
  );
}
