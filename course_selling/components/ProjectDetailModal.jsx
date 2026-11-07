"use client";

import {
  X,
  ExternalLink,
  Code2,
  CheckCircle,
  Sparkles,
  Layers,
  ArrowRight,
  GitBranch,
} from "lucide-react";
import LikeButton from "./LikeButton";

export default function ProjectDetailModal({ project, isOpen, onClose, onOpenPdf }) {
  if (!isOpen || !project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[28px] max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-5 bg-[#093c33] text-white flex items-center justify-between border-b border-emerald-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f3843f]/20 border border-[#f3843f]/40 flex items-center justify-center text-[#f3843f]">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/20">
                  Open-Source Capstone Project
                </span>
                <span className="text-xs text-emerald-200/70 hidden sm:inline">
                  • {project.category} • {project.level}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
                {project.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LikeButton id={`project_${project.id}`} initialLikes={project.likes || 150} variant="badge" />
            <button
              onClick={onClose}
              className="cursor-pointer w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors ml-1"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Tagline & Overview */}
          <div>
            <p className="text-sm sm:text-base font-semibold text-stone-800 leading-relaxed">
              {project.tagline}
            </p>
            <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Tech Stack Chips */}
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
              Technology Stack:
            </span>
            <div className="flex flex-wrap gap-2">
              {project.tech?.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-[#faf7f2] border border-stone-200 text-stone-800"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Project Features */}
          {project.features && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#faf7f2] border border-stone-200/80 space-y-3">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#f3843f]" />
                Key Production Features:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                {project.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Deliverables / Source Code info */}
          {project.deliverables && (
            <div>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
                Included in Source Repository:
              </span>
              <div className="space-y-1.5 text-xs text-stone-600">
                {project.deliverables.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <GitBranch className="w-3.5 h-3.5 text-[#093c33] shrink-0" />
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA Bar */}
        <div className="p-4 sm:p-6 bg-[#fdfbf7] border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LikeButton id={`project_${project.id}`} initialLikes={project.likes || 150} variant="button" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="cursor-pointer flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 transition-colors"
              >
                <span>Live Demo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="cursor-pointer flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#093c33] hover:bg-[#072e27] text-white shadow-md transition-all active:scale-95"
              >
                <span>Clone Repo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
