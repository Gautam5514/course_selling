# Backend Design — helloS LMS

> Production-grade backend design for the `course_selling` Next.js 16 / React 19 LMS.
> Scope: a single-admin ("this is for me") authoring backend where **you** can upload
> notes/files of any type, and create **Spaces** — rich workspaces where you add
> **code snippets** and **SQL queries** (optionally runnable), alongside the existing
> public catalog (PDF notes, projects, blogs, tracks, courses).

---

## 1. Goals & Non-Goals

### Primary goals
1. **Upload anything** — PDFs, images, archives, videos, datasets, source files — reliably and at scale, with direct-to-storage uploads (no proxying large files through the app server).
2. **Spaces** — create named workspaces that hold ordered **blocks**: rich text, **code snippets** (any language, syntax highlighted), and **SQL queries** (optionally executed against a sandboxed DB).
3. **Owner-first** — one trusted admin (you) authors everything; the public reads. Auth model is simple but real (not "no auth").
4. **Production-level** — migrations, validation, auth, rate limiting, observability, backups, safe execution sandbox for SQL/code.
5. **Fits the current stack** — Next.js 16 App Router Route Handlers + a managed Postgres, so you deploy one app (e.g. Vercel) plus managed infra.

### Non-goals (v1)
- Multi-tenant SaaS / per-customer workspaces (design leaves room, but v1 is single-owner).
- Full online payments backend (the frontend has pricing pages; checkout is out of scope here).
- Arbitrary untrusted user code execution at internet scale. Code/SQL execution is **owner-only** and sandboxed.

---

## 2. Current State (what exists today)

- **Framework:** Next.js `16.3.7`, React `19.2.8`, App Router (`app/`), Tailwind v4. JS (not TS) with `@/*` path alias.
- **Data:** entirely static ES modules in `data/`: `pdfNotesData.js`, `projectsData.js`, `blogsData.js`, `tracksData.js`, `landingData.js`. No DB, no API routes, no auth.
- **Rendering:** pages are Server Components that import static data and pass it to client components (e.g. `app/pdf-notes/page.js` → `components/pdf/PdfNotesPageContent`).

**Implication:** the backend is additive. We introduce a database + Route Handlers (`app/api/**`) and gradually move the `data/*.js` catalogs into the DB behind read APIs, while static files can remain as a seed source.

---

