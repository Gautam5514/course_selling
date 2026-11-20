/**
 * Backend API client for the course_selling frontend.
 *
 * Talks to the independent Node/Express backend. Configure the base URL via
 * NEXT_PUBLIC_API_URL (see .env.local.example). Falls back to localhost:5001.
 *
 * The backend uses a uniform envelope:
 *   success: { data, meta? }
 *   error:   { error: { code, message, details? } }
 */

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"
).replace(/\/$/, "");

import { getVisitorId } from "./visitor";

// Browsers (Safari, Chrome incognito, Brave) drop third-party cookies, and the
// API lives on another domain (onrender.com) than the site (vercel.app). Keep
// the JWT from the login response as a Bearer fallback so sessions still work.
const TOKEN_KEY = "course_token";
function getToken() {
  try {
    return typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
function setToken(token) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage blocked: cookie auth only */
  }
}

/** Turn a backend-relative path (e.g. /api/uploads/:id/raw) into an absolute URL. */
export function absoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${API_BASE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = "ApiError";
    this.status = status; // 0 = could not reach the server at all
    this.code = code;
    this.details = details;
  }

  get isNetwork() {
    return this.status === 0;
  }
}

/** Plain-language messages for things that can go wrong, keyed by error code. */
const FRIENDLY_BY_CODE = {
  NETWORK: "We can't reach the server right now. Check your connection and try again.",
  OFFLINE: "You appear to be offline. Reconnect and try again.",
  TIMEOUT: "That took too long. Please try again.",
  RATE_LIMITED: "You're doing that a little too fast. Give it a moment and try again.",
  SERVICE_UNAVAILABLE: "We're having a brief hiccup on our side. Please try again shortly.",
  INTERNAL: "Something went wrong on our side. Please try again in a moment.",
  AUTH_REQUIRED: "Please sign in to continue.",
  FORBIDDEN: "You don't have permission to do that.",
  NOT_FOUND: "We couldn't find what you were looking for.",
  VISITOR_REQUIRED: "Your browser is blocking site storage, which likes and ratings need. Try a normal (non-private) window.",
  CONFLICT: "That already exists.",
  VALIDATION: "Please check the highlighted fields and try again.",
};

const GENERIC = "Something went wrong. Please try again.";

/**
 * Turn any error into one friendly sentence for end users. Never exposes
 * stack traces, status codes or developer wording.
 */
export function friendlyMessage(err, fallback = GENERIC) {
  if (!err) return fallback;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return FRIENDLY_BY_CODE.OFFLINE;
  if (err instanceof ApiError) {
    if (err.isNetwork) return FRIENDLY_BY_CODE[err.code] || FRIENDLY_BY_CODE.NETWORK;
    // Server messages are already written for users; prefer them for 4xx.
    if (err.status >= 400 && err.status < 500 && err.message && !/^[A-Z_]+$/.test(err.message)) {
      return err.message;
    }
    return FRIENDLY_BY_CODE[err.code] || fallback;
  }
  if (err?.name === "AbortError") return FRIENDLY_BY_CODE.TIMEOUT;
  return fallback;
}

/**
 * Map Zod field issues to friendly per-field hints: { email: "…", password: "…" }.
 */
