"use client";

import { Target, Users, Zap, ShieldCheck } from "lucide-react";
import { LeftEdgeConcentricRings } from "@/components/DecorativeShapes";

export default function AboutMission() {
  const values = [
    {
      title: "Real-World Over Theory",
      description:
        "Every lesson culminates in a portfolio-ready build. You learn by doing, debugging, and deploying like an engineer.",
      icon: Zap,
      badgeBg: "bg-[#093c33] text-white",
      highlight: true,
    },
    {
      title: "Human Mentorship First",
      description:
        "Algorithms can't replace the insight of a seasoned engineer. Direct feedback turns roadblocks into breakthroughs.",
      icon: Users,
      badgeBg: "bg-[#f3843f] text-white",
      highlight: false,
    },
    {
      title: "Outcome-Driven Curriculum",
      description:
        "We continuously update our course materials in real-time alongside industry trends, frameworks, and job requirements.",
      icon: Target,
      badgeBg: "bg-[#2563eb] text-white",
      highlight: false,
    },
    {
      title: "Accessible & Uncompromising",
      description:
        "Top-tier educational engineering shouldn't cost tens of thousands. We make Ivy-league level vocational training accessible to all.",
      icon: ShieldCheck,
      badgeBg: "bg-[#16a34a] text-white",
      highlight: false,
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#faf7f2] relative overflow-hidden">
      {/* Decorative Concentric Rings */}
      <div className="absolute top-12 sm:top-16 left-0 opacity-70 pointer-events-none hidden md:block">
        <LeftEdgeConcentricRings className="w-24 h-44 sm:w-28 sm:h-52 text-[#ea8a42]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-20 sm:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#093c33]/10 text-xs font-semibold text-[#093c33] mb-3">
            What Drives Us
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111827]">
            Our Core <span className="text-[#f3843f]">Principles</span>
          </h2>
          <p className="mt-3 text-sm text-stone-600 leading-relaxed">
            The foundation of everything we build, design, and teach at helloS.
          </p>
        </div>

        {/* 2x2 Values Grid with Overlapping Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-8 max-w-5xl mx-auto">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div
                key={i}
                className={`relative rounded-3xl p-8 pt-10 transition-all duration-300 ${
                  v.highlight
                    ? "bg-[#093c33] text-white shadow-xl shadow-emerald-950/15"
                    : "bg-white text-stone-900 border border-stone-200/90 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Overlapping Badge */}
                <div
                  className={`absolute -top-6 left-8 w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${v.badgeBg}`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <h3
                  className={`text-xl font-bold tracking-tight mb-3 ${
                    v.highlight ? "text-white" : "text-[#111827]"
                  }`}
                >
                  {v.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    v.highlight ? "text-emerald-100/80" : "text-stone-600"
                  }`}
                >
                  {v.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
