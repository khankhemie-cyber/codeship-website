import Link from "next/link";
import ApplyButton from "@/components/careers/ApplyButton";
import { type CareerRole } from "@/config/careers";

export const ROLE_ACCENTS: Record<CareerRole["slug"], string> = {
  "senior-instructor": "bg-[#0F6F7C]",
  "assistant-instructor": "bg-[#6E43A8]",
};

export function Rate({ role, dark }: { role: CareerRole; dark?: boolean }) {
  return (
    <p className="whitespace-nowrap">
      <span className={`font-display text-3xl font-extrabold ${dark ? "text-white" : "text-[#001532]"}`}>${role.hourlyRate}</span>
      <span className={`text-base font-semibold ${dark ? "text-gray-300" : "text-gray-600"}`}> / hour CAD</span>
    </p>
  );
}

/** Summary card for the /careers list. The full description is on the role's own page. */
export default function RoleCard({ role }: { role: CareerRole }) {
  return (
    <article id={role.slug} className="relative flex flex-col bg-white shadow-sm scroll-mt-28">
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${ROLE_ACCENTS[role.slug]}`} />
      <div className="p-6 sm:p-8 flex flex-col gap-5 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
          <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#001532]">
            <Link href={`/careers/${role.slug}`} className="hover:text-[#0F6F7C] transition-colors">
              {role.title}
            </Link>
          </h3>
          <Rate role={role} />
        </div>
        <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
          Contract · Starts immediately · 2–4 hours a week
        </p>
        <p className="text-lg text-gray-700 leading-relaxed">{role.tagline}</p>
        <div className="mt-auto pt-2 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href={`/careers/${role.slug}`}
            className="inline-flex items-center justify-center px-7 py-3.5 text-lg font-bold border-2 border-[#001532] text-[#001532] hover:bg-[#001532] hover:text-white transition-colors"
          >
            View role
          </Link>
          <ApplyButton role={role.slug} />
        </div>
      </div>
    </article>
  );
}
