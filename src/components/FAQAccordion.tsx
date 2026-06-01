"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggle(index)}
            className="w-full text-left px-6 py-5 flex items-center justify-between font-semibold text-[#001532] hover:bg-gray-50 transition-colors"
            aria-expanded={openIndex === index}
          >
            <span>{faq.question}</span>
            <span className={`ml-4 shrink-0 transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`}>
              <svg className={`w-5 h-5 ${openIndex === index ? "text-[#138A9A]" : "text-[#E5A823]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>
          <div
            className={`accordion-content ${openIndex === index ? "open" : ""}`}
          >
            <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed">
              {faq.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
