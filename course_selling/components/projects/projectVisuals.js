import { createElement } from "react";
import {
  Wallet,
  Smartphone,
  ScanFace,
  Camera,
  Wrench,
  FolderOpen,
  GraduationCap,
  Code2,
} from "lucide-react";

// Full class strings so Tailwind can see them at build time.
export const ACCENTS = {
  emerald: { cover: "from-[#0b4a3f] to-[#157a63]", chip: "bg-emerald-50 text-emerald-800 border-emerald-200", dot: "bg-emerald-500", text: "text-emerald-700" },
  teal: { cover: "from-[#0a4a52] to-[#12848c]", chip: "bg-teal-50 text-teal-800 border-teal-200", dot: "bg-teal-500", text: "text-teal-700" },
  violet: { cover: "from-[#3b2a78] to-[#6a4fc4]", chip: "bg-violet-50 text-violet-800 border-violet-200", dot: "bg-violet-500", text: "text-violet-700" },
  indigo: { cover: "from-[#27306f] to-[#4a5bc0]", chip: "bg-indigo-50 text-indigo-800 border-indigo-200", dot: "bg-indigo-500", text: "text-indigo-700" },
  amber: { cover: "from-[#8a4a12] to-[#e08a2e]", chip: "bg-amber-50 text-amber-900 border-amber-200", dot: "bg-amber-500", text: "text-amber-700" },
  sky: { cover: "from-[#0f4c75] to-[#2a8fca]", chip: "bg-sky-50 text-sky-800 border-sky-200", dot: "bg-sky-500", text: "text-sky-700" },
  rose: { cover: "from-[#7a2340] to-[#c9507a]", chip: "bg-rose-50 text-rose-800 border-rose-200", dot: "bg-rose-500", text: "text-rose-700" },
};

const ICONS = {
  wallet: Wallet,
  smartphone: Smartphone,
  "scan-face": ScanFace,
  camera: Camera,
  wrench: Wrench,
  folder: FolderOpen,
  "graduation-cap": GraduationCap,
};

export function accentFor(project) {
  return ACCENTS[project.accent] || ACCENTS.emerald;
}

/** The project's icon. Looked up from a fixed map, so no component is created during render. */
export function ProjectIcon({ project, className }) {
  return createElement(ICONS[project.icon] || Code2, { className, "aria-hidden": true });
}

/** "3 days ago" style label for an ISO date. Falls back to a plain date. */
export function timeAgo(iso) {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 60) return "a month ago";
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return new Date(iso).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}