const FIELD_LABELS = {
  name: "Name",
  email: "Email",
  password: "Password",
  value: "Rating",
  review: "Review",
  title: "Title",
  slug: "Link (slug)",
  tagline: "Tagline",
  description: "Description",
  category: "Category",
  tags: "Tags",
  badge: "Badge",
  level: "Level",
  accent: "Accent colour",
  icon: "Icon",
  order: "Order",
  price: "Price",
  pages: "Pages",
  videoUrl: "Video link",
  projectUrl: "GitHub link",
  demoUrl: "Demo link",
  projectBadge: "Project badge",
  projectTitle: "Project title",
  chapters: "Chapters",
  instructor: "Instructor",
  role: "Role",
  date: "Date",
  problemNumber: "Problem number",
  platform: "Platform",
  problemUrl: "Problem link",
  difficulty: "Difficulty",
  topics: "Topics",
  statement: "Problem summary",
  approach: "Approach",
  solutions: "Solutions",
  complexity: "Complexity",
};
export function fieldErrors(err) {
  const out = {};
  if (!(err instanceof ApiError) || !Array.isArray(err.details)) return out;
  for (const d of err.details) {
    const key = String(d.path || "").split(".")[0];
    if (!key) continue;
    const label = FIELD_LABELS[key] || key;
    const m = String(d.message || "");
    let text;
    if (/too small|>=\s*\d+ char/i.test(m)) {
      const n = m.match(/>=\s*(\d+)/)?.[1];
      text = n ? `${label} needs at least ${n} characters.` : `${label} is too short.`;
    } else if (/too big|<=\s*\d+ char/i.test(m)) {
      const n = m.match(/<=\s*(\d+)/)?.[1];
      text = n ? `${label} can be at most ${n} characters.` : `${label} is too long.`;
    } else if (/invalid email/i.test(m)) {
      text = "Please enter a valid email address.";
    } else if (/required|expected string, received undefined/i.test(m)) {
      text = `${label} is required.`;
    } else if (/valid link|invalid url/i.test(m)) {
      text = `${label} must be a full link starting with https://`;
    } else if (/invalid option/i.test(m)) {
      text = `Please pick one of the available ${label.toLowerCase()} options.`;
    } else if (/is required|chapter title/i.test(m)) {
      text = m;
    } else {
      text = `${label} is not valid.`;
    }
    if (!out[key]) out[key] = text;
  }
  return out;
}

async function request(path, { method = "GET", body, headers, signal, cache, next, timeoutMs = 60000 } = {}) {
  const url = `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  const visitorId = getVisitorId(); // null on the server

  // Render's free tier sleeps and needs ~50s to wake, so give a cold start
  // room (60s) instead of reporting a failure after 15s.
  const controller = signal ? null : new AbortController();
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  const token = getToken();

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(visitorId ? { "X-Visitor-Id": visitorId } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include", // send/receive the auth cookie
      signal: signal ?? controller.signal,
      cache,
      next,
    });
  } catch (err) {
    // DNS failure, refused connection, CORS block, offline, or our timeout.
    const code = err?.name === "AbortError" ? "TIMEOUT" : "NETWORK";
    throw new ApiError(0, code, friendlyMessage(null, FRIENDLY_BY_CODE[code]));
  } finally {
    if (timer) clearTimeout(timer);
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    /* empty / non-json response */
  }

  if (!res.ok) {
    const err = payload?.error ?? {};
    const code = err.code || (res.status === 429 ? "RATE_LIMITED" : res.status >= 500 ? "INTERNAL" : "HTTP_ERROR");
    throw new ApiError(res.status, code, err.message || FRIENDLY_BY_CODE[code] || GENERIC, err.details);
  }
  // Any admin change may alter what readers see: drop the saved reader copies.
  if (method !== "GET" && path.startsWith("/api/admin/") && typeof window !== "undefined") {
    invalidateReads("note:");
    invalidateReads("notes:");
    invalidateReads("daily:");
  }
  return payload; // { data, meta? }
}

/**
 * Multipart upload with progress (fetch cannot report upload progress).
 * Resolves with the same { data } envelope as request().
 */
function upload(path, file, { onProgress, fieldName = "file", timeoutMs = 10 * 60 * 1000 } = {}) {
  const url = `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.withCredentials = true;
    xhr.timeout = timeoutMs;
    const visitorId = getVisitorId();
    if (visitorId) xhr.setRequestHeader("X-Visitor-Id", visitorId);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && typeof onProgress === "function") {
        onProgress(Math.min(99, Math.round((e.loaded / e.total) * 100)));
      }
    };
    xhr.onload = () => {
      let payload = null;
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        /* non-json */
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        if (typeof onProgress === "function") onProgress(100);
        resolve(payload);
        return;
      }
      const err = payload?.error ?? {};
      const code = err.code || (xhr.status === 413 ? "UPLOAD_TOO_LARGE" : xhr.status >= 500 ? "INTERNAL" : "HTTP_ERROR");
      reject(new ApiError(xhr.status, code, err.message || FRIENDLY_BY_CODE[code] || GENERIC, err.details));
    };
    xhr.onerror = () => reject(new ApiError(0, "NETWORK", FRIENDLY_BY_CODE.NETWORK));
    xhr.ontimeout = () => reject(new ApiError(0, "TIMEOUT", FRIENDLY_BY_CODE.TIMEOUT));
    xhr.onabort = () => reject(new ApiError(0, "ABORTED", "Upload cancelled."));

    const fd = new FormData();
    fd.append(fieldName, file);
    xhr.send(fd);
  });
}

