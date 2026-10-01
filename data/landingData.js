export const navLinks = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "/courses" },
  { name: "About", href: "/about" },
  { name: "Pricing", href: "/pricing" },
  { name: "Career", href: "/career" },
  { name: "Blog", href: "/blog" },
];

export const courseCategories = [
  "All Tracks",
  "Full-Stack Web Dev",
  "AI & Data Science",
  "UI/UX & Product Design",
  "Cloud & DevOps",
];

export const popularCourses = [
  {
    id: "nextjs-fullstack-ai",
    title: "Next.js 16, React 19 & AI Agents Architecture",
    category: "Full-Stack Web Dev",
    tag: "Bestseller",
    badgeColor: "bg-emerald-600 text-white",
    rating: 4.96,
    reviewsCount: 3420,
    studentsCount: "14,850",
    duration: "12 Weeks • 78 Lessons",
    level: "Intermediate to Pro",
    price: 89,
    originalPrice: 199,
    discountPercent: 55,
    instructor: {
      name: "Alex Rivera",
      role: "Staff Engineer",
      company: "ex-Stripe",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    },
    summary:
      "Master the latest App Router, Server Actions, AI SDK integrations, Turbopack, PostgreSQL databases, and high-load production architectures.",
    highlights: [
      "Building autonomous AI agent tools with Vercel AI SDK",
      "Full auth, multi-tenant DB schemas with Prisma & Supabase",
      "Stripe subscriptions & automated billing webhooks",
      "End-to-end CI/CD deployment with Docker & AWS",
    ],
  },
  {
    id: "generative-ai-llm-engineering",
    title: "Generative AI, LLM Systems & Multi-Agent Workflows",
    category: "AI & Data Science",
    tag: "Hot & New",
    badgeColor: "bg-[#f3843f] text-white",
    rating: 4.98,
    reviewsCount: 1890,
    studentsCount: "11,200",
    duration: "10 Weeks • 64 Lessons",
    level: "All Levels",
    price: 119,
    originalPrice: 249,
    discountPercent: 52,
    instructor: {
      name: "Marcus Chen",
      role: "Principal AI Lead",
      company: "ex-Microsoft",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    },
    summary:
      "From prompt engineering to fine-tuning open-source LLMs, building custom RAG pipelines, vector search, and autonomous multi-agent systems.",
    highlights: [
      "Production RAG architectures with Pinecone & pgvector",
      "Fine-tuning LLaMA 3 with LoRA & HuggingFace",
      "LangGraph & AutoGen multi-agent collaboration patterns",
      "Latency optimization & cost-efficient model routing",
    ],
  },
  {
    id: "figma-design-systems-to-code",
    title: "Mastering Design Systems in Figma & React Code",
    category: "UI/UX & Product Design",
    tag: "Trending",
    badgeColor: "bg-blue-600 text-white",
    rating: 4.94,
    reviewsCount: 2640,
    studentsCount: "12,400",
    duration: "8 Weeks • 52 Lessons",
    level: "Beginner to Advanced",
    price: 79,
    originalPrice: 179,
    discountPercent: 56,
    instructor: {
      name: "Maya Patel",
      role: "Lead Design Systems",
      company: "ex-Figma",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
    },
    summary:
      "Bridge design and code. Learn Figma variables, tokens studio, component architecture, accessible WCAG 2.2 standards, and Tailwind CSS syncing.",
    highlights: [
      "Multi-brand token hierarchy & automated Figma API sync",
      "Accessible React component library with Radix UI & Storybook",
      "Micro-animations & dynamic layout transition systems",
      "Cross-functional design QA and handoff workflows",
    ],
  },
  {
    id: "production-cloud-devops",
    title: "Production DevOps: Kubernetes, Docker & AWS Cloud",
    category: "Cloud & DevOps",
    tag: "Career Track",
    badgeColor: "bg-purple-600 text-white",
    rating: 4.91,
    reviewsCount: 1540,
    studentsCount: "8,920",
    duration: "10 Weeks • 68 Lessons",
    level: "Intermediate to Pro",
    price: 99,
    originalPrice: 229,
    discountPercent: 57,
    instructor: {
      name: "David K.",
      role: "Principal Architect",
      company: "AWS Certified",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    },
    summary:
      "Build production-grade infrastructure with Terraform, containerize microservices, deploy resilient Kubernetes clusters, and master zero-downtime CI/CD.",
    highlights: [
      "Infrastructure as Code with Terraform & AWS EKS",
      "Zero-downtime rolling deploys with ArgoCD & GitHub Actions",
      "Distributed logging with Prometheus, Grafana & Datadog",
      "Cloud security hardening & SOC2 compliance basics",
    ],
  },
  {
    id: "react-native-cross-platform",
    title: "Cross-Platform Mobile Pro: React Native & Expo",
    category: "Full-Stack Web Dev",
    tag: "Popular",
    badgeColor: "bg-teal-600 text-white",
    rating: 4.89,
    reviewsCount: 1780,
    studentsCount: "9,640",
    duration: "8 Weeks • 56 Lessons",
    level: "Intermediate",
    price: 84,
    originalPrice: 189,
    discountPercent: 55,
    instructor: {
      name: "Sarah Connor",
      role: "Lead Mobile Architect",
      company: "ex-Airbnb",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    },
    summary:
      "Craft slick, 60fps iOS and Android applications with Expo Router, Reanimated 3, offline-first databases, in-app purchases, and native device hardware.",
    highlights: [
      "Universal file-based routing with Expo Router v4",
      "Fluid gesture animations with React Native Reanimated",
      "Offline sync with WatermelonDB & background workers",
      "Automated App Store & Google Play Store release pipelines",
    ],
  },
  {
    id: "product-management-growth",
    title: "Product Strategy, Metrics & Growth Leadership",
    category: "UI/UX & Product Design",
    tag: "Executive",
    badgeColor: "bg-rose-600 text-white",
    rating: 4.95,
    reviewsCount: 1120,
    studentsCount: "6,450",
    duration: "6 Weeks • 44 Lessons",
    level: "All Levels",
    price: 109,
    originalPrice: 239,
    discountPercent: 54,
    instructor: {
      name: "Jayesh Patil",
      role: "VP of Product",
      company: "ex-ScaleUp Lead",
      avatar: "/images/jayesh-patil.jpg",
    },
    summary:
      "Learn how Silicon Valley product leaders formulate strategy, write watertight PRDs, define North Star metrics, run high-converting A/B experiments, and manage roadmaps.",
    highlights: [
      "Frameworks for data-driven product prioritization (RICE, Kano)",
      "Conducting customer discovery interviews that unlock real signal",
      "Designing growth loops and product-led acquisition funnels",
      "Executive board presentations and stakeholder management",
    ],
  },
];

