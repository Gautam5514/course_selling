/**
 * Tiny in-memory LRU + TTL cache with single-flight loading.
 *
 * Data structures: a Map keeps insertion order, so re-inserting a key on read
 * gives O(1) LRU, and `map.keys().next()` is always the eviction candidate.
 * A second Map of in-flight promises de-duplicates a burst of identical
 * requests into one DB query (cache-stampede protection).
 * Per-process only: use short TTLs and never cache per-user data.
 */
export class TtlCache {
  constructor({ max = 300, ttlMs = 30_000 } = {}) {
    this.max = max;
    this.ttlMs = ttlMs;
    this.map = new Map(); // key -> { v, exp }
    this.pending = new Map(); // key -> Promise
  }

  get(key) {
    const e = this.map.get(key);
    if (!e) return undefined;
    if (e.exp < Date.now()) {
      this.map.delete(key);
      return undefined;
    }
    this.map.delete(key); // refresh LRU position
    this.map.set(key, e);
    return e.v;
  }

  set(key, v, ttlMs = this.ttlMs) {
    this.map.delete(key);
    this.map.set(key, { v, exp: Date.now() + ttlMs });
    if (this.map.size > this.max) this.map.delete(this.map.keys().next().value);
    return v;
  }

  /** Read-through: return cached value, or run loader once for concurrent callers. */
  async wrap(key, loader, ttlMs) {
    const hit = this.get(key);
    if (hit !== undefined) return hit;
    if (this.pending.has(key)) return this.pending.get(key);
    const p = loader()
      .then((v) => this.set(key, v, ttlMs))
      .finally(() => this.pending.delete(key));
    this.pending.set(key, p);
    return p;
  }

  clear() {
    this.map.clear();
  }
}

/** Shared cache for anonymous, user-independent public reads. */
export const publicCache = new TtlCache({ max: 300, ttlMs: 30_000 });
