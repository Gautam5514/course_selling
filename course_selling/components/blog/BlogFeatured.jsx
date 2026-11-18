"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Calendar, Clock, Sparkles, ChevronRight } from "lucide-react";
import LikeButton from "@/components/LikeButton";
import { techBlogPosts, postsBySlug } from "@/data/blogsData";

// Selected premier featured handbooks
const FEATURED_SLUGS = [
  "my-journey-building-fullstack-ai-research-gautam-pandit",
  "deepseek-v3-r1-architecture-mla-pure-rl",
  "model-context-protocol-mcp-ai-agent-architecture",
  "nextjs-16-react-19-architecture-guide",
];

export default function BlogFeatured() {
  const [selectedSlug, setSelectedSlug] = useState(FEATURED_SLUGS[0]);

  const featured =
    postsBySlug.get(selectedSlug) || techBlogPosts[0];

  if (!featured) return null;

  return (
    <section className="py-12 sm:py-16 bg-[#faf7f2] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Featured Selector Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f3843f]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Premier Architecture Showcases
            </h3>
          </div>

          {/* Quick Switch Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {FEATURED_SLUGS.map((slug) => {
              const post = postsBySlug.get(slug);
              if (!post) return null;
              const isSelected = post.slug === featured.slug;
              return (
                <button
                  key={slug}
                  onClick={() => setSelectedSlug(slug)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#0b382d] text-white shadow-xs"
                      : "bg-white text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  {post.tags[0] || post.category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Big Card */}
        <div className="rounded-[36px] bg-white border border-stone-200/90 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 group">
          {/* Left: Image Container */}
          <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto min-h-[340px] bg-stone-900 overflow-hidden">
            <Image
              src={featured.heroImage}
              alt={featured.title}
              fill
              priority
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 1024px) 100vw, 680px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-5 left-5 bg-[#0b382d]/95 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 border border-emerald-700/40">
              <Sparkles className="w-3 h-3 text-[#f3843f]" />
              <span>{featured.category} • Featured Blueprint</span>
            </div>
            <div className="absolute bottom-4 left-5 right-5 text-white/90 text-xs font-mono hidden sm:flex items-center justify-between pointer-events-none">
              <span>{featured.tags.slice(0, 3).map((t) => `#${t}`).join("  ")}</span>
              <span className="text-[#f3843f] font-semibold">100% Free Architecture</span>
            </div>
          </div>

          {/* Right: Content */}
          <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 text-xs text-stone-400 mb-4">
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#f3843f]" />
                  {featured.date}
                </span>
                <span className="text-stone-300">•</span>
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#f3843f]" />
                  {featured.readTime}
                </span>
              </div>

              <Link href={`/blog/${featured.slug}`}>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827] group-hover:text-[#f3843f] transition-colors leading-tight">
                  {featured.title}
                </h2>
              </Link>

              <p className="mt-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
                {featured.subtitle}
              </p>

              {/* Tags */}
              <div className="mt-5 flex flex-wrap gap-1.5">
                {featured.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-semibold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src={featured.author.avatar}
                  alt={featured.author.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-600/30"
                />
                <div>
                  <h4 className="text-xs font-bold text-stone-900">
                    {featured.author.name}
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    {featured.author.role} • {featured.author.company}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <LikeButton
                  id={`featured-${featured.slug}`}
                  initialLikes={featured.likes}
                  variant="badge"
                />
                <Link
                  href={`/blog/${featured.slug}`}
                  className="w-10 h-10 rounded-full bg-[#093c33] text-white flex items-center justify-center group-hover:bg-[#f3843f] transition-colors shadow-sm"
                  aria-label="Read featured article"
                >
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
