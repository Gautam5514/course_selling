"use client";

import {
  FileText,
  Code2,
  Heart,
  Sparkles,
  Layers,
  TrendingUp,
} from "lucide-react";

export default function Benefits() {
  const benefits = [
    {
      title: "100% Free Open Access",
      description:
        "Zero tuition fees, no subscriptions, and no paywalls. Premium developer education open to everyone globally.",
      badgeBg: "bg-white border-2 border-[#111827] text-[#111827]",
      icon: Sparkles,
      isHighlighted: true,
    },
    {
      title: "Comprehensive PDF Handbooks",
      description:
        "Download 80+ page technical guides, system design formulas, and architecture cheatsheets to study offline.",
      badgeBg: "bg-[#f39148] text-white",
      icon: FileText,
      isHighlighted: false,
    },
    {
      title: "Production Capstone Projects",
      description:
        "Full-stack SaaS apps, autonomous AI agents, and mobile codebases with complete GitHub repos and live demos.",
      badgeBg: "bg-[#2563eb] text-white",
      icon: Code2,
      isHighlighted: false,
    },
    {
      title: "Community Like & Bookmark",
      description:
        "Save your favorite handbooks and projects with real-time like counts and locally persisted favorites.",
      badgeBg: "bg-[#22c55e] text-white",
      icon: Heart,
      isHighlighted: false,
    },
    {
      title: "Modern 2025/2026 Tech Stacks",
      description:
        "Next.js 16 App Router, React 19 Server Components, LangGraph multi-agents, Tailwind, and AWS EKS.",
      badgeBg: "bg-[#84cc16] text-white",
      icon: Layers,
      isHighlighted: false,
    },
    {
      title: "Portfolio & Career Ready",
      description:
        "Permissively licensed codebases that you can customize and showcase in your GitHub portfolio and interviews.",
      badgeBg: "bg-[#ea580c] text-white",
      icon: TrendingUp,
      isHighlighted: false,
    },
  ];

  return (
    <section id="benefits" className="py-20 sm:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-20 sm:mb-24">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111827]">
            Why Developers Choose <span className="text-[#f3843f]">helloS</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-600">
            A free developer resource hub built for practical builders: high-value PDF notes and open projects.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-[32px] bg-[#faf7f2] border border-stone-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-xs ${item.badgeBg}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-bold text-stone-900 group-hover:text-[#f3843f] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
