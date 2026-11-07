import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { logger } from '../config/logger.js';
import { Note } from '../models/Note.js';

/**
 * Starter note cards for a fresh database: DSA, Frontend, Full Stack, Backend,
 * AI/ML, System Design, DevOps. Used by `npm run seed` and by the admin panel's
 * "Add starter notes" button, so a brand-new deployment is never empty.
 * Counters start at zero (they are real) and PDFs are added by the admin.
 */
const INSTRUCTOR = { name: 'Gautam Pandit', role: 'Instructor & Founder', company: 'Gopo Workspace', avatar: '' };

const FRONTEND_CHAPTERS = [
  { number: '1', title: 'HTML5 that is semantic and accessible', summary: 'Document structure, landmarks, forms, media and the accessibility tree.', contentSnippet: 'Use <header>, <nav>, <main>, <article> and <footer> so screen readers and search engines understand the page. Every input needs a <label>; every image needs alt text that says what matters.' },
  { number: '2', title: 'Modern CSS: Flexbox, Grid and layout patterns', summary: 'The two layout engines, when to use each, and the holy-grail, sidebar and card-grid patterns.', contentSnippet: 'Flexbox for one-dimensional rows/columns, Grid for two-dimensional layouts. minmax(), auto-fit and gap replace most media-query hacks.' },
  { number: '3', title: 'Responsive and mobile-first design', summary: 'Fluid type, container queries, breakpoints and touch targets.', contentSnippet: 'Start at 360px and add breakpoints only when the layout breaks. clamp() for fluid font sizes, 44px minimum touch targets, and test with real devices.' },
  { number: '4', title: 'JavaScript essentials for the browser', summary: 'DOM, events, fetch, async/await, modules and the event loop.', contentSnippet: 'Event delegation keeps listeners cheap. fetch + async/await for APIs; always handle the error path and the loading state.' },
  { number: '5', title: 'React 19: components, hooks and state', summary: 'useState, useEffect, useRef, custom hooks, lifting state and the rules of hooks.', contentSnippet: 'Derive values during render instead of syncing them with effects. Effects are for subscriptions and external systems only.' },
  { number: '6', title: 'Tailwind CSS and design systems', summary: 'Utility-first styling, design tokens, dark mode and reusable component patterns.', contentSnippet: 'Encode spacing, colour and radius as tokens once; build buttons, cards and inputs as small components and reuse them everywhere.' },
  { number: '7', title: 'Performance, SEO and shipping', summary: 'Core Web Vitals, image optimisation, code splitting, metadata and deploying to Vercel.', contentSnippet: 'Lazy-load below-the-fold images, keep LCP under 2.5s, set <title> and description on every page, and measure with Lighthouse before and after.' },
];

