"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText, Download, BookOpen, Sparkles, ArrowLeft, ChevronLeft, ChevronRight, Loader2, Code2, Paperclip, GitBranch, ExternalLink, FileSearch, RefreshCw, PanelLeft, X, Info, Clock, Layers, UserCircle2, Home, LogOut, Lock, LogIn, UserPlus, Star, MessageSquareHeart, PenLine,
} from "lucide-react";
import LikeButton from "@/components/LikeButton";
import RatingBadge from "@/components/RatingBadge";
import ReviewDialog from "@/components/pdf/ReviewDialog";
import CodeBlock from "@/components/notes/CodeBlock";
import ErrorState from "@/components/ui/ErrorState";
import { GopoIcon } from "@/components/BrandLogo";
import { useAuth, loginHref } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { api, ApiError, absoluteUrl, friendlyMessage, formatBytes, isStaff } from "@/lib/api";
import { accentOf, CardIcon } from "@/lib/cardTheme";
import { pdfNotesList } from "@/data/pdfNotesData";
import { popularCourses } from "@/data/landingData";

/** Build the reader model from an API note (chapters fall back to the built-in catalog). */
function fromNote(n, member) {
  const legacy = popularCourses.find((c) => c.id === n.slug);
  const catalog = legacy ? pdfNotesList.find((p) => p.id === legacy.pdfId) : null;
  // The API already strips chapter bodies / code for visitors; apply the same
  // rule to the built-in catalog copy so nothing leaks client-side.
  const rawChapters = n.chapters?.length ? n.chapters : catalog?.chapters ?? [];
  const chapters = member ? rawChapters : rawChapters.map((c) => ({ number: c.number, title: c.title }));
  return {
    id: n.id,
    slug: n.slug,
    title: n.title,
    category: n.category || "Notes",
    tagline: n.tagline || "",
    description: n.description || catalog?.description || "",
    level: n.level || "All Levels",
    accent: n.accent,
    icon: n.icon,
    pages: n.pages ?? catalog?.pages ?? null,
    fileSize: n.file ? formatBytes(n.file.byteSize) : catalog?.fileSize || "",
    tags: n.tags?.length ? n.tags : catalog?.tags ?? [],
    instructor: n.instructor?.name ? n.instructor : catalog ? { name: catalog.author, role: "", company: "", avatar: "" } : null,
    chapters,
    code: (n.blocks ?? []).filter((b) => b.type === "CODE"),
    codeCount: n.codeCount ?? (n.blocks ?? []).filter((b) => b.type === "CODE").length,
    attachmentCount: n.attachmentCount ?? 0,
    hasFile: Boolean(n.hasFile ?? n.file),
    member,
    projectUrl: n.projectUrl || "",
    demoUrl: n.demoUrl || "",
    projectTitle: n.projectTitle || "",
    updatedAt: n.updatedAt,
  };
}

/** Built-in catalog entry (legacy /pdf/<catalog id> links) → reader model. */
function fromCatalog(pdf, member) {
  return {
    member,
    codeCount: 0,
    attachmentCount: 0,
    id: null,
    slug: popularCourses.find((c) => c.pdfId === pdf.id)?.id ?? null,
    title: pdf.title,
    category: pdf.category,
    tagline: "",
    description: pdf.description,
    level: "All Levels",
    accent: "emerald",
    icon: "BookOpen",
    pages: pdf.pages,
    fileSize: pdf.fileSize,
    tags: pdf.tags ?? [],
    instructor: { name: pdf.author, role: "", company: "", avatar: "" },
    chapters: member ? pdf.chapters ?? [] : (pdf.chapters ?? []).map((c) => ({ number: c.number, title: c.title })),
    code: [],
    hasFile: false,
    projectUrl: "",
    demoUrl: "",
    projectTitle: "",
    updatedAt: null,
  };
}

function FullScreen({ children }) {
  return <div className="min-h-screen bg-[#f6f3ee] flex flex-col items-center justify-center gap-3 text-stone-500">{children}</div>;
}

/**
 * Full-page, login-protected reader for one note. `id` is the note slug (or a
 * legacy catalog id). Logged-out visitors are sent to /login and come back.
 */
