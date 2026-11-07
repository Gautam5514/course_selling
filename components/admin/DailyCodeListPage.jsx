"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, Terminal, ExternalLink, CalendarCheck2, CalendarX2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { api, friendlyMessage } from "@/lib/api";
import { DIFFICULTY_CLASS, formatDay, languageLabel } from "@/lib/dailyCode";
import { Card, Button, Badge, Spinner, Alert, EmptyState, Pagination, ConfirmDialog, Input } from "./ui";

const STATUS = [
  { value: "all", label: "All" },
  { value: "published", label: "Live" },
  { value: "draft", label: "Drafts" },
];

export default function DailyCodeListPage() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();

  const status = params.get("status") || "all";
  const q = params.get("q") || "";
  const page = Math.max(1, Number(params.get("page")) || 1);

  const [search, setSearch] = useState(q);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const setParam = (patch) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === null || v === "" || (k === "status" && v === "all") || (k === "page" && v === 1)) next.delete(k);
      else next.set(k, String(v));
    }
    router.replace(`/admin/daily-code${next.toString() ? `?${next}` : ""}`);
  };

  const load = useCallback(() => {
    return api.admin
      .listDailyCode({ status, q, page, limit: 20 })
      .then((res) => {
        setResult(res);
        setError("");
      })
      .catch((err) => setError(friendlyMessage(err, "We couldn't load the daily code entries right now.")));
  }, [status, q, page]);

  useEffect(() => {
    load();
  }, [load]);

  const submitSearch = (e) => {
    e.preventDefault();
    setParam({ q: search.trim(), page: 1 });
  };

  const patchRow = (row) => setResult((r) => (r ? { ...r, data: r.data.map((n) => (n.id === row.id ? { ...n, ...row } : n)) } : r));
  const dropRow = (id) => setResult((r) => (r ? { ...r, data: r.data.filter((n) => n.id !== id), meta: { ...r.meta, total: Math.max(0, r.meta.total - 1) } } : r));

  const run = async (row, fn, okMessage) => {
    setBusyId(row.id);
    try {
      await fn();
      if (okMessage) toast.success(okMessage, { duration: 2500 });
    } catch (err) {
      toast.error(friendlyMessage(err, "That didn't go through. Please try again."));
    } finally {
      setBusyId(null);
    }
  };

  const togglePublish = (row) =>
    run(
      row,
      async () => {
        const { data } = await api.admin.updateDailyCode(row.id, { publish: row.status !== "published" });
        patchRow(data);
        load();
      },
      row.status === "published" ? `${formatDay(row.date)} is now hidden.` : `${formatDay(row.date)} is live.`
    );

  const remove = (row) =>
    run(
      row,
      async () => {
        await api.admin.deleteDailyCode(row.id);
        dropRow(row.id);
        setConfirm(null);
        load();
      },
      `Deleted the entry for ${formatDay(row.date)}.`
    );

  const rows = result?.data ?? [];
  const meta = result?.meta ?? {};
  const todayMissing = meta.todayStatus && meta.todayStatus !== "published";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#f3843f]">Content</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">Today Code</h1>
          <p className="mt-1 text-sm text-stone-500">The problem-of-the-day solution behind the navbar button. One entry per date; members see it, visitors only see the title.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" href="/today-code" icon={ExternalLink} target="_blank">
            View page
          </Button>
          <Button variant="accent" href="/admin/daily-code/new" icon={Plus}>
            Post code
          </Button>
        </div>
      </div>

      {meta.today && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border text-sm ${todayMissing ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-emerald-50 border-emerald-200 text-emerald-900"}`}>
          {todayMissing ? <CalendarX2 className="w-5 h-5 shrink-0" /> : <CalendarCheck2 className="w-5 h-5 shrink-0" />}
          <span className="flex-1">
            <strong className="font-bold">{formatDay(meta.today)}:</strong>{" "}
            {meta.todayStatus === "published" ? "today's code is live." : meta.todayStatus === "draft" ? "today's entry is still a draft. Publish it so members can see it." : "nothing posted for today yet."}
          </span>
          {meta.todayStatus === "missing" && (
            <Button variant="primary" size="sm" href="/admin/daily-code/new" icon={Plus}>
              Add today&apos;s
            </Button>
          )}
        </div>
      )}

      <Card>
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1 w-fit">
            {STATUS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setParam({ status: s.value, page: 1 })}
                className={`cursor-pointer px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${status === s.value ? "bg-white text-[#093c33] shadow-sm" : "text-stone-600 hover:text-stone-900"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <form onSubmit={submitSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, date, number, topic…" className="pl-10" />
            </div>
            <Button type="submit" variant="primary">
              Search
            </Button>
          </form>
        </div>

        <div className="mt-5">
          {error && <Alert onRetry={load}>{error}</Alert>}
          {!result && !error && <Spinner label="Loading entries…" />}
          {result && rows.length === 0 && (
            <EmptyState
              icon={Terminal}
              title={q ? "No entries match" : "No code posted yet"}
              message={q ? "Try another search or clear the filters." : "Post today's problem-of-the-day solution and it will appear behind the navbar button."}
              action={
                !q && (
                  <Button variant="accent" href="/admin/daily-code/new" icon={Plus}>
                    Post code
                  </Button>
                )
              }
            />
          )}
          {rows.length > 0 && (
            <div className="overflow-x-auto -mx-5 sm:-mx-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] font-extrabold uppercase tracking-wider text-stone-500 border-b border-stone-100">
                    <th className="px-5 sm:px-6 py-2.5">Date</th>
                    <th className="px-3 py-2.5">Problem</th>
                    <th className="px-3 py-2.5 hidden md:table-cell">Languages</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-5 sm:px-6 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {rows.map((row) => {
                    const busy = busyId === row.id;
                    const isToday = row.date === meta.today;
                    return (
                      <tr key={row.id} className="hover:bg-stone-50/60">
                        <td className="px-5 sm:px-6 py-3 whitespace-nowrap">
                          <span className="font-bold text-stone-800">{formatDay(row.date, { weekday: undefined })}</span>
                          {isToday && (
                            <Badge tone="brand" className="ml-2">
                              Today
                            </Badge>
                          )}
                        </td>
                        <td className="px-3 py-3 min-w-[220px]">
                          <Link href={`/admin/daily-code/${row.id}`} className="font-bold text-stone-900 hover:text-[#f3843f]">
                            {row.problemNumber ? `${row.problemNumber}. ` : ""}
                            {row.title}
                          </Link>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-stone-500">{row.platform}</span>
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${DIFFICULTY_CLASS[row.difficulty] || ""}`}>{row.difficulty}</span>
                            {row.topics?.slice(0, 3).map((t) => (
                              <span key={t} className="px-1.5 py-0.5 rounded-md bg-stone-100 text-[10px] font-bold text-stone-600">
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-3 hidden md:table-cell text-xs text-stone-600">{row.languages?.map(languageLabel).join(", ") || <span className="text-rose-600 font-semibold">No code yet</span>}</td>
                        <td className="px-3 py-3">
                          <Badge tone={row.status === "published" ? "success" : "warning"}>{row.status === "published" ? "Live" : "Draft"}</Badge>
                        </td>
                        <td className="px-5 sm:px-6 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" href={`/admin/daily-code/${row.id}`} icon={Pencil} title="Edit">
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="ghost" size="sm" icon={row.status === "published" ? EyeOff : Eye} onClick={() => togglePublish(row)} loading={busy} title={row.status === "published" ? "Unpublish" : "Publish"}>
                              <span className="sr-only">{row.status === "published" ? "Unpublish" : "Publish"}</span>
                            </Button>
                            <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setConfirm(row)} disabled={busy} className="text-rose-600 hover:bg-rose-50" title="Delete">
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={meta.page} pages={meta.pages} total={meta.total} onPage={(p) => setParam({ page: p })} />
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Delete this entry?"
        message={confirm ? `The code for ${formatDay(confirm.date)} ("${confirm.title}") will be removed permanently. Members will no longer see it.` : ""}
        confirmLabel="Delete"
        loading={busyId === confirm?.id}
        onConfirm={() => remove(confirm)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
