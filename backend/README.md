# Course Backend — Node.js + Express + MongoDB

Independent, deployable backend for the `course_selling` LMS. Runs **separately** from the
Next.js frontend. Provides auth, file uploads, notes, and spaces/blocks (code + SQL
snippets, display-only).

## Stack

- **Runtime:** Node.js (ESM, `>=18.18`)
- **Framework:** Express 4
- **Database:** MongoDB via Mongoose 8
- **Auth:** JWT in an httpOnly cookie, passwords hashed with bcrypt
- **Validation:** Zod (`.strict()` at the boundary)
- **Security:** helmet, CORS allowlist, express-rate-limit
- **Logging:** pino / pino-http (structured JSON)
- **Uploads:** multer to local disk (S3/R2 can be layered later)

## Architecture

```
src/
  config/        env config + pino logger
  db/            mongoose connection
  models/        User, Upload, Note, Space, Block (Mongoose schemas)
  auth/          jwt helpers + authenticate/requireAdmin middleware
  middleware/    zod validate() + central error handler
  validation/    Zod schemas (shared request contracts)
  controllers/   business logic (auth, upload, note, space, block)
  routes/        thin HTTP adapters, mounted under /api
  scripts/       seed.js (owner + sample note/space)
  app.js         Express app factory
  server.js      entry (connect DB → listen → graceful shutdown)
```

Response envelopes are uniform:
- Success: `{ "data": ..., "meta"?: ... }`
- Error: `{ "error": { "code", "message", "details"? } }`

## Setup

```bash
cd backend
cp .env.example .env          # then edit secrets
npm install
npm run seed                  # creates the owner + sample data (needs MongoDB running)
npm run dev                   # http://localhost:5001
```

Requires a running MongoDB — local (`mongodb://127.0.0.1:27017/course_lms`) or a MongoDB
Atlas connection string in `MONGODB_URI`.

## API

### Auth
```
POST   /api/auth/login        { email, password } → sets cookie, returns { user, token }
POST   /api/auth/logout
GET    /api/auth/me
```

### Uploads (admin writes; public download)
```
POST   /api/uploads           multipart form-data, field "file"  (admin)
GET    /api/uploads           list own uploads                   (admin)
GET    /api/uploads/:id       metadata + downloadUrl
GET    /api/uploads/:id/raw   streams the file (Content-Disposition: attachment)
DELETE /api/uploads/:id       soft delete                        (admin)
```

### Notes
```
GET    /api/public/notes            list published PUBLIC notes (cursor paginated)
GET    /api/public/notes/:slug      single public note
GET    /api/admin/notes             list all (admin)
POST   /api/admin/notes             create (admin)
PATCH  /api/admin/notes/:id         update / publish (admin)
POST   /api/admin/notes/:id/assets  attach uploads (admin)
DELETE /api/admin/notes/:id         soft delete (admin)
```

### Spaces & Blocks
```
GET    /api/public/spaces/:slug          public space + blocks
GET    /api/admin/spaces                 list own spaces (admin)
POST   /api/admin/spaces                 create (admin)
GET    /api/admin/spaces/:id             space + blocks (admin)
PATCH  /api/admin/spaces/:id             update (admin)
DELETE /api/admin/spaces/:id             soft delete (admin)
POST   /api/admin/spaces/:id/blocks      add block (admin)
PATCH  /api/admin/spaces/:id/reorder     reorder blocks (admin)
PATCH  /api/admin/blocks/:id             edit block content (admin)
DELETE /api/admin/blocks/:id             delete block (admin)
```

Block `content` is validated per `type`:
- `RICH_TEXT` → `{ html? , markdown? }`
- `CODE` → `{ language, code, filename? }`
- `SQL` → `{ dialect, sql }`  (stored only; no execution in v1)
- `FILE` → `{ uploadId }`
- `EMBED` → `{ url, provider? }`

## Deploy

**Docker (any host):**
```bash
docker build -t course-backend .
docker run -p 5001:5001 --env-file .env course-backend
```

**Render / Railway / Fly:** point the service at this folder, set the env vars from
`.env.example`, build command `npm install`, start command `npm start`. Use MongoDB Atlas
for `MONGODB_URI`. Set `COOKIE_SECURE=true` and a strong `JWT_SECRET` in production, and
add your frontend URL to `CORS_ORIGINS`.

> Note: local-disk uploads are ephemeral on platforms with non-persistent filesystems.
> For production durability, mount a persistent volume or switch `uploadController` to S3/R2.


## Engagement API (likes, ratings, downloads)

Public notes carry real counters. Everyone can read them; **liking, rating and
downloading need a signed-in account** (`401 AUTH_REQUIRED` otherwise), and the
identity is the account (`user:<id>`), so one like and one rating per person per
note, on every device. Writes are compare-and-set so concurrent requests never
double count. (Anonymous browsers may still send `X-Visitor-Id`; it is only used
to key the rate limiter.)

| Method | Path                                   | Body / Query              | Notes                                   |
| ------ | -------------------------------------- | ------------------------- | --------------------------------------- |
| GET    | `/api/public/notes/stats?slugs=a,b,c`  | 1-50 slugs                | Counters + the signed-in user's `liked`/`myRating` |
| POST   | `/api/public/notes/:slug/like`         | `{ liked?: boolean }`     | Toggle (or set) my like (sign-in)       |
| POST   | `/api/public/notes/:slug/rate`         | `{ value: 1..5, review? }` | Set / change my rating + written review (sign-in) |
| GET    | `/api/public/notes/:slug/reviews`      | `limit` (≤50)             | Written reviews for one note, newest first (public) |
| GET    | `/api/public/notes/reviews`            | `limit` (≤50)             | Latest written reviews across notes (home testimonials) |
| POST   | `/api/public/notes/:slug/download`     | —                         | Counts once per user per day (sign-in)  |

