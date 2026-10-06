"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Play, ArrowRight, Star, FileText, Code2, Heart } from "lucide-react";
import {
  DoodleUnderline,
  SparkleStar,
  RayBurstDoodle,
} from "@/components/DecorativeShapes";

/* Words that rotate inside the hero hook — kept similar length so the
   fixed-width underline below never grows or shrinks */
const ROTATING_WORDS = [
  { text: "Full Stack", color: "#f3843f" },
  { text: "Backend", color: "#8ab4ff" },
  { text: "DSA", color: "#ffd166" },
  { text: "AI/ML", color: "#7ee0c3" },
];

function RotatingWord() {
  const [index, setIndex] = useState(0);
  const [animState, setAnimState] = useState("in"); // "in" | "out"

  useEffect(() => {
    const DISPLAY_MS = 1900; // time a word stays visible
    const EXIT_MS = 420; // slide/fade-out duration

    const outTimer = setTimeout(() => setAnimState("out"), DISPLAY_MS);
    const swapTimer = setTimeout(() => {
      setIndex((i) => (i + 1) % ROTATING_WORDS.length);
      setAnimState("in");
    }, DISPLAY_MS + EXIT_MS);

    return () => {
      clearTimeout(outTimer);
      clearTimeout(swapTimer);
    };
  }, [index]);

  const current = ROTATING_WORDS[index];

  return (
    <span
      className="relative inline-flex items-baseline justify-start overflow-hidden align-baseline"
      style={{ width: "5.4em" }}
      aria-live="polite"
    >
      <span
        key={index}
        className={`inline-block whitespace-nowrap will-change-transform ${animState === "out" ? "hw-rotate-out" : "hw-rotate-in"
          }`}
        style={{ color: current.color }}
      >
        {current.text}
      </span>
    </span>
  );
}

export default function Hero() {
  return (
    <section className="relative bg-[#0b382d] pt-6 sm:pt-8 text-white overflow-visible">
      {/* Background Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
      />

      {/* Decorative Wavy Shapes on Left */}
      <div className="absolute top-24 left-2 sm:left-6 opacity-30 pointer-events-none hidden lg:block">
        <div className="w-20 h-44 -rotate-12 flex flex-col gap-2">
          <div className="w-12 h-28 rounded-full bg-emerald-700/50" />
          <div className="w-12 h-36 rounded-full bg-emerald-700/50 -mt-8" />
        </div>
      </div>

      {/* Decorative Golden Sparkle Star on Right */}
      <div className="absolute top-64 right-6 sm:right-10 pointer-events-none opacity-90 hidden sm:block">
        <SparkleStar className="w-8 h-8 text-[#df9d66]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Top Notification Pill */}
        <Link
          href="/pdf-notes"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/40 text-xs sm:text-sm text-emerald-200/90 backdrop-blur-md mb-8 transition-colors group"
        >
          <span className="text-amber-400 font-bold">100% Free Forever</span>
          <span className="text-white font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            Explore <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        {/* Headline — rotating topic leads, benefit line follows */}
        <div className="relative max-w-3xl">
          <h1 className="text-[32px] sm:text-5xl md:text-[52px] font-bold tracking-tight text-white leading-[1.1]">
            <span className="sm:whitespace-nowrap">
              Master <RotatingWord />
            </span>
            <br />
            <span className="sm:whitespace-nowrap">
              the way it's{" "}
              <span className="relative inline-block">
                <span className="text-emerald-300">meant to be</span>
                <span className="absolute -bottom-1 sm:-bottom-1.5 left-0 w-full pointer-events-none">
                  <DoodleUnderline className="w-full h-2.5 sm:h-3 text-emerald-300" />
                </span>
              </span>{" "}
              taught.
            </span>
          </h1>

          {/* Decorative Orange Ray Burst Doodle */}
          <div className="absolute -bottom-7 right-2 sm:right-6 pointer-events-none">
            <RayBurstDoodle className="w-6 h-6 sm:w-7 sm:h-7 text-[#f3843f]" />
          </div>
        </div>

        {/* Subtitle */}
        <p className="mt-7 text-sm sm:text-base text-emerald-100/80 max-w-xl leading-relaxed">
          Clear, in-depth lessons on{" "}
          <span className="font-semibold text-white">DSA, Full Stack, Backend &amp; AI</span> —
          backed by real projects and free study notes. Learn the fundamentals deeply, build with
          confidence.
        </p>

        {/* Call to Actions Area */}
        <div className="mt-9 flex flex-col items-center gap-6">
          <div className="relative flex flex-wrap items-center justify-center gap-4">
            {/* White Button: Explore Projects */}
            <div className="relative">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm sm:text-base font-semibold bg-white text-[#0b382d] hover:bg-emerald-50 shadow-md hover:shadow-lg transition-all"
              >
                <Code2 className="w-4 h-4 text-[#ea8a42]" />
                Explore Projects
              </Link>

              {/* Sofia G. Collaborative Cursor Badge */}
              <div className="absolute -bottom-7 -left-3 pointer-events-none flex items-center z-20">
                <div className="relative flex items-center">
                  <svg
                    className="w-4 h-4 text-[#ea8a42] absolute -top-2.5 left-2 fill-current drop-shadow-sm"
                    viewBox="0 0 16 16"
                  >
                    <path d="M0 0L14 6L8 8L6 14L0 0Z" />
                  </svg>
                  <div className="bg-[#ea8a42] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md shadow-md mt-1">
                    Sofia G.
                  </div>
                </div>
              </div>
            </div>

            {/* Dark Pill: Browse PDF Notes */}
            <Link
              href="/pdf-notes"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm sm:text-base font-medium text-white bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/50 backdrop-blur-sm transition-all"
            >
              <FileText className="w-4 h-4 text-[#f3843f]" />
              Browse PDF Notes
            </Link>
          </div>

          {/* Social Proof Rating Bar: Avatars + Reviews */}
          <div className="mt-4 flex items-center gap-3 bg-emerald-950/40 border border-emerald-800/40 rounded-full px-4 py-1.5 backdrop-blur-sm">
            <div className="flex -space-x-2 overflow-hidden">
              <Image
                width={30}
                height={30}
                unoptimized
                className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0b382d] object-cover"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                alt="Developer 1"
              />
              <Image
                width={30}
                height={30}
                unoptimized
                className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0b382d] object-cover"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                alt="Developer 2"
              />
              <Image
                width={30}
                height={30}
                unoptimized
                className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0b382d] object-cover"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80"
                alt="Developer 3"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
              <span className="text-emerald-100/90 text-[11px] font-medium">
                48,000+ Downloads & Project Clones
              </span>
            </div>
          </div>
        </div>

        {/* HERO VIDEO PHOTO CARD - EXACT HALF-OVERLAP POSITION */}
        <div className="relative mt-14 sm:mt-16 w-full max-w-4xl -mb-40 sm:-mb-52 md:-mb-64 lg:-mb-72 z-30">
          <div className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden p-2 sm:p-2.5 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
            <div className="relative rounded-[22px] sm:rounded-[30px] overflow-hidden aspect-[16/10] sm:aspect-[16/9] w-full bg-slate-900 group">
              <Image
                src="/images/hero-students.jpg"
                alt="Developers collaborating on open source projects and reading technical notes"
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1100px"
              />

              {/* Centered Circular Play / Video Button */}
              <Link
                href="/projects"
                className="absolute inset-0 m-auto w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-[#094e46]/90 hover:bg-[#ea8a42] text-white flex items-center justify-center backdrop-blur-md border-2 border-white/20 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group/btn"
                aria-label="Play video"
              >
                <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-current ml-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
