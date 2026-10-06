"use client";

import { SparkleStar, DoodleUnderline } from "@/components/DecorativeShapes";
import { blogCategories } from "@/data/blogsData";

export default function BlogHero({
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
}) {
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
          <span>helloS Technical Publication &amp; Blueprints</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.15] max-w-4xl">
          Engineering Guides, AI &amp;{" "}
          <span className="relative inline-block">
            <span>Modern Systems</span>
            <span className="absolute -bottom-3 left-0 w-full pointer-events-none">
              <DoodleUnderline className="w-full h-3 text-[#f3843f]" />
            </span>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-7 text-base sm:text-lg text-emerald-100/75 max-w-2xl leading-relaxed">
          Exhaustive architectural deep dives on Next.js 16, Google Gemma 2 local inference, dot3 multi-agent swarms, and scalable software design.
        </p>

        {/* Search Bar */}
        <div className="mt-10 w-full max-w-md">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Next.js, Gemma AI, dot3, architecture..."
              className="w-full bg-emerald-950/80 border border-emerald-700/60 rounded-full pl-5 pr-12 py-3.5 text-xs sm:text-sm text-white placeholder-emerald-300/40 focus:outline-none focus:border-[#f3843f] backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {blogCategories.map((cat) => {
            const isSelected =
              activeCategory === cat ||
              (activeCategory === "All Topics" && cat === "All Articles");
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-white text-[#0b382d] shadow-sm scale-105"
                    : "bg-emerald-950/50 text-emerald-200/80 hover:bg-emerald-900/60 hover:text-white"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
