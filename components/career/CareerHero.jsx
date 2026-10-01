"use client";

import Link from "next/link";
import { ArrowDown, SparkleStar, DoodleUnderline } from "@/components/DecorativeShapes";

export default function CareerHero() {
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
          <span>We are hiring globally!</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.15] max-w-4xl">
          Build the Future of{" "}
          <span className="relative inline-block">
            <span>Global Education</span>
            <span className="absolute -bottom-3 left-0 w-full pointer-events-none">
              <DoodleUnderline className="w-full h-3 text-[#f3843f]" />
            </span>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-7 text-base sm:text-lg text-emerald-100/75 max-w-2xl leading-relaxed">
          Help us build the next generation of interactive online learning tools, curriculum, and mentorship experiences. We are a remote-first team spread across 18 countries.
        </p>

        {/* Action Button */}
        <div className="mt-9 flex items-center gap-4">
          <Link
            href="#openings"
            className="px-8 py-3.5 rounded-full text-sm font-bold bg-[#f3843f] hover:bg-[#e0732f] text-white shadow-lg shadow-orange-950/20 hover:scale-105 active:scale-95 transition-all"
          >
            View Open Roles
          </Link>
        </div>
      </div>
    </section>
  );
}
