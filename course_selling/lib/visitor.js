/**
 * Anonymous visitor identity for likes / ratings.
 *
 * Generated once per browser and kept in localStorage. Sent to the backend as
 * the `X-Visitor-Id` header so one visitor = one like / one rating per note.
 */
const STORAGE_KEY = "hellos_visitor_id";

function randomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

// If storage is blocked (private mode, strict privacy settings) we still keep
// a stable id for this page session so likes/ratings work until the tab closes.
let memoryId = null;

export function getVisitorId() {
  if (typeof window === "undefined") return null;
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id || !/^[A-Za-z0-9_-]{8,64}$/.test(id)) {
      id = memoryId || randomId();
      localStorage.setItem(STORAGE_KEY, id);
    }
    memoryId = id;
    return id;
  } catch {
    if (!memoryId) memoryId = randomId();
    return memoryId;
  }
}
