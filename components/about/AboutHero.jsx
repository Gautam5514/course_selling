"use client";

import { SparkleStar, DoodleUnderline } from "@/components/DecorativeShapes";

export default function AboutHero() {
  const stats = [
    { value: "50K+", label: "Active Learners", color: "text-[#f3843f]" },
    { value: "500+", label: "Expert Instructors", color: "text-emerald-400" },
    { value: "94%", label: "Career Placement Rate", color: "text-blue-400" },
    { value: "4.9/5", label: "Average Course Rating", color: "text-amber-400" },
  ];

  return (
    <section className="relative bg-[#0b382d] pt-14 pb-20 sm:pb-24 text-white overflow-hidden">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
      />

      {/* Decorative Sparkle Star */}
      <div className="absolute top-20 right-10 pointer-events-none opacity-80 hidden sm:block">
        <SparkleStar className="w-8 h-8 text-[#df9d66]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-700/40 text-xs sm:text-sm text-emerald-200 backdrop-blur-md mb-6">
          <span className="w-2 h-2 rounded-full bg-[#f3843f]" />
          <span>Our Story &amp; Vision</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.15] max-w-4xl">
          Empowering Ambitious Minds to
          <br />
          Master the{" "}
          <span className="relative inline-block">
            <span>Future of Tech</span>
            <span className="absolute -bottom-3 left-0 w-full pointer-events-none">
              <DoodleUnderline className="w-full h-3 text-[#f3843f]" />
            </span>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-7 text-base sm:text-lg text-emerald-100/75 max-w-2xl leading-relaxed">
          We founded helloS to replace passive video lectures with live, interactive mentorship and project-based apprenticeship that actually turns curious learners into hired professionals.
        </p>

        {/* Stats Grid */}
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-4xl">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-emerald-950/50 border border-emerald-800/40 p-6 backdrop-blur-sm shadow-lg hover:border-emerald-700/60 transition-colors"
            >
              <div className={`text-3xl sm:text-4xl font-extrabold ${stat.color} tracking-tight`}>
                {stat.value}
              </div>
              <div className="mt-2 text-xs sm:text-sm text-emerald-100/80 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
