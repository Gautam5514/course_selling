"use client";

import { useState } from "react";
import {
  FileText,
  Search,
  Download,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  Layers,
} from "lucide-react";
import { pdfCategories, pdfNotesList } from "@/data/pdfNotesData";
import LikeButton from "@/components/LikeButton";
import PdfPreviewModal from "@/components/PdfPreviewModal";

export default function PdfNotesPageContent() {
  const [activeCategory, setActiveCategory] = useState("All Notes");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("likes"); // "likes" | "pages" | "title"
  const [selectedPdf, setSelectedPdf] = useState(null);

  const filteredPdfs = pdfNotesList
    .filter((pdf) => {
      const matchesCategory =
        activeCategory === "All Notes" || pdf.category === activeCategory;
      const matchesSearch =
        pdf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pdf.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pdf.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        pdf.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "likes") return (b.likes || 0) - (a.likes || 0);
      if (sortBy === "pages") return (b.pages || 0) - (a.pages || 0);
      return a.title.localeCompare(b.title);
    });

  const handleInstantDownload = (pdf) => {
    const docTitle = pdf.title || "Handbook";
    const content = `================================================================================
${docTitle.toUpperCase()}
Author: ${pdf.author || "helloS Engineering"}
Category: ${pdf.category} | ${pdf.pages} Pages | ${pdf.fileSize}
Platform: helloS Open Education & Project Hub (100% Free)
================================================================================

OVERVIEW:
${pdf.description}

TABLE OF CONTENTS:
${pdf.chapters
  ?.map(
    (c, i) =>
      `[Chapter ${c.number || i + 1}] ${c.title}\n   Summary: ${c.summary}\n   Snippet: ${c.contentSnippet}\n`
  )
  .join("\n")}

================================================================================
KEY TAKEAWAYS & PRODUCTION CHECKLIST:
- 100% Free Open Educational Resource.
- Full project source code available at https://github.com/hellobject
================================================================================
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeFilename =
      pdf.title.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_notes.txt";
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#093c33]/10 border border-[#093c33]/20 text-xs font-bold text-[#093c33] mb-4">
            <FileText className="w-3.5 h-3.5 text-[#f3843f]" />
            <span>100% FREE TECHNICAL HANDBOOKS &amp; CHEATSHEETS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#111827] leading-tight">
            Free Technical <span className="text-[#f3843f]">PDF Notes</span>
            <br />
            &amp; Study Guides
          </h1>

          <p className="mt-4 text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl mx-auto">
            In-depth engineering notes, system design formulas, React 19 cheatsheets, and AI system blueprints.
            Read directly in your browser or download free offline copies with 1 click.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="mb-10 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {pdfCategories.map((category) => (
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
                  placeholder="Search PDFs, tags, authors..."
                  className="w-full pl-10 pr-4 py-2 rounded-full text-xs sm:text-sm bg-white border border-stone-200 focus:outline-none focus:border-[#f3843f] focus:ring-1 focus:ring-[#f3843f] text-stone-900 placeholder:text-stone-400 shadow-sm"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-2 rounded-full text-xs sm:text-sm bg-white border border-stone-200 text-stone-700 focus:outline-none focus:border-[#f3843f] shadow-sm font-semibold"
              >
                <option value="likes">Most Liked ❤️</option>
                <option value="pages">Most Pages</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* PDF Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredPdfs.map((pdf) => (
            <div
              key={pdf.id}
              className="card-glow bg-white rounded-[28px] border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Top */}
              <div className="p-6 sm:p-7">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                    {pdf.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <LikeButton
                      id={`pdf_${pdf.id}`}
                      initialLikes={pdf.likes || 180}
                      variant="badge"
                    />
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-stone-900 group-hover:text-[#f3843f] transition-colors leading-snug">
                  {pdf.title}
                </h3>

                <p className="mt-2 text-xs sm:text-[13px] text-stone-600 line-clamp-3 leading-relaxed">
                  {pdf.description}
                </p>

                {/* PDF Specs Badges */}
                <div className="mt-4 flex items-center justify-between text-xs text-stone-500 pt-3 border-t border-stone-100">
                  <span className="font-semibold text-stone-800">
                    📄 {pdf.pages} Pages
                  </span>
                  <span className="text-stone-400">📦 {pdf.fileSize}</span>
                  <span className="text-emerald-700 font-medium">
                    ⬇️ {pdf.downloads}
                  </span>
                </div>

                {/* Tags */}
                <div className="mt-3.5 flex flex-wrap gap-1">
                  {pdf.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#faf7f2] border border-stone-200 text-stone-600"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Bottom Actions */}
              <div className="p-6 pt-3 bg-[#fdfbf7] border-t border-stone-100 flex items-center gap-2">
                <button
                  onClick={() => setSelectedPdf(pdf)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-stone-800 bg-white hover:bg-stone-50 border border-stone-200 transition-colors flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#093c33]" />
                  <span>Read Online</span>
                </button>

                <button
                  onClick={() => handleInstantDownload(pdf)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-[#093c33] hover:bg-[#072e27] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-[#f3843f]" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPdfs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 max-w-xl mx-auto">
            <FileText className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-800">No notes found</h3>
            <p className="text-xs text-stone-500 mt-1">
              Try adjusting your search terms or select another category filter.
            </p>
            <button
              onClick={() => {
                setActiveCategory("All Notes");
                setSearchQuery("");
              }}
              className="mt-4 px-5 py-2 rounded-full text-xs font-semibold bg-[#f3843f] text-white"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* READ ONLINE MODAL */}
      <PdfPreviewModal
        pdf={selectedPdf}
        isOpen={Boolean(selectedPdf)}
        onClose={() => setSelectedPdf(null)}
      />
    </div>
  );
}
