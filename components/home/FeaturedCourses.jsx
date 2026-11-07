"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, FileText, Code2, BookOpen, GitBranch } from "lucide-react";
import { popularCourses } from "@/data/landingData";
import { projectsList } from "@/data/projectsData";
import { RightEdgeConcentricRings } from "@/components/DecorativeShapes";
import LikeButton from "@/components/LikeButton";
import RatingBadge from "@/components/RatingBadge";
import ProjectDetailModal from "@/components/ProjectDetailModal";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { api, friendlyMessage, formatBytes } from "@/lib/api";
import { accentOf, CardIcon, STATIC_ACCENT_BY_ID } from "@/lib/cardTheme";

/** API note → card view-model. */
function fromNote(n) {
  const accent = accentOf(n.accent);
  return {
    id: n.slug,
    title: n.title,
    category: n.category || "General",
    badgeClass: accent.badge,
    iconClass: accent.icon,
    icon: n.icon,
    tagline: n.tagline || n.description || "",
    pages: n.pages ?? null,
    fileSize: n.file ? formatBytes(n.file.byteSize) : "",
    hasFile: Boolean(n.file),
    projectBadge: n.projectBadge || (n.projectUrl ? "Source Code" : "Free Notes"),
    projectId: n.projectId || "",
    projectUrl: n.projectUrl || "",
    href: `/pdf/${n.slug}`,
  };
}

/** Static landing card → the same view-model (offline fallback only). */
function fromStatic(c) {
  const accent = accentOf(STATIC_ACCENT_BY_ID[c.id]);
  return {
    id: c.id,
    title: c.title,
    category: c.category,
    badgeClass: c.badgeColor || accent.badge,
    iconClass: accent.icon,
    icon: c.iconName,
    tagline: c.tagline,
    pages: Number.parseInt(c.pages, 10) || null,
    fileSize: "",
    hasFile: false,
    projectBadge: c.projectBadge,
    projectId: c.projectId,
    projectUrl: "",
    href: `/pdf/${c.pdfId}`,
  };
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[26px] border border-stone-200/90 p-6 sm:p-7 shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <span className="h-6 w-24 rounded-full bg-stone-100" />
        <span className="h-7 w-14 rounded-full bg-stone-100" />
      </div>
      <div className="h-6 w-2/3 rounded bg-stone-100" />
      <div className="mt-3 h-3.5 w-full rounded bg-stone-100" />
      <div className="mt-2 h-3.5 w-5/6 rounded bg-stone-100" />
      <div className="mt-6 pt-4 border-t border-stone-100 flex gap-2">
        <span className="h-6 w-20 rounded-lg bg-stone-100" />
        <span className="h-6 w-28 rounded-lg bg-stone-100" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2.5">
        <span className="h-10 rounded-xl bg-stone-100" />
        <span className="h-10 rounded-xl bg-stone-100" />
      </div>
    </div>
  );
}

