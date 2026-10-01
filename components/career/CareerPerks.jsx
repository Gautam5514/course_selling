"use client";

import { Globe, DollarSign, BookOpen, Plane, HeartPulse, Laptop } from "lucide-react";
import { LeftEdgeConcentricRings } from "@/components/DecorativeShapes";

export default function CareerPerks() {
  const perks = [
    {
      title: "100% Remote & Async-First",
      description: "Work from wherever you are happiest and most productive. We value thoughtful output over desk hours.",
      icon: Globe,
      badgeBg: "bg-[#093c33] text-white",
      highlight: true,
    },
    {
      title: "Competitive Pay & Equity",
      description: "Industry-leading global salaries benchmarked against top tech hubs, paired with meaningful ownership.",
      icon: DollarSign,
      badgeBg: "bg-[#f3843f] text-white",
      highlight: false,
    },
    {
      title: "Unlimited Learning Stipend",
      description: "$2,500 annual budget for books, courses, coaching, and conferences to accelerate your personal mastery.",
      icon: BookOpen,
      badgeBg: "bg-[#2563eb] text-white",
      highlight: false,
    },
    {
      title: "Comprehensive Health & Wellness",
      description: "Top-tier health, dental, and vision insurance plus monthly fitness and mental health stipends.",
      icon: HeartPulse,
      badgeBg: "bg-[#16a34a] text-white",
      highlight: false,
    },
    {
      title: "Latest Home Office Gear",
      description: "Top-of-the-line MacBook Pro, 4K monitor, ergonomic chair, and high-speed internet reimbursement.",
      icon: Laptop,
      badgeBg: "bg-[#84cc16] text-white",
      highlight: false,
    },
    {
      title: "Bi-Annual Global Retreats",
      description: "We bring the entire global team together twice a year in inspiring destinations worldwide for hackathons & fun.",
      icon: Plane,
      badgeBg: "bg-[#ea580c] text-white",
      highlight: false,
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#faf7f2] relative overflow-hidden">
      {/* Decorative Rings */}
      <div className="absolute top-12 sm:top-16 left-0 opacity-70 pointer-events-none hidden md:block">
        <LeftEdgeConcentricRings className="w-24 h-44 sm:w-28 sm:h-52 text-[#ea8a42]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-20 sm:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#093c33]/10 text-xs font-semibold text-[#093c33] mb-3">
            Life at helloS
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111827]">
            Perks &amp; Benefits
          </h2>
          <p className="mt-3 text-sm text-stone-600 leading-relaxed">
            We take exceptional care of our team so you can do the most meaningful work of your life.
          </p>
        </div>

        {/* 3x2 Grid with Overlapping Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8 max-w-6xl mx-auto">
          {perks.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className={`relative rounded-3xl p-8 pt-10 transition-all duration-300 ${
                  p.highlight
                    ? "bg-[#093c33] text-white shadow-xl shadow-emerald-950/15"
                    : "bg-white text-stone-900 border border-stone-200/90 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Overlapping Badge */}
                <div
                  className={`absolute -top-6 left-8 w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${p.badgeBg}`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <h3
                  className={`text-xl font-bold tracking-tight mb-3 ${
                    p.highlight ? "text-white" : "text-[#111827]"
                  }`}
                >
                  {p.title}
                </h3>
                <p
                  className={`text-xs sm:text-[13px] leading-relaxed ${
                    p.highlight ? "text-emerald-100/80" : "text-stone-600"
                  }`}
                >
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
