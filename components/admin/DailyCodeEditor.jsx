"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Eye, EyeOff, Trash2, Plus, ChevronUp, ChevronDown, Code2, ExternalLink, X } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { api, ApiError, friendlyMessage, fieldErrors } from "@/lib/api";
import { PLATFORMS, DIFFICULTIES, LANGUAGES, DIFFICULTY_CLASS, todayKey, formatDay, isValidDateKey, languageLabel, languageExt } from "@/lib/dailyCode";
import SolutionCode from "@/components/daily/SolutionCode";
import { Card, Field, Input, Textarea, Select, Button, Badge, Spinner, Alert, ConfirmDialog } from "./ui";

let solutionKey = 0;
const newSolution = (language = "cpp") => ({ key: `s${(solutionKey += 1)}`, language, label: "", filename: "", code: "" });

function emptyForm() {
  return {
    date: todayKey(),
    title: "",
    problemNumber: "",
    platform: "LeetCode",
    problemUrl: "",
    difficulty: "Medium",
    topics: "",
    statement: "",
    approach: "",
    solutions: [newSolution()],
    complexity: { time: "", space: "" },
  };
}

function toForm(d) {
  return {
    ...emptyForm(),
    date: d.date,
    title: d.title ?? "",
    problemNumber: d.problemNumber ?? "",
    platform: d.platform || "LeetCode",
    problemUrl: d.problemUrl ?? "",
    difficulty: d.difficulty || "Medium",
    topics: (d.topics ?? []).join(", "),
    statement: d.statement ?? "",
    approach: d.approach ?? "",
    solutions: (d.solutions ?? []).length ? d.solutions.map((s) => ({ ...newSolution(s.language), label: s.label ?? "", filename: s.filename ?? "", code: s.code ?? "" })) : [newSolution()],
    complexity: { time: d.complexity?.time ?? "", space: d.complexity?.space ?? "" },
  };
}

function toPayload(f) {
  return {
    date: f.date.trim(),
    title: f.title.trim(),
    problemNumber: f.problemNumber.trim(),
    platform: f.platform,
    problemUrl: f.problemUrl.trim(),
    difficulty: f.difficulty,
    topics: f.topics.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 20),
    statement: f.statement.trim(),
    approach: f.approach.trim(),
    // Empty solution rows are just unused slots, not errors.
    solutions: f.solutions
      .filter((s) => s.code.trim())
      .map((s) => ({ language: s.language, label: s.label.trim(), filename: s.filename.trim(), code: s.code.replace(/\r\n/g, "\n") })),
    complexity: { time: f.complexity.time.trim(), space: f.complexity.space.trim() },
  };
}

function validate(f, { publishing }) {
  const e = {};
  if (!isValidDateKey(f.date.trim())) e.date = "Pick a real date (YYYY-MM-DD).";
  if (!f.title.trim()) e.title = "Give the problem a title.";
  if (f.title.trim().length > 200) e.title = "Keep the title under 200 characters.";
  if (f.problemUrl.trim() && !/^https?:\/\/\S+$/i.test(f.problemUrl.trim())) e.problemUrl = "The link must start with https://";
  if (publishing && !f.solutions.some((s) => s.code.trim())) e.solutions = "Add at least one solution before publishing.";
  return e;
}

