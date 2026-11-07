"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Calendar, Clock, Sparkles } from "lucide-react";
import LikeButton from "@/components/LikeButton";
import { techBlogPosts } from "@/data/blogsData";

export default function BlogFeatured() {
  const featured = techBlogPosts[0]; // Next.js 16 & React 19 Architecture Guide

  if (!featured) return null;

  return (
    <section className="py-14 sm:py-16 bg-[#faf7f2] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[36px] bg-white border border-stone-200/90 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 group">
          {/* Left: Image Container */}
          <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto min-h-[320px] bg-stone-900 overflow-hidden">
            <Image
              src={featured.heroImage}
              alt={featured.title}
              fill
              priority
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 1024px) 100vw, 680px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-5 left-5 bg-[#0b382d] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#f3843f]" />
              <span>Featured Architecture Handbook</span>
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
            </div>

            <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={featured.author.avatar}
                  alt={featured.author.name}
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
