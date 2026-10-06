"use client";

import {
  ConcentricRings,
  WavyPillCluster,
  DotGridPattern,
} from "@/components/DecorativeShapes";
import { FileText, Code2, Heart } from "lucide-react";

export default function ThreeSteps() {
  return (
    <section className="bg-white pt-48 sm:pt-60 md:pt-72 lg:pt-80 pb-20 sm:pb-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111827]">
            Build & Learn with <span className="text-[#f3843f]">PDFs & Projects</span>
          </h2>
          <p className="mt-3 text-stone-600 text-sm sm:text-base">
            No payments, no paywalls. Free architectural handbooks and open-source projects for every developer.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 lg:gap-8 max-w-6xl mx-auto">
          {/* Card 1: Browse Free PDFs */}
          <div className="relative rounded-[32px] sm:rounded-[36px] bg-[#094e46] p-8 sm:p-9 text-white overflow-hidden shadow-xl shadow-emerald-950/10 min-h-[380px] sm:min-h-[420px] flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300">
            {/* Top Row: Icon on Left, Concentric Rings on Right */}
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                <FileText className="w-6 h-6" />
              </div>
              <div className="absolute -top-8 -right-8 pointer-events-none group-hover:scale-105 transition-transform duration-500">
                <ConcentricRings className="w-36 h-36 sm:w-40 sm:h-40 text-[#ea8a42]" />
              </div>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 pt-16">
              <h3 className="text-2xl sm:text-[28px] font-bold tracking-tight text-white leading-tight">
                Read & Download
                <br />
                Free PDF Notes
              </h3>
              <p className="mt-3.5 text-xs sm:text-sm text-emerald-100/85 leading-relaxed max-w-[260px]">
                Access 50+ in-depth study handbooks, system design cheatsheets, and architecture diagrams with 1 click.
              </p>
            </div>
          </div>

          {/* Card 2: Clone Projects */}
          <div className="relative rounded-[32px] sm:rounded-[36px] bg-[#f39148] p-8 sm:p-9 text-white overflow-hidden shadow-xl shadow-orange-950/10 min-h-[380px] sm:min-h-[420px] flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300">
            {/* Top Row: Icon on Left, Diagonally Angled Wavy Ripple on Right */}
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                <Code2 className="w-6 h-6" />
              </div>
              <div className="absolute -top-2 -right-2 pointer-events-none group-hover:scale-105 transition-transform duration-500">
                <WavyPillCluster className="w-24 h-28 sm:w-28 sm:h-32 text-[#094e46]" />
              </div>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 pt-16">
              <h3 className="text-2xl sm:text-[28px] font-bold tracking-tight text-white leading-tight">
                Clone & Build
                <br />
                Real Projects
              </h3>
              <p className="mt-3.5 text-xs sm:text-sm text-white/90 leading-relaxed max-w-[260px]">
                Explore verified GitHub repos, test live interactive demos, and build real SaaS and AI applications.
              </p>
            </div>
          </div>

          {/* Card 3: Like & Share */}
          <div className="relative rounded-[32px] sm:rounded-[36px] bg-[#60a5fa] p-8 sm:p-9 text-slate-900 overflow-hidden shadow-xl shadow-blue-950/10 min-h-[380px] sm:min-h-[420px] flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300">
            {/* Top Row: Icon on Left, 4x6 Dot Grid on Right */}
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-slate-900/10 flex items-center justify-center text-slate-900">
                <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
              </div>
              <div className="absolute top-6 right-6 pointer-events-none group-hover:scale-105 transition-transform duration-500">
                <DotGridPattern className="w-20 h-28 sm:w-24 sm:h-32 text-white/75" />
              </div>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 pt-16">
              <h3 className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-950 leading-tight">
                Like, Bookmark
                <br />
                & Level Up
              </h3>
              <p className="mt-3.5 text-xs sm:text-sm text-slate-900/85 leading-relaxed max-w-[260px]">
                Save your favorite projects and handbooks, build an impressive portfolio, and level up your skills.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
