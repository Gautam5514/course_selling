import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { config } from '../config/index.js';
import { logger } from '../config/logger.js';
import { connectDB, disconnectDB } from '../db/connect.js';
import { User } from '../models/User.js';
import { Note } from '../models/Note.js';
import { Space } from '../models/Space.js';
import { Block } from '../models/Block.js';

/**
 * When the frontend lives next to this backend, reuse its static PDF chapters
 * so the reader pages have a table of contents from day one.
 */
async function loadFrontendChapters() {
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

async function seed() {
  await connectDB();

  // 1) Owner / admin account. The server also does this on boot; the seed
  //    additionally resets the password to the configured one.
  let owner = await User.findOne({ email: config.owner.email.toLowerCase() }).select('+passwordHash');
  if (!owner) {
    owner = new User({ email: config.owner.email, name: config.owner.name, role: 'ADMIN' });
    await owner.setPassword(config.owner.password);
    await owner.save();
    logger.info(`Created admin: ${owner.email}`);
  } else {
    owner.role = 'ADMIN';
    await owner.setPassword(config.owner.password);
    await owner.save();
    logger.info(`Admin already exists, password reset from env: ${owner.email}`);
  }

  // 2) Sample public note.
  const noteSlug = 'welcome-note';
  if (!(await Note.findOne({ slug: noteSlug }))) {
    await Note.create({
      slug: noteSlug,
      title: 'Welcome Note',
      description: 'Seeded example note.',
      category: 'general',
      tags: ['welcome'],
      visibility: 'PUBLIC',
      featured: false,
      author: owner._id,
      publishedAt: new Date(),
    });
    logger.info('Created sample note');
  }

  // 2b) The six landing-page cards. Slugs match the original card ids in
  //     course_selling/data/landingData.js. Counters start at zero: they are real.
  //     Chapters are pulled from the sibling frontend data when it is present.
  const chaptersByPdfId = await loadFrontendChapters();
  const landingNotes = [
    { slug: 'dsa-notes', title: 'DSA Notes', category: 'DSA', pages: 140, order: 1, tags: ['dsa', 'algorithms', 'leetcode'],
      badge: 'Core Foundation', accent: 'amber', icon: 'Code', level: 'All Levels',
      tagline: '450+ Solved Patterns • LeetCode Sheet • Visual Trees & Graphs',
      description: 'Visual decision trees, sliding windows, recursion templates, and graph traversals for top product company interviews.',
      projectBadge: 'Free Visualizer Repo', projectTitle: 'AlgoViz: Interactive DSA & Algorithm Visualizer', projectId: 'dsa-visualizer-suite',
      pdfId: 'dsa-patterns-mastery-sheet',
      instructor: { name: 'Kunal & Leads', role: 'DSA & System Design Lead', company: 'ex-Google', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' } },
    { slug: 'fullstack-notes', title: 'Full Stack Notes', category: 'Full Stack', pages: 86, order: 2, tags: ['nextjs', 'react', 'postgresql'],
      badge: 'Most Popular', accent: 'emerald', icon: 'Layers', level: 'Intermediate to Pro',
      tagline: 'Next.js 16 • React 19 • PostgreSQL • Server Actions & App Router',
      description: 'Complete blueprint covering App Router streaming, zero-bundle Server Components, and multi-tenant PostgreSQL schemas.',
      projectBadge: 'Free SaaS Repo', projectTitle: 'DevSprint: Cloud Task & Issue Management SaaS', projectId: 'devsprint-saas',
      pdfId: 'nextjs16-react19-handbook',
      instructor: { name: 'Alex Rivera', role: 'Staff Engineer', company: 'ex-Stripe', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' } },
    { slug: 'backend-notes', title: 'Backend Notes', category: 'Backend', pages: 105, order: 3, tags: ['microservices', 'grpc', 'kafka', 'redis'],
      badge: 'Core Engineering', accent: 'indigo', icon: 'Server', level: 'Advanced',
      tagline: 'Microservices • REST & gRPC • Kafka • Redis Caching & Auth',
      description: 'Designing event-driven backends, transactional outbox patterns, cache stampede protection, and token bucket rate limiting.',
      projectBadge: 'Production Gateway Repo', projectTitle: 'Nexus: High-Throughput Distributed Backend', projectId: 'nexus-microservices-core',
      pdfId: 'backend-microservices-playbook',
      instructor: { name: 'Marcus Vance', role: 'Principal Backend Lead', company: 'ex-Uber', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80' } },
    { slug: 'ai-ml-notes', title: 'AI/ML Notes', category: 'AI/ML', pages: 112, order: 4, tags: ['llm', 'rag', 'langgraph'],
      badge: 'Trending Tech', accent: 'purple', icon: 'Sparkles', level: 'All Levels',
      tagline: 'LLMs & LangGraph • RAG Pipelines • Vector Embeddings • LoRA',
      description: 'Enterprise RAG pipelines with semantic chunking, dense vector HNSW search, and LangGraph multi-agent supervisors.',
      projectBadge: 'Agent Swarm Repo', projectTitle: 'OmniRAG: Multi-Modal Document Analyst', projectId: 'omnirag-agent',
      pdfId: 'generative-ai-rag-systems-guide',
      instructor: { name: 'Dr. Marcus Chen', role: 'Principal AI Architect', company: 'ex-Microsoft', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80' } },
    { slug: 'system-design-notes', title: 'System Design Notes', category: 'System Design', pages: 68, order: 5, tags: ['system-design', 'sharding', 'caching'],
      badge: 'High Scale', accent: 'rose', icon: 'Network', level: 'All Levels',
      tagline: 'High-Scale Architecture • Sharding • Load Balancers • Capacity Math',
      description: 'Back-of-the-envelope estimation formulas, distributed caching with Redis, Kafka idempotency, and database sharding.',
      projectBadge: 'Architecture Blueprints', projectTitle: 'CognitiveDesk: Autonomous Support Copilot', projectId: 'cognitivedesk-ai-support',
      pdfId: 'system-design-interview-cheatsheet',
      instructor: { name: 'Elena Rostova', role: 'Staff Infrastructure Architect', company: 'ex-Meta', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80' } },
    { slug: 'devops-cloud-notes', title: 'DevOps & Cloud Notes', category: 'DevOps & Cloud', pages: 98, order: 6, tags: ['docker', 'kubernetes', 'terraform'],
      badge: 'Production Ready', accent: 'sky', icon: 'Cloud', level: 'Intermediate to Pro',
      tagline: 'Docker Containers • Kubernetes EKS • CI/CD • Terraform IaC',
      description: 'Hardened distroless multi-stage Docker builds, Terraform AWS modules, zero-downtime rolling deploys, and ArgoCD GitOps.',
      projectBadge: 'Kubernetes Infra Repo', projectTitle: 'ResilientCloud: Multi-Tier E-Commerce Infra', projectId: 'resilient-cloud-devops',
      pdfId: 'kubernetes-docker-cloud-bible',
      instructor: { name: 'David K.', role: 'Principal Cloud Architect', company: 'AWS Certified', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80' } },
  ];
  for (const { pdfId, ...n } of landingNotes) {
    const chapters = chaptersByPdfId.get(pdfId) ?? [];
    const existing = await Note.findOne({ slug: n.slug });
    if (existing) {
      // Keep counters and any admin-uploaded PDF untouched; refresh the
      // descriptive fields and only fill chapters when none were set.
      Object.assign(existing, n);
      if (!existing.chapters?.length && chapters.length) existing.chapters = chapters;
      await existing.save();
      continue;
    }
    await Note.create({ ...n, chapters, visibility: 'PUBLIC', featured: true, author: owner._id, publishedAt: new Date() });
    logger.info(`Created landing note: ${n.slug}`);
  }

  // 2c) Notes created before the `featured` flag existed: show them on the
  //     home page, except the sample welcome note.
  await Note.updateMany({ featured: { $exists: false }, slug: { $ne: noteSlug } }, { $set: { featured: true } });
  await Note.updateMany({ slug: noteSlug }, { $set: { featured: false } });

  // 3) Sample space with one code + one SQL block.
  const spaceSlug = 'welcome-space';
  let space = await Space.findOne({ slug: spaceSlug });
  if (!space) {
    space = await Space.create({
      slug: spaceSlug,
      title: 'Welcome Space',
      description: 'Seeded example workspace.',
      visibility: 'PUBLIC',
      owner: owner._id,
    });
    await Block.create([
      {
        space: space._id,
        type: 'CODE',
        position: 0,
        content: { language: 'javascript', code: "console.log('hello world');", filename: 'hello.js' },
      },
      {
        space: space._id,
        type: 'SQL',
        position: 1,
        content: { dialect: 'postgres', sql: 'SELECT 1 AS answer;' },
      },
    ]);
    logger.info('Created sample space with blocks');
  }

  logger.info('Seed complete');
  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  logger.error({ err }, 'Seed failed');
  process.exit(1);
});
