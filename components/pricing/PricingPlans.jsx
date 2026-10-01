"use client";

import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { LeftEdgeConcentricRings } from "@/components/DecorativeShapes";

export default function PricingPlans({ isAnnual }) {
  const plans = [
    {
      name: "Starter Explorer",
      tagline: "Ideal for beginners exploring coding & design foundations.",
      priceMonthly: "$0",
      priceAnnual: "$0",
      period: "Forever Free",
      isPopular: false,
      buttonText: "Get Started Free",
      buttonStyle: "bg-[#093c33]/10 text-[#093c33] hover:bg-[#093c33]/20",
      cardBg: "bg-white border-stone-300 text-stone-900",
      features: [
        "Access to 40+ introductory courses",
        "Community forum & peer study groups",
        "Public portfolio builder",
        "Interactive code playground",
      ],
    },
    {
      name: "Pro Learner",
      tagline: "Our most popular plan for students actively leveling up.",
      priceMonthly: "$29",
      priceAnnual: "$21",
      period: "per month, billed annually",
      isPopular: true,
      buttonText: "Start 14-Day Free Trial",
      buttonStyle: "bg-[#f3843f] text-white hover:bg-[#e0732f] shadow-lg shadow-orange-950/20",
      cardBg: "bg-[#093c33] border-emerald-700/60 text-white shadow-2xl ring-2 ring-[#f3843f]/50",
      features: [
        "Unlimited access to all 500+ masterclasses",
        "Weekly live virtual classroom sessions",
        "1-on-1 code reviews from senior mentors",
        "Official verifiable certificates & digital badges",
        "Downloadable project templates & source files",
        "Priority instructor Q&A in class",
      ],
    },
    {
      name: "Career Accelerator",
      tagline: "Complete end-to-end guidance to land your dream tech role.",
      priceMonthly: "$79",
      priceAnnual: "$59",
      period: "per month, billed annually",
      isPopular: false,
      buttonText: "Apply for Accelerator",
      buttonStyle: "bg-[#093c33] text-white hover:bg-[#072d26] shadow-md",
      cardBg: "bg-white border-stone-300 text-stone-900",
      features: [
        "Everything in Pro Learner included",
        "Dedicated personal career coach & mentor",
        "Tailored resume & LinkedIn profile overhaul",
        "3x realistic mock technical interviews",
        "Direct referral to hiring partner network",
        "Lifetime alumni network & private hackathons",
      ],
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#faf7f2] relative overflow-hidden">
      {/* Decorative Rings */}
      <div className="absolute top-12 sm:top-16 left-0 opacity-70 pointer-events-none hidden md:block">
        <LeftEdgeConcentricRings className="w-24 h-44 sm:w-28 sm:h-52 text-[#ea8a42]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-[32px] p-8 sm:p-9 flex flex-col justify-between border transition-all duration-300 ${plan.cardBg} ${
                plan.isPopular ? "lg:-translate-y-4" : "hover:-translate-y-1"
              }`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#f3843f] text-white text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-current" />
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-2xl font-bold tracking-tight">
                  {plan.name}
                </h3>
                <p
                  className={`mt-2 text-xs sm:text-sm leading-relaxed ${
                    plan.isPopular ? "text-emerald-100/75" : "text-stone-600"
                  }`}
                >
                  {plan.tagline}
                </p>

                {/* Price Display */}
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                    {isAnnual ? plan.priceAnnual : plan.priceMonthly}
                  </span>
                  <span
                    className={`text-xs ${
                      plan.isPopular ? "text-emerald-200/70" : "text-stone-500"
                    }`}
                  >
                    / month
                  </span>
                </div>
                <p
                  className={`text-[11px] mt-1 ${
                    plan.isPopular ? "text-emerald-200/60" : "text-stone-400"
                  }`}
                >
                  {isAnnual ? "Billed annually" : "Billed monthly"}
                </p>

                {/* Features List */}
                <ul className="mt-8 space-y-3.5 pt-6 border-t border-stone-200/40">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-[13px]">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          plan.isPopular
                            ? "bg-[#f3843f] text-white"
                            : "bg-[#093c33] text-white"
                        }`}
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className={plan.isPopular ? "text-emerald-100/90" : "text-stone-700"}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-9 pt-4">
                <Link
                  href="#subscribe"
                  className={`w-full py-3.5 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center transition-all active:scale-95 ${plan.buttonStyle}`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