Every write returns the fresh stats object:

```json
{ "slug": "dsa-notes", "likes": 12, "downloads": 3, "pages": 140,
  "rating": 4.75, "ratingCount": 4, "liked": true, "myRating": 5 }
```

Writes are rate limited (120 / 15 min per visitor). `npm run recount` rebuilds the
counters on every note from the interaction rows if they ever drift.

## Student accounts

`POST /api/auth/register` `{ name, email, password }` creates a `VIEWER` account
and signs it in (httpOnly cookie). Admin accounts are only created by `npm run seed`.

## File storage (Cloudinary or local disk)

Set the three Cloudinary variables in `.env` and every PDF, attachment and cover image is stored on Cloudinary;
leave them blank and files stay on local disk under `UPLOAD_DIR`. `GET /api/health` reports which one is active
(`"storage": "cloudinary" | "local"`).

```
CLOUDINARY_CLOUD_NAME=…
CLOUDINARY_API_KEY=…
CLOUDINARY_API_SECRET=…
CLOUDINARY_FOLDER=hellos        # media-library prefix, default "hellos"
```

How it works:

- Uploads land in a temp file (multer), the checksum and PDF page count are computed, then the bytes are pushed
  with a chunked upload (`upload_large`) as **private** assets under `<folder>/uploads/`. The temp file is removed.
- Private assets have no public URL. `/api/uploads/:id/raw` fetches them through Cloudinary's signed download
  API (10-minute links generated server-side) and streams the bytes to the client, forwarding `Range` requests, so
  the site's own access rules (signed link or signed-in cookie) always apply. This also works on accounts where
  Cloudinary's "PDF and ZIP delivery" security setting is off (the default for new accounts).
- Removing a file from a note (or deleting an upload) destroys the Cloudinary asset.
- Plan limits surface as friendly messages, e.g. "larger than your storage plan allows (max 10 MB)".

## Today Code (problem of the day)

The navbar's **Today Code** button opens the solution the admin posted for
today (`/today-code`). One entry per calendar date (`YYYY-MM-DD`, keyed in
`APP_TIMEZONE`, default `Asia/Kolkata`). Each entry has a title, platform,
difficulty, topics, a problem summary, the approach, one or more solutions
(language + code, shown with line numbers and a Copy button) and time/space
complexity. Future-dated entries stay hidden until their day.

| Method | Path                                  | Who      | Notes                                                     |
| ------ | ------------------------------------- | -------- | --------------------------------------------------------- |
| GET    | `/api/public/daily-code`              | anyone   | Archive: dates, titles, difficulty, languages (no code)    |
| GET    | `/api/public/daily-code/today`        | member   | Latest live entry on or before today; `meta.isToday`, `prev`, `next` |
| GET    | `/api/public/daily-code/:date`        | member   | One day; 404 for future / unposted days                    |
| GET    | `/api/admin/daily-code`               | staff    | `q`, `status=all|published|draft`, `page`, `limit`; `meta.todayStatus` |
| POST   | `/api/admin/daily-code`               | staff    | Create; `publish: true` needs ≥1 solution; duplicate date → 409 |
| GET    | `/api/admin/daily-code/:id`           | staff    |                                                           |
| PATCH  | `/api/admin/daily-code/:id`           | staff    | Partial update + `publish` flag (untouched fields are kept) |
| DELETE | `/api/admin/daily-code/:id`           | staff    | Permanent                                                 |

## Access policy (who sees what)

Enforced by the API, not only by the UI.

| Visitor (no account)                                                                 | Member (free account)                                        | Staff (`ADMIN` / `EDITOR`) |
|--------------------------------------------------------------------------------------|--------------------------------------------------------------|----------------------------|
| Home cards, likes / rating counts, note overview (title, category, description, instructor, tags, chapter **titles**, how many snippets / files exist), Today Code archive titles | Everything a visitor sees, plus the PDF (inline + download), chapter summaries and key concepts, code snippets, attachments and project links, and the **Today Code** solution | Everything, plus `/admin` |
| Only **sees** likes / stars (read-only)                                               | Can **like**, **rate** and download; identity is the account (`user:<id>`), so it follows them across devices | |

- `GET /api/public/notes/:slug` returns `access: { member, locked }`; for visitors `chapters` carry only `number` + `title`, `blocks` / `assets` are empty and `file` is `null`, with `chapterCount`, `codeCount`, `attachmentCount`, `hasFile` so the UI can show what is waiting behind sign-in.
- Ratings are collected through the review form on the reader page (stars + optional text, ≤1000 chars). The form opens from the "Review" button and once automatically after ~3 minutes of visible reading by a member who has not rated yet (remembered per browser in `localStorage`). Written reviews are public: on the note's About view and in the home page testimonials (`GET /api/public/notes/reviews`).
- `POST /:slug/like`, `POST /:slug/rate`, `POST /:slug/download`, `GET /:slug/file` and `/api/uploads/:id/raw` (without a signed link) answer `401 AUTH_REQUIRED` for visitors.
- The reader page (`/pdf/<slug>`) is public: visitors get the overview and a sign-in panel on locked views, and return to the same page after signing in.
