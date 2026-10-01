"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LeftEdgeConcentricRings, StarburstDoodle } from "@/components/DecorativeShapes";

export default function BlogInsights() {
  const articles = [
    {
      title: "The 2025 AI Engineer Roadmap: Prompting to Agents",
      description: "Essential frameworks, vector databases, and multi-agent patterns reshaping software.",
      image: "/images/blog-yellow-sweater.jpg",
      href: "/blog",
    },
    {
      title: "From Figma to React: Building Production Token Systems",
      description: "How modern product teams eliminate design drift and sync multi-brand tokens automatically.",
      image: "/images/blog-2.jpg",
      href: "/blog",
    },
    {
      title: "Cracking Senior Engineering System Design Interviews",
      description: "Battle-tested architectural strategies from FAANG leads to ace technical screenings.",
      image: "/images/blog-3.jpg",
      href: "/blog",
    },
  ];

  return (
    <section id="blog" className="py-20 sm:py-28 bg-white relative overflow-hidden">
      {/* Decorative Dark Teal Concentric Rings on Left Edge */}
      <div className="absolute top-12 sm:top-16 left-0 opacity-85 pointer-events-none hidden md:block">
        <LeftEdgeConcentricRings className="w-24 h-44 sm:w-28 sm:h-52 text-[#094e46]" />
      </div>

      {/* Decorative Warm Peach Starburst on Bottom Right */}
      <div className="absolute bottom-6 right-8 sm:right-16 pointer-events-none opacity-85 hidden sm:block">
        <StarburstDoodle className="w-20 h-20 text-[#f59853]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Title and "See All" */}
        <div className="flex items-end justify-between gap-6 mb-14 max-w-6xl mx-auto">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111827] leading-tight">
              Explore <span className="text-[#f3843f]">Insights</span> &
              <br />
              Expert Guides
            </h2>
          </div>

          {/* See All Button */}
          <Link
            href="/blog"
            className="flex items-center gap-2 group text-xs sm:text-sm font-semibold text-stone-600 hover:text-black transition-colors"
          >
            <span>See All</span>
            <div className="w-7 h-7 rounded-full bg-[#f3843f] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </Link>
        </div>

        {/* 3 Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {articles.map((item, idx) => (
            <article
              key={idx}
              className="bg-[#fcf8f2]/70 rounded-[28px] sm:rounded-[32px] overflow-hidden border border-stone-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group"
            >
              {/* Image Container with Rounded Corners */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100 p-2 sm:p-2.5 pb-0">
                <div className="relative w-full h-full rounded-[22px] sm:rounded-[26px] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                  />
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#111827] group-hover:text-[#f3843f] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-[13px] text-stone-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Learn More Action */}
                <div className="mt-6 pt-4 flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#f3843f]">
                    Learn more
                  </span>
                  <div className="w-6 h-6 rounded-full bg-[#f3843f] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
