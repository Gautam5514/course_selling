"use client";

import {
  GraduationCap,
  Crown,
  Eye,
  Flag,
  Target,
  Users,
} from "lucide-react";

export default function Benefits() {
  const benefits = [
    {
      title: "Industry-Vetted Curriculum",
      description:
        "Co-created with principal engineers at Stripe, Google, and Netflix to mirror modern production architecture standards.",
      badgeBg: "bg-white border-2 border-[#111827] text-[#111827]",
      icon: GraduationCap,
      isHighlighted: true,
    },
    {
      title: "1-on-1 Senior Mentorship",
      description:
        "Get direct weekly code reviews, architecture critiques, and career roadmap guidance from seasoned practitioners.",
      badgeBg: "bg-[#f39148] text-white",
      icon: Crown,
      isHighlighted: false,
    },
    {
      title: "Production Capstone Projects",
      description:
        "Graduate with real, deployed SaaS and AI applications in your GitHub portfolio — never toy demo apps.",
      badgeBg: "bg-[#2563eb] text-white",
      icon: Eye,
      isHighlighted: false,
    },
    {
      title: "Verifiable Digital Credentials",
      description:
        "Earn cryptographic, shareable certificates recognized by tech recruiters and easily showcased on LinkedIn.",
      badgeBg: "bg-[#22c55e] text-white",
      icon: Flag,
      isHighlighted: false,
    },
    {
      title: "Exclusive 24/7 Tech Community",
      description:
        "Connect with 48,000+ ambitious developers, join weekend hackathons, and exchange direct job referrals.",
      badgeBg: "bg-[#84cc16] text-white",
      icon: Target,
      isHighlighted: false,
    },
    {
      title: "Career Placement & Coaching",
      description:
        "Resume overhauls, 1-on-1 mock technical interviews, and direct intros to our 250+ hiring partner network.",
      badgeBg: "bg-[#ea580c] text-white",
      icon: Users,
      isHighlighted: false,
    },
  ];

  return (
    <section id="benefits" className="py-20 sm:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-20 sm:mb-24">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111827]">
            Why 48,000+ Students Choose <span className="text-[#f3843f]">helloS</span>
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl mx-auto">
            We don&apos;t just teach abstract theory. We build job-ready competencies through real-world software engineering, design systems, and AI workflows.
          </p>
        </div>

        {/* Benefits 3x2 Grid with Overlapping Top Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8 max-w-6xl mx-auto">
          {benefits.map((item, idx) => {
            const Icon = item.icon;

            return (
              <div
                key={idx}
                className={`relative rounded-2xl p-7 pt-9 transition-all duration-300 ${
                  item.isHighlighted
                    ? "bg-[#093c33] text-white shadow-xl shadow-emerald-950/15"
                    : "bg-white text-stone-900 border border-stone-300 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Overlapping Top-Left Badge */}
                <div
                  className={`absolute -top-5 left-6 w-11 h-11 rounded-xl flex items-center justify-center shadow-md ${item.badgeBg}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Title */}
                <h3
                  className={`text-lg sm:text-xl font-bold tracking-tight mb-3 ${
                    item.isHighlighted ? "text-white" : "text-[#111827]"
                  }`}
                >
                  {item.title}
                </h3>

                {/* Description */}
                <p
                  className={`text-xs sm:text-[13px] leading-relaxed ${
                    item.isHighlighted ? "text-emerald-100/80" : "text-stone-600"
                  }`}
                >
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
