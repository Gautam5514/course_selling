// Real projects built by Gautam. Every entry maps to an actual GitHub
// repository; the facts below come from each repo's README, package manifest
// and source tree. Star / fork / last-updated numbers are NOT stored here —
// they are fetched live from the GitHub API (see lib/github.js).
//
// `readmeFile` is a markdown file in content/projects/. `readmeSource` says
// where it came from:
//   "repo"     → the repository's own README.md
//   "codebase" → architecture notes written from the source code, for repos
//                whose README is still the create-next-app default

export const projectCategories = ["All", "Full-Stack", "Web App", "Mobile App"];

export const projectsList = [
  {
    id: "splitease",
    slug: "splitease",
    name: "SplitEase",
    title: "SplitEase — Group expenses with an AI agent",
    category: "Full-Stack",
    platform: "Web + API",
    status: "live",
    accent: "emerald",
    icon: "wallet",
    repo: "Gautam5514/Split-Expense",
    githubUrl: "https://github.com/Gautam5514/Split-Expense",
    liveUrl: "https://split.elitecrew.online",
    liveLabel: "Open web app",
    tagline:
      "Split bills with exact shares, live balances and fewest-payment settle-ups, plus an AI agent that plans the change and waits for your approval.",
    description:
      "SplitEase is a full-stack expense splitter: an Express API, a Next.js web app and a remote MCP server on one live ledger. Autopilot turns plain English or Hinglish into a reviewable plan and runs it only after approval, and Socket.IO pushes every change to every open phone and browser tab.",
    tech: ["Next.js 16", "React 19", "Node.js 22", "Express", "MongoDB", "Socket.IO", "MCP SDK", "Firebase Auth", "Zod", "Jest"],
    facts: [
      { value: "800+", label: "automated tests" },
      { value: "29", label: "MCP tools" },
      { value: "10", label: "Autopilot actions" },
      { value: "3", label: "platforms, one ledger" },
    ],
    highlights: [
      { title: "Exact splits", text: "Equal, exact, percent, shares or itemised. Rounding leftovers go to the payer, so every bill adds up." },
      { title: "Fewest payments", text: "Balances are netted and routed through the minimum number of transfers, with two-sided settle-ups." },
      { title: "Autopilot AI agent", text: "Drafts a plan with every share from a chat message. Nothing changes until you approve it." },
      { title: "MCP server", text: "29 tools over OAuth 2.1 so ChatGPT, Claude, Gemini and Cursor can run your groups." },
      { title: "Live everywhere", text: "Socket.IO pushes expenses, settle-ups and invites to every device, and heals itself after a drop." },
      { title: "Secure by default", text: "Firebase-verified tokens, Zod validation, Helmet, per-user rate limits, CodeQL and OpenSSF practices." },
    ],
    architecture: [
      "Web (Next.js), Android (Expo) and AI clients (MCP) all talk to one Express API.",
      "MCP write tools call the same REST controllers as the apps through an in-process bridge, so rules never drift.",
      "Autopilot plans are hashed and versioned; each step runs in a MongoDB transaction and is read back to verify.",
      "LLM calls fall back across Groq, Cerebras, Gemini and OpenRouter, with an offline parser as the last resort.",
    ],
    readmeFile: "splitease.md",
    readmeSource: "repo",
    related: "splitease-mobile",
  },
  {
    id: "splitease-mobile",
    slug: "splitease-mobile",
    name: "SplitEase Mobile",
    title: "SplitEase Mobile — Expo app on Google Play",
    category: "Mobile App",
    platform: "Android + iOS",
    status: "live",
    accent: "teal",
    icon: "smartphone",
    repo: "Gautam5514/splitApp",
    githubUrl: "https://github.com/Gautam5514/splitApp",
    liveUrl: "https://play.google.com/store/apps/details?id=com.kunal.splitapp",
    liveLabel: "Get it on Google Play",
    tagline:
      "The SplitEase mobile app: receipt scanning, realtime settle chat, one-tap UPI settlement and a home-screen balance widget.",
    description:
      "A React Native app built with Expo 54 and Expo Router, live on Google Play as Splitease. It shares the SplitEase API with the web app, so Autopilot, balances and settlements behave the same everywhere. Native extras include an Android home-screen widget, QR invites and push notifications.",
    tech: ["Expo 54", "React Native 0.81", "React 19", "Expo Router 6", "Reanimated 4", "Socket.IO", "Firebase Auth", "TypeScript", "EAS Build"],
    facts: [
      { value: "4", label: "split modes" },
      { value: "220+", label: "tests" },
      { value: "4", label: "unlockable accent themes" },
      { value: "Live", label: "on Google Play" },
    ],
    highlights: [
      { title: "Autopilot, full screen", text: "Type “rent 21000” or “Priya bhi”. The plan updates instantly and runs only after you approve." },
      { title: "AI receipt scanner", text: "Snap a bill. OCR reads every line item and drops it straight into the group." },
      { title: "Settle chat", text: "Group chat and the expense ledger live in one realtime thread." },
      { title: "One-tap UPI settle", text: "Pay by UPI ID or QR. The payee confirms and balances reset automatically." },
      { title: "Home-screen widget", text: "An Android widget shows what you owe and what you are owed, live." },
      { title: "Referral rewards", text: "Earn coins, climb tiers and unlock accent themes. Rules live on the server." },
    ],
    architecture: [
      "Expo Router screens sit on top of Auth, Theme and Notification context providers.",
      "lib/ holds the Axios API client, Socket.IO, push and the Autopilot rules shared with the web.",
      "Settlements are two-party: the payer requests, the payee confirms, everyone else just sees balances update.",
      "Design tokens and primitives (ScreenHeader, ListRow, PillButton) keep every screen consistent across themes.",
    ],
    readmeFile: "splitease-mobile.md",
    readmeSource: "repo",
    related: "splitease",
  },
  {
    id: "facedeliver-web",
    slug: "facedeliver-web",
    name: "FaceDeliver",
    title: "FaceDeliver — Event photos delivered by face match",
    category: "Web App",
    platform: "Web",
    status: "live",
    accent: "violet",
    icon: "scan-face",
    repo: "Gautam5514/delivery_frontend",
    githubUrl: "https://github.com/Gautam5514/delivery_frontend",
    liveUrl: "https://facedeliver.shop",
    liveLabel: "Open facedeliver.shop",
    tagline:
      "Guests scan a QR code, take one selfie and get a personal gallery of only the photos they appear in.",
    description:
      "The Next.js web app for FaceDeliver. Organisers create events, share a QR code, upload galleries and track delivery; guests register with a selfie and explicit consent and receive only their own photos. All API traffic goes through a server-side proxy so the auth token stays in an HttpOnly cookie.",
    tech: ["Next.js 16", "React 19", "Tailwind CSS 4", "Framer Motion", "Razorpay", "Sentry", "QR code", "PWA"],
    facts: [
      { value: "3", label: "roles: guest, organiser, superadmin" },
      { value: "27", label: "pages" },
      { value: "2", label: "isolated session proxies" },
      { value: "PWA", label: "installable" },
    ],
    highlights: [
      { title: "QR to gallery", text: "One event code drives the QR link, guest registration and the personal gallery." },
      { title: "Consent before the camera", text: "Guests see what is collected, where it is stored and when it is deleted before the selfie." },
      { title: "Organiser console", text: "Events, guest lists, batch uploads, delivery analytics, billing and profile." },
      { title: "Token never in JavaScript", text: "A route-handler proxy reads an HttpOnly cookie and adds the bearer token on the server." },
      { title: "Plans and quota", text: "Razorpay checkout, with the plan changing only after the server verifies the payment." },
      { title: "Production monitoring", text: "Sentry on client and server, hidden source maps and quiet production logs." },
    ],
    architecture: [
      "Browser → /api/proxy/* route handler → Express API, with the token injected from an HttpOnly cookie.",
      "The superadmin console has its own cookie and its own proxy, so sessions never mix.",
      "The backend (Express, MongoDB, Cloudinary, face-matching worker) is a separate service.",
      "sitemap.js, robots.js and a central seo.config.js cover marketing, blog and service pages.",
    ],
    readmeFile: "facedeliver-web.md",
    readmeSource: "codebase",
    related: "facedeliver-app",
  },
  {
    id: "facedeliver-app",
    slug: "facedeliver-app",
    name: "FaceDeliver App",
    title: "FaceDeliver App — Flutter client for guests and organisers",
    category: "Mobile App",
    platform: "Android + iOS",
    status: "source",
    accent: "indigo",
    icon: "camera",
    repo: "Gautam5514/facedeliver_app",
    githubUrl: "https://github.com/Gautam5514/facedeliver_app",
    liveUrl: null,
    tagline:
      "One Flutter app for both sides of an event: guests scan, register and download; organisers create events, upload and track delivery.",
    description:
      "The native Android and iOS client for FaceDeliver, built with Flutter. It talks directly to the Express API, keeps the token in the platform keystore, compresses photos on the device and uploads them in batches that survive flaky venue Wi-Fi.",
    tech: ["Flutter", "Dart 3", "go_router", "Provider", "Dio", "Secure Storage", "mobile_scanner", "Razorpay"],
    facts: [
      { value: "2", label: "audiences in one app" },
      { value: "30", label: "photos per upload batch" },
      { value: "1", label: "shared ApiClient" },
      { value: "v1.0.1", label: "current version" },
    ],
    highlights: [
      { title: "Scan and register", text: "Guests scan the event QR, register with a selfie and consent, and get a personal gallery." },
      { title: "Save or ZIP", text: "Save a single photo to the gallery, or download the whole album as a ZIP." },
      { title: "Organiser tools", text: "Create events, share the QR, upload from the camera roll and watch processing state." },
      { title: "Batch uploads", text: "Photos are compressed on the device and sent 30 at a time, so a dropped batch costs little." },
      { title: "Role-aware routing", text: "go_router redirects by role, driven by a single SessionController." },
      { title: "HTTPS only in release", text: "Cleartext is allowed only in debug builds through a separate network security config." },
    ],
    architecture: [
      "core/ holds config, the Dio network wrapper, the router, secure storage and theme tokens.",
      "data/ has one model per API payload and one repository per API domain: auth, guests, admin, billing.",
      "A single ApiClient is shared by every repository, so the bearer token and 401 sign-out live in one place.",
      "Checkout success is not activation: plan and quota change only after the server verifies the signature.",
    ],
    readmeFile: "facedeliver-app.md",
    readmeSource: "repo",
    related: "facedeliver-web",
  },
  {
    id: "elitecrew",
    slug: "elitecrew",
    name: "EliteCrew",
    title: "EliteCrew — Home services marketplace",
    category: "Web App",
    platform: "Web",
    status: "live",
    accent: "amber",
    icon: "wrench",
    repo: "Gautam5514/service_provider_frontend",
    githubUrl: "https://github.com/Gautam5514/service_provider_frontend",
    liveUrl: "https://service-provider-frontend-three.vercel.app",
    liveLabel: "Open live site",
    tagline:
      "Book verified professionals for AC, electrical, plumbing and more, then track them on a live map.",
    description:
      "A three-sided marketplace in one Next.js app: customers book and pay, professionals onboard and manage jobs, and admins approve providers, manage the catalog and answer support in real time. Socket.IO powers notifications, support chat and live location.",
    tech: ["Next.js 16", "React 19", "Tailwind CSS 4", "shadcn/ui", "Socket.IO", "Leaflet", "Razorpay", "Axios", "Framer Motion"],
    facts: [
      { value: "19", label: "service categories" },
      { value: "3", label: "roles: customer, professional, admin" },
      { value: "40+", label: "pages" },
      { value: "7", label: "realtime events" },
    ],
    highlights: [
      { title: "Book in a few taps", text: "Browse categories with upfront prices, pick a service and pay online." },
      { title: "Live tracking", text: "A Leaflet map follows the professional using location updates over Socket.IO." },
      { title: "Realtime support", text: "Tickets and messages update live for both the customer and the admin." },
      { title: "Location-aware", text: "City detection falls back from cache to GPS to IP lookup, cached for six hours." },
      { title: "Admin console", text: "Provider approvals, service catalog, coupons, blog, careers and contact inbox." },
      { title: "Cookie-based auth", text: "Calls go through a same-origin rewrite, so the httpOnly cookie is never read by JavaScript." },
    ],
    architecture: [
      "Browser → /api/* rewrite in next.config.mjs → Express API, with the httpOnly cookie forwarded.",
      "Socket.IO uses a short-lived ws token from /api/auth/ws-token and refreshes it on auth errors.",
      "Razorpay: the server creates the order and verifies the payment; the client only opens checkout.",
      "lib/services.js holds the service catalog (prices, durations, inclusions) used across home and category pages.",
    ],
    readmeFile: "elitecrew.md",
    readmeSource: "codebase",
  },
  {
    id: "novri",
    slug: "novri",
    name: "Novri",
    title: "Novri — File storage, sharing and PDF tools",
    category: "Web App",
    platform: "Web",
    status: "live",
    accent: "sky",
    icon: "folder",
    repo: "Gautam5514/novri_frontend",
    githubUrl: "https://github.com/Gautam5514/novri_frontend",
    liveUrl: "https://novri-frontend.vercel.app",
    liveLabel: "Open live site",
    tagline:
      "Upload, organise and share files with a public link, and edit PDFs right in the browser.",
    description:
      "Novri is the frontend of a file store. Users sign in with email, Google or phone OTP, upload and manage files, share them with a public link and recover deleted ones from Trash. Merge, split, rotate and watermark PDFs without the file leaving the browser.",
    tech: ["Next.js 16", "React 19", "Tailwind CSS 4", "Firebase Auth", "pdf-lib", "pdf.js", "lucide-react"],
    facts: [
      { value: "3", label: "ways to sign in" },
      { value: "4", label: "in-browser PDF tools" },
      { value: "11", label: "pages" },
      { value: "Public", label: "share links" },
    ],
    highlights: [
      { title: "File dashboard", text: "Drag-and-drop upload with a searchable, sortable, filterable file table." },
      { title: "Public share links", text: "Mark a file public and anyone with the link can view or download it, no login." },
      { title: "Trash and restore", text: "Deleted files go to Trash first and can be restored or emptied." },
      { title: "PDF tools", text: "Merge, extract pages, rotate and watermark, all done in the browser." },
      { title: "Three sign-in options", text: "Email and password, Google, or phone number with OTP through Firebase." },
      { title: "Guarded dashboard", text: "proxy.js redirects signed-out visitors before /dashboard loads; the backend still checks every request." },
    ],
    architecture: [
      "The browser calls relative paths like /api/files; Next.js rewrites them to BACKEND_ORIGIN.",
      "proxy.js does a fast session-cookie check for /dashboard/*, and the backend re-verifies each request.",
      "lib/api.js serves the browser, lib/serverApi.js serves server components.",
      "AuthContext and ToastContext carry the signed-in user and notifications across the app.",
    ],
    readmeFile: "novri.md",
    readmeSource: "repo",
  },
  {
    id: "school-crm",
    slug: "school-crm",
    name: "School CRM",
    title: "School CRM — Multi-role school management",
    category: "Web App",
    platform: "Web",
    status: "source",
    accent: "rose",
    icon: "graduation-cap",
    repo: "Gautam5514/school_frontend",
    githubUrl: null, // private repository
    repoPrivate: true,
    liveUrl: null,
    tagline:
      "One system for directors, principals, front office, accounts, teachers, parents and students.",
    description:
      "A school management frontend with a separate workspace for each role. Staff handle admissions, students, attendance, fees, exams, timetable, homework and leave; parents and students get their own portal for fees, results, attendance and notices.",
    tech: ["Next.js 14", "React 18", "Tailwind CSS 3", "Headless UI", "Recharts", "Axios", "Razorpay"],
    facts: [
      { value: "8", label: "roles" },
      { value: "60", label: "pages" },
      { value: "20+", label: "staff modules" },
      { value: "MySQL", label: "backend database" },
    ],
    highlights: [
      { title: "A workspace per role", text: "Director, principal, front office, accounts, teacher and staff each get their own base route and menu." },
      { title: "Admissions to fees", text: "Enquiries, follow-ups, admissions, fee structures, payments, defaulters and online payments." },
      { title: "Academics", text: "Classes, exams, marks, report cards, timetable, homework and attendance." },
      { title: "Parent and student portal", text: "Fees, results, attendance, homework, notices, calendar and leave in one place." },
      { title: "Permission model", text: "Grants come from the API and are mirrored locally, so the UI hides what a role cannot do." },
      { title: "Documents and charts", text: "Print-ready student certificates and dashboards drawn with Recharts." },
    ],
    architecture: [
      "A dynamic [base] segment serves every staff role from one set of pages, wrapped in RoleGuard and AppShell.",
      "lib/roles.js maps each role to its home path and permission grants, with the API as the authority.",
      "The portal for parents and students lives under /portal with its own shell.",
      "The backend is an Express API on MySQL with JWT auth and role checks.",
    ],
    readmeFile: "school-crm.md",
    readmeSource: "repo",
  },
];

export function getProjectBySlug(slug) {
  return projectsBySlug.get(slug) || null;
}

export const projectsBySlug = new Map(projectsList.map((p) => [p.slug, p]));
