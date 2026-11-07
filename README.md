# helloS

helloS is a course discovery and learning platform focused on practical, career-oriented programs. The site brings together course tracks in full-stack development, AI and data science, UI/UX design, and cloud and DevOps.

The project is built with the Next.js App Router and presents course catalogs, track details, pricing, and supporting company content in one responsive web experience.

## Features

- Course catalog with categories, featured courses, and detailed career tracks
- Dedicated pages for the company, pricing, careers, and blog
- Privacy, refund, and terms pages
- Shared navigation, footer, and reusable page components
- Local course and landing-page content managed in JavaScript data files

## Tech Stack

- [Next.js 16](https://nextjs.org/) with the App Router
- [React 19](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/) for icons

## Getting Started

### Prerequisites

- Node.js 20.9 or newer
- npm

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app. The development server reloads as you edit files.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build locally |

## Pages

| Route | Page |
| --- | --- |
| `/` | Home |
| `/courses` | Course catalog |
| `/courses/[slug]` | Career track details |
| `/about` | About helloS |
| `/pricing` | Plans and pricing |
| `/career` | Careers |
| `/blog` | Blog |
| `/privacy` and `/privacy-policy` | Privacy policy |
| `/refunds` and `/refund-policy` | Refund policy |
| `/terms` and `/terms-and-conditions` | Terms and conditions |

## Project Structure

```text
app/          Routes, layouts, and global styles
components/   Shared UI and page-specific components
data/         Course tracks and landing-page content
public/       Static assets, including images and icons
```

## Quality Checks

Run linting and a production build before shipping changes:

```bash
npm run lint
npm run build
```

## Deployment

The app can be deployed to any platform that supports Next.js. For Vercel, connect the repository and use the default Next.js build settings. For other platforms, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Admin panel & roles

The frontend ships an admin area at `/admin` (dashboard, notes & PDFs, accounts). It talks to the `/api/admin/*` routes below.

| Role     | Can do                                                                 |
|----------|------------------------------------------------------------------------|
| `ADMIN`  | Everything: manage notes, upload files, change roles, remove accounts  |
| `EDITOR` | Manage notes, PDFs, code snippets and downloads                        |
| `VIEWER` | Student account created by sign-up; can read PDFs, like and rate       |

**Admin account.** `OWNER_EMAIL` / `OWNER_PASSWORD` / `OWNER_NAME` in `.env` define the owner. On every boot
`ensureOwner()` creates the account (or promotes an existing one to `ADMIN`). Outside production the password is
re-synced from `.env` (`OWNER_SYNC_PASSWORD=true`), so a changed env can never lock you out. `npm run seed` also
resets it.

### Admin API (`ADMIN` or `EDITOR` unless noted)

| Method | Path                                   | Body / query                                         | Notes |
|--------|----------------------------------------|------------------------------------------------------|-------|
| GET    | `/api/admin/dashboard`                 |                                                      | Counts, engagement totals, recent + top notes, storage |
| GET    | `/api/admin/notes`                     | `?q&status=all\|published\|draft\|trash&category&page&limit` | Paginated; `meta.categories` lists known categories |
| POST   | `/api/admin/notes`                     | note fields (see below)                              | Slug auto-generated from the title when omitted |
| GET    | `/api/admin/notes/:id`                 |                                                      | Includes `file` (main PDF) and attachment metadata |
| PATCH  | `/api/admin/notes/:id`                 | any note fields, `publish: true\|false`               | `publish` toggles visibility + `publishedAt` |
| PATCH  | `/api/admin/notes/order`               | `{ order: [{ id, order }] }`                         | Manual home-page ordering |
| DELETE | `/api/admin/notes/:id`                 |                                                      | Soft delete (trash) |
| POST   | `/api/admin/notes/:id/restore`         |                                                      | Restore from trash |
| POST   | `/api/admin/notes/:id/files?role=`     | multipart `file`; `role=primary\|attachment\|cover`  | `primary` = main PDF (page count auto-detected, old file replaced) |
| DELETE | `/api/admin/notes/:id/files/:uploadId` |                                                      | Detach + delete the file |
| POST   | `/api/admin/notes/:id/blocks`          | `{ type: "CODE", content: { language, code, filename? } }` | Code snippets shown on the reader page |
| PATCH  | `/api/admin/notes/:id/blocks/:blockId` | `{ content }`                                        | |
| DELETE | `/api/admin/notes/:id/blocks/:blockId` |                                                      | |
| GET    | `/api/admin/users`                     | `?q&role&page&limit`                                 | **ADMIN only** |
| PATCH  | `/api/admin/users/:id/role`            | `{ role }`                                           | **ADMIN only**; cannot change yourself or remove the last admin |
| DELETE | `/api/admin/users/:id`                 |                                                      | **ADMIN only**; same guards |

**Note fields** (all optional except `title`): `slug`, `description`, `category`, `tags[]`, `tagline`, `badge`, `level`,
`accent` (amber, emerald, indigo, purple, rose, sky, teal, orange), `icon` (Code, Layers, Server, Sparkles, Network, Cloud,
BookOpen, Database, Cpu, Smartphone, Shield, Terminal), `featured`, `order`, `price`, `pages`, `videoUrl`, `projectBadge`,
`projectTitle`, `projectUrl`, `demoUrl`, `projectId`, `instructor { name, role, company, avatar }`,
`chapters [{ number, title, summary, contentSnippet }]`, `visibility`.

### Reading files on the public site

| Method | Path                              | Notes |
|--------|-----------------------------------|-------|
| GET    | `/api/public/notes?featured=true` | Home-page cards, ordered by `order` |
| GET    | `/api/public/notes/:slug/file`    | Signed-in users only. Returns short-lived signed `viewUrl` / `downloadUrl` links for the PDF and attachments |
| GET    | `/api/uploads/:id/raw?exp&sig`    | Serves the bytes for a valid signature **or** a signed-in cookie. PDFs are served inline (embeddable from `CORS_ORIGINS`), `&dl=1` forces download |

Uploads are limited to documents, archives, images and source files (no executables or scripts).
