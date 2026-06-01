"use client";

import { useState } from "react";
import Link from "next/link";

const steps = [
  {
    id: "budget",
    question: "What is your available investment budget?",
    options: ["Under $20K", "$20K–$60K", "$60K–$100K", "$100K+"],
  },
  {
    id: "schedule",
    question: "What schedule are you looking for?",
    options: ["Part-time side business", "Full-time operation", "Multi-location"],
  },
  {
    id: "model",
    question: "What delivery model appeals to you?",
    options: ["Mobile / community-based", "Dedicated studio location", "Regional multi-territory"],
  },
  {
    id: "schools",
    question: "Are school and community partnerships important to you?",
    options: ["Yes, very important", "Maybe, open to it", "Not my primary focus"],
  },
];

interface Recommendation {
  title: string;
  investmentRange: string;
  description: string;
  highlights: string[];
  href: string;
}

function getRecommendation(answers: string[]): Recommendation {
  const budget = answers[0];
  const schedule = answers[1];

  if (budget === "Under $20K" || budget === "$20K–$60K") {
    return {
      title: "Mobile Community Model",
      investmentRange: "$10K–$18K",
      description:
        "The Mobile Model is our lowest-investment entry point. Operate classes, camps, and workshops at community centres, libraries, schools, and partner spaces — no dedicated studio required.",
      highlights: [
        "Lowest entry investment",
        "Flexible schedule",
        "Community-based delivery",
        "School partnership focus",
        "Low overhead",
      ],
      href: "/franchise/mobile-model",
    };
  }
  if (schedule === "Multi-location" || budget === "$100K+") {
    return {
      title: "Regional Multi-Territory Model",
      investmentRange: "$100K–$150K+",
      description:
        "Own and develop an entire region. The Regional Model gives you the rights to build multiple locations, support sub-franchisees, and become a cornerstone of CODEship's growth in your area.",
      highlights: [
        "Regional development rights",
        "Multiple revenue streams",
        "Sub-franchisee support",
        "Strongest market position",
        "Comprehensive training",
      ],
      href: "/franchise/regional-model",
    };
  }
  return {
    title: "Studio Learning Centre Model",
    investmentRange: "$60K–$100K",
    description:
      "Open your own CODEship Academy studio — a branded, dedicated learning space for weekly classes, camps, birthday parties, and workshops. Build a community hub for young creators.",
    highlights: [
      "Dedicated branded studio",
      "Full program suite",
      "Birthday party revenue",
      "Community hub model",
      "Comprehensive support",
    ],
    href: "/franchise/studio-model",
  };
}

export default function FranchiseSelector() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const handleAnswer = (option: string) => {
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setDone(true);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setAnswers([]);
    setDone(false);
  };

  if (done) {
    const rec = getRecommendation(answers);
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#138A9A] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-[#001532] mb-1">Your Recommended Model:</h3>
          <h4 className="text-xl font-semibold text-[#E5A823]">{rec.title}</h4>
          <p className="text-sm text-gray-500 mt-1">Investment range: {rec.investmentRange}</p>
        </div>

        <p className="text-gray-600 mb-6 text-center">{rec.description}</p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
          {rec.highlights.map((h) => (
            <li key={h} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="w-2 h-2 bg-[#138A9A] rounded-full shrink-0" />
              {h}
            </li>
          ))}
        </ul>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={rec.href}
            className="bg-[#E5A823] text-[#001532] font-semibold px-6 py-3 rounded-lg hover:bg-[#d4941f] transition-colors text-center"
          >
            Learn More
          </Link>
          <Link
            href="/franchise#kit"
            className="border-2 border-[#001532] text-[#001532] font-semibold px-6 py-3 rounded-lg hover:bg-[#001532] hover:text-white transition-colors text-center"
          >
            Request Franchise Kit
          </Link>
          <button
            onClick={reset}
            className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
          >
            Start Over
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          This is for informational purposes only. No franchise offering is made here.
        </p>
      </div>
    );
  }

  const step = steps[currentStep];
  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#E5A823] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h3 className="text-xl font-bold text-[#001532] mb-6 text-center">{step.question}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {step.options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            className="p-4 text-left border-2 border-gray-200 rounded-xl hover:border-[#E5A823] hover:bg-[#FAF8F4] transition-all duration-200 font-medium text-[#2E3440]"
          >
            {option}
          </button>
        ))}
      </div>

      {currentStep > 0 && (
        <button
          onClick={() => {
            setCurrentStep(currentStep - 1);
            setAnswers(answers.slice(0, -1));
          }}
          className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Back
        </button>
      )}
    </div>
  );
}
