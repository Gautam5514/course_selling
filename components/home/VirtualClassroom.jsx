"use client";

import Image from "next/image";
import {
  Mic,
  MicOff,
  Video,
  PhoneOff,
  Mail,
  Shield,
  Send,
  MoreHorizontal,
  ChevronUp,
  Edit2,
} from "lucide-react";
import { LeftEdgeConcentricRings, WavyPillCluster, RayBurstDoodle } from "@/components/DecorativeShapes";

export default function VirtualClassroom() {
  const participants = [
    {
      name: "Natasha Sunny",
      avatar: "/images/classroom-tutor-natasha.jpg",
      mic: true,
      video: true,
    },
    {
      name: "Sunny Marwah",
      avatar: "/images/classroom-sunny.jpg",
      mic: false,
      video: true,
    },
    {
      name: "Syarifah Hinata",
      avatar: "/images/classroom-syarifah.jpg",
      mic: true,
      video: true,
    },
    {
      name: "Helen Mentari",
      avatar: "/images/classroom-helen.jpg",
      mic: true,
      video: true,
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#fdfaf4] relative overflow-hidden">
      {/* Decorative Concentric Rings on Left Edge */}
      <div className="absolute top-16 sm:top-24 left-0 opacity-90 pointer-events-none hidden sm:block">
        <LeftEdgeConcentricRings className="w-28 h-52 sm:w-36 sm:h-64 text-[#ea8a42]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111827] leading-tight">
            Engaging Virtual Classrooms for
            <br />
            <span className="text-[#f3843f]">Real-Time</span> Learning
          </h2>
          <p className="mt-3.5 text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
            Collaborative spaces designed to make learning engaging and connected
            <br />
            —just like being in a real classroom.
          </p>
        </div>

        {/* Hand-drawn Tablet Monitor Frame Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Decorative Bottom-Right Wavy Ripple Shape */}
          <div className="absolute -bottom-8 -right-8 pointer-events-none z-0 hidden sm:block">
            <WavyPillCluster className="w-24 h-28 text-[#094e46]" />
          </div>

          {/* Decorative Bottom-Left Ray Burst Doodle */}
          <div className="absolute -bottom-6 -left-4 pointer-events-none z-20">
            <RayBurstDoodle className="w-8 h-8 text-[#ea8a42]" />
          </div>

          {/* Floating Robert Fox & Michel Jones Badge on Left */}
          <div className="absolute -top-4 -left-6 sm:-left-12 z-30 flex items-center">
            <div className="bg-white rounded-2xl p-3 shadow-xl border border-stone-100 flex flex-col gap-2 min-w-[150px]">
              <div className="flex items-center gap-2">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80"
                  alt="Robert Fox"
                  width={22}
                  height={22}
                  unoptimized
                  className="rounded-full object-cover"
                />
                <span className="text-xs font-semibold text-stone-800">
                  Robert Fox
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&auto=format&fit=crop&q=80"
                  alt="Michel Jones"
                  width={22}
                  height={22}
                  unoptimized
                  className="rounded-full object-cover"
                />
                <span className="text-xs font-semibold text-stone-800">
                  Michel Jones
                </span>
              </div>
            </div>

            {/* Hand-drawn Yellow Curved Doodle Arrow */}
            <svg
              className="w-10 h-8 text-amber-400 -ml-2 -mt-4 drop-shadow-sm select-none pointer-events-none hidden sm:block"
              viewBox="0 0 40 30"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M4 18 C12 6, 26 6, 34 16" />
              <path d="M28 16 L34 16 L33 10" />
            </svg>
          </div>

          {/* Hand-Drawn Stylized Tablet Outline */}
          <div className="relative z-10 bg-white rounded-[32px] sm:rounded-[40px] border-[3.5px] border-[#181818] p-3 sm:p-4 shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5">
              {/* 1. Main Teacher Feed (Left, 6 cols) */}
              <div className="lg:col-span-6 relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/3] lg:aspect-auto lg:min-h-[360px] bg-stone-100 flex items-center justify-center">
                <Image
                  src="/images/classroom-tutor-natasha.jpg"
                  alt="Natasha Sunny Teacher"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 450px"
                />

                {/* Top-Left Name Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <div className="w-4 h-4 rounded-full overflow-hidden relative">
                    <Image
                      src="/images/classroom-tutor-natasha.jpg"
                      alt="avatar"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-stone-800">
                    Natasha Sunny
                  </span>
                </div>

                {/* Top-Right Edit Icon Badge */}
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-sm">
                  <Edit2 className="w-3 h-3" />
                </div>

                {/* Floating Bottom Glass Control Bar */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/70 backdrop-blur-md border border-white/60 px-3 py-1.5 rounded-full flex items-center gap-2.5 shadow-md">
                  <button className="text-stone-700 hover:text-black transition-colors">
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                  <button className="text-stone-700 hover:text-black transition-colors">
                    <Video className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm hover:bg-rose-600 transition-colors">
                    <PhoneOff className="w-3 h-3" />
                  </button>
                  <button className="text-stone-700 hover:text-black transition-colors">
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                  <button className="text-stone-700 hover:text-black transition-colors">
                    <Shield className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 2. Middle Column: 3 Stacked Student Video Tiles (3 cols) */}
              <div className="lg:col-span-3 grid grid-cols-3 lg:grid-cols-1 gap-2.5">
                {/* Tile 1: Sunny Marwah */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-stone-100">
                  <Image
                    src="/images/classroom-sunny.jpg"
                    alt="Sunny Marwah"
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white/80 backdrop-blur-sm text-stone-800 flex items-center justify-center">
                    <Mic className="w-2.5 h-2.5" />
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-medium text-white">
                    Sunny Marwah
                  </div>
                </div>

                {/* Tile 2: Syarifah Hinata */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-stone-100">
                  <Image
                    src="/images/classroom-syarifah.jpg"
                    alt="Syarifah Hinata"
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Mic className="w-2.5 h-2.5" />
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-medium text-white">
                    Syarifah Hinata
                  </div>
                </div>

                {/* Tile 3: Helen Mentari */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-stone-100">
                  <Image
                    src="/images/classroom-helen.jpg"
                    alt="Helen Mentari"
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Mic className="w-2.5 h-2.5" />
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-medium text-white">
                    Helen Mentari
                  </div>
                </div>
              </div>

              {/* 3. Right Sidebar: Participants & Chat (3 cols) */}
              <div className="lg:col-span-3 flex flex-col justify-between rounded-2xl bg-white border border-stone-200/70 p-3">
                <div>
                  {/* Top: Participants Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-stone-900">
                        Participants
                      </span>
                      <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center">
                        22
                      </span>
                    </div>
                    <button className="text-stone-400 hover:text-stone-700">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Participants List */}
                  <div className="py-2.5 space-y-2">
                    {participants.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Image
                            src={p.avatar}
                            alt={p.name}
                            width={18}
                            height={18}
                            unoptimized
                            className="rounded-full object-cover"
                          />
                          <span className="text-[11px] font-medium text-stone-700 truncate max-w-[90px]">
                            {p.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-stone-400">
                          {p.mic ? (
                            <Mic className="w-3 h-3" />
                          ) : (
                            <MicOff className="w-3 h-3 text-rose-500" />
                          )}
                          <Video className="w-3 h-3" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Middle: Chat Header */}
                  <div className="flex items-center justify-between pt-2 pb-1 border-t border-stone-100">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-stone-900">
                        Chat
                      </span>
                      <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center">
                        21
                      </span>
                    </div>
                    <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
                  </div>

                  {/* Chat Bubbles */}
                  <div className="pt-2 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Image
                        src="/images/classroom-helen.jpg"
                        alt="Helen"
                        width={14}
                        height={14}
                        unoptimized
                        className="rounded-full object-cover"
                      />
                      <span className="text-[10px] font-semibold text-stone-800">
                        Helen Mentari (Student)
                      </span>
                      <span className="text-[9px] text-stone-400">10:11 AM</span>
                    </div>
                    <div className="space-y-1 pl-5">
                      <div className="bg-[#ea580c] text-white text-[11px] px-3 py-1.5 rounded-2xl rounded-tl-sm w-fit font-normal">
                        Can we inspect how the Server Action validates token headers?
                      </div>
                      <div className="bg-[#093c33] text-white text-[11px] px-3 py-1.5 rounded-2xl rounded-tl-sm w-fit font-normal">
                        Natasha: Exactly! Pulling up the middleware snippet on line 24 now.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Message Input Bar */}
                <div className="pt-3 border-t border-stone-100 mt-2">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Message..."
                      className="w-full bg-stone-50 border border-stone-200 rounded-full pl-3 pr-8 py-1.5 text-[11px] text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#ea580c]"
                    />
                    <button
                      type="button"
                      className="absolute right-1 w-6 h-6 rounded-full bg-[#ea580c] text-white flex items-center justify-center hover:bg-[#d94e07] transition-colors"
                      title="Send message"
                    >
                      <Send className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
