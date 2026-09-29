const testimonials = [
  {
    quote:
      "My daughter used to think coding wasn't for her. After two months at CODEship, she built her own game and presented it to our whole family. The confidence boost has been incredible.",
    name: "Sarah M.",
    role: "Parent of a 10-year-old",
  },
  {
    quote:
      "My son had his birthday party at CODEship and all the kids made their own mini games. Parents couldn't believe how much the kids accomplished in just a couple of hours.",
    name: "Marcus T.",
    role: "Parent of a 9-year-old, Oshawa",
  },
  {
    quote:
      "What I appreciate most is that my kids aren't just watching screens — they're making things. There's a real difference in their confidence and the way they approach problems now.",
    name: "David & Linda K.",
    role: "Parents of two",
  },
];

/** Three parent quotes in a calm, readable grid. */
export default function TestimonialMarquee() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#001532] text-center mb-12">What parents say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <figure key={t.name} className="bg-[#FAF8F4] rounded-2xl p-7 flex flex-col">
              <div className="flex gap-1 mb-4" aria-label="5 out of 5 stars">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-[#E5A823]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-lg text-gray-700 leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-5">
                <p className="font-bold text-[#001532] text-base">{t.name}</p>
                <p className="text-gray-500 text-base">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
