"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Copy,
  Check,
  Sparkles,
  FileText,
  Layers,
  ExternalLink,
  ChevronRight,
  Info,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  FolderGit2,
} from "lucide-react";
import LikeButton from "@/components/LikeButton";
import { techBlogPosts } from "@/data/blogsData";

export default function BlogPostContent({ post }) {
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState("");
  const [readingProgress, setReadingProgress] = useState(0);

  // Scroll listener for reading progress bar and active TOC highlighting
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(
          100,
          Math.max(0, (window.scrollY / totalHeight) * 100)
        );
        setReadingProgress(progress);
      }

      // Track active TOC section
      if (post?.sections) {
        for (let i = post.sections.length - 1; i >= 0; i--) {
          const sec = post.sections[i];
          const el = document.getElementById(sec.id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 160) {
              setActiveSectionId(sec.id);
              break;
            }
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [post]);

  const copyCode = (codeText, id) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const copyArticleLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center">
        <h1 className="text-2xl font-bold text-stone-900 mb-4">
          Article Not Found
        </h1>
        <p className="text-stone-600 mb-8">
          The requested technical guide does not exist or has been relocated.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0b382d] text-white font-bold text-sm hover:bg-[#f3843f] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Knowledge Hub
        </Link>
      </div>
    );
  }

  // Get other posts for the "Related Deep Dives" section
  const relatedPosts = techBlogPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  return (
    <>
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-stone-200 z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#0b382d] via-emerald-500 to-[#f3843f] transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <article className="py-10 sm:py-16 bg-[#faf7f2] relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Breadcrumb & Return Nav */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 text-xs font-semibold">
            <nav className="flex items-center gap-2 text-stone-500">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-stone-600 hover:text-[#f3843f] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Articles</span>
              </Link>
              <ChevronRight className="w-3 h-3 text-stone-400" />
              <span className="text-emerald-800 font-bold bg-emerald-100/60 px-2 py-0.5 rounded-full">
                {post.category}
              </span>
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={copyArticleLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300 text-xs font-semibold shadow-xs transition-all"
                title="Copy article link"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Guide</span>
                  </>
                )}
              </button>

              <LikeButton
                id={`blog-${post.slug}`}
                initialLikes={post.likes || 1240}
                variant="button"
                className="scale-95"
              />
            </div>
          </div>

          {/* Article Header Card */}
          <header className="rounded-3xl bg-white border border-stone-200/90 p-6 sm:p-10 md:p-12 shadow-sm mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#0b382d] text-white text-[11px] font-bold">
                <Sparkles className="w-3 h-3 text-[#f3843f]" />
                Technical Handbook
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-xs font-semibold text-stone-500">
                Peer-Reviewed Production Architecture
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#111827] tracking-tight leading-[1.2] mb-6">
              {post.title}
            </h1>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-4xl mb-8">
              {post.subtitle}
            </p>

            {/* Author & Meta Row */}
            <div className="pt-6 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-600/30"
                />
                <div>
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    {post.author.name}
                    <span className="text-xs font-normal text-stone-400">
                      ({post.author.company})
                    </span>
                  </h3>
                  <p className="text-xs text-stone-500">{post.author.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-stone-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#f3843f]" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#f3843f]" />
                  {post.readTime}
                </span>
              </div>
            </div>
          </header>

          {/* Hero Image */}
          <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden shadow-lg border border-stone-200/90 mb-12 bg-stone-900">
            <Image
              src={post.heroImage}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1152px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white text-xs sm:text-sm font-medium bg-black/50 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 flex items-center justify-between">
              <span>{post.title}</span>
              <span className="text-[#f3843f] font-bold hidden sm:inline">
                High-Resolution Architectural Blueprint
              </span>
            </div>
          </div>

          {/* Main Layout Grid: Content on Left, Sticky Sidebar on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left: Main Article Body */}
            <div className="lg:col-span-8 space-y-12">
              {/* Executive Summary Card */}
              <div className="rounded-2xl bg-emerald-950 text-white p-6 sm:p-8 shadow-md border border-emerald-800/40 relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#f3843f]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#f3843f] mb-3">
                  <BookOpen className="w-4 h-4" />
                  <span>Executive Architecture Summary</span>
                </div>
                <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal">
                  {post.summary}
                </p>
              </div>

              {/* Dynamic Sections */}
              {post.sections.map((section, idx) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24 space-y-6"
                >
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#111827] tracking-tight leading-snug flex items-center gap-3">
                    <span className="text-[#0b382d]">{section.heading}</span>
                  </h2>

                  {/* Paragraphs */}
                  <div className="space-y-4 text-stone-700 text-sm sm:text-base leading-relaxed">
                    {section.paragraphs.map((p, pIdx) => (
                      <p key={pIdx}>{p}</p>
                    ))}
                  </div>

                  {/* High Fidelity Diagram Image if present */}
                  {section.image && (
                    <figure className="my-8 rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-sm">
                      <div className="relative aspect-[16/10] w-full bg-stone-900">
                        <Image
                          src={section.image}
                          alt={section.imageCaption || section.heading}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 768px"
                        />
                      </div>
                      {section.imageCaption && (
                        <figcaption className="p-3.5 bg-stone-50 border-t border-stone-200/80 text-xs text-stone-600 font-medium flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f3843f]" />
                          <span>{section.imageCaption}</span>
                        </figcaption>
                      )}
                    </figure>
                  )}

                  {/* Callout Box if present */}
                  {section.callout && (
                    <div
                      className={`rounded-2xl p-5 sm:p-6 border flex items-start gap-4 ${
                        section.callout.type === "warning"
                          ? "bg-rose-50/80 border-rose-200 text-rose-950"
                          : section.callout.type === "note"
                          ? "bg-amber-50/80 border-amber-200 text-amber-950"
                          : "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                      }`}
                    >
                      <div className="mt-0.5">
                        {section.callout.type === "warning" ? (
                          <AlertTriangle className="w-5 h-5 text-rose-600" />
                        ) : section.callout.type === "note" ? (
                          <Info className="w-5 h-5 text-amber-600" />
                        ) : (
                          <Lightbulb className="w-5 h-5 text-emerald-700" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider mb-1">
                          {section.callout.title}
                        </h4>
                        <p className="text-xs sm:text-sm leading-relaxed opacity-90">
                          {section.callout.text}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Code Snippet if present */}
                  {section.code && (
                    <div className="rounded-2xl overflow-hidden border border-stone-800 bg-[#0d1512] shadow-xl my-6">
                      <div className="px-4 py-2.5 bg-[#06100c] border-b border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                          <span className="ml-2 font-mono text-[11px] text-stone-300">
                            {section.codeLanguage || "production-code.tsx"}
                          </span>
                        </div>
                        <button
                          onClick={() => copyCode(section.code, section.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-800/60 hover:bg-stone-700/80 text-stone-300 hover:text-white transition-colors text-[11px] font-mono"
                          title="Copy snippet"
                        >
                          {copiedCodeId === section.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-4 sm:p-5 overflow-x-auto text-xs sm:text-[13px] font-mono leading-relaxed text-emerald-200/90">
                        <code>{section.code}</code>
                      </pre>
                    </div>
                  )}
                </section>
              ))}

              {/* Tags Cloud */}
              <div className="pt-8 border-t border-stone-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
                  Topics &amp; Architectural Concepts
                </h4>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-lg bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Free Resource Cross-Links (Aligning with 100% Free Niche) */}
              <div className="rounded-3xl bg-gradient-to-br from-emerald-950 via-[#0b382d] to-[#07241d] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#f3843f] mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Free Companion Learning Materials</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold mb-3">
                  Take Your Knowledge Into Production
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/80 mb-6 max-w-2xl leading-relaxed">
                  Every technical guide in helloS includes 100% free companion
                  PDF blueprints and production-ready GitHub repositories with
                  zero paywalls.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Related PDF Link */}
                  <Link
                    href="/notes"
                    className="p-4 rounded-2xl bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700/50 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#f3843f] mb-1.5">
                        <FileText className="w-4 h-4" />
                        <span>Download Free PDF</span>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-[#f3843f] transition-colors line-clamp-2">
                        {post.relatedPdfTitle}
                      </h4>
                    </div>
                    <span className="mt-3 text-xs font-semibold text-emerald-300 inline-flex items-center gap-1">
                      Browse in PDF Library <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>

                  {/* Related Project Link */}
                  <Link
                    href="/projects"
                    className="p-4 rounded-2xl bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700/50 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#f3843f] mb-1.5">
                        <FolderGit2 className="w-4 h-4" />
                        <span>Full-Stack Project Code</span>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-[#f3843f] transition-colors line-clamp-2">
                        {post.relatedProjectTitle}
                      </h4>
                    </div>
                    <span className="mt-3 text-xs font-semibold text-emerald-300 inline-flex items-center gap-1">
                      Inspect Repository <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </div>
              </div>

              {/* Author Bio Banner */}
              <div className="rounded-2xl bg-white border border-stone-200/90 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-xs">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-600/30 shrink-0"
                />
                <div className="text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 mb-1">
                    <h4 className="text-base font-bold text-stone-900">
                      Written by {post.author.name}
                    </h4>
                    <span className="text-xs font-semibold text-[#0b382d] bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
                      {post.author.company}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mb-3">{post.author.role}</p>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Senior systems educator specializing in distributed consensus,
                    modern React compilers, and open-weights multimodal inference.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Sticky Table of Contents & Quick Actions */}
            <aside className="lg:col-span-4 sticky top-20 space-y-6">
              {/* Table of Contents Card */}
              <div className="rounded-2xl bg-white border border-stone-200/90 p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#0b382d]" />
                  <span>Table of Contents</span>
                </h3>
                <nav className="space-y-1">
                  {post.tableOfContents.map((item) => {
                    const isActive = activeSectionId === item.id;
                    return (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`block text-xs py-2 px-3 rounded-lg transition-colors leading-snug ${
                          isActive
                            ? "bg-emerald-50 text-[#0b382d] font-bold border-l-2 border-[#0b382d]"
                            : "text-stone-600 hover:bg-stone-50 hover:text-stone-900 font-medium"
                        }`}
                      >
                        {item.title}
                      </a>
                    );
                  })}
                </nav>
              </div>

              {/* Free Resource Card */}
              <div className="rounded-2xl bg-[#fcf8f2] border border-stone-200 p-6 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0b382d] mb-2">
                  <FileText className="w-4 h-4 text-[#f3843f]" />
                  <span>Companion Handbook</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 mb-2">
                  {post.relatedPdfTitle}
                </h4>
                <p className="text-[11px] text-stone-500 leading-relaxed mb-4">
                  Includes full printable vector architecture diagrams, benchmark
                  matrices, and step-by-step terminal cheat sheets.
                </p>
                <Link
                  href="/notes"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0b382d] hover:bg-[#f3843f] text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Get Free Handbook</span>
                </Link>
              </div>

              {/* Interactive Like & Share Card */}
              <div className="rounded-2xl bg-white border border-stone-200 p-6 text-center space-y-3">
                <p className="text-xs font-bold text-stone-800">
                  Enjoying this technical guide?
                </p>
                <p className="text-[11px] text-stone-500">
                  Hit like to support open-source educational engineering writing.
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <LikeButton
                    id={`blog-sidebar-${post.slug}`}
                    initialLikes={post.likes || 1240}
                    variant="button"
                  />
                </div>
              </div>
            </aside>
          </div>

          {/* Related Deep Dives Footer Section */}
          <div className="mt-20 pt-12 border-t border-stone-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#f3843f]">
                  Explore Next
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-1">
                  More Deep-Dive Architecture Guides
                </h3>
              </div>
              <Link
                href="/blog"
                className="text-xs font-bold text-[#0b382d] hover:text-[#f3843f] transition-colors inline-flex items-center gap-1"
              >
                <span>View All Articles</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group rounded-3xl bg-white border border-stone-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-[16/9] w-full bg-stone-900 overflow-hidden">
                    <Image
                      src={related.heroImage}
                      alt={related.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 500px"
                    />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#0b382d]">
                      {related.category}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-xs text-stone-400 mb-2">
                        <span>{related.date}</span>
                        <span>•</span>
                        <span>{related.readTime}</span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-[#f3843f] transition-colors leading-snug line-clamp-2">
                        {related.title}
                      </h4>
                      <p className="mt-2 text-xs text-stone-500 line-clamp-2 leading-relaxed">
                        {related.subtitle}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#0b382d] group-hover:text-[#f3843f]">
                      <span>Read Deep Dive</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