// ─── Client-side read cache ──────────────────────────────────────────────────
// Map-based TTL cache + in-flight promise Map (request de-duplication) with
// stale-while-revalidate: fresh hits are instant, stale hits return instantly
// and refresh in the background, and N components asking for the same URL
// share ONE network call. Browser only; SSR goes through Next's fetch cache.
const readStore = new Map(); // key -> { value, at }
const readInflight = new Map(); // key -> Promise

//
// `persist: true` also keeps the last good answer in localStorage, so a page
// opened again (even days later, even while the API is still waking up) paints
// instantly from the saved copy. The caller passes `onFresh` to receive the
// live answer when it lands and `onGone` if the saved copy turns out to be no
// longer valid (deleted / access removed), so stale data never sticks.
const PERSIST_PREFIX = "rc1:";
const PERSIST_MAX_ENTRIES = 16;
const PERSIST_MAX_CHARS = 300_000; // skip unusually large payloads

function persistRead(key) {
  try {
    const raw = window.localStorage.getItem(PERSIST_PREFIX + key);
    if (!raw) return null;
    const hit = JSON.parse(raw);
    return hit && typeof hit.at === "number" && "value" in hit ? hit : null;
  } catch {
    return null;
  }
}

function persistKeys() {
  const keys = [];
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(PERSIST_PREFIX)) keys.push(k);
    }
  } catch {
    /* storage blocked */
  }
  return keys;
}

function persistWrite(key, entry) {
  try {
    const raw = JSON.stringify(entry);
    if (raw.length > PERSIST_MAX_CHARS) return;
    const ls = window.localStorage;
    ls.setItem(PERSIST_PREFIX + key, raw);
    // Bounded: evict the oldest entries beyond the cap (least recently written).
    const keys = persistKeys();
    if (keys.length > PERSIST_MAX_ENTRIES) {
      keys
        .map((k) => {
          let at = 0;
          try {
            at = JSON.parse(ls.getItem(k))?.at ?? 0;
          } catch {
            /* corrupt entry: evict first */
          }
          return [k, at];
        })
        .sort((a, b) => a[1] - b[1])
        .slice(0, keys.length - PERSIST_MAX_ENTRIES)
        .forEach(([k]) => ls.removeItem(k));
    }
  } catch {
    /* quota exceeded or storage blocked: memory cache still works */
  }
}

function persistRemove(match) {
  try {
    for (const k of persistKeys()) if (match(k.slice(PERSIST_PREFIX.length))) window.localStorage.removeItem(k);
  } catch {
    /* storage blocked */
  }
}

function cachedGet(key, fetcher, { ttl = 30_000, swr = 300_000, persist = false, onFresh, onGone } = {}) {
  if (typeof window === "undefined") return fetcher();
  let hit = readStore.get(key);
  if (!hit && persist) {
    hit = persistRead(key);
    if (hit) readStore.set(key, hit);
  }
  const age = hit ? Date.now() - hit.at : Infinity;
  const refresh = () => {
    let p = readInflight.get(key);
    if (!p) {
      p = fetcher()
        .then((v) => {
          const entry = { value: v, at: Date.now() };
          readStore.set(key, entry);
          if (persist) persistWrite(key, entry);
          return v;
        })
        .finally(() => readInflight.delete(key));
      readInflight.set(key, p);
    }
    return p;
  };
  if (age < ttl) return Promise.resolve(hit.value);
  if (age < swr) {
    refresh().then(
      (v) => onFresh?.(v),
      (err) => {
        // The saved copy is wrong (not just unreachable): drop it and tell the caller.
        if (err instanceof ApiError && [401, 403, 404, 410].includes(err.status)) {
          readStore.delete(key);
          if (persist) persistRemove((k) => k === key);
          onGone?.(err);
        }
      }
    );
    return Promise.resolve(hit.value);
  }
  return refresh();
}

