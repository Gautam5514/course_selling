# Filestore — Frontend (Novri)

This is the **website** — the part users actually see and click around in.
It's called **Novri**. It talks to the [backend API](../backend/README.md)
to log people in, upload files, list files, and share them.

If the backend is the vault + guard, this is the reception desk and the
rooms the user actually walks through.

---

## 1. Tech stack (what this is built with)

| Piece | Tool | Why |
| --- | --- | --- |
| Framework | [Next.js 16](https://nextjs.org/) (App Router) | Renders pages, handles routing |
| UI library | React 19 | Builds the interface out of components |
| Styling | Tailwind CSS 4 | Utility classes for styling |
| Icons | lucide-react | Icon set used across the app |
| Login (Google & Phone) | Firebase Auth | Handles Google sign-in and OTP-based phone login |
| PDF tools | pdf-lib, pdfjs-dist | Merge/split/rotate/watermark PDFs, all in the browser |
| Language | JavaScript (with some TypeScript files) | — |

---

## 2. Folder structure (where to find things)

```
app/                    → every page of the site lives here (Next.js App Router)
  page.js               → the homepage (landing page)
  login/, signup/       → auth pages
  forgot-password/,
  reset-password/       → password reset flow
  s/[token]/             → the public "someone shared a file with you" page
  dashboard/             → everything after logging in
    page.jsx             → your files list
    tools/                → PDF tools
    trash/                → deleted files (recoverable)
    profile/, settings/   → account pages

components/
  auth/       → login/signup forms, Google button, OTP phone login
  dashboard/  → file table, upload zone, sidebar, preview modal
  landing/    → sections that make up the homepage
  layout/     → navbar, footer, logo
  tools/      → the PDF tools workspace
  ui/         → small reusable pieces (Button, Badge, Modal)

lib/
  api.js        → helper for calling the backend from the browser
  serverApi.js  → helper for calling the backend from server components
  firebase.js   → Google/Phone login setup
  AuthContext.jsx  → keeps track of "who's logged in" across the app
  ToastContext.jsx → pop-up notifications (e.g. "File uploaded")
  format.js     → formatting helpers (file sizes, dates, etc.)

proxy.js   → checks you're logged in before letting you into /dashboard/*
```

**Rule of thumb:** if you're looking for a page, check `app/`. If you're
looking for a reusable piece of UI, check `components/`. If you're looking
for "how does this talk to the backend," check `lib/`.

---

## 3. How this app talks to the backend

The browser never calls the backend directly by its full URL. Instead:

1. The browser calls a relative path like `/api/files`.
2. Next.js rewrites that request to the real backend URL (set in
   `BACKEND_ORIGIN`) — see [`proxy.js`](proxy.js) and `next.config.mjs`.
3. This keeps cookies working correctly and avoids exposing the backend's
   real address to the browser.

`proxy.js` also does a quick check: if you try to open `/dashboard/...`
without a session cookie, you're redirected to `/login`. This is just a fast
first check — the backend still double-checks on every actual request, since
a cookie *looking* valid doesn't mean it *is* valid.

---

## 4. Step-by-step: run this on your computer

**Step 1 — Make sure the backend is running first**
This app needs the [backend](../backend/README.md) running (usually at
`http://localhost:4000`), since almost everything here depends on it.

**Step 2 — Install Node.js**
```bash
node -v
```

**Step 3 — Install the packages**
```bash
cd frontend
npm install
```

**Step 4 — Create your environment file**
```bash
cp .env.example .env.local
```
Open `.env.local` and fill in:
- `BACKEND_ORIGIN` — where your backend is running, e.g. `http://localhost:4000`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

(The Firebase values come from your Firebase project settings — only needed
if you want Google/Phone login to work. Email/password login works without
them.)

**Step 5 — Start the app**
```bash
npm run dev
```

**Step 6 — Open it in your browser**
Go to [http://localhost:3000](http://localhost:3000).

---

## 5. Useful scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the app for local development (auto-reloads on save) |
| `npm run build` | Build the production-ready version |
| `npm start` | Run the production build (run `build` first) |
| `npm run lint` | Check code for style/errors with ESLint |
| `npm run format` | Auto-format code with Prettier |

---

## 6. What a user can actually do (features)

**Before logging in**
- View the landing page
- Sign up / log in with email + password, Google, or phone number (OTP)
- Reset a forgotten password via email link

**After logging in (Dashboard)**
- Upload files (drag-and-drop or click to browse)
- See all files in a searchable, sortable, filterable table
- Rename a file
- Mark a file **Public** (get a shareable link) or **Private**
- Preview a file, or download it
- Delete a file — it goes to **Trash** first, not gone forever
- Restore a file from Trash, or empty the Trash
- Use **PDF Tools**: merge PDFs together, extract specific pages, rotate
  pages, or stamp a watermark on every page — all done in the browser
- View/update profile and account settings

**Public share page (`/s/[token]`)**
- Anyone with the link can view/download the shared file — no login needed —
  as long as the owner hasn't turned sharing off.

---

## 7. Notes for anyone editing this project

- This project uses **Next.js 16**, which has some differences from older
  Next.js versions you may be used to. If something behaves unexpectedly,
  check the docs bundled inside `node_modules/next/dist/docs/` before
  assuming it's a bug.
- Run `npm run lint` and `npm run format` before committing changes to keep
  code style consistent.
