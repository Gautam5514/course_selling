import { Code, Layers, Server, Sparkles, Network, Cloud, BookOpen, Database, Cpu, Smartphone, Shield, Terminal } from "lucide-react";

/** Accent colours an admin can pick for a card (kept in sync with the backend enum). */
export const ACCENTS = {
  amber: { label: "Amber", badge: "bg-amber-500/10 text-amber-700 border-amber-300/60", icon: "text-amber-600", swatch: "bg-amber-500" },
  emerald: { label: "Emerald", badge: "bg-emerald-500/10 text-emerald-800 border-emerald-300/60", icon: "text-emerald-600", swatch: "bg-emerald-500" },
  indigo: { label: "Indigo", badge: "bg-indigo-500/10 text-indigo-700 border-indigo-300/60", icon: "text-indigo-600", swatch: "bg-indigo-500" },
  purple: { label: "Purple", badge: "bg-purple-500/10 text-purple-700 border-purple-300/60", icon: "text-purple-600", swatch: "bg-purple-500" },
  rose: { label: "Rose", badge: "bg-rose-500/10 text-rose-700 border-rose-300/60", icon: "text-rose-600", swatch: "bg-rose-500" },
  sky: { label: "Sky", badge: "bg-sky-500/10 text-sky-700 border-sky-300/60", icon: "text-sky-600", swatch: "bg-sky-500" },
  teal: { label: "Teal", badge: "bg-teal-500/10 text-teal-700 border-teal-300/60", icon: "text-teal-600", swatch: "bg-teal-500" },
  orange: { label: "Orange", badge: "bg-orange-500/10 text-orange-700 border-orange-300/60", icon: "text-orange-600", swatch: "bg-orange-500" },
};

export const ICONS = { Code, Layers, Server, Sparkles, Network, Cloud, BookOpen, Database, Cpu, Smartphone, Shield, Terminal };

export function accentOf(name) {
  return ACCENTS[name] || ACCENTS.emerald;
}

export function CardIcon({ name, className = "w-3.5 h-3.5" }) {
  const Icon = ICONS[name] || BookOpen;
  return <Icon className={className} />;
}

/** Static landing cards → the same shape the API returns, for offline fallback. */
export const STATIC_ACCENT_BY_ID = {
  "dsa-notes": "amber",
  "fullstack-notes": "emerald",
  "backend-notes": "indigo",
  "ai-ml-notes": "purple",
  "system-design-notes": "rose",
  "devops-cloud-notes": "sky",
};
