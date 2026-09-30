import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { IN_PERSON_VENUE } from "@/data/locations";
import { PRICE_LABEL, SEMESTER_SHAPE_LABEL } from "@/config/offering";

/**
 * Shared page building blocks. Every parent-facing page uses these so type
 * sizes, spacing and colour stay consistent: body copy never drops below
 * text-base, labels never below text-sm.
 */

type Crumb = { name: string; href: string };

export function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  crumbs?: Crumb[];
  children?: React.ReactNode;
}) {
  return (
    <section className="bg-[#001532]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {crumbs && <Breadcrumbs className="mb-6" items={crumbs} />}
        {eyebrow && (
          <p className="text-[#F4D734] font-bold text-sm uppercase tracking-widest mb-3">{eyebrow}</p>
        )}
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight max-w-3xl">{title}</h1>
        {lead && <p className="text-gray-200 text-lg sm:text-xl mt-5 max-w-2xl leading-relaxed">{lead}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

const TONES = {
  cream: "bg-[#FAF8F4]",
  sand: "bg-[#F1EEE8]",
  white: "bg-white",
  navy: "bg-[#001532] text-white",
} as const;

export function Section({
  tone = "cream",
  id,
  narrow,
  children,
}: {
  tone?: keyof typeof TONES;
  id?: string;
  narrow?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`${TONES[tone]} py-16 sm:py-20 ${id ? "scroll-mt-28" : ""}`}>
      <div className={`${narrow ? "max-w-3xl" : "max-w-6xl"} mx-auto px-4 sm:px-6 lg:px-8`}>{children}</div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  lead,
  center,
  dark,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  center?: boolean;
  dark?: boolean;
}) {
  return (
    <div className={`mb-10 ${center ? "text-center mx-auto" : ""} max-w-2xl`}>
      {eyebrow && (
        <p className={`font-bold text-sm uppercase tracking-widest mb-3 ${dark ? "text-[#F4D734]" : "text-[#0F6F7C]"}`}>{eyebrow}</p>
      )}
      <h2 className={`font-display text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight ${dark ? "text-white" : "text-[#001532]"}`}>
        {title}
      </h2>
      {lead && <p className={`text-lg mt-4 leading-relaxed ${dark ? "text-gray-300" : "text-gray-600"}`}>{lead}</p>}
    </div>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline" | "outlineDark";
}) {
  const styles = {
    primary: "bg-[#F4D734] text-[#001532] hover:bg-[#E6C51E] shadow-lg",
    outline: "border-2 border-white/70 text-white hover:bg-white hover:text-[#001532]",
    outlineDark: "border-2 border-[#001532] text-[#001532] hover:bg-[#001532] hover:text-white",
  }[variant];
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center px-7 py-3.5 text-lg font-bold transition-colors ${styles}`}
    >
      {children}
    </Link>
  );
}

export function CheckList({ items, dark }: { items: string[]; dark?: boolean }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className={`flex items-start gap-3 text-base ${dark ? "text-gray-200" : "text-gray-700"}`}>
          <svg
            className="w-5 h-5 mt-0.5 shrink-0 text-[#138A9A]"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** The standard closing call to action: where, when, how much, one button. */
export function BookingBand({
  title = "Ready to book?",
  href = "/#book",
  label = "Book a Semester",
  detail = `Saturdays at ${IN_PERSON_VENUE.full}. October and November semesters are open.`,
}: {
  title?: string;
  href?: string;
  label?: string;
  detail?: string;
}) {
  return (
    <section className="bg-[#001532]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">{title}</h2>
        <p className="text-gray-200 text-lg mt-4">{detail}</p>
        <p className="text-gray-300 text-lg mt-1">
          {PRICE_LABEL} · {SEMESTER_SHAPE_LABEL}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <ButtonLink href={href}>{label}</ButtonLink>
          <ButtonLink href="/contact" variant="outline">
            Ask a Question
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
