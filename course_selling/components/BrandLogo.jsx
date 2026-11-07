"use client";

import Link from "next/link";

export function GopoIcon({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect x="2" y="2" width="60" height="60" rx="19" fill="#0b463b" />
      <path d="M43 23a16 16 0 1 0 3 21V33H33" stroke="#faf7f2" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="44" y="13" width="9" height="9" rx="3" fill="#f3843f" />
    </svg>
  );
}

export default function BrandLogo({ textColor = "text-white", size = "md", href = "/" }) {
  const sizes = {
    sm: { icon: "w-9 h-9", name: "text-xl", subtitle: "text-[8px]" },
    md: { icon: "w-11 h-11", name: "text-2xl", subtitle: "text-[9px]" },
    lg: { icon: "w-14 h-14", name: "text-3xl", subtitle: "text-[10px]" },
  };
  const current = sizes[size] || sizes.md;
  const content = (
    <span className={`inline-flex items-center gap-2.5 select-none ${textColor}`}>
      <GopoIcon className={`${current.icon} shrink-0`} />
      <span className="flex flex-col gap-1">
        <span className={`font-extrabold tracking-[-0.05em] leading-none ${current.name}`}>
          gopo<span className="text-[#f3843f]">.</span>
        </span>
        <span className={`font-semibold uppercase tracking-[0.22em] leading-none opacity-75 ${current.subtitle}`}>
          Workspace
        </span>
      </span>
    </span>
  );
  return href ? <Link href={href} aria-label="Gopo Workspace home" className="inline-flex shrink-0">{content}</Link> : content;
}