export const threeStepsData = [
  {
    step: 1,
    title: "Browse Verified Tracks",
    description: "Explore 150+ industry-vetted bootcamps and deep-dive masterclasses built with lead engineers.",
    bgColor: "bg-[#0b382d]",
    textColor: "text-white",
    patternType: "rings",
    iconName: "Compass",
  },
  {
    step: 2,
    title: "Instant Sandbox Access",
    description: "Enroll with 1-click, unlock private GitHub repos, interactive sandbox environments, and student Discord.",
    bgColor: "bg-[#eb7a3e]",
    textColor: "text-white",
    patternType: "wavy",
    iconName: "Sparkles",
  },
  {
    step: 3,
    title: "Build, Ship & Get Hired",
    description: "Ship production capstone applications, attend weekly live 1-on-1 code reviews, and earn accredited certificates.",
    bgColor: "bg-[#6bb0f8]",
    textColor: "text-slate-900",
    patternType: "dots",
    iconName: "GraduationCap",
  },
];

export const classroomParticipants = [
  { name: "Natasha Sunny", role: "Instructor (Speaking)", status: "active", avatar: "👩🏻‍🏫" },
  { name: "Sunny Marwah", role: "Hand Raised ✋", status: "hand", avatar: "👨🏽‍💻" },
  { name: "Syarifah Hinata", role: "Coding Live", status: "active", avatar: "👩🏽‍💻" },
  { name: "Robert Fox", role: "Student", status: "idle", avatar: "👨🏼‍🎓" },
  { name: "Helen Mentari", role: "Reviewing PR", status: "idle", avatar: "👩🏼‍💻" },
];

