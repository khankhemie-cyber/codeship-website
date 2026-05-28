"use client";

export default function NewsletterForm() {
  return (
    <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
      <input
        type="email"
        placeholder="Enter your email address"
        className="flex-1 px-4 py-3 rounded-xl text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
      />
      <button
        type="submit"
        className="bg-[#F5A623] text-[#0A2342] font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors shrink-0"
      >
        Subscribe
      </button>
    </form>
  );
}
