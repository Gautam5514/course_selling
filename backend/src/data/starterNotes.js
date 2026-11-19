import { Note } from '../models/Note.js';

/**
 * Starter note cards for a fresh database: DSA, Frontend, Full Stack, Backend,
 * AI/ML, System Design, DevOps. Used by `npm run seed` and by the admin panel's
 * "Add starter notes" button, so a brand-new deployment is never empty.
 * Counters start at zero (they are real). The PDFs, page counts and chapters
 * come from `npm run publish:notes` (built in ../notes-pdf), or the admin panel.
 */
export const INSTRUCTOR = { name: 'Gautam Pandit', role: 'Instructor & Founder', company: 'Gopo Workspace', avatar: '' };

export const STARTER_NOTES = [
  {
    slug: 'dsa-notes', title: 'DSA Notes', category: 'DSA', order: 1, tags: ['dsa', 'algorithms', 'data-structures', 'interview', 'python'],
    badge: 'Core Foundation', accent: 'amber', icon: 'Code', level: 'All Levels',
    tagline: 'Big-O • Hashing • Two Pointers • Trees & Graphs • Dynamic Programming',
    description: 'Learn the core data structures and the problem-solving patterns behind most coding interview questions. Each topic is explained in plain language with tested Python code, dry runs, common mistakes and interview questions with model answers. The last chapter is a pattern-picking cheat sheet with an 8-week study plan.',
    projectBadge: 'DSA Solutions Repo', projectTitle: 'GFG: solved GeeksforGeeks DSA problems (C++)', projectUrl: 'https://github.com/Gautam5514/GFG',
  },
  {
    slug: 'frontend-notes', title: 'Frontend Notes', category: 'Frontend', order: 2, tags: ['html', 'css', 'javascript', 'react', 'tailwind'],
    badge: 'Beginner Friendly', accent: 'orange', icon: 'Smartphone', level: 'Beginner',
    tagline: 'HTML5 • Modern CSS • JavaScript • React 19 • Tailwind CSS v4',
    description: 'Complete beginner-friendly frontend notes in 15 chapters. You learn how the browser works, semantic HTML, CSS layout with Flexbox and Grid, responsive design, core JavaScript, the DOM, async code, React 19 with hooks and Actions, Tailwind CSS v4, accessibility and performance. Every chapter has commented code, common mistakes, interview questions with model answers and a one-minute revision box.',
    projectBadge: 'Next.js Storefront Repo', projectTitle: 'Bracelet: Next.js storefront UI', projectUrl: 'https://github.com/Gautam5514/bracelet', demoUrl: 'https://bracelet-jet.vercel.app',
  },
  {
    slug: 'fullstack-notes', title: 'Full Stack Notes', category: 'Full Stack', order: 3, tags: ['nextjs', 'react', 'postgresql', 'server-actions', 'fullstack'],
    badge: 'Most Popular', accent: 'emerald', icon: 'Layers', level: 'Intermediate to Pro',
    tagline: 'Next.js 16 • React 19 • PostgreSQL • Server Actions • Auth • Deployment',
    description: 'A complete path from "I know some React" to "I can build and deploy a full stack app". You learn the Next.js 16 App Router, Server and Client Components, plain SQL with PostgreSQL, caching with use cache, Server Actions, Route Handlers and cookie based login. A worked task manager project, security basics, testing, deployment and interview questions tie it all together.',
    projectBadge: 'Full Stack App Repo', projectTitle: 'SplitEase: split expenses and settle up', projectUrl: 'https://github.com/Gautam5514/Split-Expense', demoUrl: 'https://splitease.tech/',
  },
  {
    slug: 'backend-notes', title: 'Backend Notes', category: 'Backend', order: 4, tags: ['nodejs', 'express', 'mongodb', 'redis', 'microservices'],
    badge: 'Core Engineering', accent: 'indigo', icon: 'Server', level: 'Intermediate to Advanced',
    tagline: 'Node.js • Express • MongoDB • Auth • Redis • Kafka • Microservices',
    description: 'A complete path through backend engineering with Node.js. You start with HTTP and the event loop, build clean Express and MongoDB APIs with validation, authentication and security, then learn caching, rate limiting, queues, Kafka, microservices, testing and deployment. Every chapter has commented code, common mistakes, interview questions and a one-minute revision box.',
    projectBadge: 'Node.js Backend Repo', projectTitle: 'Backend series: Node.js, Express, JWT auth and uploads', projectUrl: 'https://github.com/Gautam5514/gautam_aur_backend',
  },
  {
    slug: 'ai-ml-notes', title: 'AI/ML Notes', category: 'AI/ML', order: 5, tags: ['machine-learning', 'llm', 'rag', 'embeddings', 'agents'],
    badge: 'Trending Tech', accent: 'purple', icon: 'Sparkles', level: 'All Levels',
    tagline: 'ML Basics • Neural Networks • LLMs • RAG • Agents • Interview Questions',
    description: 'Fifteen chapters that take you from what machine learning is to building LLM applications. You learn the ML workflow, classic models, evaluation, neural networks, how LLMs work, prompting, embeddings, RAG, agents, fine-tuning and shipping. Runnable Python examples are included throughout, and every chapter has common mistakes, interview questions with model answers and a one-minute revision list.',
    projectBadge: 'AI Project Repo', projectTitle: 'AI Control: voice-controlled AI assistant', projectUrl: 'https://github.com/Gautam5514/AI_control',
  },
  {
    slug: 'system-design-notes', title: 'System Design Notes', category: 'System Design', order: 6, tags: ['system-design', 'scalability', 'caching', 'sharding', 'interview'],
    badge: 'High Scale', accent: 'rose', icon: 'Network', level: 'All Levels',
    tagline: 'Interview Framework • Estimation • Caching & Sharding • 4 Case Studies',
    description: 'Learn how large systems are built, one building block at a time: load balancers, caches, databases, replication, sharding, queues and reliability patterns. Then use a fixed seven-step framework to design a URL shortener, a rate limiter, a news feed and a chat app the way an interviewer expects. Every chapter has interview questions with model answers and a one-minute revision box, with diagrams and tables throughout.',
    projectBadge: 'Design Patterns Repo', projectTitle: 'Design Patterns for interview preparation (Java)', projectUrl: 'https://github.com/Gautam5514/Design_Pattern',
  },
  {
    slug: 'devops-cloud-notes', title: 'DevOps & Cloud Notes', category: 'DevOps & Cloud', order: 7, tags: ['docker', 'kubernetes', 'cicd', 'terraform', 'aws'],
    badge: 'Production Ready', accent: 'sky', icon: 'Cloud', level: 'Intermediate to Pro',
    tagline: 'Linux • Docker • CI/CD • Kubernetes • AWS • Terraform • Observability',
    description: 'A step-by-step guide for people who can build a small web app but have never deployed or operated one. You learn Linux, networking, Git workflows, Docker, GitHub Actions, Kubernetes, AWS basics, Terraform, deployment strategies, observability, security and cost control. Every chapter has commented examples, common mistakes, interview questions with model answers and a one-minute revision box.',
    projectBadge: 'Kubernetes Infra Repo', projectTitle: 'ResilientCloud: Multi-Tier E-Commerce Infra', projectId: 'resilient-cloud-devops',
  },
];

