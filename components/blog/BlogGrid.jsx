"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Calendar, Clock } from "lucide-react";
import { LeftEdgeConcentricRings, StarburstDoodle } from "@/components/DecorativeShapes";

export default function BlogGrid({ activeCategory, searchQuery }) {
  const articles = [
    {
      category: "Career Tips",
      title: "Learning with Games? Why Gamified Learning Works in 2025",
      desc: "Embrace the joy of game loops to dramatically enhance technical retention and problem solving speed.",
      image: "/images/blog-yellow-sweater.jpg",
      date: "Sep 28, 2025",
      readTime: "4 min read",
      author: "Helen Mentari",
      authorImage: "/images/classroom-helen.jpg",
    },
    {
      category: "UI/UX Design",
      title: "10 Interactive UI Game Ideas for Design Systems",
      desc: "Tactical exercises and micro-challenges to sharpen your component typography and layout hierarchy instincts.",
      image: "/images/blog-2.jpg",
      date: "Sep 24, 2025",
      readTime: "6 min read",
      author: "Natasha Sunny",
      authorImage: "/images/classroom-tutor-natasha.jpg",
    },
    {
      category: "Engineering",
      title: "Mastering Real-Time Virtual Classrooms with WebRTC",
      desc: "Under the hood: How peer-to-peer data channels and audio mixers enable ultra-low latency interactive code pairing.",
      image: "/images/blog-3.jpg",
      date: "Sep 18, 2025",
      readTime: "7 min read",
      author: "Sunny Marwah",
      authorImage: "/images/classroom-sunny.jpg",
    },
    {
      category: "AI & Future",
      title: "Why Generative AI Will Never Replace Senior Product Taste",
      desc: "Exploring why high-judgment synthesis, edge case empathy, and brand voice remain purely human advantages.",
      image: "/images/instructor-duo.jpg",
      date: "Sep 12, 2025",
      readTime: "5 min read",
      author: "Jayesh Patil",
      authorImage: "/images/jayesh-patil.jpg",
    },
    {
      category: "Career Tips",
      title: "From Self-Taught to $150K: The 6-Month Apprenticeship Blueprint",
      desc: "Step-by-step roadmap of how our graduates build 3 production systems to bypass gatekeeping recruiters.",
      image: "/images/hero-students.jpg",
      date: "Sep 06, 2025",
      readTime: "9 min read",
      author: "Helen Mentari",
      authorImage: "/images/classroom-helen.jpg",
    },
    {
      category: "UI/UX Design",
      title: "Figma Variables & Token Synchronization for Engineers",
      desc: "Bridging the gap between designer tokens in Figma and Tailwind CSS theme config files seamlessly.",
      image: "/images/classroom-syarifah.jpg",
      date: "Aug 30, 2025",
      readTime: "5 min read",
      author: "Syarifah Hinata",
      authorImage: "/images/classroom-syarifah.jpg",
    },
  ];

  const filtered = articles.filter((a) => {
    const matchesCat =
      activeCategory === "All Topics" || a.category === activeCategory;
    const matchesQuery =
      searchQuery === "" ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <section className="py-16 sm:py-20 bg-white relative overflow-hidden">
      {/* Decorative Rings */}
      <div className="absolute top-12 sm:top-16 left-0 opacity-80 pointer-events-none hidden md:block">
        <LeftEdgeConcentricRings className="w-24 h-44 sm:w-28 sm:h-52 text-[#094e46]" />
      </div>

      {/* Decorative Starburst */}
      <div className="absolute bottom-12 right-12 opacity-80 pointer-events-none hidden sm:block">
        <StarburstDoodle className="w-20 h-20 text-[#f59853]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-center justify-between">
          <p className="text-xs sm:text-sm font-semibold text-stone-500">
            Showing <span className="text-[#093c33] font-bold">{filtered.length}</span> articles
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-[#faf7f2] rounded-3xl p-8">
            <p className="text-sm font-semibold text-stone-600">
              No articles found matching your criteria. Try adjusting your search query or category filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((item, idx) => (
              <article
                key={idx}
                className="bg-[#fcf8f2] rounded-[32px] overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100 p-2.5 pb-0">
                  <div className="relative w-full h-full rounded-[24px] overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                    />
                  </div>
                  <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#093c33] shadow-sm">
                    {item.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-[11px] text-stone-400 mb-2.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#f3843f]" />
                        {item.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#f3843f]" />
                        {item.readTime}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[#111827] group-hover:text-[#f3843f] transition-colors leading-snug line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-xs text-stone-500 leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-200/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Image
                        src={item.authorImage}
                        alt={item.author}
                        width={24}
                        height={24}
                        unoptimized
                        className="rounded-full object-cover ring-1 ring-emerald-600/30"
                      />
                      <span className="text-[11px] font-semibold text-stone-700">
                        {item.author}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#f3843f]">
                      <span>Read</span>
                      <div className="w-5 h-5 rounded-full bg-[#f3843f] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
