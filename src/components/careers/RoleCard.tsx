import Link from "next/link";
import ApplyButton from "@/components/careers/ApplyButton";
import { CheckList } from "@/components/ui/Page";
import { ROLE_TERMS, type CareerRole } from "@/config/careers";

const ACCENTS: Record<CareerRole["slug"], string> = {
  "senior-instructor": "bg-[#0F6F7C]",
  "assistant-instructor": "bg-[#6E43A8]",
};

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-bold uppercase tracking-widest text-[#0F6F7C] mb-3">{title}</h4>
      <CheckList items={items} />
    </div>
  );
}

/** One open role. `detailsHref` adds a link to the role's own page (used on /careers). */
export default function RoleCard({
  role,
  detailsHref,
  headingLevel = "h3",
}: {
  role: CareerRole;
  detailsHref?: string;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <article id={role.slug} className="relative flex flex-col bg-white shadow-sm scroll-mt-28">
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${ACCENTS[role.slug]}`} />
      <div className="p-6 sm:p-8 flex flex-col gap-7 flex-1">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Contract</p>
            <Heading className="font-display text-2xl sm:text-3xl font-extrabold text-[#001532] mt-1">{role.title}</Heading>
          </div>
          <p className="whitespace-nowrap">
            <span className="font-display text-3xl font-extrabold text-[#001532]">${role.hourlyRate}</span>
            <span className="text-base font-semibold text-gray-600"> / hour CAD</span>
          </p>
        </header>

        <p className="text-lg text-gray-700 leading-relaxed">{role.summary}</p>

        <ListBlock title="Terms" items={ROLE_TERMS} />
        <ListBlock title="Requirements" items={role.requirements} />
        <ListBlock title="Assets" items={role.assets} />

        <div className="mt-auto pt-2 flex flex-wrap items-center gap-x-6 gap-y-3">
          <ApplyButton role={role.slug} />
          {detailsHref && (
            <Link href={detailsHref} className="text-base font-bold text-[#0F6F7C] hover:underline">
              Role details
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
