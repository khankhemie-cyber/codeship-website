const ALIGNMENTS = [
  {
    region: "Ontario",
    note: "Supports the Ontario curriculum baseline for coding and digital literacy expectations.",
  },
  {
    region: "British Columbia",
    note: "Aligned to BC's Applied Design, Skills & Technologies (ADST) curriculum.",
  },
  {
    region: "Alberta",
    note: "Maps to Alberta's Computer Science and CTF (Career and Technology Foundations) outcomes.",
  },
  {
    region: "Québec",
    note: "Aligned to the Cadre de référence de la compétence numérique. Available in French.",
  },
];

interface AlignmentStripProps {
  className?: string;
}

export default function AlignmentStrip({ className = "" }: AlignmentStripProps) {
  return (
    <div className={className}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ALIGNMENTS.map((a) => (
          <div key={a.region} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="font-bold text-[#001532] text-sm mb-1.5">{a.region}</p>
            <p className="text-gray-600 text-xs leading-relaxed">{a.note}</p>
          </div>
        ))}
      </div>
      <p className="text-gray-400 text-xs mt-4 max-w-3xl">
        CODEship Academy&apos;s curriculum is designed to support and align with these provincial frameworks. It is
        not endorsed or approved by any ministry of education.
      </p>
    </div>
  );
}
