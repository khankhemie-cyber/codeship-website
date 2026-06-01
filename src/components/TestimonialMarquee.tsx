"use client";

const testimonials = [
  {
    quote:
      "My daughter used to think coding wasn't for her. After two months at CODEship, she built her own game and presented it to our whole family. The confidence boost has been incredible.",
    name: "Sarah M.",
    role: "Parent of 10-year-old, Markham",
  },
  {
    quote:
      "We booked CODEship for a PA Day workshop and the kids were completely engaged the entire time. They left with real projects they built themselves. Our teachers were genuinely impressed.",
    name: "Vice Principal",
    role: "Elementary School, Mississauga",
  },
  {
    quote:
      "My son had his birthday party at CODEship and all the kids made their own mini games. Parents couldn't believe how much the kids accomplished in just a couple of hours.",
    name: "Marcus T.",
    role: "Parent of 9-year-old, Oshawa",
  },
  {
    quote:
      "As a teacher, I love how CODEship connects coding to real academic skills. My students came back from the workshop talking about logic, problem-solving, and sequencing — without realizing they were learning.",
    name: "Grade 5 Teacher",
    role: "Durham Region",
  },
  {
    quote:
      "My son is neurodivergent and has struggled in group settings. The CODEship instructors were patient, creative, and found ways to engage him that I've never seen before. He's now obsessed with building games.",
    name: "Priya R.",
    role: "Parent of 11-year-old, Brampton",
  },
  {
    quote:
      "What I appreciate most is that my kids aren't just watching screens — they're making things. There's a real difference in their confidence and the way they approach problems now.",
    name: "David & Linda K.",
    role: "Parents of two, Toronto",
  },
];

// Duplicate for seamless loop
const items = [...testimonials, ...testimonials];

export default function TestimonialMarquee() {
  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <h2 className="text-3xl font-bold text-[#001532]">What Families Are Saying</h2>
      </div>

      <div className="relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-white to-transparent" />

        <div className="flex gap-6 marquee-track">
          {items.map((t, i) => (
            <div
              key={i}
              className="flex-none w-80 bg-[#FAF8F4] border border-gray-100 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, si) => (
                  <svg key={si} className="w-4 h-4 text-[#E5A823]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-4">&ldquo;{t.quote}&rdquo;</p>
              <div className="border-t border-gray-100 pt-3">
                <p className="font-bold text-[#001532] text-sm">{t.name}</p>
                <p className="text-gray-400 text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
