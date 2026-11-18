import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  FileText,
  GitBranch,
  GitFork,
  Layers,
  Lock,
  Scale,
  Star,
} from "lucide-react";
import ProjectReadme from "@/components/projects/ProjectReadme";
import { accentFor, ProjectIcon, timeAgo } from "@/components/projects/projectVisuals";

function SectionTitle({ icon: Icon, children }) {
  return (
    <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-extrabold text-stone-900">
      <Icon className="w-5 h-5 text-[#f3843f]" />
      <span>{children}</span>
    </h2>
  );
}

function SideRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-stone-100 last:border-0">
      <dt className="text-xs font-semibold text-stone-500 shrink-0">{label}</dt>
      <dd className="text-xs font-bold text-stone-800 text-right">{children}</dd>
    </div>
  );
}

export default function ProjectDetailContent({ project, stats, readme, related }) {
  const accent = accentFor(project);
  const live = project.status === "live";
  const updated = timeAgo(stats?.pushedAt);
  const fromRepo = project.readmeSource === "repo";

  return (
    <div>
      {/* Hero */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${accent.cover} text-white`}>
        <div aria-hidden className="absolute -right-16 -top-20 w-80 h-80 rounded-full border border-white/10" />
        <div aria-hidden className="absolute right-10 top-6 w-48 h-48 rounded-full border border-white/10" />
        <div aria-hidden className="absolute -left-24 -bottom-32 w-96 h-96 rounded-full bg-white/5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 sm:pb-14">
          <Link href="/projects" className="inline-flex items-center gap-1.5 text-xs font-bold text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All projects</span>
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/15 border border-white/25 text-[11px] font-bold">{project.category}</span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/15 border border-white/25 text-[11px] font-bold">{project.platform}</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 border border-white/25 text-[11px] font-bold">
              <span className={`w-1.5 h-1.5 rounded-full ${live ? "bg-emerald-400" : "bg-white/70"}`} />
              {live ? "Live" : "Source code"}
            </span>
          </div>

          <div className="mt-4 flex items-start gap-4">
            <span className="hidden sm:flex shrink-0 w-14 h-14 rounded-2xl bg-white/15 border border-white/25 items-center justify-center">
              <ProjectIcon project={project} className="w-7 h-7" />
            </span>
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.08] text-balance">{project.title}</h1>
              <p className="mt-3 text-sm sm:text-base text-white/85 leading-relaxed max-w-3xl">{project.tagline}</p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-white text-stone-900 hover:bg-stone-100 shadow-sm transition-colors"
              >
                <span>{project.liveLabel || "Open live"}</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            )}
            {project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 border border-white/30 transition-colors"
              >
                <GitBranch className="w-4 h-4" />
                <span>View on GitHub</span>
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/10 border border-white/20 text-white/85">
                <Lock className="w-4 h-4" />
                <span>Private repository</span>
              </span>
            )}

            {stats && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-white/85 sm:ml-2">
                <span className="inline-flex items-center gap-1" title="GitHub stars">
                  <Star className="w-3.5 h-3.5" />
                  <span className="tabular-nums">{stats.stars.toLocaleString()}</span> {stats.stars === 1 ? "star" : "stars"}
                </span>
                <span className="inline-flex items-center gap-1" title="Forks">
                  <GitFork className="w-3.5 h-3.5" />
                  <span className="tabular-nums">{stats.forks.toLocaleString()}</span> {stats.forks === 1 ? "fork" : "forks"}
                </span>
                {updated && <span>Updated {updated}</span>}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-8 lg:gap-10 items-start">
          {/* Main column */}
          <div className="min-w-0 space-y-12">
            {/* Overview */}
            <section>
              <p className="text-base sm:text-lg text-stone-700 leading-relaxed">{project.description}</p>

              {project.facts?.length > 0 && (
                <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {project.facts.map((f) => (
                    <div key={f.label} className="rounded-2xl bg-white border border-stone-200 px-4 py-3.5">
                      <dd className="text-2xl font-extrabold text-[#093c33] font-bricolage leading-none">{f.value}</dd>
                      <dt className="mt-1.5 text-[11px] font-semibold text-stone-500 leading-snug">{f.label}</dt>
                    </div>
                  ))}
                </dl>
              )}
            </section>

            {/* Highlights */}
            {project.highlights?.length > 0 && (
              <section>
                <SectionTitle icon={CheckCircle}>What it does</SectionTitle>
                <div className="mt-5 grid sm:grid-cols-2 gap-4">
                  {project.highlights.map((h) => (
                    <div key={h.title} className="rounded-2xl bg-white border border-stone-200 p-5">
                      <h3 className="text-sm font-bold text-stone-900">{h.title}</h3>
                      <p className="mt-1.5 text-[13px] text-stone-600 leading-relaxed">{h.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Architecture summary */}
            {project.architecture?.length > 0 && (
              <section>
                <SectionTitle icon={Layers}>Architecture at a glance</SectionTitle>
                <ol className="mt-5 rounded-2xl bg-[#093c33] text-white divide-y divide-white/10 overflow-hidden">
                  {project.architecture.map((point, i) => (
                    <li key={i} className="flex items-start gap-4 px-5 py-4">
                      <span className="shrink-0 w-7 h-7 rounded-full bg-[#f3843f] text-white text-xs font-extrabold flex items-center justify-center tabular-nums">
                        {i + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-white/90">{point}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* README */}
            {readme && (
              <section id="readme" className="scroll-mt-24">
                <SectionTitle icon={FileText}>{fromRepo ? "README" : "Architecture notes"}</SectionTitle>
                <p className="mt-2 text-xs text-stone-500">
                  {fromRepo
                    ? "The repository's own README.md, with its diagrams, folder structure and setup steps."
                    : "Written from the repository's source code: how it is structured, how it talks to the backend and how to run it."}
                </p>

                <div className="mt-5 rounded-[24px] bg-white border border-stone-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between gap-3 px-5 sm:px-7 py-3.5 bg-[#fdfbf7] border-b border-stone-200">
                    <div className="flex items-center gap-2 min-w-0 text-xs font-bold text-stone-700">
                      <FileText className="w-4 h-4 text-stone-400 shrink-0" />
                      <span className="truncate">
                        {fromRepo ? "README.md" : "ARCHITECTURE.md"}
                        <span className="font-semibold text-stone-400"> · {project.repo}</span>
                      </span>
                    </div>
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-[#093c33] hover:text-[#f3843f] transition-colors"
                      >
                        <span className="hidden sm:inline">Open on GitHub</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <div className="px-5 sm:px-8 py-6 sm:py-8">
                    <ProjectReadme
                      markdown={readme}
                      repo={project.repo}
                      branch={stats?.defaultBranch || "main"}
                      repoPrivate={project.repoPrivate}
                    />
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24">
            <div className="rounded-2xl bg-white border border-stone-200 p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">Tech stack</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.tech.map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#faf7f2] border border-stone-200 text-stone-800">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-stone-200 p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">Repository</h2>
              <dl className="mt-2">
                <SideRow label="Status">{live ? "Live in production" : "Source code"}</SideRow>
                <SideRow label="Platform">{project.platform}</SideRow>
                <SideRow label="Repository">
                  {project.githubUrl ? (
                    <a href={project.githubUrl} target="_blank" rel="noreferrer" className="hover:text-[#f3843f] break-all">
                      {project.repo}
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Private
                    </span>
                  )}
                </SideRow>
                {stats?.language && <SideRow label="Main language">{stats.language}</SideRow>}
                {stats?.license && (
                  <SideRow label="License">
                    <span className="inline-flex items-center gap-1">
                      <Scale className="w-3 h-3" /> {stats.license}
                    </span>
                  </SideRow>
                )}
                {stats && <SideRow label="Stars">{stats.stars.toLocaleString()}</SideRow>}
                {updated && <SideRow label="Last push">{updated}</SideRow>}
              </dl>
              {readme && (
                <a href="#readme" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#093c33] hover:text-[#f3843f] transition-colors">
                  <span>Jump to {fromRepo ? "README" : "architecture notes"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {related && (
              <Link
                href={`/projects/${related.slug}`}
                className="group block rounded-2xl bg-white border border-stone-200 p-5 hover:border-stone-300 hover:shadow-md transition-all"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Related project</span>
                <span className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-stone-900 group-hover:text-[#f3843f] transition-colors">{related.title}</span>
                  <ArrowRight className="w-4 h-4 text-stone-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span className="mt-1.5 block text-xs text-stone-600 leading-relaxed line-clamp-2">{related.tagline}</span>
              </Link>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
