import Link from "next/link";

interface StickyMobileCTAProps {
  href: string;
  label: string;
  onClick?: () => void;
}

export default function StickyMobileCTA({ href, label, onClick }: StickyMobileCTAProps) {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-4 py-3">
      <Link
        href={href}
        onClick={onClick}
        className="block w-full bg-[#E5A823] text-[#001532] font-bold px-6 py-3 rounded-xl text-center hover:bg-[#d4941f] transition-colors"
      >
        {label}
      </Link>
    </div>
  );
}