/**
 * Handbooks shown on the "PDF Notes" page (/pdf-notes). The slug is the card id
 * there, so /pdf/<slug> opens the real PDF. Not featured: the home page keeps
 * showing only the seven core notes above. Tagline, description, tags, pages
 * and chapters are filled in by `npm run publish:notes` from the built PDFs.
 */
export const HANDBOOK_NOTES = [
  { slug: 'nextjs16-react19-handbook', title: 'Next.js 16 & React 19 Architecture Handbook', category: 'Full Stack', order: 11, accent: 'emerald', icon: 'Layers', level: 'Intermediate to Pro', badge: 'Handbook' },
  { slug: 'generative-ai-rag-systems-guide', title: 'Generative AI, RAG & Multi-Agent Systems Field Manual', category: 'AI/ML', order: 12, accent: 'purple', icon: 'Sparkles', level: 'Intermediate', badge: 'Field Manual' },
  { slug: 'figma-tokens-design-systems-guide', title: 'Modern Design Systems: Figma Variables to React Code', category: 'UI/UX', order: 13, accent: 'rose', icon: 'BookOpen', level: 'Beginner to Intermediate', badge: 'Guide' },
  { slug: 'kubernetes-docker-cloud-bible', title: 'Production Cloud & Kubernetes DevOps Playbook', category: 'DevOps & Cloud', order: 14, accent: 'sky', icon: 'Cloud', level: 'Intermediate to Advanced', badge: 'Playbook' },
  { slug: 'system-design-interview-cheatsheet', title: 'High-Scale System Design & Architecture Cheatsheet', category: 'System Design', order: 15, accent: 'indigo', icon: 'Network', level: 'Intermediate to Advanced', badge: 'Cheatsheet' },
  { slug: 'react-native-expo-production-handbook', title: 'Cross-Platform Mobile Pro: React Native & Expo Guide', category: 'Mobile', order: 16, accent: 'teal', icon: 'Smartphone', level: 'Beginner to Intermediate', badge: 'Handbook' },
  { slug: 'dsa-patterns-mastery-sheet', title: 'DSA Mastery & Algorithm Patterns Cheatsheet', category: 'DSA', order: 17, accent: 'amber', icon: 'Code', level: 'All Levels', badge: 'Cheatsheet' },
  { slug: 'backend-microservices-playbook', title: 'Production Backend & Microservices Architecture', category: 'Backend', order: 18, accent: 'indigo', icon: 'Server', level: 'Intermediate to Advanced', badge: 'Playbook' },
].map((n) => ({ ...n, featured: false }));

/**
 * Create the starter notes and handbooks that do not exist yet (published;
 * starter notes are featured on the home page, handbooks are not).
 * With `refresh`, existing ones also get their descriptive fields updated;
 * counters, uploaded PDFs, page counts and chapters are never touched.
 */
export async function upsertStarterNotes({ ownerId, refresh = false }) {
  const created = [];
  const updated = [];
  for (const n of [...STARTER_NOTES, ...HANDBOOK_NOTES]) {
    const existing = await Note.findOne({ slug: n.slug });
    if (existing) {
      if (!refresh) continue;
      Object.assign(existing, n, { instructor: INSTRUCTOR });
      if (n.projectUrl && !n.projectId) existing.projectId = ''; // a real repo replaces the legacy demo project
      await existing.save();
      updated.push(n.slug);
      continue;
    }
    await Note.create({ ...n, instructor: INSTRUCTOR, visibility: 'PUBLIC', featured: n.featured ?? true, author: ownerId, publishedAt: new Date() });
    created.push(n.slug);
  }
  return { created, updated };
}
