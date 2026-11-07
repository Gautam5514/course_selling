"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Play } from "lucide-react";

export default function BecomeInstructor() {
  const features = [
    "Global Reach",
    "Advanced Filtering",
    "Course Upload",
    "Analytics & Insights",
  ];

  return (
    <section id="career" className="py-20 sm:py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left Column: Visual Collage with Blob Frame */}
          <div className="lg:col-span-6 relative flex justify-center">
            {/* Top-Left Plus / Cross Pattern */}
            <div className="absolute top-2 left-6 sm:left-12 grid grid-cols-4 gap-2.5 opacity-30 pointer-events-none z-0">
              {[...Array(16)].map((_, i) => (
                <span key={i} className="text-xs text-stone-500 font-bold select-none">
                  ✕
                </span>
              ))}
            </div>

            {/* Organic Circle / Blob Frame Container */}
            <div className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] md:w-[440px] md:h-[440px] rounded-full p-2 bg-stone-100 shadow-2xl flex items-center justify-center">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
                <Image
                  src="/images/instructor-duo.jpg"
                  alt="Instructors collaborating at laptop"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 320px, 440px"
                />

                {/* Center Play Button: White Circle with Red Play Triangle */}
                <button
                  onClick={() => alert("Playing Instructor Masterclass Demo")}
                  className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white text-rose-600 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
                  aria-label="Play Live Class"
                >
                  <Play className="w-6 h-6 fill-current ml-0.5 text-rose-600" />
                </button>
              </div>

              {/* Hand-Drawn "LIVE CLASS" Speech Bubble on Top Right */}
              <div className="absolute top-4 -right-2 sm:right-2 z-20">
                <div className="relative bg-white border-2 border-stone-800 rounded-2xl px-3 py-1.5 shadow-md -rotate-6">
                  {/* Top Hatching strokes */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1">
                    <span className="w-0.5 h-2 bg-stone-800 rotate-12" />
                    <span className="w-0.5 h-2.5 bg-stone-800" />
                    <span className="w-0.5 h-2 bg-stone-800 -rotate-12" />
                  </div>
                  <span className="text-xs font-black text-blue-700 tracking-wider">
                    LIVE CLASS
                  </span>
                </div>
              </div>

              {/* Floating Bottom-Left Card: 36K+ Enrolled Students */}
              <div className="absolute -bottom-4 -left-4 sm:bottom-4 sm:-left-6 bg-white rounded-2xl p-3 sm:p-3.5 shadow-xl border border-stone-100 z-20">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs sm:text-sm font-black text-stone-900">
                    36K+
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-blue-600">
                    Enrolled Students
                  </span>
                </div>
                {/* 5 Student Avatars in a row */}
                <div className="flex -space-x-1.5 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80"
                    alt="avatar 1"
                    width={22}
                    height={22}
                    unoptimized
                    className="rounded-full ring-2 ring-white object-cover"
                  />
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80"
                    alt="avatar 2"
                    width={22}
                    height={22}
                    unoptimized
                    className="rounded-full ring-2 ring-white object-cover"
                  />
                  <Image
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80"
                    alt="avatar 3"
                    width={22}
                    height={22}
                    unoptimized
                    className="rounded-full ring-2 ring-white object-cover"
                  />
                  <Image
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&auto=format&fit=crop&q=80"
                    alt="avatar 4"
                    width={22}
                    height={22}
                    unoptimized
                    className="rounded-full ring-2 ring-white object-cover"
                  />
                  <Image
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&auto=format&fit=crop&q=80"
                    alt="avatar 5"
                    width={22}
                    height={22}
                    unoptimized
                    className="rounded-full ring-2 ring-white object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111827] leading-tight">
              Share Your{" "}
              <span className="inline-block bg-[#ea580c] text-white px-3 py-1 rounded-xl rotate-1 shadow-sm">
                Knowledge
              </span>
              <br />
              With Tech Learners
              <br />
              Worldwide
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl">
              Teach ambitious developers and designers across 65+ countries. Host live cohorts or publish on-demand masterclasses with complete creative freedom and full production support.
            </p>

            {/* 2x2 Feature Checklist with Orange Checkmarks */}
            <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 pt-2">
              {[
                "Earn up to 85% Revenue Share",
                "Full Video Production Assistance",
                "Built-in Student CRM & Sandbox",
                "Automated Global Payouts",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#ea580c] shrink-0 fill-[#ea580c]/10" />
                  <span className="text-xs sm:text-sm font-semibold text-stone-800">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* Apply as Instructor Button */}
            <div className="pt-4 flex items-center gap-4">
              <Link
                href="/career"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-sm font-semibold bg-[#093c33] hover:bg-[#072d26] text-white shadow-lg shadow-emerald-950/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Apply as an Instructor ↗
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
