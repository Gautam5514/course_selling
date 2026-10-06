"use client";

import { useState } from "react";
import {
  X,
  FileText,
  Download,
  BookOpen,
  CheckCircle,
  Share2,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import LikeButton from "./LikeButton";

export default function PdfPreviewModal({ pdf, isOpen, onClose }) {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !pdf) return null;

  const handleDownload = () => {
    setIsDownloading(true);

    // Build real document content for immediate download
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
  .map((c, i) => `[Chapter ${c.number || i + 1}] ${c.title}\n   Summary: ${c.summary}\n   Snippet: ${c.contentSnippet}\n`)
  .join("\n")}

================================================================================
KEY TAKEAWAYS & PRODUCTION CHECKLIST:
- 100% Free Open Educational Resource.
- Full project source code available at https://github.com/hellobject
- Generated for your continuous software development and learning.
================================================================================
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeFilename = pdf.title.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_notes.txt";
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setIsDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 600);
  };

  const activeChapter = pdf.chapters?.[activeChapterIndex] || pdf.chapters?.[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[28px] max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-6 py-5 bg-[#093c33] text-white flex items-center justify-between border-b border-emerald-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#f3843f]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/20">
                  100% Free PDF Note
                </span>
                <span className="text-xs text-emerald-200/70 hidden sm:inline">
                  • {pdf.pages} Pages • {pdf.fileSize}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-lg">
                {pdf.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LikeButton id={`pdf_${pdf.id}`} initialLikes={pdf.likes || 120} variant="badge" />
            <button
              onClick={onClose}
              className="cursor-pointer w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors ml-1"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Body: 2 Columns */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Left Column: Chapters Navigation */}
          <div className="md:col-span-4 bg-[#faf7f2] p-4 sm:p-5 border-r border-stone-200/80 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider pb-2 border-b border-stone-200">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#093c33]" />
                Table of Contents
              </span>
              <span>{pdf.chapters?.length || 0} Ch.</span>
            </div>

            <div className="space-y-1.5">
              {pdf.chapters?.map((chapter, idx) => {
                const isActive = activeChapterIndex === idx;
                return (
                  <button
                    key={chapter.number || idx}
                    onClick={() => setActiveChapterIndex(idx)}
                    className={`cursor-pointer w-full text-left p-3 rounded-xl transition-all flex items-start gap-2.5 text-xs ${
                      isActive
                        ? "bg-[#093c33] text-white shadow-sm font-semibold"
                        : "bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/70"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isActive ? "bg-white/20 text-emerald-100" : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {chapter.number || idx + 1}
                    </span>
                    <span className="flex-1 line-clamp-2 leading-tight">
                      {chapter.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Author Card */}
            <div className="pt-4 border-t border-stone-200/80 text-xs text-stone-600 space-y-1">
              <span className="font-semibold text-stone-900 block">Curated by:</span>
              <p className="text-[11px] text-stone-500 leading-snug">{pdf.author}</p>
              <div className="pt-2 flex flex-wrap gap-1">
                {pdf.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium bg-white px-2 py-0.5 rounded-md border border-stone-200 text-stone-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Selected Chapter Content Preview */}
          <div className="md:col-span-8 p-6 sm:p-7 flex flex-col justify-between overflow-y-auto space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                <span>
                  Chapter {activeChapter?.number || activeChapterIndex + 1} of{" "}
                  {pdf.chapters?.length}
                </span>
                <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  {pdf.category}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
                {activeChapter?.title}
              </h3>

              <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs sm:text-sm text-stone-800 leading-relaxed">
                <strong className="block text-amber-900 font-bold mb-1">
                  Chapter Executive Summary:
                </strong>
                {activeChapter?.summary}
              </div>

              {/* Code / Content Snippet */}
              <div className="mt-4">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
                  Handbook Key Concept & Snippet:
                </span>
                <div className="p-4 rounded-2xl bg-stone-900 text-emerald-300 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto shadow-inner border border-stone-800">
                  <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-stone-800 text-stone-400 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-[#f3843f]" />
                    <span>Key Architectural Architecture Note</span>
                  </div>
                  <p className="whitespace-pre-wrap text-stone-200 font-sans">
                    {activeChapter?.contentSnippet}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-stone-500 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>No sign-up or credit card required • Instant Access</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="cursor-pointer flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#093c33] hover:bg-[#072e27] text-white shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-75"
                >
                  <Download className={`w-4 h-4 ${isDownloading ? "animate-bounce" : ""}`} />
                  <span>
                    {downloadSuccess
                      ? "Downloaded!"
                      : isDownloading
                      ? "Preparing PDF..."
                      : `Download Free Notes (${pdf.fileSize})`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
