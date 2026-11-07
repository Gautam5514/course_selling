"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Code2,
  Search,
  ExternalLink,
  GitBranch,
  Sparkles,
  ArrowRight,
  Layers,
  FileText,
  Star,
  CheckCircle,
} from "lucide-react";
import { projectCategories, projectsList } from "@/data/projectsData";
import { pdfNotesList } from "@/data/pdfNotesData";
import LikeButton from "@/components/LikeButton";
import ProjectDetailModal from "@/components/ProjectDetailModal";
import PdfPreviewModal from "@/components/PdfPreviewModal";
import { RayBurstDoodle, DoodleUnderline } from "@/components/DecorativeShapes";

export default function ProjectsPageContent() {
  const [activeCategory, setActiveCategory] = useState("All Projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("likes"); // "likes" | "title"
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);

  const filteredProjects = projectsList
    .filter((project) => {
      const matchesCategory =
        activeCategory === "All Projects" || project.category === activeCategory;
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tech.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "likes") return (b.likes || 0) - (a.likes || 0);
      return a.title.localeCompare(b.title);
    });

  const handleOpenPdfForProject = (project) => {
    const matchedPdf =
      pdfNotesList.find((p) => p.id === project.pdfGuideId) || pdfNotesList[0];
    setSelectedPdf(matchedPdf);
  };

  return (
    <div className="py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#093c33]/10 border border-[#093c33]/20 text-xs font-bold text-[#093c33] mb-4">
            <Code2 className="w-3.5 h-3.5 text-[#f3843f]" />
            <span>REAL-WORLD REPOSITORIES &amp; DEMOS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#111827] leading-tight">
            Open-Source <span className="text-[#f3843f]">Projects</span>
            <br />
            To Build &amp; Like
          </h1>

          <p className="mt-4 text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl mx-auto">
            Explore battle-tested full-stack SaaS apps, autonomous AI agents, and mobile client codebases.
            Complete with live interactive demos, architecture docs, and 100% free GitHub repositories.
          </p>
        </div>

        {/* Filters, Search & Sort Bar */}
        <div className="mb-10 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {projectCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    activeCategory === category
                      ? "bg-[#093c33] text-white shadow-md shadow-emerald-950/20"
                      : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search Input & Sort */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by tech or title..."
                  className="w-full pl-10 pr-4 py-2 rounded-full text-xs sm:text-sm bg-white border border-stone-200 focus:outline-none focus:border-[#f3843f] focus:ring-1 focus:ring-[#f3843f] text-stone-900 placeholder:text-stone-400 shadow-sm"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-2 rounded-full text-xs sm:text-sm bg-white border border-stone-200 text-stone-700 focus:outline-none focus:border-[#f3843f] shadow-sm font-semibold"
              >
                <option value="likes">Most Liked ❤️</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="card-glow bg-white rounded-[28px] border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Top Content */}
              <div className="p-6 sm:p-7">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                    {project.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <LikeButton
                      id={`project_${project.id}`}
                      initialLikes={project.likes || 150}
                      variant="badge"
                    />
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-stone-900 group-hover:text-[#f3843f] transition-colors leading-snug">
                  {project.title}
                </h3>

                <p className="mt-2 text-xs sm:text-[13px] text-stone-600 line-clamp-2 leading-relaxed">
                  {project.tagline}
                </p>

                {/* Tech Chips */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#faf7f2] border border-stone-200 text-stone-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Companion PDF Guide Pill */}
                {project.pdfGuideTitle && (
                  <button
                    onClick={() => handleOpenPdfForProject(project)}
                    className="mt-4 w-full text-left p-2.5 rounded-xl bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-100 flex items-center justify-between gap-2 text-[11px] text-emerald-900 transition-colors group/pdf"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="font-semibold truncate">
                        {project.pdfGuideTitle}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 shrink-0 group-hover/pdf:translate-x-0.5 transition-transform">
                      Read PDF →
                    </span>
                  </button>
                )}
              </div>

              {/* Card Bottom Actions */}
              <div className="p-6 pt-3 bg-[#fdfbf7] border-t border-stone-100 flex items-center gap-2">
                <button
                  onClick={() => setSelectedProject(project)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-[#093c33] bg-white hover:bg-stone-50 border border-stone-200 shadow-xs transition-colors flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#f3843f]" />
                  <span>Architecture</span>
                </button>

                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-[#093c33] hover:bg-[#072e27] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span>Live Demo</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 max-w-xl mx-auto">
            <Code2 className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-800">No projects found</h3>
            <p className="text-xs text-stone-500 mt-1">
              Try adjusting your search terms or category filter.
            </p>
            <button
              onClick={() => {
                setActiveCategory("All Projects");
                setSearchQuery("");
              }}
              className="mt-4 px-5 py-2 rounded-full text-xs font-semibold bg-[#f3843f] text-white"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* MODALS */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        onOpenPdf={() => {
          if (selectedProject) handleOpenPdfForProject(selectedProject);
        }}
      />

      <PdfPreviewModal
        pdf={selectedPdf}
        isOpen={Boolean(selectedPdf)}
        onClose={() => setSelectedPdf(null)}
      />
    </div>
  );
}
