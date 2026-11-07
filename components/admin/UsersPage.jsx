"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Trash2, ShieldCheck, UserCircle2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { api, friendlyMessage } from "@/lib/api";
import ErrorState from "@/components/ui/ErrorState";
import { Card, Button, Badge, Spinner, Alert, EmptyState, Pagination, ConfirmDialog, Input, Select } from "./ui";

const ROLE_LABEL = { ADMIN: "Administrator", EDITOR: "Editor", VIEWER: "Student" };
const ROLE_TONE = { ADMIN: "brand", EDITOR: "info", VIEWER: "neutral" };

export default function UsersPage() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(() => {
    return api.admin
      .listUsers({ q, role, page, limit: 20 })
      .then((res) => {
        setResult(res);
        setError("");
      })
      .catch((err) => setError(friendlyMessage(err, "We couldn't load accounts right now.")));
  }, [q, role, page]);

  useEffect(() => {
    load();
  }, [load]);

  if (me?.role !== "ADMIN") {
    return <ErrorState eyebrow="Admins only" title="Account management is for administrators" message="Editors can manage notes and PDFs, but only an administrator can change roles or remove accounts." icon={ShieldCheck} homeHref="/admin" homeLabel="Back to dashboard" />;
  }

  const patch = (u) => setResult((r) => (r ? { ...r, data: r.data.map((x) => (x.id === u.id ? u : x)) } : r));

  const changeRole = async (u, next) => {
    if (next === u.role) return;
    setBusyId(u.id);
    try {
      const { data } = await api.admin.setUserRole(u.id, next);
      patch(data);
      toast.success(`${data.name || data.email} is now ${ROLE_LABEL[data.role].toLowerCase()}.`, { duration: 2500 });
    } catch (err) {
      toast.error(friendlyMessage(err, "We couldn't update that role."));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (u) => {
    setBusyId(u.id);
    try {
      await api.admin.deleteUser(u.id);
      setResult((r) => (r ? { ...r, data: r.data.filter((x) => x.id !== u.id), meta: { ...r.meta, total: r.meta.total - 1 } } : r));
      setConfirm(null);
      toast.success(`Removed ${u.email}.`, { duration: 2500 });
    } catch (err) {
      toast.error(friendlyMessage(err, "We couldn't remove that account."));
    } finally {
      setBusyId(null);
    }
  };

  const users = result?.data ?? [];
  const meta = result?.meta ?? {};

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#f3843f]">People</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">Accounts</h1>
        <p className="mt-1 text-sm text-stone-500">Students sign up on the website. Promote someone to Editor to let them manage notes, or to Administrator for full access.</p>
      </div>

      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQ(search.trim());
            setPage(1);
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…" className="pl-10" />
          </div>
          <Select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="sm:w-48"
          >
            <option value="">All roles</option>
            <option value="VIEWER">Students</option>
            <option value="EDITOR">Editors</option>
            <option value="ADMIN">Administrators</option>
          </Select>
          <Button type="submit">Search</Button>
        </form>

        <div className="mt-5">
          {error && <Alert onRetry={load}>{error}</Alert>}
          {!result && !error && <Spinner label="Loading accounts…" />}
          {result && users.length === 0 && <EmptyState icon={UserCircle2} title="No accounts found" message="Try a different search or role filter." />}
          {users.length > 0 && (
            <div className="overflow-x-auto -mx-5 sm:-mx-6">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-100">
                    <th className="px-5 sm:px-6 py-2 font-extrabold">Account</th>
                    <th className="px-3 py-2 font-extrabold">Role</th>
                    <th className="px-3 py-2 font-extrabold">Joined</th>
                    <th className="px-3 py-2 font-extrabold text-right pr-5 sm:pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {users.map((u) => {
                    const self = u.id === me.id;
                    const busy = busyId === u.id;
                    return (
                      <tr key={u.id} className="hover:bg-stone-50/60">
                        <td className="px-5 sm:px-6 py-3">
                          <div className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-full bg-[#093c33] text-white text-sm font-extrabold flex items-center justify-center shrink-0">{(u.name || u.email).slice(0, 1).toUpperCase()}</span>
                            <div className="min-w-0">
                              <p className="font-bold text-stone-900 truncate">
                                {u.name || "—"} {self && <span className="text-[10px] font-extrabold text-[#f3843f] uppercase ml-1">you</span>}
                              </p>
                              <p className="text-[11px] text-stone-500 truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          {self ? (
                            <Badge tone={ROLE_TONE[u.role]}>{ROLE_LABEL[u.role]}</Badge>
                          ) : (
                            <Select value={u.role} disabled={busy} onChange={(e) => changeRole(u, e.target.value)} className="w-44 py-1.5 text-xs">
                              <option value="VIEWER">Student</option>
                              <option value="EDITOR">Editor</option>
                              <option value="ADMIN">Administrator</option>
                            </Select>
                          )}
                        </td>
                        <td className="px-3 py-3 text-xs text-stone-600 whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</td>
                        <td className="px-3 py-3 pr-5 sm:pr-6 text-right">
                          {!self && (
                            <button type="button" disabled={busy} onClick={() => setConfirm(u)} title="Remove account" aria-label="Remove account" className="cursor-pointer w-8 h-8 rounded-lg text-rose-600 hover:bg-rose-50 inline-flex items-center justify-center disabled:opacity-50">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={meta.page} pages={meta.pages} total={meta.total} onPage={setPage} />
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Remove this account?"
        message={confirm ? `${confirm.email} will no longer be able to sign in. This cannot be undone.` : ""}
        confirmLabel="Remove account"
        loading={busyId === confirm?.id}
        onConfirm={() => confirm && remove(confirm)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
