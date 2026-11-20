"use client";

import { SparkleStar, DoodleUnderline } from "@/components/DecorativeShapes";
import { blogCategories } from "@/data/blogCategories";
import { Search, X, Sparkles, BookOpen, Cpu, ShieldCheck } from "lucide-react";

const TRENDING_TAGS = [
  "Gautam Pandit",
  "DeepSeek-R1",
  "Model Context Protocol",
  "WebRTC",
  "Rust Axum",
  "Post-Quantum",
];

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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-700/50 text-xs sm:text-sm text-emerald-200 backdrop-blur-md mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#f3843f] animate-pulse" />
          <span>Gopo Workspace Technical Publication &amp; Architectural Blueprints</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15] max-w-4xl">
          Engineering Guides, AI &amp;{" "}
          <span className="relative inline-block">
            <span>Modern Systems</span>
            <span className="absolute -bottom-3 left-0 w-full pointer-events-none">
              <DoodleUnderline className="w-full h-3 text-[#f3843f]" />
            </span>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-7 text-base sm:text-lg text-emerald-100/80 max-w-2xl leading-relaxed">
          Exhaustive architectural deep dives on DeepSeek-R1 reasoning, Model Context Protocol (MCP) tool servers, sub-200ms WebRTC voice, Rust Tokio systems, and Next.js 16.
        </p>

        {/* Stats Row */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-emerald-200/90">
          <span className="inline-flex items-center gap-1.5 bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-800/40">
            <BookOpen className="w-3.5 h-3.5 text-[#f3843f]" />
            9 Peer-Reviewed Handbooks
          </span>
          <span className="inline-flex items-center gap-1.5 bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-800/40">
            <Cpu className="w-3.5 h-3.5 text-[#38bdf8]" />
            30+ High-Res Blueprints
          </span>
          <span className="inline-flex items-center gap-1.5 bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-800/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            100% Free &amp; Open Source
          </span>
        </div>

        {/* Search Bar */}
        <div className="mt-8 w-full max-w-lg">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300/50 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search DeepSeek, MCP, WebRTC, Rust, Next.js, Kafka..."
              className="w-full bg-emerald-950/80 border border-emerald-700/60 rounded-full pl-11 pr-12 py-3.5 text-xs sm:text-sm text-white placeholder-emerald-300/40 focus:outline-none focus:border-[#f3843f] focus:ring-2 focus:ring-[#f3843f]/30 backdrop-blur-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-white"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Trending Topics */}
          <div className="mt-3 flex items-center justify-center flex-wrap gap-1.5 text-[11px] text-emerald-300/70">
            <span className="font-semibold text-emerald-200">Trending:</span>
            {TRENDING_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-2 py-0.5 rounded-full bg-emerald-950/40 hover:bg-emerald-900 border border-emerald-800/50 text-emerald-200 hover:text-white transition-colors cursor-pointer"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-4xl">
          {blogCategories.map((cat) => {
            const isSelected =
              activeCategory === cat ||
              (activeCategory === "All Topics" && cat === "All Articles");
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white text-[#0b382d] shadow-sm scale-105"
                    : "bg-emerald-950/60 text-emerald-200/80 hover:bg-emerald-900/70 hover:text-white border border-emerald-800/30"
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
