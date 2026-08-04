import { PROGRAM_LINKS, type ProgramLevel } from "@/lib/payment-links";

interface EnrollButtonProps {
  program: ProgramLevel;
  label?: string;
  className?: string;
}

/**
 * The single Stripe Payment Link CTA for a program level. This is the only
 * place a Stripe checkout link should be rendered — everywhere else links to
 * the per-program registration page (/register/[program]) that hosts it.
 */
export function EnrollButton({ program, label = "Register Now", className = "" }: EnrollButtonProps) {
  const config = PROGRAM_LINKS[program];
  return (
    <a
      href={config.url}
      className={
        "inline-flex w-full items-center justify-center rounded-xl bg-[#E5A823] px-7 py-4 text-center " +
        "font-bold text-[#001532] transition-colors hover:bg-[#d4941f] " +
        className
      }
    >
      {label}
    </a>
  );
}

export default EnrollButton;
