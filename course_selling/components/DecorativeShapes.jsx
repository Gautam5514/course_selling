export function FlashLogo({ className = "w-6 h-6 text-amber-400" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
    </svg>
  );
}

// Brush underline doodle under Courses!
export function DoodleUnderline({ className = "w-full text-white" }) {
  return (
    <svg
      viewBox="0 0 220 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="none"
    >
      <path
        d="M3 14C45 5 130 4 216 11C165 17 88 18 35 15.5"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 18C70 12 150 11 205 16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

// Concentric Rings Shape (Full 360)
export function ConcentricRings({ className = "w-32 h-32 text-[#ea8a42]" }) {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ overflow: "visible" }}
    >
      <circle cx="120" cy="120" r="20" stroke="currentColor" strokeWidth="8" />
      <circle cx="120" cy="120" r="40" stroke="currentColor" strokeWidth="8" />
      <circle cx="120" cy="120" r="60" stroke="currentColor" strokeWidth="8" />
      <circle cx="120" cy="120" r="80" stroke="currentColor" strokeWidth="8" />
      <circle cx="120" cy="120" r="100" stroke="currentColor" strokeWidth="8" />
      <circle cx="120" cy="120" r="120" stroke="currentColor" strokeWidth="8" />
    </svg>
  );
}

// Left-Edge Bleed Concentric Rings (radiating outward into the page from x=0)
export function LeftEdgeConcentricRings({ className = "w-28 h-52 text-[#094e46]" }) {
  return (
    <svg
      viewBox="0 0 160 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="0" cy="150" r="25" stroke="currentColor" strokeWidth="6.5" />
      <circle cx="0" cy="150" r="50" stroke="currentColor" strokeWidth="6.5" />
      <circle cx="0" cy="150" r="75" stroke="currentColor" strokeWidth="6.5" />
      <circle cx="0" cy="150" r="100" stroke="currentColor" strokeWidth="6.5" />
      <circle cx="0" cy="150" r="125" stroke="currentColor" strokeWidth="6.5" />
      <circle cx="0" cy="150" r="150" stroke="currentColor" strokeWidth="6.5" />
    </svg>
  );
}

// Right-Edge Bleed Concentric Rings (radiating inward into the page from x=width)
export function RightEdgeConcentricRings({ className = "w-28 h-52 text-[#ea8a42]" }) {
  return (
    <svg
      viewBox="0 0 160 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="160" cy="150" r="25" stroke="currentColor" strokeWidth="6.5" />
      <circle cx="160" cy="150" r="50" stroke="currentColor" strokeWidth="6.5" />
      <circle cx="160" cy="150" r="75" stroke="currentColor" strokeWidth="6.5" />
      <circle cx="160" cy="150" r="100" stroke="currentColor" strokeWidth="6.5" />
      <circle cx="160" cy="150" r="125" stroke="currentColor" strokeWidth="6.5" />
      <circle cx="160" cy="150" r="150" stroke="currentColor" strokeWidth="6.5" />
    </svg>
  );
}

// Diagonally angled wavy ripple pill pattern for Card 2 (Enroll Instantly)
export function WavyPillCluster({ className = "w-24 h-28 text-[#094e46]" }) {
  return (
    <svg
      viewBox="0 0 100 110"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ transform: "rotate(-35deg)" }}
    >
      <rect x="10" y="18" width="16" height="54" rx="8" />
      <rect x="30" y="8" width="16" height="74" rx="8" />
      <rect x="50" y="0" width="16" height="90" rx="8" />
      <rect x="70" y="12" width="16" height="74" rx="8" />
    </svg>
  );
}

// 4 cols x 6 rows Dot Grid for Card 3 (Start Learning)
export function DotGridPattern({ className = "w-24 h-32 text-white/80" }) {
  const cols = [10, 26, 42, 58];
  const rows = [10, 24, 38, 52, 66, 80];

  return (
    <svg
      viewBox="0 0 70 92"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {cols.map((cx) =>
        rows.map((cy) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" />
        ))
      )}
    </svg>
  );
}

// 4-point sparkle star
export function SparkleStar({ className = "w-8 h-8 text-[#df9d66]" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
    </svg>
  );
}

// 7-8 pointed starburst doodle on bottom right of Insights
export function StarburstDoodle({ className = "w-16 h-16 text-[#f59853]" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M50 0 L58 35 L90 20 L72 50 L100 65 L65 72 L60 100 L42 70 L15 88 L30 55 L0 42 L35 32 Z" />
    </svg>
  );
}

