// Comprehensive catalog of free downloadable and readable PDF notes & handbooks

export const pdfCategories = [
  "All Notes",
  "Full-Stack Web Dev",
  "AI & Machine Learning",
  "UI/UX & Design Systems",
  "DevOps & Cloud",
  "System Design & DSA",
];

export const pdfNotesList = [
  {
    id: "nextjs16-react19-handbook",
    title: "Next.js 16 & React 19 Architecture Handbook",
    category: "Full-Stack Web Dev",
    pages: 86,
    fileSize: "14.8 MB",
    downloads: "28,400+",
    likes: 2420,
    author: "Alex Rivera (Staff Engineer, ex-Stripe)",
    badge: "Most Downloaded",
    badgeColor: "bg-emerald-600 text-white",
    description:
      "A complete guide to React 19 Server Components, App Router deep dives, Server Actions, PPR (Partial Prerendering), Turbopack optimizations, and Vercel AI SDK integrations.",
    tags: ["Next.js 16", "React 19", "TypeScript", "App Router", "AI SDK"],
    chapters: [
      {
        number: "01",
        title: "React 19 Server Components & Actions Mental Model",
        summary:
          "Understanding the server/client component boundary, streaming SSR, async request waterfalls, and the new useActionState hook.",
        contentSnippet:
          "Server Components execute exclusively on the server, producing a virtual DOM stream rather than bundling JS code to the browser. Combine with useOptimistic for instant UX feedback without blocking roundtrips.",
      },
      {
        number: "02",
        title: "Next.js 16 App Router & Caching Heuristics",
        summary:
          "Turbopack build pipeline, Request Memoization, Data Cache, Full Route Cache, and Router Cache invalidation.",
        contentSnippet:
          "Cache control in Next.js 16 defaults to dynamic where appropriate. Use revalidateTag() and revalidatePath() inside Server Actions to purge stale cache entries with surgical precision.",
      },
      {
        number: "03",
        title: "Database Modeling with Prisma ORM & PostgreSQL",
        summary:
          "Multi-tenant schemas, foreign key indexes, connection pooling with PgBouncer, and ACID transaction safety.",
        contentSnippet:
          "Index composite keys (e.g. @@index([workspaceId, createdAt])) to guarantee sub-10ms query execution across millions of rows in SaaS multi-tenant tables.",
      },
      {
        number: "04",
        title: "Vercel AI SDK & Streaming Agent Architecture",
        summary:
          "Integrating streamText, tool calling with schema validation, backpressure management, and custom LLM middleware.",
        contentSnippet:
          "Leverage z.object schemas inside tool definitions. When the model invokes a tool, execute the backend function and stream intermediate tool execution states back to the client UI.",
      },
      {
        number: "05",
        title: "Production Security, Headers & Zero-Downtime Deployment",
        summary:
          "Content Security Policy (CSP) nonces, rate-limiting with Redis, Docker multi-stage builds, and graceful shutdowns.",
        contentSnippet:
          "Deploy containerized standalone output with 'output: standalone' in next.config.js to shave Docker image sizes down to under 120MB.",
      },
    ],
  },
  {
    id: "generative-ai-rag-systems-guide",
    title: "Generative AI, RAG & Multi-Agent Systems Field Manual",
    category: "AI & Machine Learning",
    pages: 112,
    fileSize: "18.5 MB",
    downloads: "21,650+",
    likes: 1980,
    author: "Marcus Chen (Principal AI Architect, ex-Microsoft)",
    badge: "Trending Note",
    badgeColor: "bg-[#f3843f] text-white",
    description:
      "Deep dive into enterprise RAG architectures, chunking strategies, vector embeddings (Pinecone, pgvector), fine-tuning with LoRA, and LangGraph multi-agent orchestration.",
    tags: ["LLMs", "RAG", "LangGraph", "Vector DB", "Llama 3"],
    chapters: [
      {
        number: "01",
        title: "Embedding Heuristics & Chunking Strategies",
        summary:
          "Semantic chunking vs recursive character chunking, token overlaps, and metadata preservation for high-accuracy recall.",
        contentSnippet:
          "Standard fixed-size chunking frequently tears across logical sentences. Implement semantic boundary chunking with cosine thresholding between adjacent sentence vectors for 35% higher precision.",
      },
      {
        number: "02",
        title: "Hybrid Search & Cross-Encoder Reranking",
        summary:
          "Combining BM25 keyword matching with dense vector distance (HNSW) and Cohere/BGE rerankers to eliminate hallucinations.",
        contentSnippet:
          "Dense embeddings capture abstract semantics; BM25 captures specific alphanumeric IDs, SKUs, and names. Reciprocal Rank Fusion (RRF) yields top-3 accuracy exceeding 94%.",
      },
      {
        number: "03",
        title: "LangGraph Multi-Agent Workflows & Memory",
        summary:
          "StateGraph patterns, agent routing, supervisor loops, human-in-the-loop validation, and persistent short/long-term memory.",
        contentSnippet:
          "Structure complex AI agents as cyclical directed graphs. Break tasks into specialized worker nodes: a researcher, a synthesizer, and a critic node that validates factuality before output generation.",
      },
      {
        number: "04",
        title: "Fine-Tuning Open Weights with LoRA & Unsloth",
        summary:
          "Dataset curation, ChatML formatting, low-rank adapters, QLoRA 4-bit quantization, and loss curves analysis.",
        contentSnippet:
          "Fine-tuning targets style and format consistency. For factual domain knowledge, prioritize RAG. Use LoRA on target linear projections (q_proj, k_proj, v_proj, o_proj) to minimize VRAM footprint.",
      },
    ],
  },
  {
    id: "figma-tokens-design-systems-guide",
    title: "Modern Design Systems: Figma Variables to React Code",
    category: "UI/UX & Design Systems",
    pages: 74,
    fileSize: "12.4 MB",
    downloads: "16,200+",
    likes: 1740,
    author: "Maya Patel (Lead Design Systems, ex-Figma)",
    badge: "High Praise",
    badgeColor: "bg-blue-600 text-white",
    description:
      "Bridging the designer-developer gap. Figma variables, multi-brand token hierarchy, accessible contrast ratios (WCAG 2.2), Tailwind theme syncing, and Radix UI primitives.",
    tags: ["Figma", "Design Tokens", "Tailwind CSS", "Radix UI", "Accessibility"],
    chapters: [
      {
        number: "01",
        title: "3-Tier Token Hierarchy & Semantic Aliases",
        summary:
          "Global/Primitive tokens, Semantic/Intent tokens, and Component-level tokens. Dark mode & brand switching mechanics.",
        contentSnippet:
          "Never link components directly to raw hex colors like #f3843f. Always route through semantic abstractions: primary.brand -> interactive.accent -> button.primary.bg.",
      },
      {
        number: "02",
        title: "Accessible Interaction States & WCAG 2.2",
        summary:
          "Focus visible rings, AAA contrast for body typography, touch target guidelines (min 44x44px), and screen-reader ARIA models.",
        contentSnippet:
          "Implement :focus-visible outlines that dynamically offset from borders. Test color pairs under simulated deuteranopia and protanopia vision modes.",
      },
      {
        number: "03",
        title: "Automated Token Syncing: Figma API to Tailwind Config",
        summary:
          "Exporting Figma Variables via REST API to JSON tokens and transforming them to CSS custom properties with Style Dictionary.",
        contentSnippet:
          "Set up a GitHub Action that triggers upon Figma publish webhook. Regenerate tailwind.config.js theme values automatically without manual handoff friction.",
      },
    ],
  },
  {
    id: "kubernetes-docker-cloud-bible",
    title: "Production Cloud & Kubernetes DevOps Playbook",
    category: "DevOps & Cloud",
    pages: 98,
    fileSize: "16.1 MB",
    downloads: "19,800+",
    likes: 1890,
    author: "David K. (Principal Cloud Architect, AWS Certified)",
    badge: "Essential",
    badgeColor: "bg-purple-600 text-white",
    description:
      "Battle-tested runbook for Kubernetes microservices, Terraform infrastructure-as-code, Helm packaging, ArgoCD GitOps, and Prometheus observability.",
    tags: ["Kubernetes", "Docker", "Terraform", "AWS EKS", "ArgoCD"],
    chapters: [
      {
        number: "01",
        title: "Hardened Container Images & Multi-Stage Builds",
        summary:
          "Distroless base images, non-root user execution, layer caching techniques, and automated Trivy vulnerability scanning.",
        contentSnippet:
          "Always compile binaries in a dedicated builder stage and copy only the final artifact into a gcr.io/distroless/static runtime image to minimize attack vectors.",
      },
      {
        number: "02",
        title: "Terraform Modules for Multi-AZ AWS Infrastructure",
        summary:
          "VPC layout with public/private subnets, NAT gateways, state locking with DynamoDB, and remote S3 backend configuration.",
        contentSnippet:
          "Structure Terraform code into modular roots: networking, compute, storage, and IAM. Never hardcode AWS account IDs or secrets in provider blocks.",
      },
      {
        number: "03",
        title: "Kubernetes Deployments, HPA & Zero-Downtime Rollouts",
        summary:
          "Pod disruption budgets, readiness & liveness probes, resource requests/limits, and horizontal pod autoscaling based on CPU/memory/custom metrics.",
        contentSnippet:
          "Configure maxSurge: 25% and maxUnavailable: 0 in rollingUpdate strategies to guarantee that zero client connections are dropped during new container deployments.",
      },
    ],
  },
  {
    id: "system-design-interview-cheatsheet",
    title: "High-Scale System Design & Architecture Cheatsheet",
    category: "System Design & DSA",
    pages: 68,
    fileSize: "11.2 MB",
    downloads: "34,900+",
    likes: 3120,
    author: "Staff Engineering Roundtable",
    badge: "All-Time Favorite",
    badgeColor: "bg-amber-600 text-white",
    description:
      "Key formulas, capacity estimation rules of thumb, distributed caching, database sharding, message queues (Kafka, RabbitMQ), rate limiters, and idempotency keys.",
    tags: ["System Design", "Distributed Systems", "Caching", "Kafka", "PostgreSQL"],
    chapters: [
      {
        number: "01",
        title: "Back-of-the-Envelope Estimation Framework",
        summary:
          "QPS calculations, peak load multiplier (x3), storage growth per year, memory sizing for 80/20 Pareto caching, and network bandwidth.",
        contentSnippet:
          "1 million daily active users with 20 requests/day = 20M req/day = ~230 requests/second average, peaking at ~700 QPS. At 2KB payload per request, bandwidth is only ~1.4 MB/s.",
      },
      {
        number: "02",
        title: "Distributed Caching: Redis Clusters & Invalidation",
        summary:
          "Cache-aside vs write-through vs write-behind. Mitigating cache stampede, cache penetration with Bloom filters, and cache avalanche with jitter.",
        contentSnippet:
          "Never set identical TTLs across cached records. Add a random jitter (e.g., base TTL 3600s + rand(0, 300s)) to avoid simultaneous expiration waves that hammer primary databases.",
      },
      {
        number: "03",
        title: "Event-Driven Architecture & Idempotency",
        summary:
          "At-least-once message delivery with Apache Kafka, outbox pattern, consumer lag monitoring, and distributed unique idempotency keys.",
        contentSnippet:
          "Combine unique client-supplied idempotency tokens with database unique constraints to guarantee that network retries never double-charge or duplicate payments.",
      },
    ],
  },
  {
    id: "react-native-expo-production-handbook",
    title: "Cross-Platform Mobile Pro: React Native & Expo Guide",
    category: "Full-Stack Web Dev",
    pages: 78,
    fileSize: "13.6 MB",
    downloads: "14,300+",
    likes: 1560,
    author: "Sarah Connor (Lead Mobile Architect, ex-Airbnb)",
    badge: "Mobile Spec",
    badgeColor: "bg-teal-600 text-white",
    description:
      "Building 60fps native iOS and Android apps with Expo Router v4, React Native Reanimated 3, offline-first SQLite databases, and app store release pipelines.",
    tags: ["React Native", "Expo", "Reanimated 3", "Mobile", "iOS/Android"],
    chapters: [
      {
        number: "01",
        title: "File-Based Navigation with Expo Router v4",
        summary:
          "Stack, Tabs, and Drawer navigators, dynamic route parameters, typed navigation, and universal deep linking schemas.",
        contentSnippet:
          "Expo Router leverages file-system conventions identical to modern web frameworks, giving developers instant universal routing between iOS, Android, and Web with one shared codebase.",
      },
      {
        number: "02",
        title: "60fps Gesture Animations with Reanimated 3",
        summary:
          "Worklet execution on UI thread, Gesture Handler pan/pinch events, shared element transitions, and interpolateColor transforms.",
        contentSnippet:
          "Run animations on the native UI thread with worklet functions. Avoid dispatching gesture events across the JS bridge to maintain buttery smooth 60fps frame rates.",
      },
    ],
  },
  {
    id: "dsa-patterns-mastery-sheet",
    title: "DSA Mastery & Algorithm Patterns Cheatsheet",
    category: "System Design & DSA",
    pages: 140,
    fileSize: "19.2 MB",
    downloads: "42,800+",
    likes: 3840,
    author: "Kunal & FAANG Staff Engineers",
    badge: "Most Popular",
    badgeColor: "bg-amber-500 text-white",
    description:
      "450+ solved patterns, Blind 75 & NeetCode 150 visual breakdowns, dynamic programming decision trees, sliding windows, and graph traversal templates.",
    tags: ["DSA", "Algorithms", "Dynamic Programming", "Graphs", "LeetCode"],
    chapters: [
      {
        number: "01",
        title: "Two Pointers & Sliding Window Archetypes",
        summary:
          "Variable-length sliding windows, fixed windows, fast & slow pointers, and cycle detection in linked lists.",
        contentSnippet:
          "Whenever sub-array constraints must be maintained, expand the right pointer to acquire state, and contract the left pointer while the condition is violated.",
      },
      {
        number: "02",
        title: "Dynamic Programming: 1D, 2D & Knapsack Visualizer",
        summary:
          "State transition diagrams, memoization vs bottom-up tabulation, space optimization from O(N) to O(1).",
        contentSnippet:
          "Frame every DP problem as a Directed Acyclic Graph (DAG) of choices. Identify the base cases, define dp[i][j], and verify state overlaps.",
      },
      {
        number: "03",
        title: "Graph Traversal: BFS, DFS, Dijkstra & Topological Sort",
        summary:
          "Adjacency lists, Kahn's algorithm for DAG dependencies, union-find with path compression, and shortest path in weighted graphs.",
        contentSnippet:
          "For cycle detection in directed graphs, track visiting/visited states with 3-color painting. For undirected graphs, use Disjoint Set Union (DSU).",
      },
    ],
  },
  {
    id: "backend-microservices-playbook",
    title: "Production Backend & Microservices Architecture",
    category: "Full-Stack Web Dev",
    pages: 105,
    fileSize: "15.4 MB",
    downloads: "24,100+",
    likes: 2790,
    author: "Backend Architecture Guild",
    badge: "Core Engineering",
    badgeColor: "bg-indigo-600 text-white",
    description:
      "Designing resilient microservices, gRPC & REST APIs, Redis distributed caching, Kafka event streams, ACID transactions, and JWT authentication.",
    tags: ["Backend", "Microservices", "Kafka", "Redis", "PostgreSQL", "gRPC"],
    chapters: [
      {
        number: "01",
        title: "API Gateway, Rate Limiting & Auth Flows",
        summary:
          "Reverse proxies, token bucket rate limiters, OAuth2/OIDC, and stateless JWT with asymmetric keys.",
        contentSnippet:
          "Terminate public TLS at the API Gateway. Verify tokens once, and inject validated claims into internal headers (X-User-Id, X-Tenant-Id) for downstream services.",
      },
      {
        number: "02",
        title: "Distributed Caching with Redis & Cache Invalidation",
        summary:
          "Cache-aside pattern, mitigating cache stampede with mutex locks, and TTL jitter strategies.",
        contentSnippet:
          "Always apply jitter to cache expiry to prevent thundering herd problems when thousands of keys expire simultaneously under peak traffic.",
      },
      {
        number: "03",
        title: "Event-Driven Microservices with Kafka & Outbox Pattern",
        summary:
          "Transactional outbox pattern, Debezium CDC, idempotency keys, and consumer group rebalancing.",
        contentSnippet:
          "Write the domain change and the outbox event within the exact same database transaction. A separate relay publisher ensures zero lost events.",
      },
    ],
  },
];
