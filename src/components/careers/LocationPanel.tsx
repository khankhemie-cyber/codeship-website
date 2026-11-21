import { CheckList } from "@/components/ui/Page";
import { LOCATION_TERMS } from "@/config/careers";

/** Where and how both roles teach. */
export default function LocationPanel({ title = "Locations and travel" }: { title?: string }) {
  return (
    <div className="bg-[#001532] p-6 sm:p-8">
      <h2 className="font-display text-2xl font-extrabold text-white mb-5">{title}</h2>
      <CheckList items={LOCATION_TERMS} dark />
    </div>
  );
}
