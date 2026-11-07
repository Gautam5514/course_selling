"use client";

import { useState } from "react";

/**
 * A code snippet with a copy-to-clipboard button.
 * Used for CODE blocks on a note detail page (e.g. the DSA solution code).
 */
export default function CodeBlock({ code, language, filename }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback for older browsers / insecure contexts.
      const ta = document.createElement("textarea");
      ta.value = code ?? "";
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        /* give up silently */
      }
      document.body.removeChild(ta);
    }
  }

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-[#0f2820]/15 bg-[#0f2820] text-[#faf7f2] shadow-sm">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="font-mono text-xs text-white/70">
          {filename || language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          className="inline-flex items-center gap-1.5 rounded-md bg-[#f3843f] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#e0732f] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="max-h-[70vh] overflow-auto p-4 text-sm leading-relaxed">
        <code className="font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}
