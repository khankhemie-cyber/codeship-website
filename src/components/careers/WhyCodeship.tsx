import { CheckList } from "@/components/ui/Page";
import { CLASSROOM, WHY_CODESHIP } from "@/config/careers";

/** Why teach with CODEship, and what the classroom looks like. */
export default function WhyCodeship() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {WHY_CODESHIP.map((item) => (
        <div key={item.title} className="bg-white shadow-sm p-6 sm:p-8">
          <span aria-hidden="true" className="block h-1 w-10 bg-[#F4D734] mb-5" />
          <h3 className="font-display text-xl font-extrabold text-[#001532]">{item.title}</h3>
          <p className="text-base text-gray-600 mt-2 leading-relaxed">{item.body}</p>
        </div>
      ))}
      <div className="bg-white shadow-sm p-6 sm:p-8">
        <span aria-hidden="true" className="block h-1 w-10 bg-[#6E43A8] mb-5" />
        <h3 className="font-display text-xl font-extrabold text-[#001532] mb-4">In the classroom</h3>
        <CheckList items={CLASSROOM} />
      </div>
    </div>
  );
}
