import { CheckList } from "@/components/ui/Page";
import { LOCATION_TERMS, VSC_REQUIREMENT, WORK_AUTHORIZATION } from "@/config/careers";

/** What both roles share: where classes run, travel, and the eligibility requirements. */
export default function LocationPanel() {
  return (
    <div className="bg-[#001532] p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="font-display text-xl font-extrabold text-white mb-5">Locations and travel</h3>
        <CheckList items={LOCATION_TERMS} dark />
      </div>
      <div>
        <h3 className="font-display text-xl font-extrabold text-white mb-5">Required for both roles</h3>
        <CheckList items={[WORK_AUTHORIZATION, VSC_REQUIREMENT]} dark />
      </div>
    </div>
  );
}
