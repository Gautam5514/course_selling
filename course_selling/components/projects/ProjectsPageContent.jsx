"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  GitBranch,
  GitFork,
  Lock,
  Search,
  Star,
} from "lucide-react";
import { projectCategories, projectsList } from "@/data/projectsData";
import { accentFor, ProjectIcon, timeAgo } from "@/components/projects/projectVisuals";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "updated", label: "Recently updated" },
  { value: "stars", label: "Most stars" },
];

function StatusPill({ project, onDark = false }) {
  const live = project.status === "live";
  const base = onDark
    ? "bg-white/15 text-white border-white/25"
    : live
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : "bg-stone-100 text-stone-700 border-stone-200";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${base}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${live ? "bg-emerald-400" : onDark ? "bg-white/70" : "bg-stone-400"}`} />
      {live ? "Live" : "Source code"}
    </span>
  );
}

function RepoMeta({ project, stats, className = "" }) {
  if (project.repoPrivate) {
    return (
      <div className={`flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 ${className}`}>
        <Lock className="w-3.5 h-3.5" />
        <span>Private repository</span>
      </div>
    );
  }
  if (!stats) return null;
  const updated = timeAgo(stats.pushedAt);
  return (
    <div className={`flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11px] font-semibold text-stone-500 ${className}`}>
      <span className="inline-flex items-center gap-1" title="GitHub stars">
        <Star className="w-3.5 h-3.5 text-amber-500" />
        <span className="tabular-nums">{stats.stars.toLocaleString()}</span>
      </span>
      <span className="inline-flex items-center gap-1" title="Forks">
        <GitFork className="w-3.5 h-3.5" />
        <span className="tabular-nums">{stats.forks.toLocaleString()}</span>
      </span>
      {updated && <span>Updated {updated}</span>}
    </div>
  );
}

function Cover({ project, large = false }) {
  const accent = accentFor(project);
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${accent.cover} text-white ${
        large ? "min-h-56 lg:min-h-full p-7 sm:p-9" : "h-40 p-5"
      } flex flex-col justify-between`}
    >
      {/* soft decorative rings */}
      <div aria-hidden className="absolute -right-10 -top-10 w-44 h-44 rounded-full border border-white/15" />
      <div aria-hidden className="absolute -right-2 -top-2 w-28 h-28 rounded-full border border-white/15" />
      <div aria-hidden className="absolute -left-12 -bottom-16 w-48 h-48 rounded-full bg-white/5" />

      <div className="relative flex items-center justify-between gap-2">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/15 border border-white/25 text-[11px] font-bold">
          {project.platform}
        </span>
        <StatusPill project={project} onDark />
      </div>

      <div className="relative flex items-end justify-between gap-3">
        <span className={`font-bricolage font-extrabold tracking-tight leading-none ${large ? "text-4xl sm:text-5xl" : "text-2xl"}`}>
          {project.name}
        </span>
        <span
          className={`shrink-0 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center ${
            large ? "w-16 h-16" : "w-11 h-11"
          }`}
        >
          <ProjectIcon project={project} className={large ? "w-8 h-8" : "w-5 h-5"} />
        </span>
      </div>
    </div>
  );
}

function TechChips({ tech, max = 5 }) {
  const shown = tech.slice(0, max);
  const rest = tech.length - shown.length;
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((t) => (
        <span key={t} className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#faf7f2] border border-stone-200 text-stone-700">
          {t}
        </span>
      ))}
      {rest > 0 && (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold text-stone-500">+{rest} more</span>
      )}
    </div>
  );
}

