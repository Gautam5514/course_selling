"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Calendar, Clock, Sparkles, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { LeftEdgeConcentricRings, StarburstDoodle } from "@/components/DecorativeShapes";
import LikeButton from "@/components/LikeButton";
import { techBlogPosts, blogSearchIndex } from "@/data/blogsData";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

export default function BlogGrid({ activeCategory, searchQuery }) {
  const [sortBy, setSortBy] = useState("latest"); // 'latest' | 'popular' | 'quick'
  const [selectedTag, setSelectedTag] = useState(null);

  const debouncedQuery = useDebouncedValue(searchQuery, 150);

  const filtered = useMemo(() => {
    const query = debouncedQuery.trim().toLowerCase();
    return techBlogPosts
    .filter((a) => {
      const matchesCat =
        activeCategory === "All Articles" ||
        activeCategory === "All Topics" ||
        a.category === activeCategory;

      const matchesQuery =
        query === "" ||
        blogSearchIndex.get(a.slug).fields.some((f) => f.includes(query));

      const matchesTag = !selectedTag || a.tags.includes(selectedTag);

      return matchesCat && matchesQuery && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === "popular") {
        return (b.likes || 0) - (a.likes || 0);
      }
      if (sortBy === "quick") {
        return blogSearchIndex.get(a.slug).minutes - blogSearchIndex.get(b.slug).minutes;
      }
      // default: latest (preserve original curated order or date)
      return 0;
    });
  }, [activeCategory, debouncedQuery, selectedTag, sortBy]);

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
        {/* Controls Bar: Heading, Tag Filters, Sort */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f3843f]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#f3843f]">
                Peer-Reviewed Handbooks
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mt-1">
              Latest Technical Deep Dives
            </h2>
            {selectedTag && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-stone-500">Filtered by tag:</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  #{selectedTag}
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="ml-1 hover:text-red-500 font-bold"
                  >
                    ×
                  </button>
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 self-start md:self-auto">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-[#faf7f2] border border-stone-200 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#f3843f]" />
              <span className="text-stone-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-bold text-[#0b382d] focus:outline-none cursor-pointer"
              >
                <option value="latest">Curated / Latest</option>
                <option value="popular">Most Popular</option>
                <option value="quick">Fastest Read</option>
              </select>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-stone-500 whitespace-nowrap">
              Showing <span className="text-[#093c33] font-bold">{filtered.length}</span> handbooks
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-[#faf7f2] rounded-3xl p-8 border border-stone-200">
            <Sparkles className="w-8 h-8 text-[#f3843f] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-900 mb-2">No Matching Handbooks Found</h3>
            <p className="text-sm font-medium text-stone-600 max-w-md mx-auto mb-6">
              No technical guides found matching your active filters. Try adjusting your query, clearing tag filters, or resetting category selections.
            </p>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="px-4 py-2 rounded-full bg-[#0b382d] text-white text-xs font-bold hover:bg-[#f3843f] transition-colors"
              >
                Clear Tag Filter
              </button>
            )}
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  </div>
                  <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#093c33] shadow-sm flex items-center gap-1.5 border border-stone-200/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f3843f]" />
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
                      <span className="text-stone-300">•</span>
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
                      {item.subtitle || item.summary}
                    </p>

                    {/* Tag Pills (Clickable for quick filtering) */}
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {item.tags.slice(0, 3).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${
                            selectedTag === tag
                              ? "bg-emerald-800 text-white"
                              : "bg-stone-200/60 hover:bg-stone-300/80 text-stone-600"
                          }`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-200/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Image
                        src={item.author.avatar}
                        alt={item.author.name}
                        width={28}
                        height={28}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-600/30"
                      />
                      <div>
                        <span className="text-[11px] font-bold text-stone-800 line-clamp-1">
                          {item.author.name}
                        </span>
                        <p className="text-[10px] text-stone-400">
                          {item.author.company}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <LikeButton
                        id={`card-${item.slug}`}
                        initialLikes={item.likes}
                        variant="badge"
                      />
                      <Link
                        href={`/blog/${item.slug}`}
                        aria-label={`Read ${item.title}`}
                        className="w-7 h-7 rounded-full bg-[#093c33] text-white flex items-center justify-center shadow-xs group-hover:bg-[#f3843f] group-hover:scale-110 transition-all"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
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
