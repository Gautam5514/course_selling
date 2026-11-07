"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, Pencil, Trash2, RotateCcw, Eye, EyeOff, Star, StarOff, FileText, ExternalLink, Heart, Download } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { api, friendlyMessage, formatBytes } from "@/lib/api";
import { accentOf, CardIcon } from "@/lib/cardTheme";
import { Card, Button, Badge, Spinner, Alert, EmptyState, Pagination, ConfirmDialog, Input, Select } from "./ui";

const STATUS = [
  { value: "all", label: "All" },
  { value: "published", label: "Live" },
  { value: "draft", label: "Drafts" },
  { value: "trash", label: "Trash" },
];

export default function NotesListPage() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();

  const status = params.get("status") || "all";
  const q = params.get("q") || "";
  const category = params.get("category") || "";
  const page = Math.max(1, Number(params.get("page")) || 1);

  const [search, setSearch] = useState(q);
  const [result, setResult] = useState(null); // { data, meta }
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [confirm, setConfirm] = useState(null); // note to trash

  const setParam = (patch) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === null || v === "" || (k === "status" && v === "all") || (k === "page" && v === 1)) next.delete(k);
      else next.set(k, String(v));
    }
    router.replace(`/admin/notes${next.toString() ? `?${next}` : ""}`);
  };

  const load = useCallback(() => {
    return api.admin
      .listNotes({ status, q, category, page, limit: 20 })
      .then((res) => {
        setResult(res);
        setError("");
      })
      .catch((err) => setError(friendlyMessage(err, "We couldn't load your notes right now.")));
  }, [status, q, category, page]);

  useEffect(() => {
    load();
  }, [load]);

  const submitSearch = (e) => {
    e.preventDefault();
    setParam({ q: search.trim(), page: 1 });
  };

  const patchRow = (note) => setResult((r) => (r ? { ...r, data: r.data.map((n) => (n.id === note.id ? note : n)) } : r));
  const dropRow = (id) => setResult((r) => (r ? { ...r, data: r.data.filter((n) => n.id !== id), meta: { ...r.meta, total: Math.max(0, r.meta.total - 1) } } : r));

  const run = async (note, fn, okMessage) => {
    setBusyId(note.id);
    try {
      await fn();
      if (okMessage) toast.success(okMessage, { duration: 2500 });
    } catch (err) {
      toast.error(friendlyMessage(err, "That didn't go through. Please try again."));
    } finally {
      setBusyId(null);
    }
  };

  const togglePublish = (note) =>
    run(
      note,
      async () => {
        const { data } = await api.admin.updateNote(note.id, { publish: note.status !== "published" });
        patchRow(data);
      },
      note.status === "published" ? `"${note.title}" is now hidden from the site.` : `"${note.title}" is live on the site.`
    );

  const toggleFeatured = (note) =>
    run(
      note,
      async () => {
        const { data } = await api.admin.updateNote(note.id, { featured: !note.featured });
        patchRow(data);
      },
      note.featured ? "Removed from the home page." : "Shown on the home page."
    );

  const trash = (note) =>
    run(
      note,
      async () => {
        await api.admin.deleteNote(note.id);
        dropRow(note.id);
        setConfirm(null);
      },
      `"${note.title}" moved to trash.`
    );

  const restore = (note) =>
    run(
      note,
      async () => {
        await api.admin.restoreNote(note.id);
        dropRow(note.id);
      },
      `"${note.title}" restored.`
    );

  const notes = result?.data ?? [];
  const meta = result?.meta ?? {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#f3843f]">Content</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">Notes &amp; PDFs</h1>
          <p className="mt-1 text-sm text-stone-500">Every card on the home page lives here. Add a PDF, code and project links, then publish.</p>
        </div>
        <Button variant="accent" href="/admin/notes/new" icon={Plus}>
          New note
        </Button>
      </div>

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
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, slug, tags…" className="pl-10" />
            </div>
            <Select value={category} onChange={(e) => setParam({ category: e.target.value, page: 1 })} className="w-auto">
              <option value="">All categories</option>
              {(meta.categories ?? []).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Button type="submit" variant="primary">
              Search
            </Button>
          </form>
        </div>

        <div className="mt-5">
          {error && <Alert onRetry={load}>{error}</Alert>}
          {!result && !error && <Spinner label="Loading notes…" />}
          {result && notes.length === 0 && (
            <EmptyState
              icon={FileText}
              title={status === "trash" ? "Trash is empty" : q || category ? "No notes match" : "No notes yet"}
              message={status === "trash" ? "Notes you remove will wait here until you restore them." : q || category ? "Try another search or clear the filters." : "Create your first note card and it will appear on the home page."}
              action={!q && !category && status !== "trash" ? <Button variant="accent" href="/admin/notes/new" icon={Plus}>Create a note</Button> : null}
            />
          )}

          {notes.length > 0 && (
            <div className="overflow-x-auto -mx-5 sm:-mx-6">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-100">
                    <th className="px-5 sm:px-6 py-2 font-extrabold">Note</th>
                    <th className="px-3 py-2 font-extrabold">Status</th>
                    <th className="px-3 py-2 font-extrabold">PDF</th>
                    <th className="px-3 py-2 font-extrabold">Engagement</th>
                    <th className="px-3 py-2 font-extrabold text-right pr-5 sm:pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {notes.map((n) => {
                    const accent = accentOf(n.accent);
                    const busy = busyId === n.id;
                    const inTrash = status === "trash";
                    return (
                      <tr key={n.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="px-5 sm:px-6 py-3">
                          <div className="flex items-center gap-3">
                            <span className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${accent.badge}`}>
                              <CardIcon name={n.icon} className={`w-4.5 h-4.5 ${accent.icon}`} />
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <Link href={`/admin/notes/${n.id}`} className="font-bold text-stone-900 hover:text-[#f3843f] truncate">
                                  {n.title}
                                </Link>
                                {n.featured && !inTrash && (
                                  <span title="Shown on the home page">
                                    <Star className="w-3.5 h-3.5 text-[#f3843f] fill-[#f3843f]" />
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-stone-500 truncate">
                                /{n.slug} · {n.category || "Uncategorised"}
                                {n.badge ? ` · ${n.badge}` : ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <Badge tone={inTrash ? "danger" : n.status === "published" ? "success" : "warning"}>{inTrash ? "trash" : n.status}</Badge>
                        </td>
                        <td className="px-3 py-3 text-xs text-stone-600 whitespace-nowrap">
                          {n.file ? (
                            <span className="inline-flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-[#093c33]" />
                              {n.pages ? `${n.pages} pages` : formatBytes(n.file.byteSize)}
                            </span>
                          ) : (
                            <span className="text-stone-400">No PDF</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-xs text-stone-600 whitespace-nowrap">
                          <span className="inline-flex items-center gap-3">
                            <span className="inline-flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500" />{n.likes}</span>
                            <span className="inline-flex items-center gap-1"><Download className="w-3.5 h-3.5 text-stone-400" />{n.downloads}</span>
                            <span className="inline-flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" />{n.rating ?? "–"} <span className="text-stone-400">({n.ratingCount})</span></span>
                          </span>
                        </td>
                        <td className="px-3 py-3 pr-5 sm:pr-6">
                          <div className="flex items-center justify-end gap-1">
                            {inTrash ? (
                              <Button size="sm" variant="secondary" icon={RotateCcw} loading={busy} onClick={() => restore(n)}>
                                Restore
                              </Button>
                            ) : (
                              <>
                                <IconBtn title={n.status === "published" ? "Hide from site" : "Publish"} onClick={() => togglePublish(n)} disabled={busy}>
                                  {n.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </IconBtn>
                                <IconBtn title={n.featured ? "Remove from home page" : "Show on home page"} onClick={() => toggleFeatured(n)} disabled={busy}>
                                  {n.featured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                                </IconBtn>
                                {n.status === "published" && (
                                  <IconBtn title="Open on site" href={`/pdf/${n.slug}`} target="_blank">
                                    <ExternalLink className="w-4 h-4" />
                                  </IconBtn>
                                )}
                                <IconBtn title="Edit" href={`/admin/notes/${n.id}`}>
                                  <Pencil className="w-4 h-4" />
                                </IconBtn>
                                <IconBtn title="Move to trash" danger onClick={() => setConfirm(n)} disabled={busy}>
                                  <Trash2 className="w-4 h-4" />
                                </IconBtn>
                              </>
                            )}
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
        title="Move this note to trash?"
        message={confirm ? `"${confirm.title}" will disappear from the website immediately. You can restore it from the Trash tab any time.` : ""}
        confirmLabel="Move to trash"
        loading={busyId === confirm?.id}
        onConfirm={() => confirm && trash(confirm)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

function IconBtn({ title, href, danger, children, ...props }) {
  const cls = `cursor-pointer w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 ${
    danger ? "text-rose-600 hover:bg-rose-50" : "text-stone-500 hover:text-[#093c33] hover:bg-stone-100"
  }`;
  if (href) {
    return (
      <Link href={href} title={title} aria-label={title} className={cls} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" title={title} aria-label={title} className={cls} {...props}>
      {children}
    </button>
  );
}
