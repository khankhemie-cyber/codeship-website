interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
}

/**
 * Native <details> accordion: accessible, no client JS, and every answer stays
 * in the HTML for search engines and AI answer engines.
 */
export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  return (
    <div className="space-y-3">
      {faqs.map((faq) => (
        <details
          key={faq.question}
          className="group bg-white border border-gray-200 open:shadow-md transition-shadow"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-lg font-bold text-[#001532] [&::-webkit-details-marker]:hidden">
            <span>{faq.question}</span>
            <svg
              className="h-5 w-5 shrink-0 text-[#001532] transition-transform duration-200 group-open:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <p className="faq-answer px-6 pb-6 text-base leading-relaxed text-gray-700">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
