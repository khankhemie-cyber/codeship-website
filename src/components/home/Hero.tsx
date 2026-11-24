"use client";

import Image from "next/image";
import Link from "next/link";
import { useTrialPhase } from "@/components/trial/useTrialPhase";
import { startDates } from "@/lib/booking";
import { IMAGES } from "@/config/images";
import { PRICE_LABEL } from "@/config/offering";

/**
 * Home hero: a bright, photo-led opening. Real kids building and coding on
 * the right, a short promise and one main action on the left.
 */
export default function Hero() {
  const phase = useTrialPhase();
  const trial = phase !== "closed";

  return (
    <section className="relative overflow-hidden bg-[#FFF8E1]">
      {/* Soft shapes */}
      <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#F4D734]/40 blur-3xl" aria-hidden="true" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-[#5FD3E0]/30 blur-3xl" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-10 items-center">
          {/* Message */}
          <div className="animate-fade-in-up">
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#001532] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#138A9A]" aria-hidden="true" />
              Coding · AI · Robotics for K–Grade 8
            </p>

            <h1 className="font-display text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.05] tracking-tight text-[#001532] mt-6">
              Where kids <span className="relative whitespace-nowrap">
                <span className="relative z-10">build</span>
                <span className="absolute inset-x-0 bottom-1 h-4 -z-0 bg-[#F4D734] rounded" aria-hidden="true" />
              </span>{" "}
              games, robots and AI.
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 mt-6 leading-relaxed max-w-xl">
              Small, friendly classes in Oshawa on Saturdays, or live online after school. Beginners welcome: every level starts from the basics.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={trial ? "#free-trial" : "#book"}
                className="inline-flex items-center rounded-full bg-[#F4D734] px-8 py-4 text-lg font-bold text-[#001532] shadow-lg shadow-[#F4D734]/40 hover:bg-[#E6C51E] transition-colors"
              >
                {trial ? "Book a free class" : "Enroll for January"}
              </Link>
              <Link
                href="/programs/camps#march-break"
                className="inline-flex items-center rounded-full border-2 border-[#001532] px-7 py-[14px] text-lg font-bold text-[#001532] hover:bg-[#001532] hover:text-white transition-colors"
              >
                March Break camp
              </Link>
            </div>
            <p className="mt-5 text-base text-gray-600">
              {trial
                ? "Free trial: book by Nov 30, class taken in November."
                : `January semester starts ${startDates("inperson", "january")} in person, ${startDates("online", "january")} online.`}
            </p>

            {/* Quick facts */}
            <ul className="mt-8 grid grid-cols-3 gap-3 max-w-lg">
              {[
                ["K–8", "4 levels by grade"],
                [PRICE_LABEL.replace("CAD ", ""), "8 weekly classes"],
                ["2 ways", "In person or online"],
              ].map(([big, small]) => (
                <li key={small} className="rounded-2xl bg-white p-3 text-center shadow-sm">
                  <p className="font-display text-2xl font-extrabold text-[#001532]">{big}</p>
                  <p className="text-sm text-gray-600 leading-tight mt-1">{small}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Photo collage */}
          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="absolute -right-4 -top-4 h-full w-full rounded-[2.5rem] bg-[#138A9A] rotate-3" aria-hidden="true" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] border-8 border-white shadow-2xl">
              <Image src={IMAGES.heroRobot.src} alt={IMAGES.heroRobot.alt} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-8 -left-4 sm:-left-8 h-32 w-32 sm:h-40 sm:w-40 overflow-hidden rounded-full border-[6px] border-white shadow-xl">
              <Image src={IMAGES.kidLaptop.src} alt={IMAGES.kidLaptop.alt} fill sizes="160px" className="object-cover" />
            </div>
            <div className="absolute -top-6 left-6 sm:left-10 h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-full border-[6px] border-white shadow-xl">
              <Image src={IMAGES.kidsBuilding.src} alt={IMAGES.kidsBuilding.alt} fill sizes="112px" className="object-cover" />
            </div>
            <div className="absolute -bottom-6 right-4 sm:right-8 rounded-2xl bg-white px-5 py-3 shadow-xl">
              <p className="text-sm font-bold uppercase tracking-wider text-[#0F6F7C]">{trial ? "November only" : "March Break"}</p>
              <p className="font-display text-xl font-extrabold text-[#001532]">{trial ? "1 free class" : "Camp open"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
