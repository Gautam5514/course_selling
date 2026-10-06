"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Clock,
  Briefcase,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  Code2,
  Calendar,
  Sparkles,
  FileText,
  ExternalLink,
  GitBranch,
} from "lucide-react";
import { popularTracksList } from "@/data/tracksData";
import { pdfNotesList } from "@/data/pdfNotesData";
import { projectsList } from "@/data/projectsData";
import LikeButton from "@/components/LikeButton";
import PdfPreviewModal from "@/components/PdfPreviewModal";
import ProjectDetailModal from "@/components/ProjectDetailModal";

export default function TrackDetailPageContent({ track }) {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // Other tracks excluding current
  const otherTracks = popularTracksList.filter((t) => t.slug !== track.slug);

  const matchedPdf =
    pdfNotesList.find((p) => p.id === track.pdfResource?.id) || pdfNotesList[0];

  const handleOpenPdf = () => {
    setSelectedPdf(matchedPdf);
  };

  const handleOpenProject = (proj) => {
    const fullProject =
      projectsList.find((p) => p.id === proj.id || p.slug === proj.id) || {
        ...proj,
        category: track.name,
        level: track.level,
        features: [
          "Complete open-source architecture with Next.js & TypeScript",
          "Production database schema with normalized migrations",
          "Automated CI/CD with GitHub Actions",
        ],
        deliverables: [
          "Full repository source code",
          "Documentation & architecture guide",
        ],
      };
    setSelectedProject(fullProject);
  };

  return (
    <div>
      {/* 1. TRACK HERO SECTION */}
      <section className="relative bg-[#093c33] text-white pt-12 pb-20 sm:pt-16 sm:pb-28 overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Track Info */}
            <div className="lg:col-span-7 space-y-6">
              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-2 text-xs text-emerald-200/80 font-medium">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <span>/</span>
                <Link href="/courses" className="hover:text-white transition-colors">
                  Tracks
                </Link>
                <span>/</span>
                <span className="text-white font-bold">{track.name}</span>
              </div>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${track.badgeColor} shadow-sm`}
                >
                  {track.badge}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-200 border border-emerald-400/20">
                  {track.level}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  100% Free &amp; Open Access
                </span>
                <LikeButton
                  id={`track_${track.slug}`}
                  initialLikes={track.reviewsCount || 420}
                  variant="badge"
                />
              </div>

              {/* Title & Tagline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                {track.title}
              </h1>
              <p className="text-sm sm:text-base text-emerald-100/85 leading-relaxed max-w-2xl">
                {track.tagline}
              </p>

              {/* Track Metadata Bar */}
              <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-emerald-100/90">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <span className="font-bold text-white text-sm">
                    {track.rating}
                  </span>
                  <span className="text-emerald-200/70">
                    ({track.reviewsCount} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#ea8a42]" />
                  <span>{track.duration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-[#ea8a42]" />
                  <span>
                    Avg Salary:{" "}
                    <strong className="text-white">{track.avgSalary}</strong>
                  </span>
                </div>
              </div>

              {/* Mentor Teaser */}
              <div className="flex items-center gap-3 pt-3">
                <Image
                  src={track.mentor.avatar}
                  alt={track.mentor.name}
                  width={44}
                  height={44}
                  unoptimized
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/50"
                />
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-white leading-tight">
                    Curated by {track.mentor.name}
                  </h2>
                  <p className="text-xs text-emerald-200/75">
                    {track.mentor.role} •{" "}
                    <span className="font-semibold text-white">
                      {track.mentor.company}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Free Access Box */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-8 text-stone-900 shadow-2xl border border-stone-200 relative">
                {/* Free Badge */}
                <div className="absolute -top-3.5 right-6 bg-[#093c33] text-white text-xs font-black px-3.5 py-1 rounded-full shadow-md uppercase tracking-wider border border-emerald-700">
                  Open Educational Resource
                </div>

                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Resource Hub
                </span>

                {/* Free Display */}
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-[#093c33]">
                    100% Free Access
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Zero Paywall
                  </span>
                </div>

                <p className="text-xs text-stone-500 mt-1">
                  Full unrestricted access to technical handbooks, architecture schemas &amp; GitHub projects.
                </p>

                {/* Key Inclusions List */}
                <div className="my-6 space-y-3 pt-5 border-t border-stone-100 text-xs text-stone-700">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>{track.pdfResource?.title || "Complete Technical Handbook"}</strong> (
                      {track.pdfResource?.pages || "80+ Pages"})
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>{track.projects?.length || 2} Production Capstone Projects</strong> with source code
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Self-paced access • Read online or download offline PDF</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Community like &amp; bookmarking system</span>
                  </div>
                </div>

                {/* Average Salary Benchmark Pill */}
                <div className="mb-6 p-3 rounded-2xl bg-[#faf7f2] border border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#093c33]" />
                    <span className="text-xs font-semibold text-stone-700">
                      Average Graduate Benchmark
                    </span>
                  </div>
                  <span className="text-sm font-black text-[#093c33]">
                    {track.avgSalary}
                  </span>
                </div>

                {/* Main Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleOpenPdf}
                    className="w-full py-4 rounded-2xl text-sm font-bold bg-[#f3843f] hover:bg-[#e0732f] text-white shadow-lg shadow-orange-950/20 hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Read / Download Free PDF Guide</span>
                  </button>

                  <a
                    href="#projects"
                    className="w-full py-3 rounded-2xl text-xs font-bold text-[#093c33] bg-emerald-50 hover:bg-emerald-100 transition-colors block text-center border border-emerald-200/80"
                  >
                    Explore Capstone Projects ({track.projects?.length || 2}) ↓
                  </a>
                </div>

                {/* Open Pledge */}
                <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-stone-500 text-center">
                  <Sparkles className="w-3.5 h-3.5 text-[#f3843f]" />
                  <span>No credit card required. Free for all developers worldwide.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TECH STACK STRIP */}
      <section className="py-8 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 shrink-0">
              Core Technologies &amp; Tools Covered:
            </span>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2">
              {track.tools.map((tool) => (
                <span
                  key={tool}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#faf7f2] border border-stone-200 text-stone-800"
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
              Module-by-Module Detailed Curriculum
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
                      className={`w-5 h-5 text-stone-500 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-[#f3843f]" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-2 space-y-3 text-xs sm:text-sm border-t border-stone-200/60 mt-1 animate-in fade-in duration-200">
                      <p className="text-stone-600 leading-relaxed">{mod.desc}</p>
                      <div className="p-3.5 rounded-xl bg-white border border-stone-200 text-stone-800 font-semibold flex items-center gap-2">
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
      <section id="projects" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Portfolio Artifacts
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-stone-900 mt-3">
            Real Production Capstone Projects
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            Build, clone, and deploy these applications to showcase on GitHub and resume submissions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {track.projects.map((proj, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#093c33] text-white flex items-center justify-center shadow-sm">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <LikeButton
                    id={`track_project_${proj.id || idx}`}
                    initialLikes={proj.likes || 150}
                    variant="badge"
                  />
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-stone-900 mb-2">
                  {proj.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
                  {proj.description}
                </p>
              </div>

              <div>
                <div className="pt-4 border-t border-stone-100 flex flex-wrap gap-2 mb-4">
                  {proj.tech.map((t, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-stone-100 text-stone-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenProject(proj)}
                    className="py-2.5 rounded-xl text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#f3843f]" />
                    <span>View Architecture</span>
                  </button>

                  {proj.demoUrl && (
                    <a
                      href={proj.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 rounded-xl text-xs font-bold text-white bg-[#093c33] hover:bg-[#072e27] shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
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
                <span>Verified Curriculum Lead</span>
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
            Looking for something else? Browse our other high-demand free tracks.
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
                <span className="text-[#093c33] font-bold">100% Free</span>
                <span className="text-[#f3843f] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View Track →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* MODALS */}
      <PdfPreviewModal
        pdf={selectedPdf}
        isOpen={Boolean(selectedPdf)}
        onClose={() => setSelectedPdf(null)}
      />

      <ProjectDetailModal
        project={selectedProject}
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        onOpenPdf={() => {
          setSelectedProject(null);
          handleOpenPdf();
        }}
      />
    </div>
  );
}
