"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Calendar, Clock, Sparkles } from "lucide-react";
import { LeftEdgeConcentricRings, StarburstDoodle } from "@/components/DecorativeShapes";
import LikeButton from "@/components/LikeButton";
import { techBlogPosts } from "@/data/blogsData";

export default function BlogGrid({ activeCategory, searchQuery }) {
  const filtered = techBlogPosts.filter((a) => {
    const matchesCat =
      activeCategory === "All Articles" ||
      activeCategory === "All Topics" ||
      a.category === activeCategory;

    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      query === "" ||
      a.title.toLowerCase().includes(query) ||
      a.subtitle.toLowerCase().includes(query) ||
      a.summary.toLowerCase().includes(query) ||
      a.tags.some((tag) => tag.toLowerCase().includes(query));

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
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#f3843f]">
              Peer-Reviewed Handbooks
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mt-1">
              Latest Technical Deep Dives
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-stone-500">
            Showing <span className="text-[#093c33] font-bold">{filtered.length}</span> handbooks
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-[#faf7f2] rounded-3xl p-8 border border-stone-200">
            <p className="text-sm font-semibold text-stone-600">
              No technical guides found matching &quot;{searchQuery}&quot;. Try adjusting your search query or category filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((item) => (
              <article
                key={item.slug}
                className="bg-[#fcf8f2] rounded-[32px] overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group"
              >
                {/* Image */}
                <Link
                  href={`/blog/${item.slug}`}
                  className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900 p-2.5 pb-0 block"
                >
                  <div className="relative w-full h-full rounded-[24px] overflow-hidden bg-stone-800">
                    <Image
                      src={item.heroImage}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                    />
                  </div>
                  <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#093c33] shadow-sm flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-[#f3843f]" />
                    <span>{item.category}</span>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-[11px] text-stone-400 mb-2.5">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-[#f3843f]" />
                        {item.date}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-[#f3843f]" />
                        {item.readTime}
                      </span>
                    </div>

                    <Link href={`/blog/${item.slug}`}>
                      <h3 className="text-base sm:text-lg font-bold text-[#111827] group-hover:text-[#f3843f] transition-colors leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                    </Link>

                    <p className="mt-2 text-xs text-stone-500 leading-relaxed line-clamp-3">
                      {item.subtitle}
                    </p>

                    {/* Tag Pills */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-stone-200/60 text-stone-600 text-[10px] font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-200/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.author.avatar}
                        alt={item.author.name}
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-600/30"
                      />
                      <span className="text-[11px] font-semibold text-stone-700">
                        {item.author.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <LikeButton
                        id={`card-${item.slug}`}
                        initialLikes={item.likes}
                        variant="badge"
                      />
                      <Link
                        href={`/blog/${item.slug}`}
                        className="flex items-center gap-1 text-xs font-bold text-[#093c33] group-hover:text-[#f3843f] transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-[#093c33] text-white flex items-center justify-center shadow-xs group-hover:bg-[#f3843f] group-hover:scale-110 transition-all">
                          <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                        </div>
                      </Link>
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