function invalidateReads(prefix) {
  for (const k of readStore.keys()) if (k.startsWith(prefix)) readStore.delete(k);
  if (typeof window !== "undefined") persistRemove((k) => k.startsWith(prefix));
}

/** Forget every cached read (called whenever the signed-in identity changes). */
function clearReads() {
  readStore.clear();
  if (typeof window !== "undefined") persistRemove(() => true);
}

/** True when this browser holds a session token (a session check is worth waiting for). */
export function hasSessionToken() {
  return Boolean(getToken());
}

const DAY_MS = 24 * 60 * 60 * 1000;
function localDayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Per-visitor/user entries must never leak between identities.
const identity = () => `${getVisitorId() || "-"}|${getToken() ? "m" : "a"}`;

function qs(params = {}) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    p.set(k, String(v));
  }
  const str = p.toString();
  return str ? `?${str}` : "";
}

// ─── Public reads ────────────────────────────────────────────────────────────
export const api = {
  /** List published public notes. Returns { data: Note[], meta: { nextCursor } }. */
  listNotes({ limit, cursor, category, tag, q, featured } = {}, opts = {}) {
    const params = new URLSearchParams();
    if (limit) params.set("limit", String(limit));
    if (cursor) params.set("cursor", cursor);
    if (category) params.set("category", category);
    if (tag) params.set("tag", tag);
    if (q) params.set("q", q);
    if (featured !== undefined) params.set("featured", String(Boolean(featured)));
    const qs = params.toString();
    const path = `/api/public/notes${qs ? `?${qs}` : ""}`;
    if (Object.keys(opts).length) return request(path, opts);
    return cachedGet(`notes:${path}`, () => request(path), { ttl: 30_000 });
  },

  /** Signed, short-lived links to a note's PDF and attachments (sign-in required). */
  getNoteFile(slug) {
    return request(`/api/public/notes/${encodeURIComponent(slug)}/file`, { cache: "no-store" });
  },

  /** Fetch one published note by slug (includes videoUrl + blocks + download urls). */
  getNote(slug, opts = {}) {
    return request(`/api/public/notes/${encodeURIComponent(slug)}`, opts);
  },

  /**
   * Reader variant of getNote: answers instantly from the saved copy when one
   * exists, then delivers the live note through `onFresh` (or `onGone` if it
   * was unpublished). Saved copies are per identity and wiped on login/logout.
   */
  getNoteCached(slug, { onFresh, onGone } = {}) {
    const path = `/api/public/notes/${encodeURIComponent(slug)}`;
    return cachedGet(`note:${identity()}:${slug}`, () => request(path, { cache: "no-store" }), {
      ttl: 20_000,
      swr: 7 * DAY_MS,
      persist: true,
      onFresh,
      onGone,
    });
  },

  /** Fetch a public space by slug. */
  getSpace(slug, opts = {}) {
    return request(`/api/public/spaces/${encodeURIComponent(slug)}`, opts);
  },

  // ─── Real engagement counters (likes / ratings) ──────────────────────────
  /**
   * Stats for several notes at once. Returns { data: { [slug]: stats } } where
   * stats = { likes, rating, ratingCount, pages, downloads, liked, myRating }.
   */
  getNoteStats(slugs, opts = {}) {
    const list = Array.isArray(slugs) ? slugs : [slugs];
    // Sorted so the same set of slugs always maps to the same cache key.
    const path = `/api/public/notes/stats?slugs=${encodeURIComponent([...list].sort().join(","))}`;
    if (Object.keys(opts).length) return request(path, { cache: "no-store", ...opts });
    return cachedGet(`stats:${identity()}:${path}`, () => request(path, { cache: "no-store" }), { ttl: 15_000, swr: 60_000 });
  },

  /** Toggle this visitor's like. Returns the updated stats object. */
  async likeNote(slug) {
    try {
      return await request(`/api/public/notes/${encodeURIComponent(slug)}/like`, { method: "POST" });
    } finally {
      invalidateReads("stats:");
      invalidateReads("notes:");
    }
  },

  /** Count a download (deduped per visitor per day). Returns the updated stats object. */
  async downloadNote(slug) {
    try {
      return await request(`/api/public/notes/${encodeURIComponent(slug)}/download`, { method: "POST" });
    } finally {
      invalidateReads("stats:");
      invalidateReads("notes:");
    }
  },

  /** Set / change my 1-5 rating (+ optional written review). Returns the updated stats object. */
  async rateNote(slug, value, review) {
    try {
      return await request(`/api/public/notes/${encodeURIComponent(slug)}/rate`, {
        method: "POST",
        body: typeof review === "string" ? { value, review } : { value },
      });
    } finally {
      invalidateReads("stats:");
      invalidateReads("notes:");
      invalidateReads("reviews:");
    }
  },

  /** Written reviews for one note, newest first. Public. */
  getNoteReviews(slug, limit = 20) {
    return request(`/api/public/notes/${encodeURIComponent(slug)}/reviews?limit=${limit}`, { cache: "no-store" });
  },

  /** Latest written reviews across all notes (home page testimonials). Public. */
  getLatestReviews(limit = 9, opts = {}) {
    return request(`/api/public/notes/reviews?limit=${limit}`, { next: { revalidate: 120 }, timeoutMs: 12000, ...opts });
  },

  // ─── Auth (students + admins share the same cookie session) ─────────────
  me(opts = {}) {
    // Short timeout: the UI must not hang on a sleeping backend (AuthProvider retries).
    return request("/api/auth/me", { cache: "no-store", timeoutMs: 8000, ...opts });
  },
  async login(email, password) {
    const res = await request("/api/auth/login", { method: "POST", body: { email, password } });
    setToken(res?.data?.token);
    clearReads();
    return res;
  },
  async register(name, email, password) {
    const res = await request("/api/auth/register", { method: "POST", body: { name, email, password } });
    setToken(res?.data?.token);
    clearReads();
    return res;
  },
  /** Google sign-in / sign-up with a Firebase ID token. */
  async googleLogin(idToken) {
    const res = await request("/api/auth/google", { method: "POST", body: { idToken } });
    setToken(res?.data?.token);
    clearReads();
    return res;
  },
  async logout() {
    try {
      return await request("/api/auth/logout", { method: "POST" });
    } finally {
      setToken(null);
      clearReads();
    }
  },

  // ─── Today Code (problem of the day) ─────────────────────────────────────
  dailyCode: {
    /** Archive of past days (dates + titles). Public. */
    list(params = {}, { onFresh } = {}) {
      const path = `/api/public/daily-code${qs(params)}`;
      return cachedGet(`daily:list:${path}`, () => request(path, { cache: "no-store" }), { ttl: 60_000, swr: DAY_MS, persist: true, onFresh });
    },
    /**
     * Latest live entry on or before today. Members only. Keyed by the local
     * calendar day, so yesterday's saved answer is never shown as today's.
     */
    today({ onFresh, onGone } = {}) {
      return cachedGet(`daily:${identity()}:today:${localDayKey()}`, () => request("/api/public/daily-code/today", { cache: "no-store" }), {
        ttl: 60_000,
        swr: DAY_MS,
        persist: true,
        onFresh,
        onGone,
      });
    },
    /** One day (YYYY-MM-DD). Members only. */
    get(date, { onFresh, onGone } = {}) {
      return cachedGet(`daily:${identity()}:day:${date}`, () => request(`/api/public/daily-code/${encodeURIComponent(date)}`, { cache: "no-store" }), {
        ttl: 60_000,
        swr: 7 * DAY_MS,
        persist: true,
        onFresh,
        onGone,
      });
    },
  },

  // ─── Admin (ADMIN / EDITOR accounts) ─────────────────────────────────────
  admin: {
    dashboard() {
      return request("/api/admin/dashboard", { cache: "no-store" });
    },

    listNotes(params = {}) {
      return request(`/api/admin/notes${qs(params)}`, { cache: "no-store" });
    },
    getNote(id) {
      return request(`/api/admin/notes/${encodeURIComponent(id)}`, { cache: "no-store" });
    },
    createNote(body) {
      return request("/api/admin/notes", { method: "POST", body });
    },
    updateNote(id, body) {
      return request(`/api/admin/notes/${encodeURIComponent(id)}`, { method: "PATCH", body });
    },
    deleteNote(id) {
      return request(`/api/admin/notes/${encodeURIComponent(id)}`, { method: "DELETE" });
    },
    restoreNote(id) {
      return request(`/api/admin/notes/${encodeURIComponent(id)}/restore`, { method: "POST" });
    },
    reorderNotes(order) {
      return request("/api/admin/notes/order", { method: "PATCH", body: { order } });
    },
    /** Create the built-in starter cards (DSA, Frontend, Full Stack, Backend…) that are missing. */
    addStarterNotes() {
      return request("/api/admin/notes/starter", { method: "POST" });
    },

    /** role: "primary" (main PDF) | "attachment" | "cover". onProgress(0-100). */
    uploadNoteFile(id, file, role = "primary", onProgress) {
      return upload(`/api/admin/notes/${encodeURIComponent(id)}/files?role=${role}`, file, { onProgress });
    },
    removeNoteFile(id, uploadId) {
      return request(`/api/admin/notes/${encodeURIComponent(id)}/files/${encodeURIComponent(uploadId)}`, { method: "DELETE" });
    },

    addBlock(id, body) {
      return request(`/api/admin/notes/${encodeURIComponent(id)}/blocks`, { method: "POST", body });
    },
    updateBlock(id, blockId, content) {
      return request(`/api/admin/notes/${encodeURIComponent(id)}/blocks/${encodeURIComponent(blockId)}`, {
        method: "PATCH",
        body: { content },
      });
    },
    deleteBlock(id, blockId) {
      return request(`/api/admin/notes/${encodeURIComponent(id)}/blocks/${encodeURIComponent(blockId)}`, { method: "DELETE" });
    },
    reorderBlocks(id, order) {
      return request(`/api/admin/notes/${encodeURIComponent(id)}/reorder`, { method: "PATCH", body: { order } });
    },

    listDailyCode(params = {}) {
      return request(`/api/admin/daily-code${qs(params)}`, { cache: "no-store" });
    },
    getDailyCode(id) {
      return request(`/api/admin/daily-code/${encodeURIComponent(id)}`, { cache: "no-store" });
    },
    createDailyCode(body) {
      return request("/api/admin/daily-code", { method: "POST", body });
    },
    updateDailyCode(id, body) {
      return request(`/api/admin/daily-code/${encodeURIComponent(id)}`, { method: "PATCH", body });
    },
    deleteDailyCode(id) {
      return request(`/api/admin/daily-code/${encodeURIComponent(id)}`, { method: "DELETE" });
    },

    listUsers(params = {}) {
      return request(`/api/admin/users${qs(params)}`, { cache: "no-store" });
    },
    setUserRole(id, role) {
      return request(`/api/admin/users/${encodeURIComponent(id)}/role`, { method: "PATCH", body: { role } });
    },
    deleteUser(id) {
      return request(`/api/admin/users/${encodeURIComponent(id)}`, { method: "DELETE" });
    },
  },
};

/** Human file size: 14.8 MB */
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n < 10 && i > 0 ? n.toFixed(1) : Math.round(n)} ${units[i]}`;
}

/** True for ADMIN / EDITOR accounts. */
export function isStaff(user) {
  return Boolean(user && (user.role === "ADMIN" || user.role === "EDITOR"));
}

export default api;
