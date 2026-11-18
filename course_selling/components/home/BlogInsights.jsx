"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Calendar, Clock, Sparkles, BookOpen, Layers } from "lucide-react";
import { LeftEdgeConcentricRings, StarburstDoodle } from "@/components/DecorativeShapes";
import LikeButton from "@/components/LikeButton";
import { techBlogPosts } from "@/data/blogsData";

const HOME_CATEGORIES = [
  { label: "All Blueprints", filter: "all" },
  { label: "Founder Story & Research", filter: ["Engineering Journey & AI Research"] },
  { label: "Reasoning AI & LLMs", filter: ["DeepSeek & Reasoning AI", "Gemma AI & Local LLMs"] },
  { label: "Agentic MCP & Voice", filter: ["Agentic AI & MCP", "Real-Time Voice & WebRTC", "dot3 AI & Agent Swarms"] },
  { label: "High-Scale Systems", filter: ["Rust & Systems", "Distributed Systems", "Security & Cryptography", "Next.js & React 19"] },
];

const HOME_CATEGORIES_BY_LABEL = new Map(HOME_CATEGORIES.map((c) => [c.label, c]));

export default function BlogInsights() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredPosts = techBlogPosts.filter((post) => {
    if (activeTab === "all") return true;
    const tabObj = HOME_CATEGORIES_BY_LABEL.get(activeTab);
    if (!tabObj || tabObj.filter === "all") return true;
    if (Array.isArray(tabObj.filter)) {
      return tabObj.filter.includes(post.category);
    }
    return post.category === tabObj.filter;
  });

  // Display top 6 articles for rich variety
  const displayPosts = filteredPosts.slice(0, 6);

  return (
    <section id="blog" className="py-20 sm:py-28 bg-[#faf7f2]/60 relative overflow-hidden">
      {/* Decorative Dark Teal Concentric Rings on Left Edge */}
      <div className="absolute top-12 sm:top-16 left-0 opacity-80 pointer-events-none hidden md:block">
        <LeftEdgeConcentricRings className="w-24 h-44 sm:w-28 sm:h-52 text-[#094e46]" />
      </div>

      {/* Decorative Warm Peach Starburst on Bottom Right */}
      <div className="absolute bottom-6 right-8 sm:right-16 pointer-events-none opacity-80 hidden sm:block">
        <StarburstDoodle className="w-20 h-20 text-[#f59853]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with Title and "See All" */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 max-w-6xl mx-auto">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-300/60 text-xs font-bold text-[#0b382d] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#f3843f]" />
              <span>Cutting-Edge Engineering &amp; AI Publications</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#111827] leading-tight">
              Explore <span className="text-[#f3843f]">Insights</span> &amp;
              <br />
              Architecture Handbooks
            </h2>
            <p className="mt-3 text-sm text-stone-600 max-w-xl">
              Production blueprints, mathematical analyses, and code walkthroughs covering DeepSeek-R1, MCP tool swarms, WebRTC voice streaming, and Rust systems.
            </p>
          </div>

          {/* See All Button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-stone-200/90 text-xs sm:text-sm font-bold text-[#0b382d] hover:bg-[#0b382d] hover:text-white hover:border-[#0b382d] shadow-sm transition-all duration-300 self-start md:self-end group"
          >
            <span>View All {techBlogPosts.length} Handbooks</span>
            <div className="w-6 h-6 rounded-full bg-[#f3843f] text-white flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-white group-hover:text-[#0b382d] transition-all">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </Link>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-10 max-w-6xl mx-auto">
          {HOME_CATEGORIES.map((cat) => {
            const isSelected = activeTab === cat.label || (activeTab === "all" && cat.filter === "all");
            return (
              <button
                key={cat.label}
                onClick={() => setActiveTab(cat.filter === "all" ? "all" : cat.label)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-[#0b382d] text-white shadow-md scale-[1.02]"
                    : "bg-white/80 hover:bg-white text-stone-600 hover:text-stone-900 border border-stone-200/70"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* 6 Articles Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 max-w-6xl mx-auto">
          {displayPosts.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-[30px] overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group"
            >
              {/* Image Container with Rounded Corners */}
              <Link
                href={`/blog/${post.slug}`}
                className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900 p-2.5 pb-0 block"
              >
                <div className="relative w-full h-full rounded-[22px] overflow-hidden bg-stone-800">
                  <Image
                    src={post.heroImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
                {/* Category Pill Tag */}
                <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#093c33] shadow-sm flex items-center gap-1.5 border border-stone-200/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f3843f]" />
                  <span>{post.category}</span>
                </div>
              </Link>

              {/* Content Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  {/* Meta: Date & Read Time */}
                  <div className="flex items-center gap-3 text-[11px] text-stone-400 mb-3">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-[#f3843f]" />
                      {post.date}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-[#f3843f]" />
                      {post.readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-base sm:text-lg font-bold text-[#111827] group-hover:text-[#f3843f] transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>

                  {/* Subtitle / Description */}
                  <p className="mt-2.5 text-xs text-stone-500 leading-relaxed line-clamp-3">
                    {post.subtitle || post.summary}
                  </p>

                  {/* Tags */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer: Author & Action Button */}
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      width={28}
                      height={28}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-600/30"
                    />
                    <div>
                      <h4 className="text-[11px] font-bold text-stone-800 line-clamp-1">
                        {post.author.name}
                      </h4>
                      <p className="text-[10px] text-stone-400">
                        {post.author.company}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <LikeButton
                      id={`home-blog-${post.slug}`}
                      initialLikes={post.likes}
                      variant="badge"
                    />
                    <Link
                      href={`/blog/${post.slug}`}
                      aria-label={`Read ${post.title}`}
                      className="w-7 h-7 rounded-full bg-[#0b382d] text-white flex items-center justify-center shadow-xs group-hover:bg-[#f3843f] group-hover:scale-110 transition-all"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Banner Strip */}
        <div className="mt-14 max-w-6xl mx-auto rounded-3xl bg-gradient-to-r from-[#0b382d] via-emerald-900 to-[#07241d] p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold uppercase tracking-wider text-[#f3843f]">
              <BookOpen className="w-4 h-4" />
              <span>Full Free Access • No Paywall</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold">
              Want the high-resolution architectural diagrams &amp; code templates?
            </h3>
            <p className="text-xs text-emerald-200/80 max-w-xl">
              All 9 engineering handbooks come with companion downloadable PDF blueprints and GitHub open-source repositories.
            </p>
          </div>
          <Link
            href="/blog"
            className="px-6 py-3 rounded-full bg-[#f3843f] hover:bg-[#e0732f] text-white font-bold text-xs sm:text-sm shadow-md transition-all shrink-0 active:scale-95"
          >
            Explore Complete Knowledge Hub
          </Link>
        </div>
      </div>
    </section>
  );
}
