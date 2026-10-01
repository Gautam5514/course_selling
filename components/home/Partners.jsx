"use client";

export default function Partners() {
  return (
    <section className="bg-[#062c23] py-9 sm:py-11 border-y border-emerald-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-emerald-300/60 mb-8">
          Trusted by top engineers & teams worldwide
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
          {/* Slack */}
          <div className="flex items-center gap-2 text-white font-bold text-lg tracking-tight hover:opacity-100">
            <span className="text-emerald-400 font-extrabold text-2xl">#</span>
            <span>slack</span>
          </div>

          {/* Netflix */}
          <div className="text-white font-black text-xl tracking-wider hover:opacity-100">
            NETFLIX
          </div>

          {/* Google */}
          <div className="text-white font-semibold text-xl tracking-tight hover:opacity-100">
            Google
          </div>

          {/* Amazon */}
          <div className="text-white font-bold text-xl tracking-tighter hover:opacity-100">
            amazon
          </div>

          {/* Spotify */}
          <div className="flex items-center gap-1.5 text-white font-bold text-lg hover:opacity-100">
            <div className="w-5 h-5 rounded-full border-2 border-emerald-400 flex items-center justify-center">
              <span className="block w-2.5 h-1 border-t-2 border-emerald-400 rounded-full" />
            </div>
            <span>Spotify</span>
          </div>

          {/* Microsoft */}
          <div className="flex items-center gap-2 text-white font-semibold text-lg hover:opacity-100">
            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
              <div className="bg-red-400" />
              <div className="bg-emerald-400" />
              <div className="bg-blue-400" />
              <div className="bg-amber-400" />
            </div>
            <span>Microsoft</span>
          </div>

          {/* Airbnb */}
          <div className="text-white font-bold text-lg tracking-tight hover:opacity-100">
            airbnb
          </div>
        </div>
      </div>
    </section>
  );
}
