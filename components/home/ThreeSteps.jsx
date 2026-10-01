"use client";

import {
  ConcentricRings,
  WavyPillCluster,
  DotGridPattern,
  BrowseCoursesIcon,
  EnrollInstantlyIcon,
  StartLearningIcon,
} from "@/components/DecorativeShapes";

export default function ThreeSteps() {
  return (
    <section className="bg-white pt-48 sm:pt-60 md:pt-72 lg:pt-80 pb-20 sm:pb-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111827]">
            Start <span className="text-[#f3843f]">Learning</span> in 3 Simple Steps
          </h2>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 lg:gap-8 max-w-6xl mx-auto">
          {/* Card 1: Browse Courses */}
          <div className="relative rounded-[32px] sm:rounded-[36px] bg-[#094e46] p-8 sm:p-9 text-white overflow-hidden shadow-xl shadow-emerald-950/10 min-h-[380px] sm:min-h-[420px] flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300">
            {/* Top Row: Icon on Left, Concentric Rings on Right */}
            <div className="flex items-start justify-between">
              <BrowseCoursesIcon className="w-10 h-10 text-white" />
              <div className="absolute -top-8 -right-8 pointer-events-none group-hover:scale-105 transition-transform duration-500">
                <ConcentricRings className="w-36 h-36 sm:w-40 sm:h-40 text-[#ea8a42]" />
              </div>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 pt-16">
              <h3 className="text-2xl sm:text-[28px] font-bold tracking-tight text-white leading-tight">
                Browse
                <br />
                Verified Tracks
              </h3>
              <p className="mt-3.5 text-xs sm:text-sm text-emerald-100/85 leading-relaxed max-w-[260px]">
                Explore 150+ cohort-based & self-paced tracks designed with leads from Stripe and Google.
              </p>
            </div>
          </div>

          {/* Card 2: Enroll Instantly */}
          <div className="relative rounded-[32px] sm:rounded-[36px] bg-[#f39148] p-8 sm:p-9 text-white overflow-hidden shadow-xl shadow-orange-950/10 min-h-[380px] sm:min-h-[420px] flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300">
            {/* Top Row: Icon on Left, Diagonally Angled Wavy Ripple on Right */}
            <div className="flex items-start justify-between">
              <EnrollInstantlyIcon className="w-10 h-10 text-white" />
              <div className="absolute -top-2 -right-2 pointer-events-none group-hover:scale-105 transition-transform duration-500">
                <WavyPillCluster className="w-24 h-28 sm:w-28 sm:h-32 text-[#094e46]" />
              </div>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 pt-16">
              <h3 className="text-2xl sm:text-[28px] font-bold tracking-tight text-white leading-tight">
                Instant
                <br />
                Sandbox Access
              </h3>
              <p className="mt-3.5 text-xs sm:text-sm text-white/90 leading-relaxed max-w-[260px]">
                Unlock private GitHub repos, interactive sandbox environments, and student Discord lounges.
              </p>
            </div>
          </div>

          {/* Card 3: Start Learning */}
          <div className="relative rounded-[32px] sm:rounded-[36px] bg-[#60a5fa] p-8 sm:p-9 text-slate-900 overflow-hidden shadow-xl shadow-blue-950/10 min-h-[380px] sm:min-h-[420px] flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300">
            {/* Top Row: Icon on Left, 4x6 Dot Grid on Right */}
            <div className="flex items-start justify-between">
              <StartLearningIcon className="w-10 h-10 text-slate-900" />
              <div className="absolute top-6 right-6 pointer-events-none group-hover:scale-105 transition-transform duration-500">
                <DotGridPattern className="w-20 h-28 sm:w-24 sm:h-32 text-white/75" />
              </div>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 pt-16">
              <h3 className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-950 leading-tight">
                Build, Ship
                <br />
                & Get Hired
              </h3>
              <p className="mt-3.5 text-xs sm:text-sm text-slate-900/85 leading-relaxed max-w-[260px]">
                Ship production capstone applications, attend weekly live 1-on-1 code reviews, and earn credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
