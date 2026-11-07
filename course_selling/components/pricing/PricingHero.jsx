"use client";

import Link from "next/link";
import { SparkleStar, DoodleUnderline } from "@/components/DecorativeShapes";
import { FileText, Code2, Heart, CheckCircle } from "lucide-react";

export default function PricingHero() {
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
          <span>Our Open-Access Pledge</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.15] max-w-4xl">
          Zero Paywalls. Zero Fees.
          <br />
          100% Free{" "}
          <span className="relative inline-block">
            <span>PDFs &amp; Projects!</span>
            <span className="absolute -bottom-3 left-0 w-full pointer-events-none">
              <DoodleUnderline className="w-full h-3 text-[#f3843f]" />
            </span>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-7 text-base sm:text-lg text-emerald-100/85 max-w-2xl leading-relaxed">
          We don’t believe in charging hundreds of dollars for disconnected video tutorials.
          Our niche is simple: comprehensive technical PDF notes and production-ready GitHub projects with live demos. Free forever.
        </p>

        {/* Quick CTA Buttons */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/pdf-notes"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-white text-[#0b382d] hover:bg-emerald-50 shadow-md transition-all"
          >
            <FileText className="w-4 h-4 text-[#ea8a42]" />
            <span>Browse Free PDF Notes</span>
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-[#eb793e] hover:bg-[#da6c32] text-white shadow-md transition-all"
          >
            <Code2 className="w-4 h-4" />
            <span>Explore Projects Hub</span>
          </Link>
        </div>

        {/* Guarantees row */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-emerald-200/80">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-[#f3843f]" />
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-[#f3843f]" />
            <span>Direct 1-Click PDF Downloads</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-[#f3843f]" />
            <span>Open Source GitHub Repositories</span>
          </div>
        </div>
      </div>
    </section>
  );
}
