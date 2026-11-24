import Link from "next/link";

/**
 * Two-part call to action: a pill with the label and a round arrow button
 * beside it. On hover the arrow circle slides into the pill and the arrow
 * swaps, so the pair reads as one moving object.
 */
const TONES = {
  /** On dark backgrounds. */
  light: { pill: "bg-white text-[#001532]", circle: "bg-[#F4D734] text-[#001532]" },
  /** On light backgrounds. */
  dark: { pill: "bg-[#001532] text-white", circle: "bg-[#138A9A] text-white" },
  purple: { pill: "bg-[#6E43A8] text-white", circle: "bg-[#001532] text-white" },
  yellow: { pill: "bg-[#F4D734] text-[#001532]", circle: "bg-[#001532] text-white" },
} as const;

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M4 10h11M11 5.5 15.5 10 11 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SplitButton({
  href,
  children,
  tone = "light",
  size = "md",
  external = false,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  tone?: keyof typeof TONES;
  size?: "sm" | "md" | "lg";
  external?: boolean;
  onClick?: () => void;
}) {
  const t = TONES[tone];
  const pad = { sm: "h-10 px-5 text-[15px]", md: "h-14 px-7 text-lg", lg: "h-16 px-9 text-xl" }[size];
  const dot = { sm: "h-10 w-10", md: "h-14 w-14", lg: "h-16 w-16" }[size];
  const cls = "group inline-flex items-center gap-1 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#138A9A] rounded-full";
  const inner = (
    <>
      <span className={`inline-flex items-center rounded-full ${pad} ${t.pill} transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:pr-9`}>
        {children}
      </span>
      <span
        className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${dot} ${t.circle} transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-6`}
        aria-hidden="true"
      >
        <span className="absolute transition-transform duration-300 group-hover:translate-x-10">
          <ArrowIcon />
        </span>
        <span className="absolute -translate-x-10 transition-transform duration-300 group-hover:translate-x-0">
          <ArrowIcon />
        </span>
      </span>
    </>
  );
  return external ? (
    <a href={href} className={cls} onClick={onClick}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls} onClick={onClick}>
      {inner}
    </Link>
  );
}