export const classroomChats = [
  { user: "Sunny Marwah", message: "Can we test responsive subgrid behavior on mobile viewport?", time: "10:14 AM" },
  { user: "Natasha Sunny (Tutor)", message: "Yes! Inspecting the CSS container query tokens on screen right now.", time: "10:15 AM" },
  { user: "Syarifah Hinata", message: "This pattern saves so much boilerplate in multi-theme apps! 👏", time: "10:16 AM" },
];

export const benefitsData = [
  {
    title: "Industry-Vetted Curriculum",
    description: "Co-created with principal engineers at Stripe, Google, and Netflix to mirror modern production standards.",
    icon: "GraduationCap",
    highlight: true,
  },
  {
    title: "1-on-1 Senior Mentorship",
    description: "Get direct weekly code reviews, architecture critiques, and career roadmap guidance from industry leads.",
    icon: "Users",
    highlight: false,
  },
  {
    title: "Production Capstone Projects",
    description: "Graduate with real, deployed SaaS and AI applications on your GitHub portfolio — never toy demo apps.",
    icon: "Briefcase",
    highlight: false,
  },
  {
    title: "Verifiable Digital Credentials",
    description: "Earn cryptographic, shareable certificates recognized by tech recruiters and easily linked on LinkedIn.",
    icon: "Award",
    highlight: false,
  },
  {
    title: "Exclusive 24/7 Tech Community",
    description: "Connect with 48,000+ ambitious developers, join weekend hackathons, and exchange direct job referrals.",
    icon: "MessageSquare",
    highlight: false,
  },
  {
    title: "Career Placement & Coaching",
    description: "Resume overhauls, 1-on-1 mock technical interviews, and direct intros to our 250+ hiring partner network.",
    icon: "TrendingUp",
    highlight: false,
  },
];

export const partnerBrands = [
  { name: "Slack", logo: "slack" },
  { name: "Netflix", logo: "netflix" },
  { name: "Google", logo: "google" },
  { name: "Amazon", logo: "amazon" },
  { name: "Spotify", logo: "spotify" },
  { name: "Microsoft", logo: "microsoft" },
  { name: "Airbnb", logo: "airbnb" },
];

export const testimonialsData = [
  {
    quote: "helloS took me from struggling through disconnected tutorials to confidently architecting production Next.js apps. Within 90 days of graduating, I landed a Senior Frontend role at Stripe with a 65% salary increase!",
    author: "Alex Rivera",
    role: "Senior Frontend Engineer at Stripe",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    outcome: "+65% Salary Increase • Hired in 90 Days",
  },
  {
    quote: "The live Figma design system critiques with Natasha were better than an entire master's degree. Having senior mentors review every token and component helped me transition smoothly into a Lead Product Designer position.",
    author: "Maya Patel",
    role: "Lead Product Designer at Figma",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
    outcome: "Promoted to Lead • 4 Portfolio Case Studies",
  },
  {
    quote: "Most courses teach outdated AI demos. helloS's Generative AI curriculum covers actual production RAG, vector indexes, and multi-agent systems. The capstone project directly impressed my hiring team at Microsoft.",
    author: "Marcus Chen",
    role: "AI Systems Engineer at Microsoft",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    outcome: "Transitioned to AI • 3 Live Production Apps",
  },
];

export const blogArticles = [
  {
    tag: "AI & Engineering",
    title: "The 2025 AI Engineer Roadmap: From LLM Basics to Autonomous Agents",
    summary: "A practical guide to the essential frameworks, vector databases, and agent orchestration tools reshaping tech.",
    image: "/images/blog-1.jpg",
    date: "Oct 12, 2025",
    readTime: "6 min read",
  },
  {
    tag: "UI/UX & Code",
    title: "From Figma to Production Code: Modern Token Architectures with Tailwind",
    summary: "How modern product teams eliminate design drift and sync multi-brand design tokens automatically.",
    image: "/images/blog-2.jpg",
    date: "Oct 08, 2025",
    readTime: "8 min read",
  },
  {
    tag: "Career Growth",
    title: "How to Crack Senior Full-Stack Coding & System Design Interviews",
    summary: "Proven battle-tested strategies from tech leads to ace technical screenings and negotiate top offers.",
    image: "/images/blog-3.jpg",
    date: "Sep 28, 2025",
    readTime: "5 min read",
  },
];

