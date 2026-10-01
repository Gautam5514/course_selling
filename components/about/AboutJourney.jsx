"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { StarburstDoodle } from "@/components/DecorativeShapes";

export default function AboutJourney() {
  const milestones = [
    {
      year: "2022",
      title: "The Genesis",
      desc: "Founded by 4 engineers and designers frustrated by the lack of hands-on mentorship in modern online courses.",
    },
    {
      year: "2023",
      title: "Interactive Virtual Classrooms",
      desc: "Launched our proprietary live collaborative classroom interface with real-time video, code-pairing, and chat.",
    },
    {
      year: "2024",
      title: "Hiring Network Expansion",
      desc: "Partnered with 120+ high-growth tech companies and design agencies, achieving a 94% graduate placement rate.",
    },
    {
      year: "2025",
      title: "Global Scale & Version 2.0",
      desc: "Surpassed 50,000 active students across 65+ countries with personalized AI curriculum assistants.",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#faf7f2] relative overflow-hidden">
      {/* Decorative Starburst on Right */}
      <div className="absolute top-12 right-12 opacity-80 pointer-events-none hidden sm:block">
        <StarburstDoodle className="w-20 h-20 text-[#f59853]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#093c33]/10 text-xs font-semibold text-[#093c33] mb-3">
            Milestones
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111827]">
            Our Journey So Far
          </h2>
          <p className="mt-3 text-sm text-stone-600 leading-relaxed">
            From an experimental live cohort to an internationally recognized career accelerator.
          </p>
        </div>

        {/* Milestone Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-white border border-stone-200/80 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative"
            >
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#f3843f]/15 text-[#f3843f] text-xs font-bold mb-4">
                  {m.year}
                </span>
                <h3 className="text-lg font-bold text-[#111827] mb-2">
                  {m.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {m.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Completed</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-16 max-w-4xl mx-auto rounded-[32px] bg-[#093c33] p-8 sm:p-12 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-2xl font-bold">Ready to start your journey?</h3>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
              Join 50,000+ ambitious learners leveling up their technical skills today.
            </p>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#f3843f] hover:bg-[#e0732f] text-white font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            <span>Explore Plans</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
