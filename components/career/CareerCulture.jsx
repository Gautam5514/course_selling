"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CareerCulture() {
  return (
    <section className="py-20 sm:py-28 bg-[#faf7f2] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[36px] bg-[#093c33] p-8 sm:p-14 text-white overflow-hidden shadow-2xl relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-[#f3843f]/20 border border-[#f3843f]/40 text-xs font-bold text-[#f3843f]">
                Spontaneous Applications
              </span>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Don&apos;t see the exact role you are looking for?
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/75 leading-relaxed max-w-lg">
                We are always excited to connect with exceptional engineers, educators, and creators who are passionate about learning. Send us your work and tell us what you would love to build here.
              </p>
              <div className="pt-2">
                <Link
                  href="mailto:careers@hellobject.com"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#f3843f] hover:bg-[#e0732f] text-white font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  <span>Drop Us a Note</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-white/10">
              <Image
                src="/images/instructor-duo.jpg"
                alt="Our creative team collaborating"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 400px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
