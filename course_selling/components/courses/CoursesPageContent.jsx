"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Star,
  Clock,
  Briefcase,
  ArrowRight,
  Sparkles,
  BookOpen,
  Users,
  CheckCircle,
  FileText,
  Code2,
  Download,
  ExternalLink,
} from "lucide-react";
import CoursesHero from "./CoursesHero";
import CoursesFaqSection from "./CoursesFaqSection";
import { popularTracksList } from "@/data/tracksData";
import { popularCourses, courseCategories } from "@/data/landingData";
import { pdfNotesList } from "@/data/pdfNotesData";
import { projectsList } from "@/data/projectsData";
import LikeButton from "@/components/LikeButton";
import PdfPreviewModal from "@/components/PdfPreviewModal";
import ProjectDetailModal from "@/components/ProjectDetailModal";

export default function CoursesPageContent() {
  const [activeTab, setActiveTab] = useState("all"); // "all" | "career" | "modular"
  const [activeCategory, setActiveCategory] = useState("All Tracks");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // Filter career tracks
  const filteredTracks = popularTracksList.filter((track) => {
    const matchesCategory =
      activeCategory === "All Tracks" ||
      track.name.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch =
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.tools.some((tool) =>
        tool.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  // Filter modular masterclasses
  const filteredCourses = popularCourses.filter((course) => {
    const matchesCategory =
      activeCategory === "All Tracks" || course.category === activeCategory;
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenPdfForCourse = (course) => {
    const matched =
      pdfNotesList.find((p) => p.id === course.pdfId) || pdfNotesList[0];
    setSelectedPdf(matched);
  };

  const handleOpenProjectForCourse = (course) => {
    const matched =
      projectsList.find((p) => p.id === course.projectId) || projectsList[0];
    setSelectedProject(matched);
  };

  const handleOpenPdfForTrack = (track) => {
    const matched =
      pdfNotesList.find((p) => p.id === track.pdfResource?.id) || pdfNotesList[0];
    setSelectedPdf(matched);
  };

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* 1. COURSES PAGE HERO */}
      <CoursesHero />

      {/* 2. FILTER & SEARCH CONTROLS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-md border border-stone-200 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1.5 p-1.5 bg-[#faf7f2] rounded-full border border-stone-200/80 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("all")}
                className={`flex-1 sm:flex-none px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  activeTab === "all"
                    ? "bg-[#093c33] text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                All Resources
              </button>
              <button
                onClick={() => setActiveTab("career")}
                className={`flex-1 sm:flex-none px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  activeTab === "career"
                    ? "bg-[#093c33] text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Career Tracks (5)
              </button>
              <button
                onClick={() => setActiveTab("modular")}
                className={`flex-1 sm:flex-none px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  activeTab === "modular"
                    ? "bg-[#093c33] text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Masterclasses (6)
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by tech (e.g. Next.js, AI, Figma)..."
                className="w-full pl-11 pr-4 py-2.5 rounded-full text-xs sm:text-sm bg-stone-50 border border-stone-200 focus:outline-none focus:border-[#f3843f] focus:bg-white text-stone-900 placeholder:text-stone-400 shadow-inner"
              />
            </div>
          </div>

          {/* Sub-Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-stone-100">
            {courseCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? "bg-amber-100/80 text-amber-950 font-bold border border-amber-300/80"
                    : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 3. SECTION A: CAREER TRACKS (DEEP DIVES) */}
        {(activeTab === "all" || activeTab === "career") && (
          <div className="mt-12">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs font-bold text-[#f3843f] uppercase tracking-wider">
                  COMPLETE LEARNING PATHS
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#093c33]">
                  Full-Length Career Tracks
                </h3>
              </div>
              <span className="text-xs text-stone-500 font-medium hidden sm:inline">
                Showing {filteredTracks.length} comprehensive paths
              </span>
            </div>

            <div className="space-y-6">
              {filteredTracks.map((track) => (
                <div
                  key={track.slug}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col lg:flex-row items-start justify-between gap-6 group"
                >
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-3 py-0.5 rounded-full text-[11px] font-bold ${track.badgeColor}`}
                      >
                        {track.badge}
                      </span>
                      <span className="text-xs text-stone-400">
                        {track.level} • {track.duration}
                      </span>
                      <div className="ml-auto">
                        <LikeButton
                          id={`track_${track.slug}`}
                          initialLikes={track.reviewsCount || 300}
                          variant="badge"
                        />
                      </div>
                    </div>

                    <Link href={`/courses/${track.slug}`}>
                      <h4 className="text-xl sm:text-2xl font-bold text-stone-900 group-hover:text-[#f3843f] transition-colors leading-tight">
                        {track.title}
                      </h4>
                    </Link>

                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
                      {track.tagline}
                    </p>

                    {/* Tools badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {track.tools.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#faf7f2] border border-stone-200 text-stone-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-500">
                      <div className="flex items-center gap-2">
                        <Image
                          src={track.mentor.avatar}
                          alt={track.mentor.name}
                          width={26}
                          height={26}
                          unoptimized
                          className="w-6 h-6 rounded-full object-cover ring-1 ring-stone-200"
                        />
                        <span className="font-semibold text-stone-800">
                          {track.mentor.name} ({track.mentor.company})
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>{track.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-stone-400" />
                        <span>
                          Avg Salary:{" "}
                          <strong className="text-emerald-800">
                            {track.avgSalary}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Free Access & Actions */}
                  <div className="w-full lg:w-56 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-stone-200/80 lg:pl-6 flex flex-col justify-between shrink-0 space-y-4">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        100% Free Access
                      </span>
                      <div className="mt-3 space-y-1.5 text-xs text-stone-600">
                        <button
                          onClick={() => handleOpenPdfForTrack(track)}
                          className="flex items-center gap-1.5 text-emerald-800 font-semibold hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>{track.pdfResource?.pages || "80+ Pages"} PDF</span>
                        </button>
                        <div className="flex items-center gap-1.5 text-orange-800 font-semibold">
                          <Code2 className="w-3.5 h-3.5 text-[#f3843f] shrink-0" />
                          <span>{track.projects?.length || 2} Real Projects</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/courses/${track.slug}`}
                      className="w-full py-3 rounded-xl text-xs font-bold bg-[#093c33] hover:bg-[#072e27] text-white shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Explore Track Curriculum</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. SECTION B: MASTERCLASS COURSES */}
        {(activeTab === "all" || activeTab === "modular") && (
          <div className="mt-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs font-bold text-[#f3843f] uppercase tracking-wider">
                  DEEP-DIVE TOPICS
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#093c33]">
                  Specialized Masterclasses
                </h3>
              </div>
              <span className="text-xs text-stone-500 font-medium hidden sm:inline">
                Showing {filteredCourses.length} technical handbooks
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                        {course.category}
                      </span>
                      <LikeButton
                        id={`course_${course.id}`}
                        initialLikes={course.likesCount || 120}
                        variant="badge"
                      />
                    </div>

                    <h4 className="text-lg font-bold text-stone-900 group-hover:text-[#f3843f] transition-colors leading-snug">
                      {course.title}
                    </h4>

                    <p className="mt-2 text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {course.summary}
                    </p>

                    {/* PDF and Project Badges */}
                    <div className="mt-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold bg-emerald-50/70 p-1.5 rounded-lg border border-emerald-100 truncate">
                        <FileText className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
                        <span className="truncate">{course.pdfTitle}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-orange-800 font-semibold bg-orange-50/70 p-1.5 rounded-lg border border-orange-100 truncate">
                        <Code2 className="w-3.5 h-3.5 shrink-0 text-[#f3843f]" />
                        <span className="truncate">{course.projectTitle}</span>
                      </div>
                    </div>

                    {/* Instructor Info */}
                    {course.instructor && (
                      <div className="mt-4 flex items-center gap-3 p-2 rounded-xl bg-[#faf7f2] border border-stone-100">
                        {course.instructor.avatar && (
                          <Image
                            src={course.instructor.avatar}
                            alt={course.instructor.name || "Instructor"}
                            width={36}
                            height={36}
                            unoptimized
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-stone-300"
                          />
                        )}
                        <div>
                          <h5 className="text-xs font-bold text-stone-900 leading-tight">
                            {course.instructor.name}
                          </h5>
                          <p className="text-[11px] text-stone-500">
                            {course.instructor.role} •{" "}
                            <span className="font-semibold text-emerald-800">
                              {course.instructor.company}
                            </span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Free Access and Buttons */}
                  <div className="p-6 pt-3 bg-[#fdfbf7] border-t border-stone-100">
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        100% Free Resource
                      </span>
                      <span className="text-[11px] text-stone-500 font-medium">
                        {course.duration}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleOpenPdfForCourse(course)}
                        className="cursor-pointer w-full py-2.5 rounded-xl text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 transition-colors flex items-center justify-center gap-1 active:scale-95"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#093c33]" />
                        <span>Read PDF</span>
                      </button>
                      <button
                        onClick={() => handleOpenProjectForCourse(course)}
                        className="cursor-pointer w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#093c33] hover:bg-[#072e27] shadow-sm transition-all flex items-center justify-center gap-1 active:scale-95"
                      >
                        <Code2 className="w-3.5 h-3.5 text-[#f3843f]" />
                        <span>View Project</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 5. FAQ SECTION */}
      <CoursesFaqSection />

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
      />
    </div>
  );
}
