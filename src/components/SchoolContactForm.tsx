"use client";

export default function SchoolContactForm() {
  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
        <input type="text" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F5A623]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
        <input type="text" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F5A623]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input type="email" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F5A623]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Program Interest</label>
        <select className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F5A623] bg-white">
          <option>After-School Club</option>
          <option>PA Day Workshop</option>
          <option>March Break Camp</option>
          <option>In-Class Enrichment</option>
          <option>Summer Program</option>
          <option>Multiple Programs</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
        <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F5A623] resize-none" />
      </div>
      <div className="md:col-span-2">
        <button type="submit" className="w-full bg-[#F5A623] text-[#0A2342] font-bold py-4 rounded-xl hover:bg-yellow-400 transition-colors">
          Request Information
        </button>
      </div>
    </form>
  );
}