function ExternalActions({ project, compact = false }) {
  const btn =
    "inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-colors";
  return (
    <>
      {project.liveUrl && (
        <a href={project.liveUrl} target="_blank" rel="noreferrer" className={`${btn} ${compact ? "w-10 h-10" : "px-4 py-2.5"}`} aria-label={`${project.name}: ${project.liveLabel || "Open live"}`} title={project.liveLabel || "Open live"}>
          {!compact && <span>Live</span>}
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      )}
      {project.githubUrl && (
        <a href={project.githubUrl} target="_blank" rel="noreferrer" className={`${btn} ${compact ? "w-10 h-10" : "px-4 py-2.5"}`} aria-label={`${project.name} on GitHub`} title="View on GitHub">
          <GitBranch className="w-3.5 h-3.5" />
          {!compact && <span>GitHub</span>}
        </a>
      )}
    </>
  );
}

function FeaturedCard({ project, stats }) {
  return (
    <article className="bg-white rounded-[28px] border border-stone-200 shadow-sm overflow-hidden grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <Link href={`/projects/${project.slug}`} aria-label={project.title} className="block">
        <Cover project={project} large />
      </Link>

      <div className="p-6 sm:p-8 flex flex-col">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#f3843f]">Featured · {project.category}</span>
          <RepoMeta project={project} stats={stats} />
        </div>

        <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight text-balance">
          <Link href={`/projects/${project.slug}`} className="hover:text-[#f3843f] transition-colors">
            {project.title}
          </Link>
        </h2>
        <p className="mt-3 text-sm text-stone-600 leading-relaxed">{project.description}</p>

        {project.facts?.length > 0 && (
          <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {project.facts.map((f) => (
              <div key={f.label} className="rounded-2xl bg-[#faf7f2] border border-stone-200/80 px-3.5 py-3">
                <dt className="sr-only">{f.label}</dt>
                <dd className="text-xl font-extrabold text-[#093c33] font-bricolage leading-none">{f.value}</dd>
                <dd className="mt-1.5 text-[11px] font-semibold text-stone-500 leading-snug">{f.label}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-5">
          <TechChips tech={project.tech} max={8} />
        </div>

        <div className="mt-6 pt-5 border-t border-stone-100 flex flex-wrap items-center gap-2">
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#093c33] hover:bg-[#072e27] shadow-sm transition-colors"
          >
            <span>Architecture &amp; README</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <ExternalActions project={project} />
        </div>
      </div>
    </article>
  );
}

function ProjectCard({ project, stats }) {
  const accent = accentFor(project);
  return (
    <article className="group bg-white rounded-[24px] border border-stone-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
      <Link href={`/projects/${project.slug}`} aria-label={project.title} className="block">
        <Cover project={project} />
      </Link>

      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        <span className={`text-[11px] font-bold uppercase tracking-wider ${accent.text}`}>{project.category}</span>
        <h3 className="mt-1.5 text-lg font-bold text-stone-900 leading-snug">
          <Link href={`/projects/${project.slug}`} className="group-hover:text-[#f3843f] transition-colors">
            {project.title}
          </Link>
        </h3>
        <p className="mt-2 text-[13px] text-stone-600 leading-relaxed line-clamp-3">{project.tagline}</p>

        <div className="mt-4">
          <TechChips tech={project.tech} max={4} />
        </div>

        <RepoMeta project={project} stats={stats} className="mt-auto pt-5" />
      </div>

      <div className="px-5 sm:px-6 py-4 bg-[#fdfbf7] border-t border-stone-100 flex items-center gap-2">
        <Link
          href={`/projects/${project.slug}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold text-white bg-[#093c33] hover:bg-[#072e27] transition-colors"
        >
          <span>Architecture</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <ExternalActions project={project} compact />
      </div>
    </article>
  );
}

export default function ProjectsPageContent({ stats = {} }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const counts = useMemo(() => {
    const c = { All: projectsList.length };
    for (const p of projectsList) c[p.category] = (c[p.category] || 0) + 1;
    return c;
  }, []);

  const summary = useMemo(() => {
    const live = projectsList.filter((p) => p.status === "live").length;
    const openRepos = projectsList.filter((p) => p.githubUrl).length;
    const stars = Object.values(stats).reduce((sum, s) => sum + (s?.stars || 0), 0);
    return [
      { value: projectsList.length, label: "projects" },
      { value: live, label: "live in production" },
      { value: openRepos, label: "public repositories" },
      ...(stars > 0 ? [{ value: stars, label: "GitHub stars" }] : []),
    ];
  }, [stats]);

  const query = searchQuery.trim().toLowerCase();
  const filtered = useMemo(() => {
    const list = projectsList.filter((p) => {
      if (activeCategory !== "All" && p.category !== activeCategory) return false;
      if (!query) return true;
      return [p.title, p.name, p.tagline, p.platform, ...p.tech].some((v) => v.toLowerCase().includes(query));
    });
    if (sortBy === "stars") {
      return [...list].sort((a, b) => (stats[b.slug]?.stars || 0) - (stats[a.slug]?.stars || 0));
    }
    if (sortBy === "updated") {
      const t = (p) => (stats[p.slug]?.pushedAt ? new Date(stats[p.slug].pushedAt).getTime() : 0);
      return [...list].sort((a, b) => t(b) - t(a));
    }
    return list;
  }, [activeCategory, query, sortBy, stats]);

  const showFeatured = sortBy === "featured" && activeCategory === "All" && !query && filtered.length > 0;
  const featured = showFeatured ? filtered[0] : null;
  const gridProjects = showFeatured ? filtered.slice(1) : filtered;

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#093c33]/10 border border-[#093c33]/20 text-xs font-bold text-[#093c33]">
            <Code2 className="w-3.5 h-3.5 text-[#f3843f]" />
            <span>BUILT AND SHIPPED</span>
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#111827] leading-[1.05] text-balance">
            Real projects, <span className="text-[#f3843f]">real code</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl">
            Production apps you can open, use and read. Each one links to its live site and GitHub repository,
            with the full architecture and README on its own page.
          </p>
        </header>

        {/* Summary strip */}
        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-y border-stone-200 py-5">
          {summary.map((s) => (
            <div key={s.label} className="flex items-baseline gap-2">
              <dd className="text-2xl sm:text-3xl font-extrabold text-[#093c33] font-bricolage tabular-nums">{s.value}</dd>
              <dt className="text-xs sm:text-sm font-semibold text-stone-500">{s.label}</dt>
            </div>
          ))}
        </dl>

        {/* Filters */}
        <div className="mt-8 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
            {projectCategories.map((category) => {
              const active = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={active}
                  className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? "bg-[#093c33] text-white shadow-md shadow-emerald-950/20"
                      : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
                  }`}
                >
                  <span>{category}</span>
                  <span className={`text-[11px] tabular-nums ${active ? "text-white/70" : "text-stone-400"}`}>{counts[category] || 0}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 lg:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or tech"
                aria-label="Search projects"
                className="w-full pl-10 pr-4 py-2 rounded-full text-xs sm:text-sm bg-white border border-stone-200 focus:outline-none focus:border-[#f3843f] focus:ring-1 focus:ring-[#f3843f] text-stone-900 placeholder:text-stone-400 shadow-sm"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort projects"
              className="cursor-pointer px-3.5 py-2 rounded-full text-xs sm:text-sm bg-white border border-stone-200 text-stone-700 focus:outline-none focus:border-[#f3843f] shadow-sm font-semibold"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Featured */}
        {featured && (
          <div className="mb-8">
            <FeaturedCard project={featured} stats={stats[featured.slug]} />
          </div>
        )}

        {/* Grid */}
        {gridProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridProjects.map((project) => (
              <ProjectCard key={project.id} project={project} stats={stats[project.slug]} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 max-w-xl mx-auto">
            <Code2 className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-800">No projects match that</h3>
            <p className="text-xs text-stone-500 mt-1">Try a different search term or category.</p>
            <button
              onClick={() => {
                setActiveCategory("All");
                setSearchQuery("");
              }}
              className="cursor-pointer mt-4 px-5 py-2 rounded-full text-xs font-semibold bg-[#f3843f] text-white"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
