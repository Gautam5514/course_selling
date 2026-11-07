"use client";

import Link from "next/link";
import { Sparkles, Search, ArrowRight, Star, Users, Award, ShieldCheck } from "lucide-react";
import { RightEdgeConcentricRings, SparkleStar, DoodleUnderline } from "@/components/DecorativeShapes";
import { popularTracksList } from "@/data/tracksData";

export default function CoursesHero({ searchQuery, setSearchQuery }) {
  return (
    <section className="relative bg-[#093c33] text-white pt-12 sm:pt-16 pb-16 sm:pb-24 overflow-hidden">
      {/* Subtle Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Decorative Concentric Rings */}
      <div className="absolute top-12 sm:top-16 right-0 opacity-60 pointer-events-none hidden lg:block">
        <RightEdgeConcentricRings className="w-28 h-52 sm:w-36 sm:h-64 text-[#ea8a42]" />
      </div>

      {/* Decorative Sparkle Star */}
      <div className="absolute top-24 left-8 pointer-events-none opacity-80 hidden sm:block">
        <SparkleStar className="w-8 h-8 text-[#df9d66]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Top Notification Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-600/40 text-xs font-bold text-emerald-200 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>FALL 2025 COHORTS NOW OPEN • 40% OFF EARLY BIRD</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
          Explore In-Demand <span className="text-[#f3843f]">Courses</span> &
          <br />
          Career Accelerator Tracks
        </h1>

        <div className="w-48 sm:w-64 mx-auto mt-2 mb-4">
          <DoodleUnderline className="w-full h-3 text-[#f3843f]" />
        </div>

        <p className="mt-4 text-xs sm:text-sm md:text-base text-emerald-100/85 max-w-2xl mx-auto leading-relaxed">
          Master real-world software engineering, Generative AI, and product design from leads at Stripe, Microsoft, and Figma. Build production apps and get hired.
        </p>

        {/* Live Search Bar */}
        <div className="mt-8 max-w-lg mx-auto relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses, skills or tools (e.g. Next.js, LLMs, Figma, Docker)..."
            className="w-full pl-11 pr-4 py-3.5 rounded-full text-xs sm:text-sm bg-white text-stone-900 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#f3843f] shadow-xl placeholder:text-stone-400"
          />
        </div>

        {/* Popular Tracks Quick Navigation Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
          <span className="text-xs font-semibold text-emerald-200/80 mr-1">
            Popular Tracks:
          </span>
          {popularTracksList.map((track) => (
            <Link
              key={track.slug}
              href={`/courses/${track.slug}`}
              className="text-[11px] font-semibold px-3 py-1 rounded-full bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-200 hover:text-white transition-colors"
            >
              {track.name} →
            </Link>
          ))}
        </div>

        {/* Social Proof Metric Strip */}
        <div className="mt-10 pt-8 border-t border-emerald-800/50 flex flex-wrap items-center justify-around gap-6 text-emerald-100/80 max-w-4xl mx-auto text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span><strong>48,000+</strong> Enrolled Students</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-current" />
            <span><strong>4.9/5</strong> Rating (16k+ Reviews)</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span><strong>94%</strong> Career Placement Rate</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span><strong>30-Day</strong> Money-Back Guarantee</span>
          </div>
        </div>
      </div>
    </section>
  );
}
