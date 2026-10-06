"use client";

import { useState } from "react";
import {
  Star,
  Search,
  Sparkles,
  FileText,
  Code2,
  Code,
  Layers,
  Server,
  Network,
  Cloud,
  BookOpen,
} from "lucide-react";
import { popularCourses, courseCategories } from "@/data/landingData";
import { pdfNotesList } from "@/data/pdfNotesData";
import { projectsList } from "@/data/projectsData";
import { RightEdgeConcentricRings } from "@/components/DecorativeShapes";
import LikeButton from "@/components/LikeButton";
import PdfPreviewModal from "@/components/PdfPreviewModal";
import ProjectDetailModal from "@/components/ProjectDetailModal";

// Helper function to render matching topic icons
function getTopicIcon(category) {
  switch (category) {
    case "DSA":
      return <Code className="w-3.5 h-3.5 text-amber-600" />;
    case "Full Stack":
      return <Layers className="w-3.5 h-3.5 text-emerald-600" />;
    case "Backend":
      return <Server className="w-3.5 h-3.5 text-indigo-600" />;
    case "AI/ML":
      return <Sparkles className="w-3.5 h-3.5 text-purple-600" />;
    case "System Design":
      return <Network className="w-3.5 h-3.5 text-rose-600" />;
    case "DevOps & Cloud":
      return <Cloud className="w-3.5 h-3.5 text-sky-600" />;
    default:
      return <Sparkles className="w-3.5 h-3.5 text-emerald-600" />;
  }
}

export default function FeaturedCourses() {
  const [activeCategory, setActiveCategory] = useState("All Notes");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // Filter 6 notes cards
  const filteredNotes = popularCourses.filter((course) => {
    const matchesCategory =
      activeCategory === "All Notes" ||
      activeCategory === "All Tracks" ||
      course.category === activeCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      course.title.toLowerCase().includes(query) ||
      course.tagline.toLowerCase().includes(query) ||
      course.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const handleOpenPdf = (course) => {
    const matchedPdf =
      pdfNotesList.find((p) => p.id === course.pdfId) || pdfNotesList[0];
    setSelectedPdf(matchedPdf);
  };

  const handleOpenProject = (course) => {
    const matchedProject =
      projectsList.find((p) => p.id === course.projectId) || projectsList[0];
    setSelectedProject(matchedProject);
  };

  return (
    <section id="courses" className="py-20 sm:py-28 bg-[#faf7f2] relative overflow-hidden">
      {/* Decorative concentric rings top right */}
      <div className="absolute top-14 sm:top-20 right-0 opacity-80 pointer-events-none hidden lg:block">
        <RightEdgeConcentricRings className="w-24 h-44 sm:w-28 sm:h-52 text-[#ea8a42]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#093c33]/10 border border-[#093c33]/20 text-xs font-bold text-[#093c33] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#ea8a42]" />
            <span>100% FREE RESOURCE CATALOG</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#111827] leading-tight">
            Explore Free <span className="text-[#f3843f]">PDF Notes</span> &amp;
            <br className="hidden sm:block" /> Hands-On Projects
          </h2>

          <p className="mt-4 text-xs sm:text-sm md:text-base text-stone-600 leading-relaxed max-w-2xl mx-auto">
            High-yield study handbooks and production repositories. Less noise, only the essentials to master engineering fundamentals.
          </p>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {courseCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`cursor-pointer px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                  activeCategory === category
                    ? "bg-[#093c33] text-white shadow-md shadow-emerald-950/20"
                    : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200/90"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search DSA, Full Stack, AI/ML..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full text-xs sm:text-sm bg-white border border-stone-200 focus:outline-none focus:border-[#f3843f] focus:ring-1 focus:ring-[#f3843f] text-stone-900 placeholder:text-stone-400 shadow-sm"
            />
          </div>
        </div>

        {/* 6 Clean Notes Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 max-w-6xl mx-auto">
          {filteredNotes.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-[26px] border border-stone-200/90 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                {/* Header: Category Badge + Like Heart */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${
                      course.badgeColor ||
                      "bg-emerald-50 text-emerald-800 border-emerald-200"
                    }`}
                  >
                    {getTopicIcon(course.category)}
                    <span>{course.category}</span>
                  </span>

                  <LikeButton
                    id={`note_card_${course.id}`}
                    initialLikes={course.likesCount || 2400}
                    variant="badge"
                  />
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#111827] group-hover:text-[#f3843f] transition-colors leading-tight">
                  {course.title}
                </h3>

                {/* Needful 1-Line Highlight */}
                <p className="mt-2.5 text-xs sm:text-[13px] text-stone-600 font-medium leading-relaxed">
                  {course.tagline}
                </p>

                {/* Needful Specs Chips */}
                <div className="mt-5 pt-4 border-t border-stone-100 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-[11px] font-bold text-stone-700">
                    <FileText className="w-3 h-3 text-[#093c33]" />
                    <span>{course.pages}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-[11px] font-bold text-stone-700">
                    <Code2 className="w-3 h-3 text-[#f3843f]" />
                    <span>{course.projectBadge}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-[11px] font-bold text-amber-800 border border-amber-200/60 ml-auto">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{course.rating}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons: Read PDF & View Project (With explicit cursor-pointer) */}
              <div className="mt-6 pt-2 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleOpenPdf(course)}
                  className="cursor-pointer py-2.5 px-3 rounded-xl text-xs font-bold text-stone-800 bg-stone-100/90 hover:bg-[#093c33] hover:text-white border border-stone-200/80 transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Read PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenProject(course)}
                  className="cursor-pointer py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-[#093c33] hover:bg-[#f3843f] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>View Project</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty Search State */}
        {filteredNotes.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 max-w-xl mx-auto">
            <BookOpen className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-800">No notes found</h3>
            <p className="text-xs text-stone-500 mt-1">
              Try adjusting your search terms or select another category filter.
            </p>
            <button
              onClick={() => {
                setActiveCategory("All Notes");
                setSearchQuery("");
              }}
              className="cursor-pointer mt-4 px-5 py-2 rounded-full text-xs font-bold bg-[#f3843f] text-white hover:bg-[#d96e2b] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

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
    </section>
  );
}