export const STARTER_NOTES = [
  {
    slug: 'dsa-notes', title: 'DSA Notes', category: 'DSA', pages: 140, order: 1, tags: ['dsa', 'algorithms', 'leetcode'],
    badge: 'Core Foundation', accent: 'amber', icon: 'Code', level: 'All Levels',
    tagline: '450+ Solved Patterns • LeetCode Sheet • Visual Trees & Graphs',
    description: 'Visual decision trees, sliding windows, recursion templates, and graph traversals for top product company interviews.',
    projectBadge: 'Free Visualizer Repo', projectTitle: 'AlgoViz: Interactive DSA & Algorithm Visualizer', projectId: 'dsa-visualizer-suite',
    pdfId: 'dsa-patterns-mastery-sheet',
  },
  {
    slug: 'frontend-notes', title: 'Frontend Notes', category: 'Frontend', pages: 92, order: 2, tags: ['html', 'css', 'javascript', 'react', 'tailwind'],
    badge: 'Beginner Friendly', accent: 'orange', icon: 'Smartphone', level: 'Beginner',
    tagline: 'HTML5 • CSS Grid & Flexbox • JavaScript • React 19 • Tailwind CSS',
    description: 'Everything needed to build responsive, accessible, fast user interfaces: semantic HTML, modern CSS layouts, browser JavaScript, React 19 hooks, Tailwind design systems and Core Web Vitals.',
    projectBadge: 'Free UI Kit Repo', projectTitle: 'Gopo UI: React + Tailwind component kit', projectId: 'apex-design-system',
    chapters: FRONTEND_CHAPTERS,
  },
  {
    slug: 'fullstack-notes', title: 'Full Stack Notes', category: 'Full Stack', pages: 86, order: 3, tags: ['nextjs', 'react', 'postgresql'],
    badge: 'Most Popular', accent: 'emerald', icon: 'Layers', level: 'Intermediate to Pro',
    tagline: 'Next.js 16 • React 19 • PostgreSQL • Server Actions & App Router',
    description: 'Complete blueprint covering App Router streaming, zero-bundle Server Components, and multi-tenant PostgreSQL schemas.',
    projectBadge: 'Free SaaS Repo', projectTitle: 'DevSprint: Cloud Task & Issue Management SaaS', projectId: 'devsprint-saas',
    pdfId: 'nextjs16-react19-handbook',
  },
  {
    slug: 'backend-notes', title: 'Backend Notes', category: 'Backend', pages: 105, order: 4, tags: ['nodejs', 'express', 'mongodb', 'microservices', 'redis'],
    badge: 'Core Engineering', accent: 'indigo', icon: 'Server', level: 'Advanced',
    tagline: 'Node.js & Express • REST & gRPC • MongoDB • Kafka • Redis Caching & Auth',
    description: 'Designing event-driven backends, transactional outbox patterns, cache stampede protection, and token bucket rate limiting.',
    projectBadge: 'Production Gateway Repo', projectTitle: 'Nexus: High-Throughput Distributed Backend', projectId: 'nexus-microservices-core',
    pdfId: 'backend-microservices-playbook',
  },
  {
    slug: 'ai-ml-notes', title: 'AI/ML Notes', category: 'AI/ML', pages: 112, order: 5, tags: ['llm', 'rag', 'langgraph'],
    badge: 'Trending Tech', accent: 'purple', icon: 'Sparkles', level: 'All Levels',
    tagline: 'LLMs & LangGraph • RAG Pipelines • Vector Embeddings • LoRA',
    description: 'Enterprise RAG pipelines with semantic chunking, dense vector HNSW search, and LangGraph multi-agent supervisors.',
    projectBadge: 'Agent Swarm Repo', projectTitle: 'OmniRAG: Multi-Modal Document Analyst', projectId: 'omnirag-agent',
    pdfId: 'generative-ai-rag-systems-guide',
  },
  {
    slug: 'system-design-notes', title: 'System Design Notes', category: 'System Design', pages: 68, order: 6, tags: ['system-design', 'sharding', 'caching'],
    badge: 'High Scale', accent: 'rose', icon: 'Network', level: 'All Levels',
    tagline: 'High-Scale Architecture • Sharding • Load Balancers • Capacity Math',
    description: 'Back-of-the-envelope estimation formulas, distributed caching with Redis, Kafka idempotency, and database sharding.',
    projectBadge: 'Architecture Blueprints', projectTitle: 'CognitiveDesk: Autonomous Support Copilot', projectId: 'cognitivedesk-ai-support',
    pdfId: 'system-design-interview-cheatsheet',
  },
  {
    slug: 'devops-cloud-notes', title: 'DevOps & Cloud Notes', category: 'DevOps & Cloud', pages: 98, order: 7, tags: ['docker', 'kubernetes', 'terraform'],
    badge: 'Production Ready', accent: 'sky', icon: 'Cloud', level: 'Intermediate to Pro',
    tagline: 'Docker Containers • Kubernetes EKS • CI/CD • Terraform IaC',
    description: 'Hardened distroless multi-stage Docker builds, Terraform AWS modules, zero-downtime rolling deploys, and ArgoCD GitOps.',
    projectBadge: 'Kubernetes Infra Repo', projectTitle: 'ResilientCloud: Multi-Tier E-Commerce Infra', projectId: 'resilient-cloud-devops',
    pdfId: 'kubernetes-docker-cloud-bible',
  },
];

/**
 * When the frontend lives next to this backend (it does in the monorepo),
 * reuse its static PDF chapters so reader pages have a table of contents.
 */
export async function loadFrontendChapters() {
  const map = new Map();
  try {
    const file = path.resolve(process.cwd(), '../course_selling/data/pdfNotesData.js');
    if (!fs.existsSync(file)) return map;
    const mod = await import(pathToFileURL(file).href);
    for (const pdf of mod.pdfNotesList ?? []) {
      map.set(
        pdf.id,
        (pdf.chapters ?? []).map((c) => ({
          number: String(c.number ?? ''),
          title: c.title,
          summary: c.summary ?? '',
          contentSnippet: c.contentSnippet ?? '',
        }))
      );
    }
  } catch (err) {
    logger.warn({ err: err.message }, 'Could not load frontend chapters; continuing without them');
  }
  return map;
}

/**
 * Create the starter notes that do not exist yet (published + featured).
 * With `refresh`, existing ones also get their descriptive fields updated;
 * counters, uploaded PDFs and admin-written chapters are never touched.
 */
export async function upsertStarterNotes({ ownerId, refresh = false }) {
  const chaptersByPdfId = await loadFrontendChapters();
  const created = [];
  const updated = [];
  for (const { pdfId, chapters: inline, ...n } of STARTER_NOTES) {
    const chapters = inline ?? chaptersByPdfId.get(pdfId) ?? [];
    const existing = await Note.findOne({ slug: n.slug });
    if (existing) {
      if (!refresh) continue;
      Object.assign(existing, n, { instructor: INSTRUCTOR });
      if (!existing.chapters?.length && chapters.length) existing.chapters = chapters;
      await existing.save();
      updated.push(n.slug);
      continue;
    }
    await Note.create({ ...n, chapters, instructor: INSTRUCTOR, visibility: 'PUBLIC', featured: true, author: ownerId, publishedAt: new Date() });
    created.push(n.slug);
  }
  return { created, updated };
}
