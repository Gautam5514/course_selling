/** Shared helpers for the "Today Code" (problem of the day) feature. */

export const PLATFORMS = ["LeetCode", "GeeksforGeeks", "Codeforces", "CodeChef", "HackerRank", "InterviewBit", "Other"];
export const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export const LANGUAGES = [
  { value: "cpp", label: "C++", ext: "cpp" },
  { value: "java", label: "Java", ext: "java" },
  { value: "python", label: "Python", ext: "py" },
  { value: "javascript", label: "JavaScript", ext: "js" },
  { value: "typescript", label: "TypeScript", ext: "ts" },
  { value: "c", label: "C", ext: "c" },
  { value: "go", label: "Go", ext: "go" },
  { value: "rust", label: "Rust", ext: "rs" },
  { value: "kotlin", label: "Kotlin", ext: "kt" },
  { value: "swift", label: "Swift", ext: "swift" },
  { value: "csharp", label: "C#", ext: "cs" },
  { value: "sql", label: "SQL", ext: "sql" },
  { value: "other", label: "Other", ext: "txt" },
];

export function languageLabel(value) {
  return LANGUAGES.find((l) => l.value === value)?.label || value;
}

export function languageExt(value) {
  return LANGUAGES.find((l) => l.value === value)?.ext || "txt";
}

export const DIFFICULTY_CLASS = {
  Easy: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Medium: "bg-amber-50 text-amber-800 border-amber-200",
  Hard: "bg-rose-50 text-rose-700 border-rose-200",
};

/** Local calendar date as YYYY-MM-DD (what the API keys entries by). */
export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** "2026-11-07" → "Fri, 7 Nov 2026" (no timezone shift). */
export function formatDay(key, opts = {}) {
  if (!key) return "";
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", ...opts });
}

export function isValidDateKey(key) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key || "")) return false;
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}
