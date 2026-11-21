import { HIRING_STEPS } from "@/config/careers";

/** Numbered steps from application to start. */
export default function HiringProcess({ dark }: { dark?: boolean }) {
  return (
    <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {HIRING_STEPS.map((step, i) => (
        <li key={step.title} className={`p-5 sm:p-6 ${dark ? "bg-white/[0.06] border border-white/10" : "bg-white shadow-sm"}`}>
          <span className={`font-display text-sm font-extrabold tracking-widest ${dark ? "text-[#F4D734]" : "text-[#0F6F7C]"}`}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <p className={`mt-2 text-lg font-bold ${dark ? "text-white" : "text-[#001532]"}`}>{step.title}</p>
          {step.body && <p className={`mt-1.5 text-base ${dark ? "text-gray-300" : "text-gray-600"}`}>{step.body}</p>}
        </li>
      ))}
    </ol>
  );
}
