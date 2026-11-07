"use client";

import Link from "next/link";
import { Check, Sparkles, FileText, Code2, Heart, ArrowRight } from "lucide-react";
import { LeftEdgeConcentricRings } from "@/components/DecorativeShapes";

export default function PricingPlans() {
  const pillars = [
    {
      name: "PDF Handbooks & Cheatsheets",
      icon: FileText,
      tagline: "In-depth multi-chapter study guides, formulas, and architecture blueprints.",
      price: "$0",
      period: "Forever Free",
      isPopular: false,
      buttonText: "Browse All PDF Notes",
      buttonHref: "/pdf-notes",
      buttonStyle: "bg-[#093c33]/10 text-[#093c33] hover:bg-[#093c33]/20",
      cardBg: "bg-white border-stone-300 text-stone-900",
      features: [
        "Downloadable 80+ page technical handbooks",
        "React 19, Next.js 16, & AI SDK architecture notes",
        "High-scale system design back-of-the-envelope cheatsheets",
        "Read online in browser or save offline PDFs",
        "Zero sign-up barrier or payment required",
      ],
    },
    {
      name: "Open Capstone Projects",
      icon: Code2,
      tagline: "Production-ready GitHub repositories with live interactive demos.",
      price: "$0",
      period: "Forever Free",
      isPopular: true,
      buttonText: "Explore Projects Hub",
      buttonHref: "/projects",
      buttonStyle: "bg-[#f3843f] text-white hover:bg-[#e0732f] shadow-lg shadow-orange-950/20",
      cardBg: "bg-[#093c33] border-emerald-700/60 text-white shadow-2xl ring-2 ring-[#f3843f]/50",
      features: [
        "Complete TypeScript & Python source code repos",
        "Pre-seeded database migrations & schemas",
        "Live interactive demo deployments",
        "Docker container setups & CI/CD workflows",
        "100% permissively licensed for your portfolio",
        "Community Like ❤️ and bookmark counters",
      ],
    },
    {
      name: "Developer Community & Learning Paths",
      icon: Heart,
      tagline: "Curated learning paths across Web, AI, Design Systems, and Cloud DevOps.",
      price: "$0",
      period: "Forever Free",
      isPopular: false,
      buttonText: "View Learning Tracks",
      buttonHref: "/courses",
      buttonStyle: "bg-[#093c33] text-white hover:bg-[#072d26] shadow-md",
      cardBg: "bg-white border-stone-300 text-stone-900",
      features: [
        "5 comprehensive career track curricula",
        "Week-by-week module breakdowns and deliverables",
        "Interactive Like button with local persistence",
        "Direct email updates for new PDF releases",
        "Accessible to developers and students worldwide",
      ],
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#faf7f2] relative overflow-hidden">
      {/* Decorative Wavy Element Left */}
      <div className="absolute top-16 left-0 opacity-70 pointer-events-none hidden lg:block">
        <LeftEdgeConcentricRings className="w-24 h-48 text-[#093c33]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#093c33] bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200">
            Open-Access Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-3">
            Everything is 100% Free
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-600">
            No tiered subscriptions or locked modules. Explore all three pillars of our educational platform.
          </p>
        </div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {pillars.map((plan, idx) => {
            const Icon = plan.icon;
            return (
              <div
                key={idx}
                className={`relative rounded-[32px] p-8 sm:p-9 flex flex-col justify-between border transition-all duration-300 ${
                  plan.cardBg
                } ${plan.isPopular ? "md:-translate-y-3" : "hover:-translate-y-1.5"}`}
              >
                {/* Popular Pill */}
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#f3843f] text-white text-[11px] font-bold px-4 py-1 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-current" />
                    <span>Developer Favorite</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                        plan.isPopular
                          ? "bg-white/10 text-[#f3843f]"
                          : "bg-[#093c33]/10 text-[#093c33]"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        plan.isPopular
                          ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/20"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-100"
                      }`}
                    >
                      {plan.period}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold leading-tight">
                    {plan.name}
                  </h3>
                  <p
                    className={`mt-2 text-xs sm:text-sm leading-relaxed ${
                      plan.isPopular ? "text-emerald-100/75" : "text-stone-600"
                    }`}
                  >
                    {plan.tagline}
                  </p>

                  {/* Price Tag */}
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                      {plan.price}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        plan.isPopular ? "text-emerald-200/70" : "text-stone-500"
                      }`}
                    >
                      No Credit Card Ever
                    </span>
                  </div>

                  {/* Features List */}
                  <ul className="mt-7 space-y-3 text-xs sm:text-sm">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            plan.isPopular
                              ? "bg-emerald-500/30 text-emerald-300"
                              : "bg-emerald-100 text-[#093c33]"
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span
                          className={
                            plan.isPopular ? "text-emerald-100/90" : "text-stone-700"
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action CTA Button */}
                <div className="mt-8 pt-4 border-t border-stone-200/20">
                  <Link
                    href={plan.buttonHref}
                    className={`w-full py-3.5 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${plan.buttonStyle}`}
                  >
                    <span>{plan.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
