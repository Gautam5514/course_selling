// Catalog of the free handbooks on the PDF Notes page. The card id is the note
// slug in the backend, so /pdf/<id> opens the real PDF. pages, fileSize,
// description, author and chapters are written by notes-pdf/sync-catalog.mjs
// from the built PDFs: edit the Markdown in notes-pdf/content, not these.

export const pdfCategories = [
  "All Notes",
  "Full-Stack Web Dev",
  "AI & Machine Learning",
  "UI/UX & Design Systems",
  "DevOps & Cloud",
  "System Design & DSA"
];

export const pdfNotesList = [
  {
    "id": "nextjs16-react19-handbook",
    "title": "Next.js 16 & React 19 Architecture Handbook",
    "category": "Full-Stack Web Dev",
    "pages": 97,
    "fileSize": "3.2 MB",
    "author": "Gautam Pandit",
    "badge": "Most Downloaded",
    "badgeColor": "bg-emerald-600 text-white",
    "description": "This handbook explains the architecture of a Next.js 16 and React 19 app in plain language, with TypeScript code you can type and run. You will learn where code runs, how data is fetched, cached and streamed, how forms, databases, sessions and AI responses fit in, and how to secure, test and deploy the result. It assumes you know basic React and JavaScript, and it ends with a cheat sheet, interview questions and a study plan.",
    "tags": [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "App Router",
      "AI SDK"
    ],
    "chapters": [
      {
        "number": "01",
        "title": "Server Components: the mental model",
        "summary": "Where your React code runs, why it matters, and how one page is built in two places.",
        "contentSnippet": "In the App Router every component is a Server Component unless the file starts with 'use client'. Server Components can be async, read the database and secrets, and send no JavaScript to the browser. The server sends HTML for the first paint plus an RSC Payload that describes the tree and the props for Client Components. Client Components render on the server for the first HTML and again in the browser, where they are hydrated. Server Components cannot use state, effects, event handlers or browser objects. Next.js 16 needs Node.js 20.9+, uses Turbopack by default and makes request APIs async."
      },
      {
        "number": "02",
        "title": "Client Components and the boundary",
        "summary": "How to add interactivity without sending your whole app to the browser.",
        "contentSnippet": "'use client' marks a boundary: the file and everything it imports go to the browser. Keep the directive on small leaf components, never on a whole page or layout. Props that cross the boundary must be serializable; functions are not, except Server Functions. A Client Component cannot import a Server Component but can receive one as children. import 'server-only' turns a secret leak into a build error. Only NEXT_PUBLIC_ environment variables reach the browser."
      },
      {
        "number": "03",
        "title": "App Router: files, layouts and special files",
        "summary": "Folders become URLs, and a few reserved file names give you layouts, loading states and error screens.",
        "contentSnippet": "A folder is a URL segment; it is public only if it has page.tsx or route.ts. Layouts stay mounted between child pages and do not re-render on navigation. params, searchParams, cookies() and headers() are async in Next.js 16: always await. Nesting order in a segment: layout, then error, then loading, then page. error.tsx must be a Client Component and does not catch errors from its own layout. Every parallel route slot needs a default.tsx in Next.js 16."
      },
      {
        "number": "04",
        "title": "React 19 Actions and the new hooks",
        "summary": "One idea, \"an async function that changes something\", and four hooks built around it.",
        "contentSnippet": "An Action is an async function run in a transition; React tracks its pending state for you. <form action={fn}> calls fn(formData) and resets the form after success. useActionState returns [state, formAction, isPending] and adds prevState as the action's first argument. useFormStatus comes from react-dom and must be used in a child of the form. useOptimistic shows a temporary value during an Action and returns to the real value afterwards. use(promise) suspends until the Promise resolves; create the Promise on the server, not in client render."
      },
      {
        "number": "05",
        "title": "Data fetching, Suspense and streaming",
        "summary": "Fetch data in the component that needs it, start requests early, and send the page in pieces.",
        "contentSnippet": "Fetch in the Server Component that needs the data; keep queries in a server-only data layer that returns small DTOs. React cache() removes duplicate calls inside one request; it is not a cross-request cache. fetch is not cached across requests by default, and it does not throw on 4xx or 5xx: check res.ok. Independent requests should run in parallel with Promise.all or sibling Suspense boundaries. Streaming is one HTTP response written in chunks; each Suspense boundary is a chunk. Call notFound() before the first boundary, because the status code is sent with the first chunk."
      },
      {
        "number": "06",
        "title": "Caching with Cache Components",
        "summary": "Decide what can be reused, for how long, and how to throw it away at the right moment.",
        "contentSnippet": "With cacheComponents: true, nothing is cached unless you write 'use cache'. The cache key is built from the function and its arguments; arguments and return values must be serializable. cacheLife profiles set stale, revalidate and expire; after revalidate the old value is served while a new one is fetched. cacheTag labels data; updateTag refreshes at once (Server Actions only), revalidateTag(tag, 'max') refreshes in the background. Cached code cannot read cookies or headers: read them outside and pass values as arguments. In-memory cache is per server instance and is empty after every new deployment."
      },
      {
        "number": "07",
        "title": "Partial Prerendering and the static shell",
        "summary": "One page, two speeds: an instant shell from the build, and personal parts streamed at request time.",
        "contentSnippet": "PPR is the default when cacheComponents: true: a static shell from the build plus holes filled at request time. Static and use cache content and Suspense fallbacks go into the shell; cookies, headers, search params and uncached data become holes. Shell and holes arrive in one streamed response. Request-time data outside a Suspense boundary is reported as an error: cache it or wrap it. Push await cookies() down to the smallest component to keep the shell big. Use connection() for per-request random values and dates, or cache them to share one value."
      },
      {
        "number": "08",
        "title": "Server Actions, forms and validation",
        "summary": "Change data with a function call, and treat every call as coming from a stranger.",
        "contentSnippet": "A Server Function is created with 'use server'; every exported one is a public POST endpoint. Follow five steps: authenticate, validate, authorize, mutate, invalidate and respond. Validate with a schema (safeParse) and return field errors as state; never trust ids or user ids from the form. Return expected errors, throw unexpected ones; call redirect() outside try/catch. Make actions idempotent where possible so double submits are harmless. The response of an action carries both its return value and the refreshed UI."
      },
      {
        "number": "09",
        "title": "Route Handlers and proxy.ts",
        "summary": "HTTP endpoints for other programs, and one file that runs before every request.",
        "contentSnippet": "Route Handlers are route.ts files that export GET, POST and other method functions using web Request and Response. Use them for callers outside your React tree: mobile apps, webhooks, streams, downloads. ctx.params is a Promise in Route Handlers too; type it with RouteContext. Verify webhook signatures with an HMAC and timingSafeEqual. proxy.ts replaces middleware.ts, runs on Node.js before matched requests, and needs a matcher. The proxy is an optimistic filter; real authorization stays next to the data."
      },
      {
        "number": "10",
        "title": "Database access with Prisma and PostgreSQL",
        "summary": "A typed way to talk to a relational database, and the habits that keep it fast and safe.",
        "contentSnippet": "Describe tables as models in schema.prisma; create changes with prisma migrate dev, apply in production with prisma migrate deploy. Keep one PrismaClient on globalThis in development and mark the file server-only. Always select only the columns you need. Avoid N+1: load related data and counts in the same query, never in a loop. Use transactions for changes that belong together, and put conditions in the where of the update to avoid race conditions. Use tagged-template $queryRaw for raw SQL; never build SQL from user text."
      },
      {
        "number": "11",
        "title": "Authentication with cookies and sessions",
        "summary": "Prove who the user is once, remember it safely, and check it again wherever data is touched.",
        "contentSnippet": "Authentication proves identity; authorization decides permission. Check both on the server. Hash passwords with a slow salted function such as scrypt; never store or log the password. Keep the session token in an httpOnly, secure, sameSite cookie; store only its hash in the database. One cached getCurrentUser() in a server-only data layer is the single source of truth. Filter every query by the owner (userId: user.id) to prevent IDOR. The proxy and layouts are convenience checks; pages, data functions and actions hold the real ones."
      },
      {
        "number": "12",
        "title": "Streaming AI responses with the Vercel AI SDK",
        "summary": "Send a model's answer to the screen word by word, without exposing your key or your wallet.",
        "contentSnippet": "An LLM produces tokens one by one; streaming shows them as they arrive over one HTTP response. Server: a Route Handler calls streamText and returns toUIMessageStreamResponse(). Client: useChat keeps messages, sends with sendMessage, and exposes status and stop. The API key and the system prompt stay on the server. Require login, rate limit, and cap message size and output tokens to control cost. Tools run with the current user's permissions; model output is untrusted text."
      },
      {
        "number": "13",
        "title": "Security headers and common vulnerabilities",
        "summary": "The usual ways web apps get attacked, and the specific defence for each one in this stack.",
        "contentSnippet": "Set HSTS, nosniff, frame, referrer and permissions headers for every route in next.config.ts. A nonce-based CSP is the strongest script protection, but it forces request-time rendering. React escapes text in JSX; dangerouslySetInnerHTML and javascript: URLs bring XSS back. Server Actions check POST and Origin; Route Handlers that use cookies need their own Origin check. Prevent IDOR and mass assignment with owner filters and schemas that pick allowed fields. Validate redirect targets and rate limit login and AI endpoints."
      },
      {
        "number": "14",
        "title": "Performance: images, fonts, bundle and Turbopack",
        "summary": "What makes a page feel fast, how Next.js helps, and where you can still slow it down.",
        "contentSnippet": "Core Web Vitals: LCP (main content), INP (reaction to input), CLS (layout jumps). next/image needs alt, real dimensions and sizes; use preload (not priority) for the main image. next/font self-hosts fonts and avoids layout shift. The best bundle optimization is fewer Client Components; then next/dynamic and the analyzer. Turbopack is the default bundler in Next.js 16; a custom webpack config needs migration or --webpack. Type-check and lint yourself in CI; the React Compiler is opt-in."
      },
      {
        "number": "15",
        "title": "Testing and zero-downtime deployment",
        "summary": "Catch mistakes before users do, and release new versions without anyone noticing.",
        "contentSnippet": "Unit test schemas and helpers with Vitest; use Playwright E2E for flows and async Server Components. Test the refusals: wrong role, wrong owner, invalid input, double submit. CI order: type check, lint, unit tests, build, E2E. NEXT_PUBLIC_ values are fixed at build time; server variables are read at runtime. Zero downtime needs health checks, graceful shutdown and expand-and-contract migrations. With several instances: set deploymentId, share the Server Actions encryption key and the cache."
      },
      {
        "number": "16",
        "title": "Cheat sheet, interview questions and study plan",
        "summary": "Everything on a few pages for the night before, plus a plan to make it stick.",
        "contentSnippet": "Know where each kind of code runs: Server Component, Client Component, Server Action, Route Handler, proxy. Next.js 16 basics: async request APIs, Turbopack by default, proxy.ts, opt-in caching with use cache. Every action and handler: session, schema, ownership, change, invalidate. Keep Client Components small, push request data down, and wrap dynamic parts in Suspense. Cache only shared data, with an explicit lifetime and a tag. Learn by building one full project and breaking it on purpose."
      }
    ]
  },
  {
    "id": "generative-ai-rag-systems-guide",
    "title": "Generative AI, RAG & Multi-Agent Systems Field Manual",
    "category": "AI & Machine Learning",
    "pages": 103,
    "fileSize": "3.0 MB",
    "author": "Gautam Pandit",
    "badge": "Trending Note",
    "badgeColor": "bg-[#f3843f] text-white",
    "description": "Learn to build real LLM applications step by step: prompts and structured output, embeddings, chunking, pgvector, a full RAG pipeline, hybrid search, reranking, evaluation, tool calling, LangGraph and multi-agent patterns. Every chapter explains the idea in plain language first and then shows short, commented Python or SQL with a dry run, common mistakes and an interview question with a model answer. Library APIs in this field change quickly, so version-sensitive calls are marked and you should confirm them in the current docs.",
    "tags": [
      "LLMs",
      "RAG",
      "LangGraph",
      "Vector DB",
      "Llama 3"
    ],
    "chapters": [
      {
        "number": "01",
        "title": "How an LLM works in plain words",
        "summary": "Tokens, the context window, temperature and sampling: the four ideas you need before you write a single prompt.",
        "contentSnippet": "An LLM predicts the next token again and again. It does not look facts up. Tokens are pieces of words. Price, speed and limits are all counted in tokens. The context window holds the prompt, history, documents and the answer together. The model has no memory between calls. Your code must send the history each time. Low temperature gives stable answers. High temperature gives variety. top-k and top-p remove unlikely tokens before the pick."
      },
      {
        "number": "02",
        "title": "Prompt patterns and structured output",
        "summary": "How to write instructions that a model follows, and how to get an answer your code can parse.",
        "contentSnippet": "A good prompt has a role, context, the task, rules and an output format. Use delimiters such as tags to separate instructions from data. Few-shot examples fix format and label problems quickly. Split big tasks into a chain of small prompts that you can test alone. For structured output: ask for an exact shape, validate, retry once. Valid JSON can still hold wrong values. Check important fields in code."
      },
      {
        "number": "03",
        "title": "Embeddings and similarity",
        "summary": "How text becomes a list of numbers, and how those numbers let a computer find text with the same meaning.",
        "contentSnippet": "An embedding turns text into a vector. Similar meaning gives a similar direction. Cosine similarity compares direction: 1 is the same, 0 is unrelated. With normalized vectors, cosine and dot product are equal. Query and documents must use the same embedding model and version. Text longer than the model's limit is cut off silently. Thresholds are model-specific. Tune them on your own data."
      },
      {
        "number": "04",
        "title": "Chunking strategies",
        "summary": "How to cut documents into pieces so that search finds the right piece and the model gets enough context.",
        "contentSnippet": "Chunks are needed because of input limits and because one vector cannot hold many topics. Small chunks match precisely but lack context. Large chunks are the opposite. Overlap protects sentences that sit on a chunk border. Splitting by the document's own structure usually beats splitting by size. Store metadata with each chunk to filter, cite and fetch neighbours. Add the title and section to the chunk text before embedding it."
      },
      {
        "number": "05",
        "title": "Vector databases: pgvector and hosted stores",
        "summary": "Where vectors live, how a database finds the nearest ones quickly, and how to choose between Postgres and a hosted service.",
        "contentSnippet": "Exact search checks every vector. ANN search uses an index and trades a little recall for speed. HNSW is a graph index and the common default. IVFFlat uses clusters and needs data first. pgvector: vector(n) column, <=> cosine distance, <-> L2, <#> inner product. The query operator must match the index operator class, or the index is ignored. Filters plus ANN can return too few rows. Tune or index the filter column. Start with pgvector if you already run Postgres. Move only for a measured reason."
      },
      {
        "number": "06",
        "title": "Your first RAG pipeline, end to end",
        "summary": "Load, chunk, embed, store, retrieve, build the prompt and answer with sources: the whole pipeline in about 80 lines of Python.",
        "contentSnippet": "RAG = retrieve relevant chunks, add them to the prompt, generate from them. Indexing runs when documents change. Answering runs for every question. The prompt must demand answers from the sources only, with citations. Give the model a clear \"I could not find this\" path. Re-index changed files and delete their old chunks. Enforce permissions in the search filter, never only in the prompt."
      },
      {
        "number": "07",
        "title": "Hybrid search, rank fusion and reranking",
        "summary": "Combine keyword search with vector search, merge the two lists fairly, and let a stronger model re-order the best candidates.",
        "contentSnippet": "Keyword search is strong on exact terms. Vector search is strong on meaning. BM25 scores by term frequency, rarity of the term and document length. RRF merges ranked lists by position: add 1 / (60 + rank) from each list. In Postgres: a tsvector column plus a GIN index gives keyword search next to pgvector. A cross-encoder reads question and chunk together and re-orders the candidates. Retrieve wide (20 to 50), rerank, keep a few (3 to 5)."
      },
      {
        "number": "08",
        "title": "Query rewriting, HyDE and multi-query",
        "summary": "Fix the question before you search: turn follow-ups into full questions, search from several angles, and split big questions into small ones.",
        "contentSnippet": "A user's message is often a poor search query. Fix the query before searching. Rewrite follow-up messages into standalone questions using the chat history. Multi-query: several wordings, several searches, merge with RRF. HyDE: embed a made-up answer to find real chunks. Never show the made-up answer. Decomposition splits a multi-part question. Step-back searches the general rule. Each technique costs an LLM call. Add them one at a time and measure."
      },
      {
        "number": "09",
        "title": "Evaluating a RAG system",
        "summary": "How to measure retrieval and answers with numbers, build a test set, and stop guessing whether a change helped.",
        "contentSnippet": "Measure retrieval and generation separately. Their fixes are different. A test set of 30 to 50 questions with labelled relevant chunks is enough to start. Recall@k is the first retrieval metric: a chunk that is not retrieved cannot be used. MRR and nDCG show how high the relevant chunks are ranked. Faithfulness = share of the answer's claims that the sources support. Check the LLM judge against human labels before you trust its scores."
      },
      {
        "number": "10",
        "title": "Tool calling and the agent loop",
        "summary": "How a model that can only write text gets to check an order, do maths or search a database, and how a simple loop turns it into an agent.",
        "contentSnippet": "The model only requests a tool. Your code runs it and returns the result. A tool is described by a name, a description and a JSON Schema for its arguments. Agent = LLM + tools + a loop where the model picks the next step. Always set a step limit, validate arguments and return errors as data. Never send model output to eval, a shell or raw SQL. Write tools need confirmation and should be idempotent."
      },
      {
        "number": "11",
        "title": "LangGraph: state, nodes, edges and memory",
        "summary": "Draw your LLM workflow as a graph so that branches, loops, saved progress and human approval become easy to build and to see.",
        "contentSnippet": "State is a shared dictionary. Nodes are functions that return only the keys they change. Edges choose the next node. Conditional edges decide by looking at the state. A reducer such as operator.add appends to a list instead of replacing it. Every loop needs its own counter in the state. A checkpointer plus a thread_id gives memory, resume after crash, and pauses. interrupt pauses for a human. Command(resume=...) continues the run."
      },
      {
        "number": "12",
        "title": "Multi-agent patterns, and when not to use agents",
        "summary": "Supervisor and handoff designs for teams of agents, and an honest look at when a single prompt or a fixed workflow is the better choice.",
        "contentSnippet": "Ladder: one call, workflow, single agent, multi-agent. Climb only when needed. In a workflow your code fixes the path. In an agent the model chooses it. Reliability multiplies down: ten 95 percent steps give about 60 percent. Supervisor: one agent routes all work. Central control, extra calls. Handoff: the active agent transfers control. Fewer calls, risk of ping-pong. Pass structured state between agents, not loose summaries."
      },
      {
        "number": "13",
        "title": "Fine-tuning vs RAG, and LoRA in practice",
        "summary": "When to change the model's weights and when to change only its input, plus how LoRA and QLoRA make fine-tuning affordable.",
        "contentSnippet": "RAG changes what the model reads. Fine-tuning changes how the model behaves. Try prompts, then few-shot, then RAG. Fine-tune last, and only with good data. LoRA freezes W and trains two thin matrices: W x + (alpha / r) B A x. B starts at zero, so training begins from the unchanged model. QLoRA = a 4-bit quantized frozen base model plus LoRA adapters. Always compare with a baseline on held-out data to catch overfitting."
      },
      {
        "number": "14",
        "title": "Running open models on your own machine",
        "summary": "What you need to run an LLM locally, what quantization does, and how to call a local model with the same code you use for an API.",
        "contentSnippet": "Open-weight models can be downloaded and run locally. Always read the licence. Memory for weights is about parameters times bits divided by 8. Quantization stores weights in fewer bits. 4-bit is the common laptop choice. Ollama serves local models with an OpenAI-style API on port 11434. Keep your app behind call_llm and embed so that local and hosted are swappable. Check the runtime's context length setting, or long prompts get cut silently."
      },
      {
        "number": "15",
        "title": "Shipping to production: guardrails, cost and observability",
        "summary": "What changes when real users arrive: attacks through text, bills, slow answers and the need to see what your system did.",
        "contentSnippet": "Prompt injection: text in a message or document acts as an instruction. Indirect is the worse kind. Defend in layers: least privilege, permissions in code, human approval, output checks. Cost = input tokens and output tokens times their prices. Know your cost per request. Stream answers, generate less, use small models for helper steps. Cache exact repeats safely. Be careful with semantic caches and per-user data. Trace every request: query, chunks, tool calls, tokens, latency, prompt version."
      },
      {
        "number": "16",
        "title": "Cheat sheet, interview questions and study plan",
        "summary": "Everything from this manual on a few pages: default settings, a fault-finding table, interview answers and a six-week plan.",
        "contentSnippet": "Debug RAG in order: retrieved chunks first, then the prompt, then the model. Default pipeline: rewrite, hybrid retrieve, RRF, rerank, grounded generation, checks. Build a test set early. Change one thing at a time and write the numbers down. Use the simplest design that works: call, workflow, agent, multi-agent. RAG is for knowledge, fine-tuning is for behaviour, guardrails live in code. Learn the ideas deeply and look up the API details in current docs."
      }
    ]
  },
  {
    "id": "figma-tokens-design-systems-guide",
    "title": "Modern Design Systems: Figma Variables to React Code",
    "category": "UI/UX & Design Systems",
    "pages": 104,
    "fileSize": "3.4 MB",
    "author": "Gautam Pandit",
    "badge": "High Praise",
    "badgeColor": "bg-blue-600 text-white",
    "description": "Learn how a design system is planned in Figma and shipped as real code. The handbook covers design tokens, colour and type scales, Figma variables and modes, Style Dictionary, CSS variables, Tailwind CSS v4 and accessible React components built on Radix UI. Every chapter has commented code, worked examples, common mistakes and interview questions, and the last chapter is a cheat sheet with a study plan.",
    "tags": [
      "Figma",
      "Design Tokens",
      "Tailwind CSS",
      "Radix UI",
      "Accessibility"
    ],
    "chapters": [
      {
        "number": "01",
        "title": "What a design system is and why teams need one",
        "summary": "One shared set of decisions, parts and rules, so that every screen looks and behaves like it belongs to the same product.",
        "contentSnippet": "A design system is shared decisions, reusable parts, written rules and a process. Layers: tokens, components, patterns, guidelines. A component library is only one part of a design system. The big win: a change is made in one place, not in every screen. Keep one source of truth and generate the rest: Figma variables, token JSON, CSS, components. Start small with tokens and the most used components, then grow from real needs."
      },
      {
        "number": "02",
        "title": "Design tokens: decisions with names",
        "summary": "A design token is a small design decision, such as a colour or a gap, stored as data with a clear name.",
        "contentSnippet": "A design token is a named design decision stored as data: name, value, type. Tokens replace hard-coded values, so a change happens in one place. The DTCG JSON format uses $value, $type and $description. An alias is a token that points to another token: {color.rose.600}. Name tokens by purpose, in a fixed word order: category, role, variant, state. One token file can generate CSS, TypeScript, Android and iOS code."
      },
      {
        "number": "03",
        "title": "The three-tier token hierarchy",
        "summary": "Primitive tokens hold raw values, semantic tokens give them a meaning, and component tokens tie that meaning to one component.",
        "contentSnippet": "Primitive tokens: raw values such as color.rose.600. The only place for hex codes. Semantic tokens: meaning such as color.action.primary. They point to primitives. Component tokens: one component, such as button.primary.background. They point to semantic tokens. Themes change the values of semantic tokens. Names never change. Never skip the semantic tier, and never use raw values in components. Start with two tiers if the team is small. Add component tokens when a real need appears."
      },
      {
        "number": "04",
        "title": "Colour systems, scales and contrast",
        "summary": "How to build a colour palette step by step, and how to prove with numbers that text on it can be read.",
        "contentSnippet": "A colour scale is one family in ordered steps, usually 50 (light) to 900 (dark). Contrast ratio runs from 1:1 to 21:1 and always belongs to a pair of colours. AA: 4.5:1 normal text, 3:1 large text, 3:1 UI parts. AAA: 7:1 and 4.5:1. Formula: (L_lighter + 0.05) / (L_darker + 0.05) with luminance 0.2126R + 0.7152G + 0.0722B on linear values. Never use colour as the only signal. Add text or an icon. Dark mode means choosing new steps from the scales, not inverting."
      },
      {
        "number": "05",
        "title": "Typography, spacing and sizing scales",
        "summary": "A small fixed set of text sizes, gaps and dimensions that makes every screen feel like it was drawn on the same grid.",
        "contentSnippet": "A scale is a short list of allowed values. Pick from it and never invent a number. Use rem for font sizes and spacing so the UI follows the user's font setting. Type scale: base 16px, a ratio such as 1.25, rounded to friendly sizes, each with a line height. Body line height about 1.5 and unitless. Line length about 45 to 75 characters. Spacing scale on a 4px base: space.4 is 16px. Close means related, far means separate. Control heights, radius, shadows, breakpoints and z-index are scales too."
      },
      {
        "number": "06",
        "title": "Figma variables, collections and modes",
        "summary": "Variables are how Figma stores design tokens: named values that can change with a mode such as light or dark.",
        "contentSnippet": "A Figma variable is a design token: Color, Number, String or Boolean. A collection groups variables. A mode is one column of values, such as Light or Dark. Use one collection per tier: Primitives (one mode), Theme (Light, Dark), optional Brand and Layout. Modes are set on a frame or page and inherited by children, like CSS inheritance. Hide and scope primitives so that designers use only semantic variables. Styles are still used for text styles, shadows and gradients. Modes per collection depend on the plan."
      },
      {
        "number": "07",
        "title": "Figma components, variants and auto layout",
        "summary": "Components are reusable design parts, variants are their options, and auto layout is how they stretch and shrink like real CSS.",
        "contentSnippet": "A main component is the original. Instances are linked copies that receive updates. Four property types: Variant, Boolean, Instance swap, Text. They map to React props. Variants multiply. Use Boolean, Text and Instance swap properties to keep the count down. Auto layout is flexbox: direction, gap, padding, alignment, wrap. Hug is fit-content, Fill is flex 1 or stretch, Fixed is an exact size. Bind every value to a variable and use the same names in Figma and in code."
      },
      {
        "number": "08",
        "title": "Exporting tokens and transforming them with Style Dictionary",
        "summary": "How token values leave Figma as JSON, and how one build step turns that JSON into CSS, TypeScript and anything else you need.",
        "contentSnippet": "Export routes: Tokens Studio plugin, the Figma REST API (Enterprise only), or your own plugin. Figma returns colours as r g b a from 0 to 1 and aliases as variable ids. Convert both. Style Dictionary: transforms change single tokens, formats write files, platforms group them. outputReferences: true keeps aliases as var(--...) in the CSS output. Build the dark theme as a second file with a [data-theme=\"dark\"] selector. Never edit generated files. Change the source and rebuild in CI."
      },
      {
        "number": "09",
        "title": "CSS custom properties, theming and dark mode",
        "summary": "CSS variables are how tokens live in the browser, and redefining them on one element is all it takes to switch a theme.",
        "contentSnippet": "A custom property is defined as --name: value and read with var(--name, fallback). Custom properties inherit, follow the cascade and resolve at run time. Theming: redefine the semantic variables under [data-theme=\"dark\"]. Components do not change. Equal specificity means the later rule wins, so load theme overrides after the defaults. Respect prefers-color-scheme, set color-scheme, and save the user's choice. Apply the saved theme in a small head script to avoid a flash of the wrong theme."
      },
      {
        "number": "10",
        "title": "Tailwind CSS v4: the theme as CSS variables",
        "summary": "Tailwind v4 reads your theme from CSS itself, so design tokens become utility classes with a few lines inside @theme.",
        "contentSnippet": "Tailwind v4 is configured in CSS: @import \"tailwindcss\" and @theme { ... }. A theme variable's namespace creates utilities: --color-, --text-, --radius-, --font-. --spacing is 0.25rem, so p-4 is 1rem. It matches a 4px spacing scale. Map semantic tokens in @theme inline so utilities follow nested themes. --color-*: initial removes the default palette. Only your tokens remain. Semantic classes need no dark:. Keep that variant for rare exceptions."
      },
      {
        "number": "11",
        "title": "Accessible React components with Radix UI",
        "summary": "Let Radix handle the hard behaviour (focus, keyboard, ARIA) and put your own tokens and variants on top.",
        "contentSnippet": "Radix Primitives are headless: behaviour and accessibility without styles. Button is a native button plus cva variants. Variant names match the Figma properties. asChild merges props onto your child element through Slot. The child must spread props. Dialog parts: Root, Trigger, Portal, Overlay, Content, Title, Description, Close. Radix manages focus, Escape, roles and state. Dialog.Title is required. Style states with data attributes such as data-[state=active]."
      },
      {
        "number": "12",
        "title": "Interaction states, target size and motion",
        "summary": "A component is not one picture: it is a set of states, and each state must be visible, reachable and calm.",
        "contentSnippet": "Design every state: default, hover, focus-visible, active, disabled, loading, selected, invalid. Focus ring: :focus-visible, a 2px outline, an offset, 3:1 contrast. Never remove it without a replacement. disabled removes focus and events. aria-disabled keeps focus, and you block the action yourself. Loading: aria-busy, block repeat clicks, keep the width and the focus. Target size: at least 24 by 24 CSS px for AA. Aim for about 44 on touch. Motion uses tokens. Respect prefers-reduced-motion by replacing movement with a fade."
      },
      {
        "number": "13",
        "title": "Keyboard navigation, ARIA and focus management",
        "summary": "How people use an interface without a mouse or without sight, and what your components must do for them.",
        "contentSnippet": "Everything must work with the keyboard: Tab moves between controls, arrows move inside a widget, Escape closes. Use native elements first. A button gives focus, keys and a role for free. ARIA changes what is announced, not how things behave. Wrong ARIA is worse than none. Every control needs an accessible name. Icon buttons need aria-label. Manage focus on change: into the dialog, back to the trigger, to the next item after a delete. Announce updates with role=\"status\" or role=\"alert\", in a region that already exists."
      },
      {
        "number": "14",
        "title": "Documenting with Storybook and testing the system",
        "summary": "Storybook shows every component in every state, and automated tests make sure a change does not quietly break looks or accessibility.",
        "contentSnippet": "A story is one component in one state. Stories are docs and test cases at once. Add a theme toolbar with a decorator so every story is checked in light and dark. Docs need purpose, examples, props, do and do not, accessibility notes and tokens. Test layers: token contrast, behaviour, axe, visual regression, manual. Visual regression compares screenshots with a baseline, in a consistent environment. axe finds only rule-based problems. Keyboard and screen reader checks stay necessary."
      },
      {
        "number": "15",
        "title": "Versioning, publishing and governance",
        "summary": "A design system is a product with customers: it needs versions, release notes and clear rules about who can change what.",
        "contentSnippet": "Publish the system as versioned npm packages. React is a peer dependency. Semver: MAJOR breaks, MINOR adds, PATCH fixes. Renaming a token or prop is breaking. Changesets records each change and generates the version bump and the changelog. Deprecate first, give a migration path, remove in the next major. Governance models: centralised, federated, hybrid. Have a written contribution process. A definition of done keeps quality: tokens only, accessible, all states, themes, docs, tests."
      },
      {
        "number": "16",
        "title": "Cheat sheet, interview questions and study plan",
        "summary": "Everything on a few pages for quick revision, plus practice questions and a four-week plan.",
        "contentSnippet": "Pipeline: Figma variables, token JSON, Style Dictionary, CSS variables, Tailwind theme, React components. Three tiers: primitive values, semantic meaning, component scope. Themes change the semantic values. AA numbers: 4.5:1 text, 3:1 large text and UI parts, 24px targets. Native elements first, Radix for complex widgets, :focus-visible rings, reduced motion respected. Storybook documents, tests protect, semver and changelogs communicate. Understand why each step exists. Tools change, the reasoning stays."
      }
    ]
  },
  {
    "id": "kubernetes-docker-cloud-bible",
    "title": "Production Cloud & Kubernetes DevOps Playbook",
    "category": "DevOps & Cloud",
    "pages": 98,
    "fileSize": "2.8 MB",
    "author": "Gautam Pandit",
    "badge": "Essential",
    "badgeColor": "bg-purple-600 text-white",
    "description": "This playbook is for people who know basic Docker and kubectl and now want to run real workloads safely. It explains how containers and Kubernetes work inside, then walks through hardened images, zero-downtime releases, autoscaling, storage, Helm, Terraform for a multi-AZ EKS cluster, GitOps with Argo CD, monitoring and security, all with commented manifests. It does not replace practice on a real cluster, so every chapter gives commands you should run yourself, and the book ends with a troubleshooting runbook, a cheat sheet, interview questions and a study plan.",
    "tags": [
      "Kubernetes",
      "Docker",
      "Terraform",
      "AWS EKS",
      "ArgoCD"
    ],
    "chapters": [
      {
        "number": "01",
        "title": "Containers from the inside",
        "summary": "A container is not a small virtual machine. It is a normal Linux process with three clever restrictions.",
        "contentSnippet": "A container is a normal Linux process, not a small VM. It shares the host kernel. Namespaces control what it sees: processes, network, files, hostname. Cgroups control what it uses. Too much memory means killed, too much CPU means slowed down. An image is a stack of read-only layers. A container adds one thin writable layer that is lost on removal. The chain is dockerd or kubelet, then containerd, then runc. Formats are OCI standards. Root inside a container is root for the kernel, so always run as non-root."
      },
      {
        "number": "02",
        "title": "Hardened images and multi-stage Dockerfiles",
        "summary": "Build images that are small, repeatable, scanned and run as a normal user.",
        "contentSnippet": "Multi-stage: build in a full image, run in a slim or distroless image with only the output. Order layers from stable to changing: base, dependency lists, install, source, build. Always add .dockerignore, a non-root USER with a numeric ID, and exec-form CMD. Pin base versions and tag your images with the Git commit, never latest. A secret copied into any layer stays in the image forever. Scan every build and rebuild on a schedule, because new CVEs appear in old packages."
      },
      {
        "number": "03",
        "title": "Kubernetes architecture and core workloads",
        "summary": "How the cluster thinks: you write the wanted state, and control loops work until reality matches it.",
        "contentSnippet": "Kubernetes is declarative: you store the desired state and controllers reconcile reality to it. Control plane: API server, etcd, scheduler, controller manager. Nodes: kubelet, kube-proxy, runtime. All parts talk only to the API server and watch it for changes. A Pod is disposable: new name and new IP every time it is replaced. Deployment creates ReplicaSets (one per version), and a ReplicaSet keeps N Pods alive. Labels and selectors link objects. Keep selectors small and stable."
      },
      {
        "number": "04",
        "title": "Services, Ingress and DNS",
        "summary": "How traffic finds the right pods when pod addresses keep changing.",
        "contentSnippet": "Pod IPs change. A Service gives one stable IP and DNS name in front of ready pods. A Service finds pods by label selector. Empty EndpointSlices mean a label or readiness problem. port is the Service port, targetPort is the container port. Prefer named ports. DNS name: service.namespace.svc.cluster.local. The short name works in the same namespace. Ingress routes HTTP by host and path, and needs an Ingress controller to do anything. Gateway API is the newer model: Gateway plus HTTPRoute."
      },
      {
        "number": "05",
        "title": "ConfigMaps and Secrets",
        "summary": "Keep settings outside the image, and know exactly how safe a Kubernetes Secret really is.",
        "contentSnippet": "Configuration lives outside the image: ConfigMap for normal settings, Secret for sensitive ones. Inject as environment variables (simple) or as mounted files (whole files, can update live). Changing a ConfigMap does not restart pods. Use kubectl rollout restart or a checksum annotation. base64 is encoding, not encryption. Anyone with read access can decode a Secret. Never commit Secret manifests. Keep the real values in a secret manager. A missing ConfigMap or Secret gives CreateContainerConfigError."
      },
      {
        "number": "06",
        "title": "Requests, limits, QoS and probes",
        "summary": "Tell Kubernetes how much your app needs and how to check its health, or it will guess wrongly.",
        "contentSnippet": "Request is the reserved amount used for scheduling. Limit is the hard cap at run time. Over a CPU limit means throttled. Over a memory limit means OOMKilled. The scheduler uses requests only. Oversized requests fill nodes that are actually idle. QoS: Guaranteed, Burstable, BestEffort. BestEffort pods are evicted first. Readiness removes the pod from traffic. Liveness restarts it. Startup protects slow starts. Keep liveness simple and local. Never check shared dependencies in it."
      },
      {
        "number": "07",
        "title": "Rolling updates, rollbacks and zero downtime",
        "summary": "Release a new version while users keep working, and go back quickly when it is bad.",
        "contentSnippet": "Rolling update: new pods in, old pods out, step by step. maxSurge is extra, maxUnavailable is missing. maxSurge: 1 with maxUnavailable: 0 keeps full capacity during a release. A failing readiness probe stops a bad rollout before users are hurt. kubectl rollout undo is fast because the old ReplicaSet is kept. It does not undo config or database changes. Pod stop: endpoint removal and SIGTERM start together, so add a preStop pause and handle SIGTERM. A PDB protects against planned node drains, not against crashes. It needs 2 or more replicas."
      },
      {
        "number": "08",
        "title": "Autoscaling and cost basics",
        "summary": "Match the number of pods and nodes to the real load, because every idle core is money.",
        "contentSnippet": "HPA adds pods, VPA resizes pods, the node autoscaler adds nodes when pods are Pending. HPA formula: ceil(current replicas x current value / target value), within min and max. HPA needs the metrics server and CPU requests. Remove replicas from the manifest. Scaling takes time, so keep headroom and a sensible minReplicas. You pay for nodes, and nodes follow requests. Right-sizing requests is the biggest saving. Hidden costs: load balancers, NAT gateways, cross-zone traffic, unused volumes, logs."
      },
      {
        "number": "09",
        "title": "StatefulSets and storage",
        "summary": "Pods are disposable, data is not. Learn how Kubernetes attaches disks that outlive pods.",
        "contentSnippet": "Container filesystems are temporary. Real data goes on a PersistentVolume through a PVC. StorageClass plus CSI driver create disks on demand (dynamic provisioning). Cloud disks are usually ReadWriteOnce and tied to one zone. Use WaitForFirstConsumer. StatefulSet gives stable pod names, stable DNS names and one PVC per pod, in order. A StatefulSet does not replicate data. Use an operator or a managed database. reclaimPolicy: Delete removes the disk with the PVC. Volumes are not backups."
      },
      {
        "number": "10",
        "title": "Helm charts and values",
        "summary": "Package your manifests once and install them many times with different settings.",
        "contentSnippet": "A chart is templates plus default values. A release is one installed copy with numbered revisions. Values merge in order: chart defaults, then -f files, then --set. The last one wins. Always run helm template (and helm lint) before an upgrade to see the real YAML. helm upgrade --install works for first install and every later change. A checksum annotation on the pod template restarts pods when config changes. No secrets in values files, and pin chart versions."
      },
      {
        "number": "11",
        "title": "Terraform for a multi-AZ VPC and EKS",
        "summary": "Describe your cloud network and cluster in code, so you can review it, repeat it and rebuild it.",
        "contentSnippet": "Terraform: write HCL, init, plan, review, apply. The plan is the safety step. Read the plan summary and every - and -/+ line before approving. State maps code to real resources. Keep it remote, locked, encrypted, and out of Git. Production network: 3 zones, public subnets for load balancers, private subnets for nodes, NAT for outbound. On EKS each pod takes a VPC IP, so make private subnets large. Pin module and provider versions. Never change Terraform-managed resources by hand."
      },
      {
        "number": "12",
        "title": "CI/CD with GitHub Actions and GitOps with Argo CD",
        "summary": "From a Git commit to running pods, with no human typing kubectl and no cluster password in the pipeline.",
        "contentSnippet": "CI tests, builds, scans and pushes an image tagged with the commit. It does not touch the cluster. Use OIDC for cloud login from CI. No long-lived keys in secrets. GitOps: Git holds the desired state, an in-cluster agent pulls and reconciles it. Argo CD Application = source (repo, revision, path) + destination (cluster, namespace) + sync policy. Sync status says \"matches Git\", health status says \"works\". Read both. selfHeal undoes manual changes, prune deletes removed objects, and rollback is git revert."
      },
      {
        "number": "13",
        "title": "Observability with Prometheus, Grafana and logs",
        "summary": "See what your system is doing, get woken up only for real problems, and find the cause quickly.",
        "contentSnippet": "Metrics are numbers over time for trends and alerts. Logs are detailed events for investigation. Four golden signals: latency, traffic, errors, saturation. Prometheus pulls: apps expose /metrics, Prometheus scrapes on an interval. Counter with rate(), gauge directly, histogram with histogram_quantile(). An alert is an expression plus a for time. Page on user symptoms and link a runbook. Log JSON to stdout, ship with a node agent, and keep label values few."
      },
      {
        "number": "14",
        "title": "Security: RBAC, NetworkPolicy and Pod Security",
        "summary": "Assume one part will be broken into, and make sure the damage stops there.",
        "contentSnippet": "Security goal: limit the blast radius with several layers (defence in depth). RBAC: subject + verb + resource. Role is per namespace, ClusterRole is cluster-wide, bindings grant them. Reading Secrets and creating Pods are admin-level permissions. Test with kubectl auth can-i. NetworkPolicy: default deny, then allow DNS and exact peers. The network plugin must enforce it. Pod Security restricted: non-root, no privilege escalation, drop all capabilities, seccomp default. Use IAM roles for pods instead of static keys, and a secret manager for real secrets."
      },
      {
        "number": "15",
        "title": "Troubleshooting runbook",
        "summary": "A fixed order of commands for the four most common pod failures, so you do not have to think at 3 a.m.",
        "contentSnippet": "Order: get, describe, logs --previous, events, then debug. Do not delete first. Pending: a scheduling problem. Read the FailedScheduling event. ImagePullBackOff: wrong name or tag, missing registry access, or no network to the registry. CrashLoopBackOff: the process exits. Logs of the previous container and the exit code tell why. OOMKilled (exit 137): over the container's memory limit. Decide between \"limit too low\" and \"leak\". In an incident: mitigate first, change one thing at a time, keep evidence, write it up."
      },
      {
        "number": "16",
        "title": "Cheat sheet, interview questions and study plan",
        "summary": "Everything from the playbook on a few pages, plus a plan to make it stick.",
        "contentSnippet": "Debug order: get, describe, logs --previous, events, then debug. Zero downtime: readiness probe, maxUnavailable: 0, graceful shutdown, PDB, compatible database changes. Requests drive scheduling and cost. Limits protect the node. Memory over the limit means OOMKilled. Git is the source of truth: Terraform for the platform, Argo CD for the apps, rollback by git revert. Watch the four golden signals and page only on user-facing symptoms. Learn by breaking things on a test cluster, one failure at a time."
      }
    ]
  },
  {
    "id": "system-design-interview-cheatsheet",
    "title": "High-Scale System Design & Architecture Cheatsheet",
    "category": "System Design & DSA",
    "pages": 105,
    "fileSize": "3.0 MB",
    "author": "Gautam Pandit",
    "badge": "All-Time Favorite",
    "badgeColor": "bg-amber-600 text-white",
    "description": "A practical cheat sheet for system design interviews. It gives you a timed step-by-step framework, estimation formulas with every calculation shown, decision tables for caches, databases, queues and consistency, and five designs worked from requirements to trade-offs. All numbers in it are rough teaching values that you should state as assumptions, not facts about any real company.",
    "tags": [
      "System Design",
      "Distributed Systems",
      "Caching",
      "Kafka",
      "PostgreSQL"
    ],
    "chapters": [
      {
        "number": "01",
        "title": "The interview framework",
        "summary": "Seven steps and a time budget, so that you always know what to say next.",
        "contentSnippet": "Seven steps: requirements, estimation, API, data model, high-level design, deep dives, trade-offs. In 45 minutes: about 19 minutes for the first four steps, 10 for the diagram, 12 for deep dives, 4 to close. Functional requirements say what the system does; non-functional say how well. Say the requirement first, then the tool that solves it. Start with the simplest design and add a box only when a number forces you to. For every choice say the gain and the cost."
      },
      {
        "number": "02",
        "title": "Back-of-the-envelope estimation",
        "summary": "Quick maths that tells you how big the system is, with every calculation shown.",
        "contentSnippet": "2^10 is about a thousand, 2^20 a million, 2^30 a billion, 2^40 a trillion. One day has 86,400 seconds; 1 million per day is about 12 per second. QPS = DAU x actions per day / 86,400; peak is 2 to 3 times the average. Storage = writes per day x item size x 365 x years x copies. Bandwidth = QPS x payload size; multiply bytes by 8 to get bits. Latency numbers are rough: memory is far faster than disk, and distance costs the most."
      },
      {
        "number": "03",
        "title": "Load balancing, CDN and blob storage",
        "summary": "How requests are shared across servers, and how big files are kept away from them.",
        "contentSnippet": "A load balancer spreads requests and removes unhealthy servers using health checks. Layer 4 routes by address and port; layer 7 reads HTTP and can route by path. Least connections suits uneven requests; hashing a key keeps the same key on the same server. Stateless servers beat sticky sessions; keep sessions in a shared store or a token. A CDN serves files from an edge near the user; use versioned file names and long TTLs. Store file bytes in blob storage, metadata in the database, and upload with pre-signed URLs."
      },
      {
        "number": "04",
        "title": "Caching",
        "summary": "Keep the answer close so you do not compute it again: patterns, eviction, invalidation and Redis Cluster basics.",
        "contentSnippet": "Average latency = hit ratio x cache time + miss ratio x (cache time + database time). Cache-aside is the default: read cache, on a miss read the database and fill the cache. On a write: update the database first, then delete the key, and always keep a TTL. Write-through keeps the cache fresh; write-behind is fastest but can lose data. Stop stampedes with a lock, TTL jitter or serving stale data during refresh. Redis Cluster: 16,384 slots, slot = CRC16(key) mod 16384, hash tags keep keys together."
      },
      {
        "number": "05",
        "title": "Choosing a database, indexes and search",
        "summary": "A decision table for SQL against NoSQL, how indexes make queries fast, and when you need a search engine.",
        "contentSnippet": "Start with SQL; move a part to NoSQL only when you can name the limit you hit. SQL gives joins and ACID transactions; NoSQL gives easier horizontal scaling and flexible shapes. A composite index works left to right: (a, b) helps filters on a or on a and b, not on b alone. Every index speeds reads and slows writes. Use keyset pagination instead of deep OFFSET. Search uses an inverted index kept in sync by CDC; it is an eventually consistent copy."
      },
      {
        "number": "06",
        "title": "Replication, sharding and consistent hashing",
        "summary": "Copies for safety and reads, splits for size and writes, and a ring that keeps moves small.",
        "contentSnippet": "Replication copies the same data for safety and reads; sharding splits data for size and writes. Asynchronous replication is fast but can lose the newest writes and shows stale reads. Fix \"I cannot see my own write\" by reading your own data from the leader for a short time. A good shard key has many values, even traffic, and appears in most queries. hash mod N moves almost every key when N changes; consistent hashing moves about 1/(N+1). Virtual nodes make the shares on the ring even."
      },
      {
        "number": "07",
        "title": "CAP, PACELC, consistency and quorum",
        "summary": "What you must give up when machines cannot talk, and the R + W > N rule with worked numbers.",
        "contentSnippet": "CAP: during a network partition you choose consistency (refuse) or availability (answer, maybe stale). PACELC adds: even without a partition you trade latency against consistency. Consistency is a ladder: strong, causal, read-your-writes, monotonic reads, eventual. Quorum rule: R + W > N makes every read overlap the latest write. Writes survive N - W failures, reads survive N - R. Use odd cluster sizes: 3 tolerates 1 failure, 5 tolerates 2."
      },
      {
        "number": "08",
        "title": "Queues, streams and fan-out",
        "summary": "Kafka against RabbitMQ, delivery guarantees, idempotency keys, the outbox pattern and sagas.",
        "contentSnippet": "A queue decouples services, buffers spikes and moves slow work out of the request. Queue: message removed after ack. Stream: an ordered log kept for a retention time and replayable. Kafka orders messages only inside a partition; the key chooses the partition. At-least-once delivery plus an idempotent consumer gives an exactly-once effect. Outbox: write the event in the same transaction as the data; a relay publishes it. Saga: a chain of local transactions with compensating actions to undo on failure."
      },
      {
        "number": "09",
        "title": "Rate limiters and unique IDs",
        "summary": "Two small building blocks that appear in almost every design: how to say \"slow down\", and how to name things across many machines.",
        "contentSnippet": "Fixed window is simple but allows a double burst at the edge of two windows. Token bucket: capacity sets the burst, refill rate sets the average; store only tokens and last time. Sliding window counter: previous count x remaining share + current count. With many servers, keep counters in a shared store and update them atomically. Reject with 429 and Retry-After; decide fail open or fail closed. Snowflake-style ID: 41 bits time, 10 bits machine, 12 bits sequence; sortable by time."
      },
      {
        "number": "10",
        "title": "Reliability and availability maths",
        "summary": "Timeouts, retries with backoff and jitter, circuit breakers, and how to calculate the nines.",
        "contentSnippet": "Every network call needs a timeout; a slow dependency is worse than a dead one. Retry with exponential backoff and jitter, at one layer only, and only idempotent operations. Circuit breaker: closed, open (fail fast), half-open (one trial call). 99.9% is 8.76 hours of downtime a year; 99.99% is 52.56 minutes. Series: multiply availabilities. Parallel: 1 - (1 - A)^n. The parallel formula assumes independent failures, so spread copies across zones."
      },
      {
        "number": "11",
        "title": "Worked design: URL shortener",
        "summary": "A read-heavy key-value system: turn a long link into seven characters and redirect quickly.",
        "contentSnippet": "Read-heavy key lookup: cache-aside in front of a table sharded by code. 62^7 is about 3.5 trillion codes; check the code length against total links. Counter in blocks gives collision-free codes without a database check per write. Scramble the counter to hide the sequence, but do not call it security. 302 keeps click counts accurate; 301 lowers load but hides repeat clicks. Count clicks through a queue so that redirects stay fast."
      },
      {
        "number": "12",
        "title": "Worked design: news feed",
        "summary": "Showing each user recent posts from the people they follow, and deciding who pays: the writer or the reader.",
        "contentSnippet": "Push (fan-out on write) makes reads cheap; pull (fan-out on read) makes writes cheap. Hybrid: push for normal authors, pull and merge for authors with huge followings. Feeds hold only post IDs; hydrate them from a post cache at read time. Fan-out is asynchronous through a stream, so posts arrive a few seconds late. The feed cache can be rebuilt from posts and follows; it is not the source of truth. Skip inactive users and filter deleted posts at read time."
      },
      {
        "number": "13",
        "title": "Worked design: chat system",
        "summary": "Millions of open connections, messages that must arrive once and in order, and users who go offline.",
        "contentSnippet": "Chat needs long-lived WebSocket connections held by stateful gateway servers. A session registry with TTL maps each online user to a gateway. The server assigns a per-chat sequence number; never order by device clocks. Store first, then confirm; the sender retries with a client_msg_id so repeats are harmless. Push is the fast path; sync by seq on reconnect is the guarantee. Store a group message once and fan out only the delivery."
      },
      {
        "number": "14",
        "title": "Worked design: notification service",
        "summary": "One service that sends push, SMS and email for every team, without duplicates and without delaying urgent messages.",
        "contentSnippet": "Accept requests quickly with 202, save them, and do the sending from queues. A unique idempotency key stops duplicates from caller retries and queue redelivery. Separate lanes per priority and per channel keep urgent messages fast and isolate slow providers. Workers check preferences, quiet hours and a per-user cap before sending. Retry temporary provider errors with backoff; delete invalid tokens; use a dead letter queue. A provider timeout means \"unknown\", so duplicates at that edge are a trade-off to state."
      },
      {
        "number": "15",
        "title": "Worked design: ride matching",
        "summary": "Finding the nearest free driver from a stream of moving locations, and never giving one driver two rides.",
        "contentSnippet": "Two workloads: a flood of locations (memory, latest value only) and a few exact rides (SQL). Cut the map into cells and search only the rider's cell and its neighbours. A TTL on each location removes drivers who stop sending updates. Use a short lock per driver while an offer is open, so two matchers do not ask the same driver. A partial unique index allows only one active ride per driver: the database is the final guard. Model the trip as a state machine and check the expected state in every update."
      },
      {
        "number": "16",
        "title": "One-page cheat sheet, questions and study plan",
        "summary": "Everything worth remembering on a few pages, a set of practice questions, and a four-week plan.",
        "contentSnippet": "Follow the seven steps with a time budget, and announce each step. Do the maths, then say what the number means for the design. For each requirement, name the building block and its cost. At-least-once plus idempotency, outbox instead of dual writes, constraints as the final guard. For every box ask: what if it is slow, and what if it dies? Close with the path, the main trade-off, the weakest point and the next step."
      }
    ]
  },
  {
    "id": "react-native-expo-production-handbook",
    "title": "Cross-Platform Mobile Pro: React Native & Expo Guide",
    "category": "Full-Stack Web Dev",
    "pages": 101,
    "fileSize": "3.3 MB",
    "author": "Gautam Pandit",
    "badge": "Mobile Spec",
    "badgeColor": "bg-teal-600 text-white",
    "description": "Learn how React Native and Expo really work, from the JS thread and UI thread to a published app on the Play Store and App Store. Each chapter explains one production topic in plain language with commented code, dry runs, common mistakes and interview questions with model answers. Expo changes with every SDK release, so this handbook teaches the stable ideas and tells you where to check the current Expo docs.",
    "tags": [
      "React Native",
      "Expo",
      "Reanimated 3",
      "Mobile",
      "iOS/Android"
    ],
    "chapters": [
      {
        "number": "01",
        "title": "How React Native works",
        "summary": "What really happens between your JavaScript code and the pixels on the phone, and why it is not a website inside an app.",
        "contentSnippet": "React Native draws real native views. It is not a WebView and there is no DOM. The JS thread runs your React code. The UI thread draws and handles touches. At 60 frames per second, each frame has about 16.7 ms. Slow work drops frames. A blocked JS thread makes taps feel dead, but native scrolling can still move. New Architecture: JSI (direct calls), Fabric (renderer), TurboModules (lazy native modules). Hermes is the default JavaScript engine and runs precompiled bytecode."
      },
      {
        "number": "02",
        "title": "Setting up with Expo",
        "summary": "Create a project, run it on your own phone in minutes, and understand Expo Go, development builds and production builds.",
        "contentSnippet": "Expo is a framework on top of React Native: template, libraries, router and build service. npx create-expo-app@latest creates the project, npx expo start runs Metro. Expo Go is a fixed sandbox. A development build is your own app with any native library. Use npx expo install so library versions match your Expo SDK. JavaScript change: reload. Native change (new native library, app config): rebuild. EXPO_PUBLIC_ variables are visible to everyone. Keep secrets on the server."
      },
      {
        "number": "03",
        "title": "Core components, Flexbox and styling",
        "summary": "The building blocks of every screen, how layout works on a phone, and how to handle notches and platform differences.",
        "contentSnippet": "All text must be inside Text. Watch out for {count && ...} when count is 0. Styles are JavaScript objects with unitless numbers. There is no inheritance and no cascade. Flexbox default direction is column. flex: 1 means fill the free space. A blank screen often means a parent without flex: 1 or a height. Use react-native-safe-area-context for notches and gesture bars on both platforms. Use Platform.OS, Platform.select or .ios.tsx and .android.tsx files for differences."
      },
      {
        "number": "04",
        "title": "Lists with FlatList",
        "summary": "How to show hundreds or thousands of rows smoothly, with pull to refresh and infinite scroll.",
        "contentSnippet": "ScrollView builds everything. FlatList builds only the rows near the screen. renderItem receives { item, index }. Use a real ID in keyExtractor, never the index. refreshing with onRefresh gives pull to refresh. onEndReached gives infinite scroll. Wrap rows in memo, keep renderItem stable, use getItemLayout for fixed heights. Never nest a vertical FlatList in a vertical ScrollView. Use ListHeaderComponent. Measure list speed in a release build on a slow phone."
      },
      {
        "number": "05",
        "title": "Text input, keyboard and forms",
        "summary": "How to take typed input on a phone without the keyboard hiding your fields, and how to validate a form properly.",
        "contentSnippet": "onChangeText gives the string directly. There is no event.target.value. Choose keyboardType, autoCapitalize, autoCorrect and secureTextEntry for each field. Use ref and onSubmitEditing to jump to the next field. KeyboardAvoidingView plus ScrollView keeps fields visible. Test on both platforms. keyboardShouldPersistTaps=\"handled\" makes buttons work on the first tap. React Hook Form with Controller handles values, rules, errors and submit state."
      },
      {
        "number": "06",
        "title": "Navigation with Expo Router",
        "summary": "Screens as files: stacks, tabs, dynamic routes, modals, typed links and protected routes.",
        "contentSnippet": "Files in app/ are screens. _layout.tsx wraps its siblings in a Stack or Tabs. (group) folders organise files without changing the URL. [id].tsx is a dynamic route. Navigate with Link or useRouter(): push, replace, back. Params are strings. Pass an ID, not a whole object. A modal is a stack screen with presentation: 'modal'. Protect a group with a layout that redirects when there is no user. The server still checks."
      },
      {
        "number": "07",
        "title": "State and data fetching",
        "summary": "Where to keep each kind of data, and how TanStack Query handles loading, errors, caching and refreshing for you.",
        "contentSnippet": "Local UI state: useState. Shared client state: Context or Zustand. Server state: TanStack Query. fetch does not throw on 404 or 500. Check res.ok and throw yourself. Build four states for every data screen: loading, error, empty and success. The query key is the cache address. Put every input of the request into it. After a mutation, call invalidateQueries so screens load the new data. On mobile, connect onlineManager to NetInfo and focusManager to AppState."
      },
      {
        "number": "08",
        "title": "Local storage and offline-first",
        "summary": "Where to save data on the phone, which storage is safe for secrets, and how to make an app that keeps working without internet.",
        "contentSnippet": "AsyncStorage: unencrypted strings for small settings. Use JSON.stringify for objects. SecureStore: encrypted by the system, for small secrets such as tokens. expo-sqlite: a real database for large, structured data. Always use ? placeholders. Offline-first: write to the local database first, queue the change, sync later. Write the data row and the outbox row in one transaction. Use client-made UUIDs and idempotency keys so that retries do not create duplicates."
      },
      {
        "number": "09",
        "title": "Gestures and animations with Reanimated",
        "summary": "Smooth, finger-following motion that runs on the UI thread, with a full swipe-to-dismiss card example.",
        "contentSnippet": "Gesture Handler recognises touches. Reanimated animates on the UI thread. A shared value (useSharedValue) is read with .value and does not cause re-renders. useAnimatedStyle builds a style from shared values. Use it on Animated.View. withTiming is duration based. withSpring is physics based and feels natural. Worklets run on the UI thread. Use runOnJS to call React code from them. Wrap the app in GestureHandlerRootView with flex: 1."
      },
      {
        "number": "10",
        "title": "Images, camera and permissions",
        "summary": "Show pictures efficiently, let the user pick or take a photo, and ask for permissions in a way users accept.",
        "contentSnippet": "A remote image needs explicit dimensions, or it is invisible. expo-image adds caching, placeholders and transitions. Load images at display size. Ask for a permission when the feature is used, and explain why first. On iOS the system dialog appears once. After that, send the user to Settings. result.canceled and result.assets[0].uri are the two things to read from the picker. Upload with FormData and do not set the Content-Type header yourself."
      },
      {
        "number": "11",
        "title": "Push notifications",
        "summary": "How a message travels from your server to a locked phone, how to set it up with expo-notifications, and what push cannot promise.",
        "contentSnippet": "Remote push goes: your server, then APNs or FCM (often through Expo), then the phone. Flow in the app: permission, token, send the token to your server, handle taps. Android needs a notification channel. Remote push needs a real device and a development build. Store many tokens per user, refresh them, and delete them on logout and on DeviceNotRegistered. Push is best effort. Use it as a signal and fetch the real data from the API. Ask for permission at a useful moment, not on the first screen."
      },
      {
        "number": "12",
        "title": "Authentication with secure token storage",
        "summary": "A complete login flow: tokens, safe storage, automatic refresh, protected screens and a clean logout.",
        "contentSnippet": "An access token is short-lived and goes with each request. A refresh token only gets new access tokens. Store tokens in SecureStore, never in AsyncStorage. One API helper adds the Authorization header and handles 401 with refresh and one retry. Share a single refresh promise so parallel requests do not refresh many times. Use isLoading so the login screen does not flash while the session is restored. Logout: cancel on the server, delete tokens, clear caches and remove the push token."
      },
      {
        "number": "13",
        "title": "Performance",
        "summary": "Why apps feel slow, how to measure it properly, and the small set of fixes that solve most problems.",
        "contentSnippet": "Measure in a release build on a slow phone. Development mode is much slower. A component renders when its state, its parent or a context it reads changes. First fix: move state down. Then use memo with stable props on heavy children. memo is useless if you pass new objects or functions as props on every render. JS frame rate low: too much JavaScript. UI frame rate low: too much to draw. Remove listeners and timers in the useEffect cleanup, and keep the root layout light for a fast start."
      },
      {
        "number": "14",
        "title": "Testing",
        "summary": "How to check your app automatically with Jest and React Native Testing Library, so that a new feature does not quietly break an old one.",
        "contentSnippet": "Jest runs the tests. RNTL renders components and lets you act like a user. Use the jest-expo preset in an Expo project. Every test: arrange, act, assert. getBy throws, queryBy returns null, findBy waits for async results. Mock the network and native modules. Never call the real server from a test. Test what the user sees, and keep only a few end-to-end tests for critical flows."
      },
      {
        "number": "15",
        "title": "Builds, releases and updates with EAS",
        "summary": "From code on your laptop to an app in the Play Store and App Store, plus fast JavaScript updates without a new store release.",
        "contentSnippet": "EAS Build makes signed builds, EAS Submit uploads them, EAS Update sends JavaScript updates. Profiles in eas.json: development (you), preview (testers), production (stores). APK is for direct install. AAB is for the Play Store. version is for users. The build number must increase with every upload. OTA changes only JavaScript and assets. A native change needs a new store build. An update reaches only builds with the same channel and the same runtime version."
      },
      {
        "number": "16",
        "title": "Cheat sheet, interview questions and study plan",
        "summary": "Everything on a few pages: quick tables to revise, the questions interviewers ask, and a six-week plan to build a real app.",
        "contentSnippet": "React Native runs your JavaScript on the JS thread and draws real native views on the UI thread. Expo gives you the router, the libraries and EAS. Use a development build for real work. Server data goes to TanStack Query, secrets to SecureStore, large local data to SQLite. Animations and gestures belong on the UI thread with Reanimated worklets. A native change needs a rebuild. A JavaScript change needs only a reload or an OTA update. Build one real app, test it on a real slow phone, and ship it."
      }
    ]
  },
  {
    "id": "dsa-patterns-mastery-sheet",
    "title": "DSA Mastery & Algorithm Patterns Cheatsheet",
    "category": "System Design & DSA",
    "pages": 111,
    "fileSize": "4.0 MB",
    "author": "Gautam Pandit",
    "badge": "Most Popular",
    "badgeColor": "bg-amber-500 text-white",
    "description": "A pattern-first handbook for coding interviews. Each chapter covers one pattern family: the clues that tell you when to use it, a reusable Python template that was run and tested, and worked problems with step-by-step dry runs. It ends with a one-page master cheat sheet, a list of well-known classic problems to practise for each pattern, and a study plan.",
    "tags": [
      "DSA",
      "Algorithms",
      "Dynamic Programming",
      "Graphs",
      "LeetCode"
    ],
    "chapters": [
      {
        "number": "01",
        "title": "How to read a problem and pick a pattern",
        "summary": "Before you write code, read the clues: the constraints tell you how fast you must be, and the words tell you which pattern fits.",
        "contentSnippet": "Read the constraints first: the largest n tells you the complexity you need. n up to 20 allows O(2^n). n up to 100,000 needs O(n log n) or better. Signal words give a first guess: \"longest subarray\" is a window, \"k largest\" is a heap. Ask what the brute force repeats, then pick the tool that removes it. Check the condition of the pattern before you trust it: one word is not proof. Negative numbers break a sum window. Use prefix sums with a hash map."
      },
      {
        "number": "02",
        "title": "Two pointers",
        "summary": "Two indexes that move in a planned way, so one pass does the work of two nested loops.",
        "contentSnippet": "Opposite ends: sorted data or compare-the-ends tasks. Move the pointer that can improve the answer. Same direction: write marks the next free place, read scans. In place, O(1) space. Fast and slow: 1 step and 2 steps. If they meet, there is a cycle. Cycle start: after the meeting, restart one pointer at the head and move both by 1. Every pointer only moves forward, so the total time is O(n). Check your loop condition on arrays of size 1 and 2."
      },
      {
        "number": "03",
        "title": "Sliding window",
        "summary": "Keep a moving range over the array, add what enters, remove what leaves, and never recount from zero.",
        "contentSnippet": "A window is a continuous range [left, right]. It works for subarrays and substrings only. Fixed window: one item enters, the item at right - k leaves. Longest: shrink while the window is invalid, record after the loop. Shortest: shrink while the window is valid, record inside the loop. Counting: add right - left + 1 for every right. A sum window needs positive numbers. left never moves backwards."
      },
      {
        "number": "04",
        "title": "Prefix sums and hashing",
        "summary": "Store what you have already seen, so a question about a range or a partner becomes one lookup.",
        "contentSnippet": "prefix[i] is the sum of the first i items. Range sum = prefix[j + 1] - prefix[i]. Subarray sum equals k: look up prefix - k in a hash map of earlier prefix sums. Start the map with {0: 1} for counting, or {0: -1} for lengths. Counting stores \"how many times\". Longest stores \"first index\". Turn \"equal 0s and 1s\" into \"sum is 0\" by treating 0 as -1. If the inner loop only searches for a value, replace it with a set or dict."
      },
      {
        "number": "05",
        "title": "Binary search",
        "summary": "Cut the search space in half at every step, on a sorted array or on a range of possible answers.",
        "contentSnippet": "Binary search needs a monotonic question: the answers switch from no to yes only once. Template: while lo < hi, mid = (lo + hi) // 2, hi = mid if ok, else lo = mid + 1. hi = mid goes with rounding down. lo = mid goes with rounding up. Lower bound finds the first index with a value >= target. Do not stop at the first match. Rotated array: one half is always sorted. Check whether the target is inside it. \"Minimum value that works\": binary search the answer range with a greedy ok function."
      },
      {
        "number": "06",
        "title": "Stack and monotonic stack and queue",
        "summary": "A stack remembers the most recent unfinished thing, and a monotonic stack finds the next bigger or smaller item for every position in one pass.",
        "contentSnippet": "Stack is LIFO: use it when the most recent open item must be handled first. Brackets: push openers, pop and compare on closers, and the stack must be empty at the end. Monotonic stack: pop while the top breaks the order. The new item is the answer for each popped item. Next greater uses a decreasing stack. Next smaller uses an increasing stack. Store indexes, not values. Each index is pushed and popped once, so the time is O(n). Window maximum: a deque with falling values, and the front is the maximum."
      },
      {
        "number": "07",
        "title": "Linked list tricks",
        "summary": "Four small tricks (dummy node, reversal, gap pointers, fast and slow) solve almost every linked list problem.",
        "contentSnippet": "A dummy node before the head removes special cases. Return dummy.next. Reverse: save nxt, turn the arrow, move prev, move cur. In that order. N-th from the end: open a gap of n, then move both pointers together. Middle and cycle: fast and slow pointers. Hard problems combine the tricks: find the middle, reverse a half, merge. Test an empty list, one node, two nodes, and a changed head."
      },
      {
        "number": "08",
        "title": "Trees",
        "summary": "Almost every tree problem is one recursive question: what do I need from my left child and my right child?",
        "contentSnippet": "Think about one node only: base case, ask the children, combine, return. Preorder passes information down. Postorder collects answers from the children. Inorder of a BST is sorted. BFS with a queue: for _ in range(len(queue)) handles exactly one level. Many problems return one value (height) and update another (best answer). BST rule is about whole subtrees: pass a (low, high) range down. Time O(n). DFS space is the height, BFS space is the widest level."
      },
      {
        "number": "09",
        "title": "Heaps: top-k, k-way merge and two heaps",
        "summary": "A heap hands you the smallest (or largest) item at once, which is all you need for \"top k\", \"merge k\" and \"running median\" problems.",
        "contentSnippet": "A heap gives the smallest item in O(1) and push or pop in O(log n). Python has only a min-heap. Push negatives for a max-heap. K largest: min-heap of size k, pop when the size exceeds k. Time O(n log k). K-way merge: one item per list in the heap, pop and push the next from the same list. Running median: a max-heap for the small half and a min-heap for the large half. Put tuples in the heap, with the priority first and a tie-breaker second."
      },
      {
        "number": "10",
        "title": "Intervals and greedy",
        "summary": "Sort the intervals first, then make one simple safe choice at each step and never look back.",
        "contentSnippet": "Always sort intervals first: by start to merge, by end to keep the most. After sorting by start, the next interval overlaps if next.start <= current.end. Extend with max(current_end, new_end), because one interval may contain another. Earliest end first keeps the most non-overlapping intervals. Minimum rooms: sort by start and keep a min-heap of end times. Greedy needs a reason (exchange argument). Test it on a tricky small input."
      },
      {
        "number": "11",
        "title": "Backtracking",
        "summary": "Build the answer one choice at a time, go deeper, and undo the choice when you come back.",
        "contentSnippet": "Three lines in a loop: choose, explore, un-choose. Subsets: pass start = i + 1. Permutations: use a used list. Reuse allowed: pass i. Save a copy with path[:]. Every append needs its pop. Prune early: sort the input and break when a choice is already too big. Duplicates in the input: sort, then skip nums[i] == nums[i - 1] when i > start. Subsets cost O(n  2^n), permutations O(n  n!). The input must be small."
      },
      {
        "number": "12",
        "title": "Graphs 1: BFS, DFS and grids",
        "summary": "A graph is things and the connections between them, and BFS and DFS are the two ways to walk through it.",
        "contentSnippet": "Build an adjacency list from the edge list. A grid is a graph with four neighbours per cell. BFS uses a queue and gives the fewest steps when all edges cost the same. Mark nodes visited when you push them, not when you pop them. Count components: start a DFS or BFS from every node that is still unvisited. Many starts spreading together: put them all in the queue first (multi-source BFS). Directed cycle: white, grey, black. An edge to a grey node is a cycle."
      },
      {
        "number": "13",
        "title": "Graphs 2: topological sort, Dijkstra and union-find",
        "summary": "Three tools for three questions: in what order, at what cost, and in which group.",
        "contentSnippet": "Topological sort (Kahn): start with in-degree 0 nodes, remove them, and lower their neighbours' in-degrees. If the topological order has fewer than n nodes, the directed graph has a cycle. Dijkstra is BFS with a min-heap of (distance, node). Skip old heap entries. Dijkstra needs weights that are zero or positive. Time O(E log V). Union-find: find with path compression, union by rank, almost O(1) per call. union returning False means the two nodes were already connected: a cycle."
      },
      {
        "number": "14",
        "title": "Dynamic programming 1: the method and 1D problems",
        "summary": "Write down what a subproblem means, how it depends on smaller ones, and fill a table: DP is a method, not a trick.",
        "contentSnippet": "Five steps: state, choice, recurrence, base case, order (and where the answer is). The state is the set of arguments that change in the brute-force recursion. Climbing stairs: dp[i] = dp[i - 1] + dp[i - 2]. House robber: max(skip, rob + dp[i - 2]). Coin change: dp[a] = 1 + min(dp[a - c]), start with infinity, dp[0] = 0. LIS: dp[i] ends at index i. The answer is the largest cell. O(n log n) with tails. If only the last one or two cells are used, keep variables instead of a table."
      },
      {
        "number": "15",
        "title": "Dynamic programming 2: grids, strings and knapsack",
        "summary": "When two things change at once, the table gets two dimensions, and every cell is built from its neighbours.",
        "contentSnippet": "Two things change, so the state has two indexes: dp[r][c] or dp[i][j]. Grid: dp[r][c] comes from above and from the left. LCS: match gives diagonal + 1, no match gives max(above, left). Edit distance: match copies the diagonal, else 1 + min(above, left, diagonal). String tables have one extra row and column for the empty prefix. 1D knapsack: loop backwards for 0/1, forwards for unbounded."
      },
      {
        "number": "16",
        "title": "Bit manipulation and maths tricks",
        "summary": "A few facts about binary numbers and a few classic number tricks that turn some problems into one-liners.",
        "contentSnippet": "AND, OR, XOR and shifts work on single bits and cost O(1). XOR cancels pairs: x ^ x = 0 and x ^ 0 = x. n & (n - 1) removes the lowest 1 bit. A power of two has exactly one 1 bit. A bitmask from 0 to 2^n - 1 lists every subset of n items. Put brackets around bit operations when you compare the result. GCD with Euclid and fast power are both logarithmic. Take the modulo at every step."
      },
      {
        "number": "17",
        "title": "Master cheat sheet, practice list and study plan",
        "summary": "Every pattern on one page, the classic problems to practise for each, and a plan to get through them.",
        "contentSnippet": "Revise with the four tables: pattern, signal, core of the template, complexity. Know five skeletons by heart: window, binary search, backtracking, BFS and DP. Decide with questions: sorted? continuous? top k? all solutions or one value? connections? Guess the pattern before you code, and dry run before you submit. Solve a problem again after a few days. That is the proof that you learned it. Mix the patterns in the final week and practise speaking while you solve."
      }
    ]
  },
  {
    "id": "backend-microservices-playbook",
    "title": "Production Backend & Microservices Architecture",
    "category": "Full-Stack Web Dev",
    "pages": 123,
    "fileSize": "3.7 MB",
    "author": "Gautam Pandit",
    "badge": "Core Engineering",
    "badgeColor": "bg-indigo-600 text-white",
    "description": "Learn how real backend systems are split into services, how those services talk, and how they keep data correct when things fail. Every topic is explained in plain language with commented Node.js, TypeScript and SQL code, dry runs, common mistakes and interview questions with model answers. This handbook assumes you can already build a simple API, and the last chapter is a cheat sheet with a study plan.",
    "tags": [
      "Backend",
      "Microservices",
      "Kafka",
      "Redis",
      "PostgreSQL",
      "gRPC"
    ],
    "chapters": [
      {
        "number": "01",
        "title": "Monolith, modular monolith and microservices",
        "summary": "Three ways to organise a backend, what each one costs, and how to know when you should not split.",
        "contentSnippet": "A monolith is one deployable app. A modular monolith adds strict module boundaries inside it. Microservices are separately deployed apps with separate databases. A network call can be slow, can fail halfway, and cannot join a database transaction. Microservices fix team and scaling problems, not messy code. In a modular monolith, import only a module's public interface and never touch its tables. A distributed monolith (shared database, joint deployments) has the costs of both styles. Split one part at a time behind a router: the strangler fig approach."
      },
      {
        "number": "02",
        "title": "Service boundaries and domain-driven design",
        "summary": "How to decide what belongs in one service, using the language of the business instead of the tables of the database.",
        "contentSnippet": "Use the business's own words in code: that is ubiquitous language. A bounded context is an area where each word has one meaning. It is the best first guess for a service. An aggregate is a group that must stay consistent. One transaction changes one aggregate, through its root. Refer to other aggregates and other services by ID, and copy values on purpose when history must not change. Put an anti-corruption layer at the border of any model you do not control. Aim for high cohesion inside a service and low coupling between services. Avoid one service per table."
      },
      {
        "number": "03",
        "title": "REST API design for production",
        "summary": "The rules that make an HTTP API predictable: resources, status codes, pagination, versioning, idempotency and one error format.",
        "contentSnippet": "URLs are plural nouns. The method tells the action. GET, PUT and DELETE are idempotent, POST is not. 4xx means the client must change the request. 5xx means the server failed and a retry may help. Cursor pagination with a tie-breaker stays fast on deep pages. Always cap limit. Prefer adding fields over new versions. Removing or renaming a field is a breaking change. Return every error in one format, such as Problem Details (application/problem+json). An idempotency key plus a unique constraint, stored in the same transaction as the work, makes POST safe to retry."
      },
      {
        "number": "04",
        "title": "gRPC and Protocol Buffers",
        "summary": "A faster, strictly typed way for services to call each other, and how to choose between gRPC and REST.",
        "contentSnippet": "gRPC is RPC over HTTP/2 with protobuf messages. The .proto file is the contract and code is generated from it. Field numbers identify fields on the wire. Add new numbers freely. Never reuse or retype an old one, and reserve removed numbers. Four call kinds: unary, server streaming, client streaming, bidirectional streaming. Always set a deadline. It travels with the call so services down the chain can stop early. gRPC has its own status codes. UNAVAILABLE is safe to retry, DEADLINE_EXCEEDED only for idempotent calls. REST for public and browser clients, gRPC for internal calls, events when no answer is needed."
      },
      {
        "number": "05",
        "title": "API gateway, BFF and service discovery",
        "summary": "One front door for clients, a helper backend for each kind of app, and a way for services to find each other.",
        "contentSnippet": "An API gateway is the single front door: routing, TLS, token checks, rate limits, request IDs. Never put business rules in the gateway, and run more than one copy of it. Services still check permissions themselves. The gateway only knows who the caller is. A BFF is a backend for one kind of client. It joins service answers into one response for a screen. Use Promise.allSettled with timeouts so optional data can fail without breaking the page. Service discovery lets callers use a stable name. The registry tracks healthy instances behind it."
      },
      {
        "number": "06",
        "title": "Authentication and authorisation",
        "summary": "Who are you, what may you do, and how do many services agree on the answer.",
        "contentSnippet": "Authentication asks who you are. Authorisation asks what you may do. Check both in every service. A JWT is signed, not encrypted. Verify it with a library and pin the algorithm, issuer and audience. Use asymmetric signing (RS256 or ES256): only the auth service can create tokens, everyone can verify them. Short access token plus a server-stored refresh token. Rotate the refresh token on every use and revoke the family on reuse. OAuth 2.0 gives delegated access. OIDC adds login with an ID token. Use the authorisation code flow with PKCE. Between services, prove the caller's identity with mTLS or service tokens, and pass the user's identity along."
      },
      {
        "number": "07",
        "title": "PostgreSQL: transactions, isolation and locking",
        "summary": "How the database keeps money and stock correct when many requests run at the same moment.",
        "contentSnippet": "A transaction is all-or-nothing. ACID: atomicity, consistency, isolation, durability. PostgreSQL uses MVCC: readers and writers do not block each other. Only writers of the same row wait. Read Committed is the default. Repeatable Read gives one snapshot. Serializable prevents write skew but needs retries. Read-modify-write in application code causes lost updates. Use one atomic UPDATE, SELECT ... FOR UPDATE, or a version column. Lock rows in a fixed order to avoid deadlocks. Retry the whole transaction on 40001 and 40P01. Keep transactions short. No network calls while a transaction is open."
      },
      {
        "number": "08",
        "title": "PostgreSQL: indexes, EXPLAIN, pooling and migrations",
        "summary": "How to keep queries fast, connections under control, and schema changes safe while the app is running.",
        "contentSnippet": "A B-tree index finds rows without scanning the table. In a composite index, column order matters: equality columns first. Indexes slow down writes. Add them for measured queries, and check with EXPLAIN ANALYZE. In a plan, look for Seq Scan with many removed rows, wrong row estimates, and avoidable sorts. A pool lends out a few connections. Instances times pool size must stay below max_connections. Use CREATE INDEX CONCURRENTLY, NOT VALID constraints and lock_timeout on live tables. Old and new code run together during a deployment: change schemas with expand and contract."
      },
      {
        "number": "09",
        "title": "Redis: caching, locks and rate limiting",
        "summary": "Using a fast in-memory store to save work, and knowing exactly where its promises end.",
        "contentSnippet": "Cache-aside: read the cache, on a miss read the database and store the result with a TTL. On writes, delete the key after the commit. Always keep a TTL as a safety net against stale data. Add jitter to TTLs, cache \"not found\" briefly, and use single flight against stampedes. A cache failure must make the app slower, not broken. Never use cached data for exact decisions. SET key token NX PX ttl plus a compare-and-delete script gives a lock for efficiency, not for correctness. Rate limits across instances need shared, atomic counters: a token bucket in a Lua script."
      },
      {
        "number": "10",
        "title": "Kafka fundamentals",
        "summary": "A shared log that services write to and read from, so they can work together without calling each other.",
        "contentSnippet": "A topic is split into partitions. Each partition is an ordered, append-only log, and an offset is a position in it. The key decides the partition. Order is guaranteed only inside one partition, so key by the thing that must stay in order. In a consumer group, each partition is read by one consumer. Different groups each get every event. Process, then commit: at-least-once delivery. Duplicates are possible, so consumers must be idempotent. Use acks=all and a replication factor of 3 for business events. Watch consumer lag. Reading does not delete events. Retention or compaction does."
      },
      {
        "number": "11",
        "title": "Event-driven design: outbox, idempotent consumers and dead letters",
        "summary": "How to publish events without losing them, handle duplicates safely, and park messages that cannot be processed.",
        "contentSnippet": "An event is a past fact for many listeners. A command is a request to one receiver. Writing to the database and to Kafka separately is a dual write. A crash in between loses or invents events. Outbox: insert the event row in the same transaction as the data, and let a relay publish it later. The outbox gives at-least-once delivery. Duplicates are normal, not rare. Make consumers idempotent: record the event ID in the same transaction as the business change. After a few retries, park a failing message in a dead-letter topic, alert on it, and replay it after the fix."
      },
      {
        "number": "12",
        "title": "Database per service, consistency and sagas",
        "summary": "Why services must not share tables, and how to complete a business operation that spans several databases.",
        "contentSnippet": "Each service owns its data. A shared table is a hidden API and leads to a distributed monolith. Without joins, read across services by copying at write time, composing API calls, or keeping a local read copy from events. Two-phase commit blocks and reduces availability. Microservices accept eventual consistency instead. A saga is a chain of local transactions with compensating actions for failures. Choreography: services react to events. Orchestration: one coordinator keeps the state and sends commands. Put steps that are hard to undo last, make every step and compensation idempotent, and watch for stuck sagas."
      },
      {
        "number": "13",
        "title": "Resilience: timeouts, retries, circuit breakers and bulkheads",
        "summary": "How to stop one slow or broken service from pulling down everything that depends on it.",
        "contentSnippet": "A slow dependency is more dangerous than a dead one. Every network call needs a timeout. Timeouts shrink down the call chain. Pass a deadline where you can. Retry only safe, transient failures, with exponential backoff, jitter, few attempts and a time budget. Retries at several layers multiply. Retry at one layer only. A circuit breaker fails fast when a dependency stays down: closed, open, half-open. A bulkhead limits concurrent calls per dependency. A fallback returns less instead of an error."
      },
      {
        "number": "14",
        "title": "Observability: logs, metrics and traces",
        "summary": "How to see what your system is doing in production, and find the cause when something goes wrong.",
        "contentSnippet": "Logs record single events, metrics are numbers over time, traces follow one request across services. Write structured JSON logs with a correlation ID. AsyncLocalStorage carries the ID through async code. Never log secrets. Never use IDs or raw URLs as metric labels. Track rate, errors and duration for every service. Use percentiles such as p99, not the average. A trace is a tree of spans. Context travels in the traceparent header. OpenTelemetry is the vendor-neutral standard. Alert on what users feel, and link metrics, traces and logs through the trace ID."
      },
      {
        "number": "15",
        "title": "Testing and deployment",
        "summary": "How to gain confidence in a change before release, and how to release it without users noticing.",
        "contentSnippet": "Test pyramid: many unit tests, a good number of integration tests, few end-to-end tests. Test SQL, constraints and locks against a real database. Mock only what you do not own. Contract tests catch breaking API changes between services before the release. One image for all environments. Configuration and secrets come from outside and are checked at startup. Liveness means \"restart me\". Readiness means \"do not send me traffic\". Dependencies belong only in readiness. On SIGTERM: turn unready, finish running requests, close connections, exit. Release with rolling, blue-green or canary."
      },
      {
        "number": "16",
        "title": "Cheat sheet, interview questions and study plan",
        "summary": "The whole handbook on a few pages, the questions you should be able to answer, and a plan to learn by building.",
        "contentSnippet": "Start with a modular monolith. Split along bounded contexts, and only for a concrete reason. Inside one service, trust PostgreSQL: transactions, constraints, row locks and the right indexes. Between services there are no transactions: use the outbox, idempotent consumers and sagas. Every network call can be slow, fail, or happen twice. Use timeouts, careful retries, breakers and idempotency keys. You cannot fix what you cannot see: structured logs, RED metrics and traces linked by one ID. Ask at every step: what if this runs twice, and what if the process dies right here?"
      }
    ]
  }
];

/* ---- Precomputed lookups (built once at module load) ---- */
export const pdfById = new Map(pdfNotesList.map((p) => [p.id, p]));

/** id -> lowercase search fields */
export const pdfSearchIndex = new Map(
  pdfNotesList.map((p) => [
    p.id,
    [
      p.title.toLowerCase(),
      p.description.toLowerCase(),
      ...p.tags.map((t) => t.toLowerCase()),
      p.author.toLowerCase(),
    ],
  ])
);
