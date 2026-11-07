"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Terminal, CalendarDays, ExternalLink, ChevronLeft, ChevronRight, Loader2, Lightbulb, FileText, Clock, Database, Tag, History, ShieldCheck, Sparkles, WifiOff,
} from "lucide-react";
import { useAuth, loginHref } from "@/components/AuthProvider";
import ErrorState from "@/components/ui/ErrorState";
import SolutionCode from "@/components/daily/SolutionCode";
import { api, ApiError, friendlyMessage, isStaff } from "@/lib/api";
import { DIFFICULTY_CLASS, formatDay, languageLabel } from "@/lib/dailyCode";

const PLATFORM_CLASS = {
  LeetCode: "bg-orange-50 text-orange-800 border-orange-200",
  GeeksforGeeks: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Codeforces: "bg-sky-50 text-sky-800 border-sky-200",
  CodeChef: "bg-amber-50 text-amber-900 border-amber-200",
  HackerRank: "bg-green-50 text-green-800 border-green-200",
  InterviewBit: "bg-indigo-50 text-indigo-800 border-indigo-200",
  Other: "bg-stone-100 text-stone-700 border-stone-200",
};

function Chip({ className = "", children }) {
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${className}`}>{children}</span>;
}

/**
 * /today-code and /today-code/<date>: the problem-of-the-day solution.
 * Members only. Signed-out visitors are sent to sign in and come straight back.
 */
export default function TodayCodePage({ date }) {
  const router = useRouter();
  const { user, loading, backendReachable } = useAuth();
  const path = date ? `/today-code/${date}` : "/today-code";

  // Keyed by the requested date so switching days shows the skeleton again
  // without resetting state inside the effect.
  const [fetched, setFetched] = useState(null); // { for, result?, error? }
  const [archive, setArchive] = useState(null);
  const [solutionIndex, setSolutionIndex] = useState(0);
  const want = date || "today";
  const result = fetched?.for === want ? fetched.result ?? null : null;
  const error = fetched?.for === want ? fetched.error ?? null : null;

  // Not signed in → login, then straight back here.
  useEffect(() => {
    if (!loading && !user && backendReachable) router.replace(loginHref(path));
  }, [loading, user, backendReachable, router, path]);

  // Fetch the entry once we know who is asking.
  useEffect(() => {
    if (loading || !user) return undefined;
    let active = true;
    (date ? api.dailyCode.get(date) : api.dailyCode.today())
      .then((res) => {
        if (!active) return;
        setSolutionIndex(0);
        setFetched({ for: want, result: res });
      })
      .catch((err) => {
        if (!active) return;
        const notFound = err instanceof ApiError && err.status === 404;
        setFetched({ for: want, error: { notFound, message: notFound ? err.message : friendlyMessage(err, "We couldn't load today's code right now.") } });
      });
    return () => {
      active = false;
    };
  }, [date, want, loading, user]);

  // Archive for the sidebar (public metadata, cheap).
  useEffect(() => {
    if (loading || !user) return undefined;
    let active = true;
    api.dailyCode
      .list({ limit: 30 })
      .then((res) => active && setArchive(res.data))
      .catch(() => active && setArchive([]));
    return () => {
      active = false;
    };
  }, [loading, user]);

  if (loading || (!user && backendReachable)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-stone-500">
        <Loader2 className="w-6 h-6 animate-spin text-[#093c33]" />
        <p className="text-sm">{loading ? "Checking your access…" : "Taking you to sign in…"}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <ErrorState
        eyebrow="Connection"
        title="We can't reach the server"
        message="Today's code needs a live connection. Please check that the backend is running and try again."
        icon={WifiOff}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const entry = result?.data ?? null;
  const meta = result?.meta ?? {};
  const solutions = entry?.solutions ?? [];
  const solution = solutions[solutionIndex] || solutions[0];
  const staff = isStaff(user);

  const header = (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <p className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#f3843f]">
          <Terminal className="w-3.5 h-3.5" />
          Problem of the day
        </p>
        <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827]">Today Code</h1>
        <p className="mt-1 text-sm text-stone-500">One solved problem every day. Read the approach, copy the code, run it.</p>
      </div>
      <div className="flex items-center gap-2">
        {staff && (
          <Link href="/admin/daily-code" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-[#093c33] bg-white border border-stone-200 hover:border-[#093c33] transition-colors">
            <ShieldCheck className="w-3.5 h-3.5" />
            Manage in admin
          </Link>
        )}
        {date && (
          <Link href="/today-code" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#093c33] hover:bg-[#f3843f] transition-colors">
            <Sparkles className="w-3.5 h-3.5" />
            Jump to today
          </Link>
        )}
      </div>
    </div>
  );

  const sidebar = (
    <aside className="lg:w-72 shrink-0">
      <div className="lg:sticky lg:top-24 bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-2">
          <History className="w-4 h-4 text-[#093c33]" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-stone-700">Previous days</span>
        </div>
        {archive === null && (
          <div className="p-4 space-y-2 animate-pulse">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded-xl bg-stone-100" />
            ))}
          </div>
        )}
        {archive && archive.length === 0 && <p className="p-4 text-xs text-stone-500">Nothing posted yet. The first solution will show up here.</p>}
        {archive && archive.length > 0 && (
          <ul className="max-h-[60vh] overflow-y-auto divide-y divide-stone-100">
            {archive.map((a) => {
              const active = entry?.date === a.date;
              return (
                <li key={a.id}>
                  <Link
                    href={a.date === meta.today ? "/today-code" : `/today-code/${a.date}`}
                    className={`block px-4 py-2.5 transition-colors ${active ? "bg-[#093c33] text-white" : "hover:bg-stone-50"}`}
                  >
                    <span className={`block text-[10px] font-extrabold uppercase tracking-wider ${active ? "text-emerald-200" : "text-stone-400"}`}>
                      {a.date === meta.today ? "Today" : formatDay(a.date, { weekday: undefined, year: undefined })}
                    </span>
                    <span className={`block text-sm font-bold truncate ${active ? "text-white" : "text-stone-800"}`}>
                      {a.problemNumber ? `${a.problemNumber}. ` : ""}
                      {a.title}
                    </span>
                    <span className={`block mt-0.5 text-[11px] ${active ? "text-emerald-100/80" : "text-stone-500"}`}>
                      {a.difficulty} · {a.languages.map(languageLabel).join(", ") || "—"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );

  let body;
  if (error) {
    body = (
      <div className="flex-1 bg-white rounded-2xl border border-stone-200/90 p-10 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center">
          <CalendarDays className="w-6 h-6 text-stone-400" />
        </div>
        <h2 className="mt-4 text-lg font-extrabold text-stone-800">{error.notFound ? "Nothing for that day" : "Couldn't load the code"}</h2>
        <p className="mt-1 text-sm text-stone-500 max-w-sm mx-auto">{error.message}</p>
        <div className="mt-5 flex justify-center gap-2">
          <Link href="/today-code" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#093c33] hover:bg-[#f3843f]">
            Go to today
          </Link>
          {!error.notFound && (
            <button type="button" onClick={() => window.location.reload()} className="cursor-pointer inline-flex items-center px-5 py-2.5 rounded-full text-xs font-bold text-stone-800 bg-white border border-stone-200 hover:bg-stone-50">
              Retry
            </button>
          )}
        </div>
      </div>
    );
  } else if (!result) {
    body = (
      <div className="flex-1 space-y-4 animate-pulse">
        <div className="bg-white rounded-2xl border border-stone-200/90 p-6">
          <div className="h-4 w-32 rounded bg-stone-100" />
          <div className="mt-3 h-8 w-2/3 rounded bg-stone-100" />
          <div className="mt-3 flex gap-2">
            <div className="h-6 w-20 rounded-full bg-stone-100" />
            <div className="h-6 w-20 rounded-full bg-stone-100" />
          </div>
        </div>
        <div className="h-72 rounded-2xl bg-[#0d2b24]/90" />
      </div>
    );
  } else if (!entry) {
    body = (
      <div className="flex-1 bg-white rounded-2xl border border-stone-200/90 p-10 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#093c33]/10 flex items-center justify-center">
          <Terminal className="w-6 h-6 text-[#093c33]" />
        </div>
        <h2 className="mt-4 text-lg font-extrabold text-stone-800">Today&apos;s code isn&apos;t posted yet</h2>
        <p className="mt-1 text-sm text-stone-500 max-w-sm mx-auto">The first problem-of-the-day solution will appear here as soon as it is published. Check back in a bit.</p>
        {staff && (
          <Link href="/admin/daily-code/new" className="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#f3843f] hover:bg-[#d96e2b]">
            Post today&apos;s code
          </Link>
        )}
      </div>
    );
  } else {
    body = (
      <div className="flex-1 min-w-0 space-y-5">
        {!meta.isToday && !date && (
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200/70 text-xs text-amber-900">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Today&apos;s solution hasn&apos;t been posted yet. This is the latest one, from <strong className="font-bold">{formatDay(entry.date)}</strong>.
            </span>
          </div>
        )}

        {/* Problem header */}
        <section className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <Chip className="bg-[#093c33] text-white border-[#093c33]">
              <CalendarDays className="w-3 h-3" />
              {meta.isToday ? "Today" : formatDay(entry.date)}
            </Chip>
            <Chip className={PLATFORM_CLASS[entry.platform] || PLATFORM_CLASS.Other}>{entry.platform}</Chip>
            <Chip className={DIFFICULTY_CLASS[entry.difficulty] || DIFFICULTY_CLASS.Medium}>{entry.difficulty}</Chip>
          </div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827] leading-tight">
            {entry.problemNumber && <span className="text-stone-400">{entry.problemNumber}. </span>}
            {entry.title}
          </h2>
          {entry.topics?.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-stone-400" />
              {entry.topics.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-md bg-stone-100 text-[11px] font-bold text-stone-700">
                  {t}
                </span>
              ))}
            </div>
          )}
          {entry.statement && (
            <div className="mt-5 pt-5 border-t border-stone-100">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-stone-500">
                <FileText className="w-3.5 h-3.5" />
                Problem
              </p>
              <p className="mt-2 text-sm sm:text-[15px] text-stone-700 leading-relaxed whitespace-pre-line">{entry.statement}</p>
            </div>
          )}
          {entry.problemUrl && (
            <a
              href={entry.problemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#093c33] hover:bg-[#f3843f] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open problem on {entry.platform}
            </a>
          )}
        </section>

        {/* Approach */}
        {entry.approach && (
          <section className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-7">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#f3843f]">
              <Lightbulb className="w-3.5 h-3.5" />
              Approach
            </p>
            <div className="mt-2 text-sm sm:text-[15px] text-stone-700 leading-relaxed whitespace-pre-line">{entry.approach}</div>
          </section>
        )}

        {/* Solutions */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-stone-600">
              <Terminal className="w-3.5 h-3.5 text-[#093c33]" />
              Solution{solutions.length > 1 ? "s" : ""}
            </p>
            {solutions.length > 1 && (
              <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-xl p-1">
                {solutions.map((s, i) => (
                  <button
                    key={s.id || i}
                    type="button"
                    onClick={() => setSolutionIndex(i)}
                    className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${i === solutionIndex ? "bg-[#093c33] text-white shadow-sm" : "text-stone-600 hover:text-stone-900"}`}
                  >
                    {languageLabel(s.language)}
                    {s.label ? <span className={`ml-1 font-semibold ${i === solutionIndex ? "text-emerald-200" : "text-stone-400"}`}>· {s.label}</span> : null}
                  </button>
                ))}
              </div>
            )}
          </div>
          {solution ? (
            <>
              {solutions.length === 1 && solution.label && <p className="mb-2 text-xs font-semibold text-stone-500">{solution.label}</p>}
              <SolutionCode solution={solution} title={entry.title} />
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">The code for this day is still being written.</div>
          )}
        </section>

        {/* Complexity */}
        {(entry.complexity?.time || entry.complexity?.space) && (
          <section className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-stone-200/90 p-4">
              <p className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
                <Clock className="w-3.5 h-3.5" />
                Time
              </p>
              <p className="mt-1 font-mono text-lg font-bold text-[#093c33]">{entry.complexity.time || "—"}</p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200/90 p-4">
              <p className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
                <Database className="w-3.5 h-3.5" />
                Space
              </p>
              <p className="mt-1 font-mono text-lg font-bold text-[#093c33]">{entry.complexity.space || "—"}</p>
            </div>
          </section>
        )}

        {/* Prev / next */}
        <nav className="flex items-stretch justify-between gap-3 pt-2">
          {meta.prev ? (
            <Link href={`/today-code/${meta.prev.date}`} className="group flex-1 max-w-[48%] flex items-center gap-2 p-3.5 rounded-2xl bg-white border border-stone-200/90 hover:border-[#093c33] transition-colors">
              <ChevronLeft className="w-4 h-4 text-stone-400 group-hover:text-[#093c33] shrink-0" />
              <span className="min-w-0">
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-stone-400">{formatDay(meta.prev.date, { weekday: undefined, year: undefined })}</span>
                <span className="block text-sm font-bold text-stone-800 truncate">{meta.prev.title}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {meta.next ? (
            <Link
              href={meta.next.date === meta.today ? "/today-code" : `/today-code/${meta.next.date}`}
              className="group flex-1 max-w-[48%] flex items-center justify-end gap-2 p-3.5 rounded-2xl bg-white border border-stone-200/90 hover:border-[#093c33] transition-colors text-right"
            >
              <span className="min-w-0">
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-stone-400">{meta.next.date === meta.today ? "Today" : formatDay(meta.next.date, { weekday: undefined, year: undefined })}</span>
                <span className="block text-sm font-bold text-stone-800 truncate">{meta.next.title}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#093c33] shrink-0" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    );
  }

  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {header}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {body}
          {sidebar}
        </div>
      </div>
    </section>
  );
}
