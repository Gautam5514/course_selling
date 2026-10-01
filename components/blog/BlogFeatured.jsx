"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Calendar, Clock } from "lucide-react";

export default function BlogFeatured() {
  return (
    <section className="py-14 sm:py-16 bg-[#faf7f2] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[36px] bg-white border border-stone-200/90 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 group">
          {/* Left: Image Container */}
          <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto min-h-[320px] bg-stone-100 overflow-hidden">
            <Image
              src="/images/blog-1.jpg"
              alt="Hands coding on modern laptop"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 1024px) 100vw, 650px"
            />
            <div className="absolute top-5 left-5 bg-[#f3843f] text-white px-3.5 py-1 rounded-full text-xs font-bold shadow-md">
              Featured Editorial
            </div>
          </div>

          {/* Right: Content */}
          <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 text-xs text-stone-400 mb-4">
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#f3843f]" />
                  Oct 01, 2025
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#f3843f]" />
                  8 min read
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] group-hover:text-[#f3843f] transition-colors leading-tight">
                The Full-Stack Renaissance: Why Server Components Are Changing Everything
              </h2>

              <p className="mt-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
                An architectural breakdown of Next.js Turbopack, React 19, and how streaming server components eliminate state sync overhead for real-time applications.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/classroom-sunny.jpg"
                  alt="Sunny Marwah"
                  width={38}
                  height={38}
                  unoptimized
                  className="rounded-full object-cover ring-2 ring-emerald-600/30"
                />
                <div>
                  <h4 className="text-xs font-bold text-stone-900">
                    Sunny Marwah
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Lead Curriculum Architect
                  </p>
                </div>
              </div>

              <Link
                href="#article-featured"
                className="w-10 h-10 rounded-full bg-[#093c33] text-white flex items-center justify-center group-hover:bg-[#f3843f] transition-colors shadow-sm"
              >
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