## 3. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Next.js 16 App (Vercel)                        │
│                                                                        │
│  Public pages (RSC)         Admin pages (RSC + client)                 │
│  /pdf-notes /projects ...   /admin/* (auth-gated)                      │
│         │                          │                                   │
│         ▼                          ▼                                   │
│  ┌───────────────────── app/api/** Route Handlers ─────────────────┐  │
│  │  /api/public/*  (read)   /api/admin/*  (write, auth required)    │  │
│  │  /api/uploads/*  (presign + finalize)                           │  │
│  │  /api/spaces/*   (spaces, blocks, run)                          │  │
│  └─────────────────────────────┬───────────────────────────────────┘  │
│                                 │ service layer (lib/server/**)         │
│      ┌──────────────┬──────────┼───────────────┬──────────────────┐   │
│      ▼              ▼          ▼                ▼                  ▼   │
│   Prisma        Zod schemas  Auth (JWT)    Rate limiter      Logger   │
└──────┬──────────────────────────┬────────────────────┬───────────────┘
       │                          │                     │
       ▼                          ▼                     ▼
  ┌──────────┐            ┌───────────────┐      ┌──────────────┐
  │ Postgres │            │ Object Store  │      │ SQL Sandbox  │
  │ (Neon/   │            │ (S3 / R2)     │      │ Postgres     │
  │  Supabase│            │  + CDN        │      │ (ephemeral,  │
  │  /RDS)   │            │               │      │  read-only)  │
  └──────────┘            └───────────────┘      └──────────────┘
```

### Layering (keep business logic out of route files)
- `app/api/**/route.js` — thin HTTP adapters: parse → authenticate → validate (Zod) → call service → shape response.
- `lib/server/services/*` — business logic (notes, uploads, spaces, execution).
- `lib/server/db.js` — Prisma client singleton.
- `lib/server/auth.js` — session/JWT verification, `requireAdmin()`.
- `lib/server/storage.js` — object-storage presign/finalize.
- `lib/server/validation/*` — Zod schemas shared by client and server.
- `lib/server/ratelimit.js`, `lib/server/logger.js`.

> **Note on Next.js 16:** APIs and conventions in this Next version can differ from older
> knowledge. Before implementing, read the guide shipped in
> `node_modules/next/dist/docs/` (Route Handlers, `cookies()`, caching). `node_modules`
> is currently not installed in this checkout, so treat route-handler signatures below as
> the intended contract and confirm the exact API against those docs at implementation time.

---

## 4. Technology Choices & Rationale

| Concern | Choice | Why |
|---|---|---|
| API runtime | Next.js Route Handlers (`app/api`) | One deployable; co-located with frontend; Server Actions optional for forms. |
| ORM / DB | **Prisma + PostgreSQL** | The project's own content already references Prisma/Postgres; strong typing, migrations, JSON columns for flexible block content. |
| DB host | Neon / Supabase / RDS | Serverless-friendly Postgres; pooled connections (PgBouncer) for Vercel. |
| Object storage | **S3 or Cloudflare R2** | Direct browser → storage uploads via presigned URLs; CDN for delivery; "upload anything" at any size. |
| Auth | JWT session cookie (admin) + optional email magic link | Single owner needs a real but lightweight login; httpOnly cookie, short-lived access + refresh. |
| Validation | **Zod** | Shared schemas, strict input parsing at the boundary. |
| Code highlighting | Shiki (render-time) | Server-side highlight; no runtime eval for display. |
| SQL execution | Ephemeral sandboxed Postgres (read-only role, statement timeout) | Lets Spaces run SQL safely. |
| Code execution (optional) | Isolated worker (Docker/Firecracker) or disabled | Running arbitrary code is high-risk; default v1 = **highlight only, no execution**; execution is an opt-in later phase. |
| Rate limiting | Upstash Redis (sliding window) | Protects upload presign + run endpoints. |
| Background jobs | Queue (QStash / SQS) for thumbnails, virus scan, PDF page count | Keep request path fast. |

> Decision to confirm with you: **PostgreSQL + Prisma + S3/R2** is the recommended baseline.
> If you'd rather stay fully on one vendor, Supabase gives Postgres + storage + auth in one.

---

## 5. Data Model (Prisma schema)

Design principles: normalized core tables; `jsonb` for flexible block payloads; soft-delete via `deletedAt`; `slug` for public URLs; every table has `createdAt`/`updatedAt`.

```prisma
// prisma/schema.prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

// ---------- Auth ----------
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(ADMIN)   // single-owner: you are ADMIN
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  spaces    Space[]
  notes     Note[]
  uploads   Upload[]
  sessions  Session[]
}

enum Role { ADMIN EDITOR VIEWER }

model Session {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  refreshHash  String                      // hashed refresh token
  userAgent    String?
  ip           String?
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  @@index([userId])
}

// ---------- Uploads (the "upload anything" primitive) ----------
model Upload {
  id          String   @id @default(cuid())
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id])
  key         String   @unique            // object-store key
  bucket      String
  fileName    String
  mimeType    String
  byteSize    BigInt
  checksum    String?                     // sha256 for integrity/dedup
  status      UploadStatus @default(PENDING)
  width       Int?                        // images
  height      Int?
  pageCount   Int?                        // pdfs
  metadata    Json?                       // arbitrary extracted metadata
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
  noteAssets  NoteAsset[]
  @@index([ownerId, createdAt])
  @@index([status])
}

enum UploadStatus { PENDING UPLOADED SCANNING READY FAILED QUARANTINED }

// ---------- Notes (uploadable study material) ----------
model Note {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  description String?
  category    String?
  tags        String[]
  visibility  Visibility @default(PRIVATE)
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  primaryFileId String?                   // the main PDF/file Upload
  likes       Int      @default(0)
  downloads   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  publishedAt DateTime?
  deletedAt   DateTime?
  assets      NoteAsset[]
  @@index([visibility, publishedAt])
  @@index([category])
}

enum Visibility { PRIVATE UNLISTED PUBLIC }

model NoteAsset {            // links a Note to one or more Uploads
  id        String  @id @default(cuid())
  noteId    String
  note      Note    @relation(fields: [noteId], references: [id], onDelete: Cascade)
  uploadId  String
  upload    Upload  @relation(fields: [uploadId], references: [id])
  role      String  @default("attachment") // "primary" | "attachment" | "cover"
  position  Int     @default(0)
  @@unique([noteId, uploadId])
}

// ---------- Spaces (code + SQL workspaces) ----------
model Space {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  description String?
  visibility  Visibility @default(PRIVATE)
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
  blocks      Block[]
  @@index([visibility, updatedAt])
}

model Block {
  id        String    @id @default(cuid())
  spaceId   String
  space     Space     @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  type      BlockType
  position  Int                              // ordering within a space
  // Flexible payload keyed by type:
  //  RICH_TEXT : { html | markdown }
  //  CODE      : { language, code, filename? }
  //  SQL       : { dialect, sql, connectionRef? }
  //  FILE      : { uploadId }
  content   Json
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  runs      BlockRun[]
  @@unique([spaceId, position])
  @@index([spaceId])
}

enum BlockType { RICH_TEXT CODE SQL FILE EMBED }

model BlockRun {             // execution history for SQL/code blocks
  id         String   @id @default(cuid())
  blockId    String
  block      Block    @relation(fields: [blockId], references: [id], onDelete: Cascade)
  status     RunStatus @default(QUEUED)
  startedAt  DateTime?
  finishedAt DateTime?
  durationMs Int?
  rowCount   Int?
  result     Json?                 // truncated result set / columns
  error      String?
  createdAt  DateTime @default(now())
  @@index([blockId, createdAt])
}

enum RunStatus { QUEUED RUNNING SUCCESS ERROR TIMEOUT CANCELLED }
```

**Why `Json content` on Block:** code snippets and SQL have different shapes and will
evolve (add `theme`, `highlightLines`, `params`). A typed `jsonb` payload validated by
Zod per `type` keeps the schema stable while staying flexible — exactly the "feasible to
add anything" requirement, without schema churn.

---

## 6. API Surface (Route Handlers)

All under `app/api`. Conventions: JSON bodies, Zod-validated, consistent error envelope
`{ error: { code, message, details? } }`; success `{ data, meta? }`. Admin routes require
a valid session cookie resolving to role `ADMIN`/`EDITOR`.

### Auth
```
POST   /api/auth/login          # email+password or magic-link request
POST   /api/auth/callback       # magic-link / verify → set httpOnly cookie
POST   /api/auth/refresh        # rotate access token
POST   /api/auth/logout
GET    /api/auth/me
```

### Uploads (direct-to-storage, 3-step)
```
POST   /api/uploads/presign     # body: {fileName, mimeType, byteSize}
                                #  → creates Upload(PENDING), returns {uploadId, url, fields}
PUT    (client → S3/R2 directly using presigned url)       # app never proxies the bytes
POST   /api/uploads/:id/finalize# verify object exists, checksum, set UPLOADED→(scan)→READY
GET    /api/uploads/:id         # metadata + signed download url
DELETE /api/uploads/:id         # soft delete + schedule storage cleanup
```
Multipart/large files: `presign` returns multipart upload parts when `byteSize` exceeds a
threshold (e.g. 100 MB), finalize assembles parts. This is how "upload anything, any size"
stays reliable without memory pressure on the server.

### Notes
```
GET    /api/public/notes            # list PUBLIC/published, filter by category/tag, paginated
GET    /api/public/notes/:slug      # single public note + signed asset urls
POST   /api/admin/notes             # create (draft)
PATCH  /api/admin/notes/:id         # update / attach uploads / publish
DELETE /api/admin/notes/:id
POST   /api/admin/notes/:id/assets  # link uploadId(s)
```

### Spaces & Blocks
```
GET    /api/public/spaces/:slug           # public space render payload
GET    /api/admin/spaces                  # list my spaces
POST   /api/admin/spaces                  # create space
PATCH  /api/admin/spaces/:id              # rename / visibility
DELETE /api/admin/spaces/:id
POST   /api/admin/spaces/:id/blocks       # add block {type, content, position}
PATCH  /api/admin/blocks/:id              # edit block content
PATCH  /api/admin/spaces/:id/reorder      # body: [{blockId, position}, ...]
DELETE /api/admin/blocks/:id
POST   /api/admin/blocks/:id/run          # execute a SQL (or code) block → BlockRun
GET    /api/admin/blocks/:id/runs         # run history
```

### Pagination & filtering
Cursor pagination (`?cursor=&limit=`) for lists; `?category=&tag=&q=` filters. Return
`meta.nextCursor`.

---

## 7. Upload Pipeline (detail)

1. **Presign** — client sends file metadata. Server validates mime/extension allowlist
   *or* "anything" mode (owner-only) with a hard size cap, creates `Upload(PENDING)`,
   returns a short-lived presigned POST/PUT (or multipart init).
2. **Direct upload** — browser uploads straight to S3/R2. Progress shown client-side.
3. **Finalize** — server confirms the object exists (HeadObject), records `byteSize`,
   computes/validates `checksum`, flips to `UPLOADED`.
4. **Async processing** (queue): antivirus scan (ClamAV/lambda), PDF page count, image
   dimensions + thumbnail, metadata extraction → status `READY` (or `QUARANTINED`).
5. **Delivery** — public reads get **signed, time-limited** URLs (or public-CDN URLs for
   `PUBLIC` notes). Downloads increment a counter asynchronously.

**Safety:** extension/mime allowlist by default; owner "upload anything" mode still
enforces (a) size cap, (b) AV scan before `READY`, (c) files served with
`Content-Disposition: attachment` and never executed. Store under keys namespaced by
owner + random id to prevent guessing/collisions.

---

## 8. Spaces: code snippets & SQL queries

### Code blocks (display)
- Stored as `{ language, code, filename? }`. Rendered with **Shiki** server-side →
  highlighted HTML. **No evaluation** for display — zero code-execution risk for viewing.
- Copy-to-clipboard, line highlighting, multiple files per space via multiple CODE blocks.

### SQL blocks (optionally runnable)
- Stored as `{ dialect: "postgres", sql, connectionRef? }`.
- **Run path** (`POST /api/admin/blocks/:id/run`) is **owner-only** and sandboxed:
  - Execute against a **dedicated, disposable Postgres** (separate from app DB), using a
    **read-only role** by default. A "scratch" schema can allow writes if you opt in per
    space.
  - `statement_timeout` (e.g. 5s) + `LIMIT` injection / row cap (e.g. 1000 rows returned).
  - Reject multiple statements unless explicitly allowed; block `COPY`, `pg_read_file`,
    superuser functions via role privileges (not string parsing alone).
  - Run in a queue/worker with wall-clock timeout; persist a truncated result to
    `BlockRun.result` (columns + capped rows) and `rowCount`.
  - Per-owner rate limit on runs.
- Result rendered as a table in the Space UI; history available via `runs`.

### Code execution (future / opt-in)
Running arbitrary program code is deferred. When needed, isolate in ephemeral containers
(Firecracker/gVisor), no network, CPU/memory/time limits, dropped capabilities, read-only
FS except a temp dir. Default v1 keeps code blocks **display-only**.

---

## 9. AuthN / AuthZ

- **Single owner:** you log in (password hashed with argon2id, or magic-link email).
  Access token = short-lived JWT in httpOnly, Secure, SameSite=Lax cookie; refresh token
  rotated and stored hashed in `Session`.
- `requireAdmin()` guard wraps all `/api/admin/*` and `/blocks/:id/run`.
- Public read endpoints need no auth but only expose `PUBLIC`/published rows.
- CSRF: because mutations use cookies, require a CSRF token (double-submit) or restrict to
  same-site + `Origin` check on state-changing requests.
- Secrets (`DATABASE_URL`, storage keys, JWT secret, sandbox DB URL) in env/secret manager;
  never in the repo. Add them to `.gitignore`'d `.env.local`.

---

## 10. Validation, Errors, Observability

- **Zod** schemas at every boundary; reject unknown fields (`.strict()`).
- Uniform error envelope + stable `code`s (`AUTH_REQUIRED`, `VALIDATION`, `NOT_FOUND`,
  `RATE_LIMITED`, `RUN_TIMEOUT`, `UPLOAD_TOO_LARGE`).
- **Logging:** structured JSON logs (pino) with request id; no secrets/PII in logs.
- **Metrics/tracing:** OpenTelemetry → your APM; track upload success rate, run latency,
  error rates.
- **Rate limiting:** Upstash sliding window on `presign`, `run`, `auth/login`.

---

## 11. Migrations, Seeding, Backups

- **Prisma Migrate** for schema; migrations committed and run in CI/CD.
- **Seed script** imports the existing `data/*.js` catalogs (pdfNotes, projects, blogs,
  tracks) into the DB so the public site keeps working during cutover.
- **Backups:** managed Postgres PITR; object storage versioning + lifecycle rules.
- **Env matrix:** `development` (local Postgres + MinIO), `preview`, `production`.

---

## 12. Security Checklist

- [ ] httpOnly/Secure/SameSite cookies; argon2id passwords; rotated refresh tokens.
- [ ] Presigned uploads only; size cap; AV scan before `READY`; `Content-Disposition: attachment`.
- [ ] SQL sandbox: separate DB, read-only role, statement timeout, row cap, run rate limit.
- [ ] No arbitrary code execution in v1.
- [ ] Parameterized queries everywhere (Prisma); no string-built SQL for app data.
- [ ] CSRF protection + `Origin` checks on mutations.
- [ ] Secrets in env/secret manager; signed, expiring download URLs for private assets.
- [ ] Input validation with Zod `.strict()`; output DTOs (never leak internal fields).

---

## 13. Rollout Plan (phased)

**Phase 0 — Foundations:** add Prisma + Postgres, `lib/server/*`, auth (owner login),
error envelope, logging. Seed from `data/*.js`.

**Phase 1 — Uploads:** object storage + presign/finalize + async processing.
Admin UI to upload files.

**Phase 2 — Notes:** Note CRUD + asset linking + publish; migrate `pdf-notes` page to read
from `/api/public/notes` (keep static fallback).

**Phase 3 — Spaces:** Space/Block CRUD, reorder, Shiki code rendering, SQL block storage.

**Phase 4 — SQL runner:** sandboxed Postgres, `run` endpoint, result table + run history,
rate limits.

**Phase 5 — Hardening:** metrics/tracing, backups verified, load test uploads & runs,
security review against §12.

---

## 14. Directory Layout (proposed)

```
course_selling/
  prisma/
    schema.prisma
    migrations/
    seed.js
  lib/server/
    db.js            # Prisma singleton
    auth.js          # requireAdmin(), session verify
    storage.js       # presign/finalize (S3/R2)
    ratelimit.js
    logger.js
    validation/
      note.js  space.js  block.js  upload.js   # Zod schemas
    services/
      notes.js  uploads.js  spaces.js  blocks.js  runner.js
  app/api/
    auth/{login,callback,refresh,logout,me}/route.js
    uploads/{presign,[id]/finalize,[id]}/route.js
    public/notes/{route.js,[slug]/route.js}
    public/spaces/[slug]/route.js
    admin/notes/{route.js,[id]/route.js,[id]/assets/route.js}
    admin/spaces/{route.js,[id]/route.js,[id]/blocks/route.js,[id]/reorder/route.js}
    admin/blocks/[id]/{route.js,run/route.js,runs/route.js}
  app/admin/            # authoring UI (gated)
    notes/  spaces/  uploads/
```

---

## 15. Open Decisions (need your input)

1. **DB + storage vendor:** Neon + Cloudflare R2 (recommended) vs all-in-one Supabase?
2. **SQL runner in v1?** Include sandboxed execution now, or ship Spaces display-only first
   and add the runner in Phase 4?
3. **"Upload anything" caps:** acceptable max file size (e.g. 2 GB?) and whether to keep a
   mime allowlist or truly allow any type (owner-only).
4. **Auth method:** password login vs email magic-link (or both).
5. **TypeScript:** adopt TS for `lib/server/**` (strongly recommended for a real backend) or
   stay JS to match the current frontend.

Once you confirm these, I can scaffold Phase 0 (Prisma schema + auth + one working
upload + one Space) as the first implementation step.
```
