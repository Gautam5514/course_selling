"use client";

import { useState } from "react";
import { Copy, Check, Download, FileCode2 } from "lucide-react";
import { languageLabel, languageExt } from "@/lib/dailyCode";

/**
 * Structured code viewer for a solution: file tab, language, line numbers,
 * one-click Copy and a Download button. Keeps the code exactly as written
 * (tabs, indentation, blank lines) so what you copy is what you paste.
 */
export default function SolutionCode({ solution, title }) {
  const [copied, setCopied] = useState(false);
  const code = solution?.code ?? "";
  const lines = code.replace(/\r\n/g, "\n").split("\n");
  const filename = solution?.filename || `${(title || "solution").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "solution"}.${languageExt(solution?.language)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* nothing more we can do */
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function download() {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#0f2820]/15 bg-[#0d2b24] text-[#faf7f2] shadow-lg shadow-emerald-950/10">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#0b241e] px-4 py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-white/80 truncate">
            <FileCode2 className="w-3.5 h-3.5 text-[#f3843f] shrink-0" />
            {filename}
          </span>
          <span className="hidden sm:inline px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-extrabold uppercase tracking-wider text-emerald-100/90">
            {languageLabel(solution?.language)}
          </span>
          <span className="hidden sm:inline text-[11px] text-white/40">{lines.length} lines</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={download}
            title={`Download ${filename}`}
            aria-label="Download code file"
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy code to clipboard"
            className={`cursor-pointer inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition active:scale-95 ${copied ? "bg-emerald-500" : "bg-[#f3843f] hover:bg-[#e0732f]"}`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy code"}
          </button>
        </div>
      </div>
      <div className="max-h-[75vh] overflow-auto">
        <table className="w-full border-collapse font-mono text-[13px] leading-6">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="hover:bg-white/[0.04]">
                <td className="select-none w-12 pr-3 pl-4 text-right align-top text-white/30 tabular-nums border-r border-white/10">{i + 1}</td>
                <td className="pl-4 pr-6 align-top whitespace-pre text-[#f5f1e8]">{line || " "}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
