"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Eye, EyeOff, Trash2, UploadCloud, FileText, X, Plus, ChevronUp, ChevronDown, Code2, Paperclip, ExternalLink, Loader2, Check, Lock, RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { api, ApiError, friendlyMessage, fieldErrors, formatBytes } from "@/lib/api";
import { ACCENTS, ICONS, accentOf, CardIcon } from "@/lib/cardTheme";
import { projectsList } from "@/data/projectsData";
import { Card, Field, Input, Textarea, Select, Button, Badge, Toggle, Spinner, Alert, ConfirmDialog } from "./ui";

const LEVELS = ["All Levels", "Beginner", "Intermediate", "Intermediate to Pro", "Advanced"];
const LANGUAGES = ["javascript", "typescript", "python", "java", "cpp", "c", "go", "rust", "sql", "bash", "html", "css", "json", "yaml", "kotlin", "swift", "dart", "php", "ruby", "other"];

export function slugify(input) {
  return String(input ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function emptyForm() {
  return {
    title: "",
    slug: "",
    category: "",
    tagline: "",
    description: "",
    tags: "",
    level: "All Levels",
    badge: "",
    accent: "emerald",
    icon: "BookOpen",
    featured: true,
    order: 0,
    price: 0,
    pages: "",
    videoUrl: "",
    projectBadge: "",
    projectTitle: "",
    projectUrl: "",
    demoUrl: "",
    projectId: "",
    instructor: { name: "", role: "", company: "", avatar: "" },
    chapters: [],
    visibility: "PRIVATE",
  };
}

function toForm(n) {
  return {
    ...emptyForm(),
    title: n.title ?? "",
    slug: n.slug ?? "",
    category: n.category ?? "",
    tagline: n.tagline ?? "",
    description: n.description ?? "",
    tags: (n.tags ?? []).join(", "),
    level: n.level || "All Levels",
    badge: n.badge ?? "",
    accent: n.accent || "emerald",
    icon: n.icon || "BookOpen",
    featured: n.featured !== false,
    order: n.order ?? 0,
    price: n.price ?? 0,
    pages: n.pages ?? "",
    videoUrl: n.videoUrl ?? "",
    projectBadge: n.projectBadge ?? "",
    projectTitle: n.projectTitle ?? "",
    projectUrl: n.projectUrl ?? "",
    demoUrl: n.demoUrl ?? "",
    projectId: n.projectId ?? "",
    instructor: { name: "", role: "", company: "", avatar: "", ...(n.instructor ?? {}) },
    chapters: (n.chapters ?? []).map((c) => ({ number: c.number ?? "", title: c.title ?? "", summary: c.summary ?? "", contentSnippet: c.contentSnippet ?? "" })),
    visibility: n.visibility || "PRIVATE",
  };
}

/** Form → API body. Empty strings become "cleared" values the API accepts. */
function toPayload(f) {
  const num = (v, fallback) => (v === "" || v === null || v === undefined || Number.isNaN(Number(v)) ? fallback : Number(v));
  return {
    title: f.title.trim(),
    ...(f.slug.trim() ? { slug: slugify(f.slug) } : {}),
    category: f.category.trim(),
    tagline: f.tagline.trim(),
    description: f.description.trim(),
    tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 50),
    level: f.level.trim() || "All Levels",
    badge: f.badge.trim(),
    accent: f.accent,
    icon: f.icon,
    featured: Boolean(f.featured),
    order: Math.trunc(num(f.order, 0)),
    price: num(f.price, 0),
    pages: f.pages === "" ? null : Math.trunc(num(f.pages, 0)) || null,
    videoUrl: f.videoUrl.trim() || null,
    projectBadge: f.projectBadge.trim(),
    projectTitle: f.projectTitle.trim(),
    projectUrl: f.projectUrl.trim(),
    demoUrl: f.demoUrl.trim(),
    projectId: f.projectId,
    instructor: { name: f.instructor.name.trim(), role: f.instructor.role.trim(), company: f.instructor.company.trim(), avatar: f.instructor.avatar.trim() },
    chapters: f.chapters.map((c) => ({ number: c.number.trim(), title: c.title.trim(), summary: c.summary.trim(), contentSnippet: c.contentSnippet.trim() })),
    visibility: f.visibility,
  };
}

/** Client-side checks so most mistakes never need a round trip. */
function validate(f) {
  const e = {};
  const url = (v) => !v.trim() || /^https?:\/\/\S+$/i.test(v.trim());
  if (f.title.trim().length < 1) e.title = "Give the note a title.";
  if (f.title.trim().length > 200) e.title = "Keep the title under 200 characters.";
  if (f.slug.trim() && !slugify(f.slug)) e.slug = "The link can only contain letters, numbers and dashes.";
  if (!url(f.projectUrl)) e.projectUrl = "GitHub link must start with https://";
  if (!url(f.demoUrl)) e.demoUrl = "Demo link must start with https://";
  if (!url(f.videoUrl)) e.videoUrl = "Video link must start with https://";
  if (!url(f.instructor.avatar)) e.instructor = "Avatar must be a full image link starting with https://";
  if (f.pages !== "" && (Number(f.pages) < 1 || !Number.isInteger(Number(f.pages)))) e.pages = "Pages must be a whole number.";
  if (Number(f.price) < 0) e.price = "Price cannot be negative.";
  if (f.chapters.some((c) => !c.title.trim())) e.chapters = "Every chapter needs a title.";
  return e;
}

export default function NoteEditor({ noteId }) {
  const isNew = !noteId;
  const router = useRouter();
  const toast = useToast();

  const [note, setNote] = useState(null); // last saved copy from the server
  const [form, setForm] = useState(emptyForm);
  const [loadError, setLoadError] = useState("");
  const [loaded, setLoaded] = useState(isNew);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [confirmTrash, setConfirmTrash] = useState(false);
  const [categories, setCategories] = useState([]);

  // Load the note (edit mode) and the known categories (for suggestions).
  useEffect(() => {
    let active = true;
    api.admin
      .listNotes({ limit: 1 })
      .then((res) => active && setCategories(res.meta?.categories ?? []))
      .catch(() => {});
    if (isNew) return () => { active = false; };
    api.admin
      .getNote(noteId)
      .then(({ data }) => {
        if (!active) return;
        setNote(data);
        setForm(toForm(data));
        setLoaded(true);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(err instanceof ApiError && err.status === 404 ? "We couldn't find that note. It may have been removed." : friendlyMessage(err, "We couldn't load this note right now."));
        setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [noteId, isNew]);

  const savedPayload = useMemo(() => (note ? JSON.stringify(toPayload(toForm(note))) : null), [note]);
  const dirty = isNew ? form.title.trim().length > 0 : savedPayload !== JSON.stringify(toPayload(form));

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };
  const setInstructor = (key, value) => setForm((f) => ({ ...f, instructor: { ...f.instructor, [key]: value } }));

  const onTitle = (v) => {
    setForm((f) => ({ ...f, title: v, slug: slugTouched ? f.slug : slugify(v) }));
    setErrors((e) => (e.title ? { ...e, title: undefined } : e));
  };

  const applyServerError = (err) => {
    const fe = fieldErrors(err);
    if (Object.keys(fe).length) {
      setErrors(fe);
      setFormError("Please check the highlighted fields.");
    } else {
      setFormError(friendlyMessage(err, "We couldn't save your changes. Please try again."));
    }
  };

  const save = async ({ publish } = {}) => {
    if (saving) return null;
    setFormError("");
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) {
      setFormError("Please check the highlighted fields.");
      return null;
    }
    setSaving(true);
    try {
      const body = toPayload(form);
      if (publish !== undefined) body.publish = publish;
      if (isNew) {
        const { data } = await api.admin.createNote(body);
        toast.success(`"${data.title}" created. You can now add the PDF and code.`, { duration: 3500 });
        router.replace(`/admin/notes/${data.id}`);
        return data;
      }
      const { data } = await api.admin.updateNote(noteId, body);
      setNote(data);
      setForm(toForm(data));
      toast.success(publish === true ? "Saved and published. It's live on the site." : publish === false ? "Saved. The note is now hidden from the site." : "Changes saved.", { duration: 2500 });
      return data;
    } catch (err) {
      applyServerError(err);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const trash = async () => {
    setSaving(true);
    try {
      await api.admin.deleteNote(noteId);
      toast.success("Moved to trash. You can restore it from the Trash tab.", { duration: 3000 });
      router.replace("/admin/notes");
    } catch (err) {
      toast.error(friendlyMessage(err, "We couldn't move that to trash."));
      setSaving(false);
      setConfirmTrash(false);
    }
  };

  if (!loaded) return <Spinner label="Loading note…" />;
  if (loadError) {
    return (
      <div className="space-y-4">
        <BackLink />
        <Alert>{loadError}</Alert>
      </div>
    );
  }

  const live = note?.status === "published";
  const accent = accentOf(form.accent);

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="min-w-0">
          <BackLink />
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 truncate">{isNew ? "New note" : note.title}</h1>
            {!isNew && <Badge tone={live ? "success" : "warning"}>{live ? "Live" : "Draft"}</Badge>}
            {dirty && <Badge tone="info">Unsaved changes</Badge>}
          </div>
          {!isNew && (
            <p className="mt-1 text-xs text-stone-500">
              Link: <span className="font-mono">/pdf/{note.slug}</span>
              {live && (
                <Link href={`/pdf/${note.slug}`} target="_blank" className="ml-2 inline-flex items-center gap-1 font-bold text-[#093c33] hover:text-[#f3843f]">
                  Open on site <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!isNew && (
            <Button variant="secondary" icon={live ? EyeOff : Eye} onClick={() => save({ publish: !live })} loading={saving}>
              {live ? "Unpublish" : "Publish"}
            </Button>
          )}
          <Button variant="accent" icon={Save} onClick={() => save()} loading={saving} disabled={!dirty && !isNew}>
            {isNew ? "Create note" : "Save changes"}
          </Button>
        </div>
      </div>

      {formError && <Alert>{formError}</Alert>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── Main column ── */}
        <div className="xl:col-span-2 space-y-6">
          <Card title="Basics" description="What students see on the card and the reader page.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Title" required error={errors.title} className="md:col-span-2">
                <Input value={form.title} onChange={(e) => onTitle(e.target.value)} placeholder="e.g. DSA Notes" invalid={errors.title} maxLength={200} />
              </Field>
              <Field label="Link (slug)" hint="/pdf/…" error={errors.slug}>
                <div className="flex gap-2">
                  <Input
                    value={form.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set("slug", e.target.value);
                    }}
                    placeholder="auto-generated from the title"
                    invalid={errors.slug}
                  />
                  <Button variant="secondary" size="sm" icon={RefreshCw} title="Regenerate from title" onClick={() => { setSlugTouched(false); set("slug", slugify(form.title)); }}>
                    Auto
                  </Button>
                </div>
              </Field>
              <Field label="Category" hint="shown as the filter tab" error={errors.category}>
                <Input list="note-categories" value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="e.g. DSA, Full Stack, AI/ML" />
                <datalist id="note-categories">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>
              <Field label="Tagline" hint="one line under the title" error={errors.tagline} className="md:col-span-2">
                <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="450+ Solved Patterns • LeetCode Sheet • Visual Trees & Graphs" maxLength={200} />
              </Field>
              <Field label="Description" error={errors.description} className="md:col-span-2">
                <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="What does this handbook cover?" />
              </Field>
              <Field label="Tags" hint="comma separated" error={errors.tags}>
                <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="dsa, algorithms, leetcode" />
              </Field>
              <Field label="Level" error={errors.level}>
                <Select value={form.level} onChange={(e) => set("level", e.target.value)}>
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Lesson video link" hint="optional, YouTube" error={errors.videoUrl} className="md:col-span-2">
                <Input value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://www.youtube.com/watch?v=…" invalid={errors.videoUrl} />
              </Field>
            </div>
          </Card>

          <PdfCard note={note} isNew={isNew} form={form} set={set} errors={errors} onNote={(n) => { setNote(n); setForm((f) => ({ ...f, pages: n.pages ?? f.pages })); }} />

          <SnippetsCard note={note} isNew={isNew} onNote={setNote} />

          <AttachmentsCard note={note} isNew={isNew} onNote={setNote} />

          <ChaptersCard chapters={form.chapters} error={errors.chapters} onChange={(chapters) => set("chapters", chapters)} />
        </div>

        {/* ── Side column ── */}
        <div className="space-y-6">
          <Card title="Visibility">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-stone-800">Show on home page</p>
                  <p className="text-xs text-stone-500">Featured notes appear in the cards grid.</p>
                </div>
                <Toggle checked={form.featured} onChange={(v) => set("featured", v)} label="Featured" />
              </div>
              <Field label="Order on home page" hint="lower shows first" error={errors.order}>
                <Input type="number" value={form.order} onChange={(e) => set("order", e.target.value)} />
              </Field>
              <Field label="Status" error={errors.visibility}>
                <Select value={form.visibility} onChange={(e) => set("visibility", e.target.value)}>
                  <option value="PRIVATE">Draft (hidden)</option>
                  <option value="UNLISTED">Unlisted (link only)</option>
                  <option value="PUBLIC">Public</option>
                </Select>
              </Field>
              <Field label="Price (₹)" hint="0 = free" error={errors.price}>
                <Input type="number" min={0} step="1" value={form.price} onChange={(e) => set("price", e.target.value)} invalid={errors.price} />
              </Field>
            </div>
          </Card>

          <Card title="Appearance" description="How the card looks.">
            <div className="space-y-4">
              <Field label="Badge text" hint="e.g. Most Popular" error={errors.badge}>
                <Input value={form.badge} onChange={(e) => set("badge", e.target.value)} placeholder="Core Foundation" maxLength={40} />
              </Field>
              <Field label="Accent colour" error={errors.accent}>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ACCENTS).map(([key, a]) => (
                    <button
                      key={key}
                      type="button"
                      title={a.label}
                      aria-label={a.label}
                      aria-pressed={form.accent === key}
                      onClick={() => set("accent", key)}
                      className={`cursor-pointer w-8 h-8 rounded-full ${a.swatch} flex items-center justify-center ring-offset-2 transition-transform hover:scale-110 ${form.accent === key ? "ring-2 ring-[#093c33]" : ""}`}
                    >
                      {form.accent === key && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Icon" error={errors.icon}>
                <div className="grid grid-cols-6 gap-2">
                  {Object.keys(ICONS).map((name) => (
                    <button
                      key={name}
                      type="button"
                      title={name}
                      aria-label={name}
                      aria-pressed={form.icon === name}
                      onClick={() => set("icon", name)}
                      className={`cursor-pointer aspect-square rounded-xl border flex items-center justify-center transition-colors ${form.icon === name ? "bg-[#093c33] text-white border-[#093c33]" : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"}`}
                    >
                      <CardIcon name={name} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </Field>
              {/* Live preview */}
              <div className="pt-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 mb-2">Preview</p>
                <div className="bg-[#faf7f2] rounded-2xl p-4 border border-stone-200">
                  <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${accent.badge}`}>
                      <CardIcon name={form.icon} className={`w-3 h-3 ${accent.icon}`} />
                      {form.category || "Category"}
                    </span>
                    <p className="mt-2 text-base font-extrabold text-stone-900 truncate">{form.title || "Note title"}</p>
                    <p className="text-[11px] text-stone-600 line-clamp-2">{form.tagline || "Tagline appears here"}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Project & code" description="The “View Project” button on the card.">
            <div className="space-y-4">
              <Field label="Project badge" hint="chip on the card" error={errors.projectBadge}>
                <Input value={form.projectBadge} onChange={(e) => set("projectBadge", e.target.value)} placeholder="Free SaaS Repo" maxLength={60} />
              </Field>
              <Field label="Project title" error={errors.projectTitle}>
                <Input value={form.projectTitle} onChange={(e) => set("projectTitle", e.target.value)} placeholder="DevSprint: Cloud Task SaaS" />
              </Field>
              <Field label="GitHub link" error={errors.projectUrl}>
                <Input value={form.projectUrl} onChange={(e) => set("projectUrl", e.target.value)} placeholder="https://github.com/…" invalid={errors.projectUrl} />
              </Field>
              <Field label="Live demo link" error={errors.demoUrl}>
                <Input value={form.demoUrl} onChange={(e) => set("demoUrl", e.target.value)} placeholder="https://…" invalid={errors.demoUrl} />
              </Field>
              <Field label="Showcase project" hint="optional detail popup">
                <Select value={form.projectId} onChange={(e) => set("projectId", e.target.value)}>
                  <option value="">None — open GitHub link</option>
                  {projectsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>

          <Card title="Instructor" description="Shown on the reader page.">
            <div className="space-y-4">
              <Field label="Name">
                <Input value={form.instructor.name} onChange={(e) => setInstructor("name", e.target.value)} placeholder="Alex Rivera" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Role">
                  <Input value={form.instructor.role} onChange={(e) => setInstructor("role", e.target.value)} placeholder="Staff Engineer" />
                </Field>
                <Field label="Company">
                  <Input value={form.instructor.company} onChange={(e) => setInstructor("company", e.target.value)} placeholder="ex-Stripe" />
                </Field>
              </div>
              <Field label="Avatar image link" error={errors.instructor}>
                <Input value={form.instructor.avatar} onChange={(e) => setInstructor("avatar", e.target.value)} placeholder="https://…/photo.jpg" invalid={errors.instructor} />
              </Field>
            </div>
          </Card>

          {!isNew && (
            <Card title="Danger zone">
              <p className="text-xs text-stone-500 mb-3">Moving to trash hides the note from the site right away. You can restore it later from the Trash tab.</p>
              <Button variant="dangerGhost" icon={Trash2} onClick={() => setConfirmTrash(true)}>
                Move to trash
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Sticky save bar on small screens */}
      {dirty && (
        <div className="xl:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-stone-200 p-3 flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-stone-600">Unsaved changes</span>
          <Button variant="accent" icon={Save} onClick={() => save()} loading={saving}>
            {isNew ? "Create note" : "Save"}
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmTrash}
        title="Move this note to trash?"
        message="It will disappear from the website immediately. Likes and ratings are kept, and you can restore it any time."
        confirmLabel="Move to trash"
        loading={saving}
        onConfirm={trash}
        onCancel={() => setConfirmTrash(false)}
      />
    </div>
  );
}

function BackLink() {
  return (
    <Link href="/admin/notes" className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-[#093c33]">
      <ArrowLeft className="w-3.5 h-3.5" />
      All notes
    </Link>
  );
}

function LockedNotice({ what }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-stone-50 border border-dashed border-stone-300 text-sm text-stone-600">
      <Lock className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
      <span>Create the note first, then you can add {what}.</span>
    </div>
  );
}

/* ── Main PDF ─────────────────────────────────────────────────────────────── */
function PdfCard({ note, isNew, form, set, errors, onNote }) {
  const toast = useToast();
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [removing, setRemoving] = useState(false);

  const pick = async (file) => {
    if (!file) return;
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    if (!isPdf) {
      toast.error("Please choose a PDF file for the main document.");
      return;
    }
    if (file.size === 0) {
      toast.error("That file is empty.");
      return;
    }
    setProgress(0);
    try {
      const { data } = await api.admin.uploadNoteFile(note.id, file, "primary", setProgress);
      onNote(data);
      toast.success(`PDF uploaded${data.pages ? ` · ${data.pages} pages detected` : ""}.`, { duration: 3000 });
    } catch (err) {
      toast.error(friendlyMessage(err, "The upload didn't finish. Please try again."));
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async () => {
    setRemoving(true);
    try {
      const { data } = await api.admin.removeNoteFile(note.id, note.file.id);
      onNote(data);
      toast.success("PDF removed.", { duration: 2000 });
    } catch (err) {
      toast.error(friendlyMessage(err, "We couldn't remove that file."));
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Card title="Main PDF" description="The document students read and download. Page count is detected automatically.">
      {isNew ? (
        <LockedNotice what="the PDF" />
      ) : (
        <div className="space-y-4">
          {note.file && progress === null && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="w-11 h-11 rounded-xl bg-[#093c33] text-white flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-stone-900 truncate">{note.file.originalName}</p>
                <p className="text-xs text-stone-600">
                  {formatBytes(note.file.byteSize)}
                  {note.file.pageCount ? ` · ${note.file.pageCount} pages` : ""} · uploaded {new Date(note.file.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
                Replace
              </Button>
              <Button variant="dangerGhost" size="sm" icon={X} loading={removing} onClick={remove}>
                Remove
              </Button>
            </div>
          )}

          {progress !== null ? (
            <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-2">
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#093c33]" />
                  {progress < 100 ? "Uploading…" : "Processing…"}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-stone-200 overflow-hidden">
                <div className="h-full bg-[#f3843f] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            !note.file && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  pick(e.dataTransfer.files?.[0]);
                }}
                className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${dragOver ? "border-[#f3843f] bg-orange-50" : "border-stone-300 bg-stone-50 hover:bg-stone-100"}`}
              >
                <UploadCloud className="w-8 h-8 mx-auto text-[#093c33]" />
                <p className="mt-2 text-sm font-bold text-stone-800">Drop the PDF here, or click to choose</p>
                <p className="text-xs text-stone-500 mt-1">PDF only. Large files are fine; you will see the progress.</p>
              </div>
            )
          )}
          <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />

          <Field label="Pages" hint="auto-detected; override if needed" error={errors.pages} className="max-w-xs">
            <Input type="number" min={1} value={form.pages} onChange={(e) => set("pages", e.target.value)} placeholder="e.g. 140" invalid={errors.pages} />
          </Field>
        </div>
      )}
    </Card>
  );
}

/* ── Code snippets (CODE blocks) ──────────────────────────────────────────── */
function SnippetsCard({ note, isNew, onNote }) {
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const snippets = (note?.blocks ?? []).filter((b) => b.type === "CODE");

  return (
    <Card
      title="Code snippets"
      description="Shown on the reader page with a copy button."
      action={!isNew && !adding ? <Button size="sm" variant="secondary" icon={Plus} onClick={() => setAdding(true)}>Add snippet</Button> : null}
    >
      {isNew ? (
        <LockedNotice what="code snippets" />
      ) : (
        <div className="space-y-3">
          {snippets.length === 0 && !adding && (
            <p className="text-sm text-stone-500 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-stone-400" /> No snippets yet. Add starter code, a solution, or a config students can copy.
            </p>
          )}
          {snippets.map((b) => (
            <SnippetEditor
              key={b.id}
              initial={b.content}
              onSave={async (content) => {
                const { data } = await api.admin.updateBlock(note.id, b.id, content);
                onNote(data);
                toast.success("Snippet updated.", { duration: 2000 });
              }}
              onDelete={async () => {
                const { data } = await api.admin.deleteBlock(note.id, b.id);
                onNote(data);
                toast.success("Snippet removed.", { duration: 2000 });
              }}
            />
          ))}
          {adding && (
            <SnippetEditor
              initial={{ language: "javascript", code: "", filename: "" }}
              startOpen
              onCancel={() => setAdding(false)}
              onSave={async (content) => {
                const { data } = await api.admin.addBlock(note.id, { type: "CODE", content });
                onNote(data);
                setAdding(false);
                toast.success("Snippet added.", { duration: 2000 });
              }}
            />
          )}
        </div>
      )}
    </Card>
  );
}

function SnippetEditor({ initial, startOpen = false, onSave, onDelete, onCancel }) {
  const toast = useToast();
  const [open, setOpen] = useState(startOpen);
  const [language, setLanguage] = useState(initial.language || "javascript");
  const [filename, setFilename] = useState(initial.filename || "");
  const [code, setCode] = useState(initial.code || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    if (!code.trim()) {
      setError("Paste some code first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSave({ language, code, ...(filename.trim() ? { filename: filename.trim() } : {}) });
      setOpen(false);
    } catch (err) {
      setError(friendlyMessage(err, "We couldn't save this snippet."));
    } finally {
      setBusy(false);
    }
  };

  const del = async () => {
    setBusy(true);
    try {
      await onDelete();
    } catch (err) {
      toast.error(friendlyMessage(err, "We couldn't remove this snippet."));
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-stone-200 overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 bg-stone-50 hover:bg-stone-100 text-left">
        <Code2 className="w-4 h-4 text-[#093c33]" />
        <span className="text-sm font-bold text-stone-800 truncate flex-1">{filename || `${language} snippet`}</span>
        <span className="text-[11px] text-stone-500">{code.split("\n").length} lines</span>
        {open ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
      </button>
      {open && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Language">
              <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="File name" hint="optional">
              <Input value={filename} onChange={(e) => setFilename(e.target.value)} placeholder="main.py" />
            </Field>
          </div>
          <Field label="Code" error={error}>
            <Textarea value={code} onChange={(e) => setCode(e.target.value)} rows={10} spellCheck={false} className="font-mono text-xs" placeholder="// paste code here" invalid={error} />
          </Field>
          <div className="flex items-center justify-between gap-2">
            {onDelete ? (
              <Button variant="dangerGhost" size="sm" icon={Trash2} onClick={del} loading={busy}>
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              {onCancel && (
                <Button variant="secondary" size="sm" onClick={onCancel} disabled={busy}>
                  Cancel
                </Button>
              )}
              <Button size="sm" icon={Save} onClick={save} loading={busy}>
                Save snippet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Extra downloads (ZIP of source code, images, …) ──────────────────────── */
function AttachmentsCard({ note, isNew, onNote }) {
  const toast = useToast();
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const files = (note?.assets ?? []).filter((a) => a.role !== "primary" && a.originalName);

  const pick = async (file) => {
    if (!file) return;
    setProgress(0);
    try {
      const { data } = await api.admin.uploadNoteFile(note.id, file, "attachment", setProgress);
      onNote(data);
      toast.success(`${file.name} attached.`, { duration: 2500 });
    } catch (err) {
      toast.error(friendlyMessage(err, "The upload didn't finish. Please try again."));
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async (uploadId) => {
    setRemovingId(uploadId);
    try {
      const { data } = await api.admin.removeNoteFile(note.id, uploadId);
      onNote(data);
    } catch (err) {
      toast.error(friendlyMessage(err, "We couldn't remove that file."));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Card
      title="Downloads"
      description="Extra files students can download: source code ZIP, images, datasets."
      action={!isNew ? <Button size="sm" variant="secondary" icon={Paperclip} onClick={() => inputRef.current?.click()} loading={progress !== null}>Add file</Button> : null}
    >
      {isNew ? (
        <LockedNotice what="downloadable files" />
      ) : (
        <div className="space-y-2">
          {progress !== null && (
            <div className="h-2 rounded-full bg-stone-200 overflow-hidden">
              <div className="h-full bg-[#f3843f] transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
          {files.length === 0 && progress === null && <p className="text-sm text-stone-500">No extra files yet. ZIP, images and source files are accepted.</p>}
          {files.map((f) => (
            <div key={f.upload} className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 bg-stone-50">
              <Paperclip className="w-4 h-4 text-stone-500 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-stone-800 truncate">{f.originalName}</p>
                <p className="text-[11px] text-stone-500">{formatBytes(f.byteSize)}</p>
              </div>
              <Button variant="dangerGhost" size="sm" icon={X} loading={removingId === f.upload} onClick={() => remove(f.upload)}>
                Remove
              </Button>
            </div>
          ))}
          <input ref={inputRef} type="file" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
        </div>
      )}
    </Card>
  );
}

/* ── Chapters (table of contents) ─────────────────────────────────────────── */
function ChaptersCard({ chapters, error, onChange }) {
  const update = (i, key, value) => onChange(chapters.map((c, idx) => (idx === i ? { ...c, [key]: value } : c)));
  const remove = (i) => onChange(chapters.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= chapters.length) return;
    const next = chapters.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => onChange([...chapters, { number: String(chapters.length + 1).padStart(2, "0"), title: "", summary: "", contentSnippet: "" }]);

  return (
    <Card
      title="Chapters"
      description="Table of contents shown beside the reader. Optional but recommended."
      action={<Button size="sm" variant="secondary" icon={Plus} onClick={add}>Add chapter</Button>}
    >
      {error && <p className="mb-3 text-[11px] font-semibold text-rose-600">{error}</p>}
      {chapters.length === 0 && <p className="text-sm text-stone-500">No chapters yet.</p>}
      <div className="space-y-3">
        {chapters.map((c, i) => (
          <div key={i} className="rounded-2xl border border-stone-200 p-4 space-y-3 bg-stone-50/50">
            <div className="flex items-center gap-2">
              <Input value={c.number} onChange={(e) => update(i, "number", e.target.value)} placeholder="01" className="w-20 text-center font-bold" maxLength={10} />
              <Input value={c.title} onChange={(e) => update(i, "title", e.target.value)} placeholder="Chapter title" invalid={error && !c.title.trim()} />
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="cursor-pointer p-2 rounded-lg text-stone-500 hover:bg-stone-200 disabled:opacity-30" aria-label="Move up">
                <ChevronUp className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === chapters.length - 1} className="cursor-pointer p-2 rounded-lg text-stone-500 hover:bg-stone-200 disabled:opacity-30" aria-label="Move down">
                <ChevronDown className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => remove(i)} className="cursor-pointer p-2 rounded-lg text-rose-600 hover:bg-rose-50" aria-label="Remove chapter">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <Textarea value={c.summary} onChange={(e) => update(i, "summary", e.target.value)} rows={2} placeholder="Short summary of what this chapter covers" />
            <Textarea value={c.contentSnippet} onChange={(e) => update(i, "contentSnippet", e.target.value)} rows={2} placeholder="Key concept or snippet shown in the preview" />
          </div>
        ))}
      </div>
    </Card>
  );
}
