"use client";

import Link from "next/link";

export function HelloSIcon({ className = "w-8 h-8" }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="helloSBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0b463b" />
          <stop offset="100%" stopColor="#05261f" />
        </linearGradient>

        <linearGradient id="helloSSpark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#f3843f" />
        </linearGradient>

        <filter id="helloSGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Squircle Base with Gold Rim */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="16"
        fill="url(#helloSBg)"
        stroke="#f59e0b"
        strokeOpacity="0.4"
        strokeWidth="1.75"
      />

      {/* Soft Ambient Inner Glow */}
      <ellipse
        cx="32"
        cy="14"
        rx="22"
        ry="8"
        fill="#ffffff"
        fillOpacity="0.1"
      />

      {/* "h" White Left Stem */}
      <path
        d="M18 16V46"
        stroke="#ffffff"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* "h" Arch flowing into "S" Wave */}
      <path
        d="M18 31C18 24.5 24.5 23 29 25.5C33.5 28 34 32.5 39 34.5C44 36.5 47 34 47 30"
        stroke="url(#helloSSpark)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* "S" Bottom Sweep */}
      <path
        d="M30 33C30 40 34 45.5 41 45.5C45.5 45.5 47.5 43 47.5 40"
        stroke="url(#helloSSpark)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* 4-Point Radiant Sparkle Star */}
      <path
        d="M48 13C48 16.5 45.5 19 42 19C45.5 19 48 21.5 48 25C48 21.5 50.5 19 54 19C50.5 19 48 16.5 48 13Z"
        fill="#fbbf24"
        filter="url(#helloSGlow)"
      />
    </svg>
  );
}

export default function BrandLogo({
  textColor = "text-white",
  size = "md",
  href = "/",
}) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const content = (
    <div className="flex items-center gap-2.5 group cursor-pointer select-none">
      {/* Icon Badge */}
      <div className="relative shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1">
        <HelloSIcon className={iconSizes[size] || iconSizes.md} />
      </div>

      {/* Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`font-extrabold tracking-tight ${textColor} ${
              textSizes[size] || textSizes.md
            } font-sans leading-none flex items-center`}
          >
            hello
            <span className="text-[#f3843f] ml-[1px] relative">
              S
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5 align-baseline" />
            </span>
          </span>

        </div>
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label="helloS Homepage">
      {content}
    </Link>
  );
}