export default function FeaturedCourses() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [activeCategory, setActiveCategory] = useState("All Notes");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);

  // Cards come from the backend (managed in the admin panel). If the backend
  // cannot be reached we fall back to the built-in cards with "–" stats.
  const [cards, setCards] = useState(null); // null = loading
  const [stats, setStats] = useState(null); // keyed by note slug; null = loading
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .listNotes({ featured: true })
      .then(({ data }) => {
        if (cancelled) return;
        const list = data.map(fromNote);
        setCards(list);
        if (!list.length) {
          setStats({});
          return;
        }
        api
          .getNoteStats(list.map((c) => c.id))
          .then((res) => {
            if (cancelled) return;
            setStats(res.data);
            setStatsError(false);
          })
          .catch(() => {
            if (cancelled) return;
            setStats({});
            setStatsError(true);
          });
      })
      .catch(() => {
        if (cancelled) return;
        setCards(popularCourses.map(fromStatic));
        setStats({});
        setStatsError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    for (const c of cards ?? []) set.add(c.category);
    return ["All Notes", ...set];
  }, [cards]);

  const updateStat = (slug, next) => setStats((prev) => ({ ...(prev ?? {}), [slug]: next }));
  const cardStats = (id) => (stats && stats[id]) || null;
  // A card whose note isn't in the backend is also "unavailable", not "0 likes".
  const isUnavailable = (id) => statsError || (stats !== null && !stats[id]);

  // Likes / ratings are member actions. Signed-out visitors only see the numbers
  // (the widgets render read-only), and the API refuses anonymous writes anyway.
  const handleLike = async (card) => {
    if (!user) return;
    try {
      const { data } = await api.likeNote(card.id);
      updateStat(card.id, data);
    } catch (err) {
      toast.error(friendlyMessage(err, "We couldn't save your like. Please try again."));
      throw err; // LikeButton reverts its optimistic state
    }
  };

  const filtered = (cards ?? []).filter((c) => {
    const matchesCategory = activeCategory === "All Notes" || c.category === activeCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === "" || c.title.toLowerCase().includes(query) || c.tagline.toLowerCase().includes(query) || c.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  // The note overview is public; the reader itself asks for sign-in.
  const handleOpenPdf = (card) => router.push(card.href);

  const handleOpenProject = (card) => {
    const project = card.projectId && projectsList.find((p) => p.id === card.projectId);
    if (project) {
      setSelectedProject(project);
      return;
    }
    if (card.projectUrl) {
      window.open(card.projectUrl, "_blank", "noopener,noreferrer");
      return;
    }
    toast.info("The project files for this note are coming soon.", { duration: 2500 });
  };

  const pagesLabel = (card) => {
    const n = cardStats(card.id)?.pages || card.pages;
    if (n) return `${n} Pages`;
    if (card.fileSize) return card.fileSize;
    return "PDF Notes";
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
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((category) => (
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

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 max-w-6xl mx-auto">
          {cards === null && [0, 1, 2].map((i) => <SkeletonCard key={i} />)}
          {filtered.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-[26px] border border-stone-200/90 p-6 sm:p-7 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                {/* Header: Category Badge + Like Heart */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${card.badgeClass}`}>
                    <CardIcon name={card.icon} className={`w-3.5 h-3.5 ${card.iconClass}`} />
                    <span>{card.category}</span>
                  </span>

                  <LikeButton
                    likes={isUnavailable(card.id) ? null : cardStats(card.id)?.likes ?? null}
                    liked={cardStats(card.id)?.liked ?? false}
                    onToggle={() => handleLike(card)}
                    readOnly={!user}
                    variant="badge"
                  />
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-[#111827] group-hover:text-[#f3843f] transition-colors leading-tight">
                  {card.title}
                </h3>

                <p className="mt-2.5 text-xs sm:text-[13px] text-stone-600 font-medium leading-relaxed line-clamp-2">{card.tagline}</p>

                <div className="mt-5 pt-4 border-t border-stone-100 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-[11px] font-bold text-stone-700">
                    <FileText className="w-3 h-3 text-[#093c33]" />
                    <span>{pagesLabel(card)}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-[11px] font-bold text-stone-700">
                    {card.projectUrl && !card.projectId ? <GitBranch className="w-3 h-3 text-[#f3843f]" /> : <Code2 className="w-3 h-3 text-[#f3843f]" />}
                    <span>{card.projectBadge}</span>
                  </span>

                  {/* Ratings come from the review form on the reader page. */}
                  <RatingBadge className="ml-auto" value={cardStats(card.id)?.rating ?? null} count={cardStats(card.id)?.ratingCount ?? 0} loading={stats === null} unavailable={isUnavailable(card.id)} />
                </div>
              </div>

              <div className="mt-6 pt-2 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleOpenPdf(card)}
                  className="cursor-pointer py-2.5 px-3 rounded-xl text-xs font-bold text-stone-800 bg-stone-100/90 hover:bg-[#093c33] hover:text-white border border-stone-200/80 transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Read PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenProject(card)}
                  className="cursor-pointer py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-[#093c33] hover:bg-[#f3843f] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>View Project</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty states */}
        {cards !== null && filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 max-w-xl mx-auto">
            <BookOpen className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-800">{cards.length === 0 ? "New notes are on the way" : "No notes found"}</h3>
            <p className="text-xs text-stone-500 mt-1">
              {cards.length === 0 ? "We're preparing the first handbooks. Check back soon." : "Try adjusting your search terms or select another category filter."}
            </p>
            {cards.length > 0 && (
              <button
                onClick={() => {
                  setActiveCategory("All Notes");
                  setSearchQuery("");
                }}
                className="cursor-pointer mt-4 px-5 py-2 rounded-full text-xs font-bold bg-[#f3843f] text-white hover:bg-[#d96e2b] transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>

      <ProjectDetailModal project={selectedProject} isOpen={Boolean(selectedProject)} onClose={() => setSelectedProject(null)} />
    </section>
  );
}
