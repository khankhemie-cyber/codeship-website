"use client";

export default function ContactForm() {
  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input type="text" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F5A623]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input type="text" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F5A623]" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input type="email" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F5A623]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <select className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F5A623] bg-white">
          <option>Program Inquiry</option>
          <option>School Partnership</option>
          <option>Franchise Opportunity</option>
          <option>Birthday Party Booking</option>
          <option>General Question</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea rows={4} className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F5A623] resize-none" />
      </div>
      <button type="submit" className="w-full bg-[#F5A623] text-[#0A2342] font-bold py-4 rounded-xl hover:bg-yellow-400 transition-colors">
        Send Message
      </button>
    </form>
  );
}
