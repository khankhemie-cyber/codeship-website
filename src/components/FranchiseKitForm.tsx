"use client";

export default function FranchiseKitForm() {
  return (
    <form className="space-y-4 bg-white rounded-2xl p-8" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input type="text" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F5A623]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input type="email" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F5A623]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City / Region</label>
          <input type="text" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F5A623]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input type="tel" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F5A623]" />
        </div>
      </div>
      <button type="submit" className="w-full bg-[#F5A623] text-[#0A2342] font-bold py-4 rounded-xl hover:bg-yellow-400 transition-colors">
        Send Me the Franchise Kit
      </button>
      <p className="text-xs text-gray-500 text-center">
        By submitting, you agree to receive information about CODEship Academy franchise opportunities.
        This form does not constitute a franchise offering or commitment.
      </p>
    </form>
  );
}