// 3-ray burst doodle near bottom right of hero text
export function RayBurstDoodle({ className = "w-8 h-8 text-[#ea8a42]" }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M8 24L4 28" />
      <path d="M18 16L24 10" />
      <path d="M12 20L18 26" />
    </svg>
  );
}

// Card 1 Icon: Overlapping documents / cards with 4 tiny cross sparkles
export function BrowseCoursesIcon({ className = "w-10 h-10 text-white" }) {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      {/* 4 Corner Cross Sparkles (x) */}
      <span className="absolute -top-1 -left-1 text-[11px] font-bold text-white/90 select-none">✕</span>
      <span className="absolute -top-1 -right-1 text-[10px] font-bold text-white/80 select-none">✕</span>
      <span className="absolute -bottom-1 -left-1 text-[10px] font-bold text-white/80 select-none">✕</span>
      <span className="absolute -bottom-1 -right-1 text-[11px] font-bold text-white/90 select-none">✕</span>

      {/* Overlapping sheets icon */}
      <svg
        viewBox="0 0 36 36"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="6"
          y="8"
          width="18"
          height="22"
          rx="5"
          transform="rotate(-8 6 8)"
          fill="currentColor"
          opacity="0.9"
        />
        <rect
          x="12"
          y="8"
          width="18"
          height="22"
          rx="5"
          transform="rotate(6 12 8)"
          fill="currentColor"
        />
        {/* Horizontal lines on top card */}
        <line x1="16" y1="16" x2="26" y2="17" stroke="#094e46" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="17" y1="21" x2="25" y2="22" stroke="#094e46" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// Card 2 Icon: Lightbulb with 4 tiny cross sparkles
export function EnrollInstantlyIcon({ className = "w-10 h-10 text-white" }) {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      {/* 4 Corner Cross Sparkles */}
      <span className="absolute -top-1 -left-1 text-[11px] font-bold text-white/90 select-none">✕</span>
      <span className="absolute -top-1 -right-1 text-[10px] font-bold text-white/80 select-none">✕</span>
      <span className="absolute -bottom-1 -left-1 text-[10px] font-bold text-white/80 select-none">✕</span>
      <span className="absolute -bottom-1 -right-1 text-[11px] font-bold text-white/90 select-none">✕</span>

      <svg
        viewBox="0 0 36 36"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rays */}
        <line x1="18" y1="3" x2="18" y2="6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="7" y1="8" x2="9" y2="10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="29" y1="8" x2="27" y2="10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="4" y1="17" x2="7" y2="17" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="32" y1="17" x2="29" y2="17" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        {/* Bulb body */}
        <path
          d="M18 7C12.5 7 8 11.5 8 17C8 20.5 10 23.5 13 25V28C13 28.5 13.5 29 14 29H22C22.5 29 23 28.5 23 28V25C26 23.5 28 20.5 28 17C28 11.5 23.5 7 18 7Z"
          fill="white"
        />
        {/* Base */}
        <rect x="14" y="30" width="8" height="2" rx="1" fill="white" />
      </svg>
    </div>
  );
}

// Card 3 Icon: Gamepad / Controller with cross sparkles
export function StartLearningIcon({ className = "w-10 h-10 text-slate-900" }) {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      {/* 4 Corner Cross Sparkles */}
      <span className="absolute -top-1 -left-1 text-[11px] font-bold text-slate-900 select-none">✕</span>
      <span className="absolute -top-1 -right-1 text-[10px] font-bold text-slate-800 select-none">✕</span>
      <span className="absolute -bottom-1 -left-1 text-[10px] font-bold text-slate-800 select-none">✕</span>
      <span className="absolute -bottom-1 -right-1 text-[11px] font-bold text-slate-900 select-none">✕</span>

      <svg
        viewBox="0 0 36 36"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="4" y="10" width="28" height="18" rx="8" fill="currentColor" />
        {/* D-Pad on left */}
        <path d="M11 15V23M7 19H15" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" />
        {/* Buttons on right */}
        <circle cx="23" cy="17" r="1.5" fill="#60a5fa" />
        <circle cx="27" cy="19" r="1.5" fill="#60a5fa" />
        <circle cx="23" cy="21" r="1.5" fill="#60a5fa" />
      </svg>
    </div>
  );
}
