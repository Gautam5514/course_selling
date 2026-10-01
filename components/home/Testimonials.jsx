"use client";

import Image from "next/image";
import { Star } from "lucide-react";

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

export default function Testimonials() {
  const testimonials = [
    {
      name: "Alex Rivera",
      role: "Senior Frontend Engineer, Stripe",
      rating: "5.0",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      text: "helloS took me from struggling through disconnected tutorials to confidently architecting production Next.js apps. Within 90 days of graduating, I landed a Senior Frontend role at Stripe with a 65% salary bump!",
    },
    {
      name: "Maya Patel",
      role: "Lead Product Designer, Figma",
      rating: "5.0",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
      text: "The live Figma design system critiques with Natasha were better than an entire master's degree. Having senior mentors review every token helped me transition smoothly into a Lead Product Designer position.",
    },
    {
      name: "Marcus Chen",
      role: "AI Systems Engineer, Microsoft",
      rating: "5.0",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      text: "Most courses teach outdated demos. helloS's Generative AI curriculum covers actual production RAG, vector indexes, and multi-agent systems. The capstone project directly impressed my hiring team at Microsoft.",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#faf7f2] relative">
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
              Over 48,000 ambitious engineers and designers have accelerated their careers on helloS. Here is how our alumni landed roles at world-class tech companies.
            </p>
          </div>

          {/* Testimonial Cards Carousel Row */}
          <div className="relative z-10 flex items-stretch justify-center gap-6 overflow-hidden max-w-6xl mx-auto -mx-4 sm:mx-auto px-4">
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                className={`rounded-[26px] bg-[#124237]/90 border border-emerald-700/30 p-6 sm:p-7 flex flex-col justify-between shrink-0 transition-all duration-300 ${
                  idx === 1
                    ? "w-[310px] sm:w-[380px] shadow-2xl ring-1 ring-white/10"
                    : "w-[280px] sm:w-[350px] opacity-75 hidden md:flex"
                }`}
              >
                <div>
                  {/* Top Row: Avatar + Name/Role on Left, Big Quote Icon on Right */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={item.avatar}
                        alt={item.name}
                        width={42}
                        height={42}
                        unoptimized
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-emerald-500/30"
                      />
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                          {item.name}
                        </h4>
                        <p className="text-xs text-emerald-200/60 font-medium">
                          {item.role}
                        </p>
                      </div>
                    </div>

                    {/* Big Translucent Quotation Mark */}
                    <span className="text-4xl sm:text-5xl font-serif text-white/10 select-none leading-none -mt-2">
                      &rdquo;
                    </span>
                  </div>

                  {/* Stars Row + Rating Score */}
                  <div className="flex items-center gap-2 mb-3.5">
                    <div className="flex text-[#ea580c] gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-white ml-0.5">
                      {item.rating}
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-[13px] text-emerald-100/80 leading-relaxed font-normal">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
