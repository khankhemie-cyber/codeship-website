import ApplyButton from "@/components/careers/ApplyButton";
import { ROLE_ACCENTS, Rate } from "@/components/careers/RoleCard";
import { CheckList } from "@/components/ui/Page";
import { LOCATION_TERMS, ROLE_DETAILS, type CareerRole } from "@/config/careers";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-8 border-t border-[#001532]/10 first:border-t-0 first:pt-0">
      <h2 className="font-display text-2xl font-extrabold text-[#001532] mb-4">{title}</h2>
      {children}
    </section>
  );
}

/** The full job description on /careers/[role]. */
export default function RoleDetail({ role }: { role: CareerRole }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12 items-start">
      <div className="lg:col-span-2 order-2 lg:order-1">
        <Block title="About the role">
          <p className="text-lg text-gray-700 leading-relaxed">{role.about}</p>
        </Block>
        <Block title="Requirements">
          <CheckList items={role.requirements} />
        </Block>
        <Block title="Assets">
          <CheckList items={role.assets} />
        </Block>
        <Block title="Locations and travel">
          <CheckList items={LOCATION_TERMS} />
        </Block>
      </div>

      <aside className="order-1 lg:order-2 lg:sticky lg:top-28 relative bg-white shadow-sm">
        <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${ROLE_ACCENTS[role.slug]}`} />
        <div className="p-6 sm:p-7">
          <p className="text-sm font-bold uppercase tracking-widest text-[#0F6F7C]">At a glance</p>
          <dl className="mt-4 divide-y divide-[#001532]/10">
            <div className="pb-4">
              <dt className="sr-only">Pay</dt>
              <dd>
                <Rate role={role} />
              </dd>
            </div>
            {ROLE_DETAILS.map((d) => (
              <div key={d.label} className="py-3 grid grid-cols-[5.5rem_1fr] gap-3">
                <dt className="text-sm font-bold text-[#001532]">{d.label}</dt>
                <dd className="text-base text-gray-700">{d.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5">
            <ApplyButton role={role.slug} label={`Apply for this role`} />
          </div>
        </div>
      </aside>
    </div>
  );
}
