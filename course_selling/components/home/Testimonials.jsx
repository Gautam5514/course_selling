"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { api } from "@/lib/api";

/** Only real reviews written by students on the reader pages are shown.
 *  While there are none, the whole section stays hidden. */

// Hand-drawn 5-point outline star
function DoodleStarOutline({ className = "w-6 h-6 text-white" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}

// 3 white tilted doodle rays above "That"
function TitleRaysDoodle({ className = "w-6 h-6 text-white" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={className}
    >
      <path d="M6 18L10 12" />
      <path d="M12 18L14 10" />
      <path d="M18 16L20 12" />
    </svg>
  );
}

function fromReview(r) {
  return {
    id: r.id,
    name: r.name,
    role: r.note ? `Reviewed ${r.note.title}` : "Student",
    href: r.note ? `/pdf/${r.note.slug}` : null,
    rating: r.rating,
    initials: r.name.trim().slice(0, 1).toUpperCase(),
    text: r.review,
  };
}

export default function Testimonials() {
  const [reviews, setReviews] = useState(null);

  useEffect(() => {
    let active = true;
    api
      .getLatestReviews(9)
      .then(({ data }) => active && setReviews(data.map(fromReview)))
      .catch(() => active && setReviews([]));
    return () => {
      active = false;
    };
  }, []);

  const testimonials = reviews ?? [];
  if (testimonials.length === 0) return null; // nothing fake, nothing empty

  return (
    <section id="reviews" className="py-20 sm:py-28 bg-[#faf7f2] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Large Rounded Container with Dark Green Background */}
        <div className="relative rounded-[36px] sm:rounded-[48px] bg-[#09342b] p-8 sm:p-14 lg:p-16 overflow-hidden text-white shadow-2xl">
          {/* Subtle Geometric Mosaic Grid Background */}
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
              backgroundSize: "44px 44px",
            }}
          />

          {/* Floating Doodle Star 1 (Left below subtitle) */}
          <div className="absolute top-44 left-10 sm:left-20 pointer-events-none -rotate-12 opacity-90 hidden sm:block">
            <DoodleStarOutline className="w-6 h-6 text-white" />
          </div>

          {/* Floating Doodle Star 2 (Right of heading) */}
          <div className="absolute top-28 right-12 sm:right-28 pointer-events-none rotate-12 opacity-90 hidden sm:block">
            <DoodleStarOutline className="w-5 h-5 text-white" />
          </div>

          {/* Heading */}
          <div className="text-center max-w-3xl mx-auto mb-14 relative z-10">
            <div className="inline-block relative">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                Testimonials That
                <br />
                Speak to <span className="text-[#ea580c]">Real Results</span>
              </h2>

              {/* Title 3 Rays Doodle */}
              <div className="absolute -top-3.5 right-6 sm:right-10 pointer-events-none">
                <TitleRaysDoodle className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Subtitle */}
            <p className="mt-5 text-xs sm:text-[13px] text-emerald-100/75 leading-relaxed max-w-xl mx-auto font-normal">
              Real reviews from students reading our notes. Every review here was written on the notes page after signing in.
            </p>
          </div>

          {/* Testimonial Cards Row (scrolls sideways when there are many) */}
          <div className="relative z-10 flex items-stretch gap-5 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none max-w-6xl mx-auto -mx-4 sm:mx-auto px-4 pb-2 justify-start md:justify-center">
            {testimonials.map((item, idx) => (
              <div
                key={item.id ?? idx}
                className="snap-center rounded-[26px] bg-[#124237]/90 border border-emerald-700/30 p-6 sm:p-7 flex flex-col justify-between shrink-0 w-[300px] sm:w-[360px] shadow-2xl ring-1 ring-white/10"
              >
                <div>
                  {/* Top Row: Avatar + Name/Role on Left, Big Quote Icon on Right */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#f3843f] to-[#d96e2b] text-white text-sm font-extrabold flex items-center justify-center ring-2 ring-emerald-500/30 shrink-0">
                        {item.initials}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm sm:text-base font-bold text-white leading-snug truncate">{item.name}</h4>
                        {item.href ? (
                          <Link href={item.href} className="block text-xs text-emerald-200/60 font-medium hover:text-[#f3843f] truncate">
                            {item.role}
                          </Link>
                        ) : (
                          <p className="text-xs text-emerald-200/60 font-medium truncate">{item.role}</p>
                        )}
                      </div>
                    </div>

                    {/* Big Translucent Quotation Mark */}
                    <span className="text-4xl sm:text-5xl font-serif text-white/10 select-none leading-none -mt-2">
                      &rdquo;
                    </span>
                  </div>

                  {/* Stars Row + Rating Score */}
                  <div className="flex items-center gap-2 mb-3.5">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={`w-3.5 h-3.5 ${n <= Math.round(Number(item.rating)) ? "fill-current text-[#ea580c]" : "text-white/20"}`} />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-white ml-0.5">{Number(item.rating).toFixed(1)}</span>
                    <span className="ml-1 px-1.5 py-0.5 rounded-md bg-white/10 text-[9px] font-extrabold uppercase tracking-wider text-emerald-100/80">Verified student</span>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-[13px] text-emerald-100/80 leading-relaxed font-normal whitespace-pre-line line-clamp-6">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