export default function PdfReaderPage({ id }) {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const toast = useToast();
  const path = `/pdf/${id}`;

  const [doc, setDoc] = useState(undefined); // undefined = loading, null = not found
  const [loadError, setLoadError] = useState("");
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(false);
  const [file, setFile] = useState(null); // { primary, attachments }
  const [fileError, setFileError] = useState("");
  const [fileAttempt, setFileAttempt] = useState(0);
  const [view, setView] = useState(null); // pdf | chapter | code | files | about
  const [chapterIndex, setChapterIndex] = useState(0);
  const [codeIndex, setCodeIndex] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [reviews, setReviews] = useState(null); // written reviews for the About view
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewAuto, setReviewAuto] = useState(false); // opened by the timer, not the button

  // The overview is public; the server decides how much of the note a
  // visitor may see, so re-fetch once the session is known (and on login/logout).
  const userId = user?.id ?? null;
  useEffect(() => {
    if (loading) return undefined;
    let cancelled = false;
    const member = Boolean(userId);
    api
      .getNote(id)
      .then(({ data }) => !cancelled && setDoc(fromNote(data, member)))
      .catch((err) => {
        if (cancelled) return;
        const pdf = pdfNotesList.find((p) => p.id === id);
        if (pdf) {
          setDoc(fromCatalog(pdf, member));
          return;
        }
        setDoc(null);
        if (!(err instanceof ApiError && err.status === 404)) setLoadError(friendlyMessage(err, "We couldn't load this note right now."));
      });
    return () => {
      cancelled = true;
    };
  }, [id, loading, userId]);

  const noteSlug = doc?.slug ?? null;

  // Real likes / rating for this note (visitors see counts; members see their own too).
  useEffect(() => {
    if (!noteSlug) return undefined;
    let cancelled = false;
    api
      .getNoteStats([noteSlug])
      .then(({ data }) => {
        if (cancelled) return;
        setStats(data[noteSlug] ?? null);
        setStatsError(!data[noteSlug]);
      })
      .catch(() => {
        if (cancelled) return;
        setStats(null);
        setStatsError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [noteSlug, userId]);

  // Written reviews (public) for the About view.
  const loadReviews = useCallback(() => {
    if (!noteSlug) return;
    api
      .getNoteReviews(noteSlug, 20)
      .then(({ data }) => setReviews(data))
      .catch(() => setReviews([]));
  }, [noteSlug]);
  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Ask for a review once a member has actually spent ~3 minutes reading
  // (tab visible), hasn't rated yet, and hasn't been asked for this note before.
  const myRating = stats?.myRating ?? null;
  const statsReady = stats !== null;
  useEffect(() => {
    if (!noteSlug || !userId || !statsReady || myRating) return undefined;
    const flag = `review_prompted:${noteSlug}`;
    try {
      if (localStorage.getItem(flag)) return undefined;
    } catch {
      /* storage blocked → we simply never auto-prompt */
    }
    const NEEDED = 180; // seconds of visible reading
    let seconds = 0;
    const tick = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      seconds += 5;
      if (seconds < NEEDED) return;
      clearInterval(tick);
      try {
        localStorage.setItem(flag, new Date().toISOString());
      } catch {
        /* ignore */
      }
      setReviewAuto(true);
      setReviewOpen(true);
    }, 5000);
    return () => clearInterval(tick);
  }, [noteSlug, userId, statsReady, myRating]);

  // Signed links to the PDF (members only).
  const hasFile = Boolean(doc?.hasFile);
  useEffect(() => {
    if (!noteSlug || !user || !hasFile) return undefined;
    let cancelled = false;
    api
      .getNoteFile(noteSlug)
      .then(({ data }) => {
        if (cancelled) return;
        setFile(data);
        setFileError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setFile(null);
        setFileError(friendlyMessage(err, "We couldn't open the PDF right now."));
      });
    return () => {
      cancelled = true;
    };
  }, [noteSlug, user, hasFile, fileAttempt]);

  if (loading) {
    return (
      <FullScreen>
        <Loader2 className="w-6 h-6 animate-spin text-[#093c33]" />
        <p className="text-sm">Checking your session…</p>
      </FullScreen>
    );
  }

  if (doc === undefined) {
    return (
      <FullScreen>
        <Loader2 className="w-6 h-6 animate-spin text-[#093c33]" />
        <p className="text-sm">Opening your notes…</p>
      </FullScreen>
    );
  }

  if (doc === null) {
    return (
      <div className="min-h-screen bg-[#f6f3ee]">
        <ErrorState
          eyebrow={loadError ? "Connection" : "Not found"}
          title={loadError ? "We couldn't load this note" : "This note isn't available"}
          message={loadError || "It may have been moved or unpublished. Browse the catalog to find what you need."}
          icon={FileSearch}
          onRetry={loadError ? () => window.location.reload() : undefined}
          homeHref="/#courses"
          homeLabel="Browse notes"
        />
      </div>
    );
  }

  const accent = accentOf(doc.accent);
  const chapters = doc.chapters;
  const attachments = file?.attachments ?? [];
  const signedIn = Boolean(user);
  const locked = !signedIn; // content views need a (free) account
  const hasFiles = doc.attachmentCount > 0 || attachments.length > 0 || Boolean(doc.projectUrl) || Boolean(doc.demoUrl);
  const views = [
    doc.hasFile && { key: "pdf", label: "PDF", icon: FileText, count: doc.pages ? `${doc.pages}p` : null },
    chapters.length > 0 && { key: "chapter", label: "Chapters", icon: BookOpen, count: chapters.length },
    doc.codeCount > 0 && { key: "code", label: "Code", icon: Code2, count: doc.codeCount },
    hasFiles && { key: "files", label: "Files", icon: Paperclip, count: doc.attachmentCount || attachments.length || null },
    { key: "about", label: "About", icon: Info, count: null },
  ].filter(Boolean);
  // Visitors land on the overview; members land on the richest view.
  const defaultView = signedIn ? views[0].key : "about";
  const activeView = view && views.some((v) => v.key === view) ? view : defaultView;
  const chapter = chapters[chapterIndex] || chapters[0];
  const snippet = doc.code[codeIndex] || doc.code[0];
  const empty = !doc.hasFile && chapters.length === 0 && doc.codeCount === 0;
  const signInHref = loginHref(path);
  const requireSignIn = (what) => {
    toast.info(`Sign in to ${what}. It's free.`, { duration: 2500 });
    router.push(signInHref);
  };

  const go = (next) => {
    setView(next);
    setDrawerOpen(false);
  };

  const handleDownload = () => {
    if (!signedIn) return requireSignIn("download this note");
    setDownloading(true);
    if (noteSlug) api.downloadNote(noteSlug).then(({ data }) => setStats(data)).catch(() => {});
    if (file?.primary?.downloadUrl) {
      window.open(absoluteUrl(file.primary.downloadUrl), "_blank", "noopener,noreferrer");
    } else {
      const content = `${doc.title.toUpperCase()}\n${doc.instructor?.name ? `Author: ${doc.instructor.name}\n` : ""}Category: ${doc.category}${doc.pages ? ` | ${doc.pages} Pages` : ""}\nPlatform: Gopo Workspace Open Education & Project Hub (100% Free)\n\nOVERVIEW:\n${doc.description}\n\nTABLE OF CONTENTS:\n${chapters
        .map((c, i) => `[Chapter ${c.number || i + 1}] ${c.title}\n   ${c.summary}\n   ${c.contentSnippet}\n`)
        .join("\n")}`;
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${doc.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_notes.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    setTimeout(() => setDownloading(false), 800);
  };

  const openReview = () => {
    if (!signedIn) return requireSignIn("review this note");
    setReviewAuto(false);
    setReviewOpen(true);
  };
  const submitReview = async (n, text) => {
    try {
      const { data } = await api.rateNote(noteSlug, n, text);
      setStats(data);
      setReviewOpen(false);
      loadReviews();
      toast.success(text ? "Thanks! Your review is live." : `Thanks! You rated this ${n} star${n === 1 ? "" : "s"}.`, { duration: 2500 });
    } catch (err) {
      throw new Error(friendlyMessage(err, "We couldn't save your review. Please try again."));
    }
  };
  const like = async () => {
    if (!signedIn) return requireSignIn("like this note");
    try {
      const { data } = await api.likeNote(noteSlug);
      setStats(data);
    } catch (err) {
      toast.error(friendlyMessage(err, "We couldn't save your like. Please try again."));
      throw err;
    }
  };

  /* ── Side panel content (shared by desktop panel and mobile drawer) ── */
  const panel = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-stone-200/80">
        <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1">
          {views.map((v) => {
            const Icon = v.icon;
            const active = activeView === v.key;
            return (
              <button
                key={v.key}
                type="button"
                onClick={() => go(v.key)}
                title={v.label}
                className={`cursor-pointer flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-extrabold transition-colors ${
                  active ? "bg-white text-[#093c33] shadow-sm" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Chapters list is always handy */}
        {chapters.length > 0 && (
          <section>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-stone-400 mb-2">Contents · {chapters.length} chapters</p>
            <ol className="space-y-1">
              {chapters.map((c, i) => {
                const active = activeView === "chapter" && chapterIndex === i;
                return (
                  <li key={`${c.number}-${i}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setChapterIndex(i);
                        go("chapter");
                      }}
                      className={`cursor-pointer w-full text-left flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-colors ${
                        active ? "bg-[#093c33] text-white shadow-sm" : "hover:bg-stone-100 text-stone-700"
                      }`}
                    >
                      <span className={`shrink-0 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${active ? "bg-white/15 text-emerald-100" : "bg-stone-100 text-stone-500"}`}>{c.number || i + 1}</span>
                      <span className={`flex-1 leading-snug ${active ? "font-bold" : "font-medium"}`}>{c.title}</span>
                      {locked && <Lock className={`w-3 h-3 shrink-0 mt-0.5 ${active ? "text-emerald-100/70" : "text-stone-300"}`} />}
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {doc.codeCount > 0 && locked && (
          <section>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-stone-400 mb-2">Code · {doc.codeCount}</p>
            <button type="button" onClick={() => go("code")} className="cursor-pointer w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-stone-600 hover:bg-stone-100">
              <Lock className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-medium">
                {doc.codeCount} snippet{doc.codeCount === 1 ? "" : "s"} · sign in to view
              </span>
            </button>
          </section>
        )}
        {doc.code.length > 0 && (
          <section>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-stone-400 mb-2">Code · {doc.code.length}</p>
            <ul className="space-y-1">
              {doc.code.map((b, i) => {
                const active = activeView === "code" && codeIndex === i;
                return (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setCodeIndex(i);
                        go("code");
                      }}
                      className={`cursor-pointer w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-colors ${active ? "bg-[#093c33] text-white" : "hover:bg-stone-100 text-stone-700"}`}
                    >
                      <Code2 className={`w-3.5 h-3.5 shrink-0 ${active ? "text-[#f3843f]" : "text-stone-400"}`} />
                      <span className="truncate font-medium font-mono">{b.content.filename || `${b.content.language} snippet`}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section className="pt-4 border-t border-stone-200/80">
          {doc.instructor?.name && (
            <div className="flex items-center gap-3">
              {doc.instructor.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={doc.instructor.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-stone-200" />
              ) : (
                <span className="w-10 h-10 rounded-full bg-[#093c33] text-white font-extrabold flex items-center justify-center">{doc.instructor.name.slice(0, 1)}</span>
              )}
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-stone-900 truncate">{doc.instructor.name}</p>
                <p className="text-[11px] text-stone-500 truncate">{[doc.instructor.role, doc.instructor.company].filter(Boolean).join(" · ") || "Curator"}</p>
              </div>
            </div>
          )}
          {doc.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {doc.tags.map((t) => (
                <span key={t} className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-md border border-stone-200 text-stone-600">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );

  /* ── Main area ── */
  let main;
  if (locked && activeView !== "about") {
    const what = { pdf: "the full PDF", chapter: chapter ? `“${chapter.title}”` : "the chapters", code: "the code snippets", files: "the downloads" }[activeView];
    main = (
      <div className="h-full overflow-y-auto">
        <div className="min-h-full flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md text-center">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-3xl bg-[#f3843f]/15 blur-xl" />
              <div className="relative w-20 h-20 rounded-3xl bg-white border border-stone-200 shadow-lg flex items-center justify-center">
                <Lock className="w-8 h-8 text-[#093c33]" />
              </div>
            </div>
            <p className="mt-6 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#f3843f]">Members only · always free</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">Sign in to read {what}</h2>
            <p className="mt-3 text-sm text-stone-600 leading-relaxed">
              A free account unlocks every handbook: the full PDF, chapter notes, copy-ready code and downloads. You&apos;ll come straight back here.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={signInHref} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white bg-[#093c33] hover:bg-[#f3843f] shadow-md transition-all active:scale-95">
                <LogIn className="w-4 h-4" /> Sign in
              </Link>
              <Link href={`${signInHref}&mode=register`} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-stone-800 bg-white border border-stone-200 hover:border-[#093c33] transition-all active:scale-95">
                <UserPlus className="w-4 h-4 text-[#f3843f]" /> Create free account
              </Link>
            </div>
            <ul className="mt-8 grid grid-cols-2 gap-2 text-left text-xs text-stone-600">
              {[doc.hasFile && `${doc.pages ? `${doc.pages}-page ` : ""}PDF, readable online`, chapters.length > 0 && `${chapters.length} chapter${chapters.length === 1 ? "" : "s"} with key concepts`, doc.codeCount > 0 && `${doc.codeCount} code snippet${doc.codeCount === 1 ? "" : "s"} to copy`, (doc.attachmentCount > 0 || doc.projectUrl) && "Project source & downloads"]
                .filter(Boolean)
                .map((t) => (
                  <li key={t} className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-stone-200">
                    <Sparkles className="w-3.5 h-3.5 text-[#f3843f] shrink-0 mt-0.5" /> {t}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    );
  } else if (activeView === "pdf") {
    main = (
      <div className="h-full w-full bg-stone-200/70 flex">
        {!file && !fileError && (
          <div className="m-auto flex flex-col items-center gap-3 text-stone-500">
            <Loader2 className="w-6 h-6 animate-spin text-[#093c33]" />
            <p className="text-sm">Preparing your PDF…</p>
          </div>
        )}
        {fileError && (
          <div className="m-auto max-w-sm text-center px-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-white border border-stone-200 flex items-center justify-center">
              <FileText className="w-6 h-6 text-rose-500" />
            </div>
            <p className="mt-4 text-sm font-bold text-stone-800">{fileError}</p>
            <button type="button" onClick={() => setFileAttempt((n) => n + 1)} className="cursor-pointer mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#093c33] text-white">
              <RefreshCw className="w-3.5 h-3.5" /> Try again
            </button>
          </div>
        )}
        {file?.primary && <iframe title={`${doc.title} — PDF`} src={`${absoluteUrl(file.primary.viewUrl)}#toolbar=1&navpanes=0&view=FitH`} className="w-full h-full border-0" />}
      </div>
    );
  } else if (activeView === "chapter" && chapter) {
    main = (
      <div className="h-full overflow-y-auto">
        <article className="max-w-3xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
          <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[0.18em] text-stone-400">
            <span>
              Chapter {chapter.number || chapterIndex + 1} of {chapters.length}
            </span>
            <span className={`px-2.5 py-1 rounded-full border normal-case tracking-normal ${accent.badge}`}>{doc.category}</span>
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-stone-900 leading-tight tracking-tight">{chapter.title}</h2>
          {/* progress */}
          <div className="mt-6 flex gap-1">
            {chapters.map((_, i) => (
              <span key={i} className={`h-1 flex-1 rounded-full ${i <= chapterIndex ? "bg-[#f3843f]" : "bg-stone-200"}`} />
            ))}
          </div>

          {chapter.summary && (
            <div className="mt-8 p-6 rounded-3xl bg-amber-50/70 border border-amber-200/70">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 mb-2">Summary</p>
              <p className="text-[15px] text-stone-800 leading-relaxed">{chapter.summary}</p>
            </div>
          )}
          {chapter.contentSnippet && (
            <div className="mt-6 rounded-3xl bg-[#0f2820] text-stone-100 p-6 sm:p-7 shadow-xl shadow-emerald-950/20">
              <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#f3843f] mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Key concept
              </p>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{chapter.contentSnippet}</p>
            </div>
          )}

          <div className="mt-10 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={chapterIndex === 0}
              onClick={() => setChapterIndex((i) => Math.max(0, i - 1))}
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-white border border-stone-200 text-stone-700 hover:border-[#093c33] disabled:opacity-40 disabled:cursor-default"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              type="button"
              disabled={chapterIndex >= chapters.length - 1}
              onClick={() => setChapterIndex((i) => Math.min(chapters.length - 1, i + 1))}
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-[#093c33] text-white hover:bg-[#f3843f] disabled:opacity-40 disabled:cursor-default"
            >
              Next chapter <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </article>
      </div>
    );
  } else if (activeView === "code" && snippet) {
    main = (
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 py-10">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-stone-400">
            Snippet {codeIndex + 1} of {doc.code.length}
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-stone-900 font-mono">{snippet.content.filename || `${snippet.content.language} snippet`}</h2>
          <p className="text-sm text-stone-500 mt-1">Copy and run alongside the handbook.</p>
          <CodeBlock code={snippet.content.code} language={snippet.content.language} filename={snippet.content.filename} />
        </div>
      </div>
    );
  } else if (activeView === "files") {
    main = (
      <div className="h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 sm:px-10 py-10 space-y-3">
          <h2 className="text-2xl font-extrabold text-stone-900">Downloads &amp; project</h2>
          <p className="text-sm text-stone-500 pb-2">Everything that ships with this note.</p>
          {doc.projectUrl && <FileRow href={doc.projectUrl} icon={GitBranch} title={doc.projectTitle || "Source code on GitHub"} sub={doc.projectUrl} />}
          {doc.demoUrl && <FileRow href={doc.demoUrl} icon={ExternalLink} title="Live demo" sub={doc.demoUrl} />}
          {attachments.map((a) => (
            <FileRow key={a.id} href={absoluteUrl(a.downloadUrl)} icon={Paperclip} title={a.originalName} sub={formatBytes(a.byteSize)} trailing={Download} />
          ))}
        </div>
      </div>
    );
  } else {
    // About (also the landing view when the note has no content yet)
    main = (
      <div className="h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${accent.badge}`}>
            <CardIcon name={doc.icon} className={`w-3.5 h-3.5 ${accent.icon}`} />
            {doc.category}
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">{doc.title}</h2>
          {doc.tagline && <p className="mt-3 text-base text-stone-600 font-medium">{doc.tagline}</p>}

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat icon={FileText} label="Pages" value={stats?.pages ?? doc.pages ?? "–"} />
            <Stat icon={Layers} label="Level" value={doc.level} />
            <Stat icon={Download} label="Downloads" value={stats?.downloads ?? "–"} />
            <Stat icon={Clock} label="Updated" value={doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "–"} />
          </div>

          {empty ? (
            <div className="mt-8 p-8 rounded-3xl bg-white border border-dashed border-stone-300 text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-[#093c33]/5 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#f3843f]" />
              </div>
              <h3 className="mt-4 text-lg font-extrabold text-stone-900">This handbook is being prepared</h3>
              <p className="mt-1 text-sm text-stone-500 max-w-md mx-auto">The PDF and chapters will appear here as soon as they are published. Like the note to show you are waiting for it.</p>
              {isStaff(user) && doc.id && (
                <Link href={`/admin/notes/${doc.id}`} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#093c33] text-white hover:bg-[#f3843f]">
                  Add the PDF in admin <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ) : (
            doc.description && (
              <div className="mt-8 prose prose-stone max-w-none">
                <p className="text-[15px] text-stone-700 leading-relaxed whitespace-pre-line">{doc.description}</p>
              </div>
            )
          )}

          {!empty && (
            <div className="mt-8 flex flex-wrap gap-2">
              {views
                .filter((v) => v.key !== "about")
                .map((v) => {
                  const Icon = v.icon;
                  return (
                    <button key={v.key} type="button" onClick={() => go(v.key)} className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-white border border-stone-200 text-stone-800 hover:border-[#093c33] hover:text-[#093c33]">
                      <Icon className="w-4 h-4 text-[#f3843f]" /> Open {v.label.toLowerCase()}
                    </button>
                  );
                })}
            </div>
          )}

          {/* Reviews */}
          {noteSlug && (
            <section className="mt-12 pt-8 border-t border-stone-200/80">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#f3843f]">
                    <MessageSquareHeart className="w-3.5 h-3.5" />
                    Student reviews
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-3xl font-extrabold text-stone-900 tabular-nums">{stats?.rating != null ? stats.rating.toFixed(1) : "–"}</span>
                    <span className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={`w-4 h-4 ${n <= Math.round(stats?.rating ?? 0) ? "fill-amber-400 text-amber-400" : "text-stone-300"}`} />
                      ))}
                    </span>
                    <span className="text-xs text-stone-500">
                      {stats?.ratingCount ? `${stats.ratingCount} rating${stats.ratingCount === 1 ? "" : "s"}` : "No ratings yet"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={openReview}
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-white bg-[#093c33] hover:bg-[#f3843f] transition-colors"
                >
                  <PenLine className="w-4 h-4" />
                  {stats?.myRating ? "Edit your review" : "Write a review"}
                </button>
              </div>

              {reviews === null && <p className="mt-6 text-sm text-stone-400">Loading reviews…</p>}
              {reviews && reviews.length === 0 && (
                <p className="mt-6 p-5 rounded-2xl bg-white border border-dashed border-stone-300 text-sm text-stone-500 text-center">No written reviews yet. Be the first to share what helped you.</p>
              )}
              {reviews && reviews.length > 0 && (
                <ul className="mt-6 space-y-3">
                  {reviews.map((r) => (
                    <li key={r.id} className={`p-5 rounded-2xl bg-white border ${r.mine ? "border-[#093c33]/40" : "border-stone-200/90"}`}>
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f3843f] to-[#d96e2b] text-white text-[11px] font-extrabold flex items-center justify-center shrink-0">
                          {r.name.trim().slice(0, 1).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-stone-900 truncate">
                            {r.name}
                            {r.mine && <span className="ml-2 text-[10px] font-extrabold uppercase tracking-wider text-[#093c33]">You</span>}
                          </p>
                          <p className="text-[11px] text-stone-400">{new Date(r.at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</p>
                        </div>
                        <span className="flex gap-0.5 shrink-0">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? "fill-amber-400 text-amber-400" : "text-stone-300"}`} />
                          ))}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-stone-700 leading-relaxed whitespace-pre-line">{r.review}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f6f3ee] text-[#0f2820] font-sans antialiased">
      {/* Top bar */}
      <header className="shrink-0 h-16 bg-[#0b3329] text-white border-b border-emerald-900/40 flex items-center gap-3 px-3 sm:px-5">
        <Link href="/#courses" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-100/80 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/5">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Notes</span>
        </Link>
        <button type="button" onClick={() => setPanelOpen((o) => !o)} className="cursor-pointer hidden lg:inline-flex p-2 rounded-lg text-emerald-100/80 hover:text-white hover:bg-white/5" aria-label="Toggle side panel" title="Toggle side panel">
          <PanelLeft className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => setDrawerOpen(true)} className="cursor-pointer lg:hidden p-2 rounded-lg text-emerald-100/80 hover:text-white hover:bg-white/5" aria-label="Open contents">
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className={`hidden sm:flex w-9 h-9 rounded-xl border items-center justify-center shrink-0 ${accent.badge}`}>
            <CardIcon name={doc.icon} className={`w-4 h-4 ${accent.icon}`} />
          </span>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-extrabold leading-tight truncate">{doc.title}</h1>
            <p className="text-[11px] text-emerald-100/60 truncate">
              {doc.category}
              {(stats?.pages ?? doc.pages) ? ` · ${stats?.pages ?? doc.pages} pages` : ""}
              {doc.fileSize ? ` · ${doc.fileSize}` : ""}
            </p>
          </div>
        </div>

        {noteSlug && (
          <div className="hidden md:flex items-center gap-2">
            <RatingBadge tone="light" value={stats?.rating ?? null} count={stats?.ratingCount ?? 0} loading={stats === null && !statsError} unavailable={statsError} />
            {signedIn && (
              <button
                type="button"
                onClick={openReview}
                className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-colors"
                title={stats?.myRating ? "Edit your review" : "Write a review"}
              >
                <PenLine className="w-3.5 h-3.5 text-[#f3843f]" />
                {stats?.myRating ? "Your review" : "Review"}
              </button>
            )}
            <LikeButton likes={statsError ? null : stats?.likes ?? null} liked={stats?.liked ?? false} onToggle={like} readOnly={!signedIn} variant="badge" />
          </div>
        )}
        {!signedIn && (
          <Link href={signInHref} className="lg:hidden inline-flex items-center gap-1 text-xs font-bold text-white px-2.5 py-2 rounded-full bg-white/10">
            <LogIn className="w-4 h-4 text-[#f3843f]" />
          </Link>
        )}
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading || (signedIn && doc.hasFile && !file?.primary)}
          className="cursor-pointer inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs font-bold bg-[#f3843f] hover:bg-[#d96e2b] text-white shadow-sm transition-all active:scale-95 disabled:opacity-60"
        >
          <Download className={`w-4 h-4 ${downloading ? "animate-bounce" : ""}`} />
          <span className="hidden sm:inline">{doc.hasFile ? "Download PDF" : "Outline"}</span>
        </button>

        <div className="hidden lg:flex items-center gap-1 pl-2 ml-1 border-l border-white/10">
          <Link href="/" className="p-2 rounded-lg text-emerald-100/70 hover:text-white hover:bg-white/5" title="Home" aria-label="Home">
            <Home className="w-4 h-4" />
          </Link>
          {signedIn ? (
            <>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-100/80 px-2 max-w-[140px]">
                <UserCircle2 className="w-4 h-4 text-[#f3843f] shrink-0" />
                <span className="truncate">{user.name || user.email}</span>
              </span>
              <button type="button" onClick={() => logout().then(() => router.replace("/"))} className="cursor-pointer p-2 rounded-lg text-emerald-100/70 hover:text-white hover:bg-white/5" title="Sign out" aria-label="Sign out">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link href={signInHref} className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-lg hover:bg-white/10">
              <LogIn className="w-4 h-4 text-[#f3843f]" /> Sign in
            </Link>
          )}
          <Link href="/" className="ml-1" aria-label="Gopo Workspace home">
            <GopoIcon className="w-8 h-8" />
          </Link>
        </div>
      </header>

      {/* Mobile rating row */}
      {noteSlug && (
        <div className="md:hidden shrink-0 bg-[#0b3329] px-3 pb-2 flex items-center justify-between gap-2">
          <RatingBadge tone="light" value={stats?.rating ?? null} count={stats?.ratingCount ?? 0} loading={stats === null && !statsError} unavailable={statsError} />
          <div className="flex items-center gap-2">
            {signedIn && (
              <button type="button" onClick={openReview} className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-white/10 border border-white/15">
                <PenLine className="w-3.5 h-3.5 text-[#f3843f]" />
                {stats?.myRating ? "Your review" : "Review"}
              </button>
            )}
            <LikeButton likes={statsError ? null : stats?.likes ?? null} liked={stats?.liked ?? false} onToggle={like} readOnly={!signedIn} variant="badge" />
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 min-h-0 flex">
        {panelOpen && <aside className="hidden lg:flex w-80 xl:w-96 shrink-0 bg-white border-r border-stone-200 flex-col">{panel}</aside>}

        {drawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="w-80 max-w-[85%] bg-white h-full flex flex-col animate-in slide-in-from-left duration-200">
              <div className="h-14 px-4 flex items-center justify-between border-b border-stone-200">
                <span className="text-sm font-extrabold text-stone-900">Contents</span>
                <button type="button" onClick={() => setDrawerOpen(false)} className="cursor-pointer p-2 rounded-lg hover:bg-stone-100" aria-label="Close">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 min-h-0">{panel}</div>
            </div>
            <div className="flex-1 bg-black/50" onClick={() => setDrawerOpen(false)} />
          </div>
        )}

        <main className="flex-1 min-w-0 min-h-0 bg-[#f6f3ee]">{main}</main>
      </div>
      <ReviewDialog
        open={reviewOpen}
        auto={reviewAuto}
        title={doc.title}
        initial={{ rating: stats?.myRating ?? 0, review: stats?.myReview ?? "" }}
        onSubmit={submitReview}
        onClose={() => setReviewOpen(false)}
      />
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-3.5">
      <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
        <Icon className="w-3.5 h-3.5 text-[#f3843f]" /> {label}
      </p>
      <p className="mt-1 text-base font-extrabold text-stone-900 truncate">{value}</p>
    </div>
  );
}

function FileRow({ href, icon: Icon, title, sub, trailing: Trailing = ExternalLink }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-2xl border border-stone-200 hover:border-[#093c33] bg-white transition-colors">
      <span className="w-10 h-10 rounded-xl bg-[#093c33]/5 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-[#093c33]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-stone-900 truncate">{title}</p>
        <p className="text-[11px] text-stone-500 truncate">{sub}</p>
      </div>
      <Trailing className="w-4 h-4 text-stone-400" />
    </a>
  );
}