function BackLink() {
  return (
    <Link href="/admin/daily-code" className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-[#093c33]">
      <ArrowLeft className="w-3.5 h-3.5" />
      Today Code
    </Link>
  );
}

export default function DailyCodeEditor({ entryId }) {
  const isNew = !entryId;
  const router = useRouter();
  const toast = useToast();

  const [entry, setEntry] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loaded, setLoaded] = useState(isNew);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [previewKey, setPreviewKey] = useState(null);

  useEffect(() => {
    if (isNew) return undefined;
    let active = true;
    api.admin
      .getDailyCode(entryId)
      .then(({ data }) => {
        if (!active) return;
        setEntry(data);
        setForm(toForm(data));
        setLoaded(true);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(err instanceof ApiError && err.status === 404 ? "We couldn't find that entry. It may have been deleted." : friendlyMessage(err, "We couldn't load this entry right now."));
        setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [entryId, isNew]);

  const savedPayload = useMemo(() => (entry ? JSON.stringify(toPayload(toForm(entry))) : null), [entry]);
  const dirty = isNew ? form.title.trim().length > 0 || form.solutions.some((s) => s.code.trim()) : savedPayload !== JSON.stringify(toPayload(form));

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
  const setComplexity = (key, value) => setForm((f) => ({ ...f, complexity: { ...f.complexity, [key]: value } }));
  const setSolution = (key, patch) => {
    setForm((f) => ({ ...f, solutions: f.solutions.map((s) => (s.key === key ? { ...s, ...patch } : s)) }));
    setErrors((e) => (e.solutions ? { ...e, solutions: undefined } : e));
  };
  const addSolution = () => {
    const used = new Set(form.solutions.map((s) => s.language));
    const next = LANGUAGES.find((l) => !used.has(l.value))?.value || "other";
    setForm((f) => ({ ...f, solutions: [...f.solutions, newSolution(next)] }));
  };
  const removeSolution = (key) => setForm((f) => ({ ...f, solutions: f.solutions.length > 1 ? f.solutions.filter((s) => s.key !== key) : [newSolution()] }));
  const moveSolution = (key, dir) =>
    setForm((f) => {
      const i = f.solutions.findIndex((s) => s.key === key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= f.solutions.length) return f;
      const next = [...f.solutions];
      [next[i], next[j]] = [next[j], next[i]];
      return { ...f, solutions: next };
    });

  const applyServerError = (err) => {
    const fe = fieldErrors(err);
    if (Object.keys(fe).length) {
      setErrors(fe);
      setFormError("Please check the highlighted fields.");
    } else {
      setFormError(friendlyMessage(err, "We couldn't save your changes. Please try again."));
    }
  };

  const live = entry?.status === "published";

  const save = async ({ publish } = {}) => {
    if (saving) return;
    setFormError("");
    const e = validate(form, { publishing: publish === true || (publish === undefined && live) });
    setErrors(e);
    if (Object.keys(e).length) {
      setFormError("Please check the highlighted fields.");
      return;
    }
    setSaving(true);
    try {
      const body = toPayload(form);
      if (publish !== undefined) body.publish = publish;
      if (isNew) {
        const { data } = await api.admin.createDailyCode(body);
        toast.success(publish ? `Published for ${formatDay(data.date)}. Members can see it now.` : `Saved as a draft for ${formatDay(data.date)}.`, { duration: 3000 });
        router.replace(`/admin/daily-code/${data.id}`);
        return;
      }
      const { data } = await api.admin.updateDailyCode(entryId, body);
      setEntry(data);
      setForm(toForm(data));
      toast.success(publish === true ? "Saved and published." : publish === false ? "Saved. The entry is now hidden." : "Changes saved.", { duration: 2500 });
    } catch (err) {
      applyServerError(err);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await api.admin.deleteDailyCode(entryId);
      toast.success("Entry deleted.", { duration: 2500 });
      router.replace("/admin/daily-code");
    } catch (err) {
      toast.error(friendlyMessage(err, "We couldn't delete that entry."));
      setSaving(false);
      setConfirmDelete(false);
    }
  };

  if (!loaded) return <Spinner label="Loading entry…" />;
  if (loadError) {
    return (
      <div className="space-y-4">
        <BackLink />
        <Alert>{loadError}</Alert>
      </div>
    );
  }

  const isToday = form.date === todayKey();

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="min-w-0">
          <BackLink />
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 truncate">{isNew ? "Post today's code" : entry.title}</h1>
            {!isNew && <Badge tone={live ? "success" : "warning"}>{live ? "Live" : "Draft"}</Badge>}
            {dirty && <Badge tone="info">Unsaved changes</Badge>}
          </div>
          {!isNew && (
            <p className="mt-1 text-xs text-stone-500">
              {formatDay(entry.date)}
              {live && (
                <Link href={entry.date === todayKey() ? "/today-code" : `/today-code/${entry.date}`} target="_blank" className="ml-2 inline-flex items-center gap-1 font-bold text-[#093c33] hover:text-[#f3843f]">
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
          {isNew ? (
            <>
              <Button variant="secondary" icon={Save} onClick={() => save()} loading={saving}>
                Save draft
              </Button>
              <Button variant="accent" icon={Eye} onClick={() => save({ publish: true })} loading={saving}>
                Publish now
              </Button>
            </>
          ) : (
            <Button variant="accent" icon={Save} onClick={() => save()} loading={saving} disabled={!dirty}>
              Save changes
            </Button>
          )}
        </div>
      </div>

      {formError && <Alert>{formError}</Alert>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card title="Problem" description="What members see at the top of the Today Code page.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Date" required hint={isToday ? "today" : ""} error={errors.date}>
                <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} invalid={errors.date} />
              </Field>
              <Field label="Problem number" hint="optional" error={errors.problemNumber}>
                <Input value={form.problemNumber} onChange={(e) => set("problemNumber", e.target.value)} placeholder="e.g. 1456" maxLength={20} />
              </Field>
              <Field label="Title" required error={errors.title} className="md:col-span-2">
                <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Maximum Number of Vowels in a Substring" invalid={errors.title} maxLength={200} />
              </Field>
              <Field label="Platform" error={errors.platform}>
                <Select value={form.platform} onChange={(e) => set("platform", e.target.value)}>
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Difficulty" error={errors.difficulty}>
                <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => set("difficulty", d)}
                      className={`cursor-pointer flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${form.difficulty === d ? DIFFICULTY_CLASS[d] : "border-transparent text-stone-600 hover:text-stone-900"}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Problem link" hint="optional" error={errors.problemUrl} className="md:col-span-2">
                <Input type="url" value={form.problemUrl} onChange={(e) => set("problemUrl", e.target.value)} placeholder="https://leetcode.com/problems/…" invalid={errors.problemUrl} />
              </Field>
              <Field label="Topics" hint="comma separated" error={errors.topics} className="md:col-span-2">
                <Input value={form.topics} onChange={(e) => set("topics", e.target.value)} placeholder="Sliding Window, Hash Map, Two Pointers" />
              </Field>
              <Field label="Problem summary" hint="in your words" error={errors.statement} className="md:col-span-2">
                <Textarea value={form.statement} onChange={(e) => set("statement", e.target.value)} rows={3} placeholder="Given an array of integers nums and an integer target, return…" maxLength={5000} />
              </Field>
            </div>
          </Card>

          <Card title="Approach" description="Intuition and steps. Line breaks are kept, so one step per line reads well.">
            <Field label="Approach" error={errors.approach}>
              <Textarea value={form.approach} onChange={(e) => set("approach", e.target.value)} rows={6} placeholder={"1. Keep a hash map of value → index.\n2. For each number check whether target − number was seen.\n3. Return both indices."} maxLength={20000} />
            </Field>
          </Card>

          <Card
            title="Solutions"
            description="Paste the exact code. Indentation and blank lines are kept, and members get a Copy button for each one."
            action={
              <Button variant="secondary" size="sm" icon={Plus} onClick={addSolution} disabled={form.solutions.length >= 10}>
                Add language
              </Button>
            }
          >
            {errors.solutions && (
              <div className="mb-4">
                <Alert>{errors.solutions}</Alert>
              </div>
            )}
            <div className="space-y-4">
              {form.solutions.map((s, i) => (
                <div key={s.key} className="rounded-2xl border border-stone-200 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-stone-50 border-b border-stone-200">
                    <Code2 className="w-4 h-4 text-[#093c33]" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-stone-600">Solution {i + 1}</span>
                    <span className="text-[11px] text-stone-400">{s.code ? `${s.code.split("\n").length} lines` : "empty"}</span>
                    <span className="flex-1" />
                    <button type="button" onClick={() => moveSolution(s.key, -1)} disabled={i === 0} className="cursor-pointer p-1.5 rounded-lg text-stone-500 hover:bg-stone-200 disabled:opacity-30" aria-label="Move up">
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => moveSolution(s.key, 1)} disabled={i === form.solutions.length - 1} className="cursor-pointer p-1.5 rounded-lg text-stone-500 hover:bg-stone-200 disabled:opacity-30" aria-label="Move down">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setPreviewKey(previewKey === s.key ? null : s.key)} className={`cursor-pointer px-2.5 py-1 rounded-lg text-[11px] font-bold ${previewKey === s.key ? "bg-[#093c33] text-white" : "text-stone-600 hover:bg-stone-200"}`}>
                      {previewKey === s.key ? "Hide preview" : "Preview"}
                    </button>
                    <button type="button" onClick={() => removeSolution(s.key)} className="cursor-pointer p-1.5 rounded-lg text-rose-600 hover:bg-rose-50" aria-label="Remove solution">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Field label="Language">
                        <Select value={s.language} onChange={(e) => setSolution(s.key, { language: e.target.value })}>
                          {LANGUAGES.map((l) => (
                            <option key={l.value} value={l.value}>
                              {l.label}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="Label" hint="optional">
                        <Input value={s.label} onChange={(e) => setSolution(s.key, { label: e.target.value })} placeholder="Optimal · O(n)" maxLength={80} />
                      </Field>
                      <Field label="File name" hint="optional">
                        <Input value={s.filename} onChange={(e) => setSolution(s.key, { filename: e.target.value })} placeholder={`solution.${languageExt(s.language)}`} maxLength={200} />
                      </Field>
                    </div>
                    <Field label="Code">
                      <Textarea
                        value={s.code}
                        onChange={(e) => setSolution(s.key, { code: e.target.value })}
                        onKeyDown={(e) => {
                          // Tab inserts indentation instead of leaving the field.
                          if (e.key !== "Tab") return;
                          e.preventDefault();
                          const el = e.currentTarget;
                          const { selectionStart, selectionEnd, value } = el;
                          const next = `${value.slice(0, selectionStart)}    ${value.slice(selectionEnd)}`;
                          setSolution(s.key, { code: next });
                          requestAnimationFrame(() => el.setSelectionRange(selectionStart + 4, selectionStart + 4));
                        }}
                        rows={14}
                        spellCheck={false}
                        wrap="off"
                        className="font-mono text-xs leading-5 whitespace-pre"
                        placeholder={`// paste the ${languageLabel(s.language)} solution here`}
                      />
                    </Field>
                    {previewKey === s.key && s.code.trim() && (
                      <div>
                        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-stone-500">How members will see it</p>
                        <SolutionCode solution={{ language: s.language, filename: s.filename, code: s.code }} title={form.title} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Complexity" description="Shown as two tiles under the code.">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Time">
                <Input value={form.complexity.time} onChange={(e) => setComplexity("time", e.target.value)} placeholder="O(n)" className="font-mono" maxLength={60} />
              </Field>
              <Field label="Space">
                <Input value={form.complexity.space} onChange={(e) => setComplexity("space", e.target.value)} placeholder="O(1)" className="font-mono" maxLength={60} />
              </Field>
            </div>
          </Card>

          <Card title="How it works">
            <ul className="text-xs text-stone-600 space-y-2 leading-relaxed list-disc pl-4">
              <li>The navbar&apos;s <strong>Today Code</strong> button opens the live entry for today. If today isn&apos;t posted yet, members see the most recent one.</li>
              <li>Only signed-in members can open the code. Visitors see the title in the archive and are asked to sign in.</li>
              <li>One entry per date. Pick a past date to back-fill, or a future date to prepare ahead (it stays hidden until that day).</li>
              <li>Drafts are never shown on the site.</li>
            </ul>
          </Card>

          {!isNew && (
            <Card title="Danger zone">
              <p className="text-xs text-stone-500 mb-3">Deleting removes this day&apos;s code for everyone. This cannot be undone.</p>
              <Button variant="dangerGhost" icon={Trash2} onClick={() => setConfirmDelete(true)} disabled={saving}>
                Delete entry
              </Button>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this entry?"
        message={`The code for ${formatDay(form.date)} will be removed permanently.`}
        confirmLabel="Delete"
        loading={saving}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
