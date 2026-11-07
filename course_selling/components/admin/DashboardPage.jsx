"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FileText, Users, Heart, Download, Star, HardDrive, Plus, ArrowRight, Pencil, Sparkles } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { api, friendlyMessage, formatBytes } from "@/lib/api";
import { accentOf, CardIcon } from "@/lib/cardTheme";
import { Card, Button, Badge, Spinner, Alert, EmptyState, StatTile } from "./ui";

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    return api.admin
      .dashboard()
      .then((res) => {
        setData(res.data);
        setError("");
      })
      .catch((err) => setError(friendlyMessage(err, "We couldn't load the dashboard right now.")));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#f3843f]">Overview</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
            {greeting}, {user?.name?.split(" ")[0] || "there"}
          </h1>
          <p className="mt-1 text-sm text-stone-500">Here is what is happening across your notes and students.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" href="/admin/notes" icon={FileText}>
            Manage notes
          </Button>
          <Button variant="accent" href="/admin/notes/new" icon={Plus}>
            New note
          </Button>
        </div>
      </div>

      {error && <Alert onRetry={load}>{error}</Alert>}
      {!data && !error && <Spinner label="Loading your dashboard…" />}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <StatTile label="Notes" value={data.notes.total} sub={`${data.notes.published} live · ${data.notes.draft} draft${data.notes.trash ? ` · ${data.notes.trash} in trash` : ""}`} icon={FileText} />
            <StatTile label="Students" value={data.users.students} sub={`${data.users.admins} staff account${data.users.admins === 1 ? "" : "s"}`} icon={Users} tone="accent" />
            <StatTile label="Likes" value={data.engagement.likes} sub="Across all notes" icon={Heart} tone="light" />
            <StatTile label="Downloads" value={data.engagement.downloads} sub="Unique per visitor per day" icon={Download} tone="light" />
            <StatTile label="Average rating" value={data.engagement.averageRating ?? "–"} sub={`${data.engagement.ratings} rating${data.engagement.ratings === 1 ? "" : "s"}`} icon={Star} tone="light" />
            <StatTile label="Storage" value={formatBytes(data.storage.bytes) || "0 B"} sub={`${data.storage.files} file${data.storage.files === 1 ? "" : "s"} uploaded`} icon={HardDrive} tone="light" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <Card
              className="xl:col-span-3"
              title="Recently updated"
              description="Jump back into what you were editing."
              action={
                <Link href="/admin/notes" className="text-xs font-bold text-[#093c33] hover:text-[#f3843f] inline-flex items-center gap-1">
                  All notes <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            >
              {data.recentNotes.length === 0 ? (
                <EmptyState icon={Sparkles} title="No notes yet" message="Create your first note card to see it on the home page." action={<Button variant="accent" href="/admin/notes/new" icon={Plus}>Create a note</Button>} />
              ) : (
                <ul className="divide-y divide-stone-100 -my-2">
                  {data.recentNotes.map((n) => {
                    const accent = accentOf(n.accent);
                    return (
                      <li key={n.id} className="py-3 flex items-center gap-3">
                        <span className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${accent.badge}`}>
                          <CardIcon name={n.icon} className={`w-4 h-4 ${accent.icon}`} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-stone-900 truncate">{n.title}</p>
                          <p className="text-[11px] text-stone-500 truncate">
                            {n.category || "Uncategorised"} · {n.file ? `PDF · ${n.pages ? `${n.pages} pages` : formatBytes(n.file.byteSize)}` : "No PDF yet"} · {timeAgo(n.updatedAt)}
                          </p>
                        </div>
                        <Badge tone={n.status === "published" ? "success" : "warning"}>{n.status}</Badge>
                        <Link href={`/admin/notes/${n.id}`} className="p-2 rounded-lg text-stone-500 hover:text-[#093c33] hover:bg-stone-100" aria-label={`Edit ${n.title}`}>
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card className="xl:col-span-2" title="Most loved" description="Live notes ranked by likes and downloads.">
              {data.topNotes.length === 0 ? (
                <EmptyState icon={Heart} title="Nothing to rank yet" message="Once students start liking notes, the leaders show up here." />
              ) : (
                <ol className="space-y-3">
                  {data.topNotes.map((n, i) => (
                    <li key={n.id} className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-stone-100 text-stone-600 text-xs font-extrabold flex items-center justify-center shrink-0">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-stone-900 truncate">{n.title}</p>
                        <p className="text-[11px] text-stone-500">
                          {n.likes} likes · {n.downloads} downloads · {n.rating ?? "–"}★ ({n.ratingCount})
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
