"use client";

import { useState } from "react";
import Link from "next/link";

const steps = [
  {
    id: "age",
    question: "How old is your child?",
    options: ["4–6 years", "7–9 years", "10–12 years", "13+ years"],
  },
  {
    id: "experience",
    question: "What is your child's coding experience?",
    options: ["No experience", "Some experience", "Experienced"],
  },
  {
    id: "interest",
    question: "What does your child enjoy most?",
    options: ["Games", "Apps & Websites", "AI & Tech", "Robotics", "Animation", "Problem-Solving"],
  },
  {
    id: "format",
    question: "What program format works best?",
    options: ["Weekly class", "Camp", "School workshop", "Weekend workshop"],
  },
];

interface Recommendation {
  title: string;
  description: string;
  href: string;
}

function getRecommendation(answers: string[]): Recommendation {
  const age = answers[0];
  const format = answers[3];

  if (age === "4–6 years") {
    return {
      title: "Creative Starters Weekly Class",
      description:
        "Our introductory program for young learners aged 4–6. Using visual block coding and hands-on projects, children explore storytelling, patterns, and creativity in a safe, playful environment.",
      href: "/programs/weekly-classes",
    };
  }
  if (format === "Camp") {
    return {
      title: "CODEship Summer Camp",
      description:
        "An immersive week-long camp experience where kids build real projects from day one. Includes coding, AI exploration, digital design, and a final project showcase.",
      href: "/programs/camps",
    };
  }
  if (format === "School workshop") {
    return {
      title: "School STEM Workshop",
      description:
        "Bring CODEship to your school! Our in-school workshops are curriculum-aligned and hands-on, covering coding, AI literacy, and digital project-building.",
      href: "/programs/school-workshops",
    };
  }
  if (answers[2] === "AI & Tech") {
    return {
      title: "AI & Robotics Program",
      description:
        "Explore artificial intelligence and robotics hands-on. Students learn how AI works, build simple AI applications, and program robots — all through real projects.",
      href: "/programs/ai-robotics",
    };
  }
  return {
    title: "Weekly Coding & STEM Classes",
    description:
      "Our flagship weekly classes meet your child where they are and take them further — building projects they're proud of, skills that last, and confidence that carries into school and beyond.",
    href: "/programs/weekly-classes",
  };
}

export default function ProgramFinder() {
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
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center animate-fade-in-up">
        <div className="w-16 h-16 bg-[#2ECC71] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-[#0A2342] mb-2">We recommend:</h3>
        <h4 className="text-xl font-semibold text-[#F5A623] mb-4">{rec.title}</h4>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">{rec.description}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={rec.href}
            className="bg-[#F5A623] text-[#0A2342] font-semibold px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Learn More
          </Link>
          <button
            onClick={reset}
            className="border-2 border-[#0A2342] text-[#0A2342] font-semibold px-6 py-3 rounded-lg hover:bg-[#0A2342] hover:text-white transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const step = steps[currentStep];
  const progress = ((currentStep) / steps.length) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#F5A623] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h3 className="text-xl font-bold text-[#0A2342] mb-6 text-center">{step.question}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {step.options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            className="p-4 text-left border-2 border-gray-200 rounded-xl hover:border-[#F5A623] hover:bg-amber-50 transition-all duration-200 font-medium text-[#1A1A2E]"
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
