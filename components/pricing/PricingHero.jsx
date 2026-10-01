"use client";

import { SparkleStar, DoodleUnderline } from "@/components/DecorativeShapes";

export default function PricingHero({ isAnnual, setIsAnnual }) {
  return (
    <section className="relative bg-[#0b382d] pt-14 pb-20 sm:pb-24 text-white overflow-hidden">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
      />

      {/* Decorative Sparkle Star */}
      <div className="absolute top-20 right-10 pointer-events-none opacity-80 hidden sm:block">
        <SparkleStar className="w-8 h-8 text-[#df9d66]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-700/40 text-xs sm:text-sm text-emerald-200 backdrop-blur-md mb-6">
          <span className="w-2 h-2 rounded-full bg-[#f3843f]" />
          <span>Simple, Honest Pricing</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.15] max-w-4xl">
          Invest in Your Career with
          <br />
          Flexible{" "}
          <span className="relative inline-block">
            <span>Plans!</span>
            <span className="absolute -bottom-3 left-0 w-full pointer-events-none">
              <DoodleUnderline className="w-full h-3 text-[#f3843f]" />
            </span>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-7 text-base sm:text-lg text-emerald-100/75 max-w-2xl leading-relaxed">
          Zero hidden fees. Lifetime access to completed courses, live virtual classrooms, and 1-on-1 career mentorship.
        </p>

        {/* Annual / Monthly Toggle */}
        <div className="mt-10 flex items-center gap-3 bg-emerald-950/70 border border-emerald-800/60 p-1.5 rounded-full backdrop-blur-sm">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
              !isAnnual
                ? "bg-white text-[#0b382d] shadow-sm"
                : "text-emerald-200 hover:text-white"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
              isAnnual
                ? "bg-white text-[#0b382d] shadow-sm"
                : "text-emerald-200 hover:text-white"
            }`}
          >
            <span>Annual Billing</span>
            <span className="bg-[#f3843f] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Save 25%
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
