"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Clock,
  Award,
  Users,
  CheckCircle,
  Calendar,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  BookOpen,
  Briefcase,
  X,
  Code2,
} from "lucide-react";
import {
  RightEdgeConcentricRings,
  SparkleStar,
  RayBurstDoodle,
  DoodleUnderline,
} from "@/components/DecorativeShapes";

export default function TrackDetailPageContent({ track, allTracks }) {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);

  const otherTracks = allTracks.filter((t) => t.slug !== track.slug);

  const handleEnrollConfirm = () => {
    setEnrollSuccess(true);
    setTimeout(() => {
      setIsEnrollModalOpen(false);
      setEnrollSuccess(false);
    }, 2500);
  };

  return (
    <div className="bg-[#faf7f2] relative overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative bg-[#093c33] text-white pt-10 sm:pt-14 pb-20 sm:pb-28 overflow-hidden">
        {/* Decorative Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Decorative Concentric Rings Top-Right */}
        <div className="absolute top-12 sm:top-16 right-0 opacity-60 pointer-events-none hidden lg:block">
          <RightEdgeConcentricRings className="w-28 h-52 sm:w-36 sm:h-64 text-[#ea8a42]" />
        </div>

        {/* Decorative Sparkle Star */}
        <div className="absolute top-28 left-8 pointer-events-none opacity-80 hidden sm:block">
          <SparkleStar className="w-8 h-8 text-[#df9d66]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-200/80 mb-6 sm:mb-8">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/courses" className="hover:text-white transition-colors">
              Tracks
            </Link>
            <span>/</span>
            <span className="text-white font-semibold truncate max-w-xs">
              {track.name}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column: Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge & Level */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${track.badgeColor} shadow-sm`}
                >
                  {track.badge}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-700/50 text-emerald-200">
                  {track.level}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  Cohort Starts {track.cohortStartDate}
                </span>
              </div>

              {/* Title with Doodle Underline */}
              <div className="relative">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold tracking-tight text-white leading-[1.15]">
                  {track.title}
                </h1>
                <div className="w-36 sm:w-48 mt-2">
                  <DoodleUnderline className="w-full h-3 text-[#f3843f]" />
                </div>
              </div>

              {/* Tagline */}
              <p className="text-sm sm:text-base md:text-lg text-emerald-100/90 leading-relaxed font-normal">
                {track.tagline}
              </p>

              {/* Social Proof & Metrics Strip */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="font-bold text-white ml-0.5">{track.rating}</span>
                  <span className="text-emerald-200/70">({track.reviewsCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-100/90">
                  <Users className="w-4 h-4 text-emerald-300" />
                  <span>{track.studentsCount} alumni</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-100/90">
                  <Clock className="w-4 h-4 text-emerald-300" />
                  <span>{track.duration}</span>
                </div>
              </div>

              {/* Mentor Row Teaser */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 backdrop-blur-sm max-w-md">
                <Image
                  src={track.mentor.avatar}
                  alt={track.mentor.name}
                  width={44}
                  height={44}
                  unoptimized
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/40"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Led by {track.mentor.name}
                  </h4>
                  <p className="text-[11px] text-emerald-200/80">
                    {track.mentor.role} • <span className="font-semibold text-amber-300">{track.mentor.company}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Enrollment Box */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-8 text-stone-900 shadow-2xl border border-stone-200 relative">
                {/* Save Badge */}
                <div className="absolute -top-3.5 right-6 bg-[#f3843f] text-white text-xs font-black px-3.5 py-1 rounded-full shadow-md uppercase tracking-wider">
                  Save {track.discountPercent}% Today
                </div>

                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Tuition & Enrollment
                </span>

                {/* Price Display */}
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl font-black text-[#093c33]">
                    ${track.price}
                  </span>
                  <span className="text-lg text-stone-400 line-through">
                    ${track.originalPrice}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    One-time payment
                  </span>
                </div>

                <p className="text-xs text-stone-500 mt-1">
                  Full lifetime access to all {track.duration} & source files.
                </p>

                {/* Key Benefits List */}
                <div className="my-6 space-y-3 pt-5 border-t border-stone-100 text-xs text-stone-700">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Next live cohort starts: <strong>{track.cohortStartDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Weekly 1-on-1 code reviews with staff engineers</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Private alumni Discord & verified job referrals</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Verifiable cryptographic certificate for LinkedIn</span>
                  </div>
                </div>

                {/* Average Salary Benchmark Pill */}
                <div className="mb-6 p-3 rounded-2xl bg-[#faf7f2] border border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#093c33]" />
                    <span className="text-xs font-semibold text-stone-700">Average Graduate Salary</span>
                  </div>
                  <span className="text-sm font-black text-[#093c33]">{track.avgSalary}</span>
                </div>

                {/* Main Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => setIsEnrollModalOpen(true)}
                    className="w-full py-4 rounded-2xl text-sm font-bold bg-[#f3843f] hover:bg-[#e0732f] text-white shadow-lg shadow-orange-950/20 hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Enroll in This Track (${track.price})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href="#syllabus"
                    className="w-full py-3 rounded-2xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors block text-center"
                  >
                    View Full Week-by-Week Syllabus ↓
                  </a>
                </div>

                {/* Risk-free Guarantee */}
                <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-stone-500 text-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>30-Day 100% Money-Back Guarantee. No questions asked.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TOOLS & TECHNOLOGIES STACK */}
      <section className="py-8 bg-white border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 whitespace-nowrap">
              Technologies You Will Master:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {track.tools.map((tool, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#faf7f2] border border-stone-200 text-stone-800"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. LEARNING OUTCOMES */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#ea580c] bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
            Skills Breakdown
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-stone-900 mt-3">
            What You Will Accomplish in This Track
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
            Every module builds directly towards industry-level competencies verified by senior hiring managers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {track.outcomes.map((outcome, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-start gap-3.5 hover:border-[#093c33] transition-colors"
            >
              <div className="w-7 h-7 rounded-xl bg-[#093c33]/10 text-[#093c33] flex items-center justify-center shrink-0 mt-0.5 font-black text-xs">
                {idx + 1}
              </div>
              <p className="text-xs sm:text-sm font-medium text-stone-800 leading-relaxed">
                {outcome}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. WEEK-BY-WEEK INTERACTIVE SYLLABUS */}
      <section id="syllabus" className="py-16 sm:py-24 bg-white border-t border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#093c33] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Curriculum Roadmap
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-stone-900 mt-3">
              Week-by-Week Detailed Syllabus
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2">
              Structured into hands-on sprints with clear milestones and code deliverables.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {track.modules.map((mod, idx) => {
              const isOpen = activeModuleIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-stone-200 bg-[#faf7f2] overflow-hidden transition-all duration-200 shadow-sm"
                >
                  <button
                    onClick={() => setActiveModuleIndex(isOpen ? -1 : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-stone-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-[#093c33] text-white">
                        {mod.week}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-stone-900">
                        {mod.title}
                      </h3>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-stone-500 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#f3843f]" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-stone-600 space-y-3 animate-in fade-in duration-200 border-t border-stone-200/60 mt-1">
                      <p className="leading-relaxed">{mod.desc}</p>
                      <div className="p-3.5 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-emerald-900 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{mod.deliverable}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. CAPSTONE PROJECTS SHOWCASE */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Portfolio Artifacts
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-stone-900 mt-3">
            Real Production Capstone Projects
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            You will build and deploy these applications to showcase on GitHub and resume submissions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {track.projects.map((proj, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#093c33] text-white flex items-center justify-center mb-4 shadow-sm">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-stone-900 mb-2">
                  {proj.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
                  {proj.description}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex flex-wrap gap-2">
                {proj.tech.map((t, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-stone-100 text-stone-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. LEAD INSTRUCTOR PROFILE */}
      <section className="py-16 sm:py-24 bg-white border-t border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#093c33] text-white p-8 sm:p-12 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden shrink-0 ring-4 ring-white/20">
              <Image
                src={track.mentor.avatar}
                alt={track.mentor.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-xs font-bold text-emerald-200">
                <span>Verified Lead Instructor</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                {track.mentor.name}
              </h3>
              <p className="text-xs sm:text-sm text-amber-300 font-semibold">
                {track.mentor.role} • {track.mentor.company}
              </p>
              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-xl">
                {track.mentor.bio}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. EXPLORE OTHER TRACKS */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Explore Other Career Tracks
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            Looking for something else? Browse our other high-demand cohorts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {otherTracks.map((t) => (
            <Link
              key={t.slug}
              href={`/courses/${t.slug}`}
              className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  {t.badge}
                </span>
                <h3 className="text-base font-bold text-stone-900 group-hover:text-[#f3843f] transition-colors mt-2.5 leading-snug">
                  {t.name}
                </h3>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                  {t.tagline}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold">
                <span className="text-[#093c33]">${t.price}</span>
                <span className="text-[#f3843f] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View Track →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ENROLLMENT MODAL */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsEnrollModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {!enrollSuccess ? (
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  FALL COHORT REGISTRATION
                </span>

                <h3 className="text-xl font-bold text-stone-900 mt-2 leading-tight">
                  Enroll in {track.name}
                </h3>

                <p className="text-xs text-stone-500 mt-1">
                  Mentor: {track.mentor.name} ({track.mentor.company})
                </p>

                <div className="my-5 p-4 rounded-2xl bg-[#faf7f2] border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-stone-500">Cohort Tuition</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#093c33]">
                        ${track.price}
                      </span>
                      <span className="text-xs text-stone-400 line-through">
                        ${track.originalPrice}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full">
                    Save {track.discountPercent}%
                  </span>
                </div>

                <div className="space-y-2 mb-6 text-xs text-stone-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Includes all {track.duration} + weekly live mentor calls</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Private Discord lounge & GitHub repository access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Official accredited certificate on completion</span>
                  </div>
                </div>

                <button
                  onClick={handleEnrollConfirm}
                  className="w-full py-3.5 rounded-xl text-sm font-bold bg-[#f3843f] hover:bg-[#e0732f] text-white shadow-lg shadow-orange-950/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Complete Cohort Enrollment (${track.price})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-stone-900">
                  Enrollment Successful!
                </h3>
                <p className="text-xs text-stone-600 mt-2 max-w-xs mx-auto">
                  You are officially enrolled in the <strong>{track.name}</strong> cohort starting on {track.cohortStartDate}. Check your email for GitHub and Discord invites.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
